import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [Values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
  });

  const navigate = useNavigate();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...Values, [name]: value });
  };

  const submit = async () => {
    try {
      if (
        Values.username === "" ||
        Values.email === "" ||
        Values.password === "" ||
        Values.address === ""
      ) {
        alert("All fields are required");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/sign-up`,
          Values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Something went wrong");
    }
  };

  const inputStyle =
    "w-full mt-2 bg-zinc-900/80 border border-zinc-700 focus:border-emerald-500 text-zinc-100 text-sm px-4 py-3 outline-none rounded-xl transition-all duration-300 placeholder:text-zinc-500";

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-3xl shadow-2xl p-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-rose-400">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Join BookBasket and explore your next favorite book.
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
            placeholder="e.g. Rahul"
            name="username"
            id="username"
            value={Values.username}
            onChange={change}
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email Address
          </label>
          <input
            type="email"
            className={inputStyle}
            placeholder="xyz@gmail.com"
            name="email"
            id="email"
            value={Values.email}
            onChange={change}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
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

        {/* Address */}
        <div className="mb-6">
          <label
            htmlFor="address"
            className="text-sm font-medium text-zinc-300"
          >
            Address
          </label>
          <textarea
            className={`${inputStyle} resize-none`}
            rows="3"
            placeholder="Enter your full address"
            name="address"
            id="address"
            value={Values.address}
            onChange={change}
          />
        </div>

        {/* Button */}
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/30"
          onClick={submit}
        >
          Create Account
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-all duration-300"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
