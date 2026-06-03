"use client";
import { useState, useEffect } from "react";
import { getMe, updatePassword } from "@/services/user";
import toast from "react-hot-toast";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  const fetchUser = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getMe();
      if (data?.success) {
        setUser(data.data);
      }
    } catch (err) {
      // optional: don't show toast for unauthenticated user
    } finally {
      setIsLoading(false);
    }
  };

  fetchUser();
}, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    
    setIsSaving(true);
    try {
      const data = await updatePassword({ currentPassword, newPassword });
      if (data.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (err) {
      toast.error("Network error");
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading system preferences...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <h2 className="text-3xl font-bold tracking-tight glow-text">Account Settings</h2>
      
      <div className="space-y-6">
        
        {/* Profile Info */}
        <div className="glass-panel p-6 rounded-2xl glow-border">
          <h3 className="text-xl font-bold mb-4">Profile</h3>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Name</span>
              <span className="text-lg font-medium text-white">{user?.name || "Unknown"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Email Address</span>
              <span className="text-lg font-medium text-white">{user?.email || "Unknown"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Member Since</span>
              <span className="text-sm font-medium text-gray-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-panel p-6 rounded-2xl glow-border">
          <h3 className="text-xl font-bold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input 
                type="password" required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" 
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input 
                type="password" required minLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" 
                value={newPassword} onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input 
                type="password" required minLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" 
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
              />
            </div>
            <button 
              type="submit" disabled={isSaving}
              className="mt-4 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-2.5 rounded-xl transition-all w-full"
            >
              {isSaving ? "Updating Password..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 rounded-2xl glow-border">
          <h3 className="text-xl font-bold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-400">Easier on the eyes in low-light environments.</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl glow-border border-red-500/20">
          <h3 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h3>
          <button onClick={handleLogout} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
