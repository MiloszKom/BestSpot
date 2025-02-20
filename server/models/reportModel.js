const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    maxlength: [500, "Your report description is too long."],
  },
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
