/**
 * Performance utilities for gradient generator
 */

// Check if the device is likely a mobile or low-end device
export function isLowEndDevice() {
  // Check for mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check for CPU cores (low-end typically has fewer cores)
  const cpuCores = navigator.hardwareConcurrency || 2;
  
  // Check for memory (if available)
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  
  // Check for low-end GPU by testing canvas performance
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  let gpuInfo = '';
  
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    }
  }
  
  const isLowEndGPU = gpuInfo.toLowerCase().includes('intel') || 
                      gpuInfo.toLowerCase().includes('mali') || 
                      gpuInfo.toLowerCase().includes('adreno');
  
  return isMobile || cpuCores <= 2 || lowMemory || isLowEndGPU;
}

// Dynamically adjust quality settings based on FPS
export class PerformanceMonitor {
  constructor(targetFPS = 30, checkInterval = 1000) {
    this.frameTimestamps = [];
    this.maxSamples = 60;
    this.targetFPS = targetFPS;
    this.checkInterval = checkInterval;
    this.lastCheck = Date.now();
    this.qualityFactor = 1.0; // 0 = lowest, 1 = highest
  }
  
  recordFrame() {
    const now = Date.now();
    this.frameTimestamps.push(now);
    
    // Keep array at manageable size
    if (this.frameTimestamps.length > this.maxSamples) {
      this.frameTimestamps.shift();
    }
    
    // Check if it's time to evaluate performance
    if (now - this.lastCheck > this.checkInterval) {
      this.evaluatePerformance();
      this.lastCheck = now;
    }
    
    return this.qualityFactor;
  }
  
  evaluatePerformance() {
    if (this.frameTimestamps.length < 5) return;
    
    // Calculate average FPS from frame timestamps
    let totalTimeMs = this.frameTimestamps[this.frameTimestamps.length - 1] - 
                     this.frameTimestamps[0];
    let frameCount = this.frameTimestamps.length - 1;
    let fps = 1000 * frameCount / totalTimeMs;
    
    // Adjust quality based on FPS
    if (fps < this.targetFPS * 0.5) {
      // Significantly below target, reduce quality
      this.qualityFactor = Math.max(0, this.qualityFactor - 0.2);
    } else if (fps < this.targetFPS * 0.8) {
      // Moderately below target, reduce quality slightly
      this.qualityFactor = Math.max(0.3, this.qualityFactor - 0.1);
    } else if (fps > this.targetFPS * 1.5 && this.qualityFactor < 1) {
      // Well above target, can increase quality
      this.qualityFactor = Math.min(1, this.qualityFactor + 0.1);
    }
    
    // Reset samples to avoid old data affecting future calculations
    this.frameTimestamps = [];
  }
  
  getQualityFactor() {
    return this.qualityFactor;
  }
}

export default {
  isLowEndDevice,
  PerformanceMonitor
};
