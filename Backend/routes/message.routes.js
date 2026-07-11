import express from "express";
import {
  getMessage,
  sendMessage,
  markMessagesAsRead,
  getUnreadCounts,
    deleteMessage,
     editMessage,
      reactToMessage,
      togglePinMessage,
      getPinnedMessages,
      getConversationMedia,
} from "../controllers/message.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";


const router = express.Router();


// Send Message (Text + Image/File)
router.post(
  "/send/:id",
  isAuthenticated,
  upload.single("file"),
  sendMessage
);

router.get(
  "/pinned/:id",
  isAuthenticated,
  getPinnedMessages
);

router.get(
  "/media/:id",
  isAuthenticated,
  getConversationMedia
);

// Get Messages
router.get("/:id", isAuthenticated, getMessage);

// Mark Messages as Read
router.put("/read/:id", isAuthenticated, markMessagesAsRead);

// Get Unread Counts
router.get("/unread/count", isAuthenticated, getUnreadCounts);

// Delete Message
router.delete(
  "/delete/:id",
  isAuthenticated,
  deleteMessage
);

// Edit Message
router.put(
  "/edit/:id",
  isAuthenticated,
  editMessage
);

router.put(
  "/reaction/:id",
  isAuthenticated,
  reactToMessage
);

router.put(
  "/pin/:id",
  isAuthenticated,
  togglePinMessage
);

export default router;