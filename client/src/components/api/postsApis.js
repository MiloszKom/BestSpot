import axios from "axios";

export const getAllPosts = async ({ pageParam = 1 }) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts?filter=all&page=${pageParam}&limit=10`,
    withCredentials: true,
  });
  return res.data;
};

export const getFriendsPosts = async ({ pageParam = 1 }) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts?filter=friends&page=${pageParam}&limit=10`,
    withCredentials: true,
  });
  return res.data;
};

export const createPost = async (formData) => {
  const res = await axios({
    method: "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts`,
    data: formData,
    withCredentials: true,
  });
  return res.data;
};

export const deletePost = async (postId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}`,
    withCredentials: true,
  });
  return res.data;
};

export const togglePostLike = async ({ postId, isLiked }) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/like`,
    withCredentials: true,
  });
  return res.data;
};

export const togglePostBookmark = async ({ postId, isBookmarked }) => {
  const res = await axios({
    method: isBookmarked ? "DELETE" : "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/bookmark`,
    withCredentials: true,
  });
  return res.data;
};

export const getPost = async (postId) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}?sortBy=likes`,
    withCredentials: true,
  });
  return res.data;
};

export const getBookmarks = async ({ pageParam = 1 }) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/bookmarks?page=${pageParam}&limit=10`,
    withCredentials: true,
  });
  return res.data;
};

export const addPostComment = async ({ comment, postId }) => {
  const res = await axios({
    method: "POST",
    data: {
      comment: comment,
    },
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comment`,
    withCredentials: true,
  });
  return res.data;
};

export const editPostComment = async ({
  comment,
  postId,
  commentId,
  replyId,
}) => {
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
    }:5000/api/v1/posts/${postId}/comments/${commentId}${
      replyId ? `/replies/${replyId}` : ""
    }`,
    withCredentials: true,
  });
  return res.data;
};

export const deletePostComment = async ({ postId, commentId }) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}`,
    withCredentials: true,
  });
  return res.data;
};

export const toggleCommentLike = async ({
  isLiked,
  postId,
  commentId,
  replyId,
}) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `http://${
      process.env.REACT_APP_SERVER
    }:5000/api/v1/posts/${postId}/comments/${commentId}${
      replyId ? `/replies/${replyId}` : ""
    }/like`,
    withCredentials: true,
  });
  return res.data;
};

export const addPostReply = async ({ comment, postId, commentId }) => {
  const res = await axios({
    method: "POST",
    data: {
      comment: comment,
    },
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/replies`,
    withCredentials: true,
  });
  return res.data;
};

export const deletePostReply = async ({ postId, commentId, replyId }) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/${postId}/comments/${commentId}/replies/${replyId}`,
    withCredentials: true,
  });
  return res.data;
};
