import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";
import { FaUsers, FaUserShield, FaUserGraduate, FaMagnifyingGlass, FaLocationDot, FaCalendarDays } from "react-icons/fa6";
import { IoOpenOutline } from "react-icons/io5";
import SeeUserData from "../../pages/SeeUserData";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-all-users`,
          { headers }
        );
        setUsers(res.data.data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchTerm === "" ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const readerCount = users.filter((u) => u.role !== "admin").length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader onRetry={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            User Management
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Registered Community & Readers
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Directory of all registered customers, readers, and administrators on BookBasket.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Total Accounts</p>
            <p className="text-xl font-serif text-white mt-0.5">{users.length} Users</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <FaUsers />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Readers / Customers</p>
            <p className="text-xl font-serif text-emerald-400 mt-0.5">{readerCount}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center">
            <FaUserGraduate />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">Administrators</p>
            <p className="text-xl font-serif text-purple-400 mt-0.5">{adminCount}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-950/40 text-purple-400 flex items-center justify-center">
            <FaUserShield />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
        <div className="relative flex-1">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
          <input
            type="text"
            placeholder="Search by username, email, or shipping address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 pl-9 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-zinc-950 text-zinc-200 px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs outline-none focus:border-emerald-500 font-light cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="user">Readers Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* User Table */}
      {filteredUsers.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/20 rounded-3xl border border-zinc-800/60 p-8 space-y-3">
          <p className="text-zinc-400 text-sm">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800/80 rounded-3xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-light bg-zinc-950/40">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Shipping Location</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === "admin";
                const dateStr = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={u._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
                          alt={u.username}
                          className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
                        />
                        <div>
                          <p className="font-medium text-zinc-100">{u.username}</p>
                          <p className="text-[10px] text-zinc-500 font-light">ID: {u._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-300 text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          isAdmin
                            ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
                            : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        }`}
                      >
                        {isAdmin ? <FaUserShield className="text-[9px]" /> : <FaUserGraduate className="text-[9px]" />}
                        {isAdmin ? "Admin" : "Reader"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-light text-[11px] max-w-[200px] truncate">
                      {u.address ? (
                        <span className="flex items-center gap-1.5" title={u.address}>
                          <FaLocationDot className="text-zinc-600 text-[10px] shrink-0" />
                          <span className="truncate">{u.address}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">Not specified</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-light text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarDays className="text-zinc-600 text-[10px]" />
                        {dateStr}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                        title="View Full Profile Details"
                      >
                        <IoOpenOutline className="text-sm" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Info Modal */}
      {modalOpen && selectedUser && (
        <SeeUserData
          UserDivData={selectedUser}
          UserDiv="fixed"
          setUserDiv={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
