import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'site/src/assets/js/bravo-bundle.js'),
      name: 'Bravo',
      fileName: (format) => `bravo.bundle.${format}.js`,
      formats: ['umd']
    },
    outDir: 'site/static/docs/5.3/dist/js',
    emptyOutDir: false,
    rollupOptions: {
      external: [],  // Bundle everything including Bootstrap
      output: {
        globals: {
          // If we decide to externalize anything later
        },
        // Ensure Bootstrap components are available globally
        intro: 'var bootstrap = window.bootstrap || {};',
        outro: 'window.bootstrap = Bravo;'
      }
    },
    minify: false,  // For development, we'll keep it unminified
    sourcemap: true
  },
  resolve: {
    alias: {
      'bootstrap': resolve(__dirname, 'node_modules/bootstrap')
    }
  }
});