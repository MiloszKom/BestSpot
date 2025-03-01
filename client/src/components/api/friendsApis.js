import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getFriends = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/friends`,
  });
};

export const getFriendRequests = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/friends/requests`,
  });
};

export const acceptRequest = async (userId) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/users/acceptFriendRequest/${userId}`,
  });
};

export const deleteRequest = async (userId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/users/rejectFriendRequest/${userId}`,
  });
};
