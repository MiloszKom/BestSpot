import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const signup = async (name, email, password, passwordConfirm) => {
    console.log(email, password);
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: "http://localhost:5000/api/v1/users/signup",
        data: {
          name,
          email,
          password,
          passwordConfirm,
        },
        withCredentials: true,
        credentials: "include",
      });
      console.log(res);
      auth.login(res.data);
      navigate("/search");
    } catch (err) {
      console.log(err.response.data);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !passwordConfirm) {
      setError("Please fill out all the fields");
      return;
    }
    setError("");

    signup(name, email, password, passwordConfirm);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Create an account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>
      <div className="form-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
