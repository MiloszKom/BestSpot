import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";
import { AlertContext } from "../context/AlertContext";

export default function Settings() {
  const auth = useContext(AuthContext);
  const user = auth.userData;

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const fileInputRef = useRef(null);

  const navigate = useNavigate();
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

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("photo", selectedPhoto);

      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/updateMe`,
        data: formData,
        withCredentials: true,
      });

      console.log(res);

      auth.login(res.data);
      if (res.data.status === "success") {
        showAlert(res.data.message, res.data.status);
        navigate(`/${user.handle}`);
      }
    } catch (err) {
      showAlert(err.response.data.message, "fail");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/updateMyPassword`,
        data: {
          passwordCurrent,
          password,
          passwordConfirm,
        },
        withCredentials: true,
      });
      console.log(res);
      auth.login(res.data);
      if (res.data.status === "success") {
        showAlert(res.data.message, res.data.status);
        navigate(`/${user.handle}`);
      }
    } catch (err) {
      console.log(err);
      showAlert(err.response.data.message, "fail");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header" onClick={() => navigate(-1)}>
        <div className="svg-wrapper">
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>Your Account Settings</span>
      </div>
      <div className="settings-body">
        <form className="settings-form">
          <div className="form-group">
            <div
              className="form-photo"
              style={{
                backgroundImage: photoPreview
                  ? `url(${photoPreview})`
                  : `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${user.photo})`,
              }}
              onClick={handleImageClick}
            >
              <div className="form-photo-edit">
                <FontAwesomeIcon icon={faCamera} />
              </div>
            </div>
            <input
              id="settings-photo"
              className="input-file"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              type="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Email adress</label>
            <input
              type="email"
              id="password"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            className={`btn ${
              name === user.name && email === user.email && !selectedPhoto
                ? "disabled"
                : ""
            }`}
            onClick={saveSettings}
          >
            Save Settings
          </button>
        </form>

        <form className="settings-form">
          <div className="form-group">
            <label htmlFor="passwordCurrent">Current Passowrd</label>
            <input
              type="password"
              id="passwordCurrent"
              value={passwordCurrent}
              onChange={(e) => setPasswordCurrent(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordNew">New Password</label>
            <input
              type="password"
              id="passwordNew"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <button
            className={`btn ${
              !passwordCurrent || !password || !passwordConfirm
                ? "disabled"
                : ""
            }`}
            onClick={savePassword}
          >
            Save Password
          </button>
        </form>
      </div>
    </div>
  );
}
