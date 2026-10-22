import React from "react";
import { createPortal } from "react-dom";
import { RxCross1 } from "react-icons/rx";
import { FaUser, FaEnvelope, FaLocationDot, FaCalendarDays, FaUserShield, FaUserGraduate } from "react-icons/fa6";

const SeeUserData = ({ UserDivData, UserDiv, setUserDiv }) => {
  if (!UserDivData || UserDiv === "hidden") return null;

  const isAdmin = UserDivData.role === "admin";
  const joinedDate = UserDivData.createdAt
    ? new Date(UserDivData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setUserDiv("hidden")}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      <div 
        className="relative w-full max-w-lg bg-[#0c0e10] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 space-y-6 z-10 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setUserDiv("hidden")}
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        >
          <RxCross1 className="text-base" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <img
            src={UserDivData.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
            alt={UserDivData.username}
            className="w-16 h-16 rounded-2xl border-2 border-zinc-700 bg-zinc-900 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-normal text-white">
                {UserDivData.username}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                  isAdmin
                    ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                }`}
              >
                {isAdmin ? <FaUserShield className="text-[9px]" /> : <FaUserGraduate className="text-[9px]" />}
                {isAdmin ? "Admin" : "Reader"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              Customer Account Profile
            </p>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 flex items-start gap-3">
            <FaEnvelope className="text-zinc-500 mt-1 text-xs shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-light block">
                Email Address
              </span>
              <p className="text-xs font-mono text-zinc-200 truncate mt-0.5">
                {UserDivData.email || "No email specified"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 flex items-start gap-3">
            <FaLocationDot className="text-zinc-500 mt-1 text-xs shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-light block">
                Shipping Address
              </span>
              <p className="text-xs text-zinc-200 mt-0.5 font-light leading-relaxed">
                {UserDivData.address || "No address provided yet"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/70 flex items-start gap-3">
            <FaCalendarDays className="text-zinc-500 mt-1 text-xs shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-light block">
                Registration Date
              </span>
              <p className="text-xs text-zinc-200 mt-0.5 font-light">
                {joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setUserDiv("hidden")}
            className="px-6 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-light transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SeeUserData;