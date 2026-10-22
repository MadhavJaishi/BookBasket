import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../components/Loader/Loader";
import BookCard from "../components/BookCard/BookCard";
import { fetchMyLibrary, fetchReadingGoal } from "../store/librarySlice";
import { useModal } from "../context/ModalContext";
import {
  FaBookOpen,
  FaBookmark,
  FaCheckCircle,
  FaChartLine,
  FaPlus,
  FaEdit,
  FaGlobe,
  FaLock,
} from "react-icons/fa";

const MyLibrary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useModal();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { library, goal, loading } = useSelector((state) => state.library);

  const [activeTab, setActiveTab] = useState("CURRENTLY_READING");
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoalTarget, setNewGoalTarget] = useState(12);
  const [isLibraryPublic, setIsLibraryPublic] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isLoggedIn && !token) {
      navigate("/login");
      return;
    }
    dispatch(fetchMyLibrary());
    dispatch(fetchReadingGoal());

    const fetchUserInfo = async () => {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-user-info`,
          { headers }
        );
        setIsLibraryPublic(resp.data?.privacy?.isPublic !== false);
      } catch (err) {
        console.error("Error fetching user privacy:", err);
      }
    };
    fetchUserInfo();
  }, [isLoggedIn, dispatch, navigate]);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handleTogglePrivacy = async () => {
    const nextPrivacy = !isLibraryPublic;
    setPrivacyLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-privacy`,
        { isPublic: nextPrivacy },
        { headers }
      );
      setIsLibraryPublic(nextPrivacy);
      showAlert({
        title: "Privacy Updated",
        message: `Your library is now ${nextPrivacy ? "Public (visible to fellow readers)" : "Private (hidden from others)"}.`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Error",
        message: "Failed to update library visibility.",
        type: "error",
      });
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleGoalUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reading/goals`,
        { targetBooks: Number(newGoalTarget) },
        { headers }
      );
      dispatch(fetchReadingGoal());
      setEditingGoal(false);
      showAlert({
        title: "Goal Updated",
        message: `Your reading target has been updated to ${newGoalTarget} books!`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.msg || "Failed to update reading goal",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#08090a] flex items-center justify-center">
        <Loader onRetry={() => { dispatch(fetchMyLibrary()); dispatch(fetchReadingGoal()); }} fullScreen />
      </div>
    );
  }

  const currentlyReadingList = library.CURRENTLY_READING || [];
  const wantToReadList = library.WANT_TO_READ || [];
  const finishedList = library.FINISHED || [];

  const tabItems = [
    { key: "CURRENTLY_READING", label: "Currently Reading", count: currentlyReadingList.length, icon: FaBookOpen },
    { key: "WANT_TO_READ", label: "Want to Read", count: wantToReadList.length, icon: FaBookmark },
    { key: "FINISHED", label: "Finished", count: finishedList.length, icon: FaCheckCircle },
  ];

  let displayItems = [];
  if (activeTab === "CURRENTLY_READING") displayItems = currentlyReadingList;
  if (activeTab === "WANT_TO_READ") displayItems = wantToReadList;
  if (activeTab === "FINISHED") displayItems = finishedList;

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto space-y-10">
      {/* Header & Goal Dashboard Banner */}
      <div className="bg-zinc-900/40 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block">
                Personal Shelf
              </span>
              <button
                onClick={handleTogglePrivacy}
                disabled={privacyLoading}
                title="Click to toggle library visibility between Public and Private"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  isLibraryPublic
                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                }`}
              >
                {isLibraryPublic ? (
                  <>
                    <FaGlobe className="text-[10px]" /> <span>Public Library</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-[10px]" /> <span>Private Library</span>
                  </>
                )}
                <span className="text-[9px] opacity-70 underline ml-0.5">Switch</span>
              </button>
            </div>
            <h1 className="text-4xl font-serif text-white font-normal">My Library & Tracker</h1>
            <p className="text-zinc-400 font-light text-sm mt-1 max-w-xl">
              Organize your books, track your reading progress, and manage your annual reading goals.
            </p>
          </div>

          {/* Goal Metrics */}
          {goal && (
            <div className="bg-zinc-950/80 p-5 rounded-2xl flex flex-col justify-between min-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <FaChartLine /> {goal.year} Goal
                </span>
                <button
                  onClick={() => {
                    setNewGoalTarget(goal.targetBooks);
                    setEditingGoal(!editingGoal);
                  }}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-light"
                >
                  <FaEdit /> Edit Goal
                </button>
              </div>

              {editingGoal ? (
                <form onSubmit={handleGoalUpdateSubmit} className="flex gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-20 bg-zinc-900 text-xs text-white p-2 rounded-xl focus:outline-none"
                  />
                  <button type="submit" className="bg-white text-zinc-950 font-medium text-xs px-4 py-1.5 rounded-full">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <div className="text-xl font-serif text-white">
                    {goal.completedCount} / {goal.targetBooks} <span className="text-xs font-sans text-zinc-400 font-light">books completed</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-light text-xs transition-all ${
                isActive
                  ? "bg-white text-zinc-950 font-medium shadow-md"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="text-xs" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-zinc-200 text-zinc-900" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Display Book Grid or Empty State */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayItems.map((item) => {
            const bookData = item.book;
            if (!bookData) return null;
            return (
              <div key={item._id} className="relative group flex flex-col">
                <BookCard data={bookData} />
                {item.status === "CURRENTLY_READING" && (
                  <div className="mt-2 bg-zinc-900/50 p-3 rounded-2xl text-xs flex flex-col gap-1">
                    <div className="flex justify-between text-zinc-400 font-light">
                      <span>Progress:</span>
                      <span className="text-emerald-400 font-medium">{item.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/20 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
            <FaBookOpen />
          </div>

          <h3 className="text-2xl font-serif text-white font-normal">
            {activeTab === "CURRENTLY_READING" && "Nothing on your reading desk yet."}
            {activeTab === "WANT_TO_READ" && "Your reading list is empty."}
            {activeTab === "FINISHED" && "No completed books yet."}
          </h3>

          <p className="text-zinc-400 font-light text-sm">
            {activeTab === "CURRENTLY_READING" && "Pick your next book and start reading today."}
            {activeTab === "WANT_TO_READ" && "Find a book that interests you and save it for later."}
            {activeTab === "FINISHED" && "Mark books as finished as you complete them."}
          </p>

          <Link
            to="/all-books"
            className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-6 py-2.5 rounded-full shadow-lg transition-all"
          >
            <FaPlus className="text-[10px]" />
            <span>Discover Books</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
