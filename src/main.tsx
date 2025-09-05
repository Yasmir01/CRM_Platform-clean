import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { initializeErrorHandling } from "./utils/errorHandling";
import { AppErrorBoundary } from "@/components/core/AppErrorBoundary";
import { queryClient } from "@/lib/queryClient";

// Initialize comprehensive error handling for MetaMask and other browser extension conflicts
initializeErrorHandling();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <App />
        </Suspense>
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>
);
