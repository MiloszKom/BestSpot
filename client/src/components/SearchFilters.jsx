import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { SearchContext } from "./SearchContext";
import axios from "axios";

export default function SearchFilters() {
  const { selectedSubcategory, userLng, userLat, results, setResults } =
    useContext(SearchContext);

  const handleSubmit = async () => {
    const data = {
      keyword: selectedSubcategory,
      location: `${userLat},${userLng}`,
      radius: document.getElementById("distance").value,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/search",
        data
      );

      console.log("Data received from server:", response.data.googleData);

      setResults(response.data.googleData.results);
    } catch (error) {
      console.error("Error sending data to the server:", error);
    }
  };

  return (
    <div className="search-filters">
      <div className="filter-header">
        <Link to="/">
          <i className="fa-solid fa-angle-left"></i>
        </Link>
        <p>Clear Filters</p>
      </div>
      <h2>Filters</h2>
      <div className="category">
        <p>Category</p>
        <Link to="category">
          <div className="category-box">
            <p>{selectedSubcategory}</p>{" "}
            <i className="fa-solid fa-angle-right"></i>
          </div>
        </Link>
      </div>

      <div className="category">
        <p>Location</p>
        <Link to="">
          <div className="category-box">
            {/* To do: add the option to pick the location from the map */}
            <p>Current Location</p>
            <i className="fa-solid fa-angle-right"></i>
          </div>
        </Link>
      </div>

      <div className="category">
        <p>Distance</p>
        <input type="number" id="distance" defaultValue={500} />
      </div>

      <button onClick={handleSubmit}>Search Spots</button>
    </div>
  );
}
