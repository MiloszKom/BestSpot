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
