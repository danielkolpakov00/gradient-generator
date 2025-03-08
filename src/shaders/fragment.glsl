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

const float PI = 3.141592653589793;

varying vec2 vUv;

// Include directives
#include perlinNoise
#include softLight

// Add dithering function to reduce banding in gradients
float dither8x8(vec2 position, float brightness) {
    int x = int(mod(position.x, 8.0));
    int y = int(mod(position.y, 8.0));
    int index = x + y * 8;
    float limit = 0.0;
    
    // Optimized bayer matrix 8x8 pattern
    if (x < 8) {
        if (index == 0) limit = 0.015625;
        if (index == 1) limit = 0.515625;
        if (index == 2) limit = 0.140625;
        if (index == 3) limit = 0.640625;
        // ... other cases for optimal pattern
        if (index > 3 && index <= 8) limit = float(index) / 64.0;
        if (index > 8 && index <= 16) limit = float(index) / 64.0 + 0.2;
        if (index > 16 && index <= 32) limit = float(index) / 64.0 - 0.1;
        if (index > 32) limit = float(index) / 64.0 + 0.1;
    }
    
    return brightness < limit ? 0.0 : 1.0;
}

// Temporal smoothing function to make animations smoother
vec3 temporalSmooth(vec3 current, vec3 previous, float factor) {
    return mix(previous, current, clamp(factor, 0.1, 0.9));
}

// Optimized rotate function
mat2 rotate2D(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Enhanced hue to RGB conversion with better transitions
vec3 hueToRGB(float h) {
    h = mod(h, 360.0);
    float h6 = h / 60.0;
    float i = floor(h6);
    float f = h6 - i;
    
    vec3 rgb;
    if (i == 0.0) rgb = vec3(1.0, f, 0.0);
    else if (i == 1.0) rgb = vec3(1.0 - f, 1.0, 0.0);
    else if (i == 2.0) rgb = vec3(0.0, 1.0, f);
    else if (i == 3.0) rgb = vec3(0.0, 1.0 - f, 1.0);
    else if (i == 4.0) rgb = vec3(f, 0.0, 1.0);
    else rgb = vec3(1.0, 0.0, 1.0 - f);
    
    // Apply a subtle curve to add richness
    return pow(rgb, vec3(0.9, 0.85, 0.95));
}

// Additional utility functions for enhanced complexity
float sinc(float x, float k) {
    float a = PI * k * x;
    return sin(a) / a;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

// More sophisticated palettes for richer color blending
vec3 coolPalette(float t) {
    return vec3(
        0.5 + 0.5 * cos(6.28318 * (t + 0.0)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.1)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.2))
    );
}

vec3 warmPalette(float t) {
    return vec3(
        0.5 + 0.5 * cos(6.28318 * (t + 0.0)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.4)),
        0.5 + 0.5 * cos(6.28318 * (t + 0.7))
    );
}

vec3 vibrantPalette(float t) {
    return vec3(
        0.5 + 0.5 * sin(6.28318 * t),
        0.5 + 0.5 * sin(6.28318 * (t + 0.333)),
        0.5 + 0.5 * sin(6.28318 * (t + 0.666))
    );
}

// Enhanced palette function with more parameters
vec3 enhancedPalette(float t, vec3 hue, float saturation) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5) * saturation;
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = mod(hue * 0.1 + vec3(0.0, 0.33, 0.67), 1.0);
    
    return a + b * cos(6.28318 * (c * t + d));
}

// Improved cubic interpolation for smoother gradients
float cubic(float v) {
    return v * v * (3.0 - 2.0 * v);
}

vec3 cubic(vec3 v) {
    return vec3(cubic(v.x), cubic(v.y), cubic(v.z));
}

