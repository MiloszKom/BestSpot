import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar() {
  const handleClick = () => {
    const searchFilters = document.querySelector(".search-filters");
    searchFilters.style.opacity = "1";
    searchFilters.style.transform = "translateY(0%)";
  };

  return (
    <div className="search-bar">
      <h3>BestSpot</h3>
      <div className="search-bar-text" onClick={handleClick}>
        Search Here
        <FontAwesomeIcon icon={faMagnifyingGlass} className="icon" />
      </div>
    </div>
  );
}
