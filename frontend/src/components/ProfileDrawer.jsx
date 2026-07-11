import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  useDispatch,
} from "react-redux";

import {
  updateAuthUserProfile,
} from "../redux/userSlice";

import { IoClose } from "react-icons/io5";
import { FiCamera, FiEdit2 } from "react-icons/fi";
import { API_URL_USER } from "../utils/constants";

const ProfileDrawer = ({
  user,
  onClose,
}) => {
  const [fullName, setFullName] =
    useState(user?.fullName || "");

  const [about, setAbout] =
    useState(
      user?.about ||
        "Hey there! I am using ChatApp."
    );

  const [preview, setPreview] =
    useState(user?.profilePhoto || "");


    const [profileFile, setProfileFile] =
  useState(null);

const [saving, setSaving] =
  useState(false);
  const dispatch = useDispatch();


  useEffect(() => {
    setFullName(user?.fullName || "");

    setAbout(
      user?.about ||
        "Hey there! I am using ChatApp."
    );

    setPreview(user?.profilePhoto || "");
  }, [user]);


const handleImageChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Basic validation
  if (!file.type.startsWith("image/")) {
    toast.error(
      "Please select an image file"
    );
    return;
  }

  setProfileFile(file);

  const imageUrl =
    URL.createObjectURL(file);

  setPreview(imageUrl);
};




const handleSaveProfile = async () => {
  if (!fullName.trim()) {
    toast.error("Name is required");
    return;
  }

  try {
    setSaving(true);

    const formData = new FormData();

    formData.append(
      "fullName",
      fullName.trim()
    );

    formData.append(
      "about",
      about.trim()
    );

    if (profileFile) {
      formData.append(
        "profilePhoto",
        profileFile
      );
    }

    const res = await axios.put(
      `${API_URL_USER}/profile`,
      formData,
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      dispatch(
        updateAuthUserProfile(
          res.data.user
        )
      );

      toast.success(
        res.data.message
      );

      onClose();
    }
  } catch (error) {
    console.log(
      "Update Profile Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Profile update failed"
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <div
      className="
        absolute
        inset-0
        z-[200]
        bg-[#111827]
        flex
        flex-col
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          gap-4
          px-4
          py-4
          border-b
          border-white/10
          bg-white/5
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
            text-gray-300
            hover:text-white
            hover:bg-white/10
            transition
          "
        >
          <IoClose size={25} />
        </button>

        <h2
          className="
            text-xl
            font-semibold
            text-white
          "
        >
          Profile
        </h2>
      </div>


      {/* Content */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          py-7
        "
      >
        {/* Profile Image */}

        <div
          className="
            flex
            justify-center
            mb-8
          "
        >
          <div className="relative group">

            <img
              src={preview}
              alt="profile"
              className="
                w-36
                h-36
                rounded-full
                object-cover
                ring-4
                ring-blue-500/50
              "
            />


            <label
              className="
                absolute
                inset-0
                rounded-full
                bg-black/50
                opacity-0
                group-hover:opacity-100
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                text-white
                transition
              "
            >
              <FiCamera size={25} />

              <span className="text-xs mt-2">
                Change Photo
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

          </div>
        </div>


        {/* Full Name */}

        <div className="mb-7">

          <p
            className="
              text-blue-400
              text-sm
              mb-2
            "
          >
            Your name
          </p>

          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-gray-600
              pb-2
            "
          >
            <input
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="
                flex-1
                bg-transparent
                text-white
                outline-none
              "
            />

            <FiEdit2
              className="text-gray-400"
            />

          </div>

        </div>


        {/* Username */}

        <div className="mb-7">

          <p
            className="
              text-blue-400
              text-sm
              mb-2
            "
          >
            Username
          </p>

          <p className="text-white">
            @{user?.username}
          </p>

          <p
            className="
              text-xs
              text-gray-500
              mt-2
            "
          >
            Username cannot be changed.
          </p>

        </div>


        {/* About */}

        <div>

          <p
            className="
              text-blue-400
              text-sm
              mb-2
            "
          >
            About
          </p>

          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-gray-600
              pb-2
            "
          >
            <input
              value={about}
              maxLength={150}
              onChange={(e) =>
                setAbout(e.target.value)
              }
              className="
                flex-1
                bg-transparent
                text-white
                outline-none
              "
            />

            <FiEdit2
              className="text-gray-400"
            />

          </div>

          <p
            className="
              text-right
              text-xs
              text-gray-500
              mt-1
            "
          >
            {about.length}/150
          </p>

        </div>

      </div>


      {/* Save Button */}

      <div
        className="
          p-4
          border-t
          border-white/10
        "
      >
    <button
  type="button"
  onClick={handleSaveProfile}
  disabled={saving}
  className="
    w-full
    py-3
    rounded-xl
    bg-blue-600
    hover:bg-blue-700
    text-white
    font-semibold
    disabled:opacity-50
    disabled:cursor-not-allowed
    transition
  "
>
  {saving
    ? "Saving..."
    : "Save Changes"}
</button>
      </div>

    </div>
  );
};


export default ProfileDrawer;