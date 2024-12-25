const express = require("express");
const router = express.Router();
const spotlistController = require("./../controllers/spotlistController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, spotlistController.getSpotlists)
  .post(authController.protect, spotlistController.createSpotlist);

router
  .route("/:id")
  .get(authController.protect, spotlistController.getSpotsInSpotlist)
  .post(authController.protect, spotlistController.addToSpotlist)
  .delete(authController.protect, spotlistController.deleteSpotlist)
  .patch(authController.protect, spotlistController.editSpotlist);

router.delete(
  "/:spotlistId/spot/:spotId",
  authController.protect,
  spotlistController.removeFromSpotlist
);

router
  .route("/:spotlistId/spot/:spotId/note")
  .patch(authController.protect, spotlistController.editNote);

module.exports = router;
