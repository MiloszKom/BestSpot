import React, { useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
export default function CreateNewSpotlist({
  setCreatingNewSpotlist,
  spotId,
  setIsFavourite,
  setSpotlistId,
}) {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [description, setDescription] = useState("");

  const { showAlert } = useContext(AlertContext);

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  const close = () => {
    setCreatingNewSpotlist(false);
  };

  const createSpotlist = async () => {
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
        data: {
          name: title,
          spotId,
          visibility,
          description,
        },
        withCredentials: true,
      });

      console.log(res);
      setCreatingNewSpotlist(false);
      setIsFavourite(true);
      setSpotlistId(res.data.data._id);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
    }
  };

  return (
    <div className="spotlist-create-container">
      <div className="spotlist-create-header">
        <span>New spotlist</span>
        <button className="close-button" onClick={close}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spotlist-title">Choose a title</label>
        <input
          type="text"
          id="spotlist-title"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spotlist-visibility">Visibility</label>
        <select
          id="spotlist-visibility"
          value={visibility} // Set the value based on the state
          onChange={handleVisibilityChange} // Update state on change
        >
          <option value="private">Private</option>
          <option value="friends-only">Friends only</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spotlist-description">Description (optional)</label>
        <input
          type="text"
          id="spotlist-title"
          placeholder="Enter title"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        className={`spotlist-create-btn ${title ? "" : "disabled"}`}
        onClick={createSpotlist}
      >
        Create
      </button>
    </div>
  );
}
