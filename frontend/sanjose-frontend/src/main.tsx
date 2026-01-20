import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
// ← NO importes HashRouter acá

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider> {/* ← SIN HashRouter */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
