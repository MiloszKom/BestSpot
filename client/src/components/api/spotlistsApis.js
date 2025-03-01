import { axiosRequest } from "../utils/axiosRequest";
const API_URL = process.env.REACT_APP_API_URL;

export const getUserSpotlists = async () => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spotlists`,
  });
};

export const createSpotlist = async ({ data }) => {
  return axiosRequest({
    method: "POST",
    url: `${API_URL}/api/v1/spotlists`,
    data,
  });
};

export const editSpotlist = async ({
  spotlistId,
  nameIsChanged,
  newName,
  newVisibility,
  newDescription,
}) => {
  return axiosRequest({
    method: "PATCH",
    url: `${API_URL}/api/v1/spotlists/${spotlistId}`,
    data: {
      nameIsChanged,
      newName,
      newVisibility,
      newDescription,
    },
  });
};

export const deleteSpotlist = async (data) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/spotlists/${data.spotlistId}`,
  });
};

export const manageSpotlists = async (data) => {
  return axiosRequest({
    method: "PATCH",
    url: `${API_URL}/api/v1/spotlists/manage`,
    data,
  });
};

export const removeSpotFromSpotlist = async ({ spotlistId, spotId }) => {
  return axiosRequest({
    method: "DELETE",
    url: `${API_URL}/api/v1/spotlists/${spotlistId}/spot/${spotId}`,
  });
};

export const toggleLikeSpotlist = async ({ isLiked, spotlistId }) => {
  return axiosRequest({
    method: isLiked ? "DELETE" : "POST",
    url: `${API_URL}/api/v1/spotlists/${spotlistId}/like`,
  });
};

export const getSpotsInSpotlist = async (spotlistId) => {
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spotlists/${spotlistId}`,
  });
};

export const getHubSpotlists = async ({ pageParam = 1, sortOption }) => {
  sessionStorage.setItem("spotlistHubOrder", sortOption);
  return axiosRequest({
    method: "GET",
    url: `${API_URL}/api/v1/spotlists/hub`,
    params: { sort: sortOption, page: pageParam, limit: 20 },
  });
};
