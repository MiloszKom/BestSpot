import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getGlobalNotifications = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/global-notifications`,
  });
};

export const getNotifications = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/notifications`,
  });
};

export const deleteNotification = async (notificationId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/users/notifications/${notificationId}`,
  });
};
