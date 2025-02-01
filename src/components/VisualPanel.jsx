import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGradient } from "../context/GradientContext";
import { DoubleSide } from "three";

/**
 * FBM-based swirl + domain-warp + forced minimum brightness.
 * This ensures the pattern never fully blends into a black background.
 */

// 1) Perlin noise & FBM
const perlinNoiseGlsl = `
// A simple 2D hashing function
vec2 hash2(vec2 p) {
  p = fract(p * vec2(5.3983, 5.4427));
  p += dot(p.yx, p.xy + 21.5351);
  return fract(vec2(p.x * p.y * 95.4307, p.x * p.y * 75.04961));
}

// Perlin-ish gradient noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = hash2(i + vec2(0.0, 0.0));
  vec2 v = hash2(i + vec2(1.0, 0.0));
  vec2 w = hash2(i + vec2(0.0, 1.0));
  vec2 z = hash2(i + vec2(1.0, 1.0));

  float a = dot(u, f);
  float b = dot(v, f - vec2(1.0, 0.0));
  float c = dot(w, f - vec2(0.0, 1.0));
  float d = dot(z, f - vec2(1.0, 1.0));

  vec2 fade = f*f*(3.0-2.0*f);

  return mix(
    mix(a,b,fade.x),
    mix(c,d,fade.x),
    fade.y
  );
}

// Fractal Brownian Motion: summing multiple noise octaves
float fbm(vec2 p) {
  float total = 0.0;
  float amp   = 0.5;
  float freq  = 1.0;
  for(int i=0; i<5; i++){
    total += noise(p * freq) * amp;
    freq  *= 2.0;
    amp   *= 0.5;
  }
  return total;
}
`;

