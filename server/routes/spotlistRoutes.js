const express = require("express");
const router = express.Router();
const spotlistController = require("./../controllers/spotlistController");
const { protect, softAuth } = require("./../controllers/authController");

router
  .route("/")
  .get(protect, spotlistController.getSpotlists)
  .post(protect, spotlistController.createSpotlist);

router.route("/manage").patch(protect, spotlistController.updateSpotlists);

router.route("/hub").get(softAuth, spotlistController.getHubSpotlists);

router
  .route("/:id")
  .get(softAuth, spotlistController.getSpotsInSpotlist)
  .delete(protect, spotlistController.deleteSpotlist)
  .patch(protect, spotlistController.editSpotlist);

router
  .route("/:id/like")
  .post(protect, spotlistController.likeSpotlist)
  .delete(protect, spotlistController.unlikeSpotlist);

router
  .route("/:spotlistId/spot/:spotId")
  .delete(protect, spotlistController.removeFromSpotlist);

module.exports = router;
