import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useInView } from "react-intersection-observer";

import {
  faHeart as regularHeart,
  faComment,
  faBookmark as regularBookmark,
} from "@fortawesome/free-regular-svg-icons";

import {
  faEllipsisVertical,
  faHeart as solidHeart,
  faBookmark as solidBookmark,
} from "@fortawesome/free-solid-svg-icons";

import { formatTimeAgo } from "../utils/helperFunctions";
import {
  togglePostLike,
  togglePostBookmark,
  highlightHandles,
} from "../utils/postUtils";
import ShowOptions from "../common/ShowOptions";
import PostImageCarousel from "./components/PostImageCarousel";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";
import LoadingWave from "../common/LoadingWave";

export function Posts({
  postElements,
  options,
  setOptions,
  Unbookmark,
  hasNextPage,
  fetchNextPage,
  feedCompleteMessage,
}) {
  const [posts, setPosts] = useState(postElements);
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert } = useContext(AlertContext);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [fetchNextPage, inView]);

  useEffect(() => {
    setPosts(postElements);
  }, [postElements]);

  return (
    <div className="posts-wrapper">
      {posts.map((post) => {
        const likeCount = post.likes.filter(
          (like) => like.isLikeActive === true
        );

        const isLiked = post.likes.some(
          (like) => like._id === userData._id && like.isLikeActive
        );

        const isPostBookmarked = post.bookmarks.some(
          (bookmark) => bookmark._id === userData._id && bookmark.isLikeActive
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
                      Unbookmark={Unbookmark}
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
                  <div className="post-content-text">
                    {highlightHandles(post.content)}
                  </div>
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
                  <div className={`svg-wrapper ${isLiked ? "liked" : ""}`}>
                    <FontAwesomeIcon
                      icon={isLiked ? solidHeart : regularHeart}
                    />
                  </div>
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
                    togglePostBookmark(
                      post._id,
                      isPostBookmarked,
                      userData,
                      setPosts,
                      "posts",
                      showAlert
                    );
                    if (isPostBookmarked && Unbookmark) {
                      Unbookmark(post._id);
                    }
                  }}
                >
                  <button
                    className={`svg-wrapper ${
                      isPostBookmarked ? "bookmarked" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isPostBookmarked ? solidBookmark : regularBookmark}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      <div className="post-fetch-info" ref={ref}>
        {hasNextPage ? <LoadingWave /> : feedCompleteMessage?.message}
      </div>
    </div>
  );
}
