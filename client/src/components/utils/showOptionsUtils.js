import axios from "axios";
import { Link } from "react-router-dom";

// Post Related Options
export const deletePost = async (options, setOptions, setData, showAlert) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${options.postId}`,
      withCredentials: true,
    });
    showAlert(res.data.message, res.data.status);
    setData((prevPosts) => {
      if (Array.isArray(prevPosts)) {
        return prevPosts.filter((post) => post._id !== options.postId);
      } else {
        window.location.href = "/home";
        return prevPosts;
      }
    });

    setOptions(false);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

export const deleteComment = async (
  options,
  setOptions,
  setData,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${options.postId}/comments/${options.commentId}`,
      withCredentials: true,
    });

    setData((prevData) => {
      return {
        ...prevData,
        comments: prevData.comments.filter(
          (comment) => comment._id !== options.commentId
        ),
        totalComments: prevData.totalComments - 1,
      };
    });
    setOptions(false);
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

export const deleteReply = async (
  postId,
  commentId,
  replyId,
  setData,
  setShowingOptions,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/replies/${replyId}`,
      withCredentials: true,
    });
    console.log(res);

    setData((prevData) => {
      if (Array.isArray(prevData.comments)) {
        return {
          ...prevData,
          comments: prevData.comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.filter(
                    (reply) => reply._id !== replyId
                  ),
                }
              : comment
          ),
          totalComments: prevData.totalComments - 1,
        };
      }
      return prevData;
    });

    setShowingOptions(false);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

export const editMessage = async (
  comment,
  postId,
  isEditing,
  setPost,
  setIsEditing,
  setComment,
  showAlert
) => {
  try {
    const res = await axios({
      method: "PAtCH",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        comment: comment,
      },
      url: `http://${
        process.env.REACT_APP_SERVER
      }:5000/api/v1/posts/${postId}/comments/${isEditing.commentId}${
        isEditing.replyId ? `/replies/${isEditing.replyId}` : ""
      }`,
      withCredentials: true,
    });

    console.log(res);
    setPost((prevPost) => ({
      ...prevPost,
      comments: prevPost.comments.map((c) => {
        if (c._id === isEditing.commentId) {
          if (!isEditing.replyId) {
            return {
              ...c,
              comment: comment,
              isEdited: true,
            };
          }

          return {
            ...c,
            replies: c.replies.map((r) =>
              r._id === isEditing.replyId
                ? { ...r, comment: comment, isEdited: true }
                : r
            ),
          };
        }
        return c;
      }),
    }));

    setIsEditing(null);
    setComment("");
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
  }
};

// Spotlist Related Options

export const deleteSpotlist = async (
  options,
  setOptions,
  setData,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${options.spotlistInfo.id}`,
      withCredentials: true,
    });
    setOptions(false);
    if (options.spotlistInfo.context === "spotlists") {
      setData((prevData) => {
        return prevData.filter((data) => data._id !== options.spotlistInfo.id);
      });
    }
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

export const deleteFromSpotlist = async (
  options,
  setOptions,
  setData,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${options.spotlistId}/spot/${options.spotId}`,
      withCredentials: true,
    });
    setOptions(false);
    setData(res.data.data);
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

// Notification Related Options

export const deleteNotification = async (
  options,
  setOptions,
  setData,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/notifications/${options.notificationId}`,
      withCredentials: true,
    });

    setOptions(false);
    setData((prevData) => {
      return prevData.filter((data) => data._id !== options.notificationId);
    });
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

// Spot Related Options

export const deleteSpot = async (options, setOptions, showAlert) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${options.spotId}`,
      withCredentials: true,
    });
    setOptions(false);
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

// Insights Related Options

export const deleteInsight = async (
  options,
  setOptions,
  setData,
  showAlert
) => {
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${options.spotId}/insight/${options.insightId}`,
      withCredentials: true,
    });
    setData((prevData) => {
      return {
        ...prevData,
        insights: prevData.insights.filter(
          (insight) => insight._id !== options.insightId
        ),
      };
    });
    setOptions(false);
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};
