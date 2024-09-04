import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import {
  faHeart,
  faMessage,
  faUser,
} from "@fortawesome/free-regular-svg-icons";

export default function SearchBar() {
  return (
    <div className="spots">
      <div className="spots-results">
        <div className="spots-results-handle"></div>
        <div className="spot-el">
          <div className="spot-el-name">
            Fitness Klub CityFit - Siłownia 24h Wrocław Wroclavia
          </div>
          <div className="spot-el-rating"></div>
          <div className="spot-el-adress">Sucha 1, Wrocław</div>
          <div className="spot-el-open">Open</div>
          <div className="spot-el-details">More Details</div>
        </div>
      </div>
      <div className="navigation">
        <div className="nav-element">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="icon" />
          <p>Explore</p>
        </div>
        <div className="nav-element">
          <FontAwesomeIcon icon={faHeart} className="icon" />
          <p>Favourites</p>
        </div>
        <div className="nav-element">
          <FontAwesomeIcon icon={faMessage} className="icon" />
          <p>Messages</p>
        </div>
        <div className="nav-element">
          <FontAwesomeIcon icon={faUser} className="icon" />
          <p>Profile</p>
        </div>
      </div>
    </div>
  );
}
