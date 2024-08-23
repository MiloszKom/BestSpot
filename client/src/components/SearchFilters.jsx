import React from "react";
import { Link } from "react-router-dom";

export default function SearchFilters() {
  return (
    <div className="search-filters">
      <div className="filter-header">
        <Link to="/">
          <i class="fa-solid fa-angle-left"></i>
        </Link>
        <p>Clear Filters</p>
      </div>
      <h2>Filters</h2>
      <div className="category">
        <p>Category</p>
        <Link to="/search/category">
          <div className="category-box">
            <p>Choose</p>

            <i class="fa-solid fa-angle-right"></i>
          </div>
        </Link>
      </div>
    </div>
  );
}
