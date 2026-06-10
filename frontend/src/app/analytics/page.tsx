"use client";
import { useState, useEffect } from "react";
import { getAnalytics } from "@/services/analytics";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Activity, Target } from "lucide-react";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        if (data && data.success) {
          setAnalyticsData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics");
      }
      setIsLoading(false);
    };

    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <h2 className="text-3xl font-semibold tracking-tight text-white/90">Deep Analytics</h2>
        <div className="glass-panel p-8 rounded-xl premium-border mt-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-white/50">Aggregating historical data streams...</p>
        </div>
      </div>
    );
  }

  const areaData = analyticsData?.charts?.areaData || [];
  const barData = analyticsData?.charts?.barData || [];
  const totalLogs = analyticsData?.trends?.length || 0;
  const heatmapData = analyticsData?.heatmap || [];

  const renderHeatmap = () => {
    if (!heatmapData || heatmapData.length === 0) return null;
    
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Generate last 364 days + today
    for(let i=364; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dataObj = heatmapData.find((h: any) => h.date === dateStr);
      days.push({
        date: dateStr,
        score: dataObj ? dataObj.score : 0,
        focus: dataObj ? dataObj.focus : 0
      });
    }

    // Group into weeks (7 days) starting on Sunday
    const weeks = [];
    let currentWeek = [];
    
    // Pad the first week to align days correctly if needed
    const firstDayOfWeek = new Date(days[0].date).getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let i = 0; i < days.length; i++) {
      currentWeek.push(days[i]);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while(currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const getColor = (score: number) => {
      if (score === 0) return "bg-white/[0.02] border border-white/[0.03]";
      if (score < 40) return "bg-emerald-900/40 border border-emerald-900/50";
      if (score < 70) return "bg-emerald-700/60 border border-emerald-700/50";
      if (score < 90) return "bg-emerald-500/80 border border-emerald-500/50";
      return "bg-emerald-400 border border-emerald-300/50";
    };

    return (
      <div className="flex gap-[3px] overflow-x-auto pb-4 scrollbar-hide items-end">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              day ? (
                <div 
                  key={di} 
                  title={`${day.date}: Score ${day.score}, Focus ${day.focus}h`}
                  className={`w-3.5 h-3.5 rounded-sm ${getColor(day.score)} hover:ring-1 hover:ring-white/50 transition-all cursor-pointer`}
                />
              ) : (
                <div key={di} className="w-3.5 h-3.5" /> // Empty placeholder
              )
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (totalLogs === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <h2 className="text-3xl font-semibold tracking-tight text-white/90">Deep Analytics</h2>
        <div className="glass-panel p-12 rounded-xl premium-border flex flex-col items-center justify-center min-h-[400px]">
          <Activity className="w-8 h-8 text-white/20 mb-4" />
          <h3 className="text-lg font-semibold text-white/70">No data available</h3>
          <p className="text-white/40 mt-2 text-sm">Log your daily metrics to generate deep analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white/90">Deep Analytics</h2>
        <p className="text-white/40 mt-1.5 text-sm font-medium">Longitudinal analysis and pattern detection.</p>
      </div>

      <div className="glass-panel rounded-xl p-6 premium-border overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">365-Day Consistency</h3>
        </div>
        <div className="w-full relative">
          {renderHeatmap()}
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 text-xs font-medium text-white/40">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/[0.02] border border-white/[0.03]" />
            <div className="w-3 h-3 rounded-sm bg-emerald-900/40 border border-emerald-900/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700/60 border border-emerald-700/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80 border border-emerald-500/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300/50" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[400px]">
        <div className="glass-panel rounded-xl p-6 premium-border flex flex-col">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-6">Long-term Trajectory</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCode2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="study" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudy2)" />
                <Area type="monotone" dataKey="coding" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCode2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 premium-border flex flex-col">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-6">Mood Variance</h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dx={-10} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                 <Bar dataKey="mood" fill="#6366f1" radius={[4, 4, 0, 0]} name="Mood Index" opacity={0.8} />
                 <Bar dataKey="productivity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Focus Hours" opacity={0.8} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
