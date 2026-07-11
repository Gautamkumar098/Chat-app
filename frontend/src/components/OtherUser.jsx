
import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  setSelectedUser,
} from "../redux/userSlice";

import {
  clearUnread,
} from "../redux/messageSlice";
import { API_URL_USER } from "../utils/constants";


const OtherUser = ({ user }) => {

  const dispatch = useDispatch();


  const {
    selectedUser,
    onlineUsers,
  } = useSelector(
    (store) => store.user
  );


  const {
    unreadCounts,
  } = useSelector(
    (store) => store.message
  );


  const {
    socket,
  } = useSelector(
    (store) => store.socket
  );


  // User ne mujhe block kiya hai?
  const [blockedMe, setBlockedMe] =
    useState(false);


  // Maine user ko block kiya hai?
  const [
    blockedByMe,
    setBlockedByMe,
  ] = useState(false);



  // ==================================
  // GET INITIAL BLOCK STATUS
  // ==================================

  useEffect(() => {

    if (!user?._id) return;


    const fetchBlockStatus = async () => {

      try {

        const res = await axios.get(
          `${API_URL_USER}/block-status/${user._id}`,
          {
            withCredentials: true,
          }
        );


        if (res.data.success) {

          setBlockedMe(
            res.data.blockedMe
          );

          setBlockedByMe(
            res.data.blockedByMe
          );

        }

      } catch (error) {

        console.log(
          "Sidebar Block Status Error:",
          error
        );

      }

    };


    fetchBlockStatus();

  }, [user?._id]);



  // ==================================
  // REAL-TIME BLOCK STATUS
  // ==================================

  useEffect(() => {

    if (!socket) return;


    const handleBlockStatusChanged = ({
      userId,
      isBlocked,
    }) => {

     

      if (
        String(userId) ===
        String(user?._id)
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

  }, [
    socket,
    user?._id,
  ]);



 


  const isOnline =
  !blockedMe &&
   !blockedByMe &&
  onlineUsers?.includes(user._id);



  const unreadCount =
    unreadCounts?.[user._id] || 0;



  const selectedUserHandler = (user) => {

    dispatch(
      setSelectedUser(user)
    );

    dispatch(
      clearUnread(user._id)
    );

  };



  return (
    <>
      <div
        onClick={() =>
          selectedUserHandler(user)
        }

        className={`
          ${
            selectedUser?._id === user?._id
              ? "bg-white/20"
              : ""
          }

          flex
          items-center
          gap-3
          hover:bg-white/20
          backdrop-blur-md
          border
          border-white/5
          rounded
          p-1
          cursor-pointer
          transition-all
          duration-300
        `}
      >


        {/* Avatar */}

        <div
          className={`
            avatar
            ${isOnline ? "online" : ""}
          `}
        >

          <div className="w-12 rounded-full">

            <img
              src={user?.profilePhoto}
              alt="user-profile"
            />

          </div>

        </div>



        {/* Name + Badge */}

        <div
          className="
            flex
            justify-between
            items-center
            flex-1
          "
        >

          <p
            className="
              text-white
              font-medium
            "
          >
            {user?.fullName}
          </p>


          {unreadCount > 0 && (

            <div
              className="
                min-w-6
                h-6
                rounded-full
                bg-red-500
                text-white
                text-xs
                font-bold
                flex
                items-center
                justify-center
                px-2
              "
            >

              {unreadCount}

            </div>

          )}

        </div>

      </div>


      <div
        className="
          divider
          my-0
          py-0
          h-1
        "
      />

    </>
  );
};


export default OtherUser;