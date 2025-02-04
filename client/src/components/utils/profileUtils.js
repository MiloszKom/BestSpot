import axios from "axios";

export const sendInvite = async ({
  setLoadingStatus,
  setInviteStatus,
  showAlert,
  userId,
}) => {
  setLoadingStatus(true);
  try {
    const res = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/sendFriendRequest/${userId}`,
      withCredentials: true,
    });
    setInviteStatus("pending");
    showAlert(res.data.message, res.data.status);
    setLoadingStatus(false);
  } catch (err) {
    console.log(err);
    showAlert(err.message, "error");
    setLoadingStatus(false);
  }
};

export const cancelInvite = async ({
  setLoadingStatus,
  setInviteStatus,
  showAlert,
  userId,
}) => {
  setLoadingStatus(true);
  try {
    await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/cancelFriendRequest/${userId}`,
      withCredentials: true,
    });
    setInviteStatus("not-sent");
  } catch (err) {
    showAlert(err.message, "error");
    console.log(err);
  }
  setLoadingStatus(false);
};

export const unfriend = async ({
  setLoadingStatus,
  setInviteStatus,
  userId,
}) => {
  setLoadingStatus(true);
  try {
    const res = await axios({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/deleteFriend/${userId}`,
      withCredentials: true,
    });
    console.log(res);
    setInviteStatus("not-sent");
  } catch (err) {
    console.log(err);
  }
  setLoadingStatus(false);
};
