import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getAllPosts = async ({ pageParam = 1 }) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/posts`,
    params: { filter: "all", page: pageParam, limit: 10 },
  });
};

export const getFriendsPosts = (pageParam = 1) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/posts`,
    params: { filter: "friends", page: pageParam, limit: 10 },
  });
};

export const createPost = async (formData) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/posts`,
    data: formData,
  });
};

export const deletePost = async (postId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/posts/${postId}`,
  });
};

export const togglePostLike = async ({ postId, isLiked }) => {
  return axiosRequest({
    method: isLiked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/posts/${postId}/like`,
  });
};

export const togglePostBookmark = async ({ postId, isBookmarked }) => {
  return axiosRequest({
    method: isBookmarked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/posts/${postId}/bookmark`,
  });
};

export const getPost = async (postId) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/posts/${postId}`,
    params: { sortBy: "likes" },
  });
};

export const getBookmarks = async ({ pageParam = 1 }) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/posts/bookmarks`,
    params: { filter: "friends", page: pageParam, limit: 10 },
  });
};

export const addPostComment = async ({ comment, postId }) => {
  return axiosRequest({
    method: "POST",
    data: {
      comment: comment,
    },
    url: `${API_URL}/api/v1/posts/${postId}/comment`,
  });
};

export const editPostComment = async ({
  comment,
  postId,
  commentId,
  replyId,
}) => {
  return axiosRequest({
    method: "PATCH",
    data: {
      comment: comment,
    },
    url: `${API_URL}/api/v1/posts/${postId}/comments/${commentId}${
      replyId ? `/replies/${replyId}` : ""
    }`,
  });
};

export const deletePostComment = async ({ postId, commentId }) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/posts/${postId}/comments/${commentId}`,
  });
};

export const toggleCommentLike = async ({
  isLiked,
  postId,
  commentId,
  replyId,
}) => {
  return axiosRequest({
    method: isLiked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/posts/${postId}/comments/${commentId}${
      replyId ? `/replies/${replyId}` : ""
    }/like`,
  });
};

export const addPostReply = async ({ comment, postId, commentId }) => {
  return axiosRequest({
    method: "POST",
    data: {
      comment: comment,
    },
    url: `${API_URL}/api/v1/posts/${postId}/comments/${commentId}/replies`,
  });
};

export const deletePostReply = async ({ postId, commentId, replyId }) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/posts/${postId}/comments/${commentId}/replies/${replyId}`,
  });
};
