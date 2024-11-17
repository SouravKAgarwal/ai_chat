import User from "../models/User.js";
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "../config/errorHandler.js";

export const validateSharedLink = catchAsyncError(async (req, res, next) => {
  const { chatId, userId } = req.query;

  if (!chatId || !userId) {
    return next(new ErrorHandler("Invalid shared link parameters.", 400));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    const sharedLink = user.sharedLinks.find(
      (link) => link.chatId.toString() === chatId
    );

    if (!sharedLink) {
      return next(new ErrorHandler("Shared link expired or not found.", 410));
    }

    req.chatId = chatId;
    next();
  } catch (error) {
    console.error("Error validating shared link:", error);
    return next(new ErrorHandler("Failed to validate shared link.", 500));
  }
});
