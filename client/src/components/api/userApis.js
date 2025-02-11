import axios from "axios";

export const searchUsers = async (chatSearch) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/searchUsers?q=${chatSearch}`,
    withCredentials: true,
  });
  return res.data;
};

export const searchUsersByHandle = async (taggedWord) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/searchHandles?q=${taggedWord}`,
    withCredentials: true,
  });
  return res.data;
};
