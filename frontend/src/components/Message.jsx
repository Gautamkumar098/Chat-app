import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsThreeDotsVertical } from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";
import {
  deleteMessage,
  editMessage,
  setReplyingTo,
   updateMessageReaction,
    updatePinnedMessage,
     
} from "../redux/messageSlice";
import {  API_URL_MESSAGE } from "../utils/constants";

const Message = ({
  message,
  isSearchMatch,
   isActiveSearchMatch,
}) => {
  const scroll = useRef();

  const menuRef = useRef(null);
  const searchMatchRef = useRef(null);

  const { authUser, selectedUser } = useSelector((store) => store.user);

  const dispatch = useDispatch();

  const fromMe = String(message?.senderId) === String(authUser?._id);

  const [previewImage, setPreviewImage] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const [showReactions, setShowReactions] = useState(false);
  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢"];

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message?.message || "");

 

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${API_URL_MESSAGE}/delete/${message._id}`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(deleteMessage(res.data.deletedMessage));
        setShowMenu(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      const res = await axios.put(
        `${API_URL_MESSAGE}/edit/${message._id}`,
        {
          message: editText,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(editMessage(res.data.editedMessage));

        setIsEditing(false);
        setShowMenu(false);
      }
    } catch (error) {
      console.log(error);
    }
  };



  const handleReaction = async (emoji) => {
  try {
    const res = await axios.put(
      `${API_URL_MESSAGE}/reaction/${message._id}`,
      { emoji },
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      dispatch(
        updateMessageReaction({
          messageId: res.data.messageId,
          reactions: res.data.reactions,
        })
      );

      setShowReactions(false);
      setShowMenu(false);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleCopyMessage = async () => {
  try {
    let contentToCopy = "";

    if (message?.message) {
      contentToCopy = message.message;
    } else if (message?.fileUrl) {
      contentToCopy = message.fileUrl;
    }

    if (!contentToCopy) return;

    await navigator.clipboard.writeText(contentToCopy);

    setShowMenu(false);

    if (message?.message) {
      toast.success("Message copied");
    } else {
      toast.success("File link copied");
    }
  } catch (error) {
    console.log("Copy failed:", error);
    toast.error("Failed to copy");
  }
};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  useEffect(() => {
  if (isActiveSearchMatch) {
    searchMatchRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [isActiveSearchMatch]);


const handleTogglePin = async () => {
  try {
    const res = await axios.put(
      `${API_URL_MESSAGE}/pin/${message._id}`,
      {},
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      dispatch(
        updatePinnedMessage({
          messageId: res.data.messageId,
          isPinned: res.data.isPinned,
          pinnedAt: res.data.pinnedAt,
          pinnedBy: res.data.pinnedBy,
        })
      );

      setShowMenu(false);

      toast.success(
        res.data.isPinned
          ? "Message pinned"
          : "Message unpinned"
      );
    }
  } catch (error) {
    console.log("Pin Message Error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to update pin"
    );
  }
};

  return (
    <>
      <div
        id={`message-${message._id}`}
        ref={scroll}
        className={`chat ${fromMe ? "chat-end" : "chat-start"} group`}
      >
        {/* Avatar */}
        <div className="chat-image avatar">
          <div className="w-9 rounded-full">
            <img
              src={fromMe ? authUser?.profilePhoto : selectedUser?.profilePhoto}
              alt="profile"
            />
          </div>
        </div>

        {/* Bubble + Menu + Footer */}
        <div className="flex flex-col">
          <div
            className={`flex items-center gap-2 ${
              fromMe ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {/* Three Dot Menu */}

            {!message.deleted && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className={`
                p-1
                rounded-full
                text-gray-400
                hover:text-white
                hover:bg-white/10
                transition
                ${
                  showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }
              `}
                >
                  <BsThreeDotsVertical size={18} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div
                    className={`
    absolute
    top-8
    rounded-xl
    overflow-hidden
    bg-[#202c33]
    border border-gray-700
    shadow-2xl
    z-50

    ${fromMe ? "right-0 w-52" : "left-6 w-32"}
  `}
                  >
                    {/* Reply Message */}
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setReplyingTo(message));
                        setShowMenu(false);
                      }}
                      className="
    flex
    items-center
    gap-2
    w-full
    px-3
    py-2
    text-left
    text-white
    hover:bg-[#2a3942]
    transition
  "
                    >
                      <span>↩️</span>
                      <span className="text-sm">Reply</span>
                    </button>


{/*reaction*/}
<button
  type="button"
  onClick={() =>
    setShowReactions((prev) => !prev)
  }
  className="
    flex
    items-center
    gap-3
    w-full
    px-4
    py-3
    text-left
    text-white
    hover:bg-[#2a3942]
    transition
  "
>
  <span>😊</span>
  <span className="text-sm">
    React
  </span>
</button>

{showReactions && (
  <div className="flex items-center gap-1 px-2 py-2 bg-[#182229]">
    {reactionEmojis.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() =>
          handleReaction(emoji)
        }
        className="
          text-xl
          p-1
          rounded-full
          hover:bg-white/10
          hover:scale-125
          transition
        "
      >
        {emoji}
      </button>
    ))}
  </div>
)}


