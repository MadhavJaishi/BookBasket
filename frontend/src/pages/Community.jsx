import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import {
  FaComments,
  FaPlus,
  FaClock,
  FaBook,
  FaBookOpen,
  FaUsers,
  FaSearch,
  FaUserPlus,
  FaUserCheck,
  FaGlobe,
  FaLock,
} from "react-icons/fa";
import { useModal } from "../context/ModalContext";
import PublicProfileModal from "../components/Community/PublicProfileModal";

const Community = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { showAlert, showAuthModal } = useModal();

  const [activeTab, setActiveTab] = useState("DISCUSSIONS"); // "DISCUSSIONS" | "READERS"

  // Discussions state
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Readers Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [readers, setReaders] = useState([]);
  const [loadingReaders, setLoadingReaders] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    fetchDiscussions();
    fetchReaders("");
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoadingDiscussions(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/discussions`);
      setDiscussions(res.data.data || []);
    } catch (err) {
      console.error("Failed to load discussions:", err);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const fetchReaders = async (q = "") => {
    try {
      setLoadingReaders(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/search-users?query=${encodeURIComponent(q)}`,
        { headers }
      );
      setReaders(res.data.data || []);
    } catch (err) {
      console.error("Failed to search readers:", err);
    } finally {
      setLoadingReaders(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchReaders(val);
    }, 250);
  };

  const handleOpenForm = () => {
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to start reader discussions and share reflections.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
      return;
    }
    setShowForm(!showForm);
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to start reader discussions.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
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
      showAlert({
        title: "Discussion Published",
        message: "Your discussion has been shared with the community!",
        type: "success",
      });
      fetchDiscussions();
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.msg || "Failed to create discussion",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowToggle = async (e, reader) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "Sign in to follow fellow readers and connect with book lovers.",
        proceedText: "Proceed to login",
        cancelText: "Continue as guest",
      });
      return;
    }

    const isFollowing = reader.isFollowing;
    try {
      if (isFollowing) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/unfollow/${reader._id}`,
          {},
          { headers }
        );
        setReaders((prev) =>
          prev.map((r) =>
            r._id === reader._id
              ? {
                  ...r,
                  isFollowing: false,
                  followersCount: Math.max(0, (r.followersCount || 1) - 1),
                }
              : r
          )
        );
        showAlert({
          title: "Unfollowed",
          message: `You unfollowed ${reader.username}`,
          type: "info",
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/follow/${reader._id}`,
          {},
          { headers }
        );
        setReaders((prev) =>
          prev.map((r) =>
            r._id === reader._id
              ? {
                  ...r,
                  isFollowing: true,
                  followersCount: (r.followersCount || 0) + 1,
                }
              : r
          )
        );
        showAlert({
          title: "Following",
          message: `You are now following ${reader.username}!`,
          type: "success",
        });
      }
    } catch (err) {
      showAlert({
        title: "Action Failed",
        message: err.response?.data?.msg || "Failed to update follow status.",
        type: "error",
      });
    }
  };

  const handleOpenUserProfile = (username) => {
    setSelectedUsername(username);
    setProfileModalOpen(true);
  };

  const handleModalFollowChange = (userId, newFollowingStatus) => {
    setReaders((prev) =>
      prev.map((r) =>
        r._id === userId
          ? {
              ...r,
              isFollowing: newFollowingStatus,
              followersCount: newFollowingStatus
                ? (r.followersCount || 0) + 1
                : Math.max(0, (r.followersCount || 1) - 1),
            }
          : r
      )
    );
  };

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-zinc-900/40 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-800/60">
        <div>
          <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
            Community & Readers
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal">
            BookBasket Literary Circle
          </h1>
          <p className="text-zinc-400 font-light text-sm mt-1 max-w-xl">
            Connect with fellow readers, explore public shelves, follow literary tastes, and participate in thoughtful discussions.
          </p>
        </div>

        {activeTab === "DISCUSSIONS" && (
          <button
            onClick={handleOpenForm}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-6 py-3 rounded-full shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <FaPlus className="text-[10px]" />
            <span>New Discussion</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("DISCUSSIONS")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-light transition-all ${
            activeTab === "DISCUSSIONS"
              ? "bg-white text-zinc-950 font-medium shadow-md"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <FaComments className="text-xs" />
          <span>Discussions & Pulse</span>
        </button>

        <button
          onClick={() => setActiveTab("READERS")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-light transition-all ${
            activeTab === "READERS"
              ? "bg-white text-zinc-950 font-medium shadow-md"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <FaUsers className="text-xs" />
          <span>Fellow Readers ({readers.length})</span>
        </button>
      </div>

      {/* TAB 1: READERS SEARCH & DIRECTORY */}
      {activeTab === "READERS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search bar & Contextual Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
              <input
                type="text"
                placeholder="Search fellow readers by username..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-colors font-light"
              />
            </div>

            <div className="text-xs text-zinc-400 font-light flex items-center gap-1.5">
              {searchQuery.trim() ? (
                <span>
                  Search results for <strong className="text-white font-medium">"{searchQuery}"</strong> ({readers.length})
                </span>
              ) : isLoggedIn ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <FaBookOpen className="text-xs" />
                  <span>Showing readers with common book interests</span>
                </span>
              ) : (
                <span>Search by username or sign in to match shared libraries</span>
              )}
            </div>
          </div>

          {/* Readers Grid */}
          {loadingReaders ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <Loader onRetry={() => fetchReaders(searchQuery)} />
            </div>
          ) : readers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {readers.map((reader) => (
                <div
                  key={reader._id}
                  onClick={() => handleOpenUserProfile(reader.username)}
                  className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 p-6 rounded-3xl space-y-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={reader.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                        alt={reader.username}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-700 bg-zinc-950"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
                        }}
                      />
                      <div>
                        <h3 className="text-base font-serif text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-medium">
                          <span>{reader.username}</span>
                          {reader.role === "admin" && (
                            <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              Admin
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-light line-clamp-1 mt-0.5">
                          {reader.bio || "Avid reader"}
                        </p>
                      </div>
                    </div>

                    {/* Follow button */}
                    <button
                      onClick={(e) => handleFollowToggle(e, reader)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        reader.isFollowing
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                          : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm"
                      }`}
                    >
                      {reader.isFollowing ? (
                        <>
                          <FaUserCheck className="text-emerald-400 text-[10px]" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="text-[10px]" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Common books highlight if any */}
                  {reader.commonBooksCount > 0 && (
                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                        <span>✨</span>
                        <span>
                          {reader.commonBooksCount} shared {reader.commonBooksCount === 1 ? "book" : "books"} in library
                        </span>
                      </div>
                      {reader.commonBooks?.length > 0 && (
                        <p className="text-[10px] text-zinc-400 truncate font-light">
                          Shared: {reader.commonBooks.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer info: Followers + Library privacy badge */}
                  <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[11px] text-zinc-400 font-light">
                    <span>
                      <strong className="text-white font-medium">{reader.followersCount || 0}</strong> followers
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        reader.isLibraryPublic
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {reader.isLibraryPublic ? (
                        <>
                          <FaGlobe className="text-[9px]" /> Public Library
                        </>
                      ) : (
                        <>
                          <FaLock className="text-[9px]" /> Private
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-12 text-center rounded-3xl space-y-3">
              <FaUsers className="text-zinc-600 text-3xl mx-auto mb-2" />
              <h3 className="text-base font-serif text-zinc-300">
                {searchQuery.trim()
                  ? `No readers found matching "${searchQuery}"`
                  : "No readers with shared books found"}
              </h3>
              <p className="text-xs text-zinc-500 font-light max-w-md mx-auto">
                {searchQuery.trim()
                  ? "Try searching for a different username to find fellow book enthusiasts."
                  : isLoggedIn
                  ? "Add books to your library or favourites to discover fellow readers with matching literary interests, or search for any username above."
                  : "Sign in to discover fellow readers with matching books in their libraries, or search by username above."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISCUSSIONS */}
      {activeTab === "DISCUSSIONS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* New Discussion Form Modal/Card */}
          {showForm && (
            <form onSubmit={handleCreateDiscussion} className="bg-zinc-900/70 p-6 sm:p-8 rounded-3xl space-y-4 border border-zinc-800/80 animate-fadeIn">
              <h3 className="text-xl font-serif text-white font-normal">Start a New Discussion</h3>
              <input
                type="text"
                placeholder="Title (e.g. What book completely changed your worldview?)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-light"
              />
              <textarea
                rows="4"
                placeholder="Share your thoughts or question..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                  {submitting ? "Posting..." : "Post Discussion"}
                </button>
              </div>
            </form>
          )}

          {/* Discussions Feed */}
          {loadingDiscussions ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <Loader onRetry={fetchDiscussions} />
            </div>
          ) : discussions.length > 0 ? (
            <div className="space-y-4">
              {discussions.map((disc) => (
                <div key={disc._id} className="bg-zinc-900/40 hover:bg-zinc-900/70 p-6 rounded-3xl space-y-3 border border-zinc-800/60 transition-all">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => disc.author?.username && handleOpenUserProfile(disc.author.username)}
                    >
                      <img
                        src={disc.author?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                        alt={disc.author?.username || "Reader"}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
                        }}
                      />
                      <div>
                        <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                          {disc.author?.username || "Reader"}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-light">
                          <FaClock className="text-[9px]" /> {new Date(disc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {disc.book && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-light flex items-center gap-1 border border-emerald-500/20">
                        <FaBook className="text-[10px]" /> {disc.book.title}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-serif text-zinc-100 font-medium">{disc.title}</h3>
                  <p className="text-zinc-400 font-light text-sm leading-relaxed whitespace-pre-line">{disc.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-12 text-center text-zinc-500 font-light rounded-3xl">
              No community discussions yet. Click "New Discussion" to start the conversation!
            </div>
          )}
        </div>
      )}

      {/* Public Profile Modal */}
      <PublicProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        username={selectedUsername}
        onFollowChange={handleModalFollowChange}
      />
    </div>
  );
};

export default Community;
