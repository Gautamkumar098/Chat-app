import React, { useState, useEffect } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector, useDispatch } from "react-redux";
import { IoSearch, IoClose, IoArrowBack,IoImagesOutline ,IoEllipsisVertical, } from "react-icons/io5";
import MediaGallery from "./MediaGallery";
import axios from "axios";
import toast from "react-hot-toast";
import {
  setSearchQuery,
  clearSearchQuery,
    setCurrentSearchIndex,
      updateMessageStatus,
} from "../redux/messageSlice";
import NoChatSelected from "./NoChatSelected";
import { setSelectedUser } from "../redux/userSlice";
import {  API_URL_USER } from "../utils/constants";

const MessageContainer = () => {
  const { selectedUser, onlineUsers } = useSelector(
    (store) => store.user
  );

const dispatch = useDispatch();

const [showSearch, setShowSearch] = useState(false);
const [showMediaGallery, setShowMediaGallery] =
  useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
const [blockedMe, setBlockedMe] = useState(false);
const [blockLoading, setBlockLoading] = useState(false);
const [showChatMenu, setShowChatMenu] =
  useState(false);

const {
  messages = [],
  searchQuery = "",
  currentSearchIndex = 0,
} = useSelector((store) => store.message);

const { socket, typingUsers } = useSelector(
  (store) => store.socket
);


//pinned message
const pinnedMessages = messages
  .filter((msg) => msg.isPinned && !msg.deleted)
  .sort(
    (a, b) =>
      new Date(b.pinnedAt) -
      new Date(a.pinnedAt)
  );

const latestPinnedMessage =
  pinnedMessages[0] || null;


  // Matching messages
  const matchedMessages = searchQuery?.trim()
  ? (messages || []).filter((msg) =>
      msg?.message
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  : [];



  const totalMatches = matchedMessages.length;

  // 👇 FUNCTIONS YAHAAN
  const handlePreviousResult = () => {
    if (totalMatches === 0) return;

    const newIndex =
      currentSearchIndex <= 0
        ? totalMatches - 1
        : currentSearchIndex - 1;

    dispatch(setCurrentSearchIndex(newIndex));
  };

  const handleNextResult = () => {
    if (totalMatches === 0) return;

    const newIndex =
      currentSearchIndex >= totalMatches - 1
        ? 0
        : currentSearchIndex + 1;

    dispatch(setCurrentSearchIndex(newIndex));
  };

const handleBack = () => {
  dispatch(setSelectedUser(null));
};




const isOnline =
  !blockedMe &&
  selectedUser &&
  onlineUsers?.includes(selectedUser._id);

  

  const isTyping =
  !blockedMe &&
  selectedUser &&
  typingUsers?.includes(selectedUser._id);




  useEffect(() => {
  if (!selectedUser?._id) return;

  const fetchBlockStatus = async () => {
    try {
      const res = await axios.get(
        `${API_URL_USER}/block-status/${selectedUser._id}`,
        {
          withCredentials: true,
        }
      );

        if (res.data.success) {
            console.log("BLOCK STATUS API:", res.data);
          setBlockedByMe(
            res.data.blockedByMe
          );

          setBlockedMe(
            res.data.blockedMe
          );
        }
      } catch (error) {
        console.log(
          "Block Status Error:",
          error
        );
      }
    };

  fetchBlockStatus();
}, [selectedUser?._id]);




useEffect(() => {
  if (!socket) return;

  const handleMessagesRead = ({
    messageIds,
  }) => {
    dispatch(
      updateMessageStatus({
        messageIds,
        status: "read",
      })
    );
  };

  socket.on(
    "messagesRead",
    handleMessagesRead
  );

  return () => {
    socket.off(
      "messagesRead",
      handleMessagesRead
    );
  };
}, [socket, dispatch]);



  // 👇 REAL-TIME BLOCK STATUS useEffect YAHA ADD KARO
  useEffect(() => {
    if (!socket) return;

    
const handleBlockStatusChanged = ({
  userId,
  isBlocked,
}) => {
  if (
    String(userId) ===
    String(selectedUser?._id)
  ) {
    setBlockedMe(isBlocked);
  }
};
 
    socket.on(
      "blockStatusChanged",
      handleBlockStatusChanged
    );

    return () => {
      socket.off(
        "blockStatusChanged",
        handleBlockStatusChanged
      );
    };
  }, [socket, selectedUser?._id]);



  //last seen
  const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Offline";

  const date = new Date(lastSeen);
    const now = new Date();

    const isToday =
      date.toDateString() === now.toDateString();

    if (isToday) {
      return `Last seen today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }


  return `Last seen ${date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    })} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (!selectedUser) {
    return <NoChatSelected />;
  }

 const handlePinnedMessageClick = () => {
  if (!latestPinnedMessage?._id) return;

  const element = document.getElementById(
    `message-${latestPinnedMessage._id}`
  );

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    element.classList.add(
      "ring-2",
      "ring-yellow-400",
      "rounded-xl"
    );

    setTimeout(() => {
      element.classList.remove(
        "ring-2",
        "ring-yellow-400",
        "rounded-xl"
      );
    }, 1500);
  }
};


