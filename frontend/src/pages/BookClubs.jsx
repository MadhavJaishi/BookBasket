import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import { FaUsers, FaBook, FaPlus, FaCheck } from "react-icons/fa";
import { useModal } from "../context/ModalContext";

const BookClubs = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { showAlert, showAuthModal, showConfirm } = useModal();
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

  const handleOpenCreateClub = () => {
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to create and lead a book club.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
      return;
    }
    setShowForm(!showForm);
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to create a book club.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
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
      showAlert({
        title: "Club Created",
        message: "Your new reading collective is now live!",
        type: "success",
      });
      fetchClubs();
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.msg || "Failed to create book club",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinClub = async (clubId, clubName, isMember) => {
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to join reading clubs and participate in group discussions.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
      return;
    }

    if (isMember) {
      showConfirm({
        title: "Leave Book Club",
        message: `Are you sure you want to leave "${clubName}"?`,
        type: "warning",
        confirmText: "Leave Club",
        cancelText: "Stay in Club",
        onConfirm: async () => {
          try {
            const res = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/book-clubs/${clubId}/join`,
              {},
              { headers }
            );
            showAlert({
              title: "Club Membership Updated",
              message: res.data.msg || "You have left the book club.",
              type: "info",
            });
            fetchClubs();
          } catch (err) {
            showAlert({
              title: "Error",
              message: err.response?.data?.msg || "Failed to update membership",
              type: "error",
            });
          }
        },
      });
    } else {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/book-clubs/${clubId}/join`,
          {},
          { headers }
        );
        showAlert({
          title: "Welcome to the Club!",
          message: res.data.msg || "You are now a member of this reading collective.",
          type: "success",
        });
        fetchClubs();
      } catch (err) {
        showAlert({
          title: "Error",
          message: err.response?.data?.msg || "Failed to join club",
          type: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#08090a] flex items-center justify-center">
        <Loader onRetry={fetchClubs} fullScreen />
      </div>
    );
  }

  const userId = localStorage.getItem("id");

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="bg-zinc-900/40 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
            Reader Collectives
          </span>
          <h1 className="text-4xl font-serif text-white font-normal">Book Clubs</h1>
          <p className="text-zinc-400 font-light text-sm mt-1 max-w-xl">
            Read together, share diverse perspectives, and discover literature in themed reading communities.
          </p>
        </div>

        <button
          onClick={handleOpenCreateClub}
          className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-6 py-3 rounded-full shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <FaPlus className="text-[10px]" />
          <span>Create Book Club</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreateClub} className="bg-zinc-900/70 p-6 sm:p-8 rounded-3xl space-y-4 animate-fadeIn">
          <h3 className="text-xl font-serif text-white font-normal">Create a New Book Club</h3>
          <input
            type="text"
            placeholder="Club Name (e.g. Psychology & Mind Club)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-light"
          />
          <textarea
            rows="3"
            placeholder="Club Description & Purpose..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-light"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs px-5 py-2.5 rounded-full font-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs px-6 py-2.5 rounded-full transition-colors"
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
                className="bg-zinc-900/40 hover:bg-zinc-900/70 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-emerald-400 font-light flex items-center gap-1.5">
                      <FaUsers className="text-[10px]" /> {club.members?.length || 1} members
                    </span>
                    <span className="text-[11px] text-zinc-500 font-light">By {club.creator?.username || "Reader"}</span>
                  </div>

                  <h3 className="text-xl font-serif text-white font-normal">{club.name}</h3>
                  <p className="text-zinc-400 text-sm font-light mt-2 leading-relaxed">{club.description}</p>
                </div>

                {club.currentBook && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl flex items-center gap-3">
                    <FaBook className="text-emerald-400 text-base flex-shrink-0" />
                    <div className="text-xs truncate">
                      <span className="text-zinc-500 block uppercase font-light text-[10px]">Currently Reading</span>
                      <span className="text-zinc-200 font-medium">{club.currentBook.title}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleJoinClub(club._id, club.name, isMember)}
                  className={`w-full py-2.5 rounded-full font-medium text-xs transition-all flex items-center justify-center gap-2 ${
                    isMember
                      ? "bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400"
                      : "bg-white hover:bg-zinc-200 text-zinc-950 shadow-md"
                  }`}
                >
                  {isMember ? <><FaCheck className="text-[10px]" /> Member (Leave)</> : "Join Club"}
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-zinc-900/20 p-12 text-center text-zinc-500 font-light rounded-3xl">
            No book clubs created yet. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default BookClubs;
