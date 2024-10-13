const mongoose = require("mongoose");

const favSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  photos: {
    type: [String],
    default: undefined,
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
  userNote: {
    type: String,
  },
  privacyOptions: {
    type: String,
  },
});

const Fav = mongoose.model("Fav", favSchema);

module.exports = Fav;

// weekday_text: {
//   type: [String],
// },
