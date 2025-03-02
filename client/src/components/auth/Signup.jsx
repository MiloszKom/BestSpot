import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthMutations } from "../hooks/useAuthMutations";
import Spinner from "../common/Spinner";
import { useValidateUserContent } from "../hooks/useValidateUserContent";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const { signUpMutation } = useAuthMutations();
  const { textValidator } = useValidateUserContent();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !passwordConfirm) {
      setError("Please fill out all the fields");
      return;
    }
    setError("");

    if (!textValidator([name])) return;

    const data = {
      name,
      email,
      password,
      passwordConfirm,
    };

    signUpMutation.mutate(data);
  };

  return (
    <div className="login-container">
      <div className="login-body">
        <h2 className="login-title">Create an account</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Username</label>
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
          <button
            type="submit"
            className={`login-button ${
              signUpMutation.isPending || signUpMutation.isSuccess
                ? "disabled"
                : ""
            }`}
          >
            {signUpMutation.isPending || signUpMutation.isSuccess ? (
              <Spinner />
            ) : (
              "Sign up"
            )}
          </button>
        </form>
        <div className="form-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
