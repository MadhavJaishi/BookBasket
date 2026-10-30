import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaCompass,
  FaBookmark,
  FaUsers,
  FaArrowRight,
  FaBookOpen,
} from "react-icons/fa";
import {
  FaLocationDot,
  FaArrowUpRightFromSquare,
  FaDiamondTurnRight,
  FaClock,
  FaBuilding,
  FaHeart,
  FaShieldHeart,
  FaGem,
  FaCommentDots,
  FaBookOpenReader,
  FaCircleCheck,
} from "react-icons/fa6";

// Individual Word that fades from full opacity (1.0) to dim (0.15) sequentially from top-left to bottom-right
const ScrollWord = ({ word, index, total, scrollY }) => {
  const totalScrollDistance = 260;
  const wordDuration = 65;

  const startPixel = (index / total) * (totalScrollDistance - wordDuration);
  const endPixel = startPixel + wordDuration;

  const opacity = useTransform(scrollY, [startPixel, endPixel], [1, 0.15]);
  const y = useTransform(scrollY, [startPixel, endPixel], [0, -8]);
  const filter = useTransform(scrollY, [startPixel, endPixel], [
    "blur(0px)",
    "blur(1.5px)",
  ]);

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className="inline-block mr-[0.25em] text-white transition-colors duration-150"
    >
      {word}
    </motion.span>
  );
};

// Garuda BHIVE, BTM Layout, Bangalore Coordinates
const OFFICE_COORDS = [12.916573, 77.610116];
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Garuda+BHIVE+Workspace+BTM+Layout+Bangalore+Karnataka+India";
const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Garuda+BHIVE+Workspace+BTM+Layout+Bangalore+Karnataka+India";

