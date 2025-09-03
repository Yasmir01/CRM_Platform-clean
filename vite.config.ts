import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: ["react-is"],
    exclude: [
      "@mui/material",
      "@mui/system",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/x-charts"
    ],
    force: true,
  },
  build: {
    target: 'es2015',
    minify: 'terser'
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis'
  }
});
