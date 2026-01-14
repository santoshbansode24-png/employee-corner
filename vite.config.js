import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    allowedHosts: ['veeruapp.in']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
