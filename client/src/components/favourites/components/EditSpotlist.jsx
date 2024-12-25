import React, { useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function EditSpotlist({ editingSpotlist, setEditingSpotlist }) {
  const [name, setName] = useState(editingSpotlist.name);
  const [visibility, setVisibility] = useState(editingSpotlist.visibility);

  const { showAlert } = useContext(AlertContext);

  const closeEditingSpotlist = () => {
    setEditingSpotlist(false);
  };

  console.log(editingSpotlist);
  const saveChanges = async () => {
    console.log(name);
    console.log(visibility);

    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${editingSpotlist._id}`,
        data: {
          nameIsChanged: editingSpotlist.name !== name,
          newName: name,
          newVisibility: visibility,
        },
        withCredentials: true,
      });

      setEditingSpotlist(false);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
  };

  return (
    <>
      <div className="spotlist-shade"></div>
      <div className="spotlist-create-container">
        <div className="spotlist-create-header">
          Edit spotlist
          <button className="close-button" onClick={closeEditingSpotlist}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="spotlist-create-input">
          <label htmlFor="spotlist-title">Title</label>
          <input
            type="text"
            id="spotlist-title"
            placeholder="Enter title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="spotlist-create-visibility">
          <label htmlFor="spotlist-visibility">Visibility</label>
          <select
            id="spotlist-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="private">Private</option>
            <option value="friends-only">Friends only</option>
            <option value="public">Public</option>
          </select>
        </div>

        <button
          className={`spotlist-create-btn ${
            name === editingSpotlist.name &&
            visibility === editingSpotlist.visibility
              ? "disabled"
              : ""
          }`}
          onClick={saveChanges}
        >
          Save
        </button>
      </div>
    </>
  );
}
