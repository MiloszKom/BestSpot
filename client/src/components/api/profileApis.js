import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getProfile = async (handle) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/${handle}`,
  });
};

export const sendInvite = async (userId) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/users/sendFriendRequest/${userId}`,
  });
};

export const cancelInvite = async (userId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/users/cancelFriendRequest/${userId}`,
  });
};

export const unfriend = async (userId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/users/deleteFriend/${userId}`,
  });
};

export const getProfilePosts = async (handle, pageParam = 1) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/${handle}/posts`,
    params: { page: pageParam, limit: 10 },
  });
};

export const getProfileSpotlists = async (handle) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/${handle}/spotlists`,
  });
};

export const getProfileSpots = async (handle) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/${handle}/spots`,
  });
};
