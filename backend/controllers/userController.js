import User from "../models/User.js";
import ErrorHandler from "../config/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt.js";
import { redis } from "../config/redis.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const user = await User.create({ username, email, password });

  user.lastLogin = Date.now();
  await user.save();

  sendToken(user, 200, res);
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  user.lastLogin = Date.now();
  await user.save();

  sendToken(user, 200, res);
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("access_token", "", { maxAge: 1 });
  res.cookie("refresh_token", "", { maxAge: 1 });

  if (req.user?._id) {
    redis.del(req.user._id);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const updateUserInfo = catchAsyncError(async (req, res, next) => {
  const { username, preferences } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (username) user.username = username;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();
  await redis.set(user._id.toString(), JSON.stringify(user));

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateUserPassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.comparePassword(oldPassword))) {
    return next(new ErrorHandler("Incorrect password", 401));
  }

  user.password = newPassword;
  await user.save();
  await redis.set(user._id.toString(), JSON.stringify(user));

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export const updateUserAvatar = catchAsyncError(async (req, res, next) => {
  const { avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.profileImage?.public_id) {
    await cloudinary.v2.uploader.destroy(user.profileImage.public_id);
  }

  const uploadedImage = await cloudinary.v2.uploader.upload(avatar, {
    folder: "user_avatars",
    width: 150,
    crop: "scale",
  });

  user.profileImage = {
    public_id: uploadedImage.public_id,
    url: uploadedImage.secure_url,
  };

  await user.save();
  await redis.set(user._id.toString(), JSON.stringify(user));

  res.status(200).json({
    success: true,
    user,
  });
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await user.remove();
  await redis.del(id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const updateAccessToken = catchAsyncError(async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);

    if (!decoded) {
      return next(new ErrorHandler("Could not refresh token", 400));
    }

    const session = await redis.get(decoded.id);

    if (!session) {
      return next(new ErrorHandler("Please login again!", 400));
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "3d",
    });

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    await redis.set(user._id, JSON.stringify(user), "EX", 604800);
    req.user = user;
    return next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 404));
  }
});

export const getUserInfo = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 404));
  }
});
