// Global error handling for preventing MetaMask connection errors in non-Web3 applications

export const initializeErrorHandling = () => {
  // Handle unhandled promise rejections (like MetaMask connection failures)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || '';
    const errorStack = error?.stack || '';

    // Enhanced MetaMask error detection patterns
    const isMetaMaskError = (
      // Direct MetaMask references
      errorMessage.includes('Failed to connect to MetaMask') ||
      errorMessage.includes('MetaMask') ||
      errorMessage.includes('metamask') ||
      // Web3/Ethereum references
      errorMessage.includes('ethereum') ||
      errorMessage.includes('web3') ||
      errorMessage.includes('wallet') ||
      // Chrome extension references
      errorMessage.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      errorStack.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      errorStack.includes('/scripts/inpage.js') ||
      // Error codes
      event.reason?.code === 4001 || // User rejected request
      event.reason?.code === -32002 || // Request pending
      event.reason?.code === -32603 || // Internal error
      event.reason?.code === 4100 || // Unauthorized
      event.reason?.code === 4200 || // Unsupported method
      event.reason?.code === 4900 || // Disconnected
      event.reason?.code === 4901 || // Chain disconnected
      // Generic wallet connection errors
      errorMessage.includes('provider') ||
      errorMessage.includes('injected') ||
      errorMessage.includes('wallet_') ||
      errorMessage.includes('eth_')
    );

    if (isMetaMaskError) {
      // Prevent the unhandled rejection from showing in console
      event.preventDefault();

      // Optionally log a friendlier message for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CRM System] Web3/MetaMask extension activity suppressed - not needed for this application.');
      }
      return;
    }

    // Allow other unhandled rejections to proceed normally
  });

  // Handle general errors
  window.addEventListener('error', (event: ErrorEvent) => {
    const errorMessage = event.message || '';
    const filename = event.filename || '';

    // Enhanced error detection for Web3/MetaMask related errors
    if (
      errorMessage.includes('MetaMask') ||
      errorMessage.includes('metamask') ||
      errorMessage.includes('ethereum') ||
      errorMessage.includes('web3') ||
      errorMessage.includes('wallet') ||
      errorMessage.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      filename.includes('chrome-extension') ||
      filename.includes('inpage.js') ||
      filename.includes('content-script') ||
      errorMessage.includes('provider') ||
      errorMessage.includes('injected')
    ) {
      // Prevent MetaMask extension errors from cluttering console
      event.preventDefault();
      return;
    }
  });

  // Enhanced MetaMask provider disabling
  const disableMetaMaskProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Disable auto-refresh and auto-connection features
        window.ethereum.autoRefreshOnNetworkChange = false;

        // Remove event listeners that might trigger connection attempts
        if (window.ethereum.removeAllListeners) {
          window.ethereum.removeAllListeners();
        }

        // Disable additional MetaMask features
        if (window.ethereum._metamask) {
          window.ethereum._metamask.isUnlocked = () => Promise.resolve(false);
          window.ethereum._metamask.isConnected = () => false;
        }

        // Override request method to prevent connection attempts
        const originalRequest = window.ethereum.request;
        if (originalRequest) {
          window.ethereum.request = async (args: any) => {
            // Block wallet connection requests
            if (args.method === 'eth_requestAccounts' ||
                args.method === 'wallet_requestPermissions' ||
                args.method === 'eth_accounts') {
              throw new Error('Wallet connection disabled for this application');
            }
            return originalRequest.call(window.ethereum, args);
          };
        }

      } catch (error) {
        // Silently ignore any errors when disabling MetaMask features
      }
    }
  };

  // Disable immediately if present
  disableMetaMaskProvider();

  // Also disable when window.ethereum is set later
  let ethProvider: any = null;
  Object.defineProperty(window, 'ethereum', {
    get: () => ethProvider,
    set: (value) => {
      ethProvider = value;
      if (value) {
        // Small delay to allow the provider to initialize before disabling
        setTimeout(disableMetaMaskProvider, 0);
      }
    },
    configurable: true
  });
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
