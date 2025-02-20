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
      maxlength: [1000, "Post cannot exceed 1000 characters"],
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
    bookmarks: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isLikeActive: { type: Boolean, default: true },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
          maxlength: [500, "A comment cannot exceed 500 characters"],
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
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            comment: {
              type: String,
              required: true,
              maxlength: [500, "A reply cannot exceed 500 characters"],
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
