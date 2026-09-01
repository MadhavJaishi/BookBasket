import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FaBookOpen,
  FaSearch,
  FaShoppingCart,
  FaUserAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCompass,
  FaBookmark,
  FaUsers,
  FaComments,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../store/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/all-books");
    }
  };

  const handleLogout = () => {
    dispatch(authActions.logout());
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { name: "Discover", path: "/", icon: FaCompass },
    { name: "Books", path: "/all-books", icon: FaBookOpen },
    { name: "Community", path: "/community", icon: FaComments },
    { name: "Book Clubs", path: "/book-clubs", icon: FaUsers },
  ];

  if (isLoggedIn) {
    navLinks.splice(2, 0, { name: "My Library", path: "/library", icon: FaBookmark });
  }

  return (
    <header className="w-full bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all duration-300">
            <FaBookOpen className="text-zinc-950 text-xl font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-zinc-100 font-serif leading-none">
              Book<span className="text-amber-500 italic">Basket</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-sans tracking-wider uppercase">
              Reading & Discovery Platform
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className={`text-xs ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-zinc-800/80 rounded-lg border border-zinc-700/70 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all px-3 py-1.5 text-xs w-48 xl:w-64"
          >
            <FaSearch className="text-zinc-400 text-xs mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </form>

          {/* Cart Icon (E-Commerce) */}
          {isLoggedIn && role === "user" && (
            <Link
              to="/cart"
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors relative"
              title="Cart"
            >
              <FaShoppingCart className="text-base" />
            </Link>
          )}

          {/* Authentication & User Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-all"
              >
                <FaUserAlt className="text-xs" />
                <span className="hidden sm:inline font-semibold">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-700/60 transition-colors"
                title="Log Out"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-2 text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-500/15 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-300 hover:bg-zinc-800"
          >
            {mobileNavOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-3">
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setMobileNavOpen(false);
            }}
            className="flex items-center bg-zinc-800 rounded-lg p-2 border border-zinc-700"
          >
            <FaSearch className="text-zinc-400 mr-2" />
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </form>

          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-800 text-sm font-medium"
                >
                  <Icon className="text-amber-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <Link
              to="/about-us"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-800 text-sm font-medium"
            >
              <span>About Platform</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;