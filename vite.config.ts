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
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }

          // React Router
          if (id.includes('react-router')) {
            return 'router';
          }

          // MUI Core (smaller chunks)
          if (id.includes('@mui/material')) {
            return 'mui-core';
          }

          // MUI Icons (separate chunk)
          if (id.includes('@mui/icons-material')) {
            return 'mui-icons';
          }

          // MUI Data components (heavy)
          if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-date-pickers')) {
            return 'mui-data';
          }

          // MUI Charts (heavy)
          if (id.includes('@mui/x-charts') || id.includes('recharts')) {
            return 'charts';
          }

          // Emotion/Styled components
          if (id.includes('@emotion') || id.includes('styled')) {
            return 'styling';
          }

          // Utilities and smaller libraries
          if (id.includes('dayjs') || id.includes('crypto-js') || id.includes('react-dropzone')) {
            return 'utils';
          }

          // CRM Pages (group by functionality)
          if (id.includes('/crm/pages/') && (
            id.includes('Properties') ||
            id.includes('Tenants') ||
            id.includes('PropertyManagers')
          )) {
            return 'crm-property';
          }

          if (id.includes('/crm/pages/') && (
            id.includes('Reports') ||
            id.includes('Analytics') ||
            id.includes('Charts')
          )) {
            return 'crm-analytics';
          }

          if (id.includes('/crm/pages/') && (
            id.includes('Communications') ||
            id.includes('EmailMarketing') ||
            id.includes('SmsMarketing')
          )) {
            return 'crm-marketing';
          }

          if (id.includes('/crm/pages/') && (
            id.includes('WorkOrders') ||
            id.includes('ServiceProviders') ||
            id.includes('Tasks')
          )) {
            return 'crm-operations';
          }

          // Core CRM components
          if (id.includes('/crm/components/')) {
            return 'crm-components';
          }

          // Contexts and services
          if (id.includes('/crm/contexts/') || id.includes('/crm/services/')) {
            return 'crm-core';
          }

          // Node modules that aren't specifically handled
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'react-router-dom'
    ]
  }
});
