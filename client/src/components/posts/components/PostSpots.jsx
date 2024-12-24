import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default function PostSpots({ selectedSpots, setSelectedSpots }) {
  const removeSpot = (spotId) => {
    setSelectedSpots((prevSelectedSpots) =>
      prevSelectedSpots.filter((spot) => spot.id !== spotId)
    );
  };

  return (
    <div className="post-spots-container">
      {selectedSpots.map((spot) => {
        return (
          <div
            className="spot-el"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
            }}
          >
            <div className="spot-el-info">
              <div className="spot-el-info-upper">
                <div className="spot-el-location">
                  <FontAwesomeIcon icon={faLocationDot} />
                  Wroclaw, Poland la la la la
                </div>
                <div
                  className="spot-el-delete"
                  onClick={() => removeSpot(spot.id)}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </div>
              </div>
              <div>{spot.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
