import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../Loader/Loader";
import { 
  FaBoxOpen, 
  FaMagnifyingGlass, 
  FaUser, 
  FaClock, 
  FaTruck, 
  FaCheck, 
  FaBan, 
  FaIndianRupeeSign, 
  FaBookOpen 
} from "react-icons/fa6";
import { IoOpenOutline } from "react-icons/io5";
import SeeUserData from "../../pages/SeeUserData";
import { useModal } from "../../context/ModalContext";

const AllOrders = () => {
  const { showAlert } = useModal();
  const [allOrders, setAllOrders] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userDivData, setUserDivData] = useState(null);
  const [userDivOpen, setUserDivOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-all-orders`,
        { headers }
      );
      setAllOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setAllOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-status/${orderId}`,
        { status: newStatus },
        { headers }
      );
      showAlert({
        title: "Status Updated",
        message: response.data.msg || `Order marked as "${newStatus}"`,
        type: "success",
      });
      setAllOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId ? { ...ord, status: newStatus } : ord
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert({
        title: "Update Failed",
        message: error.response?.data?.msg || "Failed to update order status",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(() => {
    if (!allOrders) return { all: 0, placed: 0, delivery: 0, delivered: 0, cancelled: 0 };
    return {
      all: allOrders.length,
      placed: allOrders.filter((o) => o.status === "Order placed").length,
      delivery: allOrders.filter((o) => o.status === "Out for delivery").length,
      delivered: allOrders.filter((o) => o.status === "Delivered").length,
      cancelled: allOrders.filter((o) => o.status === "Cancelled").length,
    };
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter((item) => {
      const bookTitle = item.book?.title || "";
      const bookAuthor = item.book?.author || "";
      const customerName = item.user?.username || "";
      const customerEmail = item.user?.email || "";
      const orderId = item._id || "";

      const matchesSearch =
        searchTerm === "" ||
        bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allOrders, searchTerm, statusFilter]);

  const totalValue = useMemo(() => {
    if (!allOrders) return 0;
    return allOrders
      .filter((o) => o.status !== "Cancelled" && o.book?.price)
      .reduce((sum, o) => sum + (Number(o.book.price) || 0), 0);
  }, [allOrders]);

  if (!allOrders) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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
            Fulfillment Management
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            All Customer Orders
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Track order delivery stages, inspect shipping addresses, and update fulfillment states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            Total Revenue: <span className="text-emerald-400 font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-zinc-100 text-zinc-950 shadow-md"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
            }`}
          >
            All Orders ({counts.all})
          </button>

          <button
            onClick={() => setStatusFilter("Order placed")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
              statusFilter === "Order placed"
                ? "bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-950/40"
                : "bg-zinc-900/60 text-emerald-400 hover:bg-zinc-800 border border-zinc-800/80"
            }`}
          >
            <FaClock className="text-[10px]" />
            Placed ({counts.placed})
          </button>

          <button
            onClick={() => setStatusFilter("Out for delivery")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
              statusFilter === "Out for delivery"
                ? "bg-sky-500 text-zinc-950 font-semibold shadow-md shadow-sky-950/40"
                : "bg-zinc-900/60 text-sky-400 hover:bg-zinc-800 border border-zinc-800/80"
            }`}
          >
            <FaTruck className="text-[10px]" />
            Out for Delivery ({counts.delivery})
          </button>

          <button
            onClick={() => setStatusFilter("Delivered")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
              statusFilter === "Delivered"
                ? "bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-950/40"
                : "bg-zinc-900/60 text-emerald-400 hover:bg-zinc-800 border border-zinc-800/80"
            }`}
          >
            <FaCheck className="text-[10px]" />
            Delivered ({counts.delivered})
          </button>

          <button
            onClick={() => setStatusFilter("Cancelled")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
              statusFilter === "Cancelled"
                ? "bg-red-500 text-white font-semibold shadow-md shadow-red-950/40"
                : "bg-zinc-900/60 text-red-400 hover:bg-zinc-800 border border-zinc-800/80"
            }`}
          >
            <FaBan className="text-[10px]" />
            Cancelled ({counts.cancelled})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
          <input
            type="text"
            placeholder="Search orders by customer name, book title, author, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
          />
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/20 rounded-3xl border border-zinc-800/60 p-8 space-y-3">
          <FaBoxOpen className="mx-auto text-3xl text-zinc-600" />
          <p className="text-zinc-400 text-sm">No orders found matching the filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800/80 rounded-3xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-light bg-zinc-950/40">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Book Title</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status & Action</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredOrders.map((ord, idx) => {
                const book = ord.book || {};
                const user = ord.user || {};
                const isItemUpdating = updatingId === ord._id;

                return (
                  <tr key={ord._id} className="hover:bg-zinc-800/30 transition-colors">
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
                            <FaBookOpen />
                          </div>
                        )}
                        <div className="max-w-[220px]">
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
                            {book.author || "Unknown"} {book.genre ? `• ${book.genre}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-zinc-200">{user.username || "Reader"}</p>
                          <p className="text-[10px] text-zinc-500 font-light max-w-[150px] truncate">
                            {user.email || "No email"}
                          </p>
                        </div>
                        {user.username && (
                          <button
                            onClick={() => {
                              setUserDivData(user);
                              setUserDivOpen(true);
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors shrink-0"
                            title="View Shipping Address"
                          >
                            <IoOpenOutline className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-100">
                      ₹{book.price || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          disabled={isItemUpdating}
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-full outline-none border cursor-pointer transition-all ${
                            ord.status === "Delivered"
                              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                              : ord.status === "Out for delivery"
                              ? "bg-sky-950/70 border-sky-500/40 text-sky-300"
                              : ord.status === "Cancelled"
                              ? "bg-red-950/70 border-red-500/40 text-red-300"
                              : "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                          }`}
                        >
                          <option value="Order placed" className="bg-zinc-900 text-zinc-200">
                            🟡 Order Placed
                          </option>
                          <option value="Out for delivery" className="bg-zinc-900 text-zinc-200">
                            🔵 Out for Delivery
                          </option>
                          <option value="Delivered" className="bg-zinc-900 text-zinc-200">
                            🟢 Delivered
                          </option>
                          <option value="Cancelled" className="bg-zinc-900 text-zinc-200">
                            🔴 Cancelled
                          </option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {book._id && (
                        <Link
                          to={`/view-book-details/${book._id}`}
                          className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          View Book
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Information Modal */}
      {userDivOpen && userDivData && (
        <SeeUserData
          UserDivData={userDivData}
          UserDiv="fixed"
          setUserDiv={() => setUserDivOpen(false)}
        />
      )}
    </div>
  );
};

export default AllOrders;
