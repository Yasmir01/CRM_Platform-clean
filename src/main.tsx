import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initializeErrorHandling } from "./utils/errorHandling";
import { AppErrorBoundary } from "@/components/core/AppErrorBoundary";

// Initialize comprehensive error handling for MetaMask and other browser extension conflicts
initializeErrorHandling();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <App />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>
);
