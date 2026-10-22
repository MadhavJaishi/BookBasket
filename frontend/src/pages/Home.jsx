import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Hero from "../components/Home/Hero";
import BookCard from "../components/BookCard/BookCard";
import Loader from "../components/Loader/Loader";
import { fetchReadingGoal } from "../store/librarySlice";
import {
  FaBrain,
  FaSeedling,
  FaHeart,
  FaGlobe,
  FaRocket,
  FaPuzzlePiece,
  FaSmile,
  FaFire,
  FaCompass,
  FaComments,
  FaBookOpen,
  FaCheckCircle,
  FaMagic,
  FaArrowRight,
} from "react-icons/fa";

import { MOOD_CATEGORIES } from "../utils/filterPresets";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { goal } = useSelector((state) => state.library);

  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recReason, setRecReason] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const moodCategories = MOOD_CATEGORIES;

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = isLoggedIn
        ? { id: localStorage.getItem("id"), authorization: `Bearer ${localStorage.getItem("token")}` }
        : {};

      // 1. Fetch recent/trending books
      const recentRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-recent-books`);
      setTrendingBooks(recentRes.data?.data || []);

      // 2. Fetch personalized recommendations
      const recRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/discovery/recommendations`, { headers });
      setRecommendations(recRes.data?.data || []);
      setRecReason(recRes.data?.reason || "");

      // 3. Fetch community activity feed
      const actRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/activity/feed`);
      setActivities(actRes.data?.data || []);

      // 4. Fetch user goal if logged in
      if (isLoggedIn) {
        dispatch(fetchReadingGoal());
      }
    } catch (err) {
      console.error("Error loading home page data:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleMoodClick = (moodObj) => {
    const key = typeof moodObj === "string" ? moodObj : moodObj.key;
    const moodItem = MOOD_CATEGORIES.find((m) => m.key === key);
    const categoryParam = moodItem && moodItem.genres ? moodItem.genres.join(",") : "";
    navigate(`/all-books?mood=${key}&category=${encodeURIComponent(categoryParam)}`);
  };

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen">
      {/* 1. Hero Discovery Section */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-24 space-y-24">
        {/* 2. Logged-in User Reading Progress Widget */}
        {isLoggedIn && goal && (
          <section className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-6 sm:p-10 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-light uppercase tracking-widest text-emerald-400 mb-1">
                  <FaBookOpen /> Reading Journey
                </div>
                <h2 className="text-3xl font-serif text-white font-normal">
                  {goal.year} Reading Goal
                </h2>
                <p className="text-zinc-400 font-light text-sm mt-1">
                  {goal.completedCount} of {goal.targetBooks} books completed &bull; {goal.remainingBooks} to go
                </p>
              </div>

              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-xs font-light text-zinc-400 mb-2">
                  <span>Progress</span>
                  <span className="text-white font-medium">{goal.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.percentage}%` }}
                  />
                </div>
              </div>

              <Link
                to="/library"
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium px-5 py-2.5 rounded-full text-xs transition-colors flex items-center gap-2 justify-center"
              >
                <span>View Library</span>
                <FaArrowRight className="text-[10px] text-zinc-400" />
              </Link>
            </div>
          </section>
        )}

        {/* 3. Explore by Mood */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
                Intentional Reading
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
                Explore by Mood
              </h2>
            </div>
            <p className="text-zinc-400 font-light text-sm max-w-md">
              Select what you feel right now and find carefully matched literature.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {moodCategories.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.key}
                  onClick={() => handleMoodClick(mood.key)}
                  className={`bg-zinc-900/60 ${mood.bg} text-zinc-300 px-5 py-3 rounded-full text-sm font-light transition-all duration-200 flex items-center gap-2.5 group`}
                >
                  <Icon className="text-sm opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Personalized Recommendations */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
                Curated For You
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
                Recommended Titles
              </h2>
              <p className="text-zinc-400 font-light text-sm mt-1">
                {recReason || "Hand-selected recommendations tailored to your taste."}
              </p>
            </div>
            <Link
              to="/all-books"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>View catalog</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {loading ? (
            <Loader onRetry={loadHomeData} />
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((book) => (
                <BookCard key={book._id} data={book} />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/30 rounded-3xl p-12 text-center text-zinc-400 max-w-md mx-auto">
              <p className="font-light text-sm">Start exploring and saving books to generate your personalized reading matrix.</p>
              <Link
                to="/all-books"
                className="inline-block mt-4 bg-white text-zinc-950 font-medium text-xs px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </section>

        {/* 5. Trending Books */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
                Popular
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
                Trending Among Readers
              </h2>
              <p className="text-zinc-400 font-light text-sm mt-1">
                Top literary works capturing readers' curiosity this week.
              </p>
            </div>
            <Link
              to="/all-books"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>All titles</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {loading ? (
            <Loader onRetry={loadHomeData} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingBooks.slice(0, 4).map((book) => (
                <BookCard key={book._id} data={book} />
              ))}
            </div>
          )}
        </section>

        {/* 6. Community Activity Feed */}
        <section className="bg-zinc-900/30 rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
                Community Pulse
              </span>
              <h2 className="text-3xl font-serif text-white font-normal">
                Reader Reflections & Activity
              </h2>
            </div>
            <Link
              to="/community"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium px-4 py-2 rounded-full transition-all self-start sm:self-auto"
            >
              Join Discussion &rarr;
            </Link>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div
                  key={act._id}
                  className="bg-zinc-900/50 hover:bg-zinc-900/80 p-4 rounded-2xl flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={act.user?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                      alt={act.user?.username || "Reader"}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-zinc-300 font-light">
                        <span className="font-medium text-white">{act.user?.username || "Reader"}</span>{" "}
                        <span className="text-zinc-400">{act.details || "updated their reading activity"}</span>
                      </p>
                      {act.book && (
                        <Link to={`/view-book-details/${act.book._id}`} className="text-xs text-emerald-400 font-light hover:underline">
                          {act.book.title} &bull; {act.book.author}
                        </Link>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-light flex-shrink-0">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 font-light text-sm py-4">
              No recent activity recorded yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;