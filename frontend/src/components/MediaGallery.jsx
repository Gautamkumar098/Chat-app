import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import {  API_URL_MESSAGE } from "../utils/constants";

const MediaGallery = ({ onClose }) => {
  const [media, setMedia] = useState([]);
  const [activeTab, setActiveTab] = useState("media");
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");

  const { selectedUser } = useSelector(
    (store) => store.user
  );

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMedia = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL_MESSAGE}/media/${selectedUser._id}`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setMedia(res.data.media || []);
        }
      } catch (error) {
        console.log("Media Gallery Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [selectedUser?._id]);

  const images = media.filter((item) =>
    item?.fileType?.startsWith("image/")
  );

  const files = media.filter(
    (item) =>
      !item?.fileType?.startsWith("image/")
  );

  return (
    <>
      <div className="absolute inset-0 z-40 flex justify-end bg-black/40">
        <div
          className="
            w-full
            sm:w-[380px]
            h-full
            bg-[#111b21]
            border-l
            border-white/10
            flex
            flex-col
          "
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              <IoClose size={24} />
            </button>

            <h2 className="text-white font-semibold">
              Media & Files
            </h2>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`py-3 text-sm ${
                activeTab === "media"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Media ({images.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={`py-3 text-sm ${
                activeTab === "files"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400"
              }`}
            >
              Files ({files.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner text-blue-400"></span>
              </div>
            ) : activeTab === "media" ? (
              images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        setPreviewImage(item.fileUrl)
                      }
                      className="aspect-square overflow-hidden rounded-lg bg-white/5"
                    >
                      <img
                        src={item.fileUrl}
                        alt={item.fileName || "Shared media"}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm mt-10">
                  No shared media
                </p>
              )
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <span className="text-2xl">
                      {item.fileType === "application/pdf"
                        ? "📕"
                        : item.fileType?.includes("word")
                        ? "📘"
                        : item.fileType?.includes("zip")
                        ? "🗜️"
                        : "📄"}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {item.fileName || "File"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm mt-10">
                No shared files
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewImage("")}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default MediaGallery;