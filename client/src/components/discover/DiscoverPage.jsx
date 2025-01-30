import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function Discover() {
  return (
    <div className="discover-container">
      <div className="discover-header">Discover</div>
      <div className="discover-body">
        <Link to="add-spot" className="discover-el">
          <FontAwesomeIcon icon={faPlus} />
          <div className="info">
            <div className="discover-el-title">Add a spot</div>
            <div className="discover-el-description">Description</div>
          </div>
          <FontAwesomeIcon className="arrow" icon={faChevronRight} />
        </Link>

        <Link to="area-search" className="discover-el">
          <FontAwesomeIcon icon={faCircleDot} />
          <div className="info">
            <div className="discover-el-title">Area Search</div>
            <div className="discover-el-description">
              Find the best spots near you! Search by location, category and
              radius to match your preferences.
            </div>
          </div>
          <FontAwesomeIcon className="arrow" icon={faChevronRight} />
        </Link>

        <Link to="spotlists-hub" className="discover-el">
          <FontAwesomeIcon icon={faCircleDot} />
          <div className="info">
            <div className="discover-el-title">Spotlists Hub</div>
            <div className="discover-el-description">
              Discover curated collections of amazing places shared by the
              community.
            </div>
          </div>
          <FontAwesomeIcon className="arrow" icon={faChevronRight} />
        </Link>
      </div>
    </div>
  );
}
