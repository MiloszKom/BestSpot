const express = require("express");
const router = express.Router();
const spotlistController = require("./../controllers/spotlistController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, spotlistController.getSpotlists)
  .post(authController.protect, spotlistController.createSpotlist);

router
  .route("/manage")
  .patch(authController.protect, spotlistController.updateSpotlists);

router
  .route("/hub")
  .get(authController.softAuth, spotlistController.getHubSpotlists);

router
  .route("/:id")
  .get(authController.softAuth, spotlistController.getSpotsInSpotlist)
  .delete(authController.protect, spotlistController.deleteSpotlist)
  .patch(authController.protect, spotlistController.editSpotlist);

router
  .route("/:id/like")
  .post(authController.protect, spotlistController.likeSpotlist)
  .delete(authController.protect, spotlistController.unlikeSpotlist);

router
  .route("/:spotlistId/spot/:spotId")
  .delete(authController.protect, spotlistController.removeFromSpotlist);

module.exports = router;
