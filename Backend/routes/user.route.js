import express from "express";
import { getOtherUser, login, logout, register,toggleBlockUser,
getBlockStatus,  updateProfile, } from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router.post(
    "/register",
    upload.single("profilePhoto"),
    register
);
router.post("/login" , login);
router.get("/logout" , logout);
router.get("/" ,isAuthenticated, getOtherUser);
router.put(
  "/block/:id",
  isAuthenticated,
  toggleBlockUser
);

router.get(
  "/block-status/:id",
  isAuthenticated,
  getBlockStatus
);

router.put(
  "/profile",
  isAuthenticated,
  upload.single("profilePhoto"),
  updateProfile
);

export default router;