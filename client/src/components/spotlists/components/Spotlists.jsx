import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import ShowOptions from "../../common/ShowOptions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faHeart } from "@fortawesome/free-solid-svg-icons";

import { getVisibilityDisplayName } from "./../../utils/helperFunctions";

import EditSpotlist from "./EditSpotlist";

export function Spotlists({ spotlists, setSpotlists, options, setOptions }) {
  const [editingSpotlist, setEditingSpotlist] = useState(false);
  const { userData } = useContext(AuthContext);
  return (
    <>
      {spotlists.map((spotlist) => {
        const linkUrl = spotlist.author.handle
          ? `/${spotlist.author.handle}/spotlists/list/${spotlist._id}`
          : `list/${spotlist._id}`;

        const likeCount = spotlist.likes.filter(
          (like) => like.isLikeActive === true
        ).length;

        const isSpotlistLiked = spotlist.likes.some(
          (like) => like._id === userData._id && like.isLikeActive
        );
        return (
          <Link to={linkUrl} className="spotlists-el" key={spotlist._id}>
            <div
              className="spotlists-thumbnail"
              style={{
                backgroundImage: `url(http://${
                  process.env.REACT_APP_SERVER
                }:5000/uploads/images/${
                  spotlist.cover === "s" ? "no-img-found.jpg" : spotlist.cover
                })`,
              }}
            >
              <span
                className={`spotlists-like-count ${
                  isSpotlistLiked ? "active" : ""
                }`}
              >
                {likeCount} <FontAwesomeIcon icon={faHeart} />
              </span>
              <span className="spotlists-spot-count">
                {spotlist.spots.length} spots
              </span>
            </div>
            <div className="spotlists-info">
              <span className="spotlists-title">{spotlist.name}</span>
              <p className="spotlists-details">
                {getVisibilityDisplayName(spotlist.visibility)}
              </p>
              {spotlist.description && (
                <p className="spotlists-description">{spotlist.description}</p>
              )}
            </div>
            {userData._id === spotlist.author && (
              <div
                className="spotlists-menu"
                onClick={(e) => e.preventDefault()}
              >
                <button
                  onClick={() =>
                    setOptions({
                      spotlistInfo: {
                        id: spotlist._id,
                        name: spotlist.name,
                        visibility: spotlist.visibility,
                        description: spotlist.description,
                        context: "spotlists",
                      },
                      aviableOptions: ["edit", "delete"],
                      entity: "spotlist",
                    })
                  }
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                {options && options.spotlistInfo.id === spotlist._id && (
                  <ShowOptions
                    options={options}
                    setOptions={setOptions}
                    setData={setSpotlists}
                    setEditingSpotlist={setEditingSpotlist}
                  />
                )}
              </div>
            )}
          </Link>
        );
      })}
      {editingSpotlist && (
        <>
          <EditSpotlist
            setData={setSpotlists}
            editingSpotlist={editingSpotlist}
            setEditingSpotlist={setEditingSpotlist}
          />
          <div className="spotlist-shade"></div>
        </>
      )}
    </>
  );
}
