import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const checkCookies = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/users/auth/checkCookies`,
  });
};

export const login = async (data) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/users/auth/login`,
    data,
  });
};

export const signUp = async (data) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/users/auth/signup`,
    data,
  });
};

export const updateInfo = async (data) => {
  return axiosRequest({
    method: "PATCH",
    url: `${API_URL}/api/v1/users/auth/updateMe`,
    data,
  });
};

export const updatePassword = async (data) => {
  return axiosRequest({
    method: "PATCH",
    url: `${API_URL}/api/v1/users/auth/updateMyPassword`,
    data,
  });
};
