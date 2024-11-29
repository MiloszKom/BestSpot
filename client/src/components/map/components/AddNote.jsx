import React, { useEffect, useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

export default function AddNote({
  setAddingNote,
  placeNote,
  setPlaceNote,
  spotlistId,
  spotId,
}) {
  const { showAlert } = useContext(AlertContext);

  const [note, setNote] = useState(placeNote);

  const saveNote = async () => {
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          note: note,
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/spotlist/${spotlistId}/spot/${spotId}/note`,
        withCredentials: true,
      });

      console.log(res);
      showAlert(res.data.message, res.data.status);
      setPlaceNote(note);
      setAddingNote(false);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
  };

  return (
    <>
      <div className="spotlist-shade"></div>
      <div className="add-note-container">
        <div className="add-note-header">
          <span>Add Note</span>
          <FontAwesomeIcon
            icon={faXmark}
            className="close-button"
            onClick={() => setAddingNote(false)}
          />
        </div>
        <div className="add-note-input">
          <textarea
            className="add-note-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button
          className={`add-note-btn ${placeNote === note ? "disabled" : ""}`}
          onClick={saveNote}
        >
          Save
        </button>
      </div>
    </>
  );
}
