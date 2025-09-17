import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { initializeErrorHandling } from "./utils/errorHandling";
import { AppErrorBoundary } from "@/components/core/AppErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import { cleanLocalStorage } from "./utils/cleanLocalStorage";

// Initialize comprehensive error handling for MetaMask and other browser extension conflicts
initializeErrorHandling();
// Sanitize localStorage on app start to avoid accidental non-JSON values (e.g. pasted module text)
cleanLocalStorage();

// Defer builder registration imports until after localStorage has been sanitized to avoid
// modules reading/parsing localStorage at import time and causing JSON errors.
(async () => {
  try {
    await import('@/components/builder/registry');
    await import('@/components/builder/builder-registration');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Deferred builder registration failed', e);
  }
})();

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
