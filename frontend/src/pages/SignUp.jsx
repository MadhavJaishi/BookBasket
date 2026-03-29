import React, { useState } from "react";
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
        const response = await axios.post(
          "${process.env.BASE_URL}/sign-up",
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
      alert(error.response.data.msg);
    }
  };
  const inputStyle =
    "w-full mt-1 bg-zinc-900 text-sm text-zinc-100 p-2 outline-none rounded-md";
  const inputLabelColor = "text-white";
  const inputContainer = "mt-2";
  return (
    <div className="h-auto bg-zinc-900 px-12 py-4 flex items-center justify-center round-xl">
      <div className="bg-zinc-800 rounded-lg px-4 py-5 w-full md:w-4/6 lg:w-3/6">
        <p className="text-rose-400 font-bold text-2xl mb-6">Sign Up</p>
        <div className={inputContainer}>
          <div>
            <label htmlFor="" className={inputLabelColor}>
              Username
            </label>
            <input
              type="text"
              className={inputStyle}
              placeholder="e.g. Rahul"
              name="username"
              required
              value={Values.username}
              onChange={change}
            />
          </div>
          <div className={inputContainer}>
            <label htmlFor="" className={inputLabelColor}>
              Email
            </label>
            <input
              type="text"
              className={inputStyle}
              placeholder="xyz@gmail.com"
              name="email"
              required
              value={Values.email}
              onChange={change}
            />
          </div>
          <div className={inputContainer}>
            <label htmlFor="" className={inputLabelColor}>
              Password
            </label>
            <input
              type="text"
              className={inputStyle}
              placeholder="***"
              name="password"
              required
              value={Values.password}
              onChange={change}
            />
          </div>
          <div className={inputContainer}>
            <label htmlFor="" className={inputLabelColor}>
              Address
            </label>
            <textarea
              type="text"
              className={inputStyle}
              rows="5"
              placeholder="Give your full address"
              name="address"
              required
              value={Values.address}
              onChange={change}
            />
          </div>
          <div className={inputContainer}>
            <button
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300"
              onClick={submit}
            >
              Sign Up
            </button>
          </div>
          <p className="flex mt-4 items-center justify-center text-white font-semibold">
            Already have and account? &nbsp;
            <Link to="/login" className="text-blue-500 hover:text-zinc-300">
              <u>LogIn</u>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
