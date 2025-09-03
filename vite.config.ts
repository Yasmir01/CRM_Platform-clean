import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      invariant: path.resolve(__dirname, "./src/shims/invariant.ts"),
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
      // Dayjs core and plugins used by MUI AdapterDayjs
      "dayjs",
      "dayjs/plugin/advancedFormat.js",
      "dayjs/plugin/localizedFormat.js",
      "dayjs/plugin/customParseFormat.js",
      "dayjs/plugin/weekOfYear.js",
      "dayjs/plugin/isBetween.js",
      // App usage
      "dayjs/plugin/isSameOrBefore.js",
      // CJS library interop
      "crypto-js",
      "invariant"
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
    host: true
  },
  define: {
    global: 'globalThis'
  }
});
