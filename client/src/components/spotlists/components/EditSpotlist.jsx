import React, { useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSpotlistsMutations } from "../../hooks/useSpotlistsMutations";

export default function EditSpotlist({
  setData,
  editingSpotlist,
  setEditingSpotlist,
}) {
  const [name, setName] = useState(editingSpotlist.name);
  const [visibility, setVisibility] = useState(editingSpotlist.visibility);
  const [description, setDescription] = useState(editingSpotlist.description);

  const { editSpotlistMutation } = useSpotlistsMutations();

  const closeEditingSpotlist = () => {
    setEditingSpotlist(false);
  };

  const saveChanges = async () => {
    console.log(editingSpotlist);
    editSpotlistMutation.mutate({
      spotlistId: editingSpotlist.id,
      nameIsChanged: editingSpotlist.name !== name,
      newName: name,
      newVisibility: visibility,
      newDescription: description,
      key: editingSpotlist.key,
    });
    setEditingSpotlist(false);
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
        <textarea
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
