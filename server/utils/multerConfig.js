const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
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

const uploadSpotPhoto = upload.single("photo");

const adjustPhoto = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `spot-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/images/${filename}`);

  req.body.photo = filename;

  next();
};

// User

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/images/${req.file.filename}`);

  next();
};

module.exports = {
  uploadSpotPhoto,
  adjustPhoto,
  uploadUserPhoto,
  resizeUserPhoto,
};
