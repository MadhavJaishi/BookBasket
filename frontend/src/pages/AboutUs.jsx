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

      {/* Office & Headquarters Map Section */}
      <OfficeMapSection />
    </div>
  );
};

export default AboutUs;