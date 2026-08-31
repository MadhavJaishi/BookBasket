import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBook, FaBookOpen, FaBars, FaTimes, FaShoppingCart, FaUserAlt } from "react-icons/fa";
import { useSelector } from "react-redux"

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Define nav links dynamically based on user state
  const getNavLinks = () => {
    const baseLinks = [
      { title: "Home", link: "/" },
      { title: "All Books", link: "/all-books" },
      { title: "About Us", link: "/about-us" },
    ];

    if (isLoggedIn) {
      if (role === "user") {
        baseLinks.push(
          { title: "Cart", link: "/cart", icon: <FaShoppingCart className="text-sm" /> },
          { title: "Profile", link: "/profile", icon: <FaUserAlt className="text-sm" /> }
        );
      } else if (role === "admin") {
        baseLinks.push(
          { title: "Admin Profile", link: "/profile", icon: <FaUserAlt className="text-sm" /> }
        );
      }
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className='sticky top-0 z-50 backdrop-blur-md bg-zinc-900/90 border-b border-zinc-800/80 px-4 md:px-8 py-3 transition-all duration-300 shadow-md'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          
          {/* Logo & Brand Name with folding book icon on hover */}
          <Link to="/" className='flex items-center gap-3 group'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300'>
              {/* Unfolded (Open) Book by default */}
              <FaBookOpen className="text-white text-xl block group-hover:hidden transition-all duration-300" />
              {/* Folded (Closed) Book on hover */}
              <FaBook className="text-white text-xl hidden group-hover:block transition-all duration-300 animate-in zoom-in-75 duration-200" />
            </div>
            <span className='text-2xl font-bold tracking-tight text-white'>
              Book<span className='bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent'>Basket</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-1 lg:gap-2'>
            {navLinks.map((item) => {
              const active = isActive(item.link);
              const isSpecial = item.title === "Profile" || item.title === "Admin Profile";

              if (isSpecial) {
                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    className={`ml-2 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                      active
                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                        : 'bg-zinc-800/80 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.title}
                  to={item.link}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-blue-400 bg-blue-500/10 font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}

            {/* Auth Buttons when Logged Out */}
            {!isLoggedIn && (
              <div className='flex items-center gap-3 ml-4 border-l border-zinc-800 pl-4'>
                <Link
                  to="/login"
                  className='px-4 py-1.5 text-sm font-medium rounded-full text-zinc-200 border border-zinc-700 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-all duration-200'
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className='px-5 py-1.5 text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className='md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors'
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className='fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl md:hidden flex flex-col justify-between p-6 pt-24 animate-in fade-in duration-200'>
          <div className='flex flex-col gap-4'>
            {navLinks.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 text-2xl font-semibold px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.link)
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-zinc-200 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>

          {!isLoggedIn && (
            <div className='flex flex-col gap-3 pb-8'>
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className='w-full text-center py-3 text-lg font-semibold rounded-xl text-zinc-100 border border-zinc-700 hover:bg-zinc-900 transition-all'
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileNavOpen(false)}
                className='w-full text-center py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all'
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar