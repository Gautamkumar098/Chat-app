import React, { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addMessage,clearReplyingTo, } from "../redux/messageSlice";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { useRef } from "react";
import { HiPaperClip } from "react-icons/hi2";
import { API_URL_MESSAGE } from "../utils/constants";

const SendInput = ({
  blockedByMe,
  blockedMe,
}) => {
  const [text, setText] = useState("");

  const dispatch = useDispatch();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

const emojiRef = useRef();
const [selectedFile, setSelectedFile] = useState(null);

const fileInputRef = useRef();

const { replyingTo } = useSelector(
  (store) => store.message
);

  const { selectedUser, authUser } = useSelector((store) => store.user);
  const { socket } = useSelector((store) => store.socket);


  useEffect(() => {
  if (!socket || !selectedUser) return;

  if (text.trim()) {
    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    const timer = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 1000);

    return () => clearTimeout(timer);
  } else {
    socket.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });
  }
}, [text, socket, selectedUser, authUser]);


useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      emojiRef.current &&
      !emojiRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
}, []);

const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};
  const onSubmitHandler = async (e) => {
    e.preventDefault();

   if (!text.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
   

formData.append("message", text);

if (selectedFile) {
  formData.append("file", selectedFile);
}

// Reply message ID
if (replyingTo?._id) {
  formData.append("replyTo", replyingTo._id);
}

const res = await axios.post(
  `${API_URL_MESSAGE}/send/${selectedUser?._id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  }
);

      if (res.data.success) {
        dispatch(addMessage(res.data.newMessage));
         // Clear reply preview
  dispatch(clearReplyingTo());
        setText("");
        setSelectedFile(null);

if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
        
        socket?.emit("stopTyping", {
  senderId: authUser._id,
  receiverId: selectedUser._id,
});
      }
    } catch (error) {
      console.log(error);
    }
  };

const isChatBlocked = blockedByMe;

 

    // 👇 BLOCKED UI YAHA ADD KARO
  if (isChatBlocked) {
    return (
      <div className="p-4">
        <div
          className="
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            py-3
            text-center
          "
        >
          <p className="text-sm text-gray-400">
            
             You blocked this user. Unblock them to send messages.
              
          </p>
        </div>
      </div>
    );
  }



  return (
    <form onSubmit={onSubmitHandler} className="p-4">
    {/* Reply Preview */}
    {replyingTo && (
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
          bg-white/10
          border-l-4
          border-blue-500
          rounded-lg
          px-3
          py-2
        "
      >
        <div className="min-w-0">
          <p className="text-xs text-blue-400 font-semibold">
            Replying to
          </p>

          <p className="text-sm text-gray-300 truncate max-w-[300px]">
            {replyingTo.deleted
              ? "This message was deleted"
              : replyingTo.message ||
                replyingTo.fileName ||
                "Attachment"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            dispatch(clearReplyingTo())
          }
          className="
            shrink-0
            w-7
            h-7
            flex
            items-center
            justify-center
            rounded-full
            text-gray-400
            hover:text-white
            hover:bg-white/10
            transition
          "
        >
          ✕
        </button>
      </div>
    )}



      <div className="relative">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
          placeholder="Send a message..."
          className="
            w-full
            bg-white/10
            backdrop-blur-md
            border border-white/20
            rounded-xl
            py-3
            pl-4
           pr-24
            text-white
            placeholder:text-gray-400
            outline-none
            focus:border-blue-500
          "
        />
        {/* Hidden File Input */}

        <input
  type="file"
  ref={fileInputRef}
  className="hidden"
 onChange={(e) => {
  console.log("Selected File:", e.target.files[0]);

  if (e.target.files[0]) {
    setSelectedFile(e.target.files[0]);
  }
}}
/>


{/* 📎 Attachment Button */}
<button
  type="button"
  onClick={() => fileInputRef.current.click()}
  className="
    absolute
    right-24
    top-1/2
    -translate-y-1/2
    text-gray-300
    hover:text-blue-400
    transition
  "
>
  <HiPaperClip size={22} />
</button>

{/* 😊 Emoji Button */}
        <div
  className="absolute right-14 top-1/2 -translate-y-1/2"
  ref={emojiRef}
>
  <button
    type="button"
    onClick={() =>
      setShowEmojiPicker(!showEmojiPicker)
    }
    className="text-gray-300 hover:text-yellow-400 transition"
  >
    <BsEmojiSmile size={22} />
  </button>

  {showEmojiPicker && (
    <div className="absolute bottom-12 right-0 z-50">
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        width={320}
        height={400}
      />
    </div>
  )}
</div>
{/* ➤ Send Button */}
        <button
          type="submit"
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-gray-300
            hover:text-white
            transition-colors
          "
        >
          <IoSend size={20} />
        </button>
      </div>
      {selectedFile && (
  <div className="mt-2 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
    <span className="text-sm text-white truncate">
      📎 {selectedFile.name}
    </span>

    <button
      type="button"
      onClick={() => {
        setSelectedFile(null);
        fileInputRef.current.value = "";
      }}
      className="text-red-400 hover:text-red-500"
    >
      ✕
    </button>
  </div>
)}
    </form>
  );
};

export default SendInput;
