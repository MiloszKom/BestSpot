import axios from "axios";

export const login = async (data) => {
  const res = await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/login`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const signUp = async (data) => {
  const res = await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/signup`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const updateInfo = async (data) => {
  const res = await axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/updateMe`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const updatePassword = async (data) => {
  const res = await axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}/api/v1/users/updateMyPassword`,
    data,
    withCredentials: true,
  });
  return res.data;
};
