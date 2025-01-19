import React, { useEffect, useState, useContext } from "react";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";

import { Posts } from "./Posts";

export default function HomePage() {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState(null);
  const [options, setOptions] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts`,
          withCredentials: true,
        });
        console.log(res);

        setPosts(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (userData) fetchPosts();
  }, [userData]);

  if (!posts || !userData) return <div className="loader"></div>;

  return (
    <div className="posts-container">
      <main className="posts-content">
        <Link to="create-post" className="post-add-box">
          <div
            className="profile-icon"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
            }}
          ></div>
          <div className="post-add-div">Add a post here</div>
        </Link>

        <Posts postElements={posts} options={options} setOptions={setOptions} />

        {location.pathname === "/home/create-post" && <Outlet />}
        {location.pathname === "/home/create-post" && (
          <div
            className="post-create-overlay"
            onClick={() => navigate("/home")}
          ></div>
        )}

        {options && (
          <div className="options-overlay" onClick={() => setOptions(false)} />
        )}
      </main>
    </div>
  );
}
