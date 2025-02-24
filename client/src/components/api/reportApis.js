import axios from "axios";

export const getReports = async () => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/reports`,
    withCredentials: true,
  });
  return res.data;
};

export const createReport = async (data) => {
  const res = await axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}/api/v1/reports`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const deleteReport = async (reportId) => {
  const res = await axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}/api/v1/reports/${reportId}`,
    withCredentials: true,
  });
  return res.data;
};
