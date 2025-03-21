uniform float uTime;
uniform float uTimeX;
uniform float uTimeY;
uniform float uIntensity;
uniform float uComplexity;
uniform float uScale;
uniform float uRotation;
uniform float uDistortion;
uniform float uColorIndex;
uniform bool  uAnimate;
uniform float uBlur;
uniform float uBrightness;
uniform bool  uLowEndMode;
uniform float uPerformanceFactor;
uniform float uColorSaturation; // New: Control color saturation
uniform float uColorSpread;     // New: Control color distribution
uniform float uColorMode;       // New: Color mode (0-4 for different palette types)

const float PI = 3.141592653589793;

varying vec2 vUv;

// Include directives
#include perlinNoise
#include softLight

// Simplified dithering function for better performance
float dither4x4(vec2 position, float brightness) {
    int x = int(mod(position.x, 4.0));
    int y = int(mod(position.y, 4.0));
    int index = x + y * 4;
    float limit = 0.0;
    
    // Optimized 4x4 bayer matrix (faster than 8x8)
    if (index == 0) limit = 0.0625;
    if (index == 1) limit = 0.5625;
    if (index == 2) limit = 0.1875;
    if (index == 3) limit = 0.6875;
    if (index == 4) limit = 0.8125;
    if (index == 5) limit = 0.3125;
    if (index == 6) limit = 0.9375;
    if (index == 7) limit = 0.4375;
    if (index == 8) limit = 0.25;
    if (index == 9) limit = 0.75;
    if (index == 10) limit = 0.125;
    if (index == 11) limit = 0.625;
    if (index == 12) limit = 1.0;
    if (index == 13) limit = 0.5;
    if (index == 14) limit = 0.875;
    if (index == 15) limit = 0.375;
    
    return brightness < limit ? 0.0 : 1.0;
}

// Temporal smoothing function to make animations smoother
vec3 temporalSmooth(vec3 current, vec3 previous, float factor) {
    return mix(previous, current, clamp(factor, 0.1, 0.9));
}

// Optimized rotate function (precalculates sin/cos)
mat2 rotate2D(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Improved HSV to RGB conversion for better color variety
vec3 hsv2rgb(float h, float s, float v) {
    vec3 c = vec3(h, s, v);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
}

// Enhanced hue to RGB with more color diversity
vec3 hueToRGB(float h, float s, float v) {
    h = mod(h, 360.0);
    return hsv2rgb(h / 360.0, s, v);
}

// Generate complementary colors with better distribution
vec3 complementaryColor(vec3 baseColor, float offset) {
    // Convert to HSV-like space for better manipulation
    float max_c = max(max(baseColor.r, baseColor.g), baseColor.b);
    float min_c = min(min(baseColor.r, baseColor.g), baseColor.b);
    float chroma = max_c - min_c;
    
    float h = 0.0;
    if(chroma == 0.0) {
        h = 0.0;
    } else if(max_c == baseColor.r) {
        h = mod((baseColor.g - baseColor.b) / chroma, 6.0) / 6.0;
    } else if(max_c == baseColor.g) {
        h = ((baseColor.b - baseColor.r) / chroma + 2.0) / 6.0;
    } else {
        h = ((baseColor.r - baseColor.g) / chroma + 4.0) / 6.0;
    }
    
    // Rotate hue by offset
    h = mod(h + offset, 1.0);
    
    return hsv2rgb(h, min(1.0, chroma * 2.0), max_c);
}

// Additional utility functions for enhanced complexity
float sinc(float x, float k) {
    float a = PI * k * x;
    return sin(a) / a;
}

// Enhanced palette functions for more variety
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

// New palette functions for greater color variety
vec3 coolPalette(float t, float sat) {
    return vec3(
        0.5 + 0.5 * cos(6.28318 * (t + 0.0)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.1)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.2))
    ) * sat + (1.0 - sat) * 0.5;
}

vec3 warmPalette(float t, float sat) {
    return vec3(
        0.5 + 0.5 * cos(6.28318 * (t + 0.0)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.4)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.7))
    ) * sat + (1.0 - sat) * 0.5;
}

