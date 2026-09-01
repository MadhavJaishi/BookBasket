import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../Loader/Loader";
import OptimizedImage from "../Image/OptimizedImage";
import BookCard from "../BookCard/BookCard";
import { GrLanguage } from "react-icons/gr";
import {
  FaHeart,
  FaShoppingCart,
  FaEdit,
  FaBookOpen,
  FaBuilding,
  FaCalendarAlt,
  FaBarcode,
  FaStar,
  FaCheck,
  FaBookmark,
  FaThumbsUp,
  FaShareAlt,
} from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBooks } from "../../store/bookSlice";
import { fetchMyLibrary } from "../../store/librarySlice";

const REACTION_OPTIONS = [
  "💡 Changed how I think",
  "🧠 Learned something",
  "❤️ Emotional",
  "🔥 Motivating",
  "🤯 Mind-blowing",
  "😴 Slow but worthwhile",
  "😂 Entertaining",
  "🌱 Personally meaningful",
];

const BookDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [Data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  // Reading status & progress state
  const [readingStatus, setReadingStatus] = useState(null); // WANT_TO_READ, CURRENTLY_READING, FINISHED
  const [currentPage, setCurrentPage] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Review & Rating state
  const [reviewsData, setReviewsData] = useState({ reviews: [], avgRating: 0, totalReviews: 0, reactionCounts: {} });
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState("");
  const [selectedReactions, setSelectedReactions] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recommendations state
  const [similarBooks, setSimilarBooks] = useState([]);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: id,
  };

  useEffect(() => {
    const fetchBookAndReadingData = async () => {
      try {
        setLoading(true);
        // 1. Fetch book details
        const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-book-details/${id}`);
        const bookData = resp.data.data;
        setData(bookData);

        if (bookData) {
          const initialImg = bookData.images && bookData.images.length > 0 ? bookData.images[0] : bookData.url;
          setSelectedImage(initialImg);
        }

        // 2. Fetch reviews
        const revRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/book/${id}`);
        setReviewsData(revRes.data.data || { reviews: [], avgRating: 0, totalReviews: 0, reactionCounts: {} });

        // 3. Fetch user library status if logged in
        if (isLoggedIn) {
          const libRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reading/my-library`, { headers });
          const rawEntries = libRes.data.raw || [];
          const match = rawEntries.find((entry) => String(entry.book?._id || entry.book) === String(id));
          if (match) {
            setReadingStatus(match.status);
            setCurrentPage(match.currentPage || 0);
          } else {
            setReadingStatus(null);
          }
        }

        // 4. Fetch recommendations / similar books
        const simRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/discovery/recommendations`);
        setSimilarBooks(simRes.data.data || []);
      } catch (err) {
        console.error("Error fetching book details page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndReadingData();
  }, [id, isLoggedIn]);

  const handleUpdateReadingStatus = async (newStatus) => {
    if (!isLoggedIn) {
      alert("Please sign in to track your reading.");
      navigate("/login");
      return;
    }

    try {
      setUpdatingProgress(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reading/status`,
        {
          bookId: id,
          status: newStatus,
          currentPage: newStatus === "FINISHED" ? Data.pageCount || 300 : currentPage,
          totalPages: Data.pageCount || 300,
        },
        { headers }
      );
      setReadingStatus(newStatus);
      if (newStatus === "FINISHED") {
        setCurrentPage(Data.pageCount || 300);
      }
      dispatch(fetchMyLibrary());
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update reading status");
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleProgressChange = async (newPageVal) => {
    const val = Number(newPageVal);
    setCurrentPage(val);
    if (!isLoggedIn) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/reading/progress`,
        {
          bookId: id,
          currentPage: val,
        },
        { headers }
      );
    } catch (err) {
      console.error("Failed to sync progress:", err);
    }
  };

  const toggleReaction = (reaction) => {
    if (selectedReactions.includes(reaction)) {
      setSelectedReactions(selectedReactions.filter((r) => r !== reaction));
    } else {
      setSelectedReactions([...selectedReactions, reaction]);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please sign in to post a review.");
      navigate("/login");
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reviews`,
        {
          bookId: id,
          rating: userRating,
          text: userReviewText,
          reactions: selectedReactions,
        },
        { headers }
      );
      alert(res.data.msg);
      setUserReviewText("");

      // Refresh reviews
      const revRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/book/${id}`);
      setReviewsData(revRes.data.data || { reviews: [], avgRating: 0, totalReviews: 0, reactionCounts: {} });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (!isLoggedIn) {
      alert("Please sign in to add books to cart.");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/add-book-to-cart`, {}, { headers });
      alert(response.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  const deleteBook = async () => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-book`, { headers });
      alert(response.data.msg);
      dispatch(fetchBooks());
      navigate("/all-books");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete book");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!Data) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <h2 className="text-3xl font-semibold mb-4">Book Not Found</h2>
        <Link to="/all-books" className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-xl font-bold">
          Back to All Books
        </Link>
      </div>
    );
  }

  const allImages = Array.from(new Set([Data.url, ...(Array.isArray(Data.images) ? Data.images : [])].filter(Boolean)));
  const totalPageLimit = Data.pageCount || 300;
  const progressPercentage = Math.min(100, Math.round((currentPage / totalPageLimit) * 100));

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-12">
      {/* Upper Grid: Cover + Book Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery & Cover (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl relative shadow-2xl flex flex-col items-center">
            <div className="h-[45vh] lg:h-[52vh] w-full flex items-center justify-center overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage || Data.url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <OptimizedImage
                    src={selectedImage || Data.url}
                    alt={Data.title}
                    className="h-full w-full rounded-xl shadow-lg"
                    containerClassName="h-full w-full rounded-xl"
                    objectFit="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail Selector */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto mt-4 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800 w-full scrollbar-thin">
                {allImages.map((imgUrl, index) => {
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative flex-shrink-0 w-14 h-18 rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected ? "border-amber-400 scale-105 shadow-md" : "border-zinc-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <OptimizedImage src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Tools if Admin */}
          {isLoggedIn && role === "admin" && (
            <div className="flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-zinc-400">Admin Actions:</span>
              <div className="flex gap-2">
                <Link
                  to={`/update-book/${id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-700"
                >
                  <FaEdit /> Edit Book
                </Link>
                <button
                  onClick={deleteBook}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-500/30"
                >
                  <MdDeleteOutline /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Title, Metadata, Reading Tracker & Purchase (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Header Title & Author */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Data.genre && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-semibold text-xs rounded-full border border-amber-500/20">
                  {Data.genre}
                </span>
              )}
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full flex items-center gap-1">
                <FaStar className="text-amber-400 text-xs" />
                {reviewsData.avgRating > 0 ? `${reviewsData.avgRating} / 5` : "New"}
                <span className="text-zinc-500">({reviewsData.totalReviews} reviews)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">{Data.title}</h1>
            <p className="text-zinc-400 mt-2 text-lg font-medium">
              By <span className="text-zinc-200 font-semibold">{Data.author}</span>
            </p>
          </div>

          {/* Reading Tracker Status Selector Card */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <FaBookmark /> Personal Reading Tracker
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUpdateReadingStatus("WANT_TO_READ")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  readingStatus === "WANT_TO_READ"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                }`}
              >
                {readingStatus === "WANT_TO_READ" && <FaCheck />} + Want to Read
              </button>

              <button
                onClick={() => handleUpdateReadingStatus("CURRENTLY_READING")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  readingStatus === "CURRENTLY_READING"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                }`}
              >
                {readingStatus === "CURRENTLY_READING" && <FaCheck />} Currently Reading
              </button>

              <button
                onClick={() => handleUpdateReadingStatus("FINISHED")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  readingStatus === "FINISHED"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                }`}
              >
                {readingStatus === "FINISHED" && <FaCheck />} Finished
              </button>
            </div>

            {/* Interactive Progress Bar if Currently Reading */}
            {readingStatus === "CURRENTLY_READING" && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Reading Progress:</span>
                  <span className="text-blue-400 font-mono font-bold">
                    {progressPercentage}% &bull; Page {currentPage} / {totalPageLimit}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={totalPageLimit}
                  value={currentPage}
                  onChange={(e) => handleProgressChange(e.target.value)}
                  className="w-full accent-blue-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* E-Commerce Bookstore Purchase Card */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-zinc-400 block uppercase font-bold tracking-wider">Bookstore Price</span>
              <span className="text-3xl font-extrabold text-amber-400 font-serif">&#8377; {Data.price}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={addToCart}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-4 py-3 rounded-xl text-xs border border-zinc-700 transition-all flex items-center gap-2"
              >
                <FaShoppingCart className="text-amber-400" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-5 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col">
              <span className="text-zinc-500 text-[11px] font-semibold flex items-center gap-1">
                <GrLanguage /> Language
              </span>
              <span className="text-zinc-200 font-medium text-xs mt-1">{Data.language || "English"}</span>
            </div>

            {Data.publisher && (
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col">
                <span className="text-zinc-500 text-[11px] font-semibold flex items-center gap-1">
                  <FaBuilding /> Publisher
                </span>
                <span className="text-zinc-200 font-medium text-xs mt-1 truncate" title={Data.publisher}>
                  {Data.publisher}
                </span>
              </div>
            )}

            {Data.publishedDate && (
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col">
                <span className="text-zinc-500 text-[11px] font-semibold flex items-center gap-1">
                  <FaCalendarAlt /> Published
                </span>
                <span className="text-zinc-200 font-medium text-xs mt-1">{Data.publishedDate}</span>
              </div>
            )}

            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col">
              <span className="text-zinc-500 text-[11px] font-semibold flex items-center gap-1">
                <FaBookOpen /> Length
              </span>
              <span className="text-zinc-200 font-medium text-xs mt-1">{Data.pageCount || 300} pages</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80">
            <h3 className="text-zinc-200 font-semibold text-sm mb-2 font-serif">About this book</h3>
            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{Data.desc}</p>
          </div>
        </div>
      </div>

      {/* Structured Reviews & Reader Reactions Section */}
      <section className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <FaStar className="text-amber-400" /> Reader Reviews & Reflections
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            See what other readers learned, felt, and thought about this book.
          </p>
        </div>

        {/* Reaction Breakdown Pills */}
        {Object.keys(reviewsData.reactionCounts || {}).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium mr-2">Top Reader Reactions:</span>
            {Object.entries(reviewsData.reactionCounts).map(([reaction, count]) => (
              <span
                key={reaction}
                className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs px-3 py-1 rounded-full font-medium"
              >
                {reaction} ({count})
              </span>
            ))}
          </div>
        )}

        {/* Post a Review Form */}
        <form onSubmit={handleSubmitReview} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 font-serif">Leave your review & reaction</h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setUserRating(star)}
                className="text-xl transition-transform hover:scale-125"
              >
                <FaStar className={star <= userRating ? "text-amber-400" : "text-zinc-700"} />
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium block mb-2">Select Reaction Badges (Optional):</label>
            <div className="flex flex-wrap gap-2">
              {REACTION_OPTIONS.map((r) => {
                const isSelected = selectedReactions.includes(r);
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => toggleReaction(r)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-md"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            rows="3"
            placeholder="What did you think of this book? (Share your key takeaways or thoughts...)"
            value={userReviewText}
            onChange={(e) => setUserReviewText(e.target.value)}
            className="w-full bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={submittingReview}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4 pt-2">
          {reviewsData.reviews.length > 0 ? (
            reviewsData.reviews.map((rev) => (
              <div key={rev._id} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.user?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                      alt={rev.user?.username || "User"}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <span className="text-sm font-bold text-zinc-200">{rev.user?.username || "Anonymous Reader"}</span>
                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {Array.isArray(rev.reactions) && rev.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.reactions.map((r, idx) => (
                      <span key={idx} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {rev.text && <p className="text-zinc-300 text-sm leading-relaxed">{rev.text}</p>}
              </div>
            ))
          ) : (
            <div className="text-center text-zinc-500 text-sm py-4">
              No written reviews yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>

      {/* Similar Books Section */}
      {similarBooks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold font-serif text-white mb-6">Similar & Recommended Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarBooks.slice(0, 4).map((book) => (
              <BookCard key={book._id} data={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetails;
