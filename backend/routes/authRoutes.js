import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateAccessToken,
} from "../controllers/userController.js";
import { uploadImage } from "../config/image.js";

const router = express.Router();

router.post("/upload", uploadImage);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/refresh", updateAccessToken);
router.get("/logout", protect, logoutUser);

export default router;
