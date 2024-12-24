import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default function PostSpotlists({
  selectedSpotlists,
  setSelectedSpotlists,
}) {
  const removeSpotlist = (spotlistId) => {
    setSelectedSpotlists((prevSpotlists) =>
      prevSpotlists.filter((spotlist) => spotlist.id !== spotlistId)
    );
  };

  return (
    <div className="post-spotlists-container">
      {selectedSpotlists.map((spotlist) => {
        console.log(spotlist);
        return (
          <div className="post-spotlist-el" key={spotlist.id}>
            <div
              className="post-spotlist-img"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlist.cover}`,
              }}
            >
              <span className="spotlists-spot-count">
                {spotlist.spotCount} spots
              </span>
            </div>
            <div className="post-spotlist-info">
              <div className="post-spotlist-title">{spotlist.name}</div>
              <div className="post-spotlist-visibility">
                {spotlist.visibility}
              </div>
              <div className="post-spotlist-description">No Description</div>
            </div>
            <div
              className="post-spotlist-delete"
              onClick={() => removeSpotlist(spotlist.id)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
