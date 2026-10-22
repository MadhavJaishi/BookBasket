import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useModal } from "../context/ModalContext";
import {
  HiBookOpen,
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiExclamationCircle,
  HiLockClosed,
  HiShieldCheck,
} from "react-icons/hi2";
import AuthLayout from "../components/Auth/AuthLayout";

const SignUp = () => {
  const [step, setStep] = useState(1); // 1: Username only, 2: Locked username + Email & Password
  const [Values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heldTime, setHeldTime] = useState("");

  const navigate = useNavigate();
  const { showAlert, showToast } = useModal();

  // Unique session identifier to distinguish different users in temporary holds
  const getSessionId = () => {
    let sid = sessionStorage.getItem("bookbasket_signup_session");
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("bookbasket_signup_session", sid);
    }
    return sid;
  };

  const change = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (name === "username") {
      setUsernameError("");
    }
  };

  const handleNext = async (e) => {
    if (e) e.preventDefault();
    const cleanUsername = Values.username.trim();

    if (!cleanUsername) {
      setUsernameError("Please enter a username to proceed.");
      return;
    }

    if (cleanUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters long.");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const sessionId = getSessionId();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/check-username`,
        { username: cleanUsername, sessionId }
      );

      if (response.data.available) {
        // Record static timestamp when user pressed Next
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setHeldTime(timeString);
        setStep(2);
      }
    } catch (error) {
      if (error.response?.data?.inTemporarySession) {
        const tempMsg =
          "This username exists in temporary session, Wait for 5 mins if you want to confirm of its unavailability.";
        showToast({
          title: "Temporary Session",
          message: tempMsg,
          type: "warning",
          duration: 6000,
        });
        setUsernameError(tempMsg);
      } else {
        const takenMsg =
          error.response?.data?.msg ||
          "Please select another username as this has already been taken.";
        showToast({
          title: "Username Taken",
          message: takenMsg,
          type: "error",
          duration: 6000,
        });
        setUsernameError(takenMsg);
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleBack = async () => {
    // Optionally release the temporary hold so user can pick another username
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/release-username`,
        {
          username: Values.username.trim(),
          sessionId: getSessionId(),
        }
      );
    } catch (err) {
      // Ignore background release error
    }
    setStep(1);
    setUsernameError("");
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!Values.email.trim() || !Values.password) {
        showAlert({
          title: "Missing Information",
          message: "Please fill in both email and password.",
          type: "warning",
        });
        return;
      }

      setIsSubmitting(true);
      const sessionId = getSessionId();

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/sign-up`,
        {
          username: Values.username.trim(),
          email: Values.email.trim(),
          password: Values.password,
          sessionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      showAlert({
        title: "Account Created!",
        message:
          "Your BookBasket account has been created successfully. Please sign in to continue.",
        type: "success",
        onConfirm: () => navigate("/login"),
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      // If user1 delayed more than 5 minutes and another user took it
      if (error.response?.status === 411 || error.response?.status === 409) {
        const takenMsg =
          "Please select another username as this has already been taken.";
        showToast({
          title: "Username Taken",
          message: takenMsg,
          type: "error",
          duration: 6000,
        });
        setUsernameError(takenMsg);
        setStep(1); // Return user1 to Step 1 to choose another username
        return;
      }

      showToast({
        title: "Registration Failed",
        message:
          error.response?.data?.msg ||
          "Something went wrong while registering your account.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle =
    "w-full mt-2 bg-zinc-950 text-zinc-100 text-sm px-4 py-3 outline-none rounded-2xl border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all font-light placeholder:text-zinc-500 shadow-inner";

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-zinc-800/80 transition-all">
        {/* Heading */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <HiBookOpen className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-medium tracking-widest text-emerald-400 uppercase">
              Join BookBasket
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Create Account
          </h1>
          <p className="text-zinc-400 font-light text-sm mt-1.5">
            {step === 1
              ? "Choose your unique reader handle to get started."
              : "Complete your credentials to enter the library."}
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 1 ? "w-8 bg-emerald-400" : "w-4 bg-emerald-500/40"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 2 ? "w-8 bg-emerald-400" : "w-4 bg-zinc-700"
              }`}
            />
          </div>
        </div>

        {/* STEP 1: USERNAME ONLY */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div className="mb-5">
              <label
                htmlFor="username"
                className="text-xs font-light uppercase tracking-wider text-zinc-400 block"
              >
                Choose Username
              </label>
              <input
                type="text"
                className={`${inputStyle} ${
                  usernameError
                    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
                    : ""
                }`}
                placeholder="e.g. rahul_reader"
                name="username"
                id="username"
                value={Values.username}
                onChange={change}
                autoComplete="username"
                autoFocus
              />

              {usernameError ? (
                <p className="text-red-400 text-xs mt-2 flex items-start gap-1.5 font-light animate-fadeIn leading-relaxed">
                  <HiExclamationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{usernameError}</span>
                </p>
              ) : (
                <p className="text-zinc-500 text-[11px] mt-1.5 font-light">
                  Must be at least 3 characters. Once available, it will be held for you for 5 mins.
                </p>
              )}
            </div>

            {/* Next Button */}
            <button
              type="submit"
              disabled={isCheckingUsername}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 rounded-full text-sm transition-all shadow-lg hover:shadow-white/10 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCheckingUsername ? (
                <span>Checking availability...</span>
              ) : (
                <>
                  <span>Next</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: USERNAME LOCKED + EMAIL & PASSWORD */}
        {step === 2 && (
          <form onSubmit={submit} className="space-y-4">
            {/* Locked Username Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="locked-username"
                  className="text-xs font-light uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"
                >
                  <HiLockClosed className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Username</span>
                </label>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Change username"
                >
                  <HiArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              <div className="relative mt-2">
                <input
                  type="text"
                  id="locked-username"
                  readOnly
                  value={Values.username}
                  className="w-full bg-zinc-950/90 text-zinc-300 text-sm px-4 py-3 outline-none rounded-2xl border border-zinc-800/80 cursor-not-allowed font-medium pr-28 select-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  <HiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>On Hold</span>
                </div>
              </div>
            </div>

            {/* Static Notice: Username held for 5 minutes (no timer, static display) */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-light flex items-start gap-2.5">
              <HiShieldCheck className="text-emerald-400 text-base shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-medium text-emerald-300">
                  Username on hold for 5 minutes
                </p>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  This username is on hold for you for the next 5 mins (reserved at {heldTime || "now"}).
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-light uppercase tracking-wider text-zinc-400 block"
              >
                Email Address
              </label>
              <input
                type="email"
                className={inputStyle}
                placeholder="name@domain.com"
                name="email"
                id="email"
                value={Values.email}
                onChange={change}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-xs font-light uppercase tracking-wider text-zinc-400 block"
              >
                Password
              </label>
              <input
                type="password"
                className={inputStyle}
                placeholder="Choose a secure password"
                name="password"
                id="password"
                value={Values.password}
                onChange={change}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Action Buttons: Back + Create Account */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium transition-all cursor-pointer active:scale-[0.98]"
              >
                <HiArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 rounded-full text-sm transition-all shadow-lg hover:shadow-white/10 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
          <span className="text-zinc-500 text-xs font-light">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 font-light">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium ml-1 transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
