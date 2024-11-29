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
  const [selectedSpotlist, setSelectedSpotlist] = useState(null);
  const [spotlists, setSpotlists] = useState([]);

  const { showAlert } = useContext(AlertContext);

  const fetchSpotlists = async () => {
    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist`,
        withCredentials: true,
      });

      console.log(res);
      setSpotlists(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSpotlists();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedSpotlist(id);
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "private":
        return faLock;
      case "public":
        return faEarthAmericas;
      case "friends only":
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
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist/${selectedSpotlist}`,
        data: {
          spotId,
        },
        withCredentials: true,
      });

      console.log(res);
      setIsFavourite(true);
      setSpotlistId(res.data.data.spotlistId);
      setAddingToSpotlist(false);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
  };

  return (
    <>
      <div className="spotlist-shade"></div>
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
                checked={selectedSpotlist === spotlist._id}
                onChange={() => handleCheckboxChange(spotlist._id)}
              />
              <label htmlFor={spotlist.id}>{spotlist.name}</label>
              <span className="spotlist-icon">
                <FontAwesomeIcon
                  icon={getVisibilityIcon(spotlist.visibility)}
                />
              </span>
            </div>
          ))}
        </div>
        <button
          className="spotlist-btn spotlist-add-new-btn"
          onClick={switchToCreatingSpotlist}
        >
          + New spotlist
        </button>
        <button
          className={`spotlist-btn spotlist-add-to-btn ${
            selectedSpotlist ? "" : "disabled"
          }`}
          onClick={saveToSpotlist}
          disabled={!selectedSpotlist}
        >
          + Add to spotlist
        </button>
      </div>
    </>
  );
}
