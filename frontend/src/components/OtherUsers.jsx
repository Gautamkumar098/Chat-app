
import React from "react";
import OtherUser from "./OtherUser";
import useGetUnreadCounts from "../hooks/useGetUnreadCounts";

const OtherUsers = ({ users }) => {
  // Fetch unread counts when sidebar loads
  useGetUnreadCounts();

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#3b82f6 transparent",
      }}
    >
      {users?.length > 0 ? (
        users.map((user) => (
          <OtherUser
            key={user._id}
            user={user}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 mt-4">
          User not found
        </p>
      )}
    </div>
  );
};

export default OtherUsers;
