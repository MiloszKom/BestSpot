import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useSpotMutations } from "../../hooks/useSpotMutations";

export default function AddNote({ setAddingNote, spotNote, spotId }) {
  const [note, setNote] = useState(spotNote);

  const { editNoteMutation } = useSpotMutations();

  const saveNote = async () => {
    editNoteMutation.mutate(
      {
        note,
        spotId,
      },
      {
        onSuccess: () => {
          setAddingNote(false);
        },
      }
    );
  };

  return (
    <div className="add-note-container">
      <div className="add-note-header">
        <span>Add Note</span>
        <div className="svg-wrapper" onClick={() => setAddingNote(false)}>
          <FontAwesomeIcon icon={faXmark} className="close-button" />
        </div>
      </div>
      <div className="add-note-input">
        <textarea
          className="add-note-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button
        className={`add-note-btn ${spotNote === note ? "disabled" : ""}`}
        onClick={saveNote}
      >
        Save
      </button>
    </div>
  );
}
