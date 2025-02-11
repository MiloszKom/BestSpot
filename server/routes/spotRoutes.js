const express = require("express");
const router = express.Router();
const spotController = require("./../controllers/spotController");
const authController = require("../controllers/authController");

const { uploadSpotPhoto, adjustPhoto } = require("../utils/multerConfig");

router
  .route("/")
  .get(authController.protect, spotController.getAllUserSpot)
  .post(
    authController.protect,
    uploadSpotPhoto,
    adjustPhoto,
    spotController.createSpot
  );

router
  .route("/:id")
  .get(authController.protect, spotController.getSpot)
  .patch(
    authController.protect,
    uploadSpotPhoto,
    adjustPhoto,
    spotController.editSpot
  )
  .delete(authController.protect, spotController.deleteSpot);

router
  .route("/:id/note")
  .patch(authController.protect, spotController.editNote);

router
  .route("/:id/like")
  .post(authController.protect, spotController.likeSpot)
  .delete(authController.protect, spotController.unlikeSpot);

router
  .route("/:id/insight")
  .post(authController.protect, spotController.createAnInsight);

router
  .route("/:id/insight/:insightId")
  .delete(authController.protect, spotController.deleteAnInsight);

router
  .route("/:id/insight/:insightId/like")
  .post(authController.protect, spotController.likeInsight)
  .delete(authController.protect, spotController.unlikeInsight);

module.exports = router;
