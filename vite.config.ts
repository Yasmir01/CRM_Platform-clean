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
      // CJS library interop
      "crypto-js"
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
