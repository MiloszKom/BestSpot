const express = require("express");
const chatController = require("../controllers/chatController");
const { protect } = require("./../controllers/authController");
const router = express.Router();

router.get("/", protect, chatController.getChat);

router.get("/approved-chats", protect, chatController.getChats);

router.get("/request-chats", protect, chatController.getContactRequests);

module.exports = router;
