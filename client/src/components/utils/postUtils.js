import axios from "axios";
import { Link } from "react-router-dom";
export const togglePostLike = async (
  postId,
  isLiked,
  userData,
  setData,
  showAlert,
  context
) => {
  try {
    setData((prevPosts) => {
      if (context === "postDetail") {
        return {
          ...prevPosts,
          likes: isLiked
            ? prevPosts.likes.filter((id) => id !== userData._id)
            : [...prevPosts.likes, userData._id],
        };
      } else if (context === "posts") {
        return prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: isLiked
                  ? post.likes.filter((id) => id !== userData._id)
                  : [...post.likes, userData._id],
              }
            : post
        );
      }
    });

    const res = await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/like`,
      withCredentials: true,
    });

    console.log(res);
  } catch (err) {
    console.log(err);

    const errorMessage = err.response?.data?.message || "An error occurred.";
    showAlert(errorMessage, "error");
  }
};

export const postComment = async (
  postId,
  comment,
  setPost,
  userData,
  setComment,
  showAlert
) => {
  try {
    const res = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        comment: comment,
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comment`,
      withCredentials: true,
    });
    console.log(res);
    setPost((prevPost) => ({
      ...prevPost,
      comments: [res.data.comment, ...prevPost.comments],
      totalComments: prevPost.totalComments + 1,
    }));
    setComment("");
    showAlert(res.data.message, res.data.status);
  } catch (err) {
    console.log(err);
  }
};

// There may be an issue if the users repeadetly clicks the like button

export const toggleCommentLike = async (
  postId,
  commentId,
  isLiked,
  userData,
  setPost,
  showAlert
) => {
  try {
    setPost((prevPost) => ({
      ...prevPost,
      comments: prevPost.comments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likes: isLiked
                ? comment.likes.filter((id) => id !== userData._id)
                : [...comment.likes, userData._id],
            }
          : comment
      ),
    }));

    const res = await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/like`,
      withCredentials: true,
    });
    console.log(res);
  } catch (err) {
    console.log(err);

    const errorMessage = err.response?.data?.message || "An error occurred.";
    showAlert(errorMessage, "error");
  }
};

export const postReply = async (
  postId,
  comment,
  commentId,
  setComment,
  setIsReplying,
  setReplyingToHandle,
  setPost
) => {
  try {
    const res = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        comment: comment,
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/replies`,
      withCredentials: true,
    });
    console.log(res);
    setComment("");
    setIsReplying(null);
    setReplyingToHandle("");

    setPost((prevPost) => {
      const updatedPost = {
        ...prevPost,
        totalComments: prevPost.totalComments + 1,
      };

      updatedPost.comments = updatedPost.comments.map((comment) => {
        if (comment._id === commentId) {
          console.log(res.data.reply);
          return {
            ...comment,
            replies: [...comment.replies, res.data.reply],
          };
        }
        return comment;
      });

      return updatedPost;
    });
  } catch (err) {
    console.log(err);
  }
};

export const toggleReplyLike = async (
  isLiked,
  postId,
  commentId,
  replyId,
  setPost,
  userData
) => {
  setPost((prevPost) => ({
    ...prevPost,
    comments: prevPost.comments.map((comment) =>
      comment._id === commentId
        ? {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === replyId
                ? {
                    ...reply,
                    likes: isLiked
                      ? reply.likes.filter((id) => id !== userData._id)
                      : [...reply.likes, userData._id],
                  }
                : reply
            ),
          }
        : comment
    ),
  }));

  try {
    const res = await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/replies/${replyId}/like`,
      withCredentials: true,
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (
  postId,
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
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}`,
      withCredentials: true,
    });
    showAlert(res.data.message, res.data.status);
    setData((prevPosts) => {
      if (Array.isArray(prevPosts)) {
        return prevPosts.filter((post) => post._id !== postId);
      } else {
        window.location.href = "/home";
        return prevPosts;
      }
    });

    setShowingOptions(false);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, err.response.data.status);
  }
};

export const deleteComment = async (
  postId,
  commentId,
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
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}`,
      withCredentials: true,
    });

    setData((prevData) => {
      return {
        ...prevData,
        comments: prevData.comments.filter(
          (comment) => comment._id !== commentId
        ),
        totalComments: prevData.totalComments - 1,
      };
    });

    setShowingOptions(false);
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

export function highlightHandles(str) {
  const wordsWithSpaces = str.split(/(\s+)/);

  const highlightedWords = wordsWithSpaces.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <Link
          to={`/${part.substring(1)}`}
          key={index}
          className="handle-highlight"
        >
          {part}
        </Link>
      );
    }
    return part;
  });

  return <>{highlightedWords}</>;
}
