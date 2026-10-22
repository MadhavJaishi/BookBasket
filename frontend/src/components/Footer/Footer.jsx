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
    <footer className="bg-[#050506] text-zinc-400 border-t border-zinc-900">
      {/* E-Commerce Trust Badges Bar */}
      <div className="border-b border-zinc-900/80 py-8 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm flex-shrink-0">
              <FaTruck />
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-200 uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[11px] text-zinc-500 font-light">On orders over ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm flex-shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-200 uppercase tracking-wider">100% Genuine</h4>
              <p className="text-[11px] text-zinc-500 font-light">Direct from publishers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm flex-shrink-0">
              <FaHeadset />
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-200 uppercase tracking-wider">Reader Support</h4>
              <p className="text-[11px] text-zinc-500 font-light">Assistance for avid readers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm flex-shrink-0">
              <FaUndo />
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-200 uppercase tracking-wider">Easy Returns</h4>
              <p className="text-[11px] text-zinc-500 font-light">7-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Brand & Slogan */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl font-serif tracking-tight text-white font-medium">
              BookBasket
            </span>
          </Link>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Where stories fit into your life. Curating intentional literature, fostering reading communities, and helping you discover your next great read.
          </p>
          <div className="flex items-center gap-3 text-sm text-zinc-400 pt-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900/60 rounded-full">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900/60 rounded-full">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors p-2 bg-zinc-900/60 rounded-full">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <ul className="space-y-2 text-xs font-light text-zinc-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/all-books" className="hover:text-white transition-colors">All Books Catalog</Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-white transition-colors">Reader Community</Link>
            </li>
            <li>
              <Link to="/book-clubs" className="hover:text-white transition-colors">Book Clubs</Link>
            </li>
            <li>
              <Link to="/about-us" className="hover:text-white transition-colors">About Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Book Categories */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4">
            Discover
          </h3>
          <ul className="space-y-2 text-xs font-light text-zinc-400">
            <li>
              <Link to="/all-books?mood=grow" className="hover:text-white transition-colors">Personal Growth</Link>
            </li>
            <li>
              <Link to="/all-books?mood=perspective" className="hover:text-white transition-colors">Philosophy & Ideas</Link>
            </li>
            <li>
              <Link to="/all-books?mood=inspired" className="hover:text-white transition-colors">Inspirational Stories</Link>
            </li>
            <li>
              <Link to="/all-books?mood=learn" className="hover:text-white transition-colors">Science & Tech</Link>
            </li>
            <li>
              <Link to="/all-books?mood=emotional" className="hover:text-white transition-colors">Literary Fiction</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter Signup */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4">
            Stay Inspired
          </h3>
          <p className="text-xs text-zinc-400 font-light mb-3">
            Receive handpicked book selections and reflections directly to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900/80 border border-zinc-800 text-zinc-100 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:border-emerald-500 font-light"
            />
            <button
              type="submit"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs py-2.5 rounded-full transition-colors"
            >
              Subscribe
            </button>
            {subscribed && (
              <span className="text-xs text-emerald-400 font-light mt-1">
                ✓ Thank you for subscribing!
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="border-t border-zinc-900 py-6 px-4 sm:px-8 lg:px-12 text-xs text-zinc-500 font-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} BookBasket. Designed for intentional readers.
          </div>

          <div className="flex items-center gap-3 text-lg text-zinc-500">
            <SiVisa className="hover:text-white transition-colors" title="Visa" />
            <SiMastercard className="hover:text-white transition-colors" title="MasterCard" />
            <SiPaypal className="hover:text-white transition-colors" title="PayPal" />
            <SiAmericanexpress className="hover:text-white transition-colors" title="Amex" />
            <FaCreditCard className="hover:text-white transition-colors text-sm" title="Cards & UPI" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;