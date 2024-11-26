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
  getSharedChat,
  deleteSharedChat,
  deleteAllChat,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createChat);
router.post("/update", protect, updateChat);
router.put("/refresh", protect, refreshChatResponse);
router.put("/rename-title", protect, renameChatTitle);
router.post("/share", protect, shareChat);
router.get("/share/:shareId", getSharedChat);
router.delete("/share/:shareId", protect, deleteSharedChat);
router.get("/user/:userId", protect, getChatsByUserId);
router.route("/:chatId").get(protect, getChatsById).delete(protect, deleteChat);
router.delete("/all", protect, deleteAllChat);

export default router;
