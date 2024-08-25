import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import SearchFilters from "./components/SearchFilters";
import NotFoundPage from "./components/NotFoundPage";
import Categories from "./components/Categories";
import Subcategories from "./components/Subcategories";
import { SearchProvider } from "./components/SearchContext"; // Import the context provider

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/search",
    element: <SearchFilters />,
  },
  {
    path: "/search/category",
    element: <Categories />,
  },
  {
    path: "/search/category/:categoryId",
    element: <Subcategories />,
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
