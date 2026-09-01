import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookOpen } from "react-icons/fa";

/**
 * Optimizes image URLs (specifically Open Library) via wsrv.nl CDN proxy
 * for 50ms WebP delivery, and provides a stylistic Framer Motion shimmer skeleton loader.
 */
const getOptimizedUrl = (url) => {
  if (!url) return "";
  // Check if URL is an Open Library cover URL or external HTTP/HTTPS link
  if (url.includes("covers.openlibrary.org") || (url.startsWith("http") && !url.includes("wsrv.nl"))) {
    // wsrv.nl caches at Cloudflare edge and converts dynamically to WebP
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=85`;
  }
  return url;
};

const OptimizedImage = ({
  src,
  alt = "Book Cover",
  className = "",
  containerClassName = "",
  objectFit = "object-contain",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getOptimizedUrl(src));
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    if (!fallbackAttempted && currentSrc !== src) {
      // If optimized CDN failed, fallback to original direct URL
      setFallbackAttempted(true);
      setCurrentSrc(src);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${containerClassName || "w-full h-full"}`}>
      {/* Stylistic Framer Motion Skeleton Shimmer */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="absolute inset-0 z-10 bg-zinc-800 rounded flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Subtle Pulse Base */}
            <motion.div
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-700/50 to-zinc-800"
            />

            {/* Stylistic Shimmer Wave */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
            />

            {/* Floating Book Icon Placeholder */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="z-20 text-zinc-600 text-3xl opacity-60"
            >
              <FaBookOpen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image with Framer Motion Fade-In */}
      {!hasError ? (
        <motion.img
          src={currentSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 0.97,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`${className} ${objectFit}`}
        />
      ) : (
        /* Stylish Fallback UI if Image fails to load */
        <div className="w-full h-full min-h-[160px] bg-zinc-800 rounded flex flex-col items-center justify-center p-4 text-zinc-500">
          <FaBookOpen className="text-4xl mb-2 text-zinc-600" />
          <span className="text-xs text-center font-medium line-clamp-2">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
