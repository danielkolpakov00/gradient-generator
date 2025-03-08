/**
 * Performance utilities for gradient generator
 */

// Check if device is a low-end device based on hardware and browser capabilities
export function isLowEndDevice() {
  // Check for navigator and hardware concurrency
  const lowCPU = typeof navigator !== 'undefined' && 
                navigator.hardwareConcurrency && 
                navigator.hardwareConcurrency <= 4;
  
  // Check memory (if available)
  const lowMemory = typeof navigator !== 'undefined' && 
                   navigator.deviceMemory && 
                   navigator.deviceMemory <= 4;
  
  // Check for mobile device
  const isMobile = typeof navigator !== 'undefined' && 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                  .test(navigator.userAgent);
  
  // Check if browser reports it's a low-end experience
  const hasLowEndExperience = typeof navigator !== 'undefined' && 
                             'connection' in navigator && 
                             navigator.connection && 
                             (navigator.connection.saveData === true || 
                              navigator.connection.effectiveType === 'slow-2g' || 
                              navigator.connection.effectiveType === '2g');
  
  // If multiple indicators suggest it's a low-end device, return true
  return (lowCPU && lowMemory) || (isMobile && (lowCPU || lowMemory || hasLowEndExperience));
}

// Performance monitoring utility that doesn't rely on WebGL-specific APIs
export class PerformanceMonitor {
  constructor(targetFPS = 60, sampleSize = 60) {
    this.targetFPS = targetFPS;
    this.sampleSize = sampleSize;
    this.frameTimeSamples = [];
    this.lastFrameTime = 0;
    this.qualityFactor = 1.0;
  }

  // Record frame time and calculate performance quality
  recordFrame() {
    const now = performance.now();
    
    if (this.lastFrameTime !== 0) {
      const frameTime = now - this.lastFrameTime;
      this.frameTimeSamples.push(frameTime);
      
      // Keep sample size manageable
      if (this.frameTimeSamples.length > this.sampleSize) {
        this.frameTimeSamples.shift();
      }
      
      // Calculate average frame time
      if (this.frameTimeSamples.length > 5) {
        const avgFrameTime = this.frameTimeSamples.reduce((a, b) => a + b, 0) / 
                           this.frameTimeSamples.length;
        const currentFPS = 1000 / avgFrameTime;
        
        // Calculate quality factor (1.0 = target FPS, lower = worse performance)
        this.qualityFactor = Math.min(1.0, currentFPS / this.targetFPS);
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
  }
}

export default {
  isLowEndDevice,
  PerformanceMonitor
};
