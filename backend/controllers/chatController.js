import Chat from "../models/Chat.js";
import ErrorHandler from "../config/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import User from "../models/User.js";
import { generateChatResponse } from "../utils/index.js";
import { v2 as cloudinary } from "cloudinary";

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
      { sender: "ai", message: aiResponse.response.text },
    ];

    const title = aiResponse.title.text;
    const chat = new Chat({
      userId,
      title: title.trimEnd(),
      conversation,
      usageMetadata: aiResponse.usageMetadata,
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

    const sharedLink = `${process.env.FRONTEND_URL}/share/${chatId}`;
    const sharedLinkEntry = {
      url: sharedLink,
      chatId,
      title: chat.title,
      createdAt: new Date(),
    };

    user.sharedLinks.push(sharedLinkEntry);
    await user.save();

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
      message: "Chat sharing link created successfully.",
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
