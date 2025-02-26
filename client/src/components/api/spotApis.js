import axios from "axios";

export const getSpot = async (spotId) => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const createSpot = async (data) => {
  const res = await axios({
    method: "POST",
    data,
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots`,
    withCredentials: true,
  });
  return res.data;
};

export const editSpot = async ({ spotId, data }) => {
  const res = await axios({
    method: "PATCH",
    data,
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteSpot = async (spotId) => {
  const res = await axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const editNote = async ({ spotId, note }) => {
  const res = await axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}/note`,
    data: {
      note: note,
    },
    withCredentials: true,
  });
  return res.data;
};

export const toggleSpotLike = async ({ isLiked, spotId }) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}/like`,
    withCredentials: true,
  });
  return res.data;
};

export const createInsight = async ({ comment, spotId }) => {
  const res = await axios({
    method: "POST",
    data: {
      content: comment,
    },
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}/insight`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteInsight = async ({ spotId, insightId }) => {
  const res = await axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}/insight/${insightId}`,
    withCredentials: true,
  });
  return res.data;
};

export const toggleInsightLike = async ({ isLiked, spotId, insightId }) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/${spotId}/insight/${insightId}/like`,
    withCredentials: true,
  });
  return res.data;
};

export const getSpotLibrary = async ({ pageParam = 1, sortOption }) => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/library?sort=${sortOption}&page=${pageParam}&limit=20`,
    withCredentials: true,
  });
  sessionStorage.setItem("spotLibraryOrder", sortOption);
  return res.data;
};

export const getLatestSpots = async () => {
  const res = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}/api/v1/spots/latest-5`,
    withCredentials: true,
  });
  return res.data;
};
