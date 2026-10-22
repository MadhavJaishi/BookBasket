import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth";
import { 
  FaChartPie, 
  FaBoxOpen, 
  FaBook, 
  FaPlus, 
  FaFileImport, 
  FaUsers, 
  FaGear, 
  FaArrowRightFromBracket, 
  FaHeart, 
  FaBookOpen, 
  FaUserShield, 
  FaUserGraduate, 
  FaCamera 
} from "react-icons/fa6";
import { useModal } from "../../context/ModalContext";
import AvatarModal from "./AvatarModal";

const Sidebar = ({ data, onAvatarUpdated }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);
  const { showConfirm } = useModal();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleLogout = () => {
    showConfirm({
      title: "Confirm Log Out",
      message: "Are you sure you want to end your session?",
      confirmText: "Log Out",
      cancelText: "Stay Logged In",
      type: "warning",
      onConfirm: () => {
        dispatch(authActions.logout());
        dispatch(authActions.changeRole("user"));
        localStorage.clear();
        navigate("/");
      },
    });
  };

  const isAdmin = role === "admin";

  const adminNavItems = [
    { label: "Dashboard Overview", path: "/profile", icon: FaChartPie, exact: true },
    { label: "Order Management", path: "/profile/orders", icon: FaBoxOpen },
    { label: "Book Inventory", path: "/profile/inventory", icon: FaBook },
    { label: "Add New Book", path: "/profile/add-book", icon: FaPlus },
    { label: "Bulk JSON Importer", path: "/profile/import-catalog", icon: FaFileImport },
    { label: "Reader Directory", path: "/profile/users", icon: FaUsers },
    { label: "Account Settings", path: "/profile/settings", icon: FaGear },
  ];

  const userNavItems = [
    { label: "My Library & Goals", path: "/library", icon: FaBookOpen },
    { label: "Favourites", path: "/profile", icon: FaHeart, exact: true },
    { label: "Order History", path: "/profile/orderHistory", icon: FaBoxOpen },
    { label: "Profile Settings", path: "/profile/settings", icon: FaGear },
  ];

  const currentItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      <aside className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 flex flex-col justify-between h-full backdrop-blur-md">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Photo Edit Trigger */}
          <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
            <img
              src={data?.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
              alt="avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-700 group-hover:border-emerald-500/80 bg-zinc-950 shadow-md transition-colors"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
              }}
            />
            {/* Camera Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
              <FaCamera className="text-white text-sm" />
              <span className="text-[9px] text-zinc-200 mt-0.5">Edit Photo</span>
            </div>

            {isAdmin ? (
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-zinc-950 font-bold shadow-md"
                title="Administrator"
              >
                <FaUserShield />
              </span>
            ) : (
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-zinc-950 font-bold shadow-md"
                title="Reader"
              >
                <FaUserGraduate />
              </span>
            )}
          </div>

          <h2 className="mt-3 text-base font-serif font-normal text-white truncate max-w-[180px]">
            {data?.username || "Reader"}
          </h2>
          <p className="text-[11px] text-zinc-400 font-light truncate max-w-[190px]">
            {data?.email}
          </p>

          {/* Role Badge */}
          <div className="mt-2.5">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Administrator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-medium tracking-wide">
                Reader Member
              </span>
            )}
          </div>

          <div className="w-full mt-4 h-[1px] bg-zinc-800"></div>
        </div>

        {/* Navigation Links */}
        <nav className="my-4 space-y-1 w-full">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-light px-3 block mb-2">
            {isAdmin ? "Admin Controls" : "Reader Navigation"}
          </span>

          {currentItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-light transition-all ${
                  active
                    ? "bg-zinc-100 text-zinc-950 font-medium shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className={`text-xs ${active ? "text-zinc-950" : "text-zinc-500"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-zinc-950/70 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800/80 hover:border-red-900/40 text-xs font-light transition-all duration-300"
          >
            <span>Log Out</span>
            <FaArrowRightFromBracket className="text-xs" />
          </button>
        </div>
      </aside>

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={data?.avatar}
        onAvatarUpdated={(newAvatar) => {
          if (onAvatarUpdated) {
            onAvatarUpdated(newAvatar);
          }
        }}
      />
    </>
  );
};

export default Sidebar;