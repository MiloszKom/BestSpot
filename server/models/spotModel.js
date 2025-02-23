const mongoose = require("mongoose");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

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
        80,
        "Your spot name is too long. Please keep it under 80 characters",
      ],
    },
    overview: {
      type: String,
      maxlength: [
        300,
        "Your spot overview is too long. Please keep it under 300 characters",
      ],
    },
    category: {
      type: String,
      required: [true, "A spot must have a category"],
    },
    photo: {
      type: String,
      default: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/defaults/not-found.jpg`,
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

spotSchema.virtual("likeCount").get(function () {
  if (!this.likes) return 0;
  return this.likes.filter((like) => like.isLikeActive).length;
});

spotSchema.virtual("isLiked").get(function () {
  return function (user) {
    return this.likes.some(
      (like) => like._id.equals(user?._id) && like.isLikeActive
    );
  };
});

spotSchema.virtual("isSaved").get(function () {
  return function (user) {
    return user?.spotlists.some((spotlist) =>
      spotlist.spots.some(
        (spotItem) => spotItem._id.toString() === this._id.toString()
      )
    );
  };
});

spotSchema.virtual("spotNote").get(function () {
  return function (user) {
    return (
      this.favouritedBy.find(
        (fav) => fav.userId.toString() === user?._id.toString()
      )?.note || null
    );
  };
});

const Spot = mongoose.model("Spot", spotSchema);

module.exports = Spot;
