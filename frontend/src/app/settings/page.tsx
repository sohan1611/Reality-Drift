"use client";
import { useState, useEffect } from "react";
import { getMe, updatePassword, exportData, deleteAccount } from "@/services/user";
import { getAnalytics } from "@/services/analytics";
import toast from "react-hot-toast";
import { User, Activity, Clock, Zap, LogOut, Download, Trash2, Key, AlertTriangle } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteChallenge, setDeleteChallenge] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [userRes, analyticsRes] = await Promise.all([
          getMe().catch(() => null),
          getAnalytics().catch(() => null)
        ]);

        if (userRes?.success) setUser(userRes.data);
        if (analyticsRes?.success) setAnalytics(analyticsRes.data);
      } catch (err) {
        // Suppress errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Preparing your data archive...");
    try {
      const res = await exportData();
      if (res?.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `reality-drift-export-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully!", { id: toastId });
      } else {
        toast.error(res?.error || "Export failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error during export", { id: toastId });
    }
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res?.success) {
        toast.success("Account deleted. Redirecting...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error(res?.error || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (err) {
      toast.error("Network error during deletion");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading system preferences...</div>;
  }

  // Format date natively
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "Unknown";
    
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Safe Analytics Fallbacks
  const realityScore = analytics?.realityScore?.current ?? "—";
  let momentum = analytics?.momentum?.status ?? "—";
  // Strip emojis from momentum
  if (typeof momentum === 'string') {
    momentum = momentum.replace(/[^a-zA-Z]/g, '');
  }
  const totalLogs = analytics?.trends?.length ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h2>
        <p className="text-gray-400">Manage your profile, preferences, and security.</p>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-8 lg:space-y-0">
        
        {/* Left Column: Profile Hero */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/20 mb-4">
              {initial}
            </div>
            <h3 className="text-2xl font-bold text-white">{user?.name || "User"}</h3>
            <p className="text-gray-400 mb-6">{user?.email || "Unknown"}</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 bg-black/20 px-4 py-2 rounded-full">
              <User className="w-4 h-4" />
              <span>Member since {memberSince}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400 mb-2" />
                <span className="text-2xl font-bold text-white">{realityScore}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Score</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 mb-2" />
                <span className="text-sm font-bold text-white">{momentum}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Momentum</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                <Clock className="w-5 h-5 text-green-400 mb-2" />
                <span className="text-2xl font-bold text-white">{totalLogs}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Security */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Preferences */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Preferences</h3>
              <p className="text-sm text-gray-400 mt-1">Customize how Reality Drift works for you.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div>
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-sm text-gray-400">Easier on the eyes in low-light environments.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(138,43,226,0.3)]">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 opacity-70">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">Weekly Reports</p>
                    <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">Receive a weekly summary of your reality drift.</p>
                </div>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 opacity-70">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">Coach Notifications</p>
                    <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">Get timely AI insights directly to your device.</p>
                </div>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5">
            <div className="mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-white">Security</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors text-sm" 
                    value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" required minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors text-sm" 
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input 
                    type="password" required minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none transition-colors text-sm" 
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" disabled={isSaving}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-xl transition-all text-sm"
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/10">
            <h3 className="text-xl font-bold text-red-400 mb-6">Account Actions</h3>
            
            <div className="space-y-3">
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/40 border border-red-500/20 rounded-2xl transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-red-400">Log Out</p>
                    <p className="text-xs text-red-400/70">Securely end your current session.</p>
                  </div>
                </div>
              </button>

              <button onClick={handleExport} disabled={isExporting} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Export Data</p>
                    <p className="text-xs text-gray-400">Download a JSON archive of your logs and insights.</p>
                  </div>
                </div>
                {isExporting ? <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold animate-pulse">Exporting...</span> : null}
              </button>

              <button onClick={() => setIsDeleteModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-2xl transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-red-400 transition-colors">Delete Account</p>
                    <p className="text-xs text-gray-400 group-hover:text-red-400/70 transition-colors">Permanently erase all your data.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/20 max-w-md w-full relative">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Delete Account</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              This action permanently removes your account, logs, forecasts, insights, and associated data. This action cannot be undone.
            </p>
            
            <div className="mb-8">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Type DELETE to continue</label>
              <input 
                type="text" 
                value={deleteChallenge}
                onChange={(e) => setDeleteChallenge(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-black/40 border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors text-center font-bold tracking-widest"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setDeleteChallenge(""); }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all text-sm border border-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteChallenge !== "DELETE" || isDeleting}
                className={`flex-1 font-medium py-3 rounded-xl transition-all text-sm border ${
                  deleteChallenge === "DELETE" && !isDeleting
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30" 
                    : "bg-red-500/5 text-red-400/30 border-red-500/10 cursor-not-allowed"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
