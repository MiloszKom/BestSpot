const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: { type: String },
  reportedEntity: {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: String },
    replyId: { type: String },
    spotId: { type: mongoose.Schema.Types.ObjectId, ref: "Spot" },
    insightId: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
