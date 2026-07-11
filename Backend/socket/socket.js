import {Server} from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";



const app = express();

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

const userSocketMap = {}; //{userid->socketid}

io.on("connection", async (socket)=>{
    console.log('user connected', socket.id);


    const userId = socket.handshake.query.userId

if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;


    // MARK SENT -> DELIVERED
   


    const pendingMessages = await Message.find({
  receiverId: userId,
  status: "sent",

  hiddenFromReceiver: {
    $ne: true,
  },

  blockedAtSend: {
    $ne: true,
  },
});

    if (pendingMessages.length > 0) {
      const ids = pendingMessages.map((msg) => msg._id);



      await Message.updateMany(
  {
    _id: {
      $in: ids,
    },

    hiddenFromReceiver: {
      $ne: true,
    },

    blockedAtSend: {
      $ne: true,
    },
  },
  {
    $set: {
      status: "delivered",
    },
  }
);




      // Notify every sender
      pendingMessages.forEach((msg) => {
        const senderSocketId = getReceiverSocketId(
          msg.senderId.toString()
        );

        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesDelivered", {
            messageIds: [msg._id],
          });
        }
      });
    }
  }


    // ONLINE USERS

    io.emit('getOnlineUsers',Object.keys(userSocketMap));


  
  // Typing Indicator
  

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId,
      });
    }
  });

  // STOP TYPING

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId,
      });
    }
  });


  //message read
  socket.on(
  "messageRead",
  async ({ senderId, messageIds }) => {
    try {
      if (!messageIds?.length) return;

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          receiverId: userId,
        },
        {
          $set: {
            status: "read",
            unread: false,
          },
        }
      );

      const senderSocketId =
        getReceiverSocketId(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit(
          "messagesRead",
          {
            messageIds,
          }
        );
      }
    } catch (error) {
      console.log(
        "Message Read Error:",
        error
      );
    }
  }
);




    
  // disconnect
  socket.on("disconnect", async () => {
  console.log("🔥 Disconnect event fired");


  delete userSocketMap[userId];

  if (userId && userId !== "undefined") {
  

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        lastSeen: new Date(),
      },
       { returnDocument: "after" } // <-- important
    );

  

    if (updatedUser) {
      io.emit("lastSeenUpdated", {
        userId,
        lastSeen: updatedUser.lastSeen,
      });
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
});
   
});

export {app, io, server}
