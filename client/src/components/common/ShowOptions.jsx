import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFlag,
  faEarthAmericas,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { AlertContext } from "../context/AlertContext";

import {
  deletePost,
  deleteComment,
  deleteSpotlist,
  deleteFromSpotlist,
  deleteNotification,
  deleteSpot,
  deleteInsight,
} from "../utils/showOptionsUtils";

export default function ShowOptions({
  options,
  setOptions,
  setData,
  setIsEditing,
  setComment,
  setEditingSpotlist,
  setEditingSpot,
  Unbookmark,
}) {
  const navigate = useNavigate();

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
    setEditingSpotlist(options.spotlistInfo);
    setOptions(false);
  };

  const editSpot = () => {
    setEditingSpot(true);
    setOptions(false);
  };

  const deleteSpotAndMove = () => {
    deleteSpot(options, setOptions, showAlert);
  };

  const deleteSpotlistAndMove = () => {
    deleteSpotlist(options, setOptions, setData, showAlert);
    if (options.spotlistInfo.context === "spotlistContent") {
      setTimeout(() => {
        if (!options) navigate("/spotlists");
      }, 500);
    }
  };

  return (
    <div className="aviable-options">
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
            onClick={() =>
              deletePost(options, setOptions, setData, Unbookmark, showAlert)
            }
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* POST CREATE OPTIONS  */}

      {options.entity === "postCreate" &&
        options.aviableOptions.includes("public") && (
          <div
            className="option"
            onClick={() => {
              setData("Public");
              setOptions(false);
            }}
          >
            <FontAwesomeIcon icon={faEarthAmericas} />
            <span>Public</span>
          </div>
        )}

      {options.entity === "postCreate" &&
        options.aviableOptions.includes("friends") && (
          <div
            className="option"
            onClick={() => {
              setData("Friends");
              setOptions(false);
            }}
          >
            <FontAwesomeIcon icon={faUserGroup} />
            <span>Friends</span>
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
          <div className="option delete" onClick={deleteSpotlistAndMove}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOTLIST CONTENT OPTIONS */}

      {options.entity === "spotlistSpot" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() =>
              deleteFromSpotlist(options, setOptions, setData, showAlert)
            }
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* NOTIFICATION OPTIONS */}

      {options.entity === "notification" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() =>
              deleteNotification(options, setOptions, setData, showAlert)
            }
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOT OPTIONS */}

      {options.entity === "spot" &&
        options.aviableOptions.includes("report") && (
          <div className="option">
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "spot" && options.aviableOptions.includes("edit") && (
        <div className="option" onClick={editSpot}>
          <FontAwesomeIcon icon={faPen} />
          <span>Edit</span>
        </div>
      )}

      {options.entity === "spot" &&
        options.aviableOptions.includes("delete") && (
          <div className="option delete" onClick={deleteSpotAndMove}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* INSIGHT OPTIONS */}

      {options.entity === "insight" &&
        options.aviableOptions.includes("report") && (
          <div className="option">
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "insight" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() =>
              deleteInsight(options, setOptions, setData, showAlert)
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
