
import React from "react";
import { useSelector } from "react-redux";

import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";

const HomePage = () => {
  useGetRealTimeMessage();

  const { selectedUser } = useSelector(
    (store) => store.user
  );

  return (
<div
  className="
    flex
    w-[95vw]
    max-w-[1200px]
    h-[90vh]
    md:h-[650px]
    rounded-lg
    overflow-hidden
    bg-gray-400
    bg-clip-padding
    backdrop-filter
    backdrop-blur-md
    bg-opacity-10
  "
>
      {/* Sidebar */}

      <div
        className={`
          w-full
          md:block
          md:w-auto
          ${
            selectedUser
              ? "hidden"
              : "block"
          }
        `}
      >
        <Sidebar />
      </div>

      {/* Message Container */}

      <div
        className={`
          w-full
          flex-1
          md:block
          ${
            selectedUser
              ? "block"
              : "hidden"
          }
        `}
      >
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;