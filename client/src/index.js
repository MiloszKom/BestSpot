import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthContextProvider } from "./components/context/AuthContext";
import { SocketContextProvider } from "./components/context/SocketContext";
import { AlertContextProvider } from "./components/context/AlertContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AlertContextProvider>
    <AuthContextProvider>
      <SocketContextProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </SocketContextProvider>
    </AuthContextProvider>
  </AlertContextProvider>
);