vec3 pastelPalette(float t, float sat) {
    // Create soft, pastel colors with less saturation
    return mix(
        vec3(0.9, 0.8, 0.8), 
        vec3(
            0.6 + 0.4 * sin(6.28318 * t),
            0.6 + 0.4 * sin(6.28318 * (t + 0.333)),
            0.6 + 0.4 * sin(6.28318 * (t + 0.666))
        ),
        sat
    );
}

vec3 vibrantPalette(float t, float sat) {
    // Higher contrast and more vibrant colors
    return mix(
        vec3(0.5),
        vec3(
            0.5 + 0.5 * sin(6.28318 * t),
            0.5 + 0.5 * sin(6.28318 * (t + 0.333)),
            0.5 + 0.5 * sin(6.28318 * (t + 0.666))
        ),
        sat
    );
}

vec3 customPalette(float t, float sat, float mode) {
    // Mix different palette types based on mode
    float m = mod(mode, 5.0);
    if (m < 1.0) {
        return warmPalette(t, sat);
    } else if (m < 2.0) {
        return coolPalette(t, sat);
    } else if (m < 3.0) {
        return pastelPalette(t, sat); 
    } else if (m < 4.0) {
        return vibrantPalette(t, sat);
    } else {
        // Unique multicolor palette
        return vec3(
            0.5 + 0.4 * sin(PI * 2.0 * t),
            0.5 + 0.4 * sin(PI * 2.0 * (t + 0.4)),
            0.5 + 0.4 * sin(PI * 2.0 * (t + 0.7))
        ) * sat + (1.0 - sat) * 0.5;
    }
}

// Improved cubic interpolation for smoother gradients but with fewer operations
float cubic(float v) {
    return v * v * (3.0 - 2.0 * v);
}

vec3 cubic(vec3 v) {
    return vec3(cubic(v.x), cubic(v.y), cubic(v.z));
}

