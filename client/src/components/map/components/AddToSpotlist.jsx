import React, { useEffect, useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faXmark,
  faEarthAmericas,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

export default function AddToSpotlist({
  setAddingToSpotlist,
  setCreatingNewSpotlist,
  spotId,
  setIsFavourite,
  setSpotlistId,
}) {
  const [spotlists, setSpotlists] = useState([]);
  const [spotlistsChecked, setSpotlistsChecked] = useState([]);

  const { showAlert } = useContext(AlertContext);

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

      const initializedSpotlistsChecked = res.data.data.map((spotlist) => ({
        id: spotlist._id,
        isChanged: false,
        isChecked: spotlist.spots.includes(spotId),
      }));

      setSpotlists(res.data.data);
      setSpotlistsChecked(initializedSpotlistsChecked);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSpotlists();
  }, []);

  const handleCheckboxChange = (id) => {
    setSpotlistsChecked((prevSelected) => {
      const existingSpotlist = prevSelected.find((item) => item.id === id);

      if (existingSpotlist) {
        return prevSelected.map((item) =>
          item.id === id
            ? {
                ...item,
                isChanged: !item.isChanged,
                isChecked: !item.isChecked,
              }
            : item
        );
      } else {
        return [...prevSelected, { id, isChanged: true, isChecked: true }];
      }
    });
  };

  const isSpotlistChecked = (id) => {
    return spotlistsChecked.some((item) => item.id === id && item.isChecked);
  };

  const getVisibilityIcon = (visibility) => {
    console.log(visibility);
    switch (visibility) {
      case "private":
        return faLock;
      case "public":
        return faEarthAmericas;
      case "friends-only":
        return faUsers;
      default:
        return null;
    }
  };

  const closeAddToSpotlist = () => {
    setAddingToSpotlist(false);
  };

  const switchToCreatingSpotlist = () => {
    setAddingToSpotlist(false);
    setCreatingNewSpotlist(true);
  };

  const saveToSpotlist = async () => {
    let spotlistsAdded = [];
    let spotlistsRemoved = [];

    spotlistsChecked.forEach((spotlist) => {
      if (spotlist.isChanged) {
        if (spotlist.isChecked) {
          spotlistsAdded.push(spotlist.id);
        } else {
          spotlistsRemoved.push(spotlist.id);
        }
      }
    });

    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/manage`,
        data: {
          spotId: spotId,
          spotlistsAdded,
          spotlistsRemoved,
        },
        withCredentials: true,
      });

      console.log(res);
      setAddingToSpotlist(false);
      setIsFavourite(res.data.isSavedInAnySpotlist);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="spotlist-add-container">
      <div className="spotlist-add-header">
        Save to spotlist
        <button className="close-button" onClick={closeAddToSpotlist}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div className="spotlist-add-list">
        {spotlists.map((spotlist) => (
          <div className="spotlist-add-list-item" key={spotlist._id}>
            <input
              className="spotlist-add-checkbox"
              type="checkbox"
              id={spotlist._id}
              checked={isSpotlistChecked(spotlist._id)}
              onChange={() => handleCheckboxChange(spotlist._id)}
            />
            <label htmlFor={spotlist._id}>{spotlist.name}</label>
            <span className="spotlist-icon">
              <FontAwesomeIcon icon={getVisibilityIcon(spotlist.visibility)} />
            </span>
          </div>
        ))}
      </div>
      <button
        className="spotlist-btn spotlist-add-new-btn"
        onClick={switchToCreatingSpotlist}
      >
        Create Spotlist
      </button>
      <button
        className={`spotlist-btn spotlist-add-to-btn ${
          spotlistsChecked.some((item) => item.isChanged) > 0 ? "" : "disabled"
        }`}
        onClick={saveToSpotlist}
      >
        Save
      </button>
    </div>
  );
}
