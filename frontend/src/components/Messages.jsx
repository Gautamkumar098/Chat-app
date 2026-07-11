
import React, { useRef , useEffect,useMemo,} from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import Message from "./Message";
import useGetMessages from "../hooks/useGetMessages";

import {
  prependMessages,
  setMessagePage,
  setHasMore,
  setLoadingOlderMessages,
} from "../redux/messageSlice";
import { API_URL_MESSAGE } from "../utils/constants";

const Messages = () => {
  useGetMessages();

  const dispatch = useDispatch();

  // Scroll container reference
  const messagesContainerRef = useRef(null);
  const previousLastMessageIdRef =
  useRef(null);

  const messageState = useSelector(
    (store) => store.message
  );

 const messages = useMemo(
  () => messageState?.messages || [],
  [messageState?.messages]
);

  const searchQuery =
    messageState?.searchQuery || "";

  const currentSearchIndex =
    messageState?.currentSearchIndex || 0;

  // Pagination State
  const messagePage =
    messageState?.messagePage || 1;

  const hasMore =
    messageState?.hasMore ?? false;

  const loadingOlderMessages =
    messageState?.loadingOlderMessages || false;

  const { selectedUser,authUser } = useSelector(
    (store) => store.user
  );
  const { socket } = useSelector(
  (store) => store.socket
);

  // Search Matching
  const matchedMessageIds =
    searchQuery?.trim()
      ? messages
          .filter((msg) =>
            msg?.message
              ?.toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
          )
          .map((msg) => msg._id)
      : [];

  // Load Older Messages
  const loadOlderMessages = async () => {
    if (
      !selectedUser?._id ||
      !hasMore ||
      loadingOlderMessages
    ) {
      return;
    }

    const container =
      messagesContainerRef.current;

    if (!container) return;

    try {
      dispatch(
        setLoadingOlderMessages(true)
      );

      const nextPage = messagePage + 1;

      // Save old scroll information
      const oldScrollHeight =
        container.scrollHeight;

      const oldScrollTop =
        container.scrollTop;

      const res = await axios.get(
        `${API_URL_MESSAGE}/${selectedUser._id}?page=${nextPage}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const olderMessages =
          res.data.messages || [];

        dispatch(
          prependMessages(olderMessages)
        );

        dispatch(
          setMessagePage(nextPage)
        );

        dispatch(
          setHasMore(
            res.data.hasMore ?? false
          )
        );

        /*
          Redux update ke baad DOM ko render hone
          ka chance dete hain, phir scroll position
          restore karte hain.
        */

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newScrollHeight =
              container.scrollHeight;

            container.scrollTop =
              oldScrollTop +
              (newScrollHeight -
                oldScrollHeight);
          });
        });
      }
    } catch (error) {
      console.log(
        "Load Older Messages Error:",
        error
      );
    } finally {
      dispatch(
        setLoadingOlderMessages(false)
      );
    }
  };

  // Detect Scroll Top
  const handleScroll = (event) => {
    const container =
      event.currentTarget;

    // Top ke near pahunchne par older messages
    if (container.scrollTop <= 50) {
      loadOlderMessages();
    }
  };



const getDateLabel = (dateString) => {
  const messageDate = new Date(dateString);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  if (isSameDay(messageDate, today)) {
    return "Today";
  }

  if (isSameDay(messageDate, yesterday)) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year:
      messageDate.getFullYear() !== today.getFullYear()
        ? "numeric"
        : undefined,
  });
};


useEffect(() => {
  if (
    !socket ||
    !selectedUser?._id ||
    !authUser?._id ||
    messages.length === 0
  ) {
    return;
  }

  const unreadMessageIds = messages
    .filter(
      (msg) =>
        String(msg.senderId) ===
          String(selectedUser._id) &&
        String(msg.receiverId) ===
          String(authUser._id) &&
        msg.status !== "read"
    )
    .map((msg) => msg._id);

  if (unreadMessageIds.length === 0) {
    return;
  }

  socket.emit("messageRead", {
    senderId: selectedUser._id,
    messageIds: unreadMessageIds,
  });
}, [
  socket,
  selectedUser?._id,
  authUser?._id,
  messages,
]);


// Reset scroll tracking when chat changes
useEffect(() => {
  previousLastMessageIdRef.current = null;
}, [selectedUser?._id]);


// Auto scroll only for first load or new message
useEffect(() => {
  if (messages.length === 0) return;

  const container =
    messagesContainerRef.current;

  if (!container) return;

  const lastMessage =
    messages[messages.length - 1];

  const currentLastMessageId =
    lastMessage?._id;

  const previousLastMessageId =
    previousLastMessageIdRef.current;


  // Chat first open
  if (!previousLastMessageId) {
    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight;
    });
  }

  // New message added at bottom
  else if (
    previousLastMessageId !==
    currentLastMessageId
  ) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }


  previousLastMessageIdRef.current =
    currentLastMessageId;

}, [messages]);



  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="
        px-4
        flex-1
        overflow-y-auto
      "
      style={{
        scrollbarWidth: "thin",
        scrollbarColor:
          "#3b82f6 transparent",
      }}
    >
      {/* Loading Older Messages */}
      {loadingOlderMessages && (
        <div className="flex justify-center py-3">
          <span className="loading loading-spinner loading-sm text-blue-400"></span>
        </div>
      )}

      {/* No Messages */}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-400">
            No messages yet
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
  const currentDate = new Date(
    message.createdAt
  ).toDateString();

  const previousDate =
    index > 0
      ? new Date(
          messages[index - 1].createdAt
        ).toDateString()
      : null;

  const showDateSeparator =
    index === 0 || currentDate !== previousDate;

  return (
    <React.Fragment key={message._id}>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <div
            className="
              px-3
              py-1
              rounded-full
              bg-[#202c33]/90
              backdrop-blur-md
              border
              border-white/10
              text-xs
              text-gray-300
              shadow-md
              sticky
              top-2
              z-10
            "
          >
            {getDateLabel(message.createdAt)}
          </div>
        </div>
      )}

      <Message
        message={message}
        isSearchMatch={matchedMessageIds.includes(
          message._id
        )}
        isActiveSearchMatch={
          matchedMessageIds[currentSearchIndex] ===
          message._id
        }
      />
    </React.Fragment>
  );
})}
    
    </div>
  );
};

export default Messages;