const User = require("./../models/userModel");
const Spotlist = require("../models/spotlistModel");
const Spot = require("./../models/spotModel");
const AppError = require("../utils/appError");

exports.findUser = async (userId) => {
  const user = await User.findById(userId).populate("spotlists");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

exports.findSpot = async (spotId) => {
  const spot = await Spot.findById(spotId);
  if (!spot) throw new AppError("Spot not found", 404);
  return spot;
};

exports.findSpotlist = async (spotlistId) => {
  const spotlist = await Spotlist.findById(spotlistId);
  if (!spotlist) throw new AppError("Spotlist not found", 404);
  return spotlist;
};

exports.checkDuplicateSpotlistName = (user, name) => {
  const existingSpotlist = user.spotlists.find(
    (spotlist) => spotlist.name === name
  );
  if (existingSpotlist)
    throw new AppError("A spotlist with this name already exists", 409);
};

exports.checkSpotInOtherSpotlist = (user, spot) => {
  const alreadyInSpotlist = user.spotlists.some((spotlist) =>
    spotlist.spots.some((existingSpot) => existingSpot.equals(spot._id))
  );

  if (alreadyInSpotlist)
    throw new AppError("Spot is already saved in a spotlist", 409);
};