const OfficeMapSection = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false, // Prevents unintended page scroll interference
      }).setView(OFFICE_COORDS, 16);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // High-detail Esri India Street Map
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri &mdash; India Street Map",
        }
      ).addTo(map);

      // Glowing Emerald Map Pin Icon
      const officePinIcon = L.divIcon({
        className: "custom-office-pin",
        html: `
          <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50% 50% 50% 0;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              transform: rotate(-45deg);
              box-shadow: 0 4px 20px rgba(16, 185, 129, 0.55), 0 0 0 3px rgba(255, 255, 255, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
              "></div>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker(OFFICE_COORDS, { icon: officePinIcon }).addTo(map);

      marker.bindPopup(`
        <div style="color: #09090b; font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; font-size: 13px; color: #047857;">BookBasket Headquarters</h4>
          <p style="margin: 0; font-size: 11px; color: #374151; line-height: 1.4;">
            Garuda BHIVE Workspace, BTM Layout<br />
            Bengaluru, Karnataka, India
          </p>
        </div>
      `);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 pb-28 space-y-8">
      {/* Section Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
          <FaLocationDot className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium tracking-widest text-emerald-400 uppercase">
            Headquarters & Community Hub
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
          Visit Our Space in Bangalore
        </h2>
        <p className="text-zinc-400 font-light text-sm mt-2 leading-relaxed">
          Drop by our collaborative workspace at Garuda BHIVE in BTM Layout. Meet fellow bibliophiles, discover intentional literature, or join our community discussions.
        </p>
      </div>

      {/* Main Grid: Details Card & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Office Information Card */}
        <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
                Physical Location
              </span>
              <h3 className="text-2xl font-serif text-white font-normal">
                Garuda BHIVE Workspace
              </h3>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Outer Ring Road, BTM Layout 2nd Stage, Kuvempu Nagar, Bengaluru, Karnataka 560068, India
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800/80 text-xs font-light text-zinc-300">
              <div className="flex items-start gap-3">
                <FaBuilding className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 block text-[11px]">Campus</span>
                  <span>Garuda BHIVE Innovation Campus, BTM Layout</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 block text-[11px]">Visiting Hours</span>
                  <span>Monday &ndash; Saturday: 9:00 AM &ndash; 7:30 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaCompass className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 block text-[11px]">Nearby Landmark</span>
                  <span>Near Udupi Garden Signal, BTM 2nd Stage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-3">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium py-3 px-5 rounded-full text-xs transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer"
            >
              <span>Open in Google Maps</span>
              <FaArrowUpRightFromSquare className="text-[10px]" />
            </a>

            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 py-3 px-5 rounded-full text-xs font-light transition-all border border-zinc-700/60 active:scale-95 cursor-pointer"
            >
              <FaDiamondTurnRight className="text-xs text-emerald-400" />
              <span>Directions</span>
            </a>
          </div>
        </div>

        {/* Right: Map Container with Hover Overlay Button */}
        <div className="lg:col-span-7 relative group rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl min-h-[380px] sm:min-h-[440px] bg-zinc-950">
          {/* Leaflet Map DOM */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[440px] z-10" />

          {/* Location Badge (Always Visible in Top Left) */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/90 px-3.5 py-1.5 rounded-full shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-white">
                Garuda BHIVE, BTM Layout
              </span>
            </div>
          </div>

          {/* Hover Overlay Button to Open Google Maps */}
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center transition-all duration-300">
            {/* Subtle dark backdrop on hover */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Floating Open in Google Maps Button */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative pointer-events-auto flex items-center gap-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-medium px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-2xl transition-all duration-300 transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 cursor-pointer hover:shadow-emerald-500/20 active:scale-95"
              title="Open location in Google Maps app or website"
            >
              <FaLocationDot className="text-emerald-600 text-sm" />
              <span>Open in Google Maps</span>
              <FaArrowUpRightFromSquare className="text-[10px] text-zinc-600 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const BrandStorySection = () => {
  const storyPillars = [
    {
      icon: FaBookOpenReader,
      tag: "Made by Book Lovers",
      title: "For Book Lovers, by Book Lovers",
      description:
        "We are passionate readers ourselves, and we intimately understand what makes finding and owning a great book so special. We know the anticipation of an unread spine, the comfort of losing yourself in a new world, and the joy of finding words that stay with you forever. Our mission is to provide the warmest, most thoughtful experience for every single reader who steps into Bookbasket.",
      highlight: "Crafted by readers who share your deep reverence for stories.",
    },
    {
      icon: FaShieldHeart,
      tag: "Uncompromising Integrity",
      title: "Authentic Books You Can Trust",
      description:
        "We know that for true book lovers, building a personal library is a labor of love, memory, and pride. That is why authenticity is at the very heart of everything we do. We are committed to offering only genuine, publisher-original books — never unauthorized copies, shoddy reprints, or counterfeits. When you acquire a book here, you can trust that it is an authentic keepsake built to last for generations.",
      highlight: "100% genuine, original editions worthy of your shelves.",
    },
    {
      icon: FaGem,
      tag: "Curated with Care",
      title: "A Collection Worth Exploring",
      description:
        "We believe browsing for books should ignite genuine excitement. Whether you are on the hunt for your next favorite read, tracking down an elusive special edition, or finally securing a cherished book you have always wanted to own, our shelves are carefully curated to offer volumes that inspire, intrigue, and reward curious minds.",
      highlight: "Treasured discoveries, special editions, and timeless favorites.",
    },
    {
      icon: FaCommentDots,
      tag: "A Living Community",
      title: "More Than Just a Bookstore",
      description:
        "Bookbasket aims to be a welcoming sanctuary where hardcore bibliophiles, casual readers, passionate collectors, and literary explorers can connect with people who share their taste. Discover new books, exchange heartfelt recommendations, debate your favorite authors and genres, share honest opinions, make friends with kindred spirits, and feel like you truly belong to a community that understands your love for reading.",
      highlight: "Connecting readers, sparking discussions, and finding your tribe.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 space-y-12">
      {/* Section Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium tracking-widest text-emerald-400 uppercase">
          <FaHeart className="w-2.5 h-2.5 text-emerald-400" />
          <span>Our Story & Brand Purpose</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-normal leading-tight">
          Built by Book Lovers, <br className="hidden sm:inline" />
          <span className="italic font-light text-emerald-400">for Book Lovers.</span>
        </h2>
        <p className="text-zinc-400 font-light text-base sm:text-lg leading-relaxed">
          At Bookbasket, we understand that books are so much more than just products — they are transformative experiences, cherished memories, lifelong passions, and treasures worth collecting.
        </p>
      </div>

      {/* Featured Manifesto Card */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-emerald-950/30 border border-zinc-800/90 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-light text-emerald-400 tracking-wider uppercase">
            <FaCircleCheck className="text-emerald-400 text-xs" />
            <span>Our Core Commitment</span>
          </div>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif text-zinc-100 font-light leading-snug">
            &ldquo;Bookbasket is not just about buying books; it is about celebrating the love of reading, collecting authentic books, and bringing book lovers together.&rdquo;
          </blockquote>
          <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed max-w-2xl">
            Whether you are lovingly curating your personal library, discovering a new author who alters your worldview, or searching for fellow readers who understand your devotion to the written word, Bookbasket is honored to be part of your reading journey.
          </p>
        </div>
      </div>

      {/* 4 Story Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {storyPillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <div
              key={index}
              className="group relative bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/30 p-7 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl group-hover:scale-105 group-hover:bg-emerald-500/15 transition-all">
                    <Icon />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400/90 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/15">
                    {pillar.tag}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-2xl font-serif text-white font-normal group-hover:text-emerald-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-400 font-light text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-zinc-400 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{pillar.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Connection Banner */}
      <div className="rounded-3xl p-8 sm:p-10 bg-zinc-900/50 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h4 className="text-2xl font-serif text-white font-normal">
            Find Your Tribe in Our Community
          </h4>
          <p className="text-zinc-400 font-light text-sm leading-relaxed">
            Share your reading reflections, exchange recommendations with readers who love what you love, and celebrate stories together.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/community"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer"
          >
            <span>Join Our Community</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
          <Link
            to="/all-books"
            className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-full text-xs sm:text-sm font-light transition-all border border-zinc-700/60 active:scale-95 cursor-pointer"
          >
            <span>Explore Authentic Books</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

const AboutUs = () => {
  const { scrollY } = useScroll();

  const quoteText = "Finding a great book should be as inspiring as reading one.";
  const words = quoteText.split(" ");

  return (
    <div className="bg-[#08090a] text-zinc-100 min-h-screen">
      {/* Vision Hero Banner */}
      <section className="relative pt-20 sm:pt-28 pb-16 px-4 sm:px-8 lg:px-12 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-xs font-light text-emerald-400 tracking-widest uppercase mb-6 opacity-90">
            <FaBookOpen className="text-xs" />
            <span>Our Philosophy & Mission</span>
          </div>

          {/* Sequential Top-Left to Bottom-Right Scroll Fade */}
          <div className="my-2 max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight font-normal leading-[1.05] select-none">
              {words.map((word, i) => (
                <ScrollWord
                  key={i}
                  word={word}
                  index={i}
                  total={words.length}
                  scrollY={scrollY}
                />
              ))}
            </h1>
          </div>

          <p className="text-zinc-400 font-light text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mt-8 mb-10">
            BookBasket evolved from a simple bookstore into an intentional space for readers to discover ideas that transform their minds, track their progress, and connect through shared reflections.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/all-books"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-8 py-3 rounded-full text-sm transition-all shadow-lg"
            >
              Explore Catalog
            </Link>
            <Link
              to="/community"
              className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-light px-7 py-3 rounded-full text-sm transition-all border border-zinc-700/50 flex items-center gap-2"
            >
              <span>Join Community</span>
              <FaArrowRight className="text-[10px] text-zinc-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 space-y-12">
        <div className="max-w-xl">
          <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
            How We Are Different
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
            Designed for Intentional Readers
          </h2>
          <p className="text-zinc-400 font-light text-sm mt-2">
            Traditional bookstores focus strictly on sales. We cultivate the entire lifelong reading journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 hover:bg-zinc-900/70 p-8 rounded-3xl space-y-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FaCompass />
            </div>
            <h3 className="text-xl font-serif text-white font-normal">1. Intelligent Discovery</h3>
            <p className="text-zinc-400 font-light text-sm leading-relaxed">
              Explore by mood, mindset, or natural questions rather than crowded generic categories. Find books that match how you feel right now.
            </p>
          </div>

          <div className="bg-zinc-900/40 hover:bg-zinc-900/70 p-8 rounded-3xl space-y-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FaBookmark />
            </div>
            <h3 className="text-xl font-serif text-white font-normal">2. Reading Tracking & Goals</h3>
            <p className="text-zinc-400 font-light text-sm leading-relaxed">
              Organize your personal shelves, monitor real-time page progress, set annual goals, and build consistent reading habits.
            </p>
          </div>

          <div className="bg-zinc-900/40 hover:bg-zinc-900/70 p-8 rounded-3xl space-y-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FaUsers />
            </div>
            <h3 className="text-xl font-serif text-white font-normal">3. Reader Reflections</h3>
            <p className="text-zinc-400 font-light text-sm leading-relaxed">
              Share structured reactions (💡 Changed how I think, 🧠 Learned something), join book clubs, and discuss literary works with others.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story & Key Messages Section */}
      <BrandStorySection />

      {/* Office & Headquarters Map Section */}
      <OfficeMapSection />
    </div>
  );
};

export default AboutUs;