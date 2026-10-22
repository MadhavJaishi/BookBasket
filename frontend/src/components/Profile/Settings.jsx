import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useModal } from "../../context/ModalContext";
import { 
  FaCamera, 
  FaUserShield, 
  FaUserGraduate, 
  FaCheck, 
  FaUpload, 
  FaLocationDot, 
  FaBookOpen 
} from "react-icons/fa6";
import AvatarModal from "./AvatarModal";
import AddressSelector from "../Address/AddressSelector";

const Settings = () => {
  const context = useOutletContext() || {};
  const { showAlert } = useModal();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    bio: "",
    avatar: "",
    isPublic: true,
  });

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-user-info`,
          { headers }
        );
        setProfileData(resp.data);
        setFormData({
          address: resp.data.address || "",
          bio: resp.data.bio || "Passionate reader exploring new perspectives.",
          avatar: resp.data.avatar || "",
          isPublic: resp.data.privacy?.isPublic !== false,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpdated = (newAvatarUrl) => {
    setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
    setProfileData((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : prev));
    if (context.handleAvatarUpdated) {
      context.handleAvatarUpdated(newAvatarUrl);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        privacy: { isPublic: formData.isPublic !== false },
      };
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-profile`,
        payload,
        { headers }
      );
      showAlert({
        title: "Settings Saved",
        message: response.data?.msg || "Your profile and privacy settings have been updated.",
        type: "success",
      });
      if (context.setProfileData) {
        context.setProfileData((prev) => ({ ...prev, ...formData }));
      }
    } catch (err) {
      showAlert({
        title: "Save Failed",
        message: err.response?.data?.msg || "Failed to update profile settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const isAdmin = profileData.role === "admin";

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
          Account Preferences
        </span>
        <h1 className="text-3xl font-serif text-white font-normal mt-1">
          Profile & Account Settings
        </h1>
        <p className="text-xs text-zinc-400 font-light mt-1">
          Manage your personal identity, avatar photo, bio statement, and shipping destinations.
        </p>
      </div>

      {/* Photo / Avatar Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
        <div>
          <h2 className="text-base font-serif text-white font-normal">
            Profile Photo
          </h2>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            This photo will be displayed on your profile, book reviews, and community forums.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
            <img
              src={formData.avatar || profileData.avatar || "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"}
              alt="Profile avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 group-hover:border-emerald-500/80 bg-zinc-950 shadow-xl transition-all"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
              }}
            />
            <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera className="text-white text-base" />
              <span className="text-[9px] text-zinc-200 mt-1">Change</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 rounded-full text-xs font-medium transition-all shadow-md shadow-emerald-950/40"
              >
                <FaUpload className="text-[10px]" /> Upload / Change Photo
              </button>

              <button
                type="button"
                onClick={() => handleAvatarUpdated("https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png")}
                className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-light transition-colors"
              >
                Reset Default
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-light">
              Supported formats: JPG, PNG, WebP or direct image URL (up to 8MB).
            </p>
          </div>
        </div>
      </div>

      {/* Account Info & Inputs */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
          <h2 className="text-base font-serif text-white font-normal">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                Username
              </label>
              <div className="mt-1.5 p-3 rounded-2xl bg-zinc-950/80 text-zinc-300 font-light text-xs border border-zinc-800 flex items-center justify-between">
                <span>{profileData.username}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    isAdmin
                      ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
                      : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  {isAdmin ? <FaUserShield className="text-[9px]" /> : <FaUserGraduate className="text-[9px]" />}
                  {isAdmin ? "Admin" : "Reader"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                Registered Email
              </label>
              <div className="mt-1.5 p-3 rounded-2xl bg-zinc-950/80 text-zinc-300 font-mono text-xs border border-zinc-800">
                {profileData.email}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Reader Bio / Tagline
            </label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="e.g. Passionate reader exploring philosophy, sci-fi and historical fiction."
              className="w-full mt-1.5 bg-zinc-950 text-zinc-100 px-4 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
            />
          </div>

          <div>
            <AddressSelector isCheckoutMode={false} />
          </div>
        </div>

        {/* Library Privacy Settings Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif text-white font-normal flex items-center gap-2">
                <span>Library & Shelf Privacy</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                    formData.isPublic !== false
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {formData.isPublic !== false ? "Public Library" : "Private Library"}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-1 max-w-xl">
                {formData.isPublic !== false
                  ? "Your reading shelves, tracker progress, and finished books are visible to fellow readers who visit your profile."
                  : "Your shelves and reading progress are completely hidden from other readers."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isPublic: prev.isPublic === false ? true : false,
                }))
              }
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isPublic !== false ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.isPublic !== false ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-8 py-3 rounded-full text-xs transition-all shadow-md disabled:opacity-50"
          >
            {saving ? "Saving..." : <><FaCheck className="text-xs" /> Save Changes</>}
          </button>
        </div>
      </form>

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={formData.avatar || profileData.avatar}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </div>
  );
};

export default Settings;
