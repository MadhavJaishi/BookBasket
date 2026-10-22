import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaChartPie, 
  FaBoxOpen, 
  FaBook, 
  FaPlus, 
  FaFileImport, 
  FaUsers, 
  FaGear, 
  FaHeart, 
  FaBookOpen 
} from "react-icons/fa6";

const MobileNav = () => {
  const role = useSelector((state) => state.auth.role);
  const location = useLocation();

  const isAdmin = role === "admin";

  const adminNavItems = [
    { label: "Overview", path: "/profile", icon: FaChartPie, exact: true },
    { label: "Orders", path: "/profile/orders", icon: FaBoxOpen },
    { label: "Inventory", path: "/profile/inventory", icon: FaBook },
    { label: "Add Book", path: "/profile/add-book", icon: FaPlus },
    { label: "Import", path: "/profile/import-catalog", icon: FaFileImport },
    { label: "Users", path: "/profile/users", icon: FaUsers },
    { label: "Settings", path: "/profile/settings", icon: FaGear },
  ];

  const userNavItems = [
    { label: "Library", path: "/library", icon: FaBookOpen },
    { label: "Favourites", path: "/profile", icon: FaHeart, exact: true },
    { label: "Orders", path: "/profile/orderHistory", icon: FaBoxOpen },
    { label: "Settings", path: "/profile/settings", icon: FaGear },
  ];

  const currentItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-2 px-1 lg:hidden no-scrollbar bg-zinc-950/80 rounded-2xl border border-zinc-800/80 mb-4">
      {currentItems.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-light whitespace-nowrap transition-colors ${
              active
                ? "bg-zinc-100 text-zinc-950 font-medium"
                : "text-zinc-400 hover:text-white bg-zinc-900/60"
            }`}
          >
            <Icon className="text-[10px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;