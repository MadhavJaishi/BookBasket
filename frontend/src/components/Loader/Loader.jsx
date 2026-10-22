import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaBookOpen,
  FaRedo,
  FaWifi,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { checkInternetConnection } from "../../utils/network";

const DYNAMIC_MESSAGES = [
  { at: 10, text: "Opening the literary gateway...", subtitle: "Connecting to BookBasket library..." },
  { at: 8, text: "Gathering books & reflections...", subtitle: "Retrieving catalog index..." },
  { at: 6, text: "Almost there, fetching pages...", subtitle: "Loading recommendations & details..." },
  { at: 3, text: "Please hang in there...", subtitle: "Compiling community reflections..." },
  { at: 1, text: "Finalizing your request...", subtitle: "Just a few moments more..." },
];

const Loader = ({
  onRetry,
  timeoutSeconds = 10,
  title,
  message,
  compact = false,
  fullScreen = false,
  error = null,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [hasTimedOut, setHasTimedOut] = useState(Boolean(error));
  const [checkingNet, setCheckingNet] = useState(false);
  const [netStatus, setNetStatus] = useState(null);

  const timerRef = useRef(null);

  // Sync external error prop
  useEffect(() => {
    if (error) {
      setHasTimedOut(true);
    }
  }, [error]);

  // Countdown timer from timeoutSeconds down to 0
  useEffect(() => {
    if (hasTimedOut) return;

    setTimeLeft(timeoutSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setHasTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeoutSeconds, hasTimedOut]);

  // Determine current encouraging message
  const currentMsgObj =
    DYNAMIC_MESSAGES.find((m) => timeLeft >= m.at) || DYNAMIC_MESSAGES[DYNAMIC_MESSAGES.length - 1];

  const handleRetryClick = useCallback(() => {
    setHasTimedOut(false);
    setNetStatus(null);
    setTimeLeft(timeoutSeconds);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }, [onRetry, timeoutSeconds]);

  const handleCheckInternet = async () => {
    setCheckingNet(true);
    setNetStatus(null);
    try {
      const res = await checkInternetConnection();
      setNetStatus(res);
    } catch (err) {
      setNetStatus({
        online: false,
        message: "Unable to verify network connectivity.",
      });
    } finally {
      setCheckingNet(false);
    }
  };

  // SVG Circular progress math
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / timeoutSeconds) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 text-xs py-2 select-none">
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
        <span className="font-light">{message || currentMsgObj.text}</span>
        <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
          {timeLeft}s
        </span>
      </div>
    );
  }

  // Error / Timeout Card View
  if (hasTimedOut) {
    return (
      <div
        className={`flex items-center justify-center p-4 select-none ${
          fullScreen ? "min-h-[70vh]" : "py-10"
        }`}
      >
        <div className="bg-[#0e1013]/90 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scaleUp">
          {/* Timeout Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg">
            <FaExclamationTriangle className="text-2xl text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
              Request Timeout (10s)
            </span>
            <h3 className="text-xl font-serif text-white font-medium">
              Loading took longer than expected
            </h3>
            <p className="text-xs text-zinc-400 font-light mt-1.5 leading-relaxed">
              We couldn't receive a response within 10 seconds. This might be due to a slow internet
              connection or server delay.
            </p>
          </div>

          {/* Network check result */}
          {netStatus && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 text-left transition-all animate-fadeIn ${
                netStatus.online
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}
            >
              {netStatus.online ? (
                <FaCheckCircle className="text-emerald-400 text-sm flex-shrink-0" />
              ) : (
                <FaTimesCircle className="text-red-400 text-sm flex-shrink-0" />
              )}
              <span className="font-light leading-snug">{netStatus.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={handleCheckInternet}
              disabled={checkingNet}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium py-2.5 px-4 rounded-full transition-all"
            >
              <FaWifi className={`text-xs ${checkingNet ? "animate-pulse" : ""}`} />
              <span>{checkingNet ? "Checking..." : "Check Internet"}</span>
            </button>

            <button
              onClick={handleRetryClick}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-full transition-all shadow-md hover:scale-[1.02]"
            >
              <FaRedo className="text-xs" />
              <span>Retry Loading</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Loading View with 10s Timer
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 select-none ${
        fullScreen ? "min-h-[70vh]" : "py-12"
      }`}
    >
      {/* Animated Circular Gauge & Center Pulse */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        {/* Outer Glow Halo */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />

        {/* SVG Circular Progress */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          {/* Background Track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="text-zinc-800/80"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="text-emerald-400 transition-all duration-1000 ease-linear"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Book Icon & Countdown Tag */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-emerald-500/30 flex items-center justify-center shadow-inner">
            <FaBookOpen className="text-emerald-400 text-xs animate-bounce" />
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-400 tracking-wider">
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Dynamic Animated Status Messages */}
      <div className="space-y-1.5 max-w-sm px-4">
        <h4 className="text-base sm:text-lg font-serif text-white font-medium tracking-tight animate-fadeIn">
          {title || currentMsgObj.text}
        </h4>
        <p className="text-xs text-zinc-400 font-light leading-relaxed animate-fadeIn">
          {message || currentMsgObj.subtitle}
        </p>
      </div>

      {/* Linear Micro Bar */}
      <div className="w-32 bg-zinc-900 h-1 rounded-full overflow-hidden mt-5 border border-zinc-800">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / timeoutSeconds) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Loader;