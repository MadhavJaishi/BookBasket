import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaCompass, FaBookOpen } from "react-icons/fa";
import ParticleWave from "./ParticleWave";
import ScrollGlowText from "./ScrollGlowText";
import BrandMarquee from "./BrandMarquee";

const Hero = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const presetPrompts = [
    "Something inspiring",
    "Psychology & human behavior",
    "Mindset and self-growth",
    "Captivating sci-fi fiction",
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
    <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between items-center text-center overflow-hidden mb-4 select-none">
      {/* Background Top Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 sm:pt-8 flex flex-col items-center w-full">
        {/* Subtle Brand/Category Mark */}
        <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 font-light tracking-wider sm:tracking-widest uppercase mb-2 opacity-80">
          <FaBookOpen className="text-emerald-400 text-xs shrink-0" />
          <span>Intelligent Book Discovery</span>
        </div>

        {/* Grand Editorial Headline with dynamic scroll-driven highlight glow */}
        <div className="w-full my-0.5">
          <ScrollGlowText text="BookBasket" />
        </div>

        {/* Elegant Subtitle */}
        <p className="text-zinc-400 font-light text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
          We sense where stories fit into your life, uncover the books worth your time, and curate titles that inspire &mdash; without the guesswork.
        </p>

        {/* Action Buttons styled like the screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-2">
          <Link
            to="/all-books"
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-white/10 transition-all duration-300"
          >
            Explore Catalog
          </Link>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full backdrop-blur-sm transition-all duration-300 flex items-center gap-2.5 group"
          >
            <span>Ask Discovery</span>
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <FaArrowRight className="text-[9px] text-zinc-200" />
            </div>
          </button>
        </div>

        {/* Interactive Natural Language Search Bar (collapsible) */}
        {showSearch && (
          <div className="w-full max-w-xl mx-auto my-3 transition-all duration-300 animate-fadeIn">
            <form
              onSubmit={handleDiscoverySubmit}
              className="w-full bg-zinc-900/90 backdrop-blur-md p-2 rounded-full border border-zinc-700/60 shadow-2xl focus-within:border-emerald-500/80 transition-all flex items-center gap-2"
            >
              <div className="pl-4 text-emerald-400">
                <FaCompass className="text-base" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to read (e.g., 'mindset books on habits')..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none px-2 font-light"
                autoFocus
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-2 rounded-full text-xs transition-colors flex-shrink-0"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-xs">
              <span className="text-zinc-500 font-light">Popular:</span>
              {presetPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="bg-zinc-900/60 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-300 border border-zinc-800 px-3 py-1 rounded-full text-[11px] transition-all"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic 3D Green Topographic Particle Wave Art */}
      <div className="w-full h-72 sm:h-80 md:h-[380px] lg:h-[420px] relative z-0 -mt-8 sm:-mt-12 md:-mt-16 pointer-events-none">
        <ParticleWave />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08090a] via-[#08090a]/80 to-transparent pointer-events-none" />
      </div>

      {/* Continuous Marquee at the bottom fold */}
      <div className="w-full relative z-10 -mt-16 sm:-mt-20 md:-mt-24 mb-1">
        <BrandMarquee />
      </div>
    </section>
  );
};

export default Hero;