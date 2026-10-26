import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // The sandbox exposes the dev server through a proxy host, which Vite's
    // host check rejects by default. Only these suffixes are allowed, so this
    // is not the same as disabling the check.
    allowedHosts: ['.prod-runtime.all-hands.dev', 'localhost'],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.prod-runtime.all-hands.dev', 'localhost'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
