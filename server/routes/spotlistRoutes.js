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
  .route("/:id")
  .get(authController.protect, spotlistController.getSpotsInSpotlist)
  .delete(authController.protect, spotlistController.deleteSpotlist)
  .patch(authController.protect, spotlistController.editSpotlist);

router
  .route("/:spotlistId/spot/:spotId")
  .delete(authController.protect, spotlistController.removeFromSpotlist);

router
  .route("/:spotlistId/spot/:spotId/note")
  .patch(authController.protect, spotlistController.editNote);

module.exports = router;
