import React, { useEffect, useState } from "react";
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
} from "react-icons/fa";

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

  const moodCategories = [
    { label: "I want to learn", key: "learn", icon: FaBrain, color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30" },
    { label: "I want to grow", key: "grow", icon: FaSeedling, color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30" },
    { label: "I want something emotional", key: "emotional", icon: FaHeart, color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30" },
    { label: "I want a different perspective", key: "perspective", icon: FaGlobe, color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30" },
    { label: "I want to be inspired", key: "inspired", icon: FaRocket, color: "from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30" },
    { label: "I want something challenging", key: "challenging", icon: FaPuzzlePiece, color: "from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30" },
    { label: "I want something relaxing", key: "relaxing", icon: FaSmile, color: "from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30" },
  ];

  useEffect(() => {
    const loadHomeData = async () => {
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
    };
    loadHomeData();
  }, [isLoggedIn, dispatch]);

  const handleMoodClick = (moodKey) => {
    navigate(`/all-books?mood=${moodKey}`);
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-16">
      {/* 1. Hero Discovery Section */}
      <Hero />

      {/* 2. Logged-in User Reading Progress Widget */}
      {isLoggedIn && goal && (
        <section className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                <FaBookOpen /> Your Reading Journey
              </div>
              <h2 className="text-2xl font-bold font-serif text-white">
                {goal.year} Reading Goal
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {goal.completedCount} of {goal.targetBooks} books completed &bull; {goal.remainingBooks} books to go!
              </p>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Progress</span>
                <span>{goal.percentage}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${goal.percentage}%` }}
                />
              </div>
            </div>

            <Link
              to="/library"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-5 py-2.5 rounded-xl text-xs border border-zinc-700 transition-colors flex items-center gap-2 justify-center"
            >
              <span>View Library</span>
              <FaCheckCircle className="text-amber-400 text-xs" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. Explore by Mood */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <FaCompass className="text-amber-500 text-xl" /> Explore by Mood
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Select a mood to find handpicked books that match how you feel right now.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moodCategories.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.key}
                onClick={() => handleMoodClick(mood.key)}
                className={`bg-gradient-to-br ${mood.color} p-5 rounded-2xl border text-left hover:scale-[1.02] transition-all duration-200 shadow-lg group flex flex-col justify-between min-h-[110px]`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="text-2xl group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold opacity-70 group-hover:opacity-100">Explore &rarr;</span>
                </div>
                <span className="font-semibold text-sm text-zinc-100 mt-3 block font-sans">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Personalized Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <FaMagic className="text-amber-400 text-xl" /> Recommended for You
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {recReason || "Books tailored to your reading preferences and history."}
            </p>
          </div>
          <Link to="/all-books" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((book) => (
              <BookCard key={book._id} data={book} />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
            <p>Start exploring and saving books to get tailored recommendations.</p>
            <Link to="/all-books" className="inline-block mt-4 bg-amber-500 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl">
              Explore Books
            </Link>
          </div>
        )}
      </section>

      {/* 5. Trending Books */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <FaFire className="text-orange-500 text-xl" /> Trending Books
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Popular titles readers are adding to their shelves today.
            </p>
          </div>
          <Link to="/all-books" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingBooks.map((book) => (
              <BookCard key={book._id} data={book} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Community Activity Feed */}
      <section className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-3">
              <FaComments className="text-blue-400 text-xl" /> Community Reader Activity
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              See what fellow book lovers are reading and reflecting on.
            </p>
          </div>
          <Link to="/community" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            Join Discussion &rarr;
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act._id}
                className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={act.user?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                    alt={act.user?.username || "Reader"}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <p className="text-sm text-zinc-200">
                      <span className="font-bold text-white">{act.user?.username || "Reader"}</span>{" "}
                      <span className="text-zinc-400">{act.details || "updated their reading activity"}</span>
                    </p>
                    {act.book && (
                      <Link to={`/view-book-details/${act.book._id}`} className="text-xs text-amber-400 font-semibold hover:underline">
                        {act.book.title} &bull; {act.book.author}
                      </Link>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 flex-shrink-0">
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-zinc-400 text-sm py-4">
            No recent activity yet. Be the first to share your reading journey!
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;