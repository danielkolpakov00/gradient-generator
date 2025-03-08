// Optimized 2D hashing function (faster computation)
vec2 hash2(vec2 p) {
  // Simpler hash with fewer operations
  p = fract(p * vec2(123.4, 234.5));
  p += dot(p, p + 19.19);
  return fract(vec2(p.x * p.y, p.x + p.y));
}

// Optimized noise with fewer calculations
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  // Optimized smooth interpolation with fewer operations  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  // Compute corners only once
  vec2 ua = hash2(i);
  vec2 ub = hash2(i + vec2(1.0, 0.0));
  vec2 uc = hash2(i + vec2(0.0, 1.0));
  vec2 ud = hash2(i + vec2(1.0, 1.0));

  float a = dot(ua, f);
  float b = dot(ub, f - vec2(1.0, 0.0));
  float c = dot(uc, f - vec2(0.0, 1.0));
  float d = dot(ud, f - vec2(1.0, 1.0));

  return mix(
    mix(a, b, u.x),
    mix(c, d, u.x),
    u.y
  );
}

// Optimized Fractal Brownian Motion with fewer iterations
float fbm(vec2 p) {
  float total = 0.0;
  float amp = 0.6; // Slightly increased amplitude for better effect with fewer iterations
  float freq = 1.0;
  
  // Reduced to just 2 iterations for performance
  total += noise(p * freq) * amp;
  freq *= 2.0;
  amp *= 0.35;
  total += noise(p * freq) * amp;
  
  // Normalize to 0-1 range more efficiently
  return total / 0.95;
}
