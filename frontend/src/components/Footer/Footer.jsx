import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaTruck, FaShieldAlt, FaHeadset, FaUndo, FaGithub, FaLinkedin, FaTwitter, FaCreditCard } from "react-icons/fa";
import { SiVisa, SiMastercard, SiPaypal, SiAmericanexpress } from "react-icons/si";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80">
      {/* E-Commerce Trust Badges Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg flex-shrink-0">
              <FaTruck />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[11px] text-zinc-400">On all orders over ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg flex-shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Genuine</h4>
              <p className="text-[11px] text-zinc-400">Direct from publishers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg flex-shrink-0">
              <FaHeadset />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">24/7 Support</h4>
              <p className="text-[11px] text-zinc-400">Dedicated reader assistance</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg flex-shrink-0">
              <FaUndo />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Easy Returns</h4>
              <p className="text-[11px] text-zinc-400">7-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Brand & Slogan */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center">
              <FaBookOpen className="text-white text-sm" />
            </div>
            <span className="text-xl font-black tracking-wider text-white uppercase">
              BOOKS<span className="text-emerald-400 font-normal">BASKET</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            More Than a Bookstore. A Place for Stories. Bringing the joy of reading to book lovers everywhere with curated collections and fast delivery.
          </p>
          <div className="flex items-center gap-3 text-base text-zinc-400 pt-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900 rounded border border-zinc-800">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900 rounded border border-zinc-800">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900 rounded border border-zinc-800">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2.5">
            Quick Navigation
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">All Books Catalog</Link>
            </li>
            <li>
              <Link to="/about-us" className="hover:text-emerald-400 transition-colors">About Our Bookstore</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-emerald-400 transition-colors">My Cart & Orders</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-emerald-400 transition-colors">User Account Settings</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Book Categories */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2.5">
            Popular Categories
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">Fiction & Bestsellers</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">Non-Fiction & Biographies</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">Self-Help & Personal Growth</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">Educational & Academic</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-emerald-400 transition-colors">E-Books & Audiobooks</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter Signup */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2.5">
            Join Our Reading Club
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Subscribe to receive new releases, reader discounts, and author interviews directly in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow-md shadow-emerald-600/20"
            >
              Subscribe
            </button>
            {subscribed && (
              <span className="text-xs text-emerald-400 font-medium mt-1">
                ✓ Thank you for subscribing!
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="bg-zinc-950 border-t border-zinc-900 py-6 px-4 md:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} BookBasket E-Commerce. All rights reserved. Designed for Book Lovers.
          </div>

          <div className="flex items-center gap-3 text-xl text-zinc-400">
            <SiVisa className="hover:text-white transition-colors" title="Visa" />
            <SiMastercard className="hover:text-white transition-colors" title="MasterCard" />
            <SiPaypal className="hover:text-white transition-colors" title="PayPal" />
            <SiAmericanexpress className="hover:text-white transition-colors" title="Amex" />
            <FaCreditCard className="hover:text-white transition-colors text-base" title="Cards & UPI" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;