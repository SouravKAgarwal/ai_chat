import Chat from "../models/Chat.js";
import ErrorHandler from "../config/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import User from "../models/User.js";
import { generateChatResponse } from "../utils/index.js";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../config/redis.js";

export const createChat = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { prompt, file, image } = req.body;

  if (!userId) {
    return next(new ErrorHandler("User login required.", 400));
  }

  if (!prompt) {
    return next(new ErrorHandler("Prompt cannot be empty.", 400));
  }

  try {
    let imageUrl = null;
    let fileData = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `${userId}`,
      });
      imageUrl = uploadResult.secure_url;
    }

    if (file) {
      fileData = {
        destination: file.destination,
        encoding: file.encoding,
        fieldname: file.fieldname,
        filename: file.filename,
        mimetype: file.mimetype,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
      };
    }

    const { response, title, usageMetadata, error } =
      await generateChatResponse(prompt, null, file);

    if (error) {
      return next(new ErrorHandler(error, 500));
    }

    const imageInfo = image || file ? { imageUrl, fileData } : null;

    const conversation = [
      { sender: "human", message: prompt, image: imageInfo },
      {
        sender: "ai",
        message: response.text,
        refreshedResponses: [],
      },
    ];

    const chat = new Chat({
      userId,
      title: title.text.trimEnd(),
      conversation,
      usageMetadata,
      shareUuid: uuidv4(),
    });

    await chat.save();

    const user = await User.findById(userId);

    user.tokenUsed.totalTokens += chat.usageMetadata.totalTokenCount;

    if (user.tokenUsed.totalTokens >= user.tokenUsed.limitTokens) {
      user.tokenUsed.limitReached = true;
    }

    await user.save();

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

    const user = await User.findById(chat.userId);

    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    let imageUrl = null;
    let fileData = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `${user._id}`,
      });
      imageUrl = uploadResult.secure_url;
    }

    if (file) {
      fileData = {
        destination: file.destination,
        encoding: file.encoding,
        fieldname: file.fieldname,
        filename: file.filename,
        mimetype: file.mimetype,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
      };
    }

    const { response, usageMetadata, error } = await generateChatResponse(
      prompt,
      null,
      file,
      chat.conversation
    );

    if (error) {
      return next(new ErrorHandler(error, 500));
    }

    const humanMessage = {
      sender: "human",
      message: prompt,
      image:
        image || file
          ? {
              imageUrl,
              fileData,
            }
          : null,
    };

    const aiMessage = {
      sender: "ai",
      message: response.text,
      refreshedResponses: [],
    };

    chat.conversation.push(humanMessage, aiMessage);

    const newPromptTokens = usageMetadata?.promptTokenCount || 0;
    const newCandidateTokens = usageMetadata?.candidatesTokenCount || 0;
    const newTotalTokens = usageMetadata?.totalTokenCount || 0;

    chat.usageMetadata.promptTokenCount =
      (chat.usageMetadata.promptTokenCount || 0) + newPromptTokens;

    chat.usageMetadata.candidatesTokenCount =
      (chat.usageMetadata.candidatesTokenCount || 0) + newCandidateTokens;

    chat.usageMetadata.totalTokenCount =
      (chat.usageMetadata.totalTokenCount || 0) + newTotalTokens;

    await chat.save();

    user.tokenUsed.totalTokens += chat.usageMetadata.totalTokenCount;

    if (user.tokenUsed.totalTokens >= user.tokenUsed.limitTokens) {
      user.tokenUsed.limitReached = true;
    }

    await user.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Error in updating chat:", error);
    return next(new ErrorHandler("Failed to update chat.", 500));
  }
});

