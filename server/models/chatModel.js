const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: { type: String, required: true },
      firstOfType: { type: Boolean, required: true },
      dayInfo: {
        isFirstMessage: { type: Boolean },
        date: { type: String },
      },
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false },
    },
  ],
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Chat", chatSchema);
