import axios from "axios";

export const searchUsers = async (chatSearch) => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/searchUsers?q=${chatSearch}`,
    withCredentials: true,
  });
  return res.data;
};

export const searchUsersByHandle = async (taggedWord) => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/searchHandles?q=${taggedWord}`,
    withCredentials: true,
  });
  return res.data;
};