const handleToggleBlock = async () => {
  if (!selectedUser?._id || blockLoading) return;

  try {
    setBlockLoading(true);

    const res = await axios.put(
      `${API_URL_USER}/block/${selectedUser._id}`,
      {},
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      setBlockedByMe(res.data.isBlocked);
      toast.success(res.data.message);
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Unable to update block status"
    );
  } finally {
    setBlockLoading(false);
  }
};





  return (
<div className="relative w-full h-full min-w-0 md:min-w-[550px] flex flex-col">
      {/* Header */}
      <div
  className="
    relative
    z-40
    flex
    items-center
    gap-3
    bg-white/5
    backdrop-blur-md
    border-b
    border-white/10
    text-white
    px-3
    md:px-4
    py-3
  "
>
 


{/* Mobile Back Button */}
<button
  type="button"
  onClick={handleBack}
  className="
    md:hidden
    flex
    items-center
    justify-center
    shrink-0
    w-9
    h-9
    rounded-full
    text-white
    hover:bg-white/10
    transition
  "
>
  <IoArrowBack size={24} />
</button>

{/*avatar*/}
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-10 md:w-12 rounded-full">
            <img
              src={selectedUser.profilePhoto}
              alt="profile"
            />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
      <h1 className="font-semibold text-base md:text-lg truncate">
            {selectedUser.fullName}
          </h1>

 {isTyping ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-dots loading-xs text-blue-400"></span>
              <p className="text-blue-400 text-sm font-medium">
                Typing...
              </p>
            </div>
          ) : isOnline ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <p className="text-green-400 text-sm font-medium">
                Online
              </p>
            </div>
          ) :  blockedMe ? null : (
  <p className="text-gray-400 text-sm">
    {formatLastSeen(selectedUser.lastSeen)}
  </p>
)}
        </div>
    


{/* Media Gallery Button */}
<button
  type="button"
  onClick={() => setShowMediaGallery(true)}
  className="
    ml-auto
    w-9 h-9
    flex items-center justify-center
    rounded-full
    text-gray-300
    hover:text-white
    hover:bg-white/10
    transition
  "
   title="Media and Files"
>
  <IoImagesOutline size={21} />
</button>


{/* 👇 SEARCH BUTTON EXACTLY HERE */}

<button
  type="button"
  onClick={() => setShowSearch(true)}
  className="
    
    w-9
    h-9
    flex
    items-center
    justify-center
    shrink-0
    rounded-full
    text-gray-300
    hover:text-white
    hover:bg-white/10
    transition
  "
>
  <IoSearch size={21} />
</button>
 

