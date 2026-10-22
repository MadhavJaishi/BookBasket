import axios from "axios";

// 1. Configure default 10-second timeout on all Axios requests
axios.defaults.timeout = 10000;

// 2. Add global response interceptor for consistent timeout and network error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to timeout
    const isTimeout =
      error.code === "ECONNABORTED" ||
      (error.message && error.message.toLowerCase().includes("timeout"));

    if (isTimeout) {
      error.isTimeout = true;
      error.userFriendlyMessage =
        "The server request timed out after 10 seconds. Please check your internet connection and try again.";
    } else if (!error.response && (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED")) {
      error.isNetworkError = true;
      error.userFriendlyMessage =
        "Unable to connect to the network. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default axios;
