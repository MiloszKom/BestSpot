import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SearchFilters from "./components/SearchFilters";
import Categories from "./components/Categories";
import Subcategories from "./components/Subcategories";
import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchFilters />} />
        <Route path="/search/category" element={<Categories />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
