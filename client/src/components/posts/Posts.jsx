import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

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
import { highlightHandles } from "../utils/helperFunctions";
import ShowOptions from "../common/ShowOptions";
import PostImageCarousel from "./components/PostImageCarousel";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";
import LoadingWave from "../common/LoadingWave";

import { usePostsMutations } from "../hooks/usePostsMutations";
import { useProtectedAction } from "../auth/useProtectedAction";
import Report from "../common/Report";

export function Posts({
  postElements,
  options,
  setOptions,
  hasNextPage,
  fetchNextPage,
  feedCompleteMessage,
}) {
  const [isReporting, setIsReporting] = useState(false);

  const posts = postElements;
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [fetchNextPage, inView]);

  const {
    deletePostMutation,
    togglePostLikeMutation,
    togglePostBookmarkMutation,
  } = usePostsMutations();

  const protectedAction = useProtectedAction();

  const deletePost = () => {
    deletePostMutation.mutate(options.postId);
    setOptions(false);
  };

  const togglePostLike = (postId, isLiked) => {
    protectedAction(() => togglePostLikeMutation.mutate({ postId, isLiked }));
  };

  const togglePostBookmark = (postId, isBookmarked, post) => {
    protectedAction(() =>
      togglePostBookmarkMutation.mutate({
        postId,
        isBookmarked,
        post,
      })
    );
  };

  const report = () => {
    setIsReporting({
      postId: options.postId,
    });
    setOptions(false);
  };

  return (
    <div className="posts-wrapper">
      {posts.map((post) => {
        const postOptions =
          post.author._id === userData?._id || userData?.role === "admin"
            ? ["delete"]
            : ["report"];

        return (
          <Link
            to={`/${post.author.handle}/${post._id}`}
            className="post"
            key={post._id}
          >
            <div
              className="profile-icon"
              style={{
                backgroundImage: `url(${post.author.photo})`,
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
                      protectedAction(() =>
                        setOptions({
                          postId: post._id,
                          aviableOptions: postOptions,
                          entity: "post",
                        })
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  </button>
                  {options.postId === post._id && (
                    <ShowOptions
                      options={options}
                      deletePost={deletePost}
                      report={report}
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
                    togglePostLike(post._id, post.isLiked);
                  }}
                >
                  <div className={`svg-wrapper ${post.isLiked ? "liked" : ""}`}>
                    <FontAwesomeIcon
                      icon={post.isLiked ? solidHeart : regularHeart}
                    />
                  </div>
                  <span>{post.likeCount}</span>
                </div>
                <div className="footer-el">
                  <button className="svg-wrapper">
                    <FontAwesomeIcon icon={faComment} />
                  </button>
                  <span>{post.totalComments}</span>
                </div>
                <div
                  className="footer-el bookmark"
                  onClick={(e) => {
                    e.preventDefault();
                    togglePostBookmark(post._id, post.isBookmarked, post);
                  }}
                >
                  <button
                    className={`svg-wrapper ${
                      post.isBookmarked ? "bookmarked" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={post.isBookmarked ? solidBookmark : regularBookmark}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      {isReporting && (
        <>
          <Report isReporting={isReporting} setIsReporting={setIsReporting} />
          <div className="spotlist-shade" />
        </>
      )}
      <div className="post-fetch-info" ref={ref}>
        {hasNextPage ? <LoadingWave /> : feedCompleteMessage?.message}
      </div>
    </div>
  );
}
