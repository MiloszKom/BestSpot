const express = require("express");
const mapController = require("../controllers/mapController");

const router = express.Router();

router.get("/getLocation/:lat/:lng", mapController.getLocation);

router.get("/areaSearch", mapController.areaSearch);

module.exports = router;
