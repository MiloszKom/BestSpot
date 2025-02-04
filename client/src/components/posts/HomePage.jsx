import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Posts } from "./Posts";
import LoadingWave from "../common/LoadingWave";
import useScrollPosition from "../utils/useScrollPosition";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AuthContext);
  const [options, setOptions] = useState(false);
  const [postType, setPostType] = useState(
    sessionStorage.getItem("postType") || "all"
  );

  const containerRef = useRef();
  useScrollPosition(containerRef);

  useEffect(() => {
    sessionStorage.setItem("postType", postType);
  }, [postType]);

  const fetchPosts = async ({ pageParam = 1 }) => {
    const response = await axios.get(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts?filter=${postType}&page=${pageParam}&limit=10`,
      { withCredentials: true }
    );
    return response.data;
  };

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", postType],
      queryFn: fetchPosts,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.data.length === 10) {
          return allPages.length + 1;
        }
        return undefined;
      },
    });

  const feedCompleteMessage = {
    message:
      postType === "all"
        ? "You've reached the end! No more posts to load."
        : "That's all from your friends! No more posts to show.",
  };

  if (!userData) return <div className="loader" />;
  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="posts-container" ref={containerRef}>
      <div className="post-sections">
        <div
          className={`section-el ${postType === "all" ? "active" : ""}`}
          onClick={() => setPostType("all")}
        >
          <span>All Posts</span>
        </div>
        <div
          className={`section-el ${postType === "friends" ? "active" : ""}`}
          onClick={() => setPostType("friends")}
        >
          <span>Friends' Posts</span>
        </div>
      </div>

      <Link to="create-post" className="post-add-box">
        <div
          className="profile-icon"
          style={{
            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
          }}
        ></div>
        <div className="post-add-div">Add a post here</div>
      </Link>

      <div className="posts-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="error-message">
            Failed to load posts. Try again later.
          </div>
        ) : posts.length > 0 ? (
          <Posts
            postElements={posts}
            options={options}
            setOptions={setOptions}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            feedCompleteMessage={feedCompleteMessage}
          />
        ) : (
          <div className="empty-posts-message">
            {postType === "all"
              ? "It looks like there are no posts available right now. Check back later!"
              : "No posts from your friends yet. Check back later!"}
          </div>
        )}
      </div>

      {location.pathname === "/create-post" && <Outlet />}
      {location.pathname === "/create-post" && (
        <div className="post-create-overlay" onClick={() => navigate("/")} />
      )}

      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
