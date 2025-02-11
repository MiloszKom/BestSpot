import axios from "axios";

export const getUserSpotlists = async () => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
    withCredentials: true,
  });
  return res.data;
};

export const createSpotlist = async ({ data }) => {
  const res = await axios({
    method: "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const editSpotlist = async ({
  spotlistId,
  nameIsChanged,
  newName,
  newVisibility,
  newDescription,
}) => {
  const res = await axios({
    method: "PATCH",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}`,
    data: {
      nameIsChanged,
      newName,
      newVisibility,
      newDescription,
    },
    withCredentials: true,
  });
  return res.data;
};

export const deleteSpotlist = async (data) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${data.spotlistId}`,
    withCredentials: true,
  });
  return res.data;
};

export const manageSpotlists = async (data) => {
  const res = await axios({
    method: "PATCH",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/manage`,
    data,
    withCredentials: true,
  });
  return res.data;
};

export const removeSpotFromSpotlist = async ({ spotlistId, spotId }) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}/spot/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const toggleLikeSpotlist = async ({ isLiked, spotlistId }) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}/like`,
    withCredentials: true,
  });
  return res.data;
};

export const getSpotsInSpotlist = async (spotlistId) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}`,
    withCredentials: true,
  });
  return res.data;
};

export const getHubSpotlists = async ({ pageParam = 1, sortOption }) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/hub?sort=${sortOption}&page=${pageParam}&limit=20`,
    withCredentials: true,
  });
  sessionStorage.setItem("spotlistHubOrder", sortOption);
  return res.data;
};
