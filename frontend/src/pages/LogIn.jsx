import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authActions } from "../store/auth";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useModal } from "../context/ModalContext";
import { HiBookOpen } from "react-icons/hi2";
import AuthLayout from "../components/Auth/AuthLayout";

const LogIn = () => {
  const [Values, setValues] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useModal();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...Values, [name]: value });
  };

  const submit = async () => {
    try {
      if (Values.username === "" || Values.password === "") {
        showAlert({
          title: "Missing Fields",
          message: "Please enter both your username and password.",
          type: "warning",
        });
        return;
      }

      const api_url = `${import.meta.env.VITE_BACKEND_URL}/sign-in`;

      const response = await axios.post(api_url, Values);

      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.role));

      const data = response.data;

      localStorage.setItem("id", data.id);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      showAlert({
        title: "Welcome Back",
        message: "Login successful! Redirecting to your library...",
        type: "success",
        onConfirm: () => navigate("/"),
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      if (error.response) {
        showAlert({
          title: "Sign In Failed",
          message: error.response.data.msg || "Invalid credentials",
          type: "error",
        });
      } else {
        showAlert({
          title: "Connection Error",
          message: "Server is not reachable. Please check your connection.",
          type: "error",
        });
      }
    }
  };

  const inputStyle =
    "w-full mt-2 bg-zinc-950 text-zinc-100 text-sm px-4 py-3.5 outline-none rounded-2xl border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all font-light placeholder:text-zinc-500 shadow-inner";

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-zinc-800/80">
        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
            <HiBookOpen className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-medium tracking-widest text-emerald-400 uppercase">
              BookBasket Access
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Welcome Back
          </h1>
          <p className="text-zinc-400 font-light text-sm mt-2">
            Sign in to access your saved shelf, orders, and community.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {/* Username */}
          <div className="mb-5">
            <label
              htmlFor="username"
              className="text-xs font-light uppercase tracking-wider text-zinc-400 block"
            >
              Username
            </label>

            <input
              type="text"
              className={inputStyle}
              placeholder="Enter your username"
              name="username"
              id="username"
              value={Values.username}
              onChange={change}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="text-xs font-light uppercase tracking-wider text-zinc-400 block"
            >
              Password
            </label>

            <input
              type="password"
              className={inputStyle}
              placeholder="Enter your password"
              name="password"
              id="password"
              value={Values.password}
              onChange={change}
              autoComplete="current-password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 rounded-full text-sm transition-all shadow-lg hover:shadow-white/10 active:scale-[0.99] cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
          <span className="text-zinc-500 text-xs font-light">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 font-light">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium ml-1 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LogIn;
