import React, { useState, useEffect } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { getVisibilityDisplayName } from "./../../utils/helperFunctions";

export default function PostAddSpotlists({
  setIsAddingSpotlists,
  setSelectedSpotlists,
  selectedSpotlists,
}) {
  const [pickedSpotlists, setPicketSpotlists] = useState(selectedSpotlists);
  const [spotlists, setSpotlists] = useState([]);

  const confirmSpots = () => {
    setSelectedSpotlists(pickedSpotlists);
    setIsAddingSpotlists(false);
  };

  const handleSpotlistSelection = (spotlist) => {
    setPicketSpotlists((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (s) => s._id === spotlist._id
      );

      if (isAlreadySelected) {
        return prevSelected.filter((s) => s._id !== spotlist._id);
      }

      return [
        ...prevSelected,
        {
          _id: spotlist._id,
          name: spotlist.name,
          visibility: spotlist.visibility,
          cover: spotlist.cover,
          spotCount: spotlist.spots.length,
          description: spotlist.description,
        },
      ];
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          url: `${process.env.REACT_APP_API_URL}/api/v1/spotlists`,
          withCredentials: true,
        });
        const filteredSpotlists = res.data.data.filter(
          (spotlist) => spotlist.visibility !== "private"
        );

        setSpotlists(filteredSpotlists);
      } catch (err) {
        // console.log(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-add-spotlists-container">
      <div className="post-create-header">
        <div
          className="svg-wrapper"
          onClick={() => {
            setIsAddingSpotlists(false);
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>Add spotlists</span>
        <div className="counter">Spotlists {pickedSpotlists.length}/3</div>
      </div>
      <div className="post-add-spotlists-body">
        {spotlists.length > 0 ? (
          spotlists.map((spotlist) => {
            const isSpotlistSelected = pickedSpotlists.some(
              (s) => s._id === spotlist._id
            );
            return (
              <label
                className={`post-spotlist-el ${
                  pickedSpotlists.length >= 3 && !isSpotlistSelected
                    ? "disabled"
                    : ""
                }`}
                key={spotlist._id}
              >
                <div
                  className="post-spotlist-img"
                  style={{
                    backgroundImage: `url(${spotlist.cover}`,
                  }}
                >
                  <span className="spotlists-spot-count">
                    {spotlist.spots.length}{" "}
                    {spotlist.spots.length === 1 ? "spot" : "spots"}
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
                <div className="post-spotlist-check">
                  <input
                    type="checkbox"
                    checked={pickedSpotlists.some(
                      (s) => s._id === spotlist._id
                    )}
                    onChange={() => handleSpotlistSelection(spotlist)}
                    disabled={
                      !isSpotlistSelected && pickedSpotlists.length >= 3
                    }
                  />
                </div>
              </label>
            );
          })
        ) : (
          <div className="post-add-empty">
            Looks like you don’t have any spotlists yet.
            <br />
            Create one now to attach it to your post!
          </div>
        )}
      </div>
      <div className="post-add-spotlists-footer">
        <button
          className={pickedSpotlists.length > 0 ? `active` : ""}
          onClick={confirmSpots}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
