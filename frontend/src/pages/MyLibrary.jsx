import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../components/Loader/Loader";
import BookCard from "../components/BookCard/BookCard";
import { fetchMyLibrary, fetchReadingGoal } from "../store/librarySlice";
import {
  FaBookOpen,
  FaBookmark,
  FaCheckCircle,
  FaHeart,
  FaChartLine,
  FaPlus,
  FaEdit,
} from "react-icons/fa";

const MyLibrary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { library, goal, loading } = useSelector((state) => state.library);

  const [activeTab, setActiveTab] = useState("CURRENTLY_READING");
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoalTarget, setNewGoalTarget] = useState(12);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    dispatch(fetchMyLibrary());
    dispatch(fetchReadingGoal());
  }, [isLoggedIn, dispatch, navigate]);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
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
    } catch (err) {
      alert("Failed to update goal");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader />
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
    <div className="bg-zinc-950 text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-10">
      {/* Header & Goal Dashboard Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <FaBookmark /> Personal Reading Shelf
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">My Library & Tracker</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Organize your books, track your reading progress, and manage your yearly reading goals.
            </p>
          </div>

          {/* Goal Metrics */}
          {goal && (
            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between min-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <FaChartLine /> {goal.year} Goal
                </span>
                <button
                  onClick={() => {
                    setNewGoalTarget(goal.targetBooks);
                    setEditingGoal(!editingGoal);
                  }}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
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
                    className="w-20 bg-zinc-900 text-xs text-white p-1.5 rounded border border-zinc-700"
                  />
                  <button type="submit" className="bg-amber-500 text-zinc-950 font-bold text-xs px-3 py-1.5 rounded">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <div className="text-xl font-extrabold text-white font-serif">
                    {goal.completedCount} / {goal.targetBooks} <span className="text-xs font-sans text-zinc-400 font-normal">books completed</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mt-3 border border-zinc-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-zinc-950 text-amber-400" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Display Book Grid or Meaningful Empty State */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayItems.map((item) => {
            const bookData = item.book;
            if (!bookData) return null;
            return (
              <div key={item._id} className="relative group">
                <BookCard data={bookData} />
                {item.status === "CURRENTLY_READING" && (
                  <div className="mt-2 bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs flex flex-col gap-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Progress:</span>
                      <span className="text-amber-400 font-bold">{item.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="bg-blue-500 h-full rounded-full"
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
        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
            <FaBookOpen />
          </div>

          <h3 className="text-xl font-bold font-serif text-white">
            {activeTab === "CURRENTLY_READING" && "Nothing on your reading desk yet."}
            {activeTab === "WANT_TO_READ" && "Your reading list is empty."}
            {activeTab === "FINISHED" && "No completed books yet."}
          </h3>

          <p className="text-zinc-400 text-sm">
            {activeTab === "CURRENTLY_READING" && "Pick your next book and start reading today."}
            {activeTab === "WANT_TO_READ" && "Find a book that interests you and save it for later."}
            {activeTab === "FINISHED" && "Mark books as finished as you complete them."}
          </p>

          <Link
            to="/all-books"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all"
          >
            <FaPlus />
            <span>Discover Books</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
