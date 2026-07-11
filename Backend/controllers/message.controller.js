import {
  io,
  getReceiverSocketId,
} from "../socket/socket.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

import mongoose from "mongoose";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";




//block 
const isBlockRelationshipActive = async (
  userId1,
  userId2
) => {
  const [user1, user2] = await Promise.all([
    User.findById(userId1).select("blockedUsers"),
    User.findById(userId2).select("blockedUsers"),
  ]);

  if (!user1 || !user2) return true;

  return (
    (user1.blockedUsers || []).some(
      (id) => String(id) === String(userId2)
    ) ||
    (user2.blockedUsers || []).some(
      (id) => String(id) === String(userId1)
    )
  );
};

//send message 
export const sendMessage = async (req, res) => {
  try {

    const senderId = req.id;
    const receiverId = req.params.id;
   const { message, replyTo } = req.body;
const file = req.file;

if (
  (!message || !message.trim()) &&
  !file
) {
  return res.status(400).json({
    success: false,
    message: "Message or file is required",
  });
}


const [sender, receiver] = await Promise.all([
  User.findById(senderId).select("blockedUsers"),
  User.findById(receiverId).select("blockedUsers"),
]);

if (!sender || !receiver) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const senderBlockedReceiver =
  (sender.blockedUsers || []).some(
    (id) => String(id) === String(receiverId)
  );

const receiverBlockedSender =
  (receiver.blockedUsers || []).some(
    (id) => String(id) === String(senderId)
  );



// Agar sender ne receiver ko block kiya hai,
// sender ko message bhejne ki permission nahi
if (senderBlockedReceiver) {
  return res.status(403).json({
    success: false,
    message:
      "Unblock this user before sending messages",
  });
}

// Agar receiver ne sender ko block kiya hai,
// sender ko explicitly nahi batayenge
const shouldHideFromReceiver =
  receiverBlockedSender;



    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }


//file sharing
let fileUrl = "";
let fileName = "";
let fileType = "";

if (file) {
  const fileUri = getDataUri(file);

  const uploadResponse = await cloudinary.uploader.upload(
    fileUri.content,
    {
      resource_type: "auto",
      folder: "chat-files",
    }
  );

  fileUrl = uploadResponse.secure_url;
  fileName = file.originalname;
  fileType = file.mimetype;
}




    // Check if receiver is online
const receiverSocketId = getReceiverSocketId(receiverId);

let newMessage = await Message.create({
  senderId,
  receiverId,

  message: message || "",

  fileUrl,
  fileName,
  fileType,

  replyTo: replyTo || null,

  

status: shouldHideFromReceiver
  ? "sent"
  : receiverSocketId
  ? "delivered"
  : "sent",

unread: !shouldHideFromReceiver,

blockedAtSend: shouldHideFromReceiver,

hiddenFromReceiver:
  shouldHideFromReceiver,

});


newMessage = await newMessage.populate({
  path: "replyTo",
  select: "message fileUrl fileName fileType senderId deleted",
});

// Save conversation
conversation.messages.push(newMessage._id);
await conversation.save();

// Send message in real time if receiver is online
if (
  receiverSocketId &&
  !shouldHideFromReceiver
) {
  io.to(receiverSocketId).emit(
    "newMessage",
    newMessage
  );
}


    return res.status(201).json({
      success: true,
      newMessage,
    });

  } catch (error) {
  
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//get message
export const getMessage = async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const currentUserId = req.id;

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = 30;
    const skip = (page - 1) * limit;

   

    const query = {
      $or: [
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        },

        {
          senderId: otherUserId,
          receiverId: currentUserId,

          // Current user receiver hai,
          // hidden blocked messages mat dikhao
          hiddenFromReceiver: {
            $ne: true,
          },
        },
      ],
    };

    /*
      limit + 1 fetch kar rahe hain
      taaki hasMore accurately pata chale.
    */

    let messages = await Message.find(query)
      .populate({
        path: "replyTo",
        select:
          "message fileUrl fileName fileType senderId deleted",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1);

    const hasMore =
      messages.length > limit;

    if (hasMore) {
      messages = messages.slice(0, limit);
    }

    /*
      Database se newest → oldest mila.
      UI ke liye oldest → newest kar rahe hain.
    */

    messages.reverse();

    return res.status(200).json({
      success: true,
      messages,
      hasMore,
      page,
    });
  } catch (error) {
    console.log(
      "Get Messages Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//mark message as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const senderId = req.params.id;
    const receiverId = req.id;



    await Message.updateMany(
  {
    senderId: selectedUserId,
    receiverId: currentUserId,

    hiddenFromReceiver: {
      $ne: true,
    },
  },
  {
    $set: {
      status: "read",
      unread: false,
    },
  }
);



    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//getunread counts
export const getUnreadCounts = async (req, res) => {
  try {
    const receiverId = new mongoose.Types.ObjectId(req.id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId,
          unread: true,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      unreadCounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Message (Delete for Everyone)
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Sirf sender hi delete kar sakta hai
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.message = "🚫 This message was deleted";
    message.fileUrl = "";
    message.fileName = "";
    message.fileType = "";
    message.deleted = true;

    await message.save();

    // Receiver ko realtime update
    const receiverSocketId = getReceiverSocketId(
      message.receiverId.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageDeleted",
        message
      );
    }

    // Sender ko bhi update
    const senderSocketId = getReceiverSocketId(
      message.senderId.toString()
    );

    if (senderSocketId) {
      io.to(senderSocketId).emit(
        "messageDeleted",
        message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted",
      deletedMessage: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Edit Message
export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.id;
    const { message: newText } = req.body;

    if (!newText || !newText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Sirf sender apna message edit kar sakta hai
    if (String(existingMessage.senderId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // File-only message ko edit mat karo
    if (!existingMessage.message) {
      return res.status(400).json({
        success: false,
        message: "File-only message cannot be edited",
      });
    }

    if (existingMessage.deleted) {
      return res.status(400).json({
        success: false,
        message: "Deleted message cannot be edited",
      });
    }

    existingMessage.message = newText.trim();
    existingMessage.edited = true;

    await existingMessage.save();

    const receiverSocketId = getReceiverSocketId(
      existingMessage.receiverId.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageEdited",
        existingMessage
      );
    }

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      editedMessage: existingMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Add or Update Message Reaction
export const reactToMessage = async (req, res) => {
  try {
    const userId = req.id;
    const messageId = req.params.id;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }



// 👇 BLOCK CHECK EXACTLY YAHA ADD KARO

const isParticipant =
  String(message.senderId) === String(userId) ||
  String(message.receiverId) === String(userId);

if (!isParticipant) {
  return res.status(403).json({
    success: false,
    message: "Not authorized",
  });
}

const otherUserId =
  String(message.senderId) === String(userId)
    ? message.receiverId
    : message.senderId;

const blockActive =
  await isBlockRelationshipActive(
    userId,
    otherUserId
  );

if (blockActive) {
  return res.status(403).json({
    success: false,
    message: "This action is unavailable",
  });
}


    const existingReactionIndex =
      message.reactions.findIndex(
        (reaction) =>
          String(reaction.userId) === String(userId)
      );

    // Same emoji clicked again -> remove reaction
    if (
      existingReactionIndex !== -1 &&
      message.reactions[existingReactionIndex].emoji === emoji
    ) {
      message.reactions.splice(existingReactionIndex, 1);
    }

    // Different emoji -> update reaction
    else if (existingReactionIndex !== -1) {
      message.reactions[existingReactionIndex].emoji = emoji;
    }

    // First reaction
    else {
      message.reactions.push({
        userId,
        emoji,
      });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(
      String(message.receiverId)
    );

    const senderSocketId = getReceiverSocketId(
      String(message.senderId)
    );

    const reactionData = {
      messageId: message._id,
      reactions: message.reactions,
    };

    // Update receiver in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageReaction",
        reactionData
      );
    }

    // Update sender's other active client if needed
    if (
      senderSocketId &&
      senderSocketId !== receiverSocketId
    ) {
      io.to(senderSocketId).emit(
        "messageReaction",
        reactionData
      );
    }

    return res.status(200).json({
      success: true,
      messageId: message._id,
      reactions: message.reactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Pin / Unpin Message
export const togglePinMessage = async (req, res) => {
  try {
    const userId = req.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender or receiver can pin/unpin
    const isParticipant =
      String(message.senderId) === String(userId) ||
      String(message.receiverId) === String(userId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Toggle pin status
    message.isPinned = !message.isPinned;
    if (message.isPinned) {
      message.pinnedAt = new Date();
      message.pinnedBy = userId;
    } else {
      message.pinnedAt = null;
      message.pinnedBy = null;
    }

    await message.save();

const updatedMessage = await Message.findById(
  message._id
).populate({
  path: "replyTo",
  select:
    "message fileUrl fileName fileType senderId deleted",
});

const pinData = {
  messageId: updatedMessage._id,
  isPinned: updatedMessage.isPinned,
  pinnedAt: updatedMessage.pinnedAt,
  pinnedBy: updatedMessage.pinnedBy,
  message: updatedMessage,
};

    // Notify the other participant
    const otherUserId =
      String(message.senderId) === String(userId)
        ? String(message.receiverId)
        : String(message.senderId);


        const blockActive =
  await isBlockRelationshipActive(
    userId,
    otherUserId
  );

if (blockActive) {
  return res.status(403).json({
    success: false,
    message: "This action is unavailable",
  });
}

    const otherSocketId =
      getReceiverSocketId(otherUserId);

    if (otherSocketId) {
      io.to(otherSocketId).emit(
        "messagePinned",
        pinData
      );
    }

    return res.status(200).json({
      success: true,
      ...pinData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Pinned Messages of a Conversation
export const getPinnedMessages = async (req, res) => {
  try {
    const currentUserId = req.id;
    const otherUserId = req.params.id;

    const pinnedMessages = await Message.find({
      isPinned: true,
      deleted: false,
      $or: [
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: currentUserId,
        },
      ],
    })
      .sort({ pinnedAt: -1 })
      .populate({
        path: "replyTo",
        select:
          "message fileUrl fileName fileType senderId deleted",
      });

    return res.status(200).json({
      success: true,
      pinnedMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getconversationmedia
export const getConversationMedia = async (req, res) => {
  try {
    const currentUserId = req.id;
    const otherUserId = req.params.id;

    const media = await Message.find({
      deleted: false,

      fileUrl: {
        $exists: true,
        $ne: "",
      },

      $or: [
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: currentUserId,
        },
      ],
    })
      .select(
        "fileUrl fileName fileType createdAt senderId receiverId"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    console.log("Get Media Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};