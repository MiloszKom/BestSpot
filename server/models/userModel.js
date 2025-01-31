const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    unique: true,
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
  spotlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spotlist" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
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
        commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
        replyId: { type: mongoose.Schema.Types.ObjectId, ref: "Reply" },
        spotlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Spotlist" },
        spotId: { type: mongoose.Schema.Types.ObjectId, ref: "Spot" },
        insightId: { type: mongoose.Schema.Types.ObjectId, ref: "Insight" },
      },
      title: { type: String },
      message: { type: String, required: true },
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

const generateHandle = async function (name, model) {
  let baseHandle = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  let handle = baseHandle;
  let count = 1;

  while (await model.exists({ handle })) {
    handle = `${baseHandle}_${count}`;
    count++;
  }

  return handle;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();
  this.handle = await generateHandle(this.name, this.constructor);
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
