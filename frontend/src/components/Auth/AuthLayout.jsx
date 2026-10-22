import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "../../store/bookSlice";
import { HiSparkles } from "react-icons/hi2";
import OptimizedImage from "../Image/OptimizedImage";

const AuthLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { books: reduxBooks } = useSelector(
    (state) => state.bookList || { books: [], loading: false }
  );

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Use only books returned by the API
  const validBooks = (reduxBooks || []).filter(
    (b) => b && (b.url || (Array.isArray(b.images) && b.images[0]))
  );

  const formatBook = (b, idx, prefix = "auth-book") => ({
    id: b._id || `${prefix}-${idx}`,
    title: b.title || "Untitled",
    author: b.author || "Unknown Author",
    url: b.url || (Array.isArray(b.images) && b.images[0]) || "",
    genre: b.genre || "Featured",
    discountPercent: b.discountPercent,
    hasDiscount: b.hasDiscount,
    price: b.discountedPrice || b.price,
    rating: (4.6 + ((b.title?.length || idx) % 4) * 0.1).toFixed(1),
  });

  // Divide into two distinct sections
  const midIndex = Math.ceil(validBooks.length / 2);
  const firstSection = validBooks.slice(0, midIndex);
  const secondSection = validBooks.slice(midIndex);
  const allSection = validBooks;

  // Build repeated arrays to guarantee infinite seamless scrolling
  const buildPool = (items, prefix) => {
    if (!items || items.length === 0) return [];
    const rep = Math.max(3, Math.ceil(15 / items.length));
    return Array(rep)
      .fill(items)
      .flat()
      .map((b, i) => formatBook(b, i, prefix));
  };

  const list1 = buildPool(firstSection, "col1"); // Left-most column: First half
  const list2 = buildPool(allSection, "col2");   // Center column: All books
  const list3 = buildPool(secondSection, "col3"); // Right-most column: Second half

  // Book Card for vertical carousel with embedded details overlay
  const renderBookCard = (item, key) => (
    <div
      key={key}
      className="group relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-emerald-500/10 flex flex-col justify-end"
    >
      {/* Background Cover Image */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950">
        <OptimizedImage
          src={item.url}
          alt={item.title}
          objectFit="object-cover"
          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Top Badges */}
      <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
        {item.hasDiscount ? (
          <div className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500 text-black shadow-md">
            {item.discountPercent}% OFF
          </div>
        ) : (
          <div />
        )}
        <div className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
          ★ {item.rating}
        </div>
      </div>

      {/* Embedded High-Contrast Bottom Details Overlay */}
      <div className="relative z-10 p-3.5 pt-8 bg-gradient-to-t from-black via-black/85 to-transparent">
        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block drop-shadow-sm">
          {item.genre}
        </span>
        <h4 className="text-xs font-semibold text-white truncate mt-0.5 drop-shadow-sm">
          {item.title}
        </h4>
        <p className="text-[11px] text-zinc-300 truncate font-light drop-shadow-sm">
          {item.author}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-[#08090a] flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left Side: Book Carousel / Dynamic Curved Vertical Marquee Columns */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 items-center justify-center p-6 lg:p-10 relative overflow-hidden select-none border-r border-zinc-800/40 max-h-[calc(100vh-80px)]">
        {/* Soft edge gradient masks for vertical marquee */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#08090a] via-[#08090a]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08090a] via-[#08090a]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#08090a] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#08090a] to-transparent z-20" />

        {/* Vertical Multi-Column Scrolling Belts */}
        {validBooks.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 w-full max-w-2xl h-[120vh] -rotate-2 scale-100 lg:scale-105">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skel-${i}`}
                className="aspect-[2/3] w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/50 animate-pulse flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800/60" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 w-full max-w-2xl h-[120vh] -rotate-2 scale-100 lg:scale-105 transform-gpu">
            {/* Column 1: Upward Scroll (First Half) */}
            <div className="overflow-hidden flex flex-col">
              <div className="animate-marquee-vertical flex flex-col gap-4 lg:gap-5">
                {list1.map((item, idx) => renderBookCard(item, `col1-${idx}`))}
              </div>
            </div>

            {/* Column 2: Downward Scroll (All Books - Reverse) */}
            <div className="overflow-hidden flex flex-col">
              <div className="animate-marquee-vertical-reverse flex flex-col gap-4 lg:gap-5">
                {list2.map((item, idx) => renderBookCard(item, `col2-${idx}`))}
              </div>
            </div>

            {/* Column 3: Upward Slow Scroll (Second Half) */}
            <div className="hidden lg:flex overflow-hidden flex-col">
              <div className="animate-marquee-vertical-slow flex flex-col gap-4 lg:gap-5">
                {list3.map((item, idx) => renderBookCard(item, `col3-${idx}`))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Tagline Over Carousel */}
        <div className="absolute bottom-6 left-6 z-30 hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 text-zinc-300 text-xs shadow-xl">
          <HiSparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-light">
            Discover curated masterpieces & personalized shelves
          </span>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
