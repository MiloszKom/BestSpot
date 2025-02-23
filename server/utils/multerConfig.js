const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

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

// User

const uploadUserPhoto = upload.single("photo");

const initializeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `user-${req.user._id}.jpeg`;

    const buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: `users/${filename}`,
      Body: buffer,
      ContentType: "image/jpeg",
    };

    req.body.photoParams = params;

    req.body.photo = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/users/${filename}`;

    next();
  } catch (error) {
    return next(new AppError("Error processing image.", 500));
  }
};

// Spot

const uploadSpotPhoto = upload.single("photo");

const initializeSpotPhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `spot-${req.user._id}-${Date.now()}.jpeg`;

    const buffer = await sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: `spots/${filename}`,
      Body: buffer,
      ContentType: "image/jpeg",
    };

    req.body.photoParams = params;

    req.body.photo = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/spots/${filename}`;

    next();
  } catch (error) {
    return next(new AppError("Error processing image.", 500));
  }
};
// Post

const uploadPostPhotos = upload.array("photos", 5);

const initializePostPhotos = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.body.photos = [];

  req.body.postPhotosParams = [];

  try {
    const uploadPromises = req.files.map(async (file, index) => {
      const filename = `user-${req.user._id}-${Date.now()}-${index + 1}.jpeg`;

      const buffer = await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer();

      const params = {
        Bucket: bucketName,
        Key: `posts/${filename}`,
        Body: buffer,
        ContentType: "image/jpeg",
      };

      req.body.postPhotosParams.push(params);

      return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/posts/${filename}`;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    req.body.photos.push(...uploadedUrls);

    next();
  } catch (error) {
    // console.log(error);
    return next(
      new AppError("Error processing images or uploading to S3", 500)
    );
  }
};

// Upload Photo

const uploadImageToS3 = async (photoParams) => {
  if (!photoParams) {
    return;
  }

  try {
    await s3.send(new PutObjectCommand(photoParams));
  } catch (error) {
    return next(new AppError("Error uploading image to S3.", 500));
  }
};

// Delete Image

const deleteImage = async (imageKey) => {
  if (imageKey && imageKey === "defaults/not-found.jpg") return;
  try {
    const params = {
      Bucket: bucketName,
      Key: imageKey,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (err) {
    // console.log(err);
  }
};

module.exports = {
  uploadSpotPhoto,
  initializeSpotPhoto,
  uploadUserPhoto,
  initializeUserPhoto,
  uploadPostPhotos,
  initializePostPhotos,
  uploadImageToS3,
  deleteImage,
};
