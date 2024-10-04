import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { showAlert } from "./helperFunctions";

export default function Login() {
  const [email, setEmail] = useState("test@onet.io");
  const [password, setPassword] = useState("milosz123");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: "http://localhost:5000/api/v1/users/login",
        data: {
          email,
          password,
        },
        withCredentials: true,
      });

      auth.login(res.data);

      if (res.data.status === "success") {
        showAlert("success", "Logged in successfully");
        window.setTimeout(() => {
          navigate("/search");
        }, 1500);
      }

      console.log(res);
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
    console.log(auth);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Welcome to BestSpot</h2>
      <form onSubmit={login} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <div className="form-footer">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
