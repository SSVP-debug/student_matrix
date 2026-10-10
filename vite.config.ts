import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Builds an explicit asset manifest so lazy-loaded app routes can open offline
// after the initial online load. API endpoints are excluded from caching.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST',
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,json,woff2,png,jpg,jpeg,webp}'],
        globIgnores: ['api/**'],
      },
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
    }),
  ],
  optimizeDeps: { exclude: ['lucide-react'] },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] } },
    },
  },
});
