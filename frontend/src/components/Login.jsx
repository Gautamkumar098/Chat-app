import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/userSlice";
import {  API_URL_USER } from "../utils/constants";
const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL_USER}/login`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      navigate("/");
      dispatch(setAuthUser(res.data));
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
    setUser({
      username: "",
      password: "",
    });
  };
  return (
    <div className="min-w-96 mx-auto">
      <div className=" w-full p-6 rounded-lg shadow-md bg-gray-400  bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 ">
        <h1 className="text-3xl font-bold text-center ">Login</h1>
        <form onSubmit={onSubmitHandler} action="">
          <div>
            <label className="label p-2">
              <span className="text-base label-text">Username</span>
            </label>
            <input
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div>
            <label className="label p-2">
              <span className="text-base label-text">Password</span>
            </label>
            <input
              className="w-full input input-bordered h-10"
              type="Password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>

          <p className="text-center my-2">
            Don't have an account?
            <Link to="/signup"> signup</Link>
          </p>

          <div>
            <button
              disabled={loading}
              className="btn btn-block btn-sm mt-2 border border-slate-700 h-10 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
