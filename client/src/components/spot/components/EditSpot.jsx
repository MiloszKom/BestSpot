import React, { useRef, useState, useContext, useEffect } from "react";
import { AlertContext } from "../../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useSpotMutations } from "../../hooks/useSpotMutations";
import Spinner from "../../common/Spinner";

import * as nsfwjs from "nsfwjs";
import { imageValidator } from "../../utils/imageValidator";

export default function EditSpot({ spot, setEditingSpot }) {
  const [name, setName] = useState(spot.name);
  const [overview, setOverview] = useState(spot.overview);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [model, setModel] = useState(null);

  const fileInputRef = useRef(null);
  const { showAlert } = useContext(AlertContext);
  const { editSpotMutation } = useSpotMutations();

  useEffect(() => {
    nsfwjs.load().then((loadedModel) => {
      setModel(loadedModel);
    });
  }, []);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files.length > 1) {
      showAlert("Upload only 1 image", "fail");
      return;
    }

    const file = files[0];

    if (!model) {
      showAlert("Model not loaded yet. Please try again.", "fail");
      return;
    }

    const isSafe = await imageValidator(model, file);

    if (!isSafe) {
      showAlert(
        "The profile image is inappropriate and cannot be uploaded.",
        "fail"
      );
      return;
    }

    setSelectedPhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = async () => {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("overview", overview);
    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }

    editSpotMutation.mutate(
      { data: formData, spotId: spot._id },
      {
        onSettled: () => {
          setEditingSpot(false);
        },
      }
    );
  };

  return (
    <div className="spotlist-create-container">
      <div className="spotlist-create-header">
        Edit spot
        <button className="close-button" onClick={() => setEditingSpot(false)}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spot-name">Name</label>
        <input
          type="text"
          id="spot-name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spot-overview">Overview</label>
        <textarea
          id="spot-overview"
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
        />
      </div>

      <div className="spotlist-create-input">
        <label htmlFor="spot-photo">Photo</label>
        <div
          className="spot-photo"
          style={{
            backgroundImage: photoPreview
              ? `url(${photoPreview})`
              : `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
          }}
          onClick={handleImageClick}
        />
        <input
          id="spot-photo"
          className="input-file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={saveChanges}
        className={`spotlist-create-btn ${
          (name === spot.name &&
            overview === spot.overview &&
            !selectedPhoto) ||
          editSpotMutation.isPending
            ? "disabled"
            : ""
        }`}
        disabled={
          (name === spot.name &&
            overview === spot.overview &&
            !selectedPhoto) ||
          editSpotMutation.isPending
        }
      >
        {editSpotMutation.isPending ? <Spinner /> : "Save"}
      </button>
    </div>
  );
}
