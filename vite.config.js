import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
// In vite.config.js
export default defineConfig({
  plugins: [
    react(),
    glsl() // Properly initialize the GLSL plugin
  ],
  server: {
    watch: {
      ignored: ['**/public/fonts/**']
    }
  },
  build: {
    // Optimize production build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console logs in production
        ecma: 2020          // Use modern JS optimizations
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'vendor': ['react', 'react-dom', '@react-three/fiber', 'three']
        }
      }
    }
  },
  assetsInclude: ['**/*.glsl', '**/*.glb', '**/*.fbx'],
  optimizeDeps: {
    exclude: ['@react-three/postprocessing'] // Avoid optimization issues with this library
  }
});