{/* Copy Message */}
{(message?.message || message?.fileUrl) && (
  <button
    type="button"
    onClick={handleCopyMessage}
    className="
      flex
      items-center
      gap-3
      w-full
      px-4
      py-3
      text-left
      text-white
      hover:bg-[#2a3942]
      transition
    "
  >
    <span className="text-lg">
      📋
    </span>

    <span className="text-sm">
      Copy
    </span>
  </button>
)}



{/* Pin / Unpin Message */}
{!message.deleted && (
  <button
    type="button"
    onClick={handleTogglePin}
    className="
      flex
      items-center
      gap-3
      w-full
      px-4
      py-3
      text-left
      text-white
      hover:bg-[#2a3942]
      transition
    "
  >
    <span className="text-lg">
      {message.isPinned ? "📍" : "📌"}
    </span>

    <span className="text-sm">
      {message.isPinned
        ? "Unpin Message"
        : "Pin Message"}
    </span>
  </button>
)}



                    <div className="h-px bg-gray-700" />

                    {/* Edit Message */}

                    {fromMe && message?.message && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditText(message.message);
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="
                      flex
                      items-center
                      gap-3
                      w-full
                      px-4
                      py-3
                      text-left
                      text-white
                      hover:bg-[#2a3942]
                      transition
                    "
                      >
                        <span className="text-lg">✏️</span>

                        <span className="text-sm">Edit Message</span>
                      </button>
                    )}

                    {/* Divider */}

                    {fromMe && message?.message && (
                      <div className="h-px bg-gray-700" />
                    )}

                    {/* Delete Message */}

                    {fromMe && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="
      flex
      items-center
      gap-3
      w-full
      px-4
      py-3
      text-left
      hover:bg-[#2a3942]
      transition
    "
                      >
                        <span className="text-red-400 text-lg">🗑</span>

                        <span className="text-red-400 text-sm">
                          Delete for Everyone
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Message Bubble */}
<div
  ref={searchMatchRef}
  className={`chat-bubble
    ${
      message.deleted
        ? "w-fit max-w-fit"
        : "max-w-[280px]"
    }

    ${
      isActiveSearchMatch
        ? "ring-2 ring-yellow-400"
        : isSearchMatch
        ? "ring-1 ring-yellow-400/40"
        : ""
    }

    break-words
    whitespace-pre-wrap
    backdrop-blur-md
    border
    shadow-md

    ${
      fromMe
        ? "bg-gradient-to-r from-blue-600/40 to-indigo-600/40 border-blue-400/20 text-white"
        : "bg-white/10 border-white/10 text-white"
    }
  `}
>

{message.isPinned && !message.deleted && (
  <div className="flex justify-end mt-1">
    <span
      className="text-[10px] text-gray-300"
      title="Pinned message"
    >
      📌 Pinned
    </span>
  </div>
)}


     
              {/* Deleted Message */}
              {message.deleted ? (
                <div className="flex items-center gap-2 italic text-gray-300">
                  <span>🚫</span>

                  <span>This message was deleted</span>
                </div>
              ) : (
                <>
                  {/* Replied Message Preview */}
                  {message?.replyTo && (
                    <div
                      className="
      w-full
      min-w-0
      mb-2
      px-3
      py-2
      rounded-lg
      bg-black/20
      border-l-4
      border-blue-400
    "
                    >
                      <p className="text-xs text-blue-300 font-semibold mb-1">
                        Replied message
                      </p>

                      {message.replyTo.deleted ? (
                        <p className="text-xs text-gray-400 italic">
                          🚫 This message was deleted
                        </p>
                      ) : (
                        <>
                          {message.replyTo.message && (
                            <p className="text-sm text-gray-200 break-words">
                              {message.replyTo.message}
                            </p>
                          )}

                          {!message.replyTo.message &&
                            message.replyTo.fileName && (
                              <p className="text-sm text-gray-200 truncate">
                                📎 {message.replyTo.fileName}
                              </p>
                            )}
                        </>
                      )}
                    </div>
                  )}
                  {/* Image */}
                  {message?.fileUrl &&
                    message?.fileType?.startsWith("image/") && (
                      <img
                        src={message.fileUrl}
                        alt={message.fileName}
                        onClick={() => setPreviewImage(message.fileUrl)}
                        className="
                      rounded-lg
                      mb-2
                      max-w-full
                      cursor-pointer
                      hover:opacity-90
                      transition
                    "
                      />
                    )}

                  {/* PDF / DOC / ZIP */}
                  {message?.fileUrl &&
                    !message?.fileType?.startsWith("image/") && (
                      <div
                        className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      bg-white/10
                      rounded-lg
                      p-3
                      mb-2
                    "
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-2xl">
                            {message.fileType === "application/pdf"
                              ? "📕"
                              : message.fileType?.includes("word")
                                ? "📘"
                                : message.fileType?.includes("zip")
                                  ? "🗜️"
                                  : "📄"}
                          </span>

                          <span className="truncate text-sm">
                            {message.fileName}
                          </span>
                        </div>

                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                        px-3
                        py-1
                        rounded-md
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        text-sm
                        transition
                      "
                        >
                          Download
                        </a>
                      </div>
                    )}

                  {/* Edit Mode */}
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEdit();
                          }

                          if (e.key === "Escape") {
                            setIsEditing(false);
                            setEditText(message?.message || "");
                          }
                        }}
                        autoFocus
                        className="
                      w-full
                      bg-black/20
                      border
                      border-white/20
                      rounded-lg
                      px-3
                      py-2
                      text-white
                      outline-none
                      focus:border-blue-400
                    "
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);

                            setEditText(message?.message || "");
                          }}
                          className="
                        px-3
                        py-1
                        text-xs
                        rounded-md
                        bg-white/10
                        hover:bg-white/20
                        transition
                      "
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleEdit}
                          disabled={
                            !editText.trim() ||
                            editText.trim() === message?.message
                          }
                          className="
                        px-3
                        py-1
                        text-xs
                        rounded-md
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        transition
                      "
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Normal Text */}
                      {message?.message && <p>{message.message}</p>}

                      {/* Edited Label */}
                      {message?.edited && (
                        <span className="block text-[10px] italic text-gray-400 mt-1">
                          edited
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>


          {message?.reactions?.length > 0 && (
  <div
    className={`flex flex-wrap gap-1 mt-1 ${
      fromMe
        ? "justify-end"
        : "justify-start"
    }`}
  >
    {Object.entries(
      message.reactions.reduce(
        (acc, reaction) => {
          acc[reaction.emoji] =
            (acc[reaction.emoji] || 0) + 1;

          return acc;
        },
        {}
      )
    ).map(([emoji, count]) => (
      <button
        key={emoji}
        type="button"
        onClick={() =>
          handleReaction(emoji)
        }
        className="
          flex
          items-center
          gap-1
          px-2
          py-0.5
          rounded-full
          bg-white/10
          border
          border-white/10
          text-xs
          text-white
          hover:bg-white/20
          transition
        "
      >
        <span>{emoji}</span>

        {count > 1 && (
          <span>{count}</span>
        )}
      </button>
    ))}
  </div>
)}

          {/* Footer */}
          <div
            className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${
              fromMe ? "justify-end mr-2" : "justify-start ml-2"
            }`}
          >
            <span>
              {new Date(message?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {fromMe && (
              <>
                {message.status === "sent" && <span>✓</span>}

                {message.status === "delivered" && <span>✓✓</span>}

                {message.status === "read" && (
                  <span className="text-blue-400 font-bold">✓✓</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview */}
      {previewImage && (
        <div
          className="
        fixed
        inset-0
        bg-black/90
        flex
        items-center
        justify-center
        z-50
      "
          onClick={() => setPreviewImage("")}
        >
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="
          max-h-[90vh]
          max-w-[90vw]
          rounded-lg
          shadow-2xl
        "
          />
        </div>
      )}
    </>
  );
};
export default Message;
