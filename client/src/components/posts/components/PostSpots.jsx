import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default function PostSpots({ selectedSpots, setSelectedSpots }) {
  const removeSpot = (spotId) => {
    setSelectedSpots((prevSelectedSpots) =>
      prevSelectedSpots.filter((spot) => spot._id !== spotId)
    );
  };

  return (
    <div className="post-spots-container">
      {selectedSpots.map((spot) => {
        return (
          <Link
            to={`/spot/${spot._id}`}
            className="spot-el"
            style={{
              backgroundImage: `url(${spot.photo})`,
            }}
            key={spot._id}
            onClick={(e) => {
              if (setSelectedSpots) e.preventDefault();
            }}
          >
            <div className="spot-el-info">
              <div className="spot-el-info-upper">
                <div className="spot-el-location">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {spot.city}, {spot.country}
                </div>
                {setSelectedSpots && (
                  <div
                    className="spot-el-delete"
                    onClick={(e) => {
                      removeSpot(spot._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </div>
                )}
              </div>
              <div>{spot.name}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