export const refreshChatResponse = catchAsyncError(async (req, res, next) => {
  const { chatId, messageIndex } = req.body;

  if (!chatId || messageIndex === undefined) {
    return next(
      new ErrorHandler("Chat ID and message index are required.", 400)
    );
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ErrorHandler("Chat not found.", 404));
    }

    const conversationEntry = chat.conversation[messageIndex];
    if (!conversationEntry || conversationEntry.sender !== "ai") {
      return next(new ErrorHandler("Invalid AI message to refresh.", 404));
    }

    const previousEntry = chat.conversation[messageIndex - 1];
    if (!previousEntry || previousEntry.sender !== "human") {
      return next(
        new ErrorHandler(
          "Cannot refresh: Missing or invalid preceding human message.",
          400
        )
      );
    }

    const prompt = previousEntry.message;

    const { response, usageMetadata, error } = await generateChatResponse(
      prompt,
      null,
      conversationEntry.image?.fileData,
      chat.conversation
    );

    if (error) {
      return next(new ErrorHandler(error, 500));
    }

    const refreshedMessage = {
      message: response.text,
    };

    conversationEntry.refreshedResponses =
      conversationEntry.refreshedResponses || [];
    conversationEntry.refreshedResponses.push(refreshedMessage);

    chat.usageMetadata = {
      promptTokenCount:
        (chat.usageMetadata.promptTokenCount || 0) +
        (usageMetadata?.promptTokenCount || 0),
      candidatesTokenCount:
        (chat.usageMetadata.candidatesTokenCount || 0) +
        (usageMetadata?.candidatesTokenCount || 0),
      totalTokenCount:
        (chat.usageMetadata.totalTokenCount || 0) +
        (usageMetadata?.totalTokenCount || 0),
    };

    await chat.save();

    const user = await User.findById(chat.userId);

    user.tokenUsed.totalTokens += chat.usageMetadata.totalTokenCount;

    if (user.tokenUsed.totalTokens > user.tokenUsed.limitTokens) {
      user.tokenUsed.limitReached = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      refreshedResponse: response.text,
    });
  } catch (error) {
    console.error("Error in refreshing chat response:", error);
    return next(new ErrorHandler("Failed to refresh chat response.", 500));
  }
});

export const getChatsByUserId = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

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
  const { chatId } = req.body;
  const userId = req.user._id;

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

export const archiveChat = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;
  const { chatId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized: User not found.", 401));
  }

  try {
    let result;
    if (chatId) {
      result = await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        { isArchived: true },
        { new: true }
      );

      if (!result) {
        return next(new ErrorHandler("Chat not found.", 404));
      }

      res.status(200).json({
        success: true,
        message: "Chat archived successfully.",
        chat: result,
      });
    } else {
      result = await Chat.updateMany(
        { userId, isArchived: false },
        { isArchived: true }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} chats archived.`,
      });
    }
  } catch (error) {
    console.error("Error archiving chats:", error.message);
    return next(new ErrorHandler("Failed to archive chats.", 500));
  }
});

export const unArchiveChat = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;
  const { chatId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized: User not found.", 401));
  }

  try {
    let result;
    if (chatId) {
      result = await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        { isArchived: false },
        { new: true }
      );

      if (!result) {
        return next(new ErrorHandler("Chat not found.", 404));
      }

      res.status(200).json({
        success: true,
        message: "Chat unarchived successfully.",
        chat: result,
      });
    } else {
      result = await Chat.updateMany(
        { userId, isArchived: true },
        { isArchived: false }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} chats unarchived.`,
      });
    }
  } catch (error) {
    console.error("Error unarchiving chats:", error.message);
    return next(new ErrorHandler("Failed to unarchive chats.", 500));
  }
});

export const getArchivedChats = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized: User not found.", 401));
  }

  try {
    const archivedChats = await Chat.find({ userId, isArchived: true });

    res.status(200).json({
      success: true,
      message: `${archivedChats.length} archived chats retrieved.`,
      archivedChats,
    });
  } catch (error) {
    console.error("Error retrieving archived chats:", error.message);
    return next(new ErrorHandler("Failed to retrieve archived chats.", 500));
  }
});
