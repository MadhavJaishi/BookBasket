import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaMagic, FaCompass, FaArrowRight } from "react-icons/fa";

const Hero = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const presetPrompts = [
    "Something inspiring",
    "A short book about psychology",
    "A beginner-friendly philosophy book",
    "Something similar to Atomic Habits",
  ];

  const handleDiscoverySubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate(`/all-books?query=${encodeURIComponent(prompt.trim())}`);
    } else {
      navigate("/all-books");
    }
  };

  const handlePresetClick = (presetText) => {
    setPrompt(presetText);
    navigate(`/all-books?query=${encodeURIComponent(presetText)}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 lg:p-16 mb-12 shadow-2xl">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <FaMagic className="text-xs" /> Book Discovery Platform
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white leading-tight mb-6">
          Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 italic">great read.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-sans">
          Discover books that match your interests, mood, goals, and reading habits. Track your progress and share reflections with fellow readers.
        </p>

        {/* Natural Language Discovery Input */}
        <form
          onSubmit={handleDiscoverySubmit}
          className="w-full max-w-2xl bg-zinc-800/90 p-2 sm:p-2.5 rounded-2xl border border-zinc-700/80 shadow-2xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all flex items-center gap-2 mb-6"
        >
          <div className="pl-3 text-amber-400 flex items-center">
            <FaCompass className="text-lg" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What are you in the mood to read?"
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all flex-shrink-0 shadow-lg text-sm"
          >
            <span>Explore</span>
            <FaArrowRight className="text-xs" />
          </button>
        </form>

        {/* Preset Prompt Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium mr-1">Try asking:</span>
          {presetPrompts.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              className="bg-zinc-800/60 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 hover:border-amber-500/30 px-3 py-1.5 rounded-full transition-all text-xs font-medium"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;