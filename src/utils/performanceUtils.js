/**
 * Performance utilities for gradient generator
 */

// Check if device is a low-end device based on hardware and browser capabilities
export function isLowEndDevice() {
  // Use a more efficient approach with a single navigator check
  if (typeof navigator === 'undefined') return false;
  
  // Check for navigator and hardware concurrency
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  // Check memory (if available)
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  
  // Check for mobile device with a more efficient regex
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  
  // Check if browser reports it's a low-end experience
  const hasLowEndExperience = 'connection' in navigator && 
                             navigator.connection && 
                             (navigator.connection.saveData === true || 
                              navigator.connection.effectiveType === 'slow-2g' || 
                              navigator.connection.effectiveType === '2g');
  
  // More accurate GPU detection
  let isLowEndGPU = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        isLowEndGPU = /(intel|mali|adreno|powervr|apple gpu).*(hd|g4|g5|g6|g7|610|620|630|730)/i.test(renderer);
      }
      // Check max texture size as another indicator
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (maxTextureSize < 8192) isLowEndGPU = true;
    }
  } catch (e) {
    // Fallback if WebGL detection fails
    isLowEndGPU = isMobile || lowMemory;
  }
  
  // If multiple indicators suggest it's a low-end device, return true
  return (lowCPU && lowMemory) || (isMobile && (lowCPU || lowMemory || hasLowEndExperience || isLowEndGPU));
}

// Performance monitoring utility that doesn't rely on WebGL-specific APIs
export class PerformanceMonitor {
  constructor(targetFPS = 60, sampleSize = 30) { // Reduced sample size for more responsive adaptation
    this.targetFPS = targetFPS;
    this.sampleSize = sampleSize;
    this.frameTimeSamples = [];
    this.lastFrameTime = 0;
    this.qualityFactor = 1.0;
    this.stabilityCounter = 0; // Track how many frames quality has been stable
    this.lastQualityAdjustment = 0; // When we last changed quality
  }

  // Record frame time and calculate performance quality
  recordFrame() {
    const now = performance.now();
    
    if (this.lastFrameTime !== 0) {
      const frameTime = now - this.lastFrameTime;
      // Filter out extreme outliers (e.g., tab switching)
      if (frameTime < 200) { // Ignore long frames (likely tab switch)
        this.frameTimeSamples.push(frameTime);
        
        // Keep sample size manageable
        if (this.frameTimeSamples.length > this.sampleSize) {
          this.frameTimeSamples.shift();
        }
        
        // Calculate average frame time
        if (this.frameTimeSamples.length > 3) { // Need fewer samples for faster adaptation
          // Use median frame time for more stability
          const sortedTimes = [...this.frameTimeSamples].sort((a, b) => a - b);
          const medianIndex = Math.floor(sortedTimes.length / 2);
          const medianFrameTime = sortedTimes[medianIndex];
          const currentFPS = 1000 / medianFrameTime;
          
          // Calculate quality factor (1.0 = target FPS, lower = worse performance)
          const newQualityFactor = Math.min(1.0, currentFPS / this.targetFPS);
          
          // Only change quality after some stability to avoid fluctuations
          const timeSinceLastAdjustment = now - this.lastQualityAdjustment;
          
          // If significant change in performance or enough time elapsed
          if (Math.abs(newQualityFactor - this.qualityFactor) > 0.1 && 
              (timeSinceLastAdjustment > 1000 || newQualityFactor < this.qualityFactor)) {
            this.qualityFactor = newQualityFactor * 0.7 + this.qualityFactor * 0.3; // Smoother transition
            this.lastQualityAdjustment = now;
            this.stabilityCounter = 0;
          } else {
            this.stabilityCounter++;
          }
        }
      }
    }
    
    this.lastFrameTime = now;
    return this.qualityFactor;
  }

  // Reset measurements
  reset() {
    this.frameTimeSamples = [];
    this.lastFrameTime = 0;
    this.qualityFactor = 1.0;
    this.stabilityCounter = 0;
    this.lastQualityAdjustment = 0;
  }
}

// Add browser capability detection
export function getBrowserCapabilities() {
  const capabilities = {
    webgl2: false,
    floatTextures: false,
    highPrecisionShaders: false,
    maxTextureSize: 0,
    preferredMemory: Infinity,
    devicePixelRatio: window.devicePixelRatio || 1
  };
  
  try {
    // Test for WebGL2
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    capabilities.webgl2 = !!gl2;
    
    // If no WebGL2, try WebGL1
    const gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      // Check for float texture support
      capabilities.floatTextures = !!(
        gl.getExtension('OES_texture_float') || 
        gl.getExtension('EXT_color_buffer_float')
      );
      
      // Check for high precision shader support
      const shaderPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      capabilities.highPrecisionShaders = shaderPrecision.precision > 0;
      
      // Get max texture size
      capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    }
    
    // Check for device memory
    if (navigator.deviceMemory) {
      capabilities.preferredMemory = navigator.deviceMemory;
    }
    
    // Check for hardware concurrency
    if (navigator.hardwareConcurrency) {
      capabilities.cores = navigator.hardwareConcurrency;
    }
    
  } catch (e) {
    console.warn("Error detecting WebGL capabilities:", e);
  }
  
  return capabilities;
}

export default {
  isLowEndDevice,
  PerformanceMonitor,
  getBrowserCapabilities
};
