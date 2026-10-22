import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/Loader";
import { 
  FaBook, 
  FaBoxOpen, 
  FaUsers, 
  FaIndianRupeeSign, 
  FaPlus, 
  FaFileImport, 
  FaArrowRight, 
  FaCheck, 
  FaTruck, 
  FaClock, 
  FaBan 
} from "react-icons/fa6";
import { IoOpenOutline } from "react-icons/io5";
import { useModal } from "../../context/ModalContext";
import SeeUserData from "../../pages/SeeUserData";

const AdminDashboard = () => {
  const { showAlert } = useModal();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, ordersRes, usersRes] = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-all-books`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-all-orders`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-all-users`, { headers })
      ]);

      if (booksRes.status === "fulfilled" && booksRes.value.data) {
        setBooks(booksRes.value.data.data || []);
      }
      if (ordersRes.status === "fulfilled" && ordersRes.value.data) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        setUsers(usersRes.value.data.data || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Quick order status update
  const handleQuickStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-status/${orderId}`,
        { status: newStatus },
        { headers }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showAlert({
        title: "Status Updated",
        message: `Order marked as "${newStatus}"`,
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Update Failed",
        message: "Could not update order status.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader onRetry={fetchDashboardData} />
      </div>
    );
  }

  // Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled" && o.book?.price)
    .reduce((sum, o) => sum + (Number(o.book.price) || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "Order placed").length;
  const inTransitOrders = orders.filter((o) => o.status === "Out for delivery").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

  // Genre breakdown
  const genreCounts = books.reduce((acc, b) => {
    const g = b.genre || "General";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
              Admin Command Center
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-normal text-white mt-1">
            Platform Analytics & Overview
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Real-time catalog inventory, order fulfillment, and user metrics.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profile/add-book"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2.5 rounded-full text-xs font-medium transition-all shadow-lg shadow-emerald-950/40"
          >
            <FaPlus className="text-xs" /> Add Book
          </Link>
          <Link
            to="/profile/import-catalog"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-full text-xs font-medium transition-all border border-zinc-700/60"
          >
            <FaFileImport className="text-xs" /> Bulk Importer
          </Link>
          <Link
            to="/profile/inventory"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-full text-xs font-medium transition-all border border-zinc-700/60"
          >
            <FaBook className="text-xs" /> Inventory
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-light">Gross Volume</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FaIndianRupeeSign />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl lg:text-3xl font-serif text-white font-normal">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-emerald-400/90 mt-1 flex items-center gap-1 font-light">
              From {orders.length - cancelledOrders} fulfilled/active orders
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-light">Total Orders</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FaBoxOpen />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl lg:text-3xl font-serif text-white font-normal">
              {orders.length}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-light">
              <span className="text-emerald-400">{pendingOrders} pending</span>
              <span>•</span>
              <span className="text-emerald-400">{deliveredOrders} delivered</span>
            </div>
          </div>
        </div>

        {/* Total Books in Catalog */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-light">Live Catalog</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FaBook />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl lg:text-3xl font-serif text-white font-normal">
              {books.length}
            </h3>
            <p className="text-xs text-sky-400/90 mt-1 font-light">
              Across {Object.keys(genreCounts).length} unique genres
            </p>
          </div>
        </div>

        {/* Total Readers */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-light">Readers & Users</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FaUsers />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl lg:text-3xl font-serif text-white font-normal">
              {users.length > 0 ? users.length : "—"}
            </h3>
            <p className="text-xs text-purple-400/90 mt-1 font-light">
              Registered community members
            </p>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Stream & Genre Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <h2 className="text-base font-serif text-white font-normal flex items-center justify-between">
            <span>Fulfillment Pipeline</span>
            <span className="text-xs font-mono text-zinc-500 font-light">{orders.length} Total</span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
                  <FaClock />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Order Placed</p>
                  <p className="text-[10px] text-zinc-500">Awaiting dispatch</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400">{pendingOrders}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs">
                  <FaTruck />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Out for Delivery</p>
                  <p className="text-[10px] text-zinc-500">In transit</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-sky-400">{inTransitOrders}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
                  <FaCheck />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Delivered</p>
                  <p className="text-[10px] text-zinc-500">Completed</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400">{deliveredOrders}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-xs">
                  <FaBan />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-200">Cancelled</p>
                  <p className="text-[10px] text-zinc-500">Voided orders</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-red-400">{cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Catalog Categories */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif text-white font-normal">
              Catalog Genre Distribution
            </h2>
            <Link
              to="/profile/inventory"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-light"
            >
              Browse Inventory <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(genreCounts).length === 0 && (
              <p className="text-xs text-zinc-500">No books found in catalog.</p>
            )}
            {Object.entries(genreCounts).map(([genre, count]) => (
              <div
                key={genre}
                className="px-3.5 py-2 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-2 hover:border-zinc-700 transition-colors"
              >
                <span className="text-xs font-light text-zinc-200">{genre}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 font-medium">
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Catalog stats banner */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-emerald-300">Catalog Health Status</p>
              <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                All books are automatically enriched with OpenLibrary covers and metadata.
              </p>
            </div>
            <Link
              to="/profile/import-catalog"
              className="px-3 py-1.5 rounded-full bg-emerald-500 text-zinc-950 font-medium text-[11px] hover:bg-emerald-400 transition-colors shrink-0"
            >
              Run Batch Import
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif text-white font-normal">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              Latest incoming purchases with quick status controls.
            </p>
          </div>
          <Link
            to="/profile/orders"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-light"
          >
            View All ({orders.length}) <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-light">
                  <th className="py-3 px-3">Order / Item</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {recentOrders.map((ord) => {
                  const book = ord.book || {};
                  const user = ord.user || {};
                  return (
                    <tr key={ord._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {book.url ? (
                            <img
                              src={book.url}
                              alt={book.title}
                              className="w-8 h-11 object-cover rounded-lg shadow-sm border border-zinc-800"
                            />
                          ) : (
                            <div className="w-8 h-11 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">
                              <FaBook />
                            </div>
                          )}
                          <div>
                            <Link
                              to={book._id ? `/view-book-details/${book._id}` : "#"}
                              className="font-medium text-zinc-100 hover:text-emerald-400 transition-colors line-clamp-1"
                            >
                              {book.title || "Unknown Book"}
                            </Link>
                            <span className="text-[10px] text-zinc-500 font-light block">
                              {book.author || "Unknown Author"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-zinc-200">{user.username || "Reader"}</p>
                            <p className="text-[10px] text-zinc-500 font-light line-clamp-1">{user.email || ""}</p>
                          </div>
                          {user.username && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setUserModalOpen(true);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                              title="Inspect Customer"
                            >
                              <IoOpenOutline className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-zinc-100">
                        ₹{book.price || "—"}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleQuickStatus(ord._id, e.target.value)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full outline-none border cursor-pointer ${
                            ord.status === "Delivered"
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : ord.status === "Out for delivery"
                              ? "bg-sky-950/60 border-sky-500/40 text-sky-400"
                              : ord.status === "Cancelled"
                              ? "bg-red-950/60 border-red-500/40 text-red-400"
                              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                          }`}
                        >
                          <option value="Order placed" className="bg-zinc-900 text-zinc-200">
                            🟡 Placed
                          </option>
                          <option value="Out for delivery" className="bg-zinc-900 text-zinc-200">
                            🔵 In Transit
                          </option>
                          <option value="Delivered" className="bg-zinc-900 text-zinc-200">
                            🟢 Delivered
                          </option>
                          <option value="Cancelled" className="bg-zinc-900 text-zinc-200">
                            🔴 Cancelled
                          </option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <Link
                          to="/profile/orders"
                          className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-4"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Info Modal */}
      {userModalOpen && selectedUser && (
        <SeeUserData
          UserDivData={selectedUser}
          UserDiv="fixed"
          setUserDiv={() => setUserModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
