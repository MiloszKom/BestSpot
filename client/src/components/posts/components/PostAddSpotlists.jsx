import React, { useState, useEffect } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faList } from "@fortawesome/free-solid-svg-icons";

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
      const isAlreadySelected = prevSelected.some((s) => s.id === spotlist._id);

      if (isAlreadySelected) {
        return prevSelected.filter((s) => s.id !== spotlist._id);
      }

      return [
        ...prevSelected,
        {
          id: spotlist._id,
          name: spotlist.name,
          visibility: spotlist.visibility,
          cover: spotlist.cover,
          spotCount: spotlist.spots.length,
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
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist`,
          withCredentials: true,
        });
        const filteredSpotlists = res.data.data.filter(
          (spotlist) => spotlist.visibility !== "private"
        );

        setSpotlists(filteredSpotlists);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-add-spotlists-container">
      <div className="post-create-header">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={() => {
            setIsAddingSpotlists(false);
          }}
        />
        <span>Add spotlists</span>
        <button
          className={pickedSpotlists.length > 0 ? "" : "disabled"}
          onClick={confirmSpots}
        >
          Confirm
        </button>
      </div>

      <h2>Choose Spotlists</h2>

      <div className="post-add-spotlists-body">
        {spotlists.map((spotlist) => {
          const isSpotlistSelected = pickedSpotlists.some(
            (s) => s.id === spotlist._id
          );

          console.log(spotlist);
          return (
            <label
              className={`post-spotlist-el ${
                pickedSpotlists.length === 3 && !isSpotlistSelected
                  ? "disabled"
                  : ""
              }`}
              key={spotlist._id}
            >
              <div
                className="post-spotlist-img"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlist.cover}`,
                }}
              >
                <span className="spotlists-spot-count">
                  {spotlist.spots.length} spots
                </span>
              </div>
              <div className="post-spotlist-info">
                <div className="post-spotlist-title">{spotlist.name}</div>
                <div className="post-spotlist-visibility">
                  {spotlist.visibility}
                </div>
                <div className="post-spotlist-description">No Description</div>
              </div>
              <div className="post-spotlist-check">
                <input
                  type="checkbox"
                  checked={pickedSpotlists.some((s) => s.id === spotlist._id)}
                  onChange={() => handleSpotlistSelection(spotlist)}
                />
              </div>
            </label>
          );
        })}
      </div>
      {console.log(pickedSpotlists)}

      <div className="spot-counter">
        <FontAwesomeIcon icon={faList} />
        {pickedSpotlists.length}/3 Spotlists selected
      </div>
    </div>
  );
}
