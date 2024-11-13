import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
  updateUserPassword,
  updateUserRole,
} from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getUserInfo);
router.put("/update", protect, updateUserInfo);
router.put("/update/password", protect, updateUserPassword);
router.put("/update/avatar", protect, updateUserAvatar);
router.get("/all-users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/update/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/delete/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
