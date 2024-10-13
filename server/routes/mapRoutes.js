const express = require("express");
const mapController = require("../controllers/mapController");

const router = express.Router();

router.post("/searchNerby", mapController.searchNerby);

router.post("/getPlaceDetails", mapController.getPlaceDetails);

router.post("/getPlacePhotos", mapController.getPlacePhotos);

router.post("/getCurrentLocation", mapController.getCurrentLocation);

module.exports = router;
