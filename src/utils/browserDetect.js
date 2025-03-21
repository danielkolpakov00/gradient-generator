/**
 * Browser and hardware detection utilities
 */

// Detect browser type
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  // Detect Chrome
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
    const match = userAgent.match(/(?:chrome|chromium|crios)\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Firefox
  else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
    const match = userAgent.match(/(?:firefox|fxios)\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Safari
  else if (userAgent.match(/safari/i) && !userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Safari";
    const match = userAgent.match(/version\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Edge
  else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
    const match = userAgent.match(/edg\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect IE
  else if (userAgent.match(/trident/i)) {
    browserName = "Internet Explorer";
    const match = userAgent.match(/(?:rv:|msie) ([\d.]+)/i);
    if (match) browserVersion = match[1];
  }
  
  return {
    name: browserName,
    version: browserVersion,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(userAgent),
    isAndroid: /Android/i.test(userAgent),
    isModernBrowser: !(/trident/i.test(userAgent)) // IE is not modern
  };
}

// Check WebGL capabilities specifically
export function getWebGLCapabilities() {
  const canvas = document.createElement('canvas');
  let gl;
  
  try {
    // Try WebGL2 first
    gl = canvas.getContext('webgl2');
    if (gl) {
      return {
        webgl2: true,
        version: 2,
        capabilities: getCapabilities(gl)
      };
    }
    
    // Fall back to WebGL1
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      return {
        webgl2: false,
        version: 1,
        capabilities: getCapabilities(gl)
      };
    }
    
    // No WebGL support
    return {
      webgl2: false,
      version: 0,
      capabilities: {}
    };
  } catch (e) {
    return {
      webgl2: false,
      version: 0,
      capabilities: {},
      error: e.message
    };
  }
  
  function getCapabilities(gl) {
    const caps = {
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubeMapSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      extensions: []
    };
    
    // Get extensions
    const extensions = gl.getSupportedExtensions();
    if (extensions) {
      caps.extensions = extensions;
      
      // Check for specific important extensions
      caps.floatTextures = extensions.includes('OES_texture_float') || 
                           extensions.includes('EXT_color_buffer_float');
      caps.depthTexture = extensions.includes('WEBGL_depth_texture');
      caps.instancedArrays = extensions.includes('ANGLE_instanced_arrays');
      caps.anisotropicFiltering = extensions.includes('EXT_texture_filter_anisotropic');
      
      // Get vendor info if available
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          caps.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          caps.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      } catch (e) {
        // Some browsers block this for privacy reasons
        caps.vendorBlocked = true;
      }
    }
    
    return caps;
  }
}

// Helper to determine if a specific shader feature is supported
export function testShaderFeature(feature) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return false;
  
  // Test features based on input
  switch (feature) {
    case 'derivatives':
      return !!gl.getExtension('OES_standard_derivatives');
      
    case 'highPrecision':
      const shaderPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      return shaderPrecision.precision > 0;
      
    case 'floatTextures':
      return !!gl.getExtension('OES_texture_float');
      
    default:
      return false;
  }
}

export default {
  getBrowserInfo,
  getWebGLCapabilities,
  testShaderFeature
};
