// Higher quality 2D hashing function for better noise
vec2 hash2(vec2 p) {
  // Better hashing function with more random distribution
  p = fract(p * vec2(123.4, 234.5));
  p += dot(p.yx, p.xy + vec2(34.45, 78.12));
  return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

// Enhanced noise with better gradient interpolation
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  // Higher quality smooth interpolation for better artifacts
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  // Improved corner gradient calculation
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
  ) * 0.5 + 0.5; // Normalize to 0-1 range
}

// Enhanced Fractal Brownian Motion with better detail
float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxAmplitude = 0.0;  // Used for normalizing the result
  
  // Use 3 octaves for a better detail/performance balance
  for(int i = 0; i < 3; i++) {
    total += noise(p * frequency) * amplitude;
    maxAmplitude += amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  // Normalize to 0-1 range
  return total / maxAmplitude;
}
