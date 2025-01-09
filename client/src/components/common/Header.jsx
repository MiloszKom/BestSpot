import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Header({ setShowMenu }) {
  return (
    <div className="header">
      <div
        className="header-svg-wrapper"
        onClick={() => setShowMenu((prevMenu) => !prevMenu)}
      >
        <FontAwesomeIcon icon={faBars} />
      </div>
      <span>BestSpot</span>
    </div>
  );
}
