// Global error handling for preventing MetaMask connection errors in non-Web3 applications

export const initializeErrorHandling = () => {
  // Handle unhandled promise rejections (like MetaMask connection failures)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || '';

    // Check if this is a MetaMask-related error
    if (
      errorMessage.includes('Failed to connect to MetaMask') ||
      errorMessage.includes('MetaMask') ||
      errorMessage.includes('ethereum') ||
      event.reason?.code === 4001 || // User rejected request
      event.reason?.code === -32002 || // Request pending
      errorMessage.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')
    ) {
      // Prevent the unhandled rejection from showing in console
      event.preventDefault();
      
      // Optionally log a friendlier message for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CRM System] MetaMask extension detected but not needed for this application.');
      }
      return;
    }

    // Allow other unhandled rejections to proceed normally
  });

  // Handle general errors
  window.addEventListener('error', (event: ErrorEvent) => {
    const errorMessage = event.message || '';
    
    if (
      errorMessage.includes('MetaMask') ||
      errorMessage.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      event.filename?.includes('chrome-extension')
    ) {
      // Prevent MetaMask extension errors from cluttering console
      event.preventDefault();
      return;
    }
  });

  // Disable MetaMask provider if present (since this app doesn't use Web3)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Disable auto-refresh and auto-connection features
      window.ethereum.autoRefreshOnNetworkChange = false;
      
      // Remove event listeners that might trigger connection attempts
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }
    } catch (error) {
      // Silently ignore any errors when disabling MetaMask features
    }
  }
};

// Type declaration for TypeScript
declare global {
  interface Window {
    ethereum?: {
      autoRefreshOnNetworkChange?: boolean;
      removeAllListeners?: () => void;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
