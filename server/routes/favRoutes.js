const express = require("express");
const router = express.Router();
const favController = require("./../controllers/favController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(authController.protect, favController.getAllFav)
  .post(favController.createFav);

router
  .route("/:id")
  .get(favController.getFav)
  .patch(favController.updateFav)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    favController.deleteFav
  );

module.exports = router;
