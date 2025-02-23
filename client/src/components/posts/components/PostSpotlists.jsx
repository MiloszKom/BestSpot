import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { getVisibilityDisplayName } from "./../../utils/helperFunctions";
import { Link } from "react-router-dom";

export default function PostSpotlists({
  selectedSpotlists,
  setSelectedSpotlists,
}) {
  const removeSpotlist = (spotlistId) => {
    setSelectedSpotlists((prevSpotlists) =>
      prevSpotlists.filter((spotlist) => spotlist._id !== spotlistId)
    );
  };

  return (
    <div className="post-spotlists-container">
      {selectedSpotlists.map((spotlist) => {
        const spotCount = spotlist.spots?.length
          ? spotlist.spots.length
          : spotlist.spotCount
          ? spotlist.spotCount
          : 0;
        return (
          <Link
            to={`/${spotlist.author?.handle}/spotlists/${spotlist._id}`}
            className="post-spotlist-el"
            key={spotlist._id}
            onClick={(e) => {
              if (setSelectedSpotlists) e.preventDefault();
            }}
          >
            <div
              className="post-spotlist-img"
              style={{
                backgroundImage: `url(${spotlist.cover}`,
              }}
            >
              <span className="spotlists-spot-count">
                {spotCount} {spotCount === 1 ? "spot" : "spots"}
              </span>
            </div>
            <div className="post-spotlist-info">
              <div className="post-spotlist-title">{spotlist.name}</div>
              <div className="post-spotlist-visibility">
                {getVisibilityDisplayName(spotlist.visibility)}
              </div>
              <div className="post-spotlist-description">
                {spotlist.description}
              </div>
            </div>
            {setSelectedSpotlists && (
              <div
                className="post-spotlist-delete"
                onClick={() => removeSpotlist(spotlist._id)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
