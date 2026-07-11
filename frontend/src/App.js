import Signup from './components/Signup';
import './App.css';
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import HomePage from './components/HomePage';
import Login from './components/Login';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect} from 'react';
import io from "socket.io-client";
import { setSocket } from './redux/socketSlice';

import { setOnlineUsers,updateLastSeen } from "./redux/userSlice";
import {
  syncUserProfile,
} from "./redux/userSlice";
import { API_URL } from './utils/constants';


const router = createBrowserRouter([
  {
    path:"/",
    element:<HomePage/>

},
  {
    path:"/signup",
    element:<Signup/>

},
  {
    path:"/login",
    element:<Login/>

},
])

function App() {
  
  const {authUser} = useSelector(store=>store.user);
   
  const authUserId = authUser?._id;

  const dispatch = useDispatch();

useEffect(() => {
if (!authUserId) return;

  const socket = io(
    API_URL,
    {
      query: {
        userId: authUserId,
      },
    }
  );

  dispatch(setSocket(socket));


  // =========================
  // ONLINE USERS
  // =========================

  const handleOnlineUsers = (
    onlineUsers
  ) => {
    dispatch(
      setOnlineUsers(onlineUsers)
    );
  };

  socket.on(
    "getOnlineUsers",
    handleOnlineUsers
  );


  // =========================
  // LAST SEEN
  // =========================

  const handleLastSeenUpdated = ({
    userId,
    lastSeen,
  }) => {
    dispatch(
      updateLastSeen({
        userId,
        lastSeen,
      })
    );
  };

  socket.on(
    "lastSeenUpdated",
    handleLastSeenUpdated
  );


  // =========================
  // REAL-TIME PROFILE UPDATE
  // =========================

  const handleProfileUpdated = (
    updatedUser
  ) => {
    console.log(
      "Profile Updated:",
      updatedUser
    );

    dispatch(
      syncUserProfile(updatedUser)
    );
  };

  socket.on(
    "profileUpdated",
    handleProfileUpdated
  );


  // =========================
  // CLEANUP
  // =========================

  return () => {
    socket.off(
      "getOnlineUsers",
      handleOnlineUsers
    );

    socket.off(
      "lastSeenUpdated",
      handleLastSeenUpdated
    );

    socket.off(
      "profileUpdated",
      handleProfileUpdated
    );

    socket.disconnect();

    dispatch(setSocket(null));
  };

}, [authUserId, dispatch]);



  return (
    <div className="p-4 h-screen flex items-center justify-center">
     <RouterProvider router={router}/>
    </div>
  );
}

export default App;
