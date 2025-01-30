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

const uploadUserPhoto = upload.single("photo");

const adjustPhoto = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/images/${filename}`);

  req.body.photo = filename;

  next();
};

module.exports = { uploadUserPhoto, adjustPhoto }; // Corrected export syntax
