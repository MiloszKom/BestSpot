const express = require("express");
const router = express.Router();
const spotController = require("./../controllers/spotController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, spotController.getAllUserSpot)
  .post(
    authController.protect,
    spotController.uploadTourImages,
    spotController.adjustUserPhoto,
    spotController.createSpot
  );

router
  .route("/:id")
  .get(authController.protect, spotController.getSpot)
  .patch(spotController.updateSpot)
  .delete(authController.protect, spotController.deleteSpot);

module.exports = router;
