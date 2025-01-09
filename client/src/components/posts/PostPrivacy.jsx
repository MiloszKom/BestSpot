import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faEarthAmericas,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function PostPrivacy({ setSettingPrivacy, setPostVisibility }) {
  return (
    <div className="post-set-privacy-container">
      <div className="post-set-privacy-header">
        Choose who can see this post
      </div>
      <div
        className="privacy-option"
        onClick={() => {
          setPostVisibility("Public");
          setSettingPrivacy(false);
        }}
      >
        <div className="icon">
          <FontAwesomeIcon icon={faEarthAmericas} />
        </div>
        <span>Public</span>
      </div>
      <div
        className="privacy-option"
        onClick={() => {
          setPostVisibility("Friends");
          setSettingPrivacy(false);
        }}
      >
        <div className="icon">
          <FontAwesomeIcon icon={faUserGroup} />
        </div>
        <span>Friends</span>
      </div>
      <button
        onClick={() => {
          setSettingPrivacy(false);
        }}
      >
        Cancel
      </button>
    </div>
  );
}
