import React from "react";
import { Link } from "react-router-dom";

export default function Categories() {
  const categories = [
    "Food",
    "Sport",
    "Services",
    "Entertaiment",
    "Health and Wellnes",
    "Lodging",
    "Shopping",
    "Education",
  ];
  return (
    <div className="main-categories">
      <div className="filter-header">
        <Link to="/search">
          <i class="fa-solid fa-angle-left"></i>
        </Link>
        <p>Clear Filters</p>
      </div>
      <h2>Choose Category</h2>
      {categories.map((category) => (
        <Link key={category} to={`/search/category/${category.toLowerCase()}`}>
          <div className="main-category">
            <p>{category}</p>
            <i class="fa-solid fa-angle-right"></i>
          </div>
        </Link>
      ))}
    </div>
  );
}
