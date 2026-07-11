import mongoose from "mongoose";

const userModel = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },

about: {
  type: String,
  default: "Hey there! I am using ChatApp.",
  maxlength: 150,
},
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    lastSeen: {
  type: Date,
  default: Date.now,
},
blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userModel);
