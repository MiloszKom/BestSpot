import axios from "axios";

export const fetchFromDatabase = async (
  id,
  setPlaceDetails,
  setPlaceNote,
  setIsFavourite,
  setSpotlistId,
  highlightedInsightId
) => {
  try {
    const res = await axios({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${id}`,
      withCredentials: true,
    });

    console.log(res);

    setPlaceDetails(res.data.data.spot);
    setPlaceNote(res.data.data.userNote);
    setIsFavourite(res.data.data.isFavourite);
    setSpotlistId(res.data.data.spotlistId);

    if (highlightedInsightId) {
      const highlightedInsight = res.data.data.spot.insights.find(
        (insight) => insight._id === highlightedInsightId
      );

      if (highlightedInsight) {
        const reorderedInsights = [
          highlightedInsight,
          ...res.data.data.spot.insights.filter(
            (insight) => insight._id !== highlightedInsightId
          ),
        ];
        setPlaceDetails((prevPost) => ({
          ...prevPost,
          insights: reorderedInsights,
        }));
      }
    }
  } catch (err) {
    console.log("Error fetching from the database:", err);
  }
};

export const toggleSpotLike = async (
  spotId,
  isLiked,
  userData,
  setData,
  showAlert
) => {
  try {
    setData((prevSpot) => {
      return {
        ...prevSpot,
        likes: isLiked
          ? prevSpot.likes.filter((like) => like._id !== userData._id)
          : [...prevSpot.likes, { _id: userData._id, isLikeActive: true }],
      };
    });

    await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/like`,
      withCredentials: true,
    });
  } catch (err) {
    console.log(err);
    const errorMessage = err.response?.data?.message || "An error occurred.";
    showAlert(errorMessage, "error");
  }
};

export const toggleInsightLike = async (
  spotId,
  insightId,
  isLiked,
  userData,
  setPost,
  showAlert
) => {
  try {
    setPost((prevPost) => ({
      ...prevPost,
      insights: prevPost.insights.map((insight) =>
        insight._id === insightId
          ? {
              ...insight,
              likes: isLiked
                ? insight.likes.filter((like) => like._id !== userData._id)
                : [...insight.likes, { _id: userData._id, isLikeActive: true }],
            }
          : insight
      ),
    }));

    await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${spotId}/insight/${insightId}/like`,
      withCredentials: true,
    });
  } catch (err) {
    console.log(err);
    const errorMessage = err.response?.data?.message || "An error occurred.";
    showAlert(errorMessage, "error");
  }
};
