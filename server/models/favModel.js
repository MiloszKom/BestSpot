const mongoose = require("mongoose");

const favSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A favourite must have a name"],
  },
  rating: {
    type: Number,
    defaut: 0.0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
});

const Fav = mongoose.model("Fav", favSchema);

module.exports = Fav;
