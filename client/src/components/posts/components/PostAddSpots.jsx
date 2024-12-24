import React, { useEffect, useState } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

export default function PostAddSpots({
  setIsAddingSpots,
  setSelectedSpots,
  selectedSpots,
}) {
  const [spotlists, setSpotlists] = useState([]);
  const [spots, setSpots] = useState([]);
  const [isSpotlistPicked, setIsSpotlistPicked] = useState(false);
  const [pickedSpots, setPickedSpots] = useState(selectedSpots);

  const viewSpotlist = async (spotlistId) => {
    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist/${spotlistId}`,
        withCredentials: true,
      });
      setSpots(res.data.data);
      setIsSpotlistPicked(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSpotSelection = (spot) => {
    setPickedSpots((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (s) => s.id === spot.spot._id
      );

      if (isAlreadySelected) {
        return prevSelected.filter((s) => s.id !== spot.spot._id);
      }

      return [
        ...prevSelected,
        {
          id: spot.spot._id,
          photo: spot.spot.photos[0],
          name: spot.spot.name,
        },
      ];
    });
  };

  const confirmSpots = () => {
    setSelectedSpots(pickedSpots);
    setIsAddingSpots(false);
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
    <div className="post-add-spots-container">
      <div className="post-create-header">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={() => {
            setIsAddingSpots(false);
          }}
        />
        <span>Add spots</span>
        <button
          className={pickedSpots.length > 0 ? "" : "disabled"}
          onClick={confirmSpots}
        >
          Confirm
        </button>
      </div>
      <h2>Choose {isSpotlistPicked ? "Spots" : "Spotlist"}</h2>

      <div className="post-add-spots-body">
        <div
          className="post-create-add-spots"
          style={{ transform: `translateX(-${isSpotlistPicked ? 100 : 0}%)` }}
        >
          <div className="add-spots-1">
            {spotlists.map((spotlist) => {
              return (
                <div
                  className="spotlist-el"
                  onClick={() => viewSpotlist(spotlist._id)}
                  key={spotlist._id}
                >
                  <div
                    className="spotlist-img"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlist.cover}`,
                    }}
                  />
                  <div className="spotlist-info">
                    <span className="name">{spotlist.name}</span>
                    <span className="description">No Description</span>
                  </div>
                  <div className="show-list">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="add-spots-2">
            <div className="return" onClick={() => setIsSpotlistPicked(false)}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Go back to spotlists</span>
            </div>
            {spots.map((spot) => {
              const isSpotSelected = pickedSpots.some(
                (s) => s.id === spot.spot._id
              );

              return (
                <label
                  className={`spot-el ${
                    pickedSpots.length === 5 && !isSpotSelected
                      ? "disabled"
                      : ""
                  }`}
                  key={spot.spot._id}
                >
                  <input
                    type="checkbox"
                    checked={pickedSpots.some((s) => s.id === spot.spot._id)}
                    onChange={() => handleSpotSelection(spot)}
                  />
                  <div
                    className="spot-el-img"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.spot.photos[0]}`,
                    }}
                  />
                  <div className="spot-el-info">{spot.spot.name}</div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="spot-counter">
        <FontAwesomeIcon icon={faLocationDot} />
        {pickedSpots.length}/5 Spots selected
      </div>
    </div>
  );
}
