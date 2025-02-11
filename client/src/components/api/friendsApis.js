import axios from "axios";

export const getFriends = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/friends`,
    withCredentials: true,
  });
  return res.data;
};

export const getFriendRequests = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/friends/requests`,
    withCredentials: true,
  });
  return res.data;
};

export const acceptRequest = async (userId) => {
  const res = await axios({
    method: "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/acceptFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteRequest = async (userId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/rejectFriendRequest/${userId}`,
    withCredentials: true,
  });
  return res.data;
};
