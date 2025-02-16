const express = require("express");
const reportController = require("../controllers/reportController");

const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.protect, reportController.getAllReports);
router.post("/", authController.protect, reportController.createReport);
router.delete("/:id", authController.protect, reportController.deleteReport);

module.exports = router;
