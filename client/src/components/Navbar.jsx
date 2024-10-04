import React from "react";
// import {useContext} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";
// import { AuthContext } from "./AuthContext";

import {
  faHeart,
  faMessage,
  faUser,
} from "@fortawesome/free-regular-svg-icons";

export default function Navbar() {
  // const auth = useContext(AuthContext);

  // Add Log in nav element instead of accout when not logged in
  // Also change the style of the messages and favourites icons when not logged in,
  // since they are not accessible and will redirect you to log in element

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
          <Link to="/account">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <p>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
