import React, { useContext } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { subcategoriesMap } from "./miniDatabase";
import { SearchContext } from "./SearchContext"; // Import the context

export default function Subcategories() {
  const { setSelectedSubcategory } = useContext(SearchContext); // Destructure the context to get the setter
  const params = useParams();
  const categoryId = params.categoryId;
  const subcategories = subcategoriesMap[categoryId];
  const navigate = useNavigate();

  // If subcategories is undefined or an empty array, navigate to the error page
  if (!subcategories || subcategories.length === 0) {
    return <Navigate to="/error" replace />;
  }

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory); // Update the selected subcategory in context
    navigate("/search"); // Navigate to the SearchFilters component
  };

  return (
    <div className="subcategories">
      <Link to="/search/category">
        <i className="fa-solid fa-angle-left"></i>
      </Link>
      <h2>Choose Category</h2>
      <div className="subcategory-name">
        <p>{params.categoryId}</p>
      </div>
      <h3>Subcategories</h3>
      {subcategories.map((subcategory, index) => (
        <div
          key={index}
          className="subcategory"
          onClick={() => handleSubcategoryClick(subcategory)}
        >
          <p>{subcategory}</p>
        </div>
      ))}
    </div>
  );
}
