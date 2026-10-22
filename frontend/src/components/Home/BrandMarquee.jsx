import React from "react";

const BrandMarquee = () => {
  const brands = [
    {
      name: "Logoipsum",
      svg: (
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white/80 hover:text-white transition-colors">
          <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="font-sans font-semibold tracking-wide">Logoipsum</span>
        </div>
      ),
    },
    {
      name: "LOGO Square",
      svg: (
        <div className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
          <div className="w-5 h-5 border-2 border-current rounded flex items-center justify-center font-bold text-[10px]">
            L
          </div>
          <span className="font-mono font-bold tracking-widest text-base">LOGO</span>
        </div>
      ),
    },
    {
      name: "Lightdash",
      svg: (
        <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="font-sans font-semibold">Lightdash</span>
        </div>
      ),
    },
    {
      name: "LOQO",
      svg: (
        <div className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
          <span className="font-sans font-extrabold tracking-wider text-xl uppercase">LOQO</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      ),
    },
    {
      name: "Goodreads",
      svg: (
        <div className="flex items-center gap-1.5 font-serif font-bold text-lg tracking-tight text-white/80 hover:text-white transition-colors">
          <span className="text-xl italic font-serif text-emerald-300 font-bold">g</span>
          <span className="font-serif">goodreads</span>
        </div>
      ),
    },
    {
      name: "Penguin",
      svg: (
        <div className="flex items-center gap-2 font-medium text-white/80 hover:text-white transition-colors">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-serif font-bold">
            P
          </div>
          <span className="font-serif tracking-wide text-sm font-semibold uppercase">Penguin House</span>
        </div>
      ),
    },
    {
      name: "HarperCollins",
      svg: (
        <div className="flex items-center gap-2 font-serif text-white/80 hover:text-white transition-colors">
          <div className="w-4 h-4 bg-emerald-500/80 rotate-45" />
          <span className="font-serif tracking-wider text-sm font-semibold uppercase">HarperCollins</span>
        </div>
      ),
    },
    {
      name: "Bloomsbury",
      svg: (
        <div className="flex items-center gap-1.5 font-serif text-white/80 hover:text-white transition-colors">
          <span className="text-sm tracking-widest uppercase font-serif font-bold">BLOOMSBURY</span>
        </div>
      ),
    },
  ];

  // Duplicate for seamless infinite loop
  const marqueeItems = [...brands, ...brands, ...brands];

  return (
    <div className="w-full relative py-3 sm:py-4 overflow-hidden select-none">
      {/* Label above marquee */}
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-[11px] sm:text-xs font-light text-zinc-500 tracking-wider uppercase">
          Brands & literary communities we collaborate with:
        </p>
      </div>

      {/* Edge gradient masks for smooth fade in/out */}
      <div className="absolute left-0 inset-y-0 w-24 sm:w-36 bg-gradient-to-r from-[#08090a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 sm:w-36 bg-gradient-to-l from-[#08090a] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 sm:gap-16 md:gap-20">
          {marqueeItems.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              {brand.svg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
