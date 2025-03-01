import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const searchUsers = async (chatSearch) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/searchUsers`,
    params: { q: chatSearch },
  });
};

export const searchUsersByHandle = async (taggedWord) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/searchHandles`,
    params: { q: taggedWord },
  });
};
