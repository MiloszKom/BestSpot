const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

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
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.get("/searchUsers", authController.protect, userController.searchUsers);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

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
