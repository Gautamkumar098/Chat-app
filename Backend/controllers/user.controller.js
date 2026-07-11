import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import {
  io,
  getReceiverSocketId,
} from "../socket/socket.js";

//register logic
export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;
    const file = req.file;
    if (!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


  const existingUser = await User.findOne({ username });


if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "username already exist try different",
  });
}

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

  

    const hashedPassword = await bcrypt.hash(password, 10);

   let profilePhoto = "";

if (file) {
  try {
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    profilePhoto = cloudResponse.secure_url;
  } catch (err) {
    console.log("Cloudinary Error:", err);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
} else {
  if (gender === "male") {
    profilePhoto = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`;
  } else {
    profilePhoto = `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`;
  }
}



    const userData = await User.create({
  fullName,
  username,
  password: hashedPassword,
  profilePhoto,
  gender,
});

    

    return res.status(201).json({
  success: true,
  message: "User registered successfully",
  user: userData,
});

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

//login logic
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

     const isProduction =
      process.env.NODE_ENV === "production";
    

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
         secure: isProduction,

        sameSite: isProduction
          ? "none"
          : "lax",
      })
      .json({
        success: true,
        message: "login successfully",
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
            about: user.about,
      });
  } catch (error) {
   console.log("Login Error:", error);
    return res.status(500).json({
        success: false,
      message: error.message,
    });
  }
};


//logout logic
export const logout =  (req, res) => {
  try {

   const isProduction =
      process.env.NODE_ENV === "production";

    return res
      .status(200)
      .cookie("token", "", {
        maxAge:0,
          httpOnly: true,

        secure: isProduction,

        sameSite: isProduction
          ? "none"
          : "lax",
      })
      .json({
        success: true,
        message: "logout  successfully",
      });
  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({
         success: false,
      message: error.message,
    });
  }
};

//get all users
export const getOtherUser = async  (req, res) => {
  try {
   const loggedInUserId = req.id;
   const otherUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password");
          return res.status(200).json({
      success: true,
      users: otherUsers,
    });
  } catch (error) {
    console.log(error);
     return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//toggle block user

export const toggleBlockUser = async (req, res) => {
  try {
    const currentUserId = req.id;
    const targetUserId = req.params.id;

    if (
      String(currentUserId) === String(targetUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    const currentUser = await User.findById(
      currentUserId
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isBlocked =
      (currentUser.blockedUsers || []).some(
        (id) =>
          String(id) === String(targetUserId)
      );

    if (isBlocked) {
      currentUser.blockedUsers.pull(targetUserId);
    } else {
      currentUser.blockedUsers.push(targetUserId);
    }

    await currentUser.save();

    const newBlockStatus = !isBlocked;

    // Real-time event target user ko
    const targetSocketId =
      getReceiverSocketId(String(targetUserId));

    if (targetSocketId) {
      io.to(targetSocketId).emit(
        "blockStatusChanged",
        {
          userId: String(currentUserId),
          isBlocked: newBlockStatus,
        }
      );
    }

    return res.status(200).json({
      success: true,
      isBlocked: newBlockStatus,
      targetUserId,
      message: newBlockStatus
        ? "User blocked"
        : "User unblocked",
    });
  } catch (error) {
    console.log("Toggle Block Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Check block relationship
export const getBlockStatus = async (req, res) => {
  try {
    const currentUserId = req.id;
    const targetUserId = req.params.id;

    const [currentUser, targetUser] =
      await Promise.all([
        User.findById(currentUserId).select(
          "blockedUsers"
        ),
        User.findById(targetUserId).select(
          "blockedUsers"
        ),
      ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const blockedByMe =
      currentUser.blockedUsers.some(
        (id) =>
          String(id) === String(targetUserId)
      );

    const blockedMe =
      targetUser.blockedUsers.some(
        (id) =>
          String(id) === String(currentUserId)
      );

    return res.status(200).json({
      success: true,
      blockedByMe,
      blockedMe,
      canMessage: !blockedByMe && !blockedMe,
    });
  } catch (error) {
    console.log("Get Block Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;

    const { fullName, about } = req.body;
    const file = req.file;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update full name
    if (fullName?.trim()) {
      user.fullName = fullName.trim();
    }

    // Update about
    if (typeof about === "string") {
      user.about = about.trim();
    }

    // Upload new profile photo
    if (file) {
      try {
        const fileUri = getDataUri(file);

        const cloudResponse =
          await cloudinary.uploader.upload(
            fileUri.content,
            {
              folder: "chat-profile-photos",
              resource_type: "image",
            }
          );

        user.profilePhoto =
          cloudResponse.secure_url;
      } catch (error) {
        console.log(
          "Profile Photo Upload Error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Profile photo upload failed",
        });
      }
    }

    await user.save();

   const updatedUser = {
  _id: user._id,
  fullName: user.fullName,
  username: user.username,
  profilePhoto: user.profilePhoto,
  about: user.about,
  gender: user.gender,
  lastSeen: user.lastSeen,
};


// Real-time profile update
io.emit("profileUpdated", updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(
      "Update Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};