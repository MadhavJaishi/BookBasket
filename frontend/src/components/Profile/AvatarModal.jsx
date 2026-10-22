import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { 
  FaCamera, 
  FaUpload, 
  FaLink, 
  FaRegFaceSmile, 
  FaCheck, 
  FaSpinner, 
  FaTrashCan 
} from "react-icons/fa6";
import { useModal } from "../../context/ModalContext";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
  "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400",
];

const AvatarModal = ({ isOpen, onClose, currentAvatar, onAvatarUpdated }) => {
  const { showAlert } = useModal();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState("upload"); // 'upload' | 'url' | 'presets'
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || "");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert({
        title: "Invalid File",
        message: "Please select an image file (JPG, PNG, WebP).",
        type: "warning",
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showAlert({
        title: "File Too Large",
        message: "Image size must be less than 8MB.",
        type: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
  };

  const handleSaveAvatar = async () => {
    if (!previewUrl) {
      showAlert({
        title: "No Image Selected",
        message: "Please select or upload an image first.",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-avatar`,
        { avatar: previewUrl },
        { headers }
      );

      showAlert({
        title: "Photo Updated",
        message: res.data?.msg || "Your profile photo has been updated successfully.",
        type: "success",
      });

      if (onAvatarUpdated) {
        onAvatarUpdated(previewUrl);
      }
      onClose();
    } catch (error) {
      console.error("Avatar save error:", error);
      showAlert({
        title: "Upload Failed",
        message: error.response?.data?.msg || "Failed to update profile photo.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn" 
      />

      <div 
        className="relative w-full max-w-lg bg-[#0c0e10] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 space-y-6 z-10 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        >
          <RxCross1 className="text-base" />
        </button>

        {/* Header */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-medium">
            Profile Customization
          </span>
          <h2 className="text-2xl font-serif font-normal text-white mt-0.5">
            Update Profile Photo
          </h2>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Choose how you want to be recognized across BookBasket.
          </p>
        </div>

        {/* Preview Circle */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative group">
            <img
              src={previewUrl || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
              alt="Avatar Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500/40 bg-zinc-950 shadow-xl shadow-black/60"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
              }}
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <FaCamera className="text-white text-xl" />
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-light mt-2">
            Live Preview
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800/80">
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-xl font-light transition-all ${
              tab === "upload"
                ? "bg-zinc-800 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FaUpload className="text-[10px]" /> Upload File
          </button>

          <button
            onClick={() => setTab("url")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-xl font-light transition-all ${
              tab === "url"
                ? "bg-zinc-800 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FaLink className="text-[10px]" /> Image URL
          </button>

          <button
            onClick={() => setTab("presets")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-xl font-light transition-all ${
              tab === "presets"
                ? "bg-zinc-800 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FaRegFaceSmile className="text-[10px]" /> Gallery
          </button>
        </div>

        {/* Tab Contents */}
        {tab === "upload" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/60 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/50 hover:bg-zinc-950 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-emerald-950/60 group-hover:text-emerald-400 text-zinc-400 flex items-center justify-center mb-2 transition-colors">
                <FaUpload className="text-base" />
              </div>
              <p className="text-xs font-medium text-zinc-200">
                Click to browse or drop an image here
              </p>
              <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                PNG, JPG, or WebP up to 8MB
              </p>
            </div>
          </div>
        )}

        {tab === "url" && (
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">
              Direct Image Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-zinc-950 text-zinc-100 px-4 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none"
              />
              <button
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition-colors"
              >
                Apply
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-light">
              Enter any public web URL for your profile avatar.
            </p>
          </div>
        )}

        {tab === "presets" && (
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light">
              Choose from Curated Avatars
            </label>
            <div className="grid grid-cols-4 gap-3 pt-1">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewUrl(avatar)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                    previewUrl === avatar
                      ? "border-emerald-500 scale-105 shadow-md shadow-emerald-950/40"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Preset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {previewUrl === avatar && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px]">
                        <FaCheck />
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 font-light transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAvatar}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-medium text-xs transition-all shadow-lg shadow-emerald-950/40 disabled:text-zinc-500"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin text-xs" /> Saving...
              </>
            ) : (
              <>
                <FaCheck className="text-xs" /> Save Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AvatarModal;
