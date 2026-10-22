import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import {
  FaBook,
  FaPlus,
  FaTrash,
  FaPen,
  FaMagnifyingGlass,
  FaEye,
  FaIndianRupeeSign,
  FaPercent,
  FaBolt,
  FaCheck,
  FaXmark,
  FaTags,
} from "react-icons/fa6";
import { useModal } from "../../context/ModalContext";

const AdminInventory = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // Store setting for dynamic random discount
  const [autoRandomDiscount, setAutoRandomDiscount] = useState(false);
  const [settingLoading, setSettingLoading] = useState(false);

  // Quick discount editor modal state
  const [editingDiscountBook, setEditingDiscountBook] = useState(null);
  const [discountInput, setDiscountInput] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchBooksAndSettings = async () => {
    setLoading(true);
    try {
      const [booksRes, settingsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-all-books`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/store-settings`),
      ]);
      setBooks(booksRes.data.data || []);
      if (settingsRes.data?.data) {
        setAutoRandomDiscount(Boolean(settingsRes.data.data.autoRandomDiscount));
      }
    } catch (err) {
      console.error("Failed to load inventory / settings:", err);
      showAlert({
        title: "Load Error",
        message: "Failed to fetch book catalog inventory or store settings.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndSettings();
  }, []);

  const handleToggleAutoDiscount = async () => {
    const nextState = !autoRandomDiscount;
    setSettingLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-store-settings`,
        { autoRandomDiscount: nextState },
        { headers }
      );
      setAutoRandomDiscount(nextState);
      showAlert({
        title: nextState ? "Auto-Discount Active" : "Auto-Discount Disabled",
        message:
          res.data?.msg ||
          (nextState
            ? "Random 5%–35% discounts applied to all items without custom admin discounts."
            : "Dynamic discount disabled. Only items with custom admin discounts will be on sale."),
        type: "success",
      });
      // Re-fetch books to apply formatting
      const booksRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-all-books`);
      setBooks(booksRes.data.data || []);
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.msg || "Failed to update store discount mode.",
        type: "error",
      });
    } finally {
      setSettingLoading(false);
    }
  };

  const handleOpenDiscountEditor = (book) => {
    setEditingDiscountBook(book);
    setDiscountInput(
      book.adminDiscountPercent !== undefined
        ? String(book.adminDiscountPercent)
        : String(book.discountPercent || 0)
    );
  };

  const handleSaveDiscount = async (e) => {
    if (e) e.preventDefault();
    if (!editingDiscountBook) return;

    const val = Math.min(99, Math.max(0, Number(discountInput) || 0));
    setSavingDiscount(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-book-discount/${editingDiscountBook._id}`,
        { discountPercent: val },
        { headers }
      );

      const updatedBook = res.data?.data;
      if (updatedBook) {
        setBooks((prev) =>
          prev.map((b) => (b._id === updatedBook._id ? updatedBook : b))
        );
      }
      showAlert({
        title: "Discount Saved",
        message: `Set discount to ${val}% for "${editingDiscountBook.title}".`,
        type: "success",
      });
      setEditingDiscountBook(null);
    } catch (err) {
      showAlert({
        title: "Error",
        message: err.response?.data?.msg || "Failed to update discount.",
        type: "error",
      });
    } finally {
      setSavingDiscount(false);
    }
  };

  const genres = useMemo(() => {
    const set = new Set();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ["all", ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        searchTerm === "" ||
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.language?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre =
        selectedGenre === "all" || b.genre?.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [books, searchTerm, selectedGenre]);

  const handleDeleteBook = (book) => {
    showConfirm({
      title: "Remove from Catalog?",
      message: `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      confirmText: "Delete Book",
      cancelText: "Keep Book",
      type: "danger",
      onConfirm: async () => {
        setDeletingId(book._id);
        try {
          await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/delete-book/${book._id}`,
            {
              headers: {
                ...headers,
                bookid: book._id,
              },
            }
          );
          setBooks((prev) => prev.filter((b) => b._id !== book._id));
          showAlert({
            title: "Book Deleted",
            message: `"${book.title}" has been deleted from catalog.`,
            type: "success",
          });
        } catch (err) {
          showAlert({
            title: "Delete Failed",
            message: err.response?.data?.msg || "Could not delete the book.",
            type: "error",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const totalCatalogValue = useMemo(() => {
    return books.reduce((sum, b) => sum + (Number(b.discountedPrice || b.price) || 0), 0);
  }, [books]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader onRetry={fetchBooksAndSettings} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            Catalog Inventory
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Book Inventory & Pricing
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Browse, search, edit discounts, and curate all titles available in BookBasket.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile/add-book"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2.5 rounded-full text-xs font-medium transition-all shadow-lg shadow-emerald-950/40"
          >
            <FaPlus className="text-xs" /> Add New Book
          </Link>
          <Link
            to="/profile/import-catalog"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-full text-xs font-medium transition-all border border-zinc-700/60"
          >
            Import JSON
          </Link>
        </div>
      </div>

      {/* Global Dynamic Auto-Discount Switch Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/90 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <FaBolt className="text-lg" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-serif font-medium text-white">
                Dynamic Auto-Discount Mode (5% – 35%)
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                  autoRandomDiscount
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {autoRandomDiscount ? "Active" : "Off"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-light max-w-2xl leading-relaxed">
              When <strong>selected (ON)</strong>, automatically generates random discounts between 5% and 35% on all items that don't have an admin-assigned discount. If <strong>not selected (OFF)</strong>, only your individually assigned discounts are active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 self-start md:self-center">
          <button
            onClick={handleToggleAutoDiscount}
            disabled={settingLoading}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 shadow-md ${
              autoRandomDiscount
                ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            {autoRandomDiscount ? (
              <>
                <FaCheck className="text-xs" /> Enabled (5%-35% Active)
              </>
            ) : (
              <>
                <FaPercent className="text-xs" /> Enable Dynamic Discounts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Mini Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Total Titles</p>
            <p className="text-xl font-serif text-white mt-0.5">{books.length} Books</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <FaBook />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Filtered Result</p>
            <p className="text-xl font-serif text-emerald-400 mt-0.5">{filteredBooks.length} Shown</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center">
            <FaMagnifyingGlass />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Active Catalog Value</p>
            <p className="text-xl font-serif text-white mt-0.5">₹{totalCatalogValue.toLocaleString("en-IN")}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <FaIndianRupeeSign />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
        <div className="relative flex-1">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
          />
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-zinc-950 text-zinc-200 px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs outline-none focus:border-emerald-500 font-light cursor-pointer"
        >
          {genres.map((g) => (
            <option key={g} value={g} className="bg-zinc-900 text-zinc-200">
              {g === "all" ? "All Genres" : g}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      {filteredBooks.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/20 rounded-3xl border border-zinc-800/60 p-8 space-y-3">
          <p className="text-zinc-400 text-sm">No books found matching your filter criteria.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedGenre("all");
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800/80 rounded-3xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-light bg-zinc-950/40">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Book Details</th>
                <th className="py-3.5 px-4">Genre / Lang</th>
                <th className="py-3.5 px-4">Pricing & Discount</th>
                <th className="py-3.5 px-4">Discount Mode</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredBooks.map((book, idx) => {
                const hasDiscount = book.hasDiscount && book.discountedPrice < book.price;
                const isAdminCustom = book.adminDiscountPercent > 0;

                return (
                  <tr key={book._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">{idx + 1}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {book.url ? (
                          <img
                            src={book.url}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded-lg shadow-sm border border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 shrink-0">
                            <FaBook />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/view-book-details/${book._id}`}
                            className="font-medium text-zinc-100 hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-zinc-400 font-light">{book.author}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-light">
                          {book.genre || "General"}
                        </span>
                        {book.language && (
                          <p className="text-[10px] text-zinc-500 font-light">{book.language}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-semibold text-white">
                          ₹{book.discountedPrice !== undefined ? book.discountedPrice : book.price}
                        </span>
                        {hasDiscount && (
                          <span className="text-zinc-500 line-through text-[11px]">
                            ₹{book.price}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isAdminCustom ? (
                        <button
                          onClick={() => handleOpenDiscountEditor(book)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono transition-colors"
                          title="Custom admin discount. Click to edit."
                        >
                          <FaTags className="text-[9px]" /> {book.adminDiscountPercent}% Custom
                        </button>
                      ) : book.isAutoDiscount ? (
                        <button
                          onClick={() => handleOpenDiscountEditor(book)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono transition-colors"
                          title="Auto dynamic discount (5-35%). Click to assign custom discount."
                        >
                          <FaBolt className="text-[9px]" /> {book.discountPercent}% Auto
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDiscountEditor(book)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-light transition-colors"
                          title="Click to set a discount"
                        >
                          + Set Discount
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDiscountEditor(book)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                          title="Edit Item Discount"
                        >
                          <FaPercent className="text-xs" />
                        </button>

                        <Link
                          to={`/view-book-details/${book._id}`}
                          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="View Public Details"
                        >
                          <FaEye className="text-xs" />
                        </Link>

                        <Link
                          to={`/update-book/${book._id}`}
                          className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                          title="Edit Book Details"
                        >
                          <FaPen className="text-xs" />
                        </Link>

                        <button
                          onClick={() => handleDeleteBook(book)}
                          disabled={deletingId === book._id}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
                          title="Delete Book"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Discount Editor Dialog Modal */}
      {editingDiscountBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1012] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20">
                  <FaPercent />
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-white">
                    Set Custom Discount
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-light truncate max-w-[240px]">
                    {editingDiscountBook.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingDiscountBook(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <FaXmark className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-light text-zinc-400 tracking-wider block mb-1">
                  Discount Percentage (0 – 99%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="Enter percentage e.g. 20"
                    autoFocus
                    className="w-full bg-zinc-950 text-white pl-4 pr-10 py-2.5 rounded-xl border border-zinc-800 focus:border-emerald-500 text-sm font-mono outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-light mt-1.5">
                  Set to <strong>0</strong> to remove custom discount (auto-discount will apply if enabled).
                </p>
              </div>

              {/* Price Preview */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-light">Calculated Price:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    ₹{Math.max(0, Math.round(Number(editingDiscountBook.price) * (1 - (Number(discountInput) || 0) / 100)))}
                  </span>
                  {(Number(discountInput) || 0) > 0 && (
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ₹{editingDiscountBook.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDiscountBook(null)}
                  className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDiscount}
                  className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-medium transition-all shadow-md disabled:opacity-50"
                >
                  {savingDiscount ? "Saving..." : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
