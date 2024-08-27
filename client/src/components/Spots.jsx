import React from "react";

export default function SearchBar() {
  return (
    <div className="spots">
      <div className="spots-results">
        <div className="spots-results-handle"></div>
        <div className="spot-el">
          <div className="spot-el-name">
            Fitness Klub CityFit - Siłownia 24h Wrocław Wroclavia
          </div>
          <div className="spot-el-rating">
            <i class="fa-solid fa-star"></i>4.6(1650)
          </div>
          <div className="spot-el-adress">Sucha 1, Wrocław</div>
          <div className="spot-el-open">Open</div>
          <div className="spot-el-details">More Details</div>
        </div>
      </div>
      <div className="navigation">
        <div className="nav-element">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Explore</p>
        </div>
        <div className="nav-element">
          <i class="fa-regular fa-heart"></i>
          <p>Favourites</p>
        </div>
        <div className="nav-element">
          <i class="fa-regular fa-message"></i>
          <p>Messages</p>
        </div>
        <div className="nav-element">
          <i class="fa-regular fa-user"></i>
          <p>Profile</p>
        </div>
      </div>
    </div>
  );
}
