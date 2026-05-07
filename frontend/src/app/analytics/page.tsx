"use client";
import { useState, useEffect } from "react";
import { getAnalytics } from "@/services/analytics";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#8a2be2", "#00d2ff", "#ff007a", "#4ade80"];

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
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight glow-text">Deep Analytics</h2>
        <div className="glass-panel p-8 rounded-2xl glow-border mt-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-300">Processing complex data streams...</p>
        </div>
      </div>
    );
  }

  const areaData = analyticsData?.charts?.areaData || [];
  const pieData = analyticsData?.charts?.pieData || [];
  const barData = analyticsData?.charts?.barData || [];
  const totalLogs = analyticsData?.trends?.length || 0;

  if (totalLogs === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight glow-text">Deep Analytics</h2>
        <div className="glass-panel p-12 rounded-2xl glow-border flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-2xl font-bold text-gray-300">No data available</h3>
          <p className="text-gray-500 mt-2">Log your daily matrix to generate deep analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight glow-text">Deep Analytics</h2>
        <p className="text-gray-400 mt-1">Detailed breakdown of your neural synchronization across all metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-auto lg:h-[400px] mt-8">
        <div className="glass-panel rounded-2xl p-4 md:p-6 glow-border flex flex-col">
          <h3 className="text-base md:text-lg font-semibold mb-4">Comprehensive Focus Trajectory</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorStudy2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8a2be2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCode2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="study" stroke="#8a2be2" strokeWidth={3} fillOpacity={1} fill="url(#colorStudy2)" />
                <Area type="monotone" dataKey="coding" stroke="#00d2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCode2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 md:p-6 glow-border flex flex-col">
          <h3 className="text-base md:text-lg font-semibold mb-4">Long-term Mood Correlation</h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', border: 'none', borderRadius: '8px' }} />
                 <Bar dataKey="mood" fill="#ff007a" radius={[4, 4, 0, 0]} name="Mood Index" />
                 <Bar dataKey="productivity" fill="#00d2ff" radius={[4, 4, 0, 0]} name="Total Focus Hours" />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
