import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Prevent MetaMask auto-detection errors
if (typeof window !== 'undefined') {
  // Disable MetaMask auto-detection to prevent connection errors
  window.addEventListener('load', () => {
    if (window.ethereum) {
      // Prevent automatic connection attempts
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
  });

  // Suppress MetaMask connection errors since this app doesn't use Web3
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('MetaMask') || message.includes('Failed to connect to MetaMask')) {
      // Silently ignore MetaMask connection errors for non-Web3 apps
      return;
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
