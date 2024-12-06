import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
  const auth = useContext(AuthContext);
  const user = auth.userData;

  console.log(auth);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("photo", document.getElementById("photo").files[0]);

      const res = await axios({
        method: "PATCH",
        url: "http://localhost:5000/api/v1/users/UpdateMe",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      });
      console.log(res);
      auth.login(res.data);
    } catch (err) {
      console.log(err.response.data);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        url: "http://localhost:5000/api/v1/users/updateMyPassword",
        data: {
          passwordCurrent,
          password,
          passwordConfirm,
        },
        withCredentials: true,
      });
      console.log(res);
      auth.login(res.data);
      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      console.log(err.response.data);
    }
  };

  return (
    <div className="settings-container">
      <Link to="/account" className="settings-header">
        <FontAwesomeIcon icon={faArrowLeft} /> Account
      </Link>
      <div className="settings-text">Your Account Settings</div>

      <form className="settings-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
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
        <div className="form-group form__photo-upload">
          <div className="form__user-photo">
            <img
              crossOrigin="anonymous"
              src={`http://localhost:5000/uploads/images/${user.photo}`}
              alt="User"
            />
          </div>
          <input type="file" accept="image/*" id="photo" name="photo" />
          <label htmlFor="photo">Choose new photo</label>
        </div>
        <button className="btn" onClick={saveSettings}>
          Save Settings
        </button>
      </form>

      <div className="settings-text">Change Password</div>
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
        <button className="btn" onClick={savePassword}>
          Save Password
        </button>
      </form>
    </div>
  );
}
