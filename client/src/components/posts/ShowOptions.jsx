import React, { useState, useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

import { deletePost, deleteComment, deleteReply } from "../utils/postUtils";

export default function ShowOptions({
  showingOptions,
  setShowingOptions,
  postId,
  setData,
  entityType,
  commentId,
  replyId,
  setIsEditing,
  content,
  setComment,
}) {
  const { showAlert } = useContext(AlertContext);

  const editComment = () => {
    setIsEditing({
      commentId: commentId,
      messageContent: content,
    });
    setComment(content);
    setShowingOptions(false);
  };

  const editReply = () => {
    setIsEditing({
      commentId: commentId,
      replyId: replyId,
      messageContent: content,
    });
    setComment(content);
    setShowingOptions(false);
  };

  return (
    <div className="aviable-options">
      {showingOptions.includes("delete") && entityType === "post" && (
        <div
          className="option delete"
          onClick={() =>
            deletePost(postId, setData, setShowingOptions, showAlert)
          }
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete post</span>
        </div>
      )}

      {showingOptions.includes("report") && entityType === "post" && (
        <div className="option">
          <FontAwesomeIcon icon={faFlag} />
          <span>Report post</span>
        </div>
      )}

      {showingOptions.includes("report") && entityType === "comment" && (
        <div className="option">
          <FontAwesomeIcon icon={faFlag} />
          <span>Report comment</span>
        </div>
      )}

      {showingOptions.includes("edit") && entityType === "comment" && (
        <div className="option" onClick={editComment}>
          <FontAwesomeIcon icon={faPen} />
          <span>Edit comment</span>
        </div>
      )}

      {showingOptions.includes("delete") && entityType === "comment" && (
        <div
          className="option delete"
          onClick={() =>
            deleteComment(
              postId,
              commentId,
              setData,
              setShowingOptions,
              showAlert
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete comment</span>
        </div>
      )}

      {showingOptions.includes("report") && entityType === "reply" && (
        <div className="option">
          <FontAwesomeIcon icon={faFlag} />
          <span>Report reply</span>
        </div>
      )}

      {showingOptions.includes("edit") && entityType === "reply" && (
        <div className="option" onClick={editReply}>
          <FontAwesomeIcon icon={faPen} />
          <span>Edit reply</span>
        </div>
      )}

      {showingOptions.includes("delete") && entityType === "reply" && (
        <div
          className="option delete"
          onClick={() =>
            deleteReply(
              postId,
              commentId,
              replyId,
              setData,
              setShowingOptions,
              showAlert
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete reply</span>
        </div>
      )}

      <button onClick={() => setShowingOptions(false)}>Cancel</button>
    </div>
  );
}
