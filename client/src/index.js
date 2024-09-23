import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; // Import the App component
import { SearchProvider } from "./components/SearchContext"; // Import the context provider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SearchProvider>
    <App /> {/* Render the App component with the router */}
  </SearchProvider>
);
