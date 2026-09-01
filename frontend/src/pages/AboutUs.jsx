import React from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaCompass, FaBookmark, FaUsers, FaMagic, FaCode, FaArrowRight } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      {/* Vision Hero Banner */}
      <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 py-20 md:py-28 px-4 md:px-8 border-b border-zinc-800 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <FaMagic /> Product Vision
          </span>

          <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-white max-w-3xl leading-tight">
            We believe finding a great book should be as exciting as{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 italic">
              reading one.
            </span>
          </h1>

          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl font-sans leading-relaxed">
            BookBasket evolved from a simple bookstore into a living platform for readers to discover what to read next, track their reading journey, understand their preferences, and connect with fellow readers.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link
              to="/"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-8 py-3.5 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 text-sm"
            >
              <span>Start Discovering</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 lg:py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold font-serif text-white">Why We Built This Platform</h2>
          <p className="text-zinc-400 text-sm">
            Traditional bookstores sell books. We focus on the entire lifecycle of a reader's journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl border border-amber-500/20">
              <FaCompass />
            </div>
            <h3 className="text-xl font-bold font-serif text-white">1. Intelligent Discovery</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Explore by mood, topic, or natural language prompts instead of generic categories. Find books that match how you feel right now.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl border border-blue-500/20">
              <FaBookmark />
            </div>
            <h3 className="text-xl font-bold font-serif text-white">2. Reading Tracking & Goals</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Organize your shelves (Want to Read, Currently Reading, Finished), track live page progress, and build yearly reading streaks.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/20">
              <FaUsers />
            </div>
            <h3 className="text-xl font-bold font-serif text-white">3. Reader Community</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Share structured reactions (💡 Changed how I think, 🧠 Learned something), join book clubs, and follow fellow readers.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture Section */}
      <div className="bg-zinc-900/60 border-t border-zinc-800 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <FaCode className="text-amber-500 text-2xl" />
            <h2 className="text-2xl font-bold font-serif text-white">Technical Architecture & Stack</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            BookBasket is engineered as a full-stack MERN platform built for speed, modularity, and real-time state management.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <span className="text-amber-400 font-bold block mb-1">Database</span>
              <span className="text-zinc-300">MongoDB & Mongoose</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <span className="text-amber-400 font-bold block mb-1">Backend REST</span>
              <span className="text-zinc-300">Express.js & Node.js</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <span className="text-amber-400 font-bold block mb-1">Frontend UI</span>
              <span className="text-zinc-300">React 18 & Vite</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <span className="text-amber-400 font-bold block mb-1">State & Styling</span>
              <span className="text-zinc-300">Redux Toolkit & Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;