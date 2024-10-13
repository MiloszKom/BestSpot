const multer = require("multer");
const sharp = require("sharp");
const Fav = require("./../models/favModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const fs = require("fs");
const path = require("path");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log("MulterFilter :", file);
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([{ name: "photo", maxCount: 3 }]);

exports.adjustUserPhoto = async (req, res, next) => {
  if (!req.files || !req.files["photo"]) return next();

  await Promise.all(
    req.files["photo"].map(async (file, index) => {
      const filename = `user-${req.user.id}-${req.body._id}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/images/${filename}`);

      if (!req.body.photos) req.body.photos = [];
      req.body.photos.push(filename);
    })
  );

  next();
};

exports.getAllUserFav = catchAsync(async (req, res) => {
  const favs = await Fav.find({ user_id: req.user.id });

  res.status(200).json({
    status: "success",
    results: favs.length,
    data: {
      favs,
    },
  });
});

exports.createFav = catchAsync(async (req, res) => {
  if (req.body.current_opening_hours) {
    req.body.current_opening_hours = JSON.parse(req.body.current_opening_hours);
    delete req.body.current_opening_hours.open_now;
  }

  if (req.body.reviews) {
    req.body.reviews = JSON.parse(req.body.reviews);
  }

  if (req.body.geometry) {
    req.body.geometry = JSON.parse(req.body.geometry);
  }

  if (req.body.place_id) {
    delete req.body.place_id;
  }

  if (req.body.photos) {
    req.body.photos = req.body.photos.sort(
      (a, b) => a[a.length - 6] - b[b.length - 6]
    );
  }

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

exports.deleteFav = catchAsync(async (req, res, next) => {
  const fav = await Fav.findById(req.params.id);

  // if (!fav) {
  //   return next(new AppError("No favourite found with that ID", 404));
  // }

  // if (fav.photos && fav.photos.length > 0) {
  //   fav.photos.forEach((photo) => {
  //     const filePath = path.join(__dirname, "..", "uploads", "images", photo);
  //     fs.unlink(filePath, (err) => {
  //       if (err) {
  //         console.error(`Failed to delete image ${photo}:`, err);
  //       } else {
  //         console.log(`Successfully deleted image: ${photo}`);
  //       }
  //     });
  //   });
  // }

  await Fav.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
