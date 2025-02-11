import axios from "axios";

export const getProfile = async (handle) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${handle}`,
    withCredentials: true,
  });
  return res.data;
};

export const sendInvite = async (userId) => {
  const res = await axios({
    method: "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/sendFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};

export const cancelInvite = async (userId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/cancelFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};

export const unfriend = async (userId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/deleteFriend/${userId}`,
    withCredentials: true,
  });
  return res.data;
};

export const getProfilePosts = async (handle, pageParam = 1) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${handle}/posts?page=${pageParam}&limit=10`,
    withCredentials: true,
  });
  return res.data;
};

export const getProfileSpotlists = async (handle) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${handle}/spotlists`,
    withCredentials: true,
  });
  return res.data;
};

export const getProfileSpots = async (handle) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${handle}/spots`,
    withCredentials: true,
  });
  return res.data;
};
