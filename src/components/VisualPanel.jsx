import React, { useRef, forwardRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGradient } from "../context/GradientContext";
import { DoubleSide } from "three";
import { vertexShader, fragmentShader } from '../shaders';
import { isLowEndDevice, PerformanceMonitor, getBrowserCapabilities } from '../utils/performanceUtils';

// Memory-efficient performance monitor as a React hook
function usePerformanceMonitor() {
  const performanceFactorRef = useRef(1);
  const monitorRef = useRef(null);
  
  useEffect(() => {
    // Initialize with more balanced settings
    monitorRef.current = new PerformanceMonitor(45, 20); // Fewer samples for faster adaptation
    
    // Check if device is low-end at startup
    const lowEndDevice = isLowEndDevice();
    if (lowEndDevice) {
      performanceFactorRef.current = 0.5;
    }
    
    // Cleanup
    return () => {
      monitorRef.current = null;
    };
  }, []);

  // Track frame without updating state to avoid re-renders
  const trackFrame = useCallback(() => {
    if (monitorRef.current) {
      performanceFactorRef.current = monitorRef.current.recordFrame();
      return performanceFactorRef.current;
    }
    return performanceFactorRef.current;
  }, []);

  return { performanceFactorRef, trackFrame };
}

// Memoized gradient plane component with optimized uniforms
const SwirlPlane = React.memo(function SwirlPlane(props) {
  const materialRef = useRef();
  const { lowEndMode } = useGradient();
  const lastFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const { performanceFactorRef, trackFrame } = usePerformanceMonitor();
  
  // Use refs instead of state for frequently changing values
  const prevFrameDataRef = useRef({
    time: 0,
    colorIndex: props.colorIndex
  });
  
  // Adaptive geometry detail based on performance
  const gridDetailRef = useRef(lowEndMode ? 16 : 32);
  const frameCountRef = useRef(0);
  
  // Use a ref to avoid re-creating the uniforms object
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
    uAnimate: { value: Boolean(props.animate) },
    uBlur: { value: props.blur || 0 },
    uBrightness: { value: props.brightness / 100 },
    uLowEndMode: { value: lowEndMode },
    uPerformanceFactor: { value: 1.0 },
    // Add new color control uniforms
    uColorSaturation: { value: props.colorSaturation || 0.8 },
    uColorSpread: { value: props.colorSpread || 0.5 },
    uColorMode: { value: props.colorMode || 0 }
  });

  // Optimize frame updates with a throttling mechanism
  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Track performance
    const performanceFactor = trackFrame();
    
    // Throttle updates based on performance
    const targetFPS = lowEndMode ? 30 : 
                     (performanceFactor > 0.7 ? 60 : 
                     performanceFactor > 0.4 ? 45 : 30);
    
    if (currentTime - lastFrameRef.current < 1 / targetFPS) return;
    lastFrameRef.current = currentTime;
    
    // Increment frame counter for adaptive quality changes
    frameCountRef.current++;
    
    // Update adaptive geometry only occasionally to avoid GC thrashing
    if (frameCountRef.current % 120 === 0) {
      const newDetail = lowEndMode ? 16 : 
                       (performanceFactor > 0.7 ? 32 : 
                       performanceFactor > 0.5 ? 24 : 16);
      gridDetailRef.current = newDetail;
    }

    if (materialRef.current) {
      // Get the current uniforms
      const uniforms = uniformsRef.current;
      
      // Store previous time
      prevFrameDataRef.current.time = uniforms.uTime.value;
      
      // Update time uniforms - these change every frame
      uniforms.uTime.value = currentTime;
      uniforms.uTimeX.value = currentTime * 0.8 * (props.animate ? 1.0 : 0.0);
      uniforms.uTimeY.value = currentTime * 0.6 * (props.animate ? 1.0 : 0.0);
      
      // Update animation state
      uniforms.uAnimate.value = Boolean(props.animate);
      
      // Update performance factor
      uniforms.uPerformanceFactor.value = performanceFactor;
      
      // Only update these if they've changed to avoid unnecessary GPU uploads
      if (uniforms.uIntensity.value !== props.intensity) 
        uniforms.uIntensity.value = props.intensity;
      
      if (uniforms.uComplexity.value !== props.complexity)
        uniforms.uComplexity.value = props.complexity;
        
      if (uniforms.uScale.value !== props.scale)
        uniforms.uScale.value = props.scale;
        
      if (uniforms.uRotation.value !== props.rotation)
        uniforms.uRotation.value = props.rotation;
        
      if (uniforms.uDistortion.value !== props.distortion)
        uniforms.uDistortion.value = props.distortion;
        
      if (uniforms.uColorIndex.value !== props.colorIndex) {
        prevFrameDataRef.current.colorIndex = uniforms.uColorIndex.value;
        uniforms.uColorIndex.value = props.colorIndex;
      }
        
      if (uniforms.uBrightness.value !== props.brightness / 100)
        uniforms.uBrightness.value = props.brightness / 100;
        
      if (uniforms.uBlur.value !== (props.blur || 0))
        uniforms.uBlur.value = props.blur || 0;
        
      if (uniforms.uLowEndMode.value !== lowEndMode)
        uniforms.uLowEndMode.value = lowEndMode;
        
      // Update new color control uniforms
      if (uniforms.uColorSaturation.value !== props.colorSaturation)
        uniforms.uColorSaturation.value = props.colorSaturation;
        
      if (uniforms.uColorSpread.value !== props.colorSpread)
        uniforms.uColorSpread.value = props.colorSpread;
        
      if (uniforms.uColorMode.value !== props.colorMode)
        uniforms.uColorMode.value = props.colorMode;
    }
  });

  // Calculate grid detail based on current performance
  const gridDetail = lowEndMode ? 16 : (performanceFactorRef.current > 0.7 ? 32 : 24);

  return (
    <mesh scale={[6, 6, 1]}>
      <planeGeometry args={[1, 1, gridDetail, gridDetail]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
});

