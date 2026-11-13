import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces
    allowedHosts: true, // Allow all tunnel domains (Cloudflare, localtunnel, localhost.run, etc.)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
