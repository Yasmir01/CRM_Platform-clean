import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Console error and warning handling - removed DOM nesting suppression
// since we've fixed the actual DOM nesting issues

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
