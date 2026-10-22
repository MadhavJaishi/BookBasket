import { useEffect, useRef, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// In-memory cache of scroll positions for instantaneous synchronous retrieval
const scrollPositions = new Map();

// Helper to get a stable key for the location
const getLocationKey = (location) => {
  return location.key || `${location.pathname}${location.search}`;
};

const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"
  const prevLocationRef = useRef(location);
  const activeRestorationTimerRef = useRef(null);
  const activeRafRef = useRef(null);
  const userInteractedRef = useRef(false);

  // 1. Set manual scroll restoration so native browser behavior doesn't jump or conflict
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. Continuously record the scroll position for the current location key
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const x = window.scrollX || window.pageXOffset || 0;
      const y = window.scrollY || window.pageYOffset || 0;

      const currentKey = getLocationKey(location);
      const pos = { x, y };

      // Update in-memory map
      scrollPositions.set(currentKey, pos);
      // Secondary fallback key by pathname + search
      scrollPositions.set(`${location.pathname}${location.search}`, pos);

      // Persist to sessionStorage
      try {
        sessionStorage.setItem(`bookbasket_scroll_${currentKey}`, JSON.stringify(pos));
      } catch (e) {
        // Ignore quota/private browsing errors
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location]);

  // 3. Detect user interaction to immediately cancel programmatic auto-scroll restoration
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      if (activeRestorationTimerRef.current) {
        clearInterval(activeRestorationTimerRef.current);
        activeRestorationTimerRef.current = null;
      }
      if (activeRafRef.current) {
        cancelAnimationFrame(activeRafRef.current);
        activeRafRef.current = null;
      }
    };

    const events = ["wheel", "touchstart", "touchmove", "keydown", "mousedown"];
    events.forEach((ev) => {
      window.addEventListener(ev, handleUserInteraction, { passive: true, capture: true });
    });

    return () => {
      events.forEach((ev) => {
        window.removeEventListener(ev, handleUserInteraction, { capture: true });
      });
    };
  }, []);

  // 4. Handle route changes (PUSH forward vs POP backward)
  useLayoutEffect(() => {
    // Reset user interaction flag on each route transition
    userInteractedRef.current = false;

    // Clear previous pending timers/frames
    if (activeRestorationTimerRef.current) {
      clearInterval(activeRestorationTimerRef.current);
      activeRestorationTimerRef.current = null;
    }
    if (activeRafRef.current) {
      cancelAnimationFrame(activeRafRef.current);
      activeRafRef.current = null;
    }

    const currentKey = getLocationKey(location);

    if (navigationType === "PUSH") {
      // === FORWARD NAVIGATION: Scroll to top (or target anchor hash) ===
      if (location.hash) {
        const targetElement = document.querySelector(location.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      // Immediately scroll window to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Keep at top for a few frames in case child mounting triggers layout shifts
      let frames = 0;
      const keepAtTop = () => {
        if (!userInteractedRef.current && frames < 6) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          frames++;
          activeRafRef.current = requestAnimationFrame(keepAtTop);
        }
      };
      activeRafRef.current = requestAnimationFrame(keepAtTop);
    } else if (navigationType === "POP") {
      // === BACKWARD / HISTORY NAVIGATION: Restore exact scroll position ===
      let saved = scrollPositions.get(currentKey);

      if (!saved) {
        try {
          const stored = sessionStorage.getItem(`bookbasket_scroll_${currentKey}`);
          if (stored) {
            saved = JSON.parse(stored);
          }
        } catch (e) {
          // ignore
        }
      }

      // Secondary fallback
      if (!saved) {
        saved = scrollPositions.get(`${location.pathname}${location.search}`);
      }

      const targetX = saved?.x ?? 0;
      const targetY = saved?.y ?? 0;

      if (targetX === 0 && targetY === 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }

      // First immediate scroll attempt
      window.scrollTo({ top: targetY, left: targetX, behavior: "instant" });

      const startTime = Date.now();
      const MAX_DURATION = 1500; // Check and restore for up to 1.5s as async data loads

      const checkAndRestore = () => {
        if (userInteractedRef.current) return;

        const currentY = window.scrollY || window.pageYOffset || 0;
        const maxScrollY = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );

        if (Math.abs(currentY - targetY) > 2) {
          const scrollToY = Math.min(targetY, maxScrollY);
          window.scrollTo({ top: scrollToY, left: targetX, behavior: "instant" });
        }

        // If we reached target position or timeout passed
        if (
          Math.abs((window.scrollY || 0) - targetY) <= 2 ||
          Date.now() - startTime > MAX_DURATION
        ) {
          if (activeRestorationTimerRef.current) {
            clearInterval(activeRestorationTimerRef.current);
            activeRestorationTimerRef.current = null;
          }
        }
      };

      activeRestorationTimerRef.current = setInterval(checkAndRestore, 30);
      activeRafRef.current = requestAnimationFrame(checkAndRestore);

      // Resize observer to immediately catch document height increases from fetched books/data
      let observer = null;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          if (!userInteractedRef.current) {
            checkAndRestore();
          }
        });
        observer.observe(document.body);
      }

      setTimeout(() => {
        if (observer) observer.disconnect();
      }, MAX_DURATION + 100);
    }

    prevLocationRef.current = location;
  }, [location, navigationType]);

  return null;
};

export default ScrollManager;