void main() {
    // Early exit for debug mode - simplest pattern possible
    if (!uAnimate) {
        gl_FragColor = vec4(vUv.x * 0.5 + 0.25, vUv.y * 0.5 + 0.25, 0.5, 1.0);
        return;
    }
    
    vec2 uv = vUv;
    
    // Apply scaling with more influence from complexity
    float mr = uScale / 50.0;
    uv = (uv * 2.0 - 1.0) * mr;
    
    // Apply rotation
    float rot = (uRotation / 360.0) * 2.0 * PI;
    if (uAnimate) {
        rot += sin(uTime * 0.1) * 0.05 * (uDistortion / 100.0);
    }
    uv = rotate2D(rot) * uv;
    
    // Simplified time variables
    float t = uAnimate ? uTime * 0.5 * (uDistortion / 100.0) : 0.0;
    
    float amplitude = uIntensity / 80.0;
    float speed = uDistortion / 40.0;
    float complexity = uComplexity / 20.0;
    
    // Generate multiple base colors from the color index for more variety
    float colorDegrees = uColorIndex;
    float saturation = max(0.5, min(1.0, uColorSaturation));
    float spread = max(0.01, min(1.0, uColorSpread));
    
    // Create a richer set of base colors with better distribution
    vec3 baseColor1 = hueToRGB(colorDegrees, saturation, 1.0);
    vec3 baseColor2 = hueToRGB(mod(colorDegrees + 360.0 * spread * 0.33, 360.0), saturation, 1.0);
    vec3 baseColor3 = hueToRGB(mod(colorDegrees + 360.0 * spread * 0.66, 360.0), saturation, 1.0);
    vec3 baseColor4 = hueToRGB(mod(colorDegrees + 360.0 * spread, 360.0), saturation, 1.0);
    
    // Simplified iridescence algorithm
    float d = -t * 0.5 * speed;
    float a = 0.0;
    
    // Optimize iterations based on performance factor and low-end mode
    float iterations = uLowEndMode ? 3.0 : min(8.0, complexity * 3.0 * uPerformanceFactor);
    
    // First layer - primary iridescence (simplified loop)
    for (float i = 0.0; i < 8.0; ++i) {
        if (i >= iterations) break;
        a += cos(i - d - a * uv.x * amplitude);
        d += sin(uv.y * i + a);
    }
    
    d += t * 0.5 * speed;
    
    // Second layer - add perlin noise to the flow (simplified)
    float noiseScale = complexity * 2.0;
    float noiseValue = fbm(uv * noiseScale + t * 0.2);
    
    // Combine with noise for more organic flow
    vec2 flowUV = uv + vec2(sin(d + noiseValue), cos(a - noiseValue)) * 0.2 * amplitude;
    
    // Create a more varied iridescent pattern
    vec3 col1 = vec3(
        cos(flowUV.x * d + a) * 0.5 + 0.5,
        cos(flowUV.y * a + d * 0.7) * 0.5 + 0.5,
        cos(flowUV.x * flowUV.y + a * d) * 0.5 + 0.5
    );
    
    // Use multiple t values for more variation in pattern
    float t1 = length(flowUV) + t * 0.1 + fbm(flowUV * 2.0 + t);
    float t2 = dot(flowUV, flowUV) * 0.3 + t * 0.15 + fbm(flowUV * 1.5 + t * 0.7);
    float t3 = (flowUV.x - flowUV.y) * 0.5 + t * 0.2 + fbm(flowUV * 2.5 - t * 0.5);
    
    // Get base palette values from all color modes
    vec3 paletteColor = customPalette(t1, saturation, uColorMode);
    
    // Create dynamic color variations using our enhanced base colors
    vec3 col2 = paletteColor * mix(baseColor1, baseColor2, cubic(noiseValue));
    vec3 col3 = mix(
        customPalette(t2, saturation, mod(uColorMode + 1.0, 5.0)),
        customPalette(t3, saturation, mod(uColorMode + 2.0, 5.0)),
        cubic(sin(t * 0.5) * 0.5 + 0.5)
    ) * mix(baseColor3, baseColor4, cubic(1.0 - noiseValue));
    
    // Mix patterns based on noise for organic color blending
    float mixFactor1 = smoothstep(0.2, 0.8, noiseValue);
    float mixFactor2 = smoothstep(0.3, 0.7, sin(t * 0.3 + uv.x + uv.y) * 0.5 + 0.5);
    
    // Multi-stage color blending for rich results
    vec3 mixedCol = mix(col1 * baseColor1, col2, mixFactor1);
    mixedCol = mix(mixedCol, col3, mixFactor2 * 0.7);
    
    // Add subtle color accents using complementary colors
    mixedCol = mix(
        mixedCol,
        complementaryColor(mixedCol, 0.5) * 
            (0.7 + 0.3 * sin(flowUV.x * 5.0 + t) * cos(flowUV.y * 5.0 - t * 0.7)),
        0.2 * cubic(sin(t * 0.2) * 0.5 + 0.5)
    );
    
    // Apply soft light blending for rich color interactions
    vec3 finalCol = softLight(mixedCol, baseColor1 * (sin(cubic(d) * PI) * 0.3 + 0.7));
    
    // Apply brightness
    finalCol *= uBrightness;
    
    // Apply simplified blur only when needed and not in low-end mode
    if (!uLowEndMode && uBlur > 10.0) {
        float blurAmount = min(uBlur * 0.005, 0.01); // Cap blur amount
        vec3 blurredColor = vec3(0.0);
        const int SAMPLES = 4; // Fewer samples for better performance
        
        for (int i = 0; i < SAMPLES; i++) {
            float angle = float(i) * (2.0 * PI / float(SAMPLES));
            vec2 offset = vec2(cos(angle), sin(angle)) * blurAmount;
            
            vec2 samplePos = vUv + offset;
            blurredColor += finalCol * 0.25;
        }
        
        float blurMix = smoothstep(0.0, 1.0, uBlur / 100.0);
        finalCol = mix(finalCol, blurredColor, blurMix);
    }
    
    // Apply simplified dithering only when not in low-end mode
    if (!uLowEndMode) {
        vec2 screenPos = gl_FragCoord.xy;
        float dither = mix(0.98, 1.02, dither4x4(screenPos, 0.5));
        finalCol *= dither;
    }
    
    // Add minimal noise to break up banding
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.01 - 0.005;
    finalCol += noise;
    
    // Final color clamp
    finalCol = clamp(finalCol, 0.0, 1.0);
    
    gl_FragColor = vec4(finalCol, 1.0);
}
