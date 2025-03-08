import React, { useRef, forwardRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGradient } from "../context/GradientContext";
import { DoubleSide } from "three";
import { vertexShader, fragmentShader } from '../shaders';
import { isLowEndDevice, PerformanceMonitor } from '../utils/performanceUtils';

// Use the performance monitor as a React hook with better initial values
function usePerformanceMonitor() {
  const [performanceFactor, setPerformanceFactor] = useState(0);
  const monitorRef = useRef(null);
  
  useEffect(() => {
    // Initialize with more balanced settings
    monitorRef.current = new PerformanceMonitor(45, 1500);
    
    // Check if device is low-end at startup
    const lowEndDevice = isLowEndDevice();
    if (lowEndDevice) {
      setPerformanceFactor(0.5); // Less aggressive quality reduction
    }
    
    return () => {
      monitorRef.current = null;
    };
  }, []);

  const trackFrame = (deltaTime) => {
    if (monitorRef.current) {
      const quality = monitorRef.current.recordFrame();
      // Only update state if quality changed significantly to avoid re-renders
      if (Math.abs(quality - performanceFactor) > 0.1) {
        setPerformanceFactor(quality);
      }
      return quality;
    }
    return performanceFactor;
  };

  return { performanceFactor, trackFrame };
}

function SwirlPlane(props) {
  const materialRef = useRef();
  const { lowEndMode } = useGradient();
  const lastFrame = useRef(0);
  const lastTimeRef = useRef(0);
  
  const { performanceFactor, trackFrame } = usePerformanceMonitor();
  
  // Add previous frame data for temporal smoothing
  const prevFrameData = useRef({
    time: 0,
    colorIndex: props.colorIndex,
    intensity: props.intensity,
    complexity: props.complexity
  });
  
  // Adaptive geometry detail based on performance and animation
  const gridDetail = useRef(lowEndMode ? 24 : 48);
  const frameCount = useRef(0);
  
  // Add temporal smoothing factor - slower when performance is lower
  const smoothingFactor = useRef(performanceFactor > 0.8 ? 0.3 : 0.6);

  const uniformsRef = useRef({
    uTime: { value: 0 },
    uTimeX: { value: 0 },
    uTimeY: { value: 0 },
    uIntensity: { value: props.intensity },
    uComplexity: { value: props.complexity },
    uScale: { value: props.scale },
    uRotation: { value: props.rotation },
    uDistortion: { value: props.distortion },
    uColorIndex: { value: props.colorIndex },
    uColorVariety: { value: props.colorVariety || 1.0 }, // Add color variety parameter
    uAnimate: { value: Boolean(props.animate) }, // Ensure boolean conversion
    uBlur: { value: props.blur || 0 },
    uBrightness: { value: props.brightness / 100 }, // Normalize to 0–1
    uLowEndMode: { value: lowEndMode },
    uMouse: { value: [0.5, 0.5] },
    uPerformanceFactor: { value: performanceFactor },
    // Add temporal smoothing uniforms
    uPrevTime: { value: 0 },
    uSmoothingFactor: { value: smoothingFactor.current },
    uFrameCount: { value: 0 }
  });

  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Track performance with our utility
    const currentPerformanceFactor = trackFrame(deltaTime);
    
    // Update smoothing factor based on performance
    smoothingFactor.current = currentPerformanceFactor > 0.7 ? 0.3 : 
                             (currentPerformanceFactor > 0.4 ? 0.5 : 0.7);
    
    // Adaptive frame rate - skip frames based on performance
    const targetFPS = lowEndMode ? 24 : 
                     (currentPerformanceFactor > 0.7 ? 60 : 
                     currentPerformanceFactor > 0.4 ? 45 : 30);
                     
    if (currentTime - lastFrame.current < 1 / targetFPS) return;
    lastFrame.current = currentTime;
    
    // Every 100 frames, adaptively adjust geometry detail
    frameCount.current++;
    if (frameCount.current % 100 === 0) {
      const newDetail = lowEndMode ? 24 : 
                      (currentPerformanceFactor > 0.7 ? 48 : 
                      currentPerformanceFactor > 0.5 ? 36 : 28);
      
      gridDetail.current = newDetail;
    }

    if (materialRef.current) {
      // Store previous values for temporal smoothing
      const prevTime = uniformsRef.current.uTime.value;
      
      // Update time uniforms
      uniformsRef.current.uPrevTime.value = prevTime;
      uniformsRef.current.uTime.value = currentTime;
      uniformsRef.current.uTimeX.value = currentTime * 0.8 * (props.animate ? 1.0 : 0.0);
      uniformsRef.current.uTimeY.value = currentTime * 0.6 * (props.animate ? 1.0 : 0.0);
      
      // Update smoothing factor
      uniformsRef.current.uSmoothingFactor.value = smoothingFactor.current;
      uniformsRef.current.uFrameCount.value = frameCount.current;
      
      // Explicitly update animation state
      uniformsRef.current.uAnimate.value = Boolean(props.animate);
      
      // Update performance factor
      uniformsRef.current.uPerformanceFactor.value = currentPerformanceFactor;
      
      uniformsRef.current.uIntensity.value = props.intensity;
      uniformsRef.current.uComplexity.value = props.complexity;
      uniformsRef.current.uScale.value = props.scale;
      uniformsRef.current.uRotation.value = props.rotation;
      uniformsRef.current.uDistortion.value = props.distortion;
      uniformsRef.current.uColorIndex.value = props.colorIndex;
      uniformsRef.current.uColorVariety.value = props.colorVariety || 1.0;
      uniformsRef.current.uBrightness.value = props.brightness / 100;
      uniformsRef.current.uBlur.value = props.blur || 0;
      uniformsRef.current.uLowEndMode.value = lowEndMode;
      uniformsRef.current.uAnimate.value = props.animate;
    }
  });

  return (
    <mesh scale={[6, 6, 1]}>
      <planeGeometry args={[1, 1, gridDetail.current, gridDetail.current]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}

const VisualPanel = forwardRef((props, ref) => {
  const { 
    lowEndMode, 
    gradIntensity, 
    gradComplexity, 
    gradScale, 
    gradRotation, 
    gradDistortion, 
    gradColorIndex, 
    gradBlur, 
    gradBrightness,
    gradColorVariety = 1.0,
    animGrad, // Add animGrad from context
  } = useGradient();

  // Check if device is low-end at startup
  const [detectedLowEndMode, setDetectedLowEndMode] = useState(false);
  
  useEffect(() => {
    // Detect low-end device on mount
    setDetectedLowEndMode(isLowEndDevice());
  }, []);
  
  // Use either user-set low-end mode or auto-detected
  const effectiveLowEndMode = lowEndMode || detectedLowEndMode;
  
  // Use the maximum pixel ratio the device supports, capped at 2
  const pixelRatio = effectiveLowEndMode ? 1 : Math.min(2, window.devicePixelRatio);

  // Debug animation state in component
  useEffect(() => {
    console.log("Animation state:", animGrad);
  }, [animGrad]);

  return (
    <div className="w-full h-full bg-black relative">
      <div className="absolute inset-0">
        <Canvas
          frameloop="always"
          pixelRatio={pixelRatio}
          dpr={[1, pixelRatio]} 
          gl={{ 
            antialias: !effectiveLowEndMode,
            preserveDrawingBuffer: true, 
            alpha: true,
            powerPreference: effectiveLowEndMode ? 'low-power' : 'high-performance',
            precision: effectiveLowEndMode ? "mediump" : "highp",
            depth: false,
            stencil: false
          }}
          camera={{ position: [0, 0, 0.5], fov: 75 }}
          // Fix the onCreated callback to safely access WebGL info
          onCreated={({gl, scene, camera}) => {
            // Safely log renderer info without using getParameter
            console.log('WebGL renderer:', gl.info?.renderer || 'Unknown');
            
            // Optional: You can check renderer capabilities if needed
            const isHighPerformance = !effectiveLowEndMode && 
              gl.capabilities?.maxTextures > 8;
              
            // Apply any specific settings based on renderer
            if (isHighPerformance) {
              scene.environment = null; // Example renderer-specific setting
            }
          }}
        >
          <SwirlPlane
            intensity={Math.max(70, gradIntensity)}
            complexity={Math.max(40, gradComplexity)}
            scale={gradScale}
            rotation={gradRotation}
            distortion={Math.max(40, gradDistortion)}
            colorIndex={gradColorIndex * 360} // Scale to 0-360 range
            colorVariety={gradColorVariety}
            brightness={gradBrightness}
            blur={gradBlur}
            lowEndMode={effectiveLowEndMode}
            animate={animGrad}
          />
        </Canvas>
      </div>
      {/* Removed the duplicate blurred layer since we now handle blur in the shader */}
    </div>
  );
});

VisualPanel.displayName = 'VisualPanel';
export default VisualPanel;
