import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowLeft,
  faEllipsisVertical,
  faChevronDown,
  faHeart as solidHeart,
  faXmark,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as regularHeart,
  faComment,
  faBookmark,
} from "@fortawesome/free-regular-svg-icons";

import { formatPostTimestamp, formatTimeAgo } from "../utils/helperFunctions";
import {
  togglePostLike,
  postComment,
  toggleCommentLike,
  postReply,
  toggleReplyLike,
  editMessage,
  highlightHandles,
} from "../utils/postUtils";

import ShowOptions from "./ShowOptions";
import PostTagging from "./PostTagging";

export default function PostDetail() {
  const { userData } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const params = useParams();

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");

  const [isReplying, setIsReplying] = useState(null);
  const [replyingToHandle, setReplyingToHandle] = useState("");
  const [visibleReplies, setVisibleReplies] = useState({});

  const [showingOptions, setShowingOptions] = useState(null);
  const [entityType, setEntityType] = useState(null);

  const [chosenComment, setChosenComment] = useState(null);
  const [chosenReply, setChosenReply] = useState(null);
  const [messageContent, setMessageContent] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [isTagging, setIsTagging] = useState(false);
  const [taggedWord, setTaggedWord] = useState("");

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${params.postId}?sortBy=likes`,
          withCredentials: true,
        });
        console.log(res);

        setPost(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPost();
  }, [userData]);

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (!post || !userData) return <div className="loader"></div>;

  const postOptions =
    post.author._id === userData._id ? ["delete"] : ["report"];

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
          <div>
            <Link to={`/${post.author.handle}`} className="username">
              {post.author.name}
            </Link>
            <div className="handle">@{post.author.handle}</div>
          </div>
          <div
            className="svg-wrapper"
            onClick={(e) => {
              setShowingOptions(postOptions);
              setEntityType("post");
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </div>
        </div>
        <div className="post-detail-content">
          {highlightHandles(post.content)}
        </div>
        <span className="post-detail-date">
          {formatPostTimestamp(post.createdAt)}
        </span>
        <div className="post-detail-options">
          <div
            className="option"
            onClick={() =>
              togglePostLike(
                post._id,
                post.likes.includes(userData._id),
                userData,
                setPost,
                showAlert,
                "postDetail"
              )
            }
          >
            {post.likes.includes(userData._id) ? (
              <div className="svg-wrapper liked">
                <FontAwesomeIcon icon={solidHeart} />
              </div>
            ) : (
              <div className="svg-wrapper">
                <FontAwesomeIcon icon={regularHeart} />
              </div>
            )}
            <span>{post.likes.length}</span>
          </div>
          <div className="option">
            <div className="svg-wrapper">
              <FontAwesomeIcon icon={faComment} />
            </div>
            <span>{post.totalComments}</span>
          </div>
          <div className="option">
            <div className="svg-wrapper">
              <FontAwesomeIcon icon={faBookmark} />
            </div>
            <span>0</span>
          </div>
        </div>

        {post.comments.map((comment) => {
          const isLiked = comment.likes.includes(userData._id);
          const isRepliesVisible = visibleReplies[comment._id];
          const commentOptions =
            comment.user._id === userData._id
              ? ["delete", "edit"]
              : post.author._id === userData._id
              ? ["delete", "report"]
              : ["report"];

          return (
            <div className="post-detail-comment" key={comment._id}>
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
              <div
                className="options svg-wrapper"
                onClick={() => {
                  setShowingOptions(commentOptions);
                  setEntityType("comment");
                  setChosenComment(comment._id);
                  setMessageContent(comment.comment);
                }}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </div>
              <div className="comment-content">
                {highlightHandles(comment.comment)}
              </div>
              <div className="comment-options">
                <div
                  className="comment-option-like"
                  onClick={() =>
                    toggleCommentLike(
                      params.postId,
                      comment._id,
                      isLiked,
                      userData,
                      setPost,
                      showAlert
                    )
                  }
                >
                  {isLiked ? (
                    <div className="svg-wrapper liked">
                      <FontAwesomeIcon icon={solidHeart} />
                    </div>
                  ) : (
                    <div className="svg-wrapper">
                      <FontAwesomeIcon icon={regularHeart} />
                    </div>
                  )}
                  <span>{comment.likes.length}</span>
                </div>
                <div
                  className="comment-option-reply"
                  onClick={() => {
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
                    const isLiked = reply.likes.includes(userData._id);
                    const replyOptions =
                      reply.user._id === userData._id
                        ? ["delete", "edit"]
                        : post.author._id === userData._id
                        ? ["delete", "report"]
                        : ["report"];

                    return (
                      <div className="post-detail-comment">
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
                        <div
                          className="options svg-wrapper"
                          onClick={() => {
                            setShowingOptions(replyOptions);
                            setEntityType("reply");
                            setChosenComment(comment._id);
                            setChosenReply(reply._id);
                            setMessageContent(reply.comment);
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </div>
                        <div className="comment-content">
                          {highlightHandles(reply.comment)}
                        </div>
                        <div className="comment-options">
                          <div
                            className="comment-option-like"
                            onClick={() =>
                              toggleReplyLike(
                                isLiked,
                                params.postId,
                                comment._id,
                                reply._id,
                                setPost,
                                userData
                              )
                            }
                          >
                            {isLiked ? (
                              <div className="svg-wrapper liked">
                                <FontAwesomeIcon icon={solidHeart} />
                              </div>
                            ) : (
                              <div className="svg-wrapper">
                                <FontAwesomeIcon icon={regularHeart} />
                              </div>
                            )}
                            <span>{reply.likes.length}</span>
                          </div>
                          <div
                            className="comment-option-reply"
                            onClick={() => {
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
              <span>Editting comment</span>
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
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
              }}
            ></div>
            <textarea
              placeholder="Write a comment"
              value={comment}
              onChange={(e) => handleInputChange(e)}
            />
            <button
              className={`post-comment-btn ${
                !comment || isEditing?.messageContent === comment
                  ? "disabled"
                  : ""
              }`}
              onClick={() =>
                isEditing
                  ? editMessage(
                      comment,
                      params.postId,
                      isEditing,
                      setPost,
                      setIsEditing,
                      setComment,
                      showAlert
                    )
                  : isReplying
                  ? postReply(
                      params.postId,
                      comment,
                      isReplying,
                      setComment,
                      setIsReplying,
                      setReplyingToHandle,
                      setPost
                    )
                  : postComment(
                      params.postId,
                      comment,
                      setPost,
                      userData,
                      setComment,
                      showAlert
                    )
              }
            >
              {isEditing ? "Edit" : isReplying ? "Reply" : "Post"}
            </button>
          </div>
        </div>
      </div>
      {showingOptions && (
        <div>
          <ShowOptions
            showingOptions={showingOptions}
            setShowingOptions={setShowingOptions}
            postId={params.postId}
            setData={setPost}
            entityType={entityType}
            commentId={chosenComment}
            replyId={chosenReply}
            setIsEditing={setIsEditing}
            content={messageContent}
            setComment={setComment}
          />
          <div className="overlay"></div>
        </div>
      )}
    </div>
  );
}
