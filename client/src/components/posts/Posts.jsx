import React, { useEffect, useState, useContext } from "react";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faHeart as regularHeart,
  faComment,
  faBookmark,
} from "@fortawesome/free-regular-svg-icons";

import {
  faEllipsisVertical,
  faHeart as solidHeart,
} from "@fortawesome/free-solid-svg-icons";

import { formatTimeAgo } from "../utils/helperFunctions";
import { togglePostLike } from "../utils/postUtils";
import ShowOptions from "./ShowOptions";
import PostImageCarousel from "./components/PostImageCarousel";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";

export default function Posts() {
  const { userData } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
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

  const savePost = () => {
    console.log("post saveds");
  };

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

        {posts.map((post) => {
          const likeCount = post.likes.filter(
            (like) => like.isLikeActive === true
          );

          const isLiked = post.likes.some(
            (like) => like._id === userData._id && like.isLikeActive
          );

          const postOptions =
            post.author._id === userData._id ? ["delete"] : ["report"];

          return (
            <Link
              to={`/${post.author.handle}/${post._id}`}
              className="post"
              key={post._id}
            >
              <div
                className="profile-icon"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${post.author.photo})`,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${post.author.handle}`);
                }}
              ></div>
              <div className="post-info">
                <div className="post-header">
                  <div className="post-user-info">
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${post.author.handle}`);
                      }}
                      className="username"
                    >
                      {post.author.name}
                    </span>
                    <span className="handle">@{post.author.handle}</span>
                    <span className="timestamp">
                      · {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <div
                    className="post-options"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      className="svg-wrapper"
                      onClick={() =>
                        setOptions({
                          postId: post._id,
                          aviableOptions: postOptions,
                          entity: "post",
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    {options.postId === post._id && (
                      <ShowOptions
                        options={options}
                        setOptions={setOptions}
                        setData={setPosts}
                      />
                    )}
                  </div>
                </div>
                <div className="post-content">
                  {post.photos && (
                    <div
                      className="post-content-photos"
                      onClick={(e) => e.preventDefault()}
                    >
                      <PostImageCarousel photoPreviews={post.photos} />
                    </div>
                  )}
                  {post.content && (
                    <div className="post-content-text">{post.content}</div>
                  )}
                  {post.spots.length > 0 && (
                    <div className="post-content-spots">
                      <PostSpots selectedSpots={post.spots} />
                    </div>
                  )}
                  {post.spotlists.length > 0 && (
                    <div className="post-content-spotlists">
                      <PostSpotlists selectedSpotlists={post.spotlists} />
                    </div>
                  )}
                </div>
                <div className="post-footer">
                  <div
                    className="footer-el"
                    onClick={(e) => {
                      e.preventDefault();
                      togglePostLike(
                        post._id,
                        isLiked,
                        userData,
                        setPosts,
                        showAlert,
                        "posts"
                      );
                    }}
                  >
                    {isLiked ? (
                      <button className="svg-wrapper liked">
                        <FontAwesomeIcon icon={solidHeart} />
                      </button>
                    ) : (
                      <button className="svg-wrapper">
                        <FontAwesomeIcon icon={regularHeart} />
                      </button>
                    )}
                    <span>{likeCount.length}</span>
                  </div>
                  <div className="footer-el">
                    <button className="svg-wrapper">
                      <FontAwesomeIcon icon={faComment} />
                    </button>
                    <span>{post.comments.length}</span>
                  </div>
                  <div
                    className="footer-el bookmark"
                    onClick={(e) => {
                      e.preventDefault();
                      savePost();
                    }}
                  >
                    <button className="svg-wrapper">
                      <FontAwesomeIcon icon={faBookmark} />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
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
