import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LangProvider } from "./contexts/LangContext";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import QuotaUpgradeModalHost from "./components/student/QuotaUpgradeModalHost";
import { BrandRuntimeAssets } from "./components/BrandLogo";
import "./index.css";
import "./i18n/i18n";

try {
  sessionStorage.removeItem("yu_chunk_reload");
} catch {
  // ignore
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalErrorBoundary>
            <BrandRuntimeAssets />
            <App />
          </GlobalErrorBoundary>
          <QuotaUpgradeModalHost />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "10px",
                fontSize: "13px",
              },
            }}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </LangProvider>
  </React.StrictMode>
);