{/*block*/}
{/* Block / Unblock Menu */}
<div className="relative z-[100]">
  <button
    type="button"
    onClick={() =>
      setShowChatMenu((prev) => !prev)
    }
    className="
      w-9
      h-9
      flex
      items-center
      justify-center
      rounded-full
      text-gray-300
      hover:text-white
      hover:bg-white/10
      transition
    "
  >
    <IoEllipsisVertical size={21} />
  </button>

  {showChatMenu && (
    <div
      className="
        absolute
        right-0
        top-11
        z-[110]
        w-48
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-[#202c33]
        shadow-2xl
      "
    >
      <button
        type="button"
        onClick={async () => {
          await handleToggleBlock();
          setShowChatMenu(false);
        }}
        disabled={blockLoading}
        className="
          w-full
          px-4
          py-3
          text-left
          text-sm
          text-red-400
          hover:bg-white/10
          disabled:opacity-50
          transition
        "
      >
        {blockLoading
          ? "Please wait..."
          : blockedByMe
          ? "Unblock User"
          : "Block User"}
      </button>
    </div>
  )}
</div>

 
 </div>


{/* Search Bar */}
{showSearch && (
  <div
    className="
      flex
      items-center
      gap-2
      px-3
      py-2
      bg-white/5
      border-b
      border-white/10
    "
  >
    <IoSearch
      size={18}
      className="text-gray-400 shrink-0"
    />

    <input
      type="text"
      value={searchQuery}
      onChange={(e) =>
        dispatch(setSearchQuery(e.target.value))
      }
      placeholder="Search messages..."
      autoFocus
      className="
        flex-1
        min-w-0
        bg-transparent
        text-white
        placeholder:text-gray-400
        outline-none
        text-sm
      "
    />

    {searchQuery?.trim() && (
  <div className="flex items-center gap-1 shrink-0">
    <span className="text-xs text-gray-400 min-w-[40px] text-center">
      {totalMatches > 0
        ? `${currentSearchIndex + 1}/${totalMatches}`
        : "0/0"}
    </span>

    <button
      type="button"
      onClick={handlePreviousResult}
      disabled={totalMatches === 0}
      className="
        w-7 h-7
        flex items-center justify-center
        rounded-full
        text-gray-300
        hover:bg-white/10
        hover:text-white
        disabled:opacity-30
        transition
      "
    >
      ↑
    </button>

    <button
      type="button"
      onClick={handleNextResult}
      disabled={totalMatches === 0}
      className="
        w-7 h-7
        flex items-center justify-center
        rounded-full
        text-gray-300
        hover:bg-white/10
        hover:text-white
        disabled:opacity-30
        transition
      "
    >
      ↓
    </button>
  </div>
)}

    <button
      type="button"
      onClick={() => {
        setShowSearch(false);
        dispatch(clearSearchQuery());
      }}
      className="
        text-gray-400
        hover:text-white
        transition
      "
    >
      <IoClose size={22} />
    </button>
  </div>
)}


{/* Pinned Message Bar */}
{latestPinnedMessage && (
  <div
  onClick={handlePinnedMessageClick}
    className="
      flex
      items-center
      gap-3
      px-4
      py-2
      bg-white/5
      border-b
      border-white/10
      text-white
      cursor-pointer
hover:bg-white/10
transition
    "
  >
    <span className="text-lg shrink-0">
      📌
    </span>

    <div className="flex-1 min-w-0">
      <p className="text-xs text-blue-400 font-medium">
        Pinned Message
      </p>

      <p className="text-sm text-gray-300 truncate">
        {latestPinnedMessage.message
          ? latestPinnedMessage.message
          : latestPinnedMessage.fileName
          ? `📎 ${latestPinnedMessage.fileName}`
          : "Attachment"}
      </p>
    </div>
  </div>
)}
      

      {/* Messages */}
      <Messages />

      {/* Input */}
   <SendInput
  blockedByMe={blockedByMe}
  blockedMe={blockedMe}
/>

      {showMediaGallery && (
  <MediaGallery
    onClose={() =>
      setShowMediaGallery(false)
    }
  />
)}
    </div>
  );
};

export default MessageContainer;