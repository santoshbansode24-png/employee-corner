import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    allowedHosts: ['veeruapp.in'],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/reimbursement-gen': {
        target: 'http://localhost:8501',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket support for Streamlit
        rewrite: (path) => path.replace(/^\/reimbursement-gen/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
