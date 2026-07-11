

import React, { useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsChatDotsFill } from "react-icons/bs";
import OtherUsers from "./OtherUsers";
import useGetOtherUsers from "../hooks/useGetOtherUsers";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "../index.js";
import {
  setAuthUser,
  setSelectedUser,
  setOtherUsers,
  setOnlineUsers,
} from "../redux/userSlice";

import { clearMessages } from "../redux/messageSlice";
import ProfileDrawer from "./ProfileDrawer";
import { API_URL_USER } from "../utils/constants.js";

const Sidebar = () => {
  useGetOtherUsers();

  const [search, setSearch] = useState("");

  const { otherUsers, authUser } = useSelector((store) => store.user);
  const [showProfile, setShowProfile] =
  useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${API_URL_USER}/logout`, {
        withCredentials: true,
      });

      dispatch(setAuthUser(null));
      dispatch(setSelectedUser(null));
      dispatch(setOtherUsers([]));
      dispatch(setOnlineUsers([]));
      dispatch(clearMessages());

      await persistor.flush();
      await persistor.purge();

      localStorage.removeItem("persist:root");

      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const filteredUsers =
    search.trim() === ""
      ? otherUsers || []
      : (otherUsers || []).filter((user) =>
          user.fullName.toLowerCase().includes(search.toLowerCase()),
        );

  return (
    <div className=" relative border-r border-slate-500 p-4 flex flex-col h-full">
      {/* Chat App Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
          <BsChatDotsFill className="text-white text-2xl" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">ChatApp</h1>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <BiSearchAlt2
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              text-xl
            "
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search users..."
            className="
              w-full
              pl-10
              pr-4
              py-3
              bg-slate-800/70
              border
              border-slate-700
              rounded-xl
              text-white
              placeholder-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>
      </form>

      <div className="divider px-3 mb-3"></div>

      {/* Users List */}
      <div className="flex-1 overflow-hidden">
        <OtherUsers users={filteredUsers} />
      </div>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 border-t border-slate-700">
        {/* Logout */}
        {authUser ? (
          <button
            onClick={logoutHandler}
            className="
      btn
      btn-sm
      w-full
      bg-red-600
      hover:bg-red-700
      border-none
      text-white
    "
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="
      btn
      btn-sm
      w-full
      bg-blue-600
      hover:bg-blue-700
      border-none
      text-white
    "
          >
            Login
          </button>
        )}

       

{/* Logged In User Profile */}
{authUser && (
  <div
    onClick={() => setShowProfile(true)}
    className="
      mt-4
      p-3
      rounded-xl
      bg-white/5
      border
      border-white/10
      cursor-pointer
      hover:bg-white/10
      transition
      group
    "
  >
    {/* Label */}
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Your Profile
      </p>

      <span
        className="
          text-xs
          text-blue-400
          opacity-70
          group-hover:opacity-100
        "
      >
        Edit
      </span>
    </div>

    {/* User Info */}
    <div className="flex items-center gap-3">
      <div className="avatar online">
        <div
          className="
            w-12
            rounded-full
            ring
            ring-green-500
            ring-offset-2
            ring-offset-slate-900
          "
        >
          <img
            src={authUser?.profilePhoto}
            alt="Your profile"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold truncate">
            {authUser?.fullName}
          </h2>

          <span
            className="
              px-1.5
              py-0.5
              rounded
              bg-blue-500/20
              text-blue-300
              text-[10px]
              font-medium
            "
          >
            YOU
          </span>
        </div>

        <p className="text-green-400 text-sm">
          Online
        </p>
      </div>

      <span
        className="
          text-gray-500
          group-hover:text-blue-400
          transition
        "
      >
        ›
      </span>
    </div>
  </div>
)}

       
      </div>
      {showProfile && authUser && (
  <ProfileDrawer
    user={authUser}
    onClose={() =>
      setShowProfile(false)
    }
  />
)}
    </div>
  );
};

export default Sidebar;
