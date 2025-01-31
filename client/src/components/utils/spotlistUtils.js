import axios from "axios";

export const toggleSpotlistLike = async (
  spotlistId,
  isLiked,
  userData,
  setData,
  showAlert
) => {
  try {
    setData((prevSpotlist) => {
      return {
        ...prevSpotlist,
        likes: isLiked
          ? prevSpotlist.likes.filter((like) => like._id !== userData._id)
          : [...prevSpotlist.likes, { _id: userData._id, isLikeActive: true }],
      };
    });

    await axios({
      method: isLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}/like`,
      withCredentials: true,
    });
  } catch (err) {
    console.log(err);
    const errorMessage = err.response?.data?.message || "An error occurred.";
    showAlert(errorMessage, "error");
  }
};
