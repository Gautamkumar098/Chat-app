import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    otherUsers: [],
    selectedUser: null,
    onlineUsers: [],
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    // ✅ Update Last Seen
    updateLastSeen: (state, action) => {
      const { userId, lastSeen } = action.payload;

      // Update other users list
      state.otherUsers = state.otherUsers.map((user) =>
        user._id === userId
          ? {
              ...user,
              lastSeen,
            }
          : user,
      );

      // Update selected user
      if (state.selectedUser && state.selectedUser._id === userId) {
        state.selectedUser = {
          ...state.selectedUser,
          lastSeen,
        };
      }
    },

    updateAuthUserProfile: (state, action) => {
  state.authUser = {
    ...state.authUser,
    ...action.payload,
  };
},
syncUserProfile: (state, action) => {
  const updatedUser = action.payload;


  // Update user in sidebar list
  state.otherUsers =
    state.otherUsers.map((user) =>
      String(user._id) ===
      String(updatedUser._id)
        ? {
            ...user,
            ...updatedUser,
          }
        : user
    );


  // Update currently opened chat header
  if (
    state.selectedUser &&
    String(state.selectedUser._id) ===
      String(updatedUser._id)
  ) {
    state.selectedUser = {
      ...state.selectedUser,
      ...updatedUser,
    };
  }
},
  },
});

export const {
  setAuthUser,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  updateLastSeen,
   updateAuthUserProfile,
    syncUserProfile,
} = userSlice.actions;
export default userSlice.reducer;
