# Understanding the Gradient Generator Shaders

This document explains how our gradient generator works using GLSL shaders. We'll break down each component and explain it in simple terms.

## Basic Concepts

### What is GLSL?
GLSL (OpenGL Shading Language) is a programming language for graphics. It runs directly on your GPU and processes pixels in parallel, making it extremely fast for visual effects.

### Key Terms
- **Shader**: A program that runs on your GPU
- **Fragment Shader**: Determines the color of each pixel
- **Vertex Shader**: Handles the position of vertices (points in 3D space)
- **Uniform**: A value that stays the same for all pixels during a render
- **Varying**: A value that varies across pixels, interpolated from vertices

## GLSL Syntax Basics

### Data Types
- `float`: Pretty much just a decimal value 
- `vec2`: A two-dimensional vector, often used for coordinates 
- `vec3`: A three-dimensional vector, which is often used for RGB colours.
- `vec4`: A four-dimensional vector, often used for RGBA colours (where A is alpha, controlling the opacity)
- `mat2`: A 2x2 matrix used for 2D transformations like rotation and scaling.
- `bool`: A boolean value, which is just "true" or "false"

### Variable Qualifiers
- `uniform`: A value that can be updated with JavaScript
- `varying`: Value that interpolates between vertices
- `const`: A value that can't change (same as JS)
- `in` and `out`: 


### Common Operations
```glsl
// Vector operations
vec2 a = vec2(1.0, 2.0);
vec2 b = a * 2.0;           // Multiply all components: (2.0, 4.0)
vec2 c = a + b;             // Add vectors: (3.0, 6.0)
float d = dot(a, b);        // Dot product: (1.0 * 2.0) + (2.0 * 4.0)

// Color operations
vec3 color = vec3(1.0, 0.0, 0.0);  // Red
color *= 0.5;                       // Make it darker
color = mix(color, vec3(0.0, 1.0, 0.0), 0.5);  // Mix with green
```

### Functions
```glsl
// Function definition
float multiply(float a, float b) {
    return a * b;
}

// Function with multiple outputs
void splitColor(vec3 color, out float r, out float g, out float b) {
    r = color.r;
    g = color.g;
    b = color.b;
}
```

### Built-in Variables
- `gl_Position`: Output vertex position (in vertex shader)
- `gl_FragColor`: Output pixel color (in fragment shader)
- `gl_FragCoord`: Current pixel coordinates

### Common Functions
- `mix(a, b, t)`: Linear interpolation between a and b
- `smoothstep(edge0, edge1, x)`: Smooth transition between 0 and 1
- `clamp(x, min, max)`: Constrains a value between min and max
- `fract(x)`: Returns fractional part of a number
- `mod(x, y)`: Modulo operation (remainder after division)

### Swizzling (Component Access)
```glsl
vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
vec3 rgb = color.rgb;    // Get first 3 components
vec2 xy = color.xy;      // Get first 2 components
float red = color.r;     // Same as color.x
vec3 bgr = color.bgr;    // Reorder components
```

### Control Flow
```glsl
if (condition) {
    // code
} else {
    // code
}

for (int i = 0; i < 4; i++) {
    // Note: Loops in GLSL must have fixed iterations
}
```

Remember:
- GLSL is strict about types - use `1.0` instead of `1` for floats
- Most operations work component-wise on vectors
- Variables must be initialized before use
- Loops must have fixed iteration counts
- No dynamic array sizes allowed

## Our Shader Components

### 1. Vertex Shader (vertex.glsl)
This is the simplest part. It just takes vertex positions and passes them through, along with UV coordinates (texture positions).
```glsl
varying vec2 vUv;  // UV coordinates that tell us where we are on the surface
void main() {
    vUv = uv;  // Pass the UV coordinates to the fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Standard vertex transformation
}
```

### 2. Perlin Noise (perlinNoise.glsl)
This creates natural-looking randomness. Think of it like a smooth, flowing random pattern instead of TV static.

Key functions:
- `hash2`: Creates random numbers from a position
- `noise`: Creates smooth random values
- `fbm` (Fractal Brownian Motion): Layers noise at different scales for more detail

It's like layering different sizes of clouds to create complex patterns.

### 3. Soft Light Blend (softLight.glsl)
This mimics Photoshop's soft light blend mode. It makes colors interact in a pleasing way:
- Dark colors darken the base color
- Light colors lighten the base color
It's like shining a soft light on a colored surface.

### 4. Main Fragment Shader (fragment.glsl)

#### Color Generation Process:

1. **Setup**
   ```glsl
   float t = uAnimate ? (uTime * 0.1) : 0.0;  // Animation time
   vec2 uv = vUv * 2.0 - 1.0;  // Convert coordinates to -1 to 1 range
   ```

2. **Warping**
   - We distort the space using Perlin noise
   - This creates flowing, organic shapes
   - Multiple layers of distortion create complexity

3. **Color Creation**
   - Generate base colors using HSL (Hue, Saturation, Lightness)
   - Mix multiple colors based on noise patterns
   - Add random variations for richness

4. **Final Touches**
   - Apply soft light blending for depth
   - Add blur if requested
   - Adjust brightness

## Control Parameters

- `uTime`: Controls animation
- `uComplexity`: Affects pattern detail
- `uDistortion`: Controls how much the pattern warps
- `uColorIndex`: Base color selection
- `uBlur`: Blur amount
- `uBrightness`: Overall brightness

## Understanding the Math

### Rotation
```glsl
mat2 rotate2D(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}
```
This creates a 2D rotation matrix - imagine spinning the pattern around its center, like a whirlpool of some sort.

### Color Conversion
```glsl
vec3 hueToRGB(float h)
```
Converts a hue value (0-360 degrees) to RGB colors. Think of it like choosing a color from a rainbow.

## How It All Fits Together

1. The vertex shader sets up our canvas
2. The fragment shader:
   - Creates a base pattern using Perlin noise
   - Warps and distorts this pattern
   - Generates and blends colors
   - Applies final effects

The result is a smooth, animated gradient that:
- Flows naturally
- Has rich color variation
- Can be controlled with simple parameters
- Updates in real-time

## Tips for Modification

- Adjust `uComplexity` for more/less detailed patterns
- Modify `uDistortion` to change how "wavy" the pattern is
- Play with `uColorIndex` for different color schemes
- Use `uBlur` to soften the pattern
- Adjust `uBrightness` for the final look

Remember: Small changes to these values can create dramatically different results!

## What I learned

