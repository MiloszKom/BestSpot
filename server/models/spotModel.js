const mongoose = require("mongoose");

const spotSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "A spot must have a name"],
    },
    overview: {
      type: String,
    },
    category: {
      type: String,
      required: [true, "A spot must have a category"],
    },
    photo: {
      type: String,
      default: "no-img-found.jpg",
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
    address: {
      type: String,
      required: [true, "A spot must have an address"],
      unique: true,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    geometry: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    favouritedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: {
          type: String,
          default: "",
        },
        _id: false,
      },
    ],
    insights: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
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
      },
    ],
  },
  { timestamps: true }
);

const Spot = mongoose.model("Spot", spotSchema);

module.exports = Spot;
