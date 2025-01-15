import React, { useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function EditSpotlist({
  setData,
  editingSpotlist,
  setEditingSpotlist,
}) {
  const [name, setName] = useState(editingSpotlist.name);
  const [visibility, setVisibility] = useState(editingSpotlist.visibility);
  const [description, setDescription] = useState(editingSpotlist.description);

  const { showAlert } = useContext(AlertContext);

  const closeEditingSpotlist = () => {
    setEditingSpotlist(false);
  };

  const saveChanges = async () => {
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${editingSpotlist.id}`,
        data: {
          nameIsChanged: editingSpotlist.name !== name,
          newName: name,
          newVisibility: visibility,
          newDescription: description,
        },
        withCredentials: true,
      });

      const editedSpotlist = res.data.data.spotlist;

      if (editingSpotlist.context === "spotlists") {
        setData((prevSpotlists) =>
          prevSpotlists.map((spotlist) =>
            spotlist._id === editingSpotlist.id ? editedSpotlist : spotlist
          )
        );
      }

      if (editingSpotlist.context === "spotlistContent") {
        setData((prevData) => ({
          ...prevData,
          name: editedSpotlist.name,
          visibility: editedSpotlist.visibility,
          description: editedSpotlist.description,
        }));
      }

      setEditingSpotlist(false);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
  };

  return (
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

      <div className="spotlist-create-input">
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

      <div className="spotlist-create-input">
        <label htmlFor="spotlist-title">Description</label>
        <input
          type="text"
          id="spotlist-title"
          placeholder="Enter title"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        className={`spotlist-create-btn ${
          name === editingSpotlist.name &&
          visibility === editingSpotlist.visibility &&
          description === editingSpotlist.description
            ? "disabled"
            : ""
        }`}
        onClick={saveChanges}
      >
        Save
      </button>
    </div>
  );
}
