"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, Settings as SettingsIcon, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { getNotifications, searchLogs } from "@/services/logs";
import { getMe } from "@/services/user";

export default function Navbar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userName, setUserName] = useState("Pilot");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user name
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");

    if (token) {
      getMe()
        .then(res => {
          if (res && res.success) {
            setUserName(res.data.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data && data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = () => {
    if (!showNotifications) fetchNotifications();
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchLogs(searchQuery);
      if (data && data.success) {
        toast.success(`Found ${data.data.length} logs matching query.`);
      } else {
        toast.error("Search failed");
      }
    } catch (err) {
      toast.error("Connection error");
    }
    setIsSearching(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="h-16 md:h-20 glass-panel border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      
      {/* Left: Search — hidden on very small screens, visible from sm up */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md group ml-10 md:ml-0">
        <Search className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-gray-400 group-focus-within:text-primary'}`} />
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/5 rounded-full py-2 md:py-2.5 pl-9 md:pl-12 pr-3 md:pr-4 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all glow-border"
        />
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 md:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all glow-border"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(255,0,122,0.8)]"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-white/5">
                <h3 className="font-semibold text-white text-sm md:text-base">System Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-default">
                      <p className={`text-sm font-medium ${n.type === 'warning' ? 'text-red-400' : 'text-blue-200'}`}>{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400">Loading alerts...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 md:gap-3 p-1 md:p-1.5 pr-2 md:pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all glow-border"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-3 w-52 md:w-56 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-white">{userName}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Shield className="w-4 h-4" /> Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <SettingsIcon className="w-4 h-4" /> Settings
                </Link>
                <div className="h-px bg-white/5 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
