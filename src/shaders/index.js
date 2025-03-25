import vertexShaderSource from './vertex.glsl?raw';
import fragmentShaderSource from './fragment.glsl?raw';
import perlinNoiseSource from './perlinNoise.glsl?raw';
import softLightSource from './softLight.glsl?raw';
import blurVertexShader from './blurVertex.glsl?raw';
import blurFragmentShader from './blurFragment.glsl?raw';

// Process includes in fragment shader with better formatting
const processedFragment = fragmentShaderSource
  .replace('#include perlinNoise', perlinNoiseSource.trim())
  .replace('#include softLight', softLightSource.trim())
  // Clean up any potential double newlines
  .replace(/\n\s*\n/g, '\n\n');

export const vertexShader = vertexShaderSource;
export const fragmentShader = processedFragment;
export { blurVertexShader, blurFragmentShader };

// Log processed shader for debugging
console.log('Processed fragment shader:', processedFragment);
