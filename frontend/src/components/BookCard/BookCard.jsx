import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../store/cartSlice";
import { useModal } from "../../context/ModalContext";
import OptimizedImage from "../Image/OptimizedImage";
import { FaHeart, FaRegHeart, FaShoppingCart, FaCheck } from "react-icons/fa";
import { GrLanguage } from "react-icons/gr";

const BookCard = ({ data, favourite, onRemove }) => {
  if (!data) return null;

  const dispatch = useDispatch();
  const { showAlert, showAuthModal } = useModal();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [isFav, setIsFav] = useState(Boolean(favourite));
  const [favLoading, setFavLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: data._id,
  };

  const removeFromFavourites = async () => {
    try {
      setFavLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/remove-book-from-favourites`,
        {},
        { headers }
      );
      setIsFav(false);
      if (onRemove) {
        onRemove(data._id);
      }
      showAlert({
        title: "Removed",
        message: `"${data.title}" removed from your favourites.`,
        type: "info",
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: "Error",
        message: "Failed to remove book from favourites.",
        type: "error",
      });
    } finally {
      setFavLoading(false);
    }
  };

  const handleToggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to save books to your favourites.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
      return;
    }

    if (favourite || isFav) {
      await removeFromFavourites();
      return;
    }

    try {
      setFavLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/add-book-to-favourites`,
        {},
        { headers }
      );
      setIsFav(true);
      showAlert({
        title: "Added to Favourites",
        message: res.data?.msg || `"${data.title}" saved to your shelf!`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Action Failed",
        message: err.response?.data?.msg || "Failed to update favourites",
        type: "error",
      });
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      showAuthModal({
        title: "Sign In Required",
        message: "You must login first to add books to your shopping cart.",
        proceedText: "Sure, Proceed to login",
        cancelText: "Keep exploring, login later",
      });
      return;
    }

    try {
      setCartLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/add-book-to-cart`,
        {},
        { headers }
      );
      dispatch(fetchCart());
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      showAlert({
        title: "Added to Basket",
        message: res.data?.msg || `"${data.title}" added to your cart!`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Cart Error",
        message: err.response?.data?.msg || "Failed to add to cart",
        type: "error",
      });
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg h-full">
      <Link to={`/view-book-details/${data._id}`} className="flex flex-col h-full">
        {/* Cover Container */}
        <div className="relative bg-zinc-950/60 rounded-xl overflow-hidden flex items-center justify-center h-[26vh] w-full p-2">
          {/* Language Tag */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 text-zinc-300 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <GrLanguage className="text-[9px] text-emerald-400" />
              <span>{data.language || "English"}</span>
            </span>
          </div>

          {/* Favourite Action Button on Image */}
          <button
            onClick={handleToggleFavourite}
            disabled={favLoading}
            title={isFav || favourite ? "Remove from favourites" : "Add to favourites"}
            aria-label="Favourite book"
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-md ${
              isFav || favourite
                ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                : "bg-zinc-950/75 text-zinc-400 border border-zinc-800/80 hover:text-red-400 hover:bg-zinc-900"
            }`}
          >
            {isFav || favourite ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
          </button>

          <OptimizedImage
            src={data.url}
            alt={data.title}
            className="h-[23vh] w-full object-contain"
            containerClassName="h-[23vh] w-full"
            objectFit="object-contain"
          />

          {/* Discount Pill Badge on Cover if on sale */}
          {data.hasDiscount && data.discountPercent > 0 && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="bg-emerald-500 text-zinc-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <span>{data.discountPercent}% OFF</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mt-3.5 flex flex-col flex-grow justify-between">
          <div>
            <h2 className="text-sm sm:text-base text-white font-serif font-medium line-clamp-1">
              {data.title}
            </h2>

            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-xs text-zinc-400 font-light line-clamp-1">
                {data.author}
              </p>
              {data.genre && (
                <span className="text-[10px] text-zinc-400 bg-zinc-800/50 border border-zinc-700/40 px-2 py-0.5 rounded-full shrink-0 font-light">
                  {data.genre}
                </span>
              )}
            </div>

            {/* Book Description Snippet */}
            {data.desc && (
              <p className="mt-2 text-[11px] text-zinc-400/90 font-light line-clamp-2 leading-relaxed">
                {data.desc}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Footer Price & Add to Basket Button */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block -mb-0.5">
            Price
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-white font-mono">
              &#8377; {data.discountedPrice !== undefined ? data.discountedPrice : data.price}
            </p>
            {data.hasDiscount && data.discountedPrice < data.price && (
              <span className="text-xs font-mono text-zinc-500 line-through">
                &#8377;{data.price}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={cartLoading}
          title="Add to shopping basket"
          aria-label="Add to cart"
          className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-200 shadow-sm ${
            addedToCart
              ? "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
              : "bg-white hover:bg-zinc-200 text-zinc-950 active:scale-95"
          }`}
        >
          {addedToCart ? (
            <>
              <FaCheck className="text-[10px]" />
              <span className="text-[11px]">Added</span>
            </>
          ) : (
            <>
              <FaShoppingCart className="text-[11px]" />
              <span className="text-[11px]">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
