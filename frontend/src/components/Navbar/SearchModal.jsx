import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FaSearch,
  FaBook,
  FaChevronRight,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import { fetchBooks } from "../../store/bookSlice";

const getOptimizedUrl = (url) => {
  if (!url) return "";
  if (
    url.includes("covers.openlibrary.org") ||
    (url.startsWith("http") && !url.includes("wsrv.nl"))
  ) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=120&output=webp&q=80`;
  }
  return url;
};

const BookThumbnail = ({ url, title, isSelected }) => {
  const [imgSrc, setImgSrc] = useState(() => getOptimizedUrl(url));
  const [hasError, setHasError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    setImgSrc(getOptimizedUrl(url));
    setHasError(false);
    setFallbackAttempted(false);
  }, [url]);

  const handleImgError = () => {
    if (!fallbackAttempted && url && imgSrc !== url) {
      setFallbackAttempted(true);
      setImgSrc(url);
    } else {
      setHasError(true);
    }
  };

  if (!url || hasError) {
    return (
      <div
        className={`w-10 h-13 rounded-md flex flex-col items-center justify-center shrink-0 border transition-colors ${
          isSelected
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            : "bg-zinc-900 text-zinc-400 border-zinc-800"
        }`}
      >
        <FaBook className="text-xs mb-0.5" />
        <span className="text-[7px] font-bold uppercase tracking-tighter text-zinc-500 line-clamp-1 px-0.5">
          {title ? title.slice(0, 3) : "BK"}
        </span>
      </div>
    );
  }

  return (
    <div className="w-10 h-13 rounded-md overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 shadow-sm relative flex items-center justify-center">
      <img
        src={imgSrc}
        alt={title || "Book cover"}
        onError={handleImgError}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const SearchModal = ({ isOpen, onClose, initialQuery = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const modalRef = useRef(null);

  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localBooks, setLocalBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const reduxBooks = useSelector((state) => state.bookList.books) || [];
  const allBooks = reduxBooks.length > 0 ? reduxBooks : localBooks;

  // Close modal when clicking/touching anywhere outside the modal card
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Lock background body scroll when modal is open so underlying page doesn't scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Fetch books if not already loaded in store
  useEffect(() => {
    if (isOpen && allBooks.length === 0) {
      setLoading(true);
      dispatch(fetchBooks());
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/get-all-books`)
        .then((res) => {
          if (res.data?.data) {
            setLocalBooks(res.data.data);
          }
        })
        .catch((err) => console.error("Error loading books in search modal:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, allBooks.length, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Compute matched books based on title, author, category/genre, description, language, publisher, ISBN
  const matchedBooks = useMemo(() => {
    const rawQuery = query.trim();
    const q = rawQuery.toLowerCase();

    // Do not show any books until at least one letter is entered
    if (!q) {
      return [];
    }

    const searchTokens = q.split(/\s+/).filter(Boolean);
    const scoredBooks = [];

    allBooks.forEach((book) => {
      const title = (book.title || "").toLowerCase();
      const author = (book.author || "").toLowerCase();
      const genre = (book.genre || "").toLowerCase();
      const desc = (book.desc || "").toLowerCase();
      const language = (book.language || "").toLowerCase();
      const publisher = (book.publisher || "").toLowerCase();
      const isbn = (book.isbn || "").toLowerCase();

      let score = 0;
      let matchReason = "";

      // Exact & substring title matches
      if (title === q) {
        score += 150;
        matchReason = "Exact Title";
      } else if (title.startsWith(q)) {
        score += 100;
        matchReason = "Title Match";
      } else if (title.includes(q)) {
        score += 75;
        matchReason = "Title Match";
      }

      // Author matches
      if (author === q) {
        score += 90;
        matchReason = matchReason || "Author Match";
      } else if (author.includes(q)) {
        score += 70;
        matchReason = matchReason || "Author Match";
      }

      // Category / Genre matches
      if (genre.includes(q)) {
        score += 65;
        matchReason = matchReason || `Category: ${book.genre}`;
      }

      // ISBN matches
      if (isbn && isbn.includes(q)) {
        score += 60;
        matchReason = matchReason || `ISBN: ${book.isbn}`;
      }

      // Publisher matches
      if (publisher && publisher.includes(q)) {
        score += 50;
        matchReason = matchReason || `Publisher: ${book.publisher}`;
      }

      // Language matches
      if (language && language.includes(q)) {
        score += 45;
        matchReason = matchReason || `Language: ${book.language}`;
      }

      // Description matches
      if (desc.includes(q)) {
        score += 30;
        matchReason = matchReason || "Found in Description";
      }

      // Token-based matching (for multi-word queries like "fiction harry" or "french psychology")
      if (score === 0 && searchTokens.length > 1) {
        const fullSearchString = `${title} ${author} ${genre} ${language} ${publisher} ${isbn} ${desc}`;
        const allTokensMatch = searchTokens.every((token) => fullSearchString.includes(token));

        if (allTokensMatch) {
          score += 55;
          matchReason = "Keyword Match";
        }
      }

      if (score > 0) {
        scoredBooks.push({
          ...book,
          score,
          matchReason,
        });
      }
    });

    // Sort by relevance score
    scoredBooks.sort((a, b) => b.score - a.score);
    return scoredBooks;
  }, [query, allBooks]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [matchedBooks.length, query]);

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        matchedBooks.length > 0 ? (prev + 1) % matchedBooks.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        matchedBooks.length > 0
          ? (prev - 1 + matchedBooks.length) % matchedBooks.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matchedBooks.length > 0 && matchedBooks[selectedIndex]) {
        navigate(`/view-book-details/${matchedBooks[selectedIndex]._id}`);
        onClose();
      } else if (query.trim()) {
        navigate(`/all-books?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/view-book-details/${bookId}`);
    onClose();
  };

  // Helper to highlight matching text in search results
  const highlightMatch = (text, highlight) => {
    if (!text) return "";
    if (!highlight || !highlight.trim()) return text;

    const tokens = highlight.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return text;

    const pattern = `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`;
    const regex = new RegExp(pattern, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      tokens.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
        <span
          key={i}
          className="text-emerald-400 font-semibold underline decoration-emerald-500/50 underline-offset-2"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/80 backdrop-blur-md transition-all select-none sm:select-auto cursor-pointer"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0c0d0e] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[82vh] cursor-default"
          >
            {/* Top Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/90 gap-3 bg-[#0c0d0e] shrink-0">
              <FaSearch className="text-zinc-400 text-base shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by book name, author, genre, language, publisher, or ISBN..."
                className="bg-transparent text-white text-base sm:text-lg focus:outline-none w-full placeholder-zinc-500 font-light"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Clear"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-700/80 rounded hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                esc
              </button>
            </div>

            {/* Results Section Header */}
            {query.trim() && (
              <div className="px-4 py-2 bg-zinc-950/60 border-b border-zinc-800/60 flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-400 uppercase shrink-0">
                <span>Books ({matchedBooks.length})</span>
                <span className="text-zinc-500 font-normal normal-case text-xs">
                  Searching by title, author, category, language & ISBN
                </span>
              </div>
            )}

            {/* Scrollable Results Body */}
            <div
              ref={listRef}
              className="overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5 max-h-[58vh] scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#27272a transparent",
              }}
            >
              {!query.trim() ? (
                /* Initial prompt state when no letter is entered yet */
                <div className="py-14 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                    <FaSearch className="text-sm text-zinc-400" />
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1">
                    Search BookBasket
                  </h4>
                  <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                    Type at least one letter to search books by title, author, category, language, publisher, or ISBN.
                  </p>
                </div>
              ) : loading && matchedBooks.length === 0 ? (
                /* Loading State */
                <div className="py-12 px-4 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-zinc-400 text-xs">Loading books...</p>
                </div>
              ) : matchedBooks.length === 0 ? (
                /* Empty state when query yields no results */
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                    <FaSearch className="text-base" />
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1">
                    No books found for &ldquo;{query}&rdquo;
                  </h4>
                  <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-4">
                    No matching book titles, authors, categories, languages, publishers, or ISBNs found.
                  </p>
                  <button
                    onClick={() => {
                      navigate(`/all-books?search=${encodeURIComponent(query)}`);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 text-xs font-medium transition-all cursor-pointer"
                  >
                    <span>Search catalog for &ldquo;{query}&rdquo;</span>
                    <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              ) : (
                /* Books list */
                matchedBooks.map((book, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={book._id || index}
                      data-index={index}
                      onClick={() => handleBookClick(book._id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm"
                          : "bg-transparent hover:bg-zinc-900/80 text-zinc-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                        {/* Book Cover Thumbnail */}
                        <BookThumbnail
                          url={book.url}
                          title={book.title}
                          isSelected={isSelected}
                        />

                        {/* Book Details */}
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium truncate text-white leading-snug">
                              {highlightMatch(book.title, query)}
                            </p>

                            {book.genre && (
                              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-800/90 text-emerald-400/90 border border-zinc-700/60 shrink-0">
                                {highlightMatch(book.genre, query)}
                              </span>
                            )}

                            {book.language && (
                              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 shrink-0 capitalize">
                                {highlightMatch(book.language, query)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="truncate">
                              by {highlightMatch(book.author || "Unknown Author", query)}
                            </span>
                            <span>•</span>
                            <span className="text-white font-medium shrink-0">
                              ₹{book.price}
                            </span>
                            {book.discountPercent > 0 && (
                              <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
                                {book.discountPercent}% OFF
                              </span>
                            )}
                            {book.matchReason && query && (
                              <span className="hidden lg:inline-block text-[10px] text-zinc-500 italic shrink-0">
                                ({book.matchReason})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chevron Indicator */}
                      <FaChevronRight
                        className={`text-[11px] shrink-0 transition-transform ${
                          isSelected
                            ? "text-emerald-400 translate-x-0.5"
                            : "text-zinc-600 group-hover:text-zinc-400"
                        }`}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Bar */}
            <div className="bg-[#08090a] border-t border-zinc-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-500 shrink-0">
              <div className="hidden sm:flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    ↓
                  </kbd>
                  <span>to navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    ↵
                  </kbd>
                  <span>to select</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                    esc
                  </kbd>
                  <span>to close</span>
                </span>
              </div>

              {query.trim() && (
                <button
                  onClick={() => {
                    navigate(`/all-books?search=${encodeURIComponent(query.trim())}`);
                    onClose();
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <span>See full catalog for &ldquo;{query.trim()}&rdquo;</span>
                  <FaChevronRight className="text-[9px]" />
                </button>
              )}

              {!query.trim() && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 ml-auto">
                  <span>Search by</span>
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    BookBasket
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
