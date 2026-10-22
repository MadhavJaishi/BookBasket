import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BookCard from "../BookCard/BookCard";
import BookCardSkeleton from "../BookCard/BookCardSkeleton";
import { FaFire, FaArrowRight } from "react-icons/fa";

const MostSearchedBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [displayBooks, setDisplayBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Fiction", "Non-Fiction", "Bestsellers"];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-all-books`
        );
        const books = resp.data.data || [];
        setAllBooks(books);
        setDisplayBooks(books.slice(0, 8));
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setDisplayBooks(allBooks.slice(0, 8));
    } else {
      const catLower = cat.toLowerCase();
      const filtered = allBooks.filter(
        (b) =>
          b.genre?.toLowerCase().includes(catLower) ||
          b.title?.toLowerCase().includes(catLower) ||
          b.desc?.toLowerCase().includes(catLower)
      );
      setDisplayBooks(filtered.slice(0, 8));
    }
  };

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header & Interactive Category Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <FaFire /> Trending Collection
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Most Popular & Recent Books
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <BookCardSkeleton count={4} />
        </div>
      )}

      {/* Book Grid */}
      {!loading && displayBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {displayBooks.map((book, i) => (
            <div key={book._id || i}>
              <BookCard data={book} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && displayBooks.length === 0 && (
        <div className="text-center py-12 text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800">
          No books found in this category.
        </div>
      )}

      {/* View All Footer CTA */}
      <div className="mt-10 text-center">
        <Link
          to="/all-books"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
        >
          <span>View Full Catalog ({allBooks.length} Books)</span>
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </div>
  );
};

export default MostSearchedBooks;
