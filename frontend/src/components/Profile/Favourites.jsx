import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BookCard from "../BookCard/BookCard";
import Loader from "../Loader/Loader";
import { FaHeart, FaArrowRight } from "react-icons/fa6";

const Favourites = () => {
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchFavourites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-all-favourites`,
        { headers }
      );
      setFavouriteBooks(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load favourites:", err);
      setFavouriteBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const handleRemove = (bookId) => {
    setFavouriteBooks((prev) => prev.filter((book) => book._id !== bookId));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader onRetry={fetchFavourites} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            Saved Collection
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Favourite Books
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            All your bookmarked and cherished literary works in one place.
          </p>
        </div>

        {favouriteBooks.length > 0 && (
          <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            {favouriteBooks.length} {favouriteBooks.length === 1 ? "Book" : "Books"}
          </span>
        )}
      </div>

      {/* Empty State */}
      {favouriteBooks.length === 0 ? (
        <div className="min-h-[45vh] p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500 text-2xl shadow-inner">
            <FaHeart />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-xl font-serif font-normal text-white">
              No Favourite Books Yet
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Explore our diverse literary catalog and heart your favorite reads to build your dream shelf.
            </p>
          </div>
          <Link
            to="/all-books"
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-6 py-2.5 rounded-full text-xs transition-all shadow-md mt-2"
          >
            Explore Catalog <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      ) : (
        /* Books Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favouriteBooks.map((item) => (
            <div key={item._id}>
              <BookCard data={item} favourite={true} onRemove={handleRemove} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
