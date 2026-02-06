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
      },
      '/reimbursement-gen': {
        // target: 'https://employeecorner.veeruapp.in', // Live Railway Server
        target: 'http://127.0.0.1:8501', // Local Streamlit
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket support for Streamlit
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
