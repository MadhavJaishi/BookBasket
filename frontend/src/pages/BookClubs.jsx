import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import { FaUsers, FaBook, FaPlus, FaCheck } from "react-icons/fa";

const BookClubs = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New club state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/book-clubs`);
      setClubs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch book clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please sign in to create a book club.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/book-clubs`,
        { name, description },
        { headers }
      );
      setName("");
      setDescription("");
      setShowForm(false);
      fetchClubs();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create book club");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    if (!isLoggedIn) {
      alert("Please sign in to join book clubs.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/book-clubs/${clubId}/join`,
        {},
        { headers }
      );
      alert(res.data.msg);
      fetchClubs();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to toggle club membership");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const userId = localStorage.getItem("id");

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
            <FaUsers /> Reader Collectives
          </span>
          <h1 className="text-3xl font-bold font-serif text-white">Book Clubs</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Read together, share perspectives, and discover great literature in themed reading groups.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <FaPlus />
          <span>Create Book Club</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreateClub} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold font-serif text-white">Create a New Book Club</h3>
          <input
            type="text"
            placeholder="Club Name (e.g. Psychology & Mind Club)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
          />
          <textarea
            rows="3"
            placeholder="Club Description & Purpose..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      )}

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.length > 0 ? (
          clubs.map((club) => {
            const isMember = Array.isArray(club.members) && club.members.some((m) => String(m._id || m) === String(userId));
            return (
              <div
                key={club._id}
                className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <FaUsers /> {club.members?.length || 1} members
                    </span>
                    <span className="text-[11px] text-zinc-500">By {club.creator?.username || "Reader"}</span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-white">{club.name}</h3>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{club.description}</p>
                </div>

                {club.currentBook && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center gap-3">
                    <FaBook className="text-amber-500 text-lg flex-shrink-0" />
                    <div className="text-xs truncate">
                      <span className="text-zinc-500 block uppercase font-bold text-[10px]">Currently Reading</span>
                      <span className="text-zinc-200 font-semibold">{club.currentBook.title}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleJoinClub(club._id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isMember
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/20 hover:text-red-400"
                      : "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md"
                  }`}
                >
                  {isMember ? <><FaCheck /> Member (Click to Leave)</> : "Join Club"}
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 text-center text-zinc-400 rounded-2xl">
            No book clubs created yet. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default BookClubs;
