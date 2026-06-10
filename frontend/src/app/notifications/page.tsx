import { Lightbulb, TrendingUp, Info, CheckCircle2 } from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "insight",
      title: "Weekly Report Generated",
      message: "Your Reality Drift summary for the past 7 days is ready to review.",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "progress",
      title: "Reality Score Improved",
      message: "Great job! Your consistency helped bump your Reality Score by 4 points.",
      time: "1 day ago"
    },
    {
      id: 3,
      type: "system",
      title: "Platform Maintenance Complete",
      message: "Our analytics engine was successfully upgraded for faster processing.",
      time: "3 days ago"
    }
  ];

  // Change this to true to test the empty state
  const isEmpty = false;

  const getIcon = (type: string) => {
    switch (type) {
      case "insight": return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case "progress": return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "system": return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Notifications</h2>
        <p className="text-gray-400">Stay updated on your insights, progress, and system alerts.</p>
      </div>

      {isEmpty ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(138,43,226,0.15)]">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">You're all caught up.</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            As you continue logging and using Reality Drift, important updates and actionable insights will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start hover:bg-white/5 transition-colors cursor-pointer">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-4">
                  <h4 className="text-lg font-bold text-white">{notif.title}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
