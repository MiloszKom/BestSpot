import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LocationsMap from "./components/LocationsMap";
import Account from "./components/Account";
import NotFoundPage from "./components/NotFoundPage";
import { SearchProvider } from "./components/SearchContext"; // Import the context provider

const router = createBrowserRouter([
  {
    path: "/",
    element: <LocationsMap />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/account",
    element: <Account />,
    errorElement: <NotFoundPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SearchProvider>
    <RouterProvider router={router} />
  </SearchProvider>
);
