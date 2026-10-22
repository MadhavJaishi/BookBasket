import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../store/auth";
import { fetchCart, clearCart } from "../../store/cartSlice";
import { useModal } from "../../context/ModalContext";
import SearchModal from "./SearchModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showConfirm, showAlert } = useModal();
  const navRef = useRef(null);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);
  const cartCount = useSelector((state) => state.cart.cartCount);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking or tapping outside the navbar/menu
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    // Detect macOS / iOS for ⌘K vs Windows/Linux for Ctrl K
    const isApple = /(Mac|iPhone|iPod|iPad)/i.test(
      navigator.platform || navigator.userAgent || ""
    );
    setIsMac(isApple);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle search modal on Cmd+K (Mac/iOS) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [isLoggedIn, dispatch]);

  const handleLogout = () => {
    showConfirm({
      title: "Confirm Log Out",
      message: "Are you sure you want to log out of your session?",
      confirmText: "Log Out",
      cancelText: "Stay Logged In",
      type: "warning",
      onConfirm: () => {
        dispatch(clearCart());
        dispatch(authActions.logout());
        dispatch(authActions.changeRole("user"));
        localStorage.clear();
        navigate("/login");
        showAlert({
          title: "Logged Out",
          message: "You have been successfully logged out.",
          type: "info",
        });
      },
    });
  };

  const navLinks = [
    { name: "Catalog", path: "/all-books" },
    { name: "Community", path: "/community" },
    { name: "About Us", path: "/about-us" },
    { name: "Clubs", path: "/book-clubs" },
  ];

  if (isLoggedIn) {
    navLinks.splice(1, 0, { name: "My Library", path: "/library" });
  }

  return (
    <header
      ref={navRef}
      className="w-full bg-[#08090a]/90 backdrop-blur-md sticky top-0 z-50 transition-colors border-b border-zinc-800/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        {/* Left Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-light text-zinc-400">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
                  isActive ? "text-white font-medium" : "hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-zinc-800/90 border border-zinc-700/60 rounded-full -z-10 shadow-sm"
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logo - Centered on desktop, left-aligned on mobile */}
        <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-700/80 flex items-center justify-center group-hover:border-emerald-500/80 transition-colors bg-zinc-900/60">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-100 group-hover:text-emerald-400 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-serif tracking-tight text-white font-medium">
              BookBasket
            </span>
          </Link>
        </div>

        {/* Right Actions Block */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Search Trigger Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-xs group shadow-sm cursor-pointer"
            title={`Search books (${isMac ? "⌘K" : "Ctrl+K"})`}
          >
            <FaSearch className="text-xs group-hover:text-emerald-400 transition-colors" />
            <span className="hidden lg:inline text-zinc-400 group-hover:text-zinc-300 text-xs font-light">
              Search books...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/90 border border-zinc-700/70 rounded">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="sm:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-900/80 rounded-full transition-colors"
            title="Search books"
          >
            <FaSearch className="text-sm" />
          </button>

          {/* Cart Icon (if logged in user) */}
          {isLoggedIn && role === "user" && (
            <Link
              to="/cart"
              className="p-2 text-zinc-300 hover:text-white transition-colors relative group"
              title={
                cartCount > 0
                  ? `Cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`
                  : "Shopping Cart"
              }
            >
              <FaShoppingCart
                className={`text-base transition-colors ${
                  cartCount > 0
                    ? "text-emerald-400 group-hover:text-emerald-300"
                    : "text-zinc-400 group-hover:text-white"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-emerald-500 text-zinc-950 font-bold text-[9px] rounded-full flex items-center justify-center shadow-md shadow-emerald-950/60 ring-2 ring-[#08090a] animate-scaleUp">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Desktop Auth / Profile Buttons */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/profile"
                className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4 py-2 rounded-full transition-all"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-light text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium px-4 py-2 rounded-full transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors relative"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? (
              <FaTimes className="text-lg text-white transition-transform" />
            ) : (
              <FaBars className="text-lg transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Animated Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop overlay below navbar on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 top-16 sm:top-20 bg-black/60 backdrop-blur-[2px] z-40 md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-[#0a0b0d]/98 backdrop-blur-xl border-t border-zinc-800/80 shadow-2xl shadow-black/90 relative z-50"
            >
            <div className="px-5 py-5 space-y-4">
              {/* Mobile Quick Search Bar Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="w-full flex items-center justify-between bg-zinc-900/90 rounded-xl px-3.5 py-2.5 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-left"
              >
                <span className="flex items-center gap-2.5">
                  <FaSearch className="text-zinc-400 text-xs" />
                  <span>Search books, authors, genres...</span>
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/90 border border-zinc-700/60 rounded">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              </button>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                          : "text-zinc-300 hover:bg-zinc-900/70 hover:text-white"
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Shopping Cart Row (for logged-in user) */}
              {isLoggedIn && role === "user" && (
                <div className="pt-2 border-t border-zinc-800/60">
                  <Link
                    to="/cart"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/70 transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <FaShoppingCart className="text-emerald-400 text-sm" />
                      <span>Shopping Cart</span>
                    </span>
                    {cartCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold shadow-sm">
                        {cartCount} {cartCount === 1 ? "item" : "items"}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Empty</span>
                    )}
                  </Link>
                </div>
              )}

              {/* Auth / Profile Area in Mobile Menu */}
              <div className="pt-3 border-t border-zinc-800/80">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                          {role === "admin" ? <FaShieldAlt /> : <FaUserAlt />}
                        </div>
                        <span className="text-xs font-medium text-zinc-200 capitalize">
                          {role} Account
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileNavOpen(false)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        View Profile &rarr;
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FaSignOutAlt />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-all shadow-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {/* Spotlight Command-Palette Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;