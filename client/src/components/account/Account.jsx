import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { showAlert } from "../utils/helperFunctions";
import axios from "axios";

export default function Login() {
  const auth = useContext(AuthContext);
  console.log(auth);
  const user = auth.userData;

  const logout = async () => {
    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: "http://localhost:5000/api/v1/users/logout",
        withCredentials: true,
      });

      auth.logout();

      if ((res.data.status = "success")) window.location.reload(true);
    } catch (err) {
      console.log(err);
      showAlert("error", "Error logging out! Try again");
    }
  };

  return (
    <div className="account-container">
      <div className="account-photo">
        <img
          crossOrigin="anonymous"
          src={`http://localhost:5000/uploads/images/${user.photo}`}
          alt="User"
        />
      </div>
      <div className="account-name">{user.name}</div>
      <div className="account-settings">Account Settings</div>
      <Link to="settings" className="account-settings-el">
        Personal Information
      </Link>
      <div className="account-settings-el" onClick={logout}>
        Log out
      </div>
    </div>
  );
}
