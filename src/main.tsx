// src/main.tsx
import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Runtime protections
import { initializeErrorHandling } from "./utils/errorHandling";
import { cleanLocalStorage } from "./utils/cleanLocalStorage";

// Query + Error Boundary
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppErrorBoundary } from "@/components/core/AppErrorBoundary";

// Builder.io registration
import "@/components/builder/registry";
import "@/components/builder/builder-registration";

// Main App
import App from "./App";

// Initialize protections
initializeErrorHandling();
cleanLocalStorage();

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

try {
  root.render(
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
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Bootstrap failed", err);
  root.render(
    <div style={{ padding: 24 }}>
      Initialization error. Check console for details.
    </div>
  );
}
