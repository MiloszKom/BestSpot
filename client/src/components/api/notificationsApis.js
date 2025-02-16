import axios from "axios";

export const getGlobalNotifications = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/global-notifications`,
    withCredentials: true,
  });
  return res.data;
};

export const getNotifications = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/notifications`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteNotification = async (notificationId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/notifications/${notificationId}`,
    withCredentials: true,
  });
  return res.data;
};
