import React, { useState } from "react";
import axios from "axios";
import { FaServer, FaSyncAlt, FaExclamationTriangle, FaCheckCircle, FaWifi } from "react-icons/fa";

const ServerDown = ({ onServerRestored }) => {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const checkServerStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    setIsSuccess(false);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:1000/api/v1";
      // Extract base root url or ping health endpoints
      const rootUrl = backendUrl.replace(/\/api\/v1\/?$/, "");
      
      let res;
      try {
        res = await axios.get(`${backendUrl}/health`, { timeout: 4000 });
      } catch (e1) {
        // Fallback to root /health or /get-recent-books
        try {
          res = await axios.get(`${rootUrl}/health`, { timeout: 4000 });
        } catch (e2) {
          res = await axios.get(`${backendUrl}/get-recent-books`, { timeout: 4000 });
        }
      }

      if (res && (res.status === 200 || res.status === 304 || res.data)) {
        setIsSuccess(true);
        setStatusMessage("Server is back online! Redirecting to application...");
        setTimeout(() => {
          if (onServerRestored) {
            onServerRestored();
          }
        }, 1200);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Health check failed:", err);
      setIsSuccess(false);
      setStatusMessage("Server is still unreachable. Please ensure the backend is running and try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* Animated Server Offline Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <FaServer className="text-4xl text-zinc-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium uppercase tracking-widest mb-4">
          <FaWifi className="text-xs animate-pulse" />
          <span>Connection Lost</span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-4xl sm:text-5xl font-serif text-white font-normal tracking-tight mb-4">
          Server Unavailable
        </h1>

        {/* Message */}
        <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
          We are having trouble establishing a connection with the BookBasket backend server.
          The server might be stopped, undergoing maintenance, or unreachable.
        </p>

        {/* Check Server Button */}
        <button
          onClick={checkServerStatus}
          disabled={checking}
          className={`w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-300 shadow-xl ${
            checking
              ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : isSuccess
              ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              : "bg-white hover:bg-zinc-200 text-zinc-950 hover:scale-[1.02]"
          }`}
        >
          <FaSyncAlt className={`text-xs ${checking ? "animate-spin" : ""}`} />
          <span>{checking ? "Checking Server Status..." : "Check If Server Is Back"}</span>
        </button>

        {/* Status Feedback Alert */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-2xl text-xs sm:text-sm font-light max-w-md w-full flex items-center gap-3 transition-all animate-fadeIn ${
              isSuccess
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            {isSuccess ? (
              <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="text-red-400 text-lg flex-shrink-0" />
            )}
            <p className="text-left leading-relaxed">{statusMessage}</p>
          </div>
        )}

        {/* Technical Hint */}
        <div className="mt-12 text-zinc-600 text-xs font-light space-y-1">
          <p>Target: <code className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-mono text-[11px]">{import.meta.env.VITE_BACKEND_URL || "http://localhost:1000/api/v1"}</code></p>
          <p>If you are the developer, run <code className="text-zinc-400 font-mono">node app.js</code> in the backend directory.</p>
        </div>
      </div>
    </div>
  );
};

export default ServerDown;