// Create export method to capture the canvas
function captureCanvas(canvas) {
  return new Promise((resolve) => {
    if (!canvas) resolve(null);
    // Use requestAnimationFrame to ensure we capture after rendering
    requestAnimationFrame(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        console.error("Error exporting gradient:", e);
        resolve(null);
      }
    });
  });
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
    gradColorSaturation,
    gradColorSpread,
    gradColorMode,
    animGrad,
  } = useGradient();

  // Use ref for canvas
  const canvasRef = useRef(null);
  
  // Check if device is low-end at startup
  const [detectedLowEndMode, setDetectedLowEndMode] = useState(false);
  
  // Get browser capabilities once on mount
  const capabilities = useMemo(() => getBrowserCapabilities(), []);
  
  useEffect(() => {
    setDetectedLowEndMode(isLowEndDevice());
  }, []);
  
  // Use either user-set low-end mode or auto-detected
  const effectiveLowEndMode = lowEndMode || detectedLowEndMode;
  
  // Calculate ideal pixel ratio based on performance and device
  const pixelRatio = useMemo(() => {
    if (effectiveLowEndMode) return 1;
    return Math.min(capabilities.devicePixelRatio, 1.5);
  }, [effectiveLowEndMode, capabilities.devicePixelRatio]);

  // Expose capture method through the ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        exportGradient: () => captureCanvas(canvasRef.current)
      };
    }
  }, [ref]);

  // GL attributes optimized based on device capabilities
  const glAttributes = useMemo(() => ({
    antialias: !effectiveLowEndMode,
    alpha: true,
    depth: false, // Don't need depth testing for 2D
    stencil: false, // Don't need stencil for 2D
    powerPreference: effectiveLowEndMode ? 'low-power' : 'high-performance',
    preserveDrawingBuffer: true, // Needed for image capture
    precision: effectiveLowEndMode ? "mediump" : 
              (capabilities.highPrecisionShaders ? "highp" : "mediump"),
    failIfMajorPerformanceCaveat: false // Don't fail on low performance devices
  }), [effectiveLowEndMode, capabilities.highPrecisionShaders]);

  return (
    <div className="w-full h-full bg-black relative">
      <div className="absolute inset-0">
        <Canvas
          ref={canvasRef}
          frameloop="always"
          dpr={pixelRatio} 
          gl={glAttributes}
          camera={{ position: [0, 0, 0.5], fov: 75 }}
          performance={{ min: 0.5 }} // R3F-specific performance tweaks
        >
          <SwirlPlane
            intensity={Math.max(70, gradIntensity)}
            complexity={Math.max(40, gradComplexity)}
            scale={gradScale}
            rotation={gradRotation}
            distortion={Math.max(40, gradDistortion)}
            colorIndex={gradColorIndex * 360} // Scale to 0-360 range
            brightness={gradBrightness}
            blur={gradBlur}
            animate={animGrad}
            // Pass new color parameters
            colorSaturation={gradColorSaturation}
            colorSpread={gradColorSpread}
            colorMode={gradColorMode}
          />
        </Canvas>
      </div>
    </div>
  );
});

VisualPanel.displayName = 'VisualPanel';
export default VisualPanel;
