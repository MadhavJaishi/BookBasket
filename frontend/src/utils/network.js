/**
 * Helper utility to test internet and server connectivity.
 */
export const checkInternetConnection = async () => {
  // 1. Basic browser navigator check
  const isNavigatorOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  if (!isNavigatorOnline) {
    return {
      online: false,
      message: "You are currently offline. Please check your WiFi or mobile data.",
    };
  }

  // 2. Active network probe to verify actual internet access
  try {
    const startTime = Date.now();
    // Use a lightweight cache-busted fetch to backend health or public endpoint
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:1000/api/v1";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${backendUrl}/health?_t=${Date.now()}`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Cache-Control": "no-cache" },
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;

    if (response.ok || response.status === 304 || response.status === 200) {
      return {
        online: true,
        latency,
        message: `Internet and server are online (${latency}ms).`,
      };
    } else {
      return {
        online: true,
        latency,
        message: "Internet is connected, but server responded with an error.",
      };
    }
  } catch (err) {
    // If backend ping failed, test standard internet connection via fallback
    try {
      const fallbackController = new AbortController();
      const fbTimeout = setTimeout(() => fallbackController.abort(), 3000);
      await fetch("https://www.google.com/favicon.ico", {
        mode: "no-cors",
        signal: fallbackController.signal,
      });
      clearTimeout(fbTimeout);
      return {
        online: true,
        message: "Internet is working, but backend server is unreachable.",
      };
    } catch (fbErr) {
      return {
        online: false,
        message: "No internet connection detected. Please check your network.",
      };
    }
  }
};
