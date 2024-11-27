import Chat from "../models/Chat.js";
import ErrorHandler from "../config/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import User from "../models/User.js";
import { generateChatResponse } from "../utils/index.js";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../config/redis.js";

export const createChat = catchAsyncError(async (req, res, next) => {
  const { userId, prompt, file, image } = req.body;

  if (!userId) {
    return next(new ErrorHandler("User login required.", 400));
  }

  if (!prompt) {
    return next(new ErrorHandler("Prompt cannot be empty.", 400));
  }

  try {
    let imageUrl = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResult.secure_url;
    }

    const aiResponse = await generateChatResponse(prompt, null, file);

    if (aiResponse.error) {
      return next(new ErrorHandler(aiResponse.error, 500));
    }

    const imageInfo = {
      imageUrl,
      fileData: file,
    };

    const conversation = [
      { sender: "human", message: prompt, image: image && imageInfo },
      {
        sender: "ai",
        message: aiResponse.response.text,
        usageMetaData: aiResponse.usageMetadata,
      },
    ];

    const title = aiResponse.title.text;
    const chat = new Chat({
      userId,
      title: title.trimEnd(),
      conversation,
    });

    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("Error in creating chat:", error);
    return next(new ErrorHandler(error, 500));
  }
});

export const updateChat = catchAsyncError(async (req, res, next) => {
  const { chatId, prompt, file, image } = req.body;

  if (!chatId) {
    return next(new ErrorHandler("Chat ID is required.", 400));
  }

  if (!prompt) {
    return next(new ErrorHandler("Prompt cannot be empty.", 400));
  }

  try {
    let chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler("Chat not found.", 404));
    }

    let imageUrl = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResult.secure_url;
    }

    const aiResponse = await generateChatResponse(
      prompt,
      null,
      file,
      chat.conversation
    );

    if (aiResponse.error) {
      return next(new ErrorHandler(aiResponse.error, 500));
    }

    const humanMessage = {
      sender: "human",
      message: prompt,
      image: image
        ? {
            imageUrl,
            fileData: file,
          }
        : undefined,
    };

    const aiMessage = {
      sender: "ai",
      message: aiResponse.response.text,
      usageMetaData: aiResponse.usageMetadata,
    };

    chat.conversation.push(humanMessage, aiMessage);

    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Error in updating chat:", error);
    return next(new ErrorHandler("Failed to update chat.", 500));
  }
});

export const refreshChatResponse = catchAsyncError(async (req, res, next) => {
  const { chatId, messageIndex } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandler("Chat not found.", 404));

    const conversationEntry = chat.conversation[messageIndex];
    if (!conversationEntry || conversationEntry.sender !== "ai") {
      return next(new ErrorHandler("Invalid AI message to refresh.", 404));
    }

    const prompt = chat.conversation[messageIndex - 1].message;

    const { response, usageMetadata, error } = await generateChatResponse(
      prompt,
      null,
      conversationEntry.image && conversationEntry.image.fileData,
      chat.conversation,
      "medium"
    );

    if (error) {
      return next(new ErrorHandler(error, 500));
    }

    const refreshedMessage = {
      message: response.text,
      usageMetaData: usageMetadata,
    };

    conversationEntry.refreshedResponses =
      conversationEntry.refreshedResponses || [];
    conversationEntry.refreshedResponses.push(refreshedMessage);

    await chat.save();

    res.status(200).json({ success: true, refreshedResponse: response.text });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getChatsByUserId = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("User ID is required.", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const chats = await Chat.find({ userId }).populate("userId", "username");

  res.status(200).json({ success: true, chats });
});

export const getChatsById = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) {
    return next(new ErrorHandler("Chat ID is required.", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  res.status(200).json({ success: true, chat });
});

export const deleteChat = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  const deletedChat = await Chat.findByIdAndDelete(chatId);
  if (!deletedChat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  res.status(200).json({ success: true, message: "Chat deleted successfully" });
});

export const shareChat = catchAsyncError(async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId) {
    return next(new ErrorHandler("Chat ID is required.", 400));
  }

  if (!userId) {
    return next(new ErrorHandler("User ID is required.", 400));
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler("Chat not found.", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    if (!chat.shareUuid) {
      chat.shareUuid = uuidv4();
      await chat.save();
    }

    const sharedLink = `${process.env.FRONTEND_URL}/share/${chat.shareUuid}`;
    const sharedLinkEntry = {
      url: sharedLink,
      chatId,
      title: chat.title,
      createdAt: new Date(),
    };

    user.sharedLinks.push(sharedLinkEntry);
    await user.save();
    await redis.set(user._id.toString(), JSON.stringify(user));

    setTimeout(async () => {
      try {
        const updatedUser = await User.findById(userId);
        updatedUser.sharedLinks = updatedUser.sharedLinks.filter(
          (link) => link.url !== sharedLink
        );
        await updatedUser.save();
      } catch (err) {
        console.error("Failed to delete shared link:", err);
      }
    }, 24 * 60 * 60 * 1000);

    res.status(200).json({
      success: true,
      sharedLink,
      message: "Share link created successfully.",
    });
  } catch (error) {
    console.error("Error in sharing chat:", error);
    return next(new ErrorHandler("Failed to create shared link.", 500));
  }
});

export const renameChatTitle = catchAsyncError(async (req, res, next) => {
  const { chatId, newTitle } = req.body;

  if (!chatId) {
    return next(new ErrorHandler("Chat ID is required.", 400));
  }

  if (!newTitle || newTitle.trim().length === 0) {
    return next(new ErrorHandler("New title cannot be empty.", 400));
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler("Chat not found", 404));
    }

    chat.title = newTitle.trim();
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Chat title updated successfully",
    });
  } catch (error) {
    console.error("Error in renaming chat title:", error);
    return next(new ErrorHandler("Failed to rename chat title.", 500));
  }
});

export const getSharedChat = catchAsyncError(async (req, res, next) => {
  const { shareId } = req.params;

  if (!shareId) {
    return next(new ErrorHandler("Share UUID is required.", 400));
  }

  try {
    const chat = await Chat.findOne({ shareUuid: shareId });
    if (!chat) {
      return next(new ErrorHandler("Shared chat not found.", 404));
    }

    res.status(200).json({
      success: true,
      chat: {
        title: chat.title,
        conversation: chat.conversation,
        userId: chat.userId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in retrieving shared chat:", error);
    return next(new ErrorHandler("Failed to retrieve shared chat.", 500));
  }
});

export const deleteSharedChat = catchAsyncError(async (req, res, next) => {
  const { shareId } = req.params;

  if (!shareId) {
    return next(new ErrorHandler("Share UUID is required.", 400));
  }

  try {
    const chat = await Chat.findById(shareId);

    if (!chat) {
      return next(new ErrorHandler("Shared chat not found.", 404));
    }

    const user = await User.findOne({ "sharedLinks.chatId": chat._id });

    if (user) {
      user.sharedLinks = user.sharedLinks.filter(
        (link) => link.chatId.toString() !== chat._id.toString()
      );

      await user.save();
      await redis.set(user._id.toString(), JSON.stringify(user));
    }

    res.status(200).json({
      success: true,
      message: "Shared chat deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleting shared chat:", error);
    return next(new ErrorHandler("Failed to delete shared chat.", 500));
  }
});

export const deleteAllChat = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized: User not found.", 401));
  }

  try {
    const result = await Chat.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} chats deleted.`,
    });
  } catch (error) {
    console.error("Error deleting user chats:", error);
    return next(new ErrorHandler("Failed to delete all chats.", 500));
  }
});
