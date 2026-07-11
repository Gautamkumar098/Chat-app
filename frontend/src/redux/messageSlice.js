import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",

  initialState: {
    messages: [],
    unreadCounts: {}, // { userId: count }
    replyingTo: null,
     searchQuery: "",
     currentSearchIndex: 0,
       messagePage: 1,
  hasMore: true,
  loadingOlderMessages: false,
  pinnedMessages: [],
  },

  reducers: {
    // Set Messages
    setMessage: (state, action) => {
      state.messages = action.payload;
    },

    // Add New Message
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Clear Messages
    clearMessages: (state) => {
      state.messages = [];
    },

    // Update Read Status
    updateMessageStatus: (state, action) => {
      const { messageIds, status } = action.payload;

      state.messages = state.messages.map((msg) =>
        messageIds.includes(msg._id)
          ? {
              ...msg,
              status,
            }
          : msg
      );
    },

    // Update Delivered Status
    updateDeliveredMessages: (state, action) => {
      const { messageIds } = action.payload;

      state.messages = state.messages.map((msg) =>
        messageIds.includes(msg._id)
          ? {
              ...msg,
              status: "delivered",
            }
          : msg
      );
    },

    // ===========================
    // UNREAD BADGE
    // ===========================

    setUnreadCounts: (state, action) => {
      state.unreadCounts = action.payload;
    },

    incrementUnread: (state, action) => {
      const senderId = action.payload;

      state.unreadCounts[senderId] =
        (state.unreadCounts[senderId] || 0) + 1;
    },

    clearUnread: (state, action) => {
      const senderId = action.payload;

      state.unreadCounts[senderId] = 0;
    },

// Delete Message
deleteMessage: (state, action) => {
  const deletedMessage = action.payload;

  state.messages = state.messages.map((msg) =>
    msg._id === deletedMessage._id
      ? deletedMessage
      : msg
  );
},


// Edit Message
editMessage: (state, action) => {
  const editedMessage = action.payload;

  state.messages = state.messages.map((msg) =>
    msg._id === editedMessage._id
      ? editedMessage
      : msg
  );
},

// Set Reply Message
setReplyingTo: (state, action) => {
  state.replyingTo = action.payload;
},

// Clear Reply Message
clearReplyingTo: (state) => {
  state.replyingTo = null;
},
// Update Message Reactions
updateMessageReaction: (state, action) => {
  const { messageId, reactions } = action.payload;

  const message = state.messages.find(
    (msg) => msg._id === messageId
  );

  if (message) {
    message.reactions = reactions;
  }
},
// Search Message Query
setSearchQuery: (state, action) => {
  state.searchQuery = action.payload;
  state.currentSearchIndex = 0;
},

clearSearchQuery: (state) => {
  state.searchQuery = "";
  state.currentSearchIndex = 0;
},
setCurrentSearchIndex: (state, action) => {
  state.currentSearchIndex = action.payload;
},
// Older messages ko beginning me add karega
prependMessages: (state, action) => {
  const olderMessages = action.payload;

  // Duplicate messages avoid
  const existingIds = new Set(
    state.messages.map((msg) => msg._id)
  );

  const uniqueOlderMessages =
    olderMessages.filter(
      (msg) => !existingIds.has(msg._id)
    );

  state.messages = [
    ...uniqueOlderMessages,
    ...state.messages,
  ];
},

setMessagePage: (state, action) => {
  state.messagePage = action.payload;
},

setHasMore: (state, action) => {
  state.hasMore = action.payload;
},

setLoadingOlderMessages: (state, action) => {
  state.loadingOlderMessages = action.payload;
},

resetPagination: (state) => {
  state.messagePage = 1;
  state.hasMore = true;
  state.loadingOlderMessages = false;
},
// Update Pin Status
updatePinnedMessage: (state, action) => {
  const {
    messageId,
    isPinned,
    pinnedAt,
    pinnedBy,
  } = action.payload;

  const message = state.messages.find(
    (msg) =>
      String(msg._id) === String(messageId)
  );

  if (message) {
    message.isPinned = isPinned;
    message.pinnedAt = pinnedAt;
    message.pinnedBy = pinnedBy;
  }
},
// Set all pinned messages
setPinnedMessages: (state, action) => {
  state.pinnedMessages = action.payload;
},

// Sync single pin/unpin change
syncPinnedMessage: (state, action) => {
  const {
    messageId,
    isPinned,
    pinnedAt,
    pinnedBy,
  } = action.payload;

  const fullMessage =
  action.payload.message ||
  state.messages.find(
    (msg) =>
      String(msg._id) === String(messageId)
  );

  if (isPinned) {
    const alreadyExists =
      state.pinnedMessages.some(
        (msg) =>
          String(msg._id) === String(messageId)
      );

   if (!alreadyExists && fullMessage) {
      state.pinnedMessages.unshift({
       ...fullMessage,
        isPinned: true,
        pinnedAt,
        pinnedBy,
      });
    } else {
      const pinnedMessage =
        state.pinnedMessages.find(
          (msg) =>
            String(msg._id) === String(messageId)
        );

      if (pinnedMessage) {
        pinnedMessage.isPinned = true;
        pinnedMessage.pinnedAt = pinnedAt;
        pinnedMessage.pinnedBy = pinnedBy;
      }
    }

    state.pinnedMessages.sort(
      (a, b) =>
        new Date(b.pinnedAt) -
        new Date(a.pinnedAt)
    );
  } else {
    state.pinnedMessages =
      state.pinnedMessages.filter(
        (msg) =>
          String(msg._id) !== String(messageId)
      );
  }
},

  },
});

export const {
  setMessage,
  addMessage,
  clearMessages,
   prependMessages,
  setMessagePage,
  setHasMore,
  setLoadingOlderMessages,
  resetPagination,
  updateMessageStatus,
  updateDeliveredMessages,
  deleteMessage,
  editMessage,
  setReplyingTo,
  clearReplyingTo,
    updateMessageReaction,
      setSearchQuery,
  clearSearchQuery,
    setCurrentSearchIndex,
  setUnreadCounts,
  incrementUnread,
  clearUnread,
   updatePinnedMessage,
   setPinnedMessages,
syncPinnedMessage,
} = messageSlice.actions;

export default messageSlice.reducer;