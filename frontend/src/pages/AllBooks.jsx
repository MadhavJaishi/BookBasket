import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BookCard from "../components/BookCard/BookCard";
import BookCardSkeleton from "../components/BookCard/BookCardSkeleton";
import { FaTimes, FaSearch, FaPlus, FaCheck, FaMagic } from "react-icons/fa";
import { MOOD_CATEGORIES, ALL_GENRES } from "../utils/filterPresets";

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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeMoodKey, setActiveMoodKey] = useState(moodFromUrl);
  const [showMoodDrawer, setShowMoodDrawer] = useState(false);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  // Synchronize category and mood from URL or localStorage into selectedCategories array
  useEffect(() => {
    let cats = [];
    let moodKey = "";

    if (moodFromUrl) {
      moodKey = moodFromUrl;
      setActiveMoodKey(moodFromUrl);
      const matchedMood = MOOD_CATEGORIES.find((m) => m.key === moodFromUrl.toLowerCase());
      if (matchedMood && matchedMood.genres) {
        cats = [...matchedMood.genres];
      }
    } else {
      setActiveMoodKey("");
    }

    if (categoryFromUrl && categoryFromUrl !== "All" && categoryFromUrl !== "All categories") {
      const parsed = categoryFromUrl
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      // Merge unique
      cats = Array.from(new Set([...cats, ...parsed]));
    }

    // If no filter query parameters are present in URL, restore from localStorage
    if (!categoryFromUrl && !moodFromUrl) {
      try {
        const savedCats = localStorage.getItem("bookbasket_selected_categories");
        const savedMood = localStorage.getItem("bookbasket_active_mood");
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cats = parsed;
          }
        }
        if (savedMood) {
          moodKey = savedMood;
          setActiveMoodKey(savedMood);
        }
      } catch (e) {
        console.error("Error reading saved categories:", e);
      }
    }

    setSelectedCategories(cats);
    if (cats.length > 0) {
      localStorage.setItem("bookbasket_selected_categories", JSON.stringify(cats));
      if (moodKey) {
        localStorage.setItem("bookbasket_active_mood", moodKey);
      } else {
        localStorage.removeItem("bookbasket_active_mood");
      }
    }
  }, [categoryFromUrl, moodFromUrl]);

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

  // Multi-select and Search filtering logic
  useEffect(() => {
    let result = [...allBooks];

    // 1. Text Search Filter
    if (searchFromUrl.trim()) {
      const q = searchFromUrl.toLowerCase().trim();
      const words = q.split(/\s+/).filter((w) => w.length > 1);
      result = result.filter((book) => {
        const text = `${book.title} ${book.author} ${book.desc} ${book.genre} ${book.isbn}`.toLowerCase();
        return words.some((w) => text.includes(w));
      });
    }

    // 2. Multi-Select Genre / Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((book) => {
        const bookGenre = (book.genre || "").toLowerCase();
        const bookDesc = (book.desc || "").toLowerCase();
        const bookTitle = (book.title || "").toLowerCase();

        return selectedCategories.some((cat) => {
          const c = cat.toLowerCase().trim();
          return bookGenre.includes(c) || bookDesc.includes(c) || bookTitle.includes(c);
        });
      });
    }

    setFilteredBooks(result);
  }, [allBooks, searchFromUrl, selectedCategories]);

  // Update URL search parameters
  const updateUrlParams = (newCats = selectedCategories, newMood = activeMoodKey, newSearch = searchInput) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    }
    if (newCats.length > 0) {
      params.set("category", newCats.join(","));
    }
    if (newMood) {
      params.set("mood", newMood);
    }
    const queryString = params.toString();
    navigate(queryString ? `/all-books?${queryString}` : "/all-books", { replace: true });
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchInput(text);

    const params = new URLSearchParams(searchParams);
    if (text.trim()) {
      params.set("search", text.trim());
    } else {
      params.delete("search");
    }
    navigate(params.toString() ? `/all-books?${params.toString()}` : "/all-books", { replace: true });
  };

  // Toggle single category in multi-select
  const toggleCategory = (cat) => {
    if (cat === "All") {
      setSelectedCategories([]);
      setActiveMoodKey("");
      try {
        localStorage.removeItem("bookbasket_selected_categories");
        localStorage.removeItem("bookbasket_active_mood");
      } catch (e) {
        console.error(e);
      }
      updateUrlParams([], "", searchInput);
      return;
    }

    let updated;
    if (selectedCategories.includes(cat)) {
      updated = selectedCategories.filter((c) => c !== cat);
    } else {
      updated = [...selectedCategories, cat];
    }
    setSelectedCategories(updated);
    setActiveMoodKey("");
    try {
      localStorage.removeItem("bookbasket_active_mood");
      if (updated.length > 0) {
        localStorage.setItem("bookbasket_selected_categories", JSON.stringify(updated));
      } else {
        localStorage.removeItem("bookbasket_selected_categories");
      }
    } catch (e) {
      console.error(e);
    }
    updateUrlParams(updated, "", searchInput);
  };

  // Select a preset Mood
  const handleSelectMood = (mood) => {
    if (activeMoodKey === mood.key) {
      // Deselect mood
      setActiveMoodKey("");
      setSelectedCategories([]);
      try {
        localStorage.removeItem("bookbasket_selected_categories");
        localStorage.removeItem("bookbasket_active_mood");
      } catch (e) {
        console.error(e);
      }
      updateUrlParams([], "", searchInput);
    } else {
      setActiveMoodKey(mood.key);
      const moodGenres = mood.genres || [];
      setSelectedCategories(moodGenres);
      try {
        localStorage.setItem("bookbasket_selected_categories", JSON.stringify(moodGenres));
        localStorage.setItem("bookbasket_active_mood", mood.key);
      } catch (e) {
        console.error(e);
      }
      updateUrlParams(moodGenres, mood.key, searchInput);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSelectedCategories([]);
    setActiveMoodKey("");
    try {
      localStorage.removeItem("bookbasket_selected_categories");
      localStorage.removeItem("bookbasket_active_mood");
    } catch (e) {
      console.error(e);
    }
    navigate("/all-books");
  };

  // Divide into selected (in stillness) and unselected (in scrolling marquee)
  const unselectedCategories = useMemo(() => {
    return ALL_GENRES.filter((g) => !selectedCategories.includes(g));
  }, [selectedCategories]);

  // Duplicate unselected items for seamless looping marquee
  const marqueeItems = useMemo(() => {
    return [...unselectedCategories, ...unselectedCategories, ...unselectedCategories];
  }, [unselectedCategories]);

  const activeMoodObj = MOOD_CATEGORIES.find((m) => m.key === activeMoodKey);

  // Dynamic Title description based on active selection
  const titleText = useMemo(() => {
    if (searchFromUrl) return `Search: "${searchFromUrl}"`;
    if (activeMoodObj) return `Mood: ${activeMoodObj.label}`;
    if (selectedCategories.length === 1) return `${selectedCategories[0]} Collection`;
    if (selectedCategories.length > 1) {
      return selectedCategories.length <= 3
        ? `${selectedCategories.join(" & ")}`
        : `${selectedCategories.slice(0, 2).join(", ")} & ${selectedCategories.length - 2} more`;
    }
    return "The Complete Catalog";
  }, [searchFromUrl, activeMoodObj, selectedCategories]);

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Editorial Title Banner */}
      <div className="bg-zinc-900/40 rounded-3xl p-8 sm:p-10 border border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block">
              Curated Literature
            </span>
            {activeMoodObj && (
              <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border ${activeMoodObj.badgeColor}`}>
                {activeMoodObj.label}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
            {titleText}
          </h1>
          <p className="text-zinc-400 font-light text-sm mt-1 max-w-xl">
            Explore {filteredBooks.length} handpicked {filteredBooks.length === 1 ? "title" : "titles"} across transformative genres, modern fiction, and timeless classics.
          </p>
        </div>

        {/* Search Bar in Banner */}
        <div className="relative z-10 w-full md:w-80">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
            <input
              type="text"
              placeholder="Search title, author, genre..."
              value={searchInput}
              onChange={handleInputChange}
              className="w-full bg-zinc-950/90 border border-zinc-800 rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-colors font-light shadow-inner"
            />
            {searchInput && (
              <button
                onClick={() => handleInputChange({ target: { value: "" } })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <FaTimes className="text-[10px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mood Selector Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-light tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span>✨</span> Explore By Mood:
          </span>
          {activeMoodKey && (
            <button
              onClick={() => handleSelectMood(activeMoodObj)}
              className="text-[11px] text-zinc-400 hover:text-white underline font-light"
            >
              Clear mood selection
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MOOD_CATEGORIES.map((mood) => {
            const Icon = mood.icon;
            const isMoodActive = activeMoodKey === mood.key;

            return (
              <button
                key={mood.key}
                onClick={() => handleSelectMood(mood)}
                className={`px-3.5 py-2 rounded-full text-xs font-light transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isMoodActive
                    ? "bg-emerald-500 text-zinc-950 font-medium shadow-md shadow-emerald-950/40"
                    : `bg-zinc-900/60 text-zinc-400 ${mood.bg} border border-zinc-800/80`
                }`}
              >
                <Icon className={`text-xs ${isMoodActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Filter Marquee with Stillness Section */}
      <div className="relative border-y border-zinc-800/80 py-3.5 bg-zinc-950/40 rounded-2xl overflow-hidden flex items-center">
        {/* Pinned Stillness Section (Selected Pills + All Button) */}
        <div className="flex items-center gap-2 px-3 shrink-0 z-20 bg-zinc-950/95 backdrop-blur-md max-w-[45%] md:max-w-[50%]">
          {/* 'All' Button */}
          <button
            onClick={() => toggleCategory("All")}
            className={`px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
              selectedCategories.length === 0
                ? "bg-white text-zinc-950 font-medium shadow-md"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            All
          </button>

          {/* Scrollable Container for Selected Categories in Stillness */}
          {selectedCategories.length > 0 && (
            <div
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-md shrink-0 transition-all active:scale-95 group whitespace-nowrap"
                  title={`Click to remove ${cat} filter`}
                >
                  <span>{cat}</span>
                  <FaTimes className="text-[9px] opacity-60 group-hover:opacity-100 text-zinc-950" />
                </button>
              ))}
            </div>
          )}

          {selectedCategories.length > 0 && (
            <button
              onClick={() => toggleCategory("All")}
              className="text-[11px] text-red-400 hover:text-red-300 font-light underline shrink-0 px-1 whitespace-nowrap"
              title="Clear all selected filters"
            >
              Clear All
            </button>
          )}

          {/* Separator Line */}
          <div className="h-6 w-[1px] bg-zinc-800 shrink-0 mx-1" />
        </div>

        {/* Scrolling Marquee of Unselected Categories */}
        <div className="flex-1 overflow-hidden relative group">
          {/* Subtle edge fade gradient */}
          <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-zinc-950/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#08090a] to-transparent z-10 pointer-events-none" />

          <div
            className="animate-marquee flex items-center gap-2.5 hover:[animation-play-state:paused]"
            style={{ animationDuration: "35s" }}
          >
            {marqueeItems.map((cat, idx) => (
              <button
                key={`${cat}-${idx}`}
                onClick={() => toggleCategory(cat)}
                className="bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700 px-3.5 py-1.5 rounded-full text-xs font-light transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 group/pill cursor-pointer"
                title={`Click to add ${cat} to filters`}
              >
                <span>{cat}</span>
                <span className="text-[10px] text-zinc-500 group-hover/pill:text-emerald-400 font-bold">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton View */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-6">
          <BookCardSkeleton count={8} />
        </div>
      )}

      {/* Filtered Books Grid */}
      {!loading && filteredBooks.length > 0 && (
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.filter(Boolean).map((book, i) => (
            <div key={book._id || i}>
              <BookCard data={book} />
            </div>
          ))}
        </div>
      )}

      {/* No Books Found State */}
      {!loading && filteredBooks.length === 0 && (
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-12 text-center my-8 flex flex-col items-center justify-center gap-4">
          <h3 className="text-2xl font-serif text-white font-normal">No titles match your criteria</h3>
          <p className="text-zinc-400 font-light text-xs max-w-md">
            Try adjusting your search query, selecting different genres, or clearing active mood presets.
          </p>
          <button
            onClick={clearFilters}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95"
          >
            View Entire Catalog
          </button>
        </div>
      )}
    </div>
  );
};

export default AllBooks;
