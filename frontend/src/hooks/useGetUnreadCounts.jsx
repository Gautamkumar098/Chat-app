import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../redux/messageSlice";
import { API_URL_MESSAGE } from "../utils/constants";

const useGetUnreadCounts = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((store) => store.user);

  useEffect(() => {
    if (!authUser) return;

    const fetchUnreadCounts = async () => {
      try {
        const res = await axios.get(
          `${API_URL_MESSAGE}/unread/count`,
          {
            withCredentials: true,
          }
        );

        // Convert array to object
        const unreadMap = {};

        res.data.unreadCounts.forEach((item) => {
          unreadMap[item._id] = item.count;
        });

        dispatch(setUnreadCounts(unreadMap));
      } catch (error) {
        console.log(error);
      }
    };

    fetchUnreadCounts();
  }, [authUser, dispatch]);
};

export default useGetUnreadCounts;