// 2) Soft-light blend
const softLightBlend = `
float softLight(float base, float blend) {
  return (blend < 0.5)
    ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend))
    : (sqrt(base) * (2.0 * blend - 1.0) + (2.0 * base * (1.0 - blend)));
}
vec3 softLight(vec3 base, vec3 blend) {
  return vec3(
    softLight(base.r, blend.r),
    softLight(base.g, blend.g),
    softLight(base.b, blend.b)
  );
}
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 3) Our main fragment shader
const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uComplexity;
  uniform float uScale;
  uniform float uRotation;
  uniform float uDistortion;
  uniform float uColorIndex;
  uniform bool  uAnimate;

  const float PI = 3.141592653589793;
  
  ${perlinNoiseGlsl}
  ${softLightBlend}

  varying vec2 vUv;

  // A small rotation helper
  mat2 rotate2D(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  // Convert hue in [0..360] to approximate RGB
  vec3 hueToRGB(float hueDeg) {
    float h = hueDeg / 60.0;
    // Approximation approach
    return clamp(
      1.0 - abs(mod(vec3(h, h+4.0, h+2.0), 6.0) - 3.0),
      0.0,
      1.0
    );
  }

  void main() {
    // 1) Time factor, slowed down more
    float t = uAnimate ? (uTime * 0.1) : 0.0;  // reduced from 0.2 to 0.05

    // 2) uv => [-1..1]
    vec2 uv = vUv * 2.0 - 1.0;

    // 3) Apply user rotation
    float rot = (uRotation / 360.0) * 2.0 * PI;
    uv = rotate2D(rot) * uv;

    // 4) Domain warp w/ time offsets so it never "settles"
    float freq    = (uComplexity / 50.0) * 2.0;    // higher => smaller lumps
    float warpAmp = (uDistortion / 50.0) * 1.5;   // amplitude of warping

    vec2 warpUV = uv;
    
    // Step 1 - slower time offsets
    float f1 = fbm( (warpUV + vec2(t*0.3, t*0.7)) * freq );  // reduced from 1.23 and 2.97
    warpUV += (2.0*f1 - 1.0) * warpAmp * 0.5;

    // Step 2 - slower time offsets
    float f2 = fbm( (warpUV + vec2(t*0.8+1.123, t*0.4-2.456)) * freq*1.2 );  // reduced from 3.17 and 1.49
    warpUV += (2.0*f2 - 1.0) * warpAmp * 0.4;

    // Step 3 - slower time offsets
    float f3 = fbm( (warpUV + vec2(t*0.2-3.21, t*1.0+2.22)) * freq*1.5 );  // reduced from 0.81 and 4.13
    warpUV += (2.0*f3 - 1.0) * warpAmp * 0.3;

    // 5) Enhanced FBM sampling for smoother color transitions
    float c1 = fbm(warpUV*freq + t*0.1);
    float c2 = fbm((warpUV+4.321)*freq*0.8 - t*0.05);
    float c3 = fbm((warpUV-3.1)*freq*1.3 + t*0.1);
    float c4 = fbm((warpUV*1.5+vec2(2.1, -3.2))*freq*0.9 + t*0.15); // Added new noise
    float combo = (c1 + c2 + 0.5*c3 + 0.7*c4)/3.0; // Adjusted weights

    // 6) Multi-color gradient generation
    float baseHue = mod(20.0 + uColorIndex*8.0 + t*18.5, 360.0);
    float swirlVal = combo * (uIntensity / 50.0) * 120.0;
    
    // Generate three colors instead of just one
    float hue1 = mod(baseHue + swirlVal, 360.0);
    float hue2 = mod(baseHue + 120.0 + swirlVal * 0.7, 360.0);
    float hue3 = mod(baseHue + 240.0 + swirlVal * 1.3, 360.0);
    
    vec3 col1 = hueToRGB(hue1);
    vec3 col2 = hueToRGB(hue2);
    vec3 col3 = hueToRGB(hue3);
    
    // Blend all three colors using noise
    float blend1 = smoothstep(0.0, 0.5, c1);
    float blend2 = smoothstep(0.3, 0.8, c2);
    
    vec3 colorMix = mix(
      mix(col1, col2, blend1),
      col3,
      blend2
    );
    
    // Enhanced saturation
    colorMix = mix(vec3(1.0), colorMix, 0.95);

    // Additional color variation based on position
    float positionFactor = (sin(warpUV.x + warpUV.y + t*0.2) + 1.0) * 0.5;
    float extraHue = mod(baseHue + 180.0 + positionFactor * 90.0, 360.0);
    vec3 extraCol = hueToRGB(extraHue);
    extraCol = mix(vec3(1.0), extraCol, 0.95);
    
    // Smooth blend with position-based color
    vec3 baseColor = mix(colorMix, extraCol, smoothstep(0.4, 0.6, c4));

    // 9) Soft-light overlay
    float overlayT = (sin(warpUV.x*1.3 + t*0.5) + 1.0)*0.5;
    float overlayHue = mod(baseHue + 100.0, 360.0);
    vec3 oc1 = hueToRGB(overlayHue);
    vec3 oc2 = hueToRGB(overlayHue + 180.0);
    oc1 = mix(vec3(1.0), oc1, 0.7);
    oc2 = mix(vec3(1.0), oc2, 0.7);

    vec3 overlayColor = mix(oc1, oc2, overlayT);
    vec3 softLightColor = softLight(baseColor, overlayColor);
    vec3 finalColor = mix(baseColor, softLightColor, 0.4); // increased from 0.3

    // 10) Final brightness pop
    finalColor *= 1.8; // reduced from 2.0 for better color preservation

    // 11) Force stronger minimum brightness
    float lum = dot(finalColor, vec3(0.299, 0.587, 0.114));
    if (lum < 0.25) {  // increased from 0.15 to 0.25
      float diff = 0.25 - lum;
      finalColor += diff;
      
      // Add slight color variation to dark areas
      finalColor *= (1.0 + 0.2 * fbm(warpUV*2.0));
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function SwirlPlane(props) {
  const materialRef = useRef();
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uIntensity: { value: props.intensity },
    uComplexity: { value: props.complexity },
    uScale: { value: props.scale },
    uRotation: { value: props.rotation },
    uDistortion: { value: props.distortion },
    uColorIndex: { value: props.colorIndex },
    uAnimate: { value: true },
  });

  // We'll update the uniforms each frame
  useFrame((state) => {
    if (materialRef.current) {
      uniformsRef.current.uTime.value = state.clock.getElapsedTime();
      uniformsRef.current.uIntensity.value = props.intensity;
      uniformsRef.current.uComplexity.value = props.complexity;
      uniformsRef.current.uScale.value = props.scale;
      uniformsRef.current.uRotation.value = props.rotation;
      uniformsRef.current.uDistortion.value = props.distortion;
      uniformsRef.current.uColorIndex.value = props.colorIndex;
    }
  });

  return (
    <mesh scale={[6, 6, 1]}>
      <planeGeometry args={[1, 1]} />
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

const VisualPanel = () => {
  const {
    gradIntensity,
    gradComplexity,
    gradScale,
    gradRotation,
    gradDistortion,
    gradColorIndex,
    animGrad,
  } = useGradient();

  // Force moderate/high values to ensure variety
  return (
    <div className="w-full h-full bg-black">
      <Canvas
        frameloop="always"
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 0.5], fov: 75 }}
      >
        <SwirlPlane
          intensity={Math.max(70, gradIntensity)}
          complexity={Math.max(40, gradComplexity)}
          scale={gradScale}
          rotation={gradRotation}
          distortion={Math.max(40, gradDistortion)}
          colorIndex={gradColorIndex}
          animGrad={true}
        />
      </Canvas>
    </div>
  );
};

export default VisualPanel;
