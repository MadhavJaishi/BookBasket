import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Home from './pages/Home'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import AllBooks from "./pages/AllBooks"
import LogIn from "./pages/LogIn"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import Cart from "./pages/Cart"
import AboutUs from "./pages/AboutUs"
import ServerDown from "./pages/ServerDown"
import { Routes, Route } from 'react-router-dom'
import BookDetails from './components/BookDetails/BookDetails'
import { useDispatch, useSelector } from 'react-redux'
import { authActions } from "./store/auth"
import Favourites from './components/Profile/Favourites'
import UserOrderHistory from './components/Profile/UserOrderHistory'
import AllOrders from './components/Profile/AllOrders'
import AddBook from './components/Profile/AddBook'
import CatalogImporter from './components/Profile/CatalogImporter'
import AdminDashboard from './components/Profile/AdminDashboard'
import AdminInventory from './components/Profile/AdminInventory'
import AdminUsers from './components/Profile/AdminUsers'
import Settings from './components/Profile/Settings'
import UpdateBook from './pages/UpdateBook'
import { fetchBooks } from './store/bookSlice'
import { fetchCart } from './store/cartSlice'

import MyLibrary from "./pages/MyLibrary"
import Community from "./pages/Community"
import BookClubs from "./pages/BookClubs"
import ScrollManager from "./components/Common/ScrollManager"

const App = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const [isServerDown, setIsServerDown] = useState(false);

  const initializeApp = useCallback(() => {
    if (localStorage.getItem("id") && localStorage.getItem("token") && localStorage.getItem("role")) {
      dispatch(authActions.login());
      dispatch(authActions.changeRole(localStorage.getItem("role")));
      dispatch(fetchBooks());
      dispatch(fetchCart());
    }
  }, [dispatch]);

  // Initial server ping and health check
  const pingServer = useCallback(async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:1000/api/v1";
    const rootUrl = backendUrl.replace(/\/api\/v1\/?$/, "");

    try {
      let res;
      try {
        res = await axios.get(`${backendUrl}/health`, { timeout: 3500 });
      } catch (err1) {
        try {
          res = await axios.get(`${rootUrl}/health`, { timeout: 3500 });
        } catch (err2) {
          res = await axios.get(`${backendUrl}/get-recent-books`, { timeout: 3500 });
        }
      }

      if (res && (res.status === 200 || res.status === 304 || res.data)) {
        setIsServerDown(false);
        initializeApp();
      }
    } catch (err) {
      console.warn("Backend server health check failed:", err.message);
      if (!err.response || err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED") {
        setIsServerDown(true);
      }
    }
  }, [initializeApp]);

  useEffect(() => {
    initializeApp();
    pingServer();

    // Global Axios interceptor to catch any server-down network errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // If there's no response (network down / connection refused) or explicit server outage status
        if (
          !error.response ||
          error.code === "ERR_NETWORK" ||
          error.code === "ECONNREFUSED" ||
          (error.response && [502, 503, 504].includes(error.response.status))
        ) {
          console.error("Network / Server error caught by interceptor:", error);
          setIsServerDown(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [pingServer]);

  // Handler when server comes back online via the ServerDown check button
  const handleServerRestored = () => {
    setIsServerDown(false);
    initializeApp();
  };

  if (isServerDown) {
    return <ServerDown onServerRestored={handleServerRestored} />;
  }

  return (
    <div className="bg-[#08090a] min-h-screen text-zinc-100 flex flex-col justify-between">
      <ScrollManager />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all-books" element={<AllBooks />} />
          <Route path="/library" element={<MyLibrary />} />
          <Route path="/community" element={<Community />} />
          <Route path="/book-clubs" element={<BookClubs />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} >
            {role === "user" ? (
              <>
                <Route index element={<Favourites />} />
                <Route path="/profile/orderHistory" element={<UserOrderHistory />} />
              </>
            ) : (
              <>
                <Route index element={<AdminDashboard />} />
                <Route path="/profile/orders" element={<AllOrders />} />
                <Route path="/profile/inventory" element={<AdminInventory />} />
                <Route path="/profile/users" element={<AdminUsers />} />
                <Route path="/profile/add-book" element={<AddBook />} />
                <Route path="/profile/import-catalog" element={<CatalogImporter />} />
                <Route path="/profile/orderHistory" element={<UserOrderHistory />} />
              </>
            )}
            <Route path="/profile/settings" element={<Settings />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/update-book/:id" element={<UpdateBook />} />
          <Route path="/view-book-details/:id" element={<BookDetails />}/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;