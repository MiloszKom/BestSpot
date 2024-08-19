import React from "react";

export default function Header() {
  const handleSearchClick = () => {
    console.log("yay");
  };

  return (
    <div className="planner-form">
      <h2>Best Spot</h2>
      <div className="search-bar">
        <input className="search-bar-city" placeholder="City" />
        <input className="search-bar-place" placeholder="Place" />
        <div className="search-bar-search" onClick={handleSearchClick}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
      </div>
    </div>
  );
}
