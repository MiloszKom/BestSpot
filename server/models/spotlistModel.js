const mongoose = require("mongoose");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const spotlistSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      required: true,
      maxlength: [
        45,
        "Your spotlist name is too long. Please keep it under 45 characters",
      ],
    },
    visibility: {
      type: String,
      required: true,
      enum: {
        values: ["public", "friends-only", "private"],
        message:
          "Visibility must be either 'public', 'friends-only', or 'private'.",
      },
    },
    cover: {
      type: String,
      default: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/defaults/not-found.jpg`,
    },
    description: {
      type: String,
      maxlength: [
        300,
        "Your spotlist description exceeds the maximum limit of 300 characters.",
      ],
    },
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
  },
  {
    timestamps: true,
  }
);

const Spotlist = mongoose.model("Spotlist", spotlistSchema);

module.exports = Spotlist;
