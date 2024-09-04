import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LocationsMap from "./components/LocationsMap";
import SearchFilters from "./components/SearchFilters";
import NotFoundPage from "./components/NotFoundPage";
import { SearchProvider } from "./components/SearchContext"; // Import the context provider

const router = createBrowserRouter([
  {
    path: "/",
    element: <LocationsMap />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/search",
    element: <SearchFilters />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
  </React.StrictMode>
);