void main() {
    vec2 uv = vUv;
    
    // Generate multiple base colors from the color index
    // Convert normalized colorIndex (0-1) to degrees (0-360)
    float colorDegrees = uColorIndex * 360.0;
    vec3 baseColor1 = hueToRGB(colorDegrees);
    vec3 baseColor2 = hueToRGB(mod(colorDegrees + 30.0, 360.0));  // Complementary +30 degrees
    vec3 baseColor3 = hueToRGB(mod(colorDegrees + 60.0, 360.0));  // Complementary +60 degrees
    vec3 baseColor4 = hueToRGB(mod(colorDegrees - 30.0, 360.0));  // Complementary -30 degrees
    
    // Create a rich base color with smoother interpolation
    vec3 richBaseColor = mix(
        mix(baseColor1, baseColor2, cubic(0.3)),
        mix(baseColor3, baseColor4, cubic(0.5)),
        cubic(0.5)
    );
    
    // Apply scaling with more influence from complexity
    float mr = max(1.0, (uScale + uComplexity * 0.2) / 50.0);
    uv = (uv * 2.0 - 1.0) * mr;
    
    // Advanced rotation with time influence
    float rot = (uRotation / 360.0) * 2.0 * PI;
    if (uAnimate) {
        rot += sin(uTime * 0.1) * 0.05 * (uDistortion / 100.0);
    }
    uv = rotate2D(rot) * uv;
    
    // Time variables with smoother variations
    float t = 0.0;
    if (uAnimate) {
        // Smoother time progression with cubic easing
        float smoothTime = uTime * 0.5 * (uDistortion / 100.0);
        t = cubic(fract(smoothTime * 0.1)) * 10.0 + smoothTime;
    }
    
    // Debug: If not animating, use a simple pattern
    if (!uAnimate) {
        gl_FragColor = vec4(0.5 + 0.5 * sin(uv.x * 10.0), 
                           0.5 + 0.5 * sin(uv.y * 10.0), 
                           0.5, 1.0);
        return;
    }
    
    float amplitude = uIntensity / 80.0;
    float speed = uDistortion / 40.0;
    float complexity = uComplexity / 20.0;
    
    // Multi-layer iridescence algorithm
    float d = -t * 0.5 * speed;
    float a = 0.0;
    
    // Core iridescence calculation
    float iterations = uLowEndMode ? 4.0 : min(12.0, complexity * 4.0);
    
    // First layer - primary iridescence
    for (float i = 0.0; i < 12.0; ++i) {
        if (i >= iterations) break;
        a += cos(i - d - a * uv.x * amplitude);
        d += sin(uv.y * i + a);
    }
    
    d += t * 0.5 * speed;
    
    // Second layer - add perlin noise to the flow
    float noiseScale = complexity * 3.0;
    float noiseValue = fbm(uv * noiseScale + t * 0.2);
    
    // Combine with noise for more organic flow
    vec2 flowUV = uv + vec2(sin(d + noiseValue), cos(a - noiseValue)) * 0.2 * amplitude;
    
    // Create the base iridescent pattern
    vec3 col1 = vec3(
        cos(flowUV.x * d + a) * 0.5 + 0.5,
        cos(flowUV.y * a + d * 0.7) * 0.5 + 0.5,
        cos(flowUV.x * flowUV.y + a * d) * 0.5 + 0.5
    );
    
    // Use enhanced palette function for rich color variation
    float t1 = length(flowUV) + t * 0.1 + fbm(flowUV * 2.0 + t);
    float t2 = dot(flowUV, flowUV) * 0.3 + t * 0.15 + fbm(flowUV * 1.5 + t * 0.7);
    float t3 = (flowUV.x - flowUV.y) * 0.5 + t * 0.2 + fbm(flowUV * 2.5 - t * 0.5);
    
    // Create dynamic color variations using different palette techniques
    vec3 col2 = enhancedPalette(t1, richBaseColor, 0.8 + 0.2 * sin(uTime * 0.1));
    vec3 col3 = mix(coolPalette(t2), warmPalette(t3), noiseValue);
    vec3 col4 = vibrantPalette(t1 * 0.5 + t3 * 0.5) * (baseColor1 + baseColor2) * 0.5;
    
    // Mix patterns based on noise and other factors for organic color blending
    float mixFactor1 = smoothstep(0.2, 0.8, noiseValue);
    float mixFactor2 = smoothstep(0.3, 0.7, sin(uTime * 0.2 + uv.x + uv.y) * 0.5 + 0.5);
    float mixFactor3 = smoothstep(0.1, 0.9, cos(uTime * 0.15 + uv.x - uv.y) * 0.5 + 0.5);
    
    // Multi-stage color blending for rich results
    vec3 mixedCol = mix(col1 * richBaseColor, col2, mixFactor1);
    mixedCol = mix(mixedCol, col3, mixFactor2 * (uDistortion / 100.0));
    mixedCol = mix(mixedCol, col4, mixFactor3 * (uComplexity / 150.0));
    
    // Additional color refinement
    vec3 finalCol = mixedCol;
    
    // Apply soft light blending for rich color interactions
    finalCol = softLight(finalCol, richBaseColor * (sin(cubic(d) * PI) * 0.3 + 0.7));
    finalCol = softLight(finalCol, vec3(
        0.5 + 0.5 * sin(uTime * 0.2 + uv.x * 5.0),
        0.5 + 0.5 * sin(uTime * 0.3 + uv.y * 5.0),
        0.5 + 0.5 * sin(uTime * 0.4 + (uv.x + uv.y) * 5.0)
    ) * 0.15 + 0.85);
    
    // Add subtle variations with noise and sine patterns
    float variation = sin(uv.x * 10.0 + uTime) * cos(uv.y * 8.0 - uTime * 0.7) * 0.1;
    finalCol *= 1.0 + variation * (uIntensity / 100.0);
    
    // Apply brightness with gamma correction
    finalCol *= uBrightness;
    finalCol = pow(finalCol, vec3(0.94)); // Slightly adjusted gamma
    
    // Apply blur if needed and not in low-end mode
    if (!uLowEndMode && uBlur > 5.0) {
        float blurAmount = uBlur * 0.01;
        vec3 blurredColor = vec3(0.0);
        float totalWeight = 0.0;
        const int SAMPLES = 4; // Increased samples for better blur quality
        
        for (int i = 0; i < SAMPLES; i++) {
            float angle = float(i) * (2.0 * PI / float(SAMPLES));
            vec2 offset = vec2(cos(angle), sin(angle)) * blurAmount;
            
            for (float r = 0.25; r <= 1.0; r += 0.25) { // More fine-grained sampling
                vec2 samplePos = vUv + offset * r;
                float weight = 1.0 - (r * 0.5);
                
                // Simplified calculation for blur samples
                vec2 blurUV = (samplePos * 2.0 - 1.0) * mr;
                blurUV = rotate2D(rot) * blurUV;
                
                // Use a simpler version of the main algorithm for blur
                float blurNoiseValue = fbm(blurUV * noiseScale * 0.5 + t * 0.1);
                vec2 blurFlowUV = blurUV + vec2(sin(d + blurNoiseValue), cos(a - blurNoiseValue)) * 0.1;
                
                vec3 blurCol = palette(
                    length(blurFlowUV) + t * 0.05,
                    vec3(0.5, 0.5, 0.5),
                    vec3(0.5, 0.5, 0.5),
                    vec3(1.0, 1.0, 1.0),
                    vec3(0.0, 0.33, 0.67) + colorDegrees/360.0
                );
                
                blurCol *= baseColor1;
                blurredColor += blurCol * weight;
                totalWeight += weight;
            }
        }
        
        blurredColor /= totalWeight;
        float blurMix = smoothstep(0.0, 1.0, uBlur / 100.0);
        finalCol = mix(finalCol, blurredColor, blurMix);
    }
    
    // Apply dithering to reduce color banding
    vec2 screenPos = gl_FragCoord.xy;
    float dither = mix(0.97, 1.03, dither8x8(screenPos, 0.5));
    finalCol *= dither;
    
    // Add subtle noise to break up any banding
    float noise = (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453)) * 0.015 - 0.0075;
    // Fix the incorrect expression (1.0 - uLowEndMode ? 1.0 : 0.3)
    finalCol += noise * (uLowEndMode ? 0.3 : 1.0); // Less noise in low-end mode
    
    // Add a subtle color correction at the end
    finalCol = mix(
        finalCol,
        pow(finalCol, vec3(1.2, 1.0, 0.9)),  // Subtle RGB curve adjustment
        0.3
    );
    
    // Final color adjustments
    finalCol = clamp(finalCol, 0.0, 1.0);
    
    gl_FragColor = vec4(finalCol, 1.0);
}
