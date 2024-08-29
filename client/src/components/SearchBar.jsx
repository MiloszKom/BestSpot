import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="search-bar">
      <h3>BestSpot</h3>
      <Link to={"/search"}>
        <div className="search-bar-text">
          Search Here <i class="fa-solid fa-magnifying-glass"></i>
        </div>
      </Link>
    </div>
  );
}
