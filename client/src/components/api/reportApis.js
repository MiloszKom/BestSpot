import axios from "axios";

export const getReports = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/reports`,
    withCredentials: true,
  });
  return res.data;
};

export const createReport = async (data) => {
  const res = await axios({
    method: "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/reports`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const deleteReport = async (reportId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/reports/${reportId}`,
    withCredentials: true,
  });
  return res.data;
};
