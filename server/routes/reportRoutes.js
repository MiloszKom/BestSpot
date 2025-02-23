const express = require("express");
const reportController = require("../controllers/reportController");

const { protect } = require("./../controllers/authController");

const router = express.Router();

router.get("/", protect, reportController.getAllReports);
router.post("/", protect, reportController.createReport);
router.delete("/:id", protect, reportController.deleteReport);

module.exports = router;
