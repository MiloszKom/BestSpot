import React from "react";

export default function Subcategories() {
  return (
    <div className="subcategories">
      <i class="fa-solid fa-angle-left"></i>
      <h2>Choose Category</h2>
      <div className="subcategory-name">
        <p>Food</p>
      </div>
      <h3>Subcategories</h3>
      <div className="subcategory">
        <p>American Restaurant</p>
      </div>
      <div className="subcategory">
        <p>Brazilian Restaurant</p>
      </div>
      <div className="subcategory">
        <p>Chinese Restaurant</p>
      </div>
      <div className="subcategory">
        <p>Fast Food Restaurant</p>
      </div>
    </div>
  );
}
