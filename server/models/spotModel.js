const mongoose = require("mongoose");

const spotSchema = new mongoose.Schema({
  google_id: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
    default: "no-img-found.jpg",
  },
  name: {
    type: String,
  },
  rating: {
    type: Number,
    defaut: 0.0,
  },
  user_ratings_total: {
    type: Number,
    default: 0,
  },
  vicinity: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  current_opening_hours: {
    periods: [
      {
        close: {
          date: { type: String },
          day: { type: Number },
          time: { type: String },
        },
        open: {
          date: { type: String },
          day: { type: Number },
          time: { type: String },
        },
      },
    ],
    weekday_text: {
      type: [String],
    },
  },
  website: {
    type: String,
  },
  international_phone_number: {
    type: String,
  },
  reviews: [
    {
      author_name: {
        type: String,
      },
      profile_photo_url: {
        type: String,
      },
      rating: {
        type: Number,
      },
      relative_time_description: {
        type: String,
      },
      text: {
        type: String,
      },
      time: {
        type: Number,
      },
    },
  ],
  url: {
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
});

const Spot = mongoose.model("Spot", spotSchema);

module.exports = Spot;
