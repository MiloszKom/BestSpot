import React, { useState, useContext, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Posts } from "./Posts";
import LoadingWave from "../common/LoadingWave";
import useScrollPosition from "../hooks/useScrollPosition";
import { getAllPosts, getFriendsPosts } from "../api/postsApis";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userData } = useContext(AuthContext);
  const [options, setOptions] = useState(false);
  const [postType, setPostType] = useState(
    sessionStorage.getItem("postType") || "all"
  );
  const queryClient = useQueryClient();

  const containerRef = useRef();
  useScrollPosition(containerRef, "scrolledHeightHome");

  useEffect(() => {
    sessionStorage.setItem("postType", postType);
    setTimeout(() => {
      queryClient.invalidateQueries(["posts"]);
    }, 1);
  }, [postType, queryClient]);

  const { data, isLoading, isError, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: postType === "all" ? getAllPosts : getFriendsPosts,
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

      {isLoggedIn && (
        <Link to="create-post" className="post-add-box">
          <div
            className="profile-icon"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
            }}
          ></div>
          <div className="post-add-div">Add a post here</div>
        </Link>
      )}

      <div className="posts-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="general-error">
            {error.response?.data?.message || "An unexpected error occurred"}
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
