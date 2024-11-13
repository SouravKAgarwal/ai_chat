import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    preferences: {
      language: { type: String, default: "en" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },

    profileImage: {
      public_id: { type: String },
      url: { type: String },
    },

    savedPrompts: [
      {
        prompt: { type: String },
        response: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    subscription: {
      isActive: { type: Boolean, default: false },
      plan: { type: String, enum: ["basic", "premium"], default: "basic" },
      validUntil: { type: Date },
    },

    apiUsage: {
      requestsMade: { type: Number, default: 0 },
      limitReached: { type: Boolean, default: false },
    },

    lastLogin: { type: Date },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN, {
    expiresIn: "30m",
  });
};

userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN, {
    expiresIn: "3d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isSubscriptionActive = function () {
  return (
    this.subscription.isActive && new Date() < this.subscription.validUntil
  );
};

const User = mongoose.model("User", userSchema);

export default User;
