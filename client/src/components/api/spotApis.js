import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getSpot = async (spotId) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spots/${spotId}`,
  });
};

export const createSpot = async (data) => {
  return axiosRequest({
    method: "POST",
    data,
    url: `${API_URL}/api/v1/spots`,
  });
};

export const editSpot = async ({ spotId, data }) => {
  return axiosRequest({
    method: "PATCH",
    data,
    url: `${API_URL}/api/v1/spots/${spotId}`,
  });
};

export const deleteSpot = async (spotId) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/spots/${spotId}`,
  });
};

export const editNote = async ({ spotId, note }) => {
  return axiosRequest({
    method: "PATCH",
    url: `${API_URL}/api/v1/spots/${spotId}/note`,
    data: {
      note: note,
    },
  });
};

export const toggleSpotLike = async ({ isLiked, spotId }) => {
  return axiosRequest({
    method: isLiked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/spots/${spotId}/like`,
  });
};

export const createInsight = async ({ comment, spotId }) => {
  return axiosRequest({
    method: "POST",
    data: {
      content: comment,
    },
    url: `${API_URL}/api/v1/spots/${spotId}/insight`,
  });
};

export const deleteInsight = async ({ spotId, insightId }) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/spots/${spotId}/insight/${insightId}`,
  });
};

export const toggleInsightLike = async ({ isLiked, spotId, insightId }) => {
  return axiosRequest({
    method: isLiked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/spots/${spotId}/insight/${insightId}/like`,
  });
};

export const getSpotLibrary = async ({ pageParam = 1, sortOption }) => {
  sessionStorage.setItem("spotLibraryOrder", sortOption);
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spots/library`,
    params: { sort: sortOption, page: pageParam, limit: 20 },
  });
};

export const getLatestSpots = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spots/latest-5`,
  });
};
