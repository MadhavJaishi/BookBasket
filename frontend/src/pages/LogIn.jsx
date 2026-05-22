import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authActions } from "../store/auth";
import { useDispatch } from "react-redux";
import axios from "axios";

const LogIn = () => {
  const [Values, setValues] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...Values, [name]: value });
  };

  const submit = async () => {
    try {
      if (Values.username === "" || Values.password === "") {
        alert("All fields are required");
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

      alert("Login Successful");

      navigate("/profile");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.msg);
      } else {
        alert("Server not reachable");
      }
    }
  };

  const inputStyle =
    "w-full mt-2 bg-zinc-900/80 border border-zinc-700 focus:border-emerald-500 text-zinc-100 text-sm px-4 py-3 outline-none rounded-xl transition-all duration-300 placeholder:text-zinc-500";

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-3xl shadow-2xl p-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-rose-400">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Login to continue your reading journey.
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-zinc-300"
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
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-300"
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
          />
        </div>

        {/* Login Button */}
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/30"
          onClick={submit}
        >
          Log In
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
          <span className="text-zinc-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-all duration-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
