const express = require("express");
const router = express.Router();
const favController = require("./../controllers/favController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(authController.protect, favController.getAllUserFav)
  .post(
    authController.protect,
    favController.uploadTourImages,
    favController.adjustUserPhoto,
    favController.createFav
  );

router
  .route("/:id")
  .get(favController.getFav)
  .patch(favController.updateFav)
  .delete(authController.protect, favController.deleteFav);

module.exports = router;
