const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const { uploadUserPhoto, resizeUserPhoto } = require("../utils/multerConfig");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.get("/checkCookies", authController.checkCookies);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protect,
  uploadUserPhoto,
  resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.get("/searchUsers", authController.protect, userController.searchUsers);

router.get(
  "/searchHandles",
  authController.protect,
  userController.searchHandles
);

router.get("/friends", authController.protect, userController.getFriends);

router.get(
  "/friends/requests",
  authController.protect,
  userController.getRequests
);

router.get(
  "/global-notifications",
  authController.protect,
  userController.getGlobalNotifications
);

router.get(
  "/notifications",
  authController.protect,
  userController.getNotifications
);

router.delete(
  "/notifications/:id",
  authController.protect,
  userController.deleteNotification
);

router.route("/").get(userController.getAllUsers);

router
  .route("/:handle")
  .get(authController.softAuth, userController.getUserProfile);

router
  .route("/:handle/posts")
  .get(authController.softAuth, userController.getUserProfilePosts);

router
  .route("/:handle/spotlists")
  .get(authController.softAuth, userController.getUserProfileSpotlists);

router
  .route("/:handle/spots")
  .get(authController.softAuth, userController.getUserProfileSpots);

router.post(
  "/sendFriendRequest/:id",
  authController.protect,
  userController.sendFriendRequest
);

router.delete(
  "/cancelFriendRequest/:id",
  authController.protect,
  userController.cancelFriendRequest
);

router.post(
  "/acceptFriendRequest/:id",
  authController.protect,
  userController.acceptFriendRequest
);

router.delete(
  "/rejectFriendRequest/:id",
  authController.protect,
  userController.rejectFriendRequest
);

router.delete(
  "/deleteFriend/:id",
  authController.protect,
  userController.deleteFriend
);

module.exports = router;
