import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { getVisibilityDisplayName } from "./../../utils/helperFunctions";

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
        return (
          <div className="post-spotlist-el" key={spotlist._id}>
            <div
              className="post-spotlist-img"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlist.cover}`,
              }}
            >
              <span className="spotlists-spot-count">
                {spotlist.spotCount ?? spotlist.spots.length} spots
              </span>
            </div>
            <div className="post-spotlist-info">
              <div className="post-spotlist-title">{spotlist.name}</div>
              <div className="post-spotlist-visibility">
                {getVisibilityDisplayName(spotlist.visibility)}
              </div>
              <div className="post-spotlist-description">No Description</div>
            </div>
            {setSelectedSpotlists && (
              <div
                className="post-spotlist-delete"
                onClick={() => removeSpotlist(spotlist._id)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
