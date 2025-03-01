import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getReports = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/reports`,
  });
};

export const createReport = async (data) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/reports`,
    data,
  });
};

export const deleteReport = async (reportId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/reports/${reportId}`,
  });
};
