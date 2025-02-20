import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";
import { AlertContext } from "../context/AlertContext";
import { useAuthMutations } from "../hooks/useAuthMutations";
import Spinner from "../common/Spinner";
import * as nsfwjs from "nsfwjs";
import { imageValidator } from "../utils/imageValidator";

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
  const [model, setModel] = useState(null);

  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { showAlert } = useContext(AlertContext);

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
    reader.readAsDataURL(file);
  };

  const { updatePasswordMutation, updateInfoMutation } = useAuthMutations();

  const saveSettings = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("photo", selectedPhoto);

    updateInfoMutation.mutate(formData);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const data = {
      passwordCurrent,
      password,
      passwordConfirm,
    };
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="svg-wrapper" onClick={() => navigate(-1)}>
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
              (name === user.name && email === user.email && !selectedPhoto) ||
              updateInfoMutation.isPending ||
              updateInfoMutation.isSuccess
                ? "disabled"
                : ""
            }`}
            onClick={saveSettings}
            disabled={
              (name === user.name && email === user.email && !selectedPhoto) ||
              updateInfoMutation.isPending ||
              updateInfoMutation.isSuccess
            }
          >
            {updateInfoMutation.isPending || updateInfoMutation.isSuccess ? (
              <Spinner />
            ) : (
              "Save Settings"
            )}
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
              !passwordCurrent ||
              !password ||
              !passwordConfirm ||
              updatePasswordMutation.isPending ||
              updatePasswordMutation.isSuccess
                ? "disabled"
                : ""
            }`}
            onClick={savePassword}
            disabled={
              !passwordCurrent ||
              !password ||
              !passwordConfirm ||
              updatePasswordMutation.isPending ||
              updatePasswordMutation.isSuccess
            }
          >
            {updatePasswordMutation.isPending ||
            updatePasswordMutation.isSuccess ? (
              <Spinner />
            ) : (
              "Save Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
