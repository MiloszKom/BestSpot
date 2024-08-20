import React from "react";

export default function Planner() {
  return (
    <div className="map-search">
      <div className="map-search-icon">
        <i class="fa-solid fa-location-dot"></i>
      </div>
      <div className="map-search-bar">
        <input
          className="map-search-bar-input"
          placeholder="Search here"
        ></input>
      </div>
      <div className="map-search-bar-glass">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>
  );
}
