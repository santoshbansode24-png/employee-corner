// vite.config.js
import { defineConfig } from "file:///C:/xampp/htdocs/EMPLOYEE%20CORNER%201.0/node_modules/vite/dist/node/index.js";
import react from "file:///C:/xampp/htdocs/EMPLOYEE%20CORNER%201.0/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/xampp/htdocs/EMPLOYEE%20CORNER%201.0/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3e3,
    open: true,
    allowedHosts: ["veeruapp.in"],
    proxy: {
      "/api": {
        // target: 'https://employeecorner.veeruapp.in', // Live Railway Server
        target: "http://127.0.0.1:5001",
        // Local Server
        changeOrigin: true,
        secure: false
      },
      "/reimbursement-gen": {
        // target: 'https://employeecorner.veeruapp.in', // Live Railway Server
        target: "http://127.0.0.1:8501",
        // Local Streamlit
        changeOrigin: true,
        secure: false,
        ws: true
        // Enable WebSocket support for Streamlit
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx4YW1wcFxcXFxodGRvY3NcXFxcRU1QTE9ZRUUgQ09STkVSIDEuMFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxceGFtcHBcXFxcaHRkb2NzXFxcXEVNUExPWUVFIENPUk5FUiAxLjBcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L3hhbXBwL2h0ZG9jcy9FTVBMT1lFRSUyMENPUk5FUiUyMDEuMC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLycsXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRhaWx3aW5kY3NzKCldLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBvcGVuOiB0cnVlLFxyXG4gICAgYWxsb3dlZEhvc3RzOiBbJ3ZlZXJ1YXBwLmluJ10sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICAvLyB0YXJnZXQ6ICdodHRwczovL2VtcGxveWVlY29ybmVyLnZlZXJ1YXBwLmluJywgLy8gTGl2ZSBSYWlsd2F5IFNlcnZlclxyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6NTAwMScsIC8vIExvY2FsIFNlcnZlclxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgIH0sXHJcbiAgICAgICcvcmVpbWJ1cnNlbWVudC1nZW4nOiB7XHJcbiAgICAgICAgLy8gdGFyZ2V0OiAnaHR0cHM6Ly9lbXBsb3llZWNvcm5lci52ZWVydWFwcC5pbicsIC8vIExpdmUgUmFpbHdheSBTZXJ2ZXJcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjg1MDEnLCAvLyBMb2NhbCBTdHJlYW1saXRcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB3czogdHJ1ZSwgLy8gRW5hYmxlIFdlYlNvY2tldCBzdXBwb3J0IGZvciBTdHJlYW1saXRcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgc291cmNlbWFwOiB0cnVlXHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLFNBQVMsb0JBQW9CO0FBQ3BVLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQ2hDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLGNBQWMsQ0FBQyxhQUFhO0FBQUEsSUFDNUIsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBO0FBQUEsUUFFTixRQUFRO0FBQUE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxzQkFBc0I7QUFBQTtBQUFBLFFBRXBCLFFBQVE7QUFBQTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBO0FBQUEsTUFDTjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
