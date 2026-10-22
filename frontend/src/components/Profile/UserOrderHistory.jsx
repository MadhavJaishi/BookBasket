import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/Loader";
import { 
  FaBoxOpen, 
  FaClock, 
  FaTruck, 
  FaCheck, 
  FaBan, 
  FaMagnifyingGlass, 
  FaBook, 
  FaArrowRight, 
  FaIndianRupeeSign 
} from "react-icons/fa6";

const UserOrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-order-history`,
        { headers }
      );
      setOrderHistory(resp.data?.data || []);
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const counts = useMemo(() => {
    if (!orderHistory) return { all: 0, placed: 0, delivery: 0, delivered: 0, cancelled: 0 };
    return {
      all: orderHistory.length,
      placed: orderHistory.filter((o) => o.status === "Order placed" || o.status === "Order Placed").length,
      delivery: orderHistory.filter((o) => o.status === "Out for delivery").length,
      delivered: orderHistory.filter((o) => o.status === "Delivered").length,
      cancelled: orderHistory.filter((o) => o.status === "Cancelled").length,
    };
  }, [orderHistory]);

  const totalSpent = useMemo(() => {
    if (!orderHistory) return 0;
    return orderHistory
      .filter((o) => o.status !== "Cancelled" && o.book?.price)
      .reduce((sum, o) => sum + (Number(o.book.price) || 0), 0);
  }, [orderHistory]);

  const filteredOrders = useMemo(() => {
    if (!orderHistory) return [];
    return orderHistory.filter((item) => {
      const book = item.book || {};
      const title = book.title || "";
      const author = book.author || "";
      const status = item.status || "";

      const matchesSearch =
        searchTerm === "" ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orderHistory, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <Loader onRetry={fetchOrders} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            Purchase History
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Your Orders & Shipments
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Track real-time shipment status, order details, and receipt summaries.
          </p>
        </div>

        {orderHistory && orderHistory.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Total Spent:</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">
                ₹{totalSpent.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {orderHistory && orderHistory.length === 0 ? (
        /* Empty State */
        <div className="min-h-[45vh] p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/60 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500 text-2xl shadow-inner">
            <FaBoxOpen />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-xl font-serif font-normal text-white">
              No Order History Found
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              You haven't placed any book orders yet. Explore our curated catalog to start your reading adventure.
            </p>
          </div>
          <Link
            to="/all-books"
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-6 py-2.5 rounded-full text-xs transition-all shadow-md mt-2"
          >
            Discover Books <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      ) : (
        /* Orders View */
        <div className="space-y-4">
          {/* Status Filter Tabs & Search */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-light transition-all ${
                  statusFilter === "all"
                    ? "bg-zinc-100 text-zinc-950 font-medium shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/80"
                }`}
              >
                All ({counts.all})
              </button>

              <button
                onClick={() => setStatusFilter("order placed")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-light transition-all ${
                  statusFilter === "order placed"
                    ? "bg-emerald-500 text-zinc-950 font-medium shadow-sm"
                    : "bg-zinc-900/60 text-emerald-400 hover:bg-zinc-800 border border-zinc-800/80"
                }`}
              >
                <FaClock className="text-[10px]" /> Placed ({counts.placed})
              </button>

              <button
                onClick={() => setStatusFilter("out for delivery")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-light transition-all ${
                  statusFilter === "out for delivery"
                    ? "bg-sky-500 text-zinc-950 font-medium shadow-sm"
                    : "bg-zinc-900/60 text-sky-400 hover:bg-zinc-800 border border-zinc-800/80"
                }`}
              >
                <FaTruck className="text-[10px]" /> In Transit ({counts.delivery})
              </button>

              <button
                onClick={() => setStatusFilter("delivered")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-light transition-all ${
                  statusFilter === "delivered"
                    ? "bg-emerald-500 text-zinc-950 font-medium shadow-sm"
                    : "bg-zinc-900/60 text-emerald-400 hover:bg-zinc-800 border border-zinc-800/80"
                }`}
              >
                <FaCheck className="text-[10px]" /> Delivered ({counts.delivered})
              </button>

              <button
                onClick={() => setStatusFilter("cancelled")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-light transition-all ${
                  statusFilter === "cancelled"
                    ? "bg-red-500 text-white font-medium shadow-sm"
                    : "bg-zinc-900/60 text-red-400 hover:bg-zinc-800 border border-zinc-800/80"
                }`}
              >
                <FaBan className="text-[10px]" /> Cancelled ({counts.cancelled})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
              <input
                type="text"
                placeholder="Search by book title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
              />
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center bg-zinc-900/20 rounded-3xl border border-zinc-800/60 p-6 space-y-2">
              <p className="text-zinc-400 text-xs font-light">No orders match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800/80 rounded-3xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-light bg-zinc-950/40">
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Book Details</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredOrders.map((ord, idx) => {
                    const book = ord.book || {};
                    const isDelivered = ord.status === "Delivered";
                    const isCancelled = ord.status === "Cancelled";
                    const isInTransit = ord.status === "Out for delivery";

                    return (
                      <tr key={ord._id || idx} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {book.url ? (
                              <img
                                src={book.url}
                                alt={book.title}
                                className="w-9 h-12 object-cover rounded-lg shadow-sm border border-zinc-800 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 shrink-0">
                                <FaBook />
                              </div>
                            )}
                            <div className="max-w-[260px]">
                              {book._id ? (
                                <Link
                                  to={`/view-book-details/${book._id}`}
                                  className="font-medium text-zinc-100 hover:text-emerald-400 transition-colors line-clamp-1"
                                >
                                  {book.title || "Untitled Book"}
                                </Link>
                              ) : (
                                <p className="font-medium text-zinc-400">Book no longer in catalog</p>
                              )}
                              <p className="text-[10px] text-zinc-500 font-light truncate">
                                By {book.author || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-zinc-100">
                          ₹{book.price || "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[10px] font-light">
                            Cash on Delivery
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                              isDelivered
                                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                                : isInTransit
                                ? "bg-sky-950/60 border-sky-500/40 text-sky-300"
                                : isCancelled
                                ? "bg-red-950/60 border-red-500/40 text-red-300"
                                : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                            }`}
                          >
                            {isDelivered && <FaCheck className="text-[9px]" />}
                            {isInTransit && <FaTruck className="text-[9px]" />}
                            {isCancelled && <FaBan className="text-[9px]" />}
                            {!isDelivered && !isInTransit && !isCancelled && <FaClock className="text-[9px]" />}
                            {ord.status || "Order Placed"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {book._id ? (
                            <Link
                              to={`/view-book-details/${book._id}`}
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-light transition-colors"
                            >
                              View Book &rarr;
                            </Link>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;
