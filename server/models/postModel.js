const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "You have to be logged in to create a post"],
    },
    visibility: {
      type: String,
      enum: ["public", "friends"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post cannot be empty"],
    },
    spots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Spot",
      },
    ],
    spotlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Spotlist",
      },
    ],
    photos: {
      type: [String],
      default: undefined,
    },
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
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: { type: String, required: true },
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
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            comment: { type: String, required: true },
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
            timestamp: { type: Date, default: Date.now },
            isEdited: { type: Boolean, default: false },
          },
        ],
        timestamp: { type: Date, default: Date.now },
        isEdited: { type: Boolean, default: false },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
