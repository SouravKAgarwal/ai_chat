import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({
  model: "gemini-1.5-flash",
});

async function encodeImageToBase64(imagePath, mimeType) {
  try {
    const data = await fs.promises.readFile(imagePath);
    return {
      inlineData: {
        data: data.toString("base64"),
        mimeType,
      },
    };
  } catch (err) {
    if (err.code === "ENOENT") {
      return {
        error: "File not found: Please check the file path and try again.",
      };
    } else {
      return { error: "Error reading image file: " + err.message };
    }
  }
}

export const generateChatResponse = async (
  prompt,
  signal,
  image,
  conversation = [],
  explanationLevel = "medium",
  isRefresh = false
) => {
  try {
    let chatHistory = [];
    let imageParts = [];
    let title = null;

    if (conversation) {
      for (const message of conversation) {
        chatHistory.push({
          role: message.sender,
          content: message.message,
        });

        if (message.image) {
          const convoImage = message.image.fileData;
          const imagePart = await encodeImageToBase64(
            convoImage.path,
            convoImage.mimeType || "image/png"
          );

          if (imagePart.error) {
            return { error: imagePart.error };
          }

          imageParts.push(imagePart);
        }
      }
    }

    chatHistory.push({ role: "human", content: prompt });

    const historyPrompt = chatHistory
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const promptText = `${historyPrompt}\n${prompt} with ${explanationLevel} explanation and not mentioning the level in response and the prompt.`;

    if (image) {
      const newImagePart = await encodeImageToBase64(
        image.path,
        image.mimeType || "image/png"
      );
      if (newImagePart.error) {
        return { error: newImagePart.error };
      }
      imageParts.push(newImagePart);
    }

    const contentArgs = [promptText, ...imageParts];

    const responseResult = await model.generateContent(contentArgs, { signal });
    const aiResponse = responseResult.response.text();
    const usageMetadata = responseResult.response.usageMetadata;

    if (conversation.length === 0) {
      const titlePrompt = `Generate a short, clear, and accurate title based on the main topic of this prompt: "${prompt}".`;
      const titleResult = await model.generateContent([titlePrompt]);
      title = titleResult.response.text();
    }

    return {
      response: { text: aiResponse },
      title: title ? { text: title } : null,
      usageMetadata,
      isRefresh,
    };
  } catch (error) {
    let errorMessage;
    if (error.response && error.response.status === 401) {
      errorMessage = "Unauthorized: Please check your API key or permissions.";
    } else if (error.response && error.response.status === 429) {
      errorMessage =
        "Rate limit exceeded: Too many requests. Please try again later.";
    } else if (error.code === "ECONNABORTED") {
      errorMessage =
        "Network timeout: The request took too long to complete. Please check your internet connection.";
    } else if (error.name === "AbortError") {
      errorMessage = "Request aborted: The request was canceled.";
    } else if (error.response && error.response.status === 400) {
      const errorData = await error.response.json();
      if (errorData.message.includes("recitation")) {
        errorMessage =
          "Content Error: Recitation or repetition of certain content is not allowed.";
      } else {
        errorMessage = "Bad Request: " + errorData.message;
      }
    } else {
      errorMessage = "An unexpected error occurred: " + error.message;
    }
    return { error: errorMessage };
  }
};
