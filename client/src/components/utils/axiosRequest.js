import axios from "axios";
export const axiosRequest = async ({ method, url, data = {}, params = {} }) => {
  const token = localStorage.getItem("token");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios({
    method,
    url,
    data,
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};
