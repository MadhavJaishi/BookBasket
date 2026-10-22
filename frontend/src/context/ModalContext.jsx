import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLock,
  FaTimes,
  FaWifi,
  FaRedo,
  FaTimesCircle,
} from "react-icons/fa";
import { checkInternetConnection } from "../utils/network";

const ModalContext = createContext(null);

// Individual Toast Item with auto-dismiss progress and slide animation
const ToastItem = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration || 4000);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 280);
  }, [onDismiss, toast.id]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  }, [handleDismiss]);

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 500);
    }
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  // Visual styling config based on toast type
  const getToastConfig = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: FaCheckCircle,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
          borderColor: "border-emerald-500/40",
          progressBg: "bg-emerald-500",
          glow: "shadow-emerald-950/40",
        };
      case "error":
        return {
          icon: FaExclamationCircle,
          iconColor: "text-red-400",
          iconBg: "bg-red-500/15 border-red-500/30",
          borderColor: "border-red-500/40",
          progressBg: "bg-red-500",
          glow: "shadow-red-950/40",
        };
      case "warning":
        return {
          icon: FaExclamationTriangle,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
          borderColor: "border-emerald-500/40",
          progressBg: "bg-emerald-500",
          glow: "shadow-emerald-950/40",
        };
      default:
        return {
          icon: FaInfoCircle,
          iconColor: "text-sky-400",
          iconBg: "bg-sky-500/15 border-sky-500/30",
          borderColor: "border-sky-500/40",
          progressBg: "bg-sky-500",
          glow: "shadow-sky-950/40",
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={`relative w-84 sm:w-96 bg-[#0c0e10]/95 backdrop-blur-xl border ${config.borderColor} rounded-2xl p-4 shadow-2xl ${config.glow} transition-all duration-300 pointer-events-auto flex items-start gap-3.5 group overflow-hidden ${
        isExiting
          ? "opacity-0 translate-x-12 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-slideInRight"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${config.iconBg} ${config.iconColor} text-base shrink-0 mt-0.5 shadow-sm`}
      >
        <IconComponent />
      </div>

      {/* Text Details */}
      <div className="flex-1 min-w-0 pr-3">
        {toast.title && (
          <h4 className="text-xs font-serif font-medium text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
        )}
        {toast.message && (
          <p className="text-zinc-300 font-light text-[11px] leading-relaxed mt-0.5 break-words">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <FaTimes className="text-xs" />
      </button>

      {/* Progress Bar Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/60 overflow-hidden">
        <div
          className={`h-full ${config.progressBg} transition-all linear`}
          style={{
            animation: `shrinkWidth ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export const ModalProvider = ({ children }) => {
  const navigate = useNavigate();

  // Toast Queue
  const [toasts, setToasts] = useState([]);

  // Confirmation / Auth Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning", // 'warning', 'auth', 'error'
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const [checkingInternet, setCheckingInternet] = useState(false);
  const [internetResult, setInternetResult] = useState(null);

  const handleModalCheckInternet = async () => {
    setCheckingInternet(true);
    setInternetResult(null);
    try {
      const res = await checkInternetConnection();
      setInternetResult(res);
    } catch (e) {
      setInternetResult({
        online: false,
        message: "Unable to verify network connectivity.",
      });
    } finally {
      setCheckingInternet(false);
    }
  };

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setInternetResult(null);
    setCheckingInternet(false);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Non-blocking Toast notification for all alerts
  const showToast = useCallback(
    ({
      title = "",
      message = "",
      type = "info",
      duration = 3800,
      onConfirm = null,
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, title, message, type, duration, onConfirm };
      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 active toasts
      if (onConfirm) {
        onConfirm();
      }
    },
    []
  );

  // showAlert alias to showToast so existing alerts display in the toaster seamlessly
  const showAlert = useCallback(
    (args) => {
      if (typeof args === "string") {
        showToast({ message: args });
      } else {
        showToast(args);
      }
    },
    [showToast]
  );

  // Interactive Confirmation Modal (requires user button action)
  const showConfirm = useCallback(
    ({
      title = "Confirm Action",
      message = "",
      type = "warning",
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm = null,
      onCancel = null,
    }) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          closeModal();
        },
        onCancel: () => {
          if (onCancel) onCancel();
          closeModal();
        },
      });
    },
    [closeModal]
  );

  // Interactive Authentication Modal (requires user button action)
  const showAuthModal = useCallback(
    ({
      title = "Sign In Required",
      message = "You must login first to access this feature.",
      proceedText = "Sure, Proceed to login",
      cancelText = "Keep exploring, login later",
      onProceed = null,
      onCancel = null,
    } = {}) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type: "auth",
        confirmText: proceedText,
        cancelText: cancelText,
        onConfirm: () => {
          closeModal();
          if (onProceed) {
            onProceed();
          } else {
            navigate("/login");
          }
        },
        onCancel: () => {
          closeModal();
          if (onCancel) onCancel();
        },
      });
    },
    [closeModal, navigate]
  );

  // Interactive Timeout Modal with network diagnosis and retry
  const showTimeoutModal = useCallback(
    ({
      title = "Request Timed Out",
      message = "The operation took longer than 10 seconds to respond. Please check your connection and try again.",
      onRetry = null,
      onCancel = null,
    } = {}) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type: "timeout",
        confirmText: "Retry Action",
        cancelText: "Dismiss",
        onConfirm: () => {
          closeModal();
          if (onRetry) onRetry();
        },
        onCancel: () => {
          closeModal();
          if (onCancel) onCancel();
        },
      });
    },
    [closeModal]
  );

  // Modal theme config
  const getModalConfig = () => {
    switch (modalState.type) {
      case "timeout":
        return {
          icon: FaExclamationTriangle,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/20",
          btnColor: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold",
          badge: "10s Timeout",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "error":
        return {
          icon: FaExclamationCircle,
          iconColor: "text-red-400",
          iconBg: "bg-red-500/10 border-red-500/20",
          btnColor: "bg-red-500 hover:bg-red-400 text-white",
          badge: "Error Action",
          badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
        };
      case "auth":
        return {
          icon: FaLock,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          btnColor: "bg-white hover:bg-zinc-200 text-zinc-950",
          badge: "Account Required",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "warning":
      default:
        return {
          icon: FaExclamationTriangle,
          iconColor: "text-emerald-400",
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          btnColor: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950",
          badge: "Confirmation",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  return (
    <ModalContext.Provider
      value={{
        showAlert,
        showToast,
        showConfirm,
        showAuthModal,
        showTimeoutModal,
        closeModal,
      }}
    >
      {children}

      {/* Global Toast Container (Top Right Stack) */}
      {createPortal(
        <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none max-w-full">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>,
        document.body
      )}

      {/* Interactive Confirmation / Auth / Timeout Modal Dialog */}
      {modalState.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
              onClick={closeModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
            />

            {/* Modal Dialog */}
            <div
              className="relative bg-[#0d0e10] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 transition-all scale-100 animate-scaleUp text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/60 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes className="text-sm" />
              </button>

              {/* Header / Icon & Badge */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${config.iconBg} ${config.iconColor} text-xl flex-shrink-0 shadow-lg`}
                >
                  <IconComponent />
                </div>
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full border ${config.badgeColor}`}
                >
                  {config.badge}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-white font-medium tracking-tight">
                  {modalState.title}
                </h3>
                <p className="text-zinc-300 font-light text-xs sm:text-sm leading-relaxed mt-1.5">
                  {modalState.message}
                </p>
              </div>

              {/* Timeout Network Connectivity Test Section */}
              {modalState.type === "timeout" && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleModalCheckInternet}
                    disabled={checkingInternet}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium py-2.5 px-4 rounded-2xl transition-all"
                  >
                    <FaWifi className={`text-xs ${checkingInternet ? "animate-pulse text-emerald-400" : ""}`} />
                    <span>{checkingInternet ? "Testing Connection..." : "Check Internet Connection"}</span>
                  </button>

                  {internetResult && (
                    <div
                      className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 text-left transition-all animate-fadeIn ${
                        internetResult.online
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                          : "bg-red-500/10 border border-red-500/30 text-red-300"
                      }`}
                    >
                      {internetResult.online ? (
                        <FaCheckCircle className="text-emerald-400 text-sm flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-red-400 text-sm flex-shrink-0" />
                      )}
                      <span className="font-light leading-snug">{internetResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    if (modalState.onConfirm) {
                      modalState.onConfirm();
                    } else {
                      closeModal();
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 shadow-md ${config.btnColor} text-center flex-1 flex items-center justify-center gap-2`}
                >
                  {modalState.type === "timeout" && <FaRedo className="text-xs" />}
                  <span>{modalState.confirmText}</span>
                </button>

                {modalState.cancelText && (
                  <button
                    onClick={() => {
                      if (modalState.onCancel) {
                        modalState.onCancel();
                      } else {
                        closeModal();
                      }
                    }}
                    className="px-5 py-2.5 rounded-full font-light text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-all text-center flex-1"
                  >
                    {modalState.cancelText}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export default ModalContext;
