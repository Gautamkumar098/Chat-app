

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL_USER } from "../utils/constants";

const Signup = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCheckbox = (gender) => {
    setUser({ ...user, gender });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("fullName", user.fullName);
      formData.append("username", user.username);
      formData.append("password", user.password);
      formData.append("confirmPassword", user.confirmPassword);
      formData.append("gender", user.gender);

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      const res = await axios.post(
        `${API_URL_USER}/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }

    setUser({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      gender: "",
    });

    setProfilePhoto(null);
  };

  return (
    <div className="min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10">
        <h1 className="text-3xl font-bold text-center">Signup</h1>

        <form onSubmit={onSubmitHandler}>
          <div>
            <label className="label p-2">
              <span className="text-base label-text">Full Name</span>
            </label>

            <input
              value={user.fullName}
              onChange={(e) =>
                setUser({
                  ...user,
                  fullName: e.target.value,
                })
              }
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="label p-2">
              <span className="text-base label-text">Username</span>
            </label>

            <input
              value={user.username}
              onChange={(e) =>
                setUser({
                  ...user,
                  username: e.target.value,
                })
              }
              className="w-full input input-bordered h-10"
              type="text"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="label p-2">
              <span className="text-base label-text">Password</span>
            </label>

            <input
              value={user.password}
              onChange={(e) =>
                setUser({
                  ...user,
                  password: e.target.value,
                })
              }
              className="w-full input input-bordered h-10"
              type="password"
              placeholder="Password"
            />
          </div>

          <div>
            <label className="label p-2">
              <span className="text-base label-text">Confirm Password</span>
            </label>

            <input
              value={user.confirmPassword}
              onChange={(e) =>
                setUser({
                  ...user,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full input input-bordered h-10"
              type="password"
              placeholder="Confirm Password"
            />
          </div>

          <div className="flex items-center my-4">
            <div className="flex items-center">
              <p>Male</p>

              <input
                type="checkbox"
                checked={user.gender === "male"}
                onChange={() => handleCheckbox("male")}
                className="checkbox mx-2"
              />
            </div>

            <div className="flex items-center">
              <p>Female</p>

              <input
                type="checkbox"
                checked={user.gender === "female"}
                onChange={() => handleCheckbox("female")}
                className="checkbox mx-2"
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="my-4">
            <label className="label p-2">
              <span className="text-base label-text">Profile Photo</span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              className="file-input file-input-bordered w-full"
            />
          </div>

          <p className="text-center my-2">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

          <div>
            <button
              disabled={loading}
              className="btn btn-block btn-sm mt-2 border border-slate-700 h-10"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Please wait...
                </>
              ) : (
                "Signup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
