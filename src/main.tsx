import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initializeErrorHandling } from './utils/errorHandling';
import { cleanLocalStorage } from './utils/cleanLocalStorage';

// Initialize comprehensive error handling for MetaMask and other browser extension conflicts
initializeErrorHandling();
// Sanitize localStorage on app start to avoid accidental non-JSON values (e.g. pasted module text)
cleanLocalStorage();

(async () => {
  try {
    // Defer heavy imports until after localStorage sanitization to prevent JSON.parse of accidental code snippets
    const AppMod = await import('./App.tsx');
    const AppComponent = (AppMod && (AppMod.default || AppMod.App)) || AppMod;

    const { QueryClientProvider } = await import('@tanstack/react-query');
    const qcMod = await import('@/lib/queryClient');
    const queryClient = qcMod && (qcMod.queryClient || qcMod.default || qcMod);

    const AppErrMod = await import('@/components/core/AppErrorBoundary');
    const AppErrorBoundary = (AppErrMod && (AppErrMod.AppErrorBoundary || AppErrMod.default)) || ((props: any) => props.children);

    // Defer builder registration imports after sanitation as before
    try {
      await import('@/components/builder/registry');
      await import('@/components/builder/builder-registration');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Deferred builder registration failed', e);
    }

    const root = createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <React.Suspense fallback={<div className="p-6">Loading…</div>}>
              {AppComponent ? <AppComponent /> : <div className="p-6">App not available</div>}
            </React.Suspense>
          </QueryClientProvider>
        </AppErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    // If dynamic bootstrap fails, fallback to simple render to avoid blank screen
    // eslint-disable-next-line no-console
    console.error('Bootstrap failed', err);
    const root = createRoot(document.getElementById('root')!);
    root.render(<div style={{ padding: 24 }}>Initialization error. Check console for details.</div>);
  }
})();
