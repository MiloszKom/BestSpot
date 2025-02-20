import React, { useState, useContext } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowLeft,
  faEllipsisVertical,
  faChevronDown,
  faHeart as solidHeart,
  faBookmark as solidBookmark,
  faXmark,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as regularHeart,
  faComment,
  faBookmark as regularBookmark,
} from "@fortawesome/free-regular-svg-icons";

import {
  formatPostTimestamp,
  formatTimeAgo,
  moveHighlightedItemToTop,
} from "../utils/helperFunctions";
import { highlightHandles } from "../utils/helperFunctions";

import ShowOptions from "../common/ShowOptions";
import PostTagging from "./components/PostTagging";

import PostImageCarousel from "./components/PostImageCarousel";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";

import { usePostsMutations } from "../hooks/usePostsMutations";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "../api/postsApis";

import { useProtectedAction } from "../auth/useProtectedAction";
import Report from "../common/Report";
import ErrorPage from "../pages/ErrorPage";
import Spinner from "../common/Spinner";

export default function PostDetail() {
  const { isLoggedIn, userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const highlightedCommentId = location.state?.highlightedCommentId;
  const highlightedReplyId = location.state?.highlightedReplyId;

  const [comment, setComment] = useState("");

  const [isReplying, setIsReplying] = useState(null);
  const [replyingToHandle, setReplyingToHandle] = useState("");
  const [visibleReplies, setVisibleReplies] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const [isTagging, setIsTagging] = useState(false);
  const [taggedWord, setTaggedWord] = useState("");

  const [options, setOptions] = useState(false);

  const protectedAction = useProtectedAction();

  const handleInputChange = (e) => {
    const content = e.target.value;
    setComment(content);

    const cursorPosition = e.target.selectionStart;
    const textUpToCursor = content.slice(0, cursorPosition);

    const match = textUpToCursor.match(/(^|\s)@(\w*)$/);
    if (match) {
      setIsTagging(true);
      setTaggedWord(match[2]);
    } else {
      setIsTagging(false);
      setTaggedWord("");
    }
  };

  const handleTagCompletion = (handle) => {
    const content = comment;
    const newContent = content.replace(/@(\w*)$/, `@${handle}`);

    setComment(newContent);
    setTaggedWord(handle);
    setIsTagging(false);
  };

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", params.postId],
    queryFn: () => getPost(params.postId),
  });

  if (data && highlightedCommentId) {
    moveHighlightedItemToTop(data, "comments", highlightedCommentId);
  }

  const post = data?.data;
  sessionStorage.setItem("currentlyViewedPost", params.postId);

  const {
    deletePostMutation,
    togglePostLikeMutation,
    togglePostBookmarkMutation,
    addPostCommentMutation,
    editPostCommentMutation,
    deletePostCommentMutation,
    toggleCommentLikeMutation,
    addPostReplyMutation,
    deletePostReplyMutation,
  } = usePostsMutations();
  const postType = "detail";

  const deletePost = () => {
    deletePostMutation.mutate(options.postId);
    setOptions(false);
    navigate(-1);
  };

  const togglePostLike = (postId, isLiked) => {
    protectedAction(() =>
      togglePostLikeMutation.mutate({ postId, isLiked, postType })
    );
  };

  const togglePostBookmark = (postId, isBookmarked) => {
    protectedAction(() =>
      togglePostBookmarkMutation.mutate({
        postId,
        isBookmarked,
        postType,
      })
    );
  };

  const addPostComment = () => {
    addPostCommentMutation.mutate(
      { comment, postId: post._id },
      {
        onSuccess: () => {
          setComment("");
        },
      }
    );
  };

  const editPostComment = () => {
    editPostCommentMutation.mutate(
      {
        comment,
        postId: post._id,
        commentId: isEditing.commentId,
        replyId: isEditing.replyId,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setComment("");
        },
      }
    );
  };

  const deletePostComment = () => {
    deletePostCommentMutation.mutate({
      postId: post._id,
      commentId: options.commentId,
    });
    setOptions(false);
  };

  const toggleCommentLike = (isLiked, commentId, replyId) => {
    protectedAction(() =>
      toggleCommentLikeMutation.mutate({
        isLiked,
        postId: post._id,
        commentId,
        replyId,
        userData,
      })
    );
  };

  const addPostReply = () => {
    addPostReplyMutation.mutate(
      { comment, postId: post._id, commentId: isReplying },
      {
        onSuccess: () => {
          setComment("");
          setIsReplying(null);
        },
      }
    );
  };

  const deletePostReply = () => {
    deletePostReplyMutation.mutate({
      postId: post._id,
      commentId: options.commentId,
      replyId: options.replyId,
    });
    setOptions(false);
  };

  const report = () => {
    setIsReporting({
      postId: options.postId,
      commentId: options.commentId,
      replyId: options.replyId,
    });
    setOptions(false);
  };

  if (isLoading) return <div className="loader" />;

  if (isError) return <ErrorPage error={error} />;

  const postOptions =
    post.author._id === userData?._id || userData.role === "admin"
      ? ["delete"]
      : ["report"];

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <div className="svg-wrapper" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>Post</span>
      </div>
      <div className="post-detail-body">
        <div className="post-detail-author">
          <Link
            to={`/${post.author.handle}`}
            className="profile-icon"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${post.author.photo})`,
            }}
          ></Link>
          <div className="post-detail-author-info">
            <Link to={`/${post.author.handle}`} className="username">
              {post.author.name}
            </Link>
            <div className="handle">@{post.author.handle}</div>
          </div>
          <div className="post-options">
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
            {options.postId === post._id && !options.commentId && (
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
        <span className="post-detail-date">
          {formatPostTimestamp(post.createdAt)}
        </span>
        <div className="post-detail-options">
          <div
            className="option"
            onClick={() => togglePostLike(post._id, post.isLiked)}
          >
            <div className={`svg-wrapper ${post.isLiked ? "liked" : ""}`}>
              <FontAwesomeIcon
                icon={post.isLiked ? solidHeart : regularHeart}
              />
            </div>
            <span>{post.likeCount}</span>
          </div>
          <div className="option">
            <div className="svg-wrapper">
              <FontAwesomeIcon icon={faComment} />
            </div>
            <span>{post.totalComments}</span>
          </div>
          <div
            className="option"
            onClick={() => togglePostBookmark(post._id, post.isBookmarked)}
          >
            <div
              className={`svg-wrapper ${post.isBookmarked ? "bookmarked" : ""}`}
            >
              <FontAwesomeIcon
                icon={post.isBookmarked ? solidBookmark : regularBookmark}
              />
            </div>
            <span>{post.bookmarkCount}</span>
          </div>
        </div>

        {post.comments.map((comment) => {
          const commentLikeCount = comment.likes.filter(
            (like) => like.isLikeActive === true
          ).length;

          const isCommentLiked = comment.likes.some(
            (like) => like._id === userData?._id && like.isLikeActive
          );

          const isHighlightedComment = highlightedCommentId === comment._id;
          const hasHighlightedReply =
            isHighlightedComment && highlightedReplyId;

          let isRepliesVisible =
            hasHighlightedReply || visibleReplies[comment._id];

          const commentOptions =
            comment.user._id === userData?._id
              ? ["delete", "edit"]
              : post.author._id === userData?._id || userData.role === "admin"
              ? ["delete", "report"]
              : ["report"];

          const isHighlighted =
            highlightedCommentId === comment._id && !highlightedReplyId;

          return (
            <div
              className={`post-detail-comment ${isHighlighted ? "active" : ""}`}
              key={comment._id}
            >
              <Link
                to={`/${comment.user.handle}`}
                className="profile-icon"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${comment.user.photo})`,
                }}
              ></Link>
              <div className="comment-header">
                <Link to={`/${comment.user.handle}`} className="user-name">
                  {comment.user.name}
                </Link>
                <span className="user-handle">@{comment.user.handle}</span>
                <span className="timestamp">
                  · {formatTimeAgo(comment.timestamp)}
                </span>
                {comment.isEdited && (
                  <span className="is-edited">(edited)</span>
                )}
              </div>
              <div className="post-options">
                <button
                  className="options svg-wrapper"
                  onClick={() =>
                    protectedAction(() =>
                      setOptions({
                        postId: post._id,
                        commentId: comment._id,
                        aviableOptions: commentOptions,
                        entity: "comment",
                        message: comment.comment,
                      })
                    )
                  }
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                {options.commentId === comment._id && !options.replyId && (
                  <ShowOptions
                    options={options}
                    setOptions={setOptions}
                    setIsEditing={setIsEditing}
                    setComment={setComment}
                    deletePostComment={deletePostComment}
                    report={report}
                  />
                )}
              </div>
              <div className="comment-content">
                {highlightHandles(comment.comment)}
              </div>
              <div className="comment-options">
                <div
                  className="comment-option-like"
                  onClick={() => toggleCommentLike(isCommentLiked, comment._id)}
                >
                  {isCommentLiked ? (
                    <div className="svg-wrapper liked">
                      <FontAwesomeIcon icon={solidHeart} />
                    </div>
                  ) : (
                    <div className="svg-wrapper">
                      <FontAwesomeIcon icon={regularHeart} />
                    </div>
                  )}
                  <span>{commentLikeCount}</span>
                </div>
                <div
                  className="comment-option-reply"
                  onClick={() => {
                    setIsEditing(false);
                    setIsReplying(comment._id);
                    setReplyingToHandle(comment.user.handle);
                    setComment(`@${comment.user.handle} `);
                  }}
                >
                  Reply
                </div>
              </div>
              {comment.replies.length > 0 && (
                <div
                  className="view-comment-replies"
                  onClick={() => toggleReplies(comment._id)}
                >
                  <span>
                    {`${isRepliesVisible ? "Hide" : "View"} ${
                      comment.replies.length
                    } replies`}
                  </span>
                  <FontAwesomeIcon
                    icon={isRepliesVisible ? faChevronUp : faChevronDown}
                  />
                </div>
              )}
              {isRepliesVisible && (
                <div className="post-detail-comment-replies">
                  {comment.replies.map((reply) => {
                    const replyLikeCount = reply.likes.filter(
                      (like) => like.isLikeActive === true
                    ).length;
                    const isReplyLiked = reply.likes.some(
                      (like) => like._id === userData?._id && like.isLikeActive
                    );

                    const replyOptions =
                      reply.user._id === userData?._id
                        ? ["delete", "edit"]
                        : post.author._id === userData?._id ||
                          userData.role === "admin"
                        ? ["delete", "report"]
                        : ["report"];

                    const isHiglighted = reply._id === highlightedReplyId;

                    return (
                      <div
                        className={`post-detail-comment ${
                          isHiglighted ? "active" : ""
                        }`}
                        key={reply._id}
                      >
                        <Link
                          to={`/${reply.user.handle}`}
                          className="profile-icon"
                          style={{
                            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${reply.user.photo})`,
                          }}
                        ></Link>
                        <div className="comment-header">
                          <Link
                            to={`/${reply.user.handle}`}
                            className="user-name"
                          >
                            {reply.user.name}
                          </Link>
                          <span className="user-handle">
                            @{reply.user.handle}
                          </span>
                          <span className="timestamp">
                            · {formatTimeAgo(reply.timestamp)}
                          </span>
                          {reply.isEdited && (
                            <span className="is-edited">(edited)</span>
                          )}
                        </div>
                        <div className="post-options">
                          <div
                            className="options svg-wrapper"
                            onClick={() =>
                              protectedAction(() =>
                                setOptions({
                                  postId: post._id,
                                  commentId: comment._id,
                                  replyId: reply._id,
                                  aviableOptions: replyOptions,
                                  entity: "reply",
                                  message: reply.comment,
                                })
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                          </div>
                          {options.replyId === reply._id && (
                            <ShowOptions
                              options={options}
                              setOptions={setOptions}
                              setIsEditing={setIsEditing}
                              setComment={setComment}
                              deletePostReply={deletePostReply}
                              report={report}
                            />
                          )}
                        </div>
                        <div className="comment-content">
                          {highlightHandles(reply.comment)}
                        </div>
                        <div className="comment-options">
                          <div
                            className="comment-option-like"
                            onClick={() =>
                              toggleCommentLike(
                                isReplyLiked,
                                comment._id,
                                reply._id
                              )
                            }
                          >
                            {isReplyLiked ? (
                              <div className="svg-wrapper liked">
                                <FontAwesomeIcon icon={solidHeart} />
                              </div>
                            ) : (
                              <div className="svg-wrapper">
                                <FontAwesomeIcon icon={regularHeart} />
                              </div>
                            )}
                            <span>{replyLikeCount}</span>
                          </div>
                          <div
                            className="comment-option-reply"
                            onClick={() => {
                              setIsEditing(false);
                              setIsReplying(comment._id);
                              setReplyingToHandle(reply.user.handle);
                              setComment(`@${reply.user.handle} `);
                            }}
                          >
                            Reply
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isLoggedIn && (
        <div className="post-detail-your-comment">
          {isTagging && (
            <PostTagging
              taggedWord={taggedWord}
              setTaggedWord={setTaggedWord}
              setIsTagging={setIsTagging}
              handleTagCompletion={handleTagCompletion}
            />
          )}
          <div
            className="reply-info"
            style={{
              marginBottom: `${isReplying || isEditing ? "0" : "-50px"}`,
            }}
          >
            {isEditing ? (
              <span>Editting message</span>
            ) : (
              <span>Replying to @{replyingToHandle}</span>
            )}
            <div
              className="svg-wrapper"
              onClick={() => {
                setIsReplying(null);
                setReplyingToHandle("");
                setComment("");
                setIsEditing(null);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </div>
          </div>
          <div className="input-wrapper">
            <div
              className="profile-icon"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData?.photo})`,
              }}
            ></div>
            <textarea
              placeholder="Write a comment"
              value={comment}
              onChange={(e) => handleInputChange(e)}
            />
            <button
              className={`post-comment-btn ${
                addPostCommentMutation.isPending ||
                editPostCommentMutation.isPending ||
                addPostReplyMutation.isPending ||
                !comment ||
                isEditing?.messageContent === comment
                  ? "disabled"
                  : ""
              }`}
              onClick={
                isEditing
                  ? editPostComment
                  : isReplying
                  ? addPostReply
                  : addPostComment
              }
              disabled={
                addPostCommentMutation.isPending ||
                editPostCommentMutation.isPending ||
                addPostReplyMutation.isPending ||
                !comment ||
                isEditing?.messageContent === comment
              }
            >
              {addPostCommentMutation.isPending ||
              editPostCommentMutation.isPending ||
              addPostReplyMutation.isPending ? (
                <Spinner />
              ) : isEditing ? (
                "Edit"
              ) : isReplying ? (
                "Reply"
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      )}
      {isReporting && (
        <>
          <Report isReporting={isReporting} setIsReporting={setIsReporting} />
          <div className="spotlist-shade" />
        </>
      )}
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
