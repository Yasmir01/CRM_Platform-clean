import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initializeErrorHandling } from "./utils/errorHandling";

// Initialize comprehensive error handling for MetaMask and other browser extension conflicts
initializeErrorHandling();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
