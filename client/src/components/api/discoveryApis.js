import axios from "axios";

export const getAreaSearchResults = async ({ category, lat, lng, radius }) => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/maps/areaSearch`,
    params: {
      category,
      lat,
      lng,
      radius,
    },
    withCredentials: true,
  });
  return res.data.data.spots;
};

export const fetchLocationData = async ({ queryKey }) => {
  const [, lat, lng] = queryKey;
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/v1/maps/getLocation/${lat}/${lng}`,
    { withCredentials: true }
  );
  return res.data.googleData.results;
};
