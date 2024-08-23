import React from "react";
import { Link } from "react-router-dom";

export default function Categories() {
  return (
    <div className="main-categories">
      <div className="filter-header">
        <Link to="/search">
          <i class="fa-solid fa-angle-left"></i>
        </Link>
        <p>Clear Filters</p>
      </div>
      <h2>Choose Category</h2>
      <div className="main-category">
        <p>Food</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Sport</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Services</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Entertaiment</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Health and Wellness</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Lodging</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
      <div className="main-category">
        <p>Shopping</p>
        <i class="fa-solid fa-angle-right"></i>
      </div>
    </div>
  );
}
