import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppToaster } from "./components/app-toaster";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./features/auth/auth-context";
import { AppRouter } from "./router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppToaster />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
