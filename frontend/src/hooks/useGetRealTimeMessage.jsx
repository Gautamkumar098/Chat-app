
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage,updateMessageStatus, updateDeliveredMessages,
  incrementUnread,  deleteMessage,   editMessage, updateMessageReaction,updatePinnedMessage,  syncPinnedMessage, } from "../redux/messageSlice";
import {
  addTypingUser,
  removeTypingUser,
} from "../redux/socketSlice";

import axios from "axios";
import { API_URL_MESSAGE } from "../utils/constants";


const notificationSound = new Audio("/sounds/notification.mp3");

const useGetRealTimeMessage = () => {
  const { socket } = useSelector((store) => store.socket);

  const { selectedUser } = useSelector(
    (store) => store.user
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;


    const handleMessage = async (newMessage) => {
  // Agar current chat isi sender ki open hai
  if (selectedUser?._id === newMessage.senderId) {
    dispatch(addMessage(newMessage));

    try {
      await axios.put(
        `${API_URL_MESSAGE}/read/${selectedUser._id}`,
        {},
        {
          withCredentials: true,
        }
      );

      socket.emit("messageRead", {
        senderId: selectedUser._id,
        messageIds: [newMessage._id],
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    // Chat open nahi hai -> unread badge increase
    dispatch(incrementUnread(newMessage.senderId));
    notificationSound.currentTime = 0;

  notificationSound.play().catch((err) => {
    console.log("Notification Sound Error:", err);
  });
  }
};

     // Typing
    const handleTyping = ({ senderId }) => {
      dispatch(addTypingUser(senderId));
    };

    // Stop Typing
    const handleStopTyping = ({ senderId }) => {
      dispatch(removeTypingUser(senderId));
    };

    const handleDelivered = ({ messageIds }) => {
  dispatch(
    updateDeliveredMessages({
      messageIds,
    })
  );
};

    const handleMessagesRead = ({ messageIds }) => {
  dispatch(
    updateMessageStatus({
      messageIds,
      status: "read",
    })
  );
};


const handleMessageDeleted = (deletedMessage) => {
  dispatch(deleteMessage(deletedMessage));
};

const handleMessageEdited = (editedMessage) => {
  dispatch(editMessage(editedMessage));
};

const handleMessageReaction = (reactionData) => {
  dispatch(
    updateMessageReaction(reactionData)
  );
};

const handleMessagePinned = (pinData) => {
  dispatch(updatePinnedMessage(pinData));
   dispatch(syncPinnedMessage(pinData));
};


    socket.on("newMessage", handleMessage);
     socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesRead", handleMessagesRead);
    socket.on(
  "messagesDelivered",
  handleDelivered
);
socket.on(
  "messageDeleted",
  handleMessageDeleted
);
socket.on(
  "messageEdited",
  handleMessageEdited
);
socket.on(
  "messageReaction",
  handleMessageReaction
);
socket.on(
  "messagePinned",
  handleMessagePinned
);


    return () => {
      socket.off("newMessage", handleMessage);
       socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesRead", handleMessagesRead);
      socket.off(
  "messagesDelivered",
  handleDelivered
);
socket.off(
  "messageDeleted",
  handleMessageDeleted
);
socket.off(
  "messageEdited",
  handleMessageEdited
);

socket.off(
  "messageReaction",
  handleMessageReaction
);
socket.off(
  "messagePinned",
  handleMessagePinned
);
    };
  }, [socket, selectedUser, dispatch]);
};

export default useGetRealTimeMessage;
