import React, { useEffect, useState } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { getVisibilityDisplayName } from "../../utils/helperFunctions";

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
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}`,
        withCredentials: true,
      });
      setSpots(res.data.data.spots);
      setIsSpotlistPicked(true);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSpotSelection = (spot) => {
    setPickedSpots((prevSelected) => {
      const isAlreadySelected = prevSelected.some((s) => s._id === spot._id);

      if (isAlreadySelected) {
        return prevSelected.filter((s) => s._id !== spot._id);
      }

      return [
        ...prevSelected,
        {
          _id: spot._id,
          google_id: spot.google_id,
          photo: spot.photo,
          name: spot.name,
          city: spot.city,
          country: spot.country,
        },
      ];
    });
  };

  const confirmSpots = () => {
    setSelectedSpots(pickedSpots);
    setIsAddingSpots(false);
  };

  useEffect(() => {
    const fetchSpotlists = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
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

    fetchSpotlists();
  }, []);

  return (
    <div className="post-add-spots-container">
      <div className="post-create-header">
        <div
          className="svg-wrapper"
          onClick={() => {
            setIsAddingSpots(false);
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>{isSpotlistPicked ? "Add spots" : "Choose spotlist"}</span>
        <div className="counter">Spots {pickedSpots.length}/5</div>
      </div>
      <div className="post-add-spots-body">
        <div
          className="post-create-add-spots"
          style={{ transform: `translateX(-${isSpotlistPicked ? 100 : 0}%)` }}
        >
          <div className="pick-spotlist">
            {spotlists.map((spotlist) => {
              return (
                <div
                  className="spotlist-el"
                  onClick={() => viewSpotlist(spotlist._id)}
                >
                  <div
                    className="photo"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlist.cover})`,
                    }}
                  >
                    <span className="spotlists-spot-count">
                      {spotlist.spots.length} spots
                    </span>
                  </div>
                  <div className="info">
                    <div className="name no-wrap">{spotlist.name}</div>
                    <div className="visibility no-wrap">
                      {getVisibilityDisplayName(spotlist.visibility)}
                    </div>
                    <div className="description">{spotlist.description}</div>
                  </div>
                  <button className="pick-btn">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="pick-spot">
            {spots.map((spot) => {
              const isSpotSelected = pickedSpots.some(
                (s) => s._id === spot._id
              );

              return (
                <label
                  className={`spot-el ${
                    pickedSpots.length === 5 && !isSpotSelected
                      ? "disabled"
                      : ""
                  }`}
                  key={spot._id}
                >
                  <div
                    className="photo"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
                    }}
                  />
                  <div className="info">
                    <div className="name no-wrap">{spot.name}</div>
                    <div className="address no-wrap">{`${spot.city}, ${spot.county}`}</div>
                  </div>
                  <div className="post-spotlist-check">
                    <input
                      type="checkbox"
                      checked={pickedSpots.some((s) => s._id === spot._id)}
                      onChange={() => handleSpotSelection(spot)}
                      disabled={
                        !pickedSpots.some((s) => s._id === spot._id) &&
                        pickedSpots.length >= 5
                      }
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
      <div className="post-add-spots-footer">
        <button
          className={isSpotlistPicked ? `active` : ""}
          onClick={() => setIsSpotlistPicked(false)}
        >
          Return
        </button>
        <button
          className={pickedSpots.length > 0 ? `active` : ""}
          onClick={confirmSpots}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
