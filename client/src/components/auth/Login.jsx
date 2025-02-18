import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthMutations } from "../hooks/useAuthMutations";
import Spinner from "../common/Spinner";

export default function Login() {
  const [email, setEmail] = useState("test@onet.io");
  const [password, setPassword] = useState("milosz123");
  const location = useLocation();

  const message = location.state?.message;

  const { loginMutation } = useAuthMutations();

  const login = async (e) => {
    e.preventDefault();
    const data = {
      email,
      password,
    };
    loginMutation.mutate(data);
  };

  return (
    <div className="login-container">
      <div className="login-body">
        <h2 className="login-title">Welcome back to BestSpot</h2>
        {message && <div>{message}</div>}
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
          <button
            type="submit"
            className={`login-button ${
              loginMutation.isPending || loginMutation.isSuccess
                ? "disabled"
                : ""
            }`}
            disabled={loginMutation.isPending || loginMutation.isSuccess}
          >
            {loginMutation.isPending || loginMutation.isSuccess ? (
              <Spinner />
            ) : (
              "Log in"
            )}
          </button>
        </form>
        <div className="form-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
