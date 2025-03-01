import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getAreaSearchResults = async ({ category, lat, lng, radius }) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/maps/areaSearch`,
    params: {
      category,
      lat,
      lng,
      radius,
    },
    withCredentials: true,
  });
};
