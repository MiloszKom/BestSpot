import React, { useContext } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faFlag } from "@fortawesome/free-solid-svg-icons";

import { AlertContext } from "../context/AlertContext";

import { deletePost, deleteComment, deleteSpotlist } from "../utils/postUtils";

export default function ShowOptions({
  options,
  setOptions,
  setData,
  setIsEditing,
  setComment,
  setEditingSpotlist,
}) {
  const { showAlert } = useContext(AlertContext);

  const editComment = () => {
    setIsEditing({
      commentId: options.commentId,
      messageContent: options.message,
    });
    setComment(options.message);
    setOptions(false);
  };

  const editReply = () => {
    setIsEditing({
      commentId: options.commentId,
      replyId: options.replyId,
      messageContent: options.message,
    });
    setComment(options.message);
    setOptions(false);
  };

  const editSpotlist = () => {
    setEditingSpotlist(true);
    setOptions(false);
  };

  return (
    <div className="aviable-options">
      {console.log(options)}

      {/* POST OPTIONS  */}

      {options.entity === "post" &&
        options.aviableOptions.includes("report") && (
          <div className="option">
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "post" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() => deletePost(options, setOptions, setData, showAlert)}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* COMMENT OPTIONS  */}

      {options.entity === "comment" &&
        options.aviableOptions.includes("report") && (
          <div className="option">
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "comment" &&
        options.aviableOptions.includes("edit") && (
          <div className="option" onClick={editComment}>
            <FontAwesomeIcon icon={faPen} />
            <span>Edit</span>
          </div>
        )}

      {options.entity === "comment" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() =>
              deleteComment(options, setOptions, setData, showAlert)
            }
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* REPLY OPTIONS  */}

      {options.entity === "reply" &&
        options.aviableOptions.includes("report") && (
          <div className="option">
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "reply" &&
        options.aviableOptions.includes("edit") && (
          <div className="option" onClick={editReply}>
            <FontAwesomeIcon icon={faPen} />
            <span>Edit</span>
          </div>
        )}

      {options.entity === "reply" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() => deletePost(options, setOptions, setData, showAlert)}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOTLIST OPTIONS */}

      {options.entity === "spotlist" &&
        options.aviableOptions.includes("edit") && (
          <div className="option" onClick={editSpotlist}>
            <FontAwesomeIcon icon={faPen} />
            <span>Edit</span>
          </div>
        )}

      {options.entity === "spotlist" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() =>
              deleteSpotlist(options, setOptions, setData, showAlert)
            }
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      <button onClick={() => setOptions(false)}>Cancel</button>
    </div>
  );
}
