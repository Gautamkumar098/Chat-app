




import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket: null,
    typingUsers: [],
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    addTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },

    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const {
  setSocket,
  addTypingUser,
  removeTypingUser,
} = socketSlice.actions;

export default socketSlice.reducer;