import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import { FaComments, FaHeart, FaPlus, FaUser, FaClock, FaBook } from "react-icons/fa";

const Community = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New discussion state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/discussions`);
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error("Failed to load discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please sign in to start a discussion.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/discussions`,
        { title, content },
        { headers }
      );
      setTitle("");
      setContent("");
      setShowForm(false);
      fetchDiscussions();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create discussion");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
            <FaComments /> Community Reader Board
          </span>
          <h1 className="text-3xl font-bold font-serif text-white">Reader Discussions</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Share reflections, discuss book theories, and ask fellow readers for advice.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <FaPlus />
          <span>New Discussion</span>
        </button>
      </div>

      {/* New Discussion Form Modal/Card */}
      {showForm && (
        <form onSubmit={handleCreateDiscussion} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold font-serif text-white">Start a New Discussion</h3>
          <input
            type="text"
            placeholder="Title (e.g. What book completely changed your worldview?)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
          />
          <textarea
            rows="4"
            placeholder="Share your thoughts or question..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-zinc-800 text-zinc-400 text-xs px-4 py-2 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 text-zinc-950 font-bold text-xs px-5 py-2.5 rounded-xl"
            >
              {submitting ? "Posting..." : "Post Discussion"}
            </button>
          </div>
        </form>
      )}

      {/* Discussions Feed */}
      <div className="space-y-4">
        {discussions.length > 0 ? (
          discussions.map((disc) => (
            <div key={disc._id} className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={disc.author?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                    alt={disc.author?.username || "Reader"}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <span className="text-sm font-bold text-zinc-200">{disc.author?.username || "Reader"}</span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <FaClock /> {new Date(disc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {disc.book && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <FaBook /> {disc.book.title}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold font-serif text-white">{disc.title}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{disc.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 p-8 text-center text-zinc-400 rounded-2xl">
            No community discussions yet. Click "New Discussion" to start the conversation!
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
