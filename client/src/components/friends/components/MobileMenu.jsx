import React, { useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUserGroup,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

export default function MobileMenu({ setMobileMenu }) {
  const auth = useContext(AuthContext);

  const closeMenu = () => {
    setMobileMenu(false);
  };

  return (
    <>
      <div className="mobile-menu-darkening" onClick={closeMenu}></div>
      <div className="mobile-menu">
        <div className="mobile-menu-header">
          <div
            className="mobile-menu-header-img"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${auth.userData.photo})`,
            }}
          ></div>
          <span>{auth.userData.name}</span>
        </div>
        <div className="mobile-menu-submenus">
          <NavLink
            to="/messages"
            end
            className={({ isActive }) =>
              isActive
                ? "mobile-menu-submenu-el active"
                : "mobile-menu-submenu-el"
            }
          >
            <div className="mobile-menu-submenu-el-icon">
              <FontAwesomeIcon icon={faComment} />
            </div>
            <div className="mobile-menu-submenu-el-text">Chats</div>
          </NavLink>

          <NavLink
            to="/messages/friend-requests"
            className={({ isActive }) =>
              isActive
                ? "mobile-menu-submenu-el active"
                : "mobile-menu-submenu-el"
            }
          >
            <div className="mobile-menu-submenu-el-icon">
              <FontAwesomeIcon icon={faUserGroup} />
            </div>
            <div className="mobile-menu-submenu-el-text">Friends</div>
          </NavLink>

          <NavLink
            to="/messages/contact-requests"
            end
            className={({ isActive }) =>
              isActive
                ? "mobile-menu-submenu-el active"
                : "mobile-menu-submenu-el"
            }
          >
            <div className="mobile-menu-submenu-el-icon">
              <FontAwesomeIcon icon={faCommentDots} />
            </div>
            <div className="mobile-menu-submenu-el-text">Contact Requests</div>
          </NavLink>
        </div>
      </div>
    </>
  );
}
