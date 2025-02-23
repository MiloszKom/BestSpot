import React from "react";
import { Link } from "react-router-dom";

export default function Discover() {
  return (
    <div className="discover-container">
      <div className="discover-header">Discover</div>
      <div className="discover-body">
        <Link to="area-search" className="discover-el">
          <div className="discover-el-title">Area Search</div>
          <div className="discover-el-description">
            Find the best spots near you! Search by location, category and
            radius to match your preferences.
          </div>
        </Link>

        <Link to="spotlists-hub" className="discover-el">
          <div className="discover-el-title">Spotlists Hub</div>
          <div className="discover-el-description">
            Discover curated collections of amazing places shared by the
            community.
          </div>
        </Link>

        <Link to="spot-liblary" className="discover-el">
          <div className="discover-el-title">Spot Liblary</div>
          <div className="discover-el-description">
            Browse places created by users and explore hidden gems in different
            areas.
          </div>
        </Link>
      </div>
    </div>
  );
}
