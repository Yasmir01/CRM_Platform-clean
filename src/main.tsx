<<<<<<< HEAD
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "@/components/builder/registry";
import "@/components/builder/builder-registration";
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
=======
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initializeErrorHandling } from './utils/errorHandling';
import { cleanLocalStorage } from './utils/cleanLocalStorage';

// Initialize early runtime protections (index.html already has ultra-early prevention scripts)
initializeErrorHandling();
cleanLocalStorage();

// Static imports to ensure the app bundle is produced and not dynamically fetched at runtime
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppErrorBoundary } from '@/components/core/AppErrorBoundary';

// Deferred builder registration is important but should be safe as a static import in production
import '@/components/builder/registry';
import '@/components/builder/builder-registration';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <React.Suspense fallback={<div className="p-6">Loading…</div>}>
            <App />
          </React.Suspense>
        </QueryClientProvider>
      </AppErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed', err);
  root.render(<div style={{ padding: 24 }}>Initialization error. Check console for details.</div>);
}
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
