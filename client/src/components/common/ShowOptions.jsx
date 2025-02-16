import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faFlag,
  faEarthAmericas,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { useNotificationsMutations } from "../hooks/useNotificationsMutations";

export default function ShowOptions({
  options,
  setOptions,
  setData,
  setIsEditing,
  setComment,
  setEditingSpotlist,
  setEditingSpot,
  deleteSpotFromSpotlist,
  deleteSpotlist,
  deletePost,
  deletePostComment,
  deletePostReply,
  deleteSpot,
  deleteInsight,
  report,
}) {
  const { deleteNotificationMutation } = useNotificationsMutations();

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

  const editSpot = () => {
    setEditingSpot(true);
    setOptions(false);
  };

  return (
    <div className="aviable-options">
      {/* POST OPTIONS  */}

      {options.entity === "post" &&
        options.aviableOptions.includes("report") && (
          <div className="option" onClick={report}>
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "post" &&
        options.aviableOptions.includes("delete") && (
          <div className="option delete" onClick={deletePost}>
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
          <div className="option" onClick={report}>
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
          <div className="option delete" onClick={deletePostComment}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* REPLY OPTIONS  */}

      {options.entity === "reply" &&
        options.aviableOptions.includes("report") && (
          <div className="option" onClick={report}>
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
          <div className="option delete" onClick={deletePostReply}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOTLIST OPTIONS */}

      {options.entity === "spotlist" &&
        options.aviableOptions.includes("edit") && (
          <div
            className="option"
            onClick={() => {
              setEditingSpotlist(options.spotlistInfo);
              setOptions(false);
            }}
          >
            <FontAwesomeIcon icon={faPen} />
            <span>Edit</span>
          </div>
        )}

      {options.entity === "spotlist" &&
        options.aviableOptions.includes("delete") && (
          <div className="option delete" onClick={deleteSpotlist}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOTLIST CONTENT OPTIONS */}

      {options.entity === "spotlistSpot" &&
        options.aviableOptions.includes("delete") && (
          <div className="option delete" onClick={deleteSpotFromSpotlist}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* NOTIFICATION OPTIONS */}

      {options.entity === "notification" &&
        options.aviableOptions.includes("delete") && (
          <div
            className="option delete"
            onClick={() => {
              deleteNotificationMutation.mutate(options.notificationId);
              setOptions(false);
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* SPOT OPTIONS */}

      {options.entity === "spot" &&
        options.aviableOptions.includes("report") && (
          <div className="option" onClick={report}>
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
          <div className="option delete" onClick={deleteSpot}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      {/* INSIGHT OPTIONS */}

      {options.entity === "insight" &&
        options.aviableOptions.includes("report") && (
          <div className="option" onClick={report}>
            <FontAwesomeIcon icon={faFlag} />
            <span>Report</span>
          </div>
        )}

      {options.entity === "insight" &&
        options.aviableOptions.includes("delete") && (
          <div className="option delete" onClick={deleteInsight}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </div>
        )}

      <button onClick={() => setOptions(false)}>Cancel</button>
    </div>
  );
}
