import React, { useRef, useState, useContext } from "react";
import { AlertContext } from "../../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function EditSpot({
  placeDetails,
  setPlaceDetails,
  setEditingSpot,
}) {
  const [name, setName] = useState(placeDetails.name);
  const [overview, setOverview] = useState(placeDetails.overview);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fileInputRef = useRef(null);
  const { showAlert } = useContext(AlertContext);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 1) {
      showAlert("Upload only 1 image", "fail");
      return;
    }

    const file = files[0];

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

    console.log(selectedPhoto);

    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${placeDetails._id}`,
        withCredentials: true,
      });
      console.log(res);
      setPlaceDetails(res.data.data.spot);
      setEditingSpot(false);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      showAlert(err.response.data.message, err.response.data.status);
      console.log(err);
    }
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
              : `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.photo})`,
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
          name === placeDetails.name &&
          overview === placeDetails.overview &&
          !selectedPhoto
            ? "disabled"
            : ""
        }`}
      >
        Save
      </button>
    </div>
  );
}
