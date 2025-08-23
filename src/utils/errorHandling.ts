// Global error handling for preventing MetaMask connection errors in non-Web3 applications

export const initializeErrorHandling = () => {
  // Log initialization for debugging
  console.info('[CRM] Initializing enhanced MetaMask error handling...');

  // Handle unhandled promise rejections (like MetaMask connection failures)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || '';
    const errorStack = error?.stack || '';

    // Log all unhandled rejections in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug('[CRM] Unhandled rejection detected:', {
        message: errorMessage.substring(0, 100),
        hasStack: !!errorStack,
        stackPreview: errorStack.substring(0, 100)
      });
    }

    // Enhanced MetaMask error detection patterns
    const isMetaMaskError = (
      // Exact pattern for the reported error
      errorMessage === 's: Failed to connect to MetaMask' ||
      errorMessage === 'Failed to connect to MetaMask' ||
      // Direct MetaMask references (including prefixed variants)
      errorMessage.includes('Failed to connect to MetaMask') ||
      errorMessage.includes('MetaMask') ||
      errorMessage.includes('metamask') ||
      /^s:\s*Failed to connect to MetaMask/i.test(errorMessage) || // Exact "s: Failed to connect to MetaMask"
      /^[a-z]:\s*.*Failed to connect to MetaMask/i.test(errorMessage) || // Any "x: Failed to connect to MetaMask"
      /^[a-z]:\s*.*MetaMask/i.test(errorMessage) || // Any "x: ...MetaMask" pattern
      // Web3/Ethereum references
      errorMessage.includes('ethereum') ||
      errorMessage.includes('web3') ||
      errorMessage.includes('wallet') ||
      // Chrome extension references (check both message and stack)
      errorMessage.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      errorStack.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      errorStack.includes('/scripts/inpage.js') ||
      errorStack.includes('/scripts/contentscript.js') ||
      errorStack.includes('Object.connect') ||
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
      errorMessage.includes('eth_') ||
      // Additional MetaMask specific patterns
      (errorMessage.includes('connect') && errorMessage.includes('wallet')) ||
      (errorMessage.includes('Object.connect') && errorStack.includes('chrome-extension')) ||
      // Catch any error from MetaMask extension files
      errorStack.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
    );

    if (isMetaMaskError) {
      // Prevent the unhandled rejection from showing in console
      event.preventDefault();

      // Optionally log a friendlier message for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CRM System] Web3/MetaMask extension activity suppressed - not needed for this application.');
        console.debug('Suppressed error pattern:', errorMessage.substring(0, 100));
      }
      return;
    }

    // Debug logging for potential missed MetaMask errors
    if (process.env.NODE_ENV === 'development') {
      if (errorMessage.toLowerCase().includes('connect') ||
          errorMessage.toLowerCase().includes('metamask') ||
          errorStack.includes('chrome-extension')) {
        console.warn('[CRM System] Potential unhandled MetaMask error:', errorMessage.substring(0, 100));
      }
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

  // Ultimate MetaMask provider disabling
  const disableMetaMaskProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      console.info('[CRM] Disabling MetaMask provider to prevent connection attempts');
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

        // Override ALL methods that could trigger connections
        const originalRequest = window.ethereum.request;
        if (originalRequest) {
          window.ethereum.request = async (args: any) => {
            console.warn('[CRM] Blocked MetaMask request:', args.method);
            // Block ALL wallet connection requests
            if (args.method === 'eth_requestAccounts' ||
                args.method === 'wallet_requestPermissions' ||
                args.method === 'eth_accounts' ||
                args.method === 'wallet_enable' ||
                args.method === 'eth_enable' ||
                args.method.startsWith('eth_') ||
                args.method.startsWith('wallet_')) {
              const error = new Error('Wallet connection disabled for this application');
              error.code = 4100; // Use MetaMask error code
              throw error;
            }
            return originalRequest.call(window.ethereum, args);
          };
        }

        // Override connect method if it exists
        if (window.ethereum.connect) {
          window.ethereum.connect = async () => {
            console.warn('[CRM] Blocked MetaMask connect() call');
            const error = new Error('Wallet connection disabled for this application');
            error.code = 4100;
            throw error;
          };
        }

        // Disable enable method if it exists
        if (window.ethereum.enable) {
          window.ethereum.enable = async () => {
            console.warn('[CRM] Blocked MetaMask enable() call');
            const error = new Error('Wallet connection disabled for this application');
            error.code = 4100;
            throw error;
          };
        }

      } catch (error) {
        console.debug('[CRM] Error while disabling MetaMask provider:', error);
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
      console.warn('[CRM] MetaMask provider injection detected and will be disabled');
      ethProvider = value;
      if (value) {
        // Small delay to allow the provider to initialize before disabling
        setTimeout(disableMetaMaskProvider, 0);
      }
    },
    configurable: true
  });

  // Proactive Promise monitoring to catch MetaMask connection attempts
  const originalPromiseConstructor = Promise;
  const originalThen = Promise.prototype.then;
  const originalCatch = Promise.prototype.catch;

  Promise.prototype.then = function(onFulfilled, onRejected) {
    const wrappedRejected = onRejected ? function(reason: any) {
      // Check if this is a MetaMask error we should handle
      const message = (reason && (reason.message || reason.toString())) || '';
      if (typeof message === 'string' && (
        message.includes('Failed to connect to MetaMask') ||
        message.includes('MetaMask') ||
        message.match(/^s:\s*Failed to connect to MetaMask/i)
      )) {
        console.warn('[CRM] Intercepted MetaMask promise rejection:', message.substring(0, 80));
        return Promise.resolve(); // Convert rejection to resolution
      }
      return onRejected ? onRejected(reason) : Promise.reject(reason);
    } : undefined;

    return originalThen.call(this, onFulfilled, wrappedRejected);
  };

  Promise.prototype.catch = function(onRejected) {
    const wrappedRejected = function(reason: any) {
      const message = (reason && (reason.message || reason.toString())) || '';
      if (typeof message === 'string' && (
        message.includes('Failed to connect to MetaMask') ||
        message.includes('MetaMask') ||
        message.match(/^s:\s*Failed to connect to MetaMask/i)
      )) {
        console.warn('[CRM] Intercepted MetaMask promise catch:', message.substring(0, 80));
        return Promise.resolve(); // Convert rejection to resolution
      }
      return onRejected ? onRejected(reason) : Promise.reject(reason);
    };

    return originalCatch.call(this, wrappedRejected);
  };
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
      _metamask?: {
        isUnlocked?: () => Promise<boolean>;
        isConnected?: () => boolean;
      };
    };
  }
}
