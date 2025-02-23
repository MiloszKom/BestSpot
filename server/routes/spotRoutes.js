const express = require("express");
const router = express.Router();
const spotController = require("./../controllers/spotController");

const { protect, softAuth } = require("./../controllers/authController");

const {
  uploadSpotPhoto,
  initializeSpotPhoto,
} = require("../utils/multerConfig");

router
  .route("/")
  .get(protect, spotController.getAllUserSpot)
  .post(
    protect,
    uploadSpotPhoto,
    initializeSpotPhoto,
    spotController.createSpot
  );

router.route("/liblary").get(softAuth, spotController.getSpotLiblary);

router.route("/latest-5").get(softAuth, spotController.getLatestSpots);

router
  .route("/:id")
  .get(softAuth, spotController.getSpot)
  .patch(protect, uploadSpotPhoto, initializeSpotPhoto, spotController.editSpot)
  .delete(protect, spotController.deleteSpot);

router.route("/:id/note").patch(protect, spotController.editNote);

router
  .route("/:id/like")
  .post(protect, spotController.likeSpot)
  .delete(protect, spotController.unlikeSpot);

router.route("/:id/insight").post(protect, spotController.createAnInsight);

router
  .route("/:id/insight/:insightId")
  .delete(protect, spotController.deleteAnInsight);

router
  .route("/:id/insight/:insightId/like")
  .post(protect, spotController.likeInsight)
  .delete(protect, spotController.unlikeInsight);

module.exports = router;
