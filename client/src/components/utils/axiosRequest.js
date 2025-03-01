import axios from "axios";

export const axiosRequest = async ({
  method,
  url,
  data = {},
  params = {},
  requireAuth,
}) => {
  const headers = requireAuth
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
    : {};

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
