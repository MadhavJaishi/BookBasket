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
    }a
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
  return (
    <div className=" h-auto bg-zinc-900 px-12 py-4 flex items-center justify-center round-xl">
      <div className="bg-zinc-800 rounded-lg px-4 py-5 w-full md:w-4/6 lg:w-3/6">
        <p className="text-rose-400 font-bold text-2xl mb-5">LogIn</p>
        <div className="mt-4">
          <div>
            <label htmlFor="username" className="text-zinc-400">
              Username
            </label>
            <input
              type="text"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              placeholder="username"
              name="username"
              id="username"
              required
              value={Values.username}
              onChange={change}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="password" className="text-zinc-400">
              Password
            </label>
            <input
              type="text"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              placeholder="password"
              name="password"
              id="password"
              required
              value={Values.password}
              onChange={change}
            />
          </div>
          <div className="mt-4">
            <button
              className="w-full bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700  transition-all duration-300"
              onClick={submit}
            >
              LogIn
            </button>
          </div>
          <p className="flex mt-4 items-center justify-center text-zinc-200 font-semibold">
            Or
          </p>
          <p className="flex mt-4 items-center justify-center text-zinc-300 font-semibold">
            Don't have and account? &nbsp;
            <Link to="/signup" className="hover:text-emerald-400">
              <u>SignUp</u>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
