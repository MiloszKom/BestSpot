const express = require("express");
const userController = require("./../controllers/userController");
const {
  signup,
  login,
  logout,
  checkCookies,
  protect,
  softAuth,
  updatePassword,
} = require("./../controllers/authController");

const {
  uploadUserPhoto,
  initializeUserPhoto,
} = require("../utils/multerConfig");

const router = express.Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/auth/logout", logout);

router.get("/auth/checkCookies", checkCookies);

router.patch("/auth/updateMyPassword", protect, updatePassword);

router.patch(
  "/auth/updateMe",
  protect,
  uploadUserPhoto,
  initializeUserPhoto,
  userController.updateMe
);

router.delete("/deleteMe", protect, userController.deleteMe);

router.get("/searchUsers", protect, userController.searchUsers);

router.get("/searchHandles", protect, userController.searchHandles);

router.get("/friends", protect, userController.getFriends);

router.get("/friends/requests", protect, userController.getRequests);

router.get(
  "/global-notifications",
  protect,
  userController.getGlobalNotifications
);

router.get("/notifications", protect, userController.getNotifications);

router.delete("/notifications/:id", protect, userController.deleteNotification);

router.route("/").get(userController.getAllUsers);

router.route("/:handle").get(softAuth, userController.getUserProfile);

router
  .route("/:handle/posts")
  .get(softAuth, userController.getUserProfilePosts);

router
  .route("/:handle/spotlists")
  .get(softAuth, userController.getUserProfileSpotlists);

router
  .route("/:handle/spots")
  .get(softAuth, userController.getUserProfileSpots);

router.post(
  "/sendFriendRequest/:id",
  protect,
  userController.sendFriendRequest
);

router.delete(
  "/cancelFriendRequest/:id",
  protect,
  userController.cancelFriendRequest
);

router.post(
  "/acceptFriendRequest/:id",
  protect,
  userController.acceptFriendRequest
);

router.delete(
  "/rejectFriendRequest/:id",
  protect,
  userController.rejectFriendRequest
);

router.delete("/deleteFriend/:id", protect, userController.deleteFriend);

module.exports = router;
