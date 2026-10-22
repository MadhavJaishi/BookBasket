import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Profile/Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader/Loader";
import MobileNav from "../components/Profile/MobileNav";

const Profile = () => {
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-info`,
        { headers }
      );
      setProfileData(resp.data);
    } catch (err) {
      console.error("Failed to load user info:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#08090a]">
        <Loader onRetry={fetchUser} fullScreen />
      </div>
    );
  }

  const handleAvatarUpdated = (newAvatarUrl) => {
    setProfileData((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : prev));
  };

  return (
    <div className="bg-[#08090a] min-h-screen text-zinc-100 px-4 sm:px-8 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Mobile Navigation Header */}
        <div className="block lg:hidden">
          <MobileNav />
        </div>

        {/* Desktop Sidebar (Sticky) */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <Sidebar data={profileData} onAvatarUpdated={handleAvatarUpdated} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet context={{ profileData, setProfileData, handleAvatarUpdated }} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
