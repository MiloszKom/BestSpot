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
      maxlength: [
        45,
        "Your spot name is too long. Please keep it under 80 characters",
      ],
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
          maxlength: [
            300,
            "Your note is too long. Please reduce it to 300 characters or less",
          ],
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
        content: {
          type: String,
          required: true,
          maxlength: [500, "An insight cannot exceed 500 characters"],
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
      },
    ],
  },
  { timestamps: true }
);

const Spot = mongoose.model("Spot", spotSchema);

module.exports = Spot;
