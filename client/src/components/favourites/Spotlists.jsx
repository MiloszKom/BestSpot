import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import EditSpotlist from "./components/EditSpotlist";

export default function Spotlists() {
  const [spotlists, setSpotlists] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [editingSpotlist, setEditingSpotlist] = useState(false);
  const popupRefs = useRef({});
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

  const togglePopup = (id) => {
    setActivePopup((prevPopup) => (prevPopup === id ? null : id));
  };

  const editSpotlist = (spotlist) => {
    console.log("Spotlist is being edited :", spotlist);
    setEditingSpotlist(spotlist);
    setActivePopup(null);
  };

  const getVisibilityDisplayName = (visibility) => {
    const visibilityMap = {
      private: "Private",
      public: "Public",
      "friends-only": "Friends only",
    };

    return visibilityMap[visibility] || "Unknown";
  };

  const deleteSpotlist = async (spotlistId) => {
    try {
      const res = await axios({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist/${spotlistId}`,
        withCredentials: true,
      });
      showAlert(res.data.message, res.data.status);
      setSpotlists((prevSpotlists) =>
        prevSpotlists.filter((spotlist) => spotlist._id !== spotlistId)
      );
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
  };

  return (
    <div className="spotlists">
      <div className="spotlists-header">Spotlists</div>
      <div className="spotlists-wrapper">
        {spotlists.map((item) => (
          <div className="spotlists-el" key={item._id}>
            <Link
              className="spotlists-thumbnail"
              to={item.name}
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${item.cover})`,
              }}
              onClick={() => {
                localStorage.setItem("spotlistId", item._id);
                localStorage.setItem("spotlistName", item.name);
              }}
            >
              <span className="spotlists-spot-count">
                {item.spots.length} spots
              </span>
            </Link>
            <div className="spotlists-info">
              <span className="spotlists-title">{item.name}</span>
              <p className="spotlists-details">
                {getVisibilityDisplayName(item.visibility)}
              </p>
            </div>
            <button
              className="spotlists-menu-button"
              onClick={() => togglePopup(item._id)}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>

            {activePopup === item._id && (
              <div
                className="spotlists-options-popup"
                ref={(el) => (popupRefs.current[item._id] = el)}
              >
                <button
                  className="options-item"
                  onClick={() => deleteSpotlist(item._id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
                <button
                  className="options-item"
                  onClick={() => editSpotlist(item)}
                >
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingSpotlist && (
        <EditSpotlist
          editingSpotlist={editingSpotlist}
          setEditingSpotlist={setEditingSpotlist}
        />
      )}
    </div>
  );
}
