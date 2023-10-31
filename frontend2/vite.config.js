import { defineConfig } from 'vite';
import Aurelia from '@aurelia/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [Aurelia()],
  publicDir: 'static',
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      '@builders': resolve(__dirname, 'src/builders'),
      '@components': resolve(__dirname, 'src/components'),
      '@connections': resolve(__dirname, 'src/connections'),
      '@interfaces': resolve(__dirname, 'src/interfaces'),
      '@models': resolve(__dirname, 'src/models'),
      '@services': resolve(__dirname, 'src/services'),
      '@state': resolve(__dirname, 'src/state'),
      '@utils': resolve(__dirname, 'src/utils'),
      // Add more aliases as needed
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Define manual chunks
        manualChunks: {
          'aurelia': ['aurelia'],
          'babyloncore': ['@babylonjs/core']
        }
      }
    }
  }
  // any other Vite options
});