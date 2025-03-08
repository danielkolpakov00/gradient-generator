import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
// In vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/public/fonts/**']
    }
  },
  assetsInclude: ['**/*.glsl', '**/*.glb', '**/*.fbx'],
});