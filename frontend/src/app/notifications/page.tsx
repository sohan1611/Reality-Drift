"use client";
import { useState, useEffect } from "react";
import { Lightbulb, TrendingUp, Info, CheckCircle2, CheckCircle } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications";
import toast from "react-hot-toast";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res?.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await markNotificationRead(id);
    } catch (err) {
      // Optmistic UI, revert could be done here if needed
    }
  };

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;
    
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      const res = await markAllNotificationsRead();
      if (res?.success) toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Network error");
    }
  };

  const isEmpty = notifications.length === 0;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (category: string) => {
    switch (category) {
      case "Insights": return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case "Progress": return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "System": return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary/20 text-primary text-sm px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-gray-400">Stay updated on your insights, progress, and system alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.15)]">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">You're all caught up.</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Continue logging and using Reality Drift to receive new insights, progress updates, and weekly reports.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleMarkRead(notif.id, notif.isRead)}
              className={`glass-panel p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row gap-4 items-start transition-all cursor-pointer relative overflow-hidden ${
                notif.isRead ? 'border-white/5 hover:bg-white/5 opacity-70' : 'border-primary/30 hover:border-primary/50 bg-primary/5'
              }`}
            >
              {!notif.isRead && (
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all"></div>
              )}
              <div className={`p-3 rounded-xl border shrink-0 ${notif.isRead ? 'bg-black/30 border-white/5' : 'bg-black/40 border-primary/20'}`}>
                {getIcon(notif.category)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-4">
                  <h4 className={`text-lg font-bold ${notif.isRead ? 'text-gray-200' : 'text-white'}`}>{notif.title}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                </div>
                <p className={`${notif.isRead ? 'text-gray-500' : 'text-gray-300'} text-sm leading-relaxed`}>{notif.message}</p>
                <span className="inline-block mt-3 text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                  {notif.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
