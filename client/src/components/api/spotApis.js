import axios from "axios";

export const getSpot = async (spotId) => {
  try {
    const res = await axios({
      method: "GET",
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}`,
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
  // const res = await axios({
  //   method: "GET",
  //   url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}`,
  //   withCredentials: true,
  // });
  // return res.data;
};

export const editSpot = async ({ spotId, data }) => {
  const res = await axios({
    method: "PATCH",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data,
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteSpot = async (spotId) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}`,
    withCredentials: true,
  });
  return res.data;
};

export const editNote = async ({ spotId, note }) => {
  const res = await axios({
    method: "PATCH",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/note`,
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
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/like`,
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
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/insight`,
    withCredentials: true,
  });
  return res.data;
};

export const deleteInsight = async ({ spotId, insightId }) => {
  const res = await axios({
    method: "DELETE",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/insight/${insightId}`,
    withCredentials: true,
  });
  return res.data;
};

export const toggleInsightLike = async ({ isLiked, spotId, insightId }) => {
  const res = await axios({
    method: isLiked ? "DELETE" : "POST",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/insight/${insightId}/like`,
    withCredentials: true,
  });
  return res.data;
};

export const getSpotLiblary = async ({ pageParam = 1, sortOption }) => {
  const res = await axios({
    method: "GET",
    url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/liblary?sort=${sortOption}&page=${pageParam}&limit=20`,
    withCredentials: true,
  });
  sessionStorage.setItem("spotLiblaryOrder", sortOption);
  return res.data;
};
