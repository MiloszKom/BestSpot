import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  faEllipsisVertical,
  faHeart,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ShowOptions from "../common/ShowOptions";

export default function Spot({
  spot,
  spotlistData,
  options,
  setOptions,
  deleteSpotFromSpotlist,
}) {
  const { userData, isLoggedIn } = useContext(AuthContext);
  const likeCount = spot.likes.filter(
    (like) => like.isLikeActive === true
  ).length;

  const isSpotlistLiked = spot.likes.some(
    (like) => like._id === userData?._id && like.isLikeActive
  );

  return (
    <Link
      to={`/spot/${spot._id}`}
      className="spotlist-detail-spots-el"
      key={spot._id}
    >
      <div
        className="image"
        style={{
          backgroundImage: `url(${spot.photo})`,
        }}
      >
        <span
          className={`spotlists-like-count ${isSpotlistLiked ? "active" : ""}`}
        >
          {likeCount} <FontAwesomeIcon icon={faHeart} />
        </span>
      </div>
      <div className="info">
        <div className="name">{spot.name}</div>
        <div className="location">
          <FontAwesomeIcon icon={faLocationDot} />
          {spot.city}, {spot.country}
        </div>
      </div>
      {isLoggedIn && userData?._id === spotlistData?.author._id && (
        <div className="menu" onClick={(e) => e.preventDefault()}>
          <button
            className="options"
            onClick={() =>
              setOptions({
                spotlistId: spotlistData._id,
                spotId: spot._id,
                aviableOptions: ["delete"],
                entity: "spotlistSpot",
              })
            }
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          {options?.spotId === spot._id && (
            <ShowOptions
              options={options}
              deleteSpotFromSpotlist={deleteSpotFromSpotlist}
            />
          )}
        </div>
      )}
    </Link>
  );
}
