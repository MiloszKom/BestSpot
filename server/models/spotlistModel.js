const mongoose = require("mongoose");

const spotlistSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  visibility: {
    type: String,
    required: true,
    enum: {
      values: ["public", "friends-only", "private"],
      message:
        "Visibility must be either 'public', 'friends-only', or 'private'.",
    },
  },
  cover: { type: String, default: "no-img-found.jpg" },
  description: { type: String },
  spots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spot" }],
  likes: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isLikeActive: { type: Boolean, default: true },
    },
  ],
  thresholdsReached: {
    type: [Number],
    default: [],
  },
});

const Spotlist = mongoose.model("Spotlist", spotlistSchema);

module.exports = Spotlist;
