
import { useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import {
  setMessage,
  setHasMore,
  setMessagePage,
  resetPagination,
  setPinnedMessages,
} from "../redux/messageSlice";
import { API_URL_MESSAGE } from "../utils/constants";

const useGetMessages = () => {
  const { selectedUser } = useSelector(
    (store) => store.user
  );

  const { socket } = useSelector(
    (store) => store.socket
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        // Reset old chat pagination
        dispatch(resetPagination());

        // Fetch latest 30 messages
        const res = await axios.get(
          `${API_URL_MESSAGE}/${selectedUser._id}?page=1`,
          {
            withCredentials: true,
          }
        );

        if (!res.data.success) return;

        const fetchedMessages =
          res.data.messages || [];

        // Store page 1 messages
        dispatch(setMessage(fetchedMessages));

        // Pagination data
        dispatch(
          setHasMore(res.data.hasMore ?? false)
        );

        dispatch(setMessagePage(1));

          // 2️⃣ 👇 PINNED MESSAGES CODE EXACTLY YAHAAN
    const pinnedRes = await axios.get(
      `${API_URL_MESSAGE}/pinned/${selectedUser._id}`,
      {
        withCredentials: true,
      }
    );

    if (pinnedRes.data.success) {
      dispatch(
        setPinnedMessages(
          pinnedRes.data.pinnedMessages || []
        )
      );
    }


        // Mark messages as read
        await axios.put(
          `${API_URL_MESSAGE}/read/${selectedUser._id}`,
          {},
          {
            withCredentials: true,
          }
        );

       // Receiver ke messages ke IDs
        const receivedMessageIds =
          fetchedMessages
            .filter(
              (msg) =>
                String(msg.senderId) ===
                String(selectedUser._id)
            )
            .map((msg) => msg._id);



        // Sender ko real-time read receipt
        if (
          socket &&
          receivedMessageIds.length > 0
        ) {
          socket?.emit("messageRead", {
            senderId: selectedUser._id,
            messageIds: receivedMessageIds,
          });
        }
      } catch (error) {
        console.log(
          "Get Messages Error:",
          error
        );
      }
    };

    fetchMessages();
  }, [
    selectedUser?._id,
    dispatch,
    socket,
  ]);
};

export default useGetMessages;