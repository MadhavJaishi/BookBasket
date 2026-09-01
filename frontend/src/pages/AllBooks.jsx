import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BookCard from "../components/BookCard/BookCard";
import BookCardSkeleton from "../components/BookCard/BookCardSkeleton";
import { FaTimes, FaSearch, FaFilter } from "react-icons/fa";

const AllBooks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchFromUrl = searchParams.get("search") || searchParams.get("query") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const moodFromUrl = searchParams.get("mood") || "";

  const [searchInput, setSearchInput] = useState(searchFromUrl);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-all-books`
        );
        const books = response.data.data || [];
        setAllBooks(books);
      } catch (error) {
        console.error("Error fetching all books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  // Filter books dynamically whenever allBooks, searchFromUrl, categoryFromUrl, or moodFromUrl changes
  useEffect(() => {
    let result = [...allBooks];

    if (searchFromUrl.trim()) {
      const q = searchFromUrl.toLowerCase().trim();
      const words = q.split(/\s+/).filter((w) => w.length > 1);
      result = result.filter((book) => {
        const text = `${book.title} ${book.author} ${book.desc} ${book.genre} ${book.isbn}`.toLowerCase();
        return words.some((w) => text.includes(w));
      });
    }

    if (categoryFromUrl && categoryFromUrl !== "All" && categoryFromUrl !== "All categories") {
      const cat = categoryFromUrl.toLowerCase().trim();
      result = result.filter((book) => {
        const genreMatch = book.genre?.toLowerCase().includes(cat);
        const titleMatch = book.title?.toLowerCase().includes(cat);
        const descMatch = book.desc?.toLowerCase().includes(cat);
        return genreMatch || titleMatch || descMatch;
      });
    }

    if (moodFromUrl) {
      const moodMap = {
        learn: ["Non-Fiction", "Self-Help", "Psychology", "Business", "History", "Science", "Philosophy"],
        grow: ["Self-Help", "Personal Growth", "Psychology", "Productivity", "Mindfulness"],
        emotional: ["Fiction", "Romance", "Drama", "Memoir", "Poetry", "Literary Fiction"],
        perspective: ["Philosophy", "Sociology", "Biography", "History", "Non-Fiction", "Culture"],
        inspired: ["Biography", "Inspirational", "Entrepreneurship", "Success", "Business"],
        challenging: ["Philosophy", "Classics", "Sci-Fi", "Science", "Complex Fiction"],
        relaxing: ["Fiction", "Cozy", "Fantasy", "Humor", "Graphic Novel", "Young Adult"],
      };

      const targetGenres = (moodMap[moodFromUrl.toLowerCase()] || []).map((g) => g.toLowerCase());
      if (targetGenres.length > 0) {
        result = result.filter((book) => {
          const bg = (book.genre || "").toLowerCase();
          const bd = (book.desc || "").toLowerCase();
          return targetGenres.some((tg) => bg.includes(tg) || bd.includes(tg));
        });
      }
    }

    setFilteredBooks(result);
  }, [allBooks, searchFromUrl, categoryFromUrl, moodFromUrl]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchInput(text);

    const params = new URLSearchParams(searchParams);
    if (text.trim()) {
      params.set("search", text.trim());
    } else {
      params.delete("search");
    }
    navigate(`/all-books?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setSearchInput("");
    navigate("/all-books");
  };

  const hasActiveFilters = searchFromUrl || (categoryFromUrl && categoryFromUrl !== "All" && categoryFromUrl !== "All categories");

  return (
    <div className="bg-zinc-950 text-white min-h-screen px-4 md:px-12 py-8">
      {/* Header & Local Search Input */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-zinc-900/80 p-6 rounded-xl border border-zinc-800 shadow-xl mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            {categoryFromUrl && categoryFromUrl !== "All"
              ? `${categoryFromUrl} Books`
              : searchFromUrl
              ? `Search Results`
              : "All Books Catalog"}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 font-medium">
            Discover {filteredBooks.length} titles available in our store.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3.5 top-3 text-zinc-400 text-sm" />
            <input
              type="text"
              placeholder="Filter by title, author, or genre..."
              value={searchInput}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
            <FaFilter className="text-emerald-400 text-[10px]" /> Active Filters:
          </span>

          {searchFromUrl && (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              Query: "{searchFromUrl}"
            </span>
          )}

          {categoryFromUrl && categoryFromUrl !== "All" && (
            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              Category: {categoryFromUrl}
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-xs text-red-400 hover:text-red-300 font-bold ml-2 underline flex items-center gap-1"
          >
            <FaTimes /> Clear All
          </button>
        </div>
      )}

      {/* Loading Skeleton View */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8">
          <BookCardSkeleton count={8} />
        </div>
      )}

      {/* Filtered Books Grid */}
      {!loading && filteredBooks.length > 0 && (
        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book, i) => (
            <div key={book._id || i}>
              <BookCard data={book} />
            </div>
          ))}
        </div>
      )}

      {/* No Books Found State */}
      {!loading && filteredBooks.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center my-12 flex flex-col items-center justify-center gap-4">
          <h3 className="text-2xl font-bold text-zinc-300">No books found matching your criteria</h3>
          <p className="text-zinc-500 text-sm max-w-md">
            Try adjusting your search terms or clearing the current category filters.
          </p>
          <button
            onClick={clearFilters}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-md shadow-emerald-600/20"
          >
            Show All Books
          </button>
        </div>
      )}
    </div>
  );
};

export default AllBooks;
