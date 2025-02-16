const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const validateName = (name) => {
  if (!/^[a-zA-Z\s-]+$/.test(name)) {
    return false;
  }

  if (name.length < 3) {
    return false;
  }

  const RESERVED_NAMES = ["admin", "root", "system", "null", "undefined"];
  if (RESERVED_NAMES.includes(name.toLowerCase())) {
    return false;
  }

  if (
    name.startsWith(" ") ||
    name.endsWith(" ") ||
    name.startsWith("-") ||
    name.endsWith("-")
  ) {
    return false;
  }

  return true;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a username"],
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username cannot exceed 20 characters"],
    unique: true,
    validate: {
      validator: validateName,
      message: "Name can only contain letters, spaces, and hyphens",
    },
  },
  handle: {
    type: String,
    unique: true,
    minlength: [3, "Handle must be at least 3 characters long"],
    maxlength: [30, "Handle cannot exceed 30 characters"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Handle can only contain letters, numbers, and underscores",
    ],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  spots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spot" }],
  spotlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spotlist" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chatsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  notifications: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      originDetails: {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        commentId: { type: String },
        replyId: { type: String },
        spotlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Spotlist" },
        spotId: { type: mongoose.Schema.Types.ObjectId, ref: "Spot" },
        insightId: { type: String },
      },
      title: { type: String },
      message: { type: String },
      createdAt: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false },
    },
  ],
  isOnline: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const RESERVED_HANDLES = process.env.RESERVED_HANDLES
  ? process.env.RESERVED_HANDLES.split(",")
  : [];

const generateHandle = async function (user, model) {
  let baseHandle = user.name.toLowerCase().replace(/\s+/g, "");

  baseHandle = baseHandle.replace(/[^a-z0-9_]/g, "");

  if (user.handle === baseHandle) {
    return baseHandle;
  }

  if (RESERVED_HANDLES.includes(baseHandle)) {
    baseHandle = `${baseHandle}1`;
  }

  let handle = baseHandle;
  let count = 1;

  while (await model.exists({ handle })) {
    handle = `${baseHandle}${count}`;
    count++;
  }

  return handle;
};

userSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this?.handle) {
    this.handle = await generateHandle(this, this.constructor);
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
