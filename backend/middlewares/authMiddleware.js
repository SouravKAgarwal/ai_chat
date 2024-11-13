import { catchAsyncError } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../config/errorHandler.js";
import { redis } from "../config/redis.js";
import { updateAccessToken } from "../controllers/userController.js";

export const protect = catchAsyncError(async (req, res, next) => {
  const access_token = req.cookies.access_token;
  const refresh_token = req.cookies.refresh_token;

  if (!access_token) {
    if (!refresh_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 404)
      );
    }
    try {
      await updateAccessToken(req, res, next);
    } catch (error) {
      return next(error);
    }
  } else {
    const decoded = jwt.decode(access_token);

    if (!decoded) {
      return next(new ErrorHandler("Token not valid", 404));
    }

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      try {
        await updateAccessToken(req, res, next);
      } catch (error) {
        return next(error);
      }
    } else {
      const user = await redis.get(decoded.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      req.user = JSON.parse(user);
      next();
    }
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          404
        )
      );
    }
    next();
  };
};
