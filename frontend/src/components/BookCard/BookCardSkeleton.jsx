import { motion } from "framer-motion";

const BookCardSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-zinc-800 rounded p-4 flex flex-col relative overflow-hidden h-[360px]"
        >
          {/* Cover Shimmer Box */}
          <div className="bg-zinc-700/60 rounded h-[25vh] w-full relative overflow-hidden flex items-center justify-center">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
            />
          </div>

          {/* Title Lines Shimmer */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="h-5 bg-zinc-700/70 rounded w-3/4 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                  delay: 0.1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
              />
            </div>
            <div className="h-4 bg-zinc-700/50 rounded w-1/2 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                  delay: 0.2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
              />
            </div>
            <div className="h-6 bg-zinc-700/80 rounded w-1/3 mt-1 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                  delay: 0.3,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default BookCardSkeleton;
