import axios from "axios";

export const getFriends = async () => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/friends`,
    withCredentials: true,
  });
  return res.data;
};

export const getFriendRequests = async () => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/friends/requests`,
    withCredentials: true,
  });
  return res.data;
};

export const acceptRequest = async (userId) => {
  const res = await axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/acceptFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteRequest = async (userId) => {
  const res = await axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/rejectFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};
