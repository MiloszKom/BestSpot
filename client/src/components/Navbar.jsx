import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

import {
  faHeart,
  faMessage,
  faUser,
} from "@fortawesome/free-regular-svg-icons";

export default function Navbar() {
  return (
    <div className="spots">
      <div className="navigation">
        <div className="nav-element">
          <Link to="/search">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="icon" />
            <p>Explore</p>
          </Link>
        </div>
        <div className="nav-element">
          <Link to="/">
            <FontAwesomeIcon icon={faHeart} className="icon" />
            <p>Favourites</p>
          </Link>
        </div>
        <div className="nav-element">
          <Link to="/">
            <FontAwesomeIcon icon={faMessage} className="icon" />
            <p>Messages</p>
          </Link>
        </div>
        <div className="nav-element">
          <Link to="/login">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <p>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
