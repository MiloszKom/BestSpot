import React from "react";
import { Link } from "react-router-dom";

export default function SearchBar() {
  return (
    <div className="map-search">
      <div className="map-search-icon">
        <i className="fa-solid fa-location-dot"></i>
      </div>
      <div className="map-search-bar">
        <Link to="/search">
          <h3>Click here to see search options</h3>
        </Link>
      </div>
    </div>
  );
}
