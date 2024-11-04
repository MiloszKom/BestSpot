const express = require("express");
const chatController = require("../controllers/chatController");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/", authController.protect, chatController.getChat);

router.post("/", authController.protect, chatController.createChat);

router.get("/approved-chats", authController.protect, chatController.getChats);

router.get(
  "/request-chats",
  authController.protect,
  chatController.getContactRequests
);

module.exports = router;
