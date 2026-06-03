"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, Users, Target, Zap, Plus, BrainCircuit, Lightbulb, Activity, ArrowRight, Play, AlertCircle, CheckCircle2, MinusCircle, Clock } from "lucide-react";
import LogModal from "@/components/LogModal";
import toast from "react-hot-toast";

import { getAnalytics } from "@/services/analytics";
import { runSimulation, getPatterns, getCoaching } from "@/services/ai";

export default function Dashboard() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPastLog, setIsPastLog] = useState(false);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [patterns, setPatterns] = useState<string[]>([]);
  
  const [coaching, setCoaching] = useState<any>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getAnalytics();
      if (data && data.success) {
        setAnalyticsData(data.data);
      }
      
      const patternData = await getPatterns();
      if (patternData && patternData.success) {
        setPatterns(patternData.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const handleSimulate = async () => {
    setIsSyncing(true);
    try {
      const data = await runSimulation();
      if (data && data.success) {
        setSimulationResult(data.data);
        if (data.data.bestCase?.includes('Unable to simulate')) {
          toast.error("AI engine is currently offline. Showing fallback.");
        } else {
          toast.success("Simulation complete.");
        }
      } else {
        toast.error(data?.error || "Simulation failed to execute.");
      }
    } catch (e) {
      toast.error("Connection to backend lost.");
    }
    setIsSyncing(false);
  };

  const handleGenerateInsights = async () => {
    setIsCoachingLoading(true);
    try {
      const coachData = await getCoaching();
      if (coachData && coachData.success) {
        setCoaching(coachData.data);
        if (coachData.data.summary?.includes('AI systems are currently analyzing')) {
          toast.error("AI engine is currently offline. Showing fallback.");
        } else {
          toast.success("Insights generated successfully.");
        }
      } else {
        toast.error(coachData?.error || "Failed to generate AI insights.");
      }
    } catch (e) {
      toast.error("Error communicating with AI service.");
    }
    setIsCoachingLoading(false);
  };

  const areaData = analyticsData?.charts?.areaData || [];
  const barData = analyticsData?.charts?.barData || [];
  const totalLogs = analyticsData?.trends?.length || 0;
  const avgStudy = analyticsData?.averages?.studyHours || 0;
  const avgMood = analyticsData?.averages?.mood || 0;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <LogModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsPastLog(false); }} 
        onLogAdded={fetchData} 
        isPast={isPastLog}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white/90">Reality Overview</h2>
          <p className="text-white/40 mt-1.5 text-sm font-medium">Your intelligent life operating system.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => { setIsPastLog(true); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 text-sm font-medium transition-colors"
          >
            Log Past Data
          </button>
          <button 
            onClick={() => { setIsPastLog(false); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Today
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Entries" value={totalLogs} icon={Target} color="text-indigo-400" />
        <StatCard title="Daily Focus Avg" value={(avgStudy).toFixed(1) + 'h'} icon={TrendingUp} color="text-blue-400" />
        <StatCard title="Mood Index" value={(avgMood).toFixed(1) + '/10'} icon={Zap} color="text-violet-400" />
        <StatCard title="Burnout Risk" value={avgStudy > 8 ? 'High' : 'Low'} icon={Activity} color={avgStudy > 8 ? 'text-amber-500' : 'text-emerald-500'} />
      </div>

      {/* Row 2: AI Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Pattern Recognition (takes 2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl premium-border flex flex-col h-[400px]">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-5 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" /> Patterns
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-2">
            {patterns.length > 0 ? patterns.map((p, i) => (
              <div key={i} className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.04] flex items-start gap-3 hover:bg-white/[0.04] transition-colors">
                <ArrowRight className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                <p className="text-sm text-white/60 leading-relaxed font-medium">{p}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-3">
                <Clock className="w-6 h-6 opacity-50" />
                <p className="text-sm font-medium">Awaiting sufficient data.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Executive Coach (takes 3 columns) */}
        <div className="lg:col-span-3 glass-panel rounded-xl premium-border flex flex-col h-[400px]">
          <div className="p-6 border-b border-white/[0.04] flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400" /> Your Coach
            </h3>
            <button 
              onClick={handleGenerateInsights}
              disabled={isCoachingLoading}
              className={`text-xs px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                isCoachingLoading ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20'
              }`}
            >
              {isCoachingLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  Analyzing
                </>
              ) : 'View Insights'}
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            {isCoachingLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-1/3 rounded skeleton-loader" />
                <div className="h-4 w-full rounded skeleton-loader" />
                <div className="h-4 w-5/6 rounded skeleton-loader" />
                <div className="pt-4 space-y-3">
                  <div className="h-3 w-3/4 rounded skeleton-loader" />
                  <div className="h-3 w-4/5 rounded skeleton-loader" />
                </div>
              </div>
            ) : coaching ? (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${coaching.productivityTrend === 'improving' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : coaching.productivityTrend === 'declining' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-white/60 border-white/10'}`}>
                    Trend: {coaching.productivityTrend?.toUpperCase()}
                  </div>
                  <div className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${coaching.burnoutRisk === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : coaching.burnoutRisk === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    Burnout Risk: {coaching.burnoutRisk?.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <p className="text-base text-white/80 font-medium leading-relaxed">
                    {coaching.summary}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Actionable Directives</h4>
                  <ul className="space-y-2">
                    {coaching.suggestions?.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-white/60 flex items-start gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.03]">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 opacity-80" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-sm font-medium">Request insights to analyze your data.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Future Scenarios Simulation */}
      <div className="glass-panel rounded-xl premium-border overflow-hidden">
        <div className="p-6 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase flex items-center gap-2">
              <Play className="w-4 h-4 text-violet-400" /> 30-Day Outlook
            </h3>
            <p className="text-xs text-white/40 mt-1">30-day trajectory modeling based on compounding habits.</p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={isSyncing}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isSyncing ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {isSyncing ? 'Analyzing...' : 'Generate Outlook'}
          </button>
        </div>

        <div className="p-6">
          {simulationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Desktop timeline line */}
              <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-white/5 z-0" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-cyan-400/90 uppercase tracking-widest">Optimized</h4>
                </div>
                <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex-1">
                  <p className="text-sm text-white/60 leading-relaxed">{simulationResult.bestCase}</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <MinusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-indigo-400/90 uppercase tracking-widest">Current Path</h4>
                </div>
                <div className="p-5 rounded-lg bg-indigo-500/[0.03] border border-indigo-500/20 flex-1">
                  <p className="text-sm text-white/80 font-medium leading-relaxed">{simulationResult.currentPath}</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-amber-400/90 uppercase tracking-widest">Degraded</h4>
                </div>
                <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex-1">
                  <p className="text-sm text-white/60 leading-relaxed">{simulationResult.worstCase}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-white/30 space-y-3 border border-dashed border-white/10 rounded-lg">
              <Activity className="w-6 h-6 opacity-40" />
              <p className="text-sm font-medium">Ready for analysis. Generate outlook to visualize your path.</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 premium-border flex flex-col h-[350px]">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-6">Focus Trajectory (14 Days)</h3>
          <div className="flex-1">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCode" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="study" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudy)" />
                  <Area type="monotone" dataKey="coding" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCode)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-white/30 text-sm">Awaiting trajectory data.</div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 premium-border flex flex-col h-[350px]">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-6">Mood vs Productivity</h3>
          <div className="flex-1">
            {barData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 11}} dx={-10} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                   <Bar dataKey="mood" fill="#6366f1" radius={[4, 4, 0, 0]} name="Mood Index" opacity={0.8} />
                   <Bar dataKey="productivity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Focus Hours" opacity={0.8} />
                 </BarChart>
               </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-white/30 text-sm">Awaiting correlation data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="glass-panel p-5 rounded-xl premium-border flex flex-col justify-between h-28 hover:bg-white/[0.02] transition-colors">
      <div className="flex justify-between items-start">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider truncate">{title}</p>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <h4 className="text-2xl font-bold tracking-tight text-white/90">{value}</h4>
    </div>
  );
}
