const Fav = require("./../models/favModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllFav = catchAsync(async (req, res) => {
  const favs = await Fav.find();

  res.status(200).json({
    status: "success",
    results: favs.length,
    data: {
      favs,
    },
  });
});

exports.createFav = catchAsync(async (req, res) => {
  const newFav = await Fav.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      fav: newFav,
    },
  });
});

exports.getFav = catchAsync(async (req, res, next) => {
  const fav = await Fav.findById(req.params.id);

  if (!fav) {
    return next(new AppError("No favourite found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      fav,
    },
  });
});

exports.updateFav = catchAsync(async (req, res) => {
  const fav = await Fav.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!fav) {
    return next(new AppError("No favourite found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      fav,
    },
  });
});

exports.deleteFav = catchAsync(async (req, res) => {
  const fav = await Fav.findByIdAndDelete(req.params.id);

  if (!fav) {
    return next(new AppError("No favourite found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
