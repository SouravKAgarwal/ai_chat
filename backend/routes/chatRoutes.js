import express from "express";
import {
  createChat,
  getChatsByUserId,
  deleteChat,
  getChatsById,
  updateChat,
  refreshChatResponse,
  shareChat,
  renameChatTitle,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateSharedLink } from "../middlewares/chatMiddleware.js";

const router = express.Router();

router.post("/", protect, createChat);
router.post("/update", protect, updateChat);
router.put("/refresh", protect, refreshChatResponse);
router.put("/update/title", protect, renameChatTitle);
router.post("/share", protect, shareChat);
router.get("/user/:userId", protect, getChatsByUserId);
router.get("/:chatId", protect, getChatsById);
router.delete("/:chatId", protect, deleteChat);

export default router;
