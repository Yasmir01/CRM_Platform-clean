import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      invariant: path.resolve(__dirname, "./src/shims/invariant.ts"),
      warning: path.resolve(__dirname, "./src/shims/warning.ts"),
      lodash: 'lodash-es',
      qrcode: path.resolve(__dirname, './src/shims/qrcode.ts'),
      'dayjs/plugin/advancedFormat.js': 'dayjs/plugin/advancedFormat',
      'dayjs/plugin/localizedFormat.js': 'dayjs/plugin/localizedFormat',
      'dayjs/plugin/customParseFormat.js': 'dayjs/plugin/customParseFormat',
      'dayjs/plugin/weekOfYear.js': 'dayjs/plugin/weekOfYear',
      'dayjs/plugin/isBetween.js': 'dayjs/plugin/isBetween',
      'dayjs/plugin/isSameOrBefore.js': 'dayjs/plugin/isSameOrBefore',
      'dayjs/plugin/isSameOrAfter.js': 'dayjs/plugin/isSameOrAfter',
      'dayjs/plugin/isLeapYear.js': 'dayjs/plugin/isLeapYear',
      'dayjs/plugin/localeData.js': 'dayjs/plugin/localeData',
      'dayjs/plugin/minMax.js': 'dayjs/plugin/minMax',
      'dayjs/plugin/utc.js': 'dayjs/plugin/utc',
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "react-is",
      "prop-types",
      "hoist-non-react-statics",
      "use-sync-external-store/shim",
      "use-sync-external-store/shim/with-selector",
      "use-sync-external-store/with-selector",
      "bezier-easing",
      "react",
      "react-dom",
      "react-dom/client",
      "scheduler",
      // Ensure mispackaged ESM/CJS deps are pre-bundled to valid ESM
      "attr-accept",
      "react-dropzone",
      // MUI packages that sometimes ship mixed ESM/CJS
      "@mui/material",
      "@mui/system",
      "@mui/material/styles",
      // Dayjs core and plugins used by MUI AdapterDayjs
      "dayjs",
      "dayjs/plugin/advancedFormat",
      "dayjs/plugin/localizedFormat",
      "dayjs/plugin/customParseFormat",
      "dayjs/plugin/weekOfYear",
      "dayjs/plugin/isBetween",
      "dayjs/plugin/isLeapYear",
      // App usage
      "dayjs/plugin/isSameOrBefore",
      "dayjs/plugin/isSameOrAfter",
      "dayjs/plugin/localeData",
      "dayjs/plugin/minMax",
      "dayjs/plugin/utc",
      // CJS library interop
      "crypto-js",
      "qrcode",
      // Fix CJS default export interop for libraries used by Recharts
      "eventemitter3"
    ],
    exclude: [
      "@mui/icons-material",
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
    host: true,
    hmr: {
      overlay: false
    }
  },
  define: {
    global: 'globalThis'
  }
});
