import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    open: true,
    allowedHosts: ['veeruapp.in'],
    proxy: {
      '/api': {
        // target: 'https://employeecorner.veeruapp.in', // Live Railway Server
        target: 'http://127.0.0.1:5001', // Local Server
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
