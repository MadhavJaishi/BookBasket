import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import BookCard from "../BookCard/BookCard";
import { useModal } from "../../context/ModalContext";
import {
  FaTimes,
  FaUserPlus,
  FaUserCheck,
  FaLock,
  FaGlobe,
  FaBookOpen,
  FaBookmark,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";

const PublicProfileModal = ({ isOpen, onClose, username, onFollowChange }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const currentUserId = useSelector((state) => state.auth.id) || localStorage.getItem("id");
  const { showAlert, showAuthModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("CURRENTLY_READING");
  const [followLoading, setFollowLoading] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchUserProfile = useCallback(async () => {
    if (!isOpen || !username) return;
    setLoading(true);
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user-profile/${encodeURIComponent(username)}`,
        { headers }
      );
      setUserData(resp.data?.data || null);
      if (resp.data?.data?.library) {
        if (resp.data.data.library.CURRENTLY_READING?.length > 0) {
          setActiveTab("CURRENTLY_READING");
        } else if (resp.data.data.library.FINISHED?.length > 0) {
          setActiveTab("FINISHED");
        } else {
          setActiveTab("WANT_TO_READ");
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, username]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (!isOpen) return null;

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "Sign in to follow fellow readers and build your literary network.",
        proceedText: "Proceed to login",
        cancelText: "Continue as guest",
      });
      return;
    }

    if (!userData) return;

    const targetId = userData._id;
    const isCurrentlyFollowing = userData.isFollowing;

    setFollowLoading(true);
    try {
      if (isCurrentlyFollowing) {
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/unfollow/${targetId}`,
          {},
          { headers }
        );
        setUserData((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, (prev.followersCount || 1) - 1),
        }));
        showAlert({
          title: "Unfollowed",
          message: `You unfollowed ${userData.username}`,
          type: "info",
        });
        if (onFollowChange) onFollowChange(targetId, false);
      } else {
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/follow/${targetId}`,
          {},
          { headers }
        );
        setUserData((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1,
        }));
        showAlert({
          title: "Following",
          message: `You are now following ${userData.username}!`,
          type: "success",
        });
        if (onFollowChange) onFollowChange(targetId, true);
      }
    } catch (err) {
      showAlert({
        title: "Action Failed",
        message: err.response?.data?.msg || "Failed to update follow status.",
        type: "error",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const currentlyReading = userData?.library?.CURRENTLY_READING || [];
  const wantToRead = userData?.library?.WANT_TO_READ || [];
  const finished = userData?.library?.FINISHED || [];

  let displayedBooks = [];
  if (activeTab === "CURRENTLY_READING") displayedBooks = currentlyReading;
  if (activeTab === "WANT_TO_READ") displayedBooks = wantToRead;
  if (activeTab === "FINISHED") displayedBooks = finished;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0e10] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Close profile"
        >
          <FaTimes className="text-sm" />
        </button>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <Loader onRetry={fetchUserProfile} />
          </div>
        ) : userData ? (
          <>
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-zinc-800/80 pb-6">
              <img
                src={userData.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                alt={userData.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-zinc-700 bg-zinc-950 shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
                }}
              />

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-serif text-white font-normal flex items-center justify-center sm:justify-start gap-2">
                      <span>{userData.username}</span>
                      {userData.role === "admin" && (
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Admin
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-0.5 max-w-md">
                      {userData.bio || "Passionate reader exploring new perspectives."}
                    </p>
                  </div>

                  {/* Follow Button */}
                  {!userData.isOwner && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`inline-flex items-center gap-2 text-xs font-medium px-5 py-2 rounded-full transition-all self-center sm:self-auto ${
                        userData.isFollowing
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-950/40"
                      }`}
                    >
                      {userData.isFollowing ? (
                        <>
                          <FaUserCheck className="text-emerald-400 text-[10px]" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="text-[10px]" />
                          <span>Follow Reader</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Follower Stats & Privacy Badge */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-zinc-400 font-light">
                  <span className="flex items-center gap-1.5">
                    <strong className="text-white font-semibold">{userData.followersCount || 0}</strong> followers
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-white font-semibold">{userData.followingCount || 0}</strong> following
                  </span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      userData.isLibraryPublic
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {userData.isLibraryPublic ? (
                      <>
                        <FaGlobe className="text-[9px]" /> Public Library
                      </>
                    ) : (
                      <>
                        <FaLock className="text-[9px]" /> Private Library
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Library Content or Private Guard */}
            {userData.isLibraryPublic ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
                    Reader Shelf ({userData.library?.totalBooks || 0} books)
                  </span>

                  {/* Tabs */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab("CURRENTLY_READING")}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                        activeTab === "CURRENTLY_READING"
                          ? "bg-white text-zinc-950 font-medium"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FaBookOpen className="text-[10px]" /> Reading ({currentlyReading.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("FINISHED")}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                        activeTab === "FINISHED"
                          ? "bg-white text-zinc-950 font-medium"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FaCheckCircle className="text-[10px]" /> Finished ({finished.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("WANT_TO_READ")}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                        activeTab === "WANT_TO_READ"
                          ? "bg-white text-zinc-950 font-medium"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FaBookmark className="text-[10px]" /> Wishlist ({wantToRead.length})
                    </button>
                  </div>
                </div>

                {/* Book Grid */}
                {displayedBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
                    {displayedBooks.map((item) => {
                      if (!item.book) return null;
                      return (
                        <div key={item._id} className="flex flex-col">
                          <BookCard data={item.book} />
                          {item.status === "CURRENTLY_READING" && (
                            <div className="mt-1.5 bg-zinc-900/80 px-2 py-1 rounded-lg text-[10px] text-zinc-400 flex justify-between items-center">
                              <span>Progress:</span>
                              <span className="text-emerald-400 font-semibold">{item.progressPercentage || 0}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-900/30 rounded-2xl text-zinc-500 font-light text-xs">
                    No books listed under this category.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center bg-zinc-900/30 border border-zinc-800/60 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto text-lg">
                  <FaLock />
                </div>
                <h3 className="text-lg font-serif text-white font-normal">Private Reading Library</h3>
                <p className="text-xs text-zinc-400 font-light max-w-sm mx-auto">
                  {userData.username} has chosen to keep their reading library and shelf progress private.
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default PublicProfileModal;
