import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useSpotMutations } from "../../hooks/useSpotMutations";
import Spinner from "../../common/Spinner";
import { useValidateUserContent } from "../../hooks/useValidateUserContent";

export default function CreateNewSpotlist({ setCreatingNewSpotlist, spotId }) {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [description, setDescription] = useState("");

  const { createSpotlistMutation } = useSpotMutations();
  const { textValidator } = useValidateUserContent();

  const createSpotlist = async () => {
    if (!textValidator([title, description])) return;

    const data = {
      name: title,
      spotId,
      visibility,
      description,
    };

    createSpotlistMutation.mutate(
      { data, spotId },
      {
        onSuccess: () => {
          setCreatingNewSpotlist(false);
        },
      }
    );
  };

  return (
    <div className="spotlist-create-container">
      <div className="spotlist-create-header">
        <span>New spotlist</span>
        <button
          className="close-button"
          onClick={() => setCreatingNewSpotlist(false)}
        >
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
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
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
        className={`spotlist-create-btn ${
          !title || createSpotlistMutation.isPending ? "disabled" : ""
        }`}
        onClick={createSpotlist}
        disabled={createSpotlistMutation.isPending}
      >
        {createSpotlistMutation.isPending ? <Spinner /> : "Create"}
      </button>
    </div>
  );
}
