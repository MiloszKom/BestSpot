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
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
            }}
            key={spot._id}
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
                    onClick={() => removeSpot(spot._id)}
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
