
import mongoose from "mongoose";

const messageModel = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text Message
    message: {
      type: String,
      default: "",
    },

    // Image/File URL (Cloudinary)
    fileUrl: {
      type: String,
      default: "",
    },

    // Original File Name
    fileName: {
      type: String,
      default: "",
    },

    // MIME Type
    fileType: {
      type: String,
      default: "",
    },

    // Read Status
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    unread: {
      type: Boolean,
      default: true,
    },

    // Edit Support
    edited: {
      type: Boolean,
      default: false,
    },

    // Delete Support
    deleted: {
      type: Boolean,
      default: false,
    },

// Pin Message Support
isPinned: {
  type: Boolean,
  default: false,
},

pinnedAt: {
  type: Date,
  default: null,
},

pinnedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

// Reply Message Support
replyTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Message",
  default: null,
},
reactions: [
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emoji: {
      type: String,
      required: true,
    },
  },
],

blockedAtSend: {
  type: Boolean,
  default: false,
},
hiddenFromReceiver: {
  type: Boolean,
  default: false,
},

  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model(
  "Message",
  messageModel
);





