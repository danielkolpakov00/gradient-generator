/**
 * Utilities for smoother color manipulation and gradient generation
 */

// Convert hex to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Convert RGB to linear space for better interpolation
export function rgbToLinear(rgb) {
  return {
    r: rgb.r <= 0.04045 ? rgb.r / 12.92 : Math.pow((rgb.r + 0.055) / 1.055, 2.4),
    g: rgb.g <= 0.04045 ? rgb.g / 12.92 : Math.pow((rgb.g + 0.055) / 1.055, 2.4),
    b: rgb.b <= 0.04045 ? rgb.b / 12.92 : Math.pow((rgb.b + 0.055) / 1.055, 2.4)
  };
}

// Convert linear RGB back to standard RGB
export function linearToRgb(linear) {
  return {
    r: linear.r <= 0.0031308 ? 12.92 * linear.r : 1.055 * Math.pow(linear.r, 1/2.4) - 0.055,
    g: linear.g <= 0.0031308 ? 12.92 * linear.g : 1.055 * Math.pow(linear.g, 1/2.4) - 0.055,
    b: linear.b <= 0.0031308 ? 12.92 * linear.b : 1.055 * Math.pow(linear.b, 1/2.4) - 0.055
  };
}

// Generate smooth complementary colors
export function generateComplementaryColors(hue, count = 4, spread = 30) {
  const colors = [];
  const baseAngle = hue * 360;
  
  for (let i = 0; i < count; i++) {
    const angle = (baseAngle + (i * spread) - (count-1) * spread / 2) % 360;
    colors.push(angle / 360); // Normalize to 0-1
  }
  
  return colors;
}

// Improved cubic easing function for smoother animations
export function cubicEase(t) {
  return t * t * (3 - 2 * t);
}

// Return an eased value between start and end
export function smoothStep(start, end, t) {
  t = cubicEase(Math.max(0, Math.min(1, t)));
  return start + t * (end - start);
}
