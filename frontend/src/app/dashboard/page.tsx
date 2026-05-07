"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, Users, Target, Zap, Plus, BrainCircuit, Lightbulb, Activity, ArrowRight, Play } from "lucide-react";
import LogModal from "@/components/LogModal";
import toast from "react-hot-toast";

import { getAnalytics } from "@/services/analytics";
import { runSimulation, getPatterns, getCoaching } from "@/services/ai";

const COLORS = ["#8a2be2", "#00d2ff", "#ff007a", "#4ade80"];

export default function Dashboard() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Future Scenarios Simulation state
  const [simulationResult, setSimulationResult] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPastLog, setIsPastLog] = useState(false);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [patterns, setPatterns] = useState<string[]>([]);
  
  // Structured Coaching state
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
      
      // Do NOT call coaching on load anymore to prevent API overuse.
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
        toast.success("Simulation complete! Future paths generated.");
      } else {
        toast.error("Simulation failed to execute.");
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
        toast.success("AI Insights generated successfully.");
      } else {
        toast.error("Failed to generate AI insights.");
      }
    } catch (e) {
      toast.error("Error communicating with AI service.");
    }
    setIsCoachingLoading(false);
  };

  const areaData = analyticsData?.charts?.areaData || [];
  const pieData = analyticsData?.charts?.pieData || [];
  const barData = analyticsData?.charts?.barData || [];
  const totalLogs = analyticsData?.trends?.length || 0;
  const avgStudy = analyticsData?.averages?.studyHours || 0;
  const avgMood = analyticsData?.averages?.mood || 0;

  return (
    <div className="space-y-6 pb-12">
      <LogModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setIsPastLog(false); }} 
        onLogAdded={fetchData} 
        isPast={isPastLog}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight glow-text">Reality Overview</h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Your advanced 30-day projection matrix is active.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => { setIsPastLog(true); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 md:px-6 py-2.5 rounded-xl font-medium transition-all text-sm"
          >
            Log Past Data
          </button>
          <button 
            onClick={() => { setIsPastLog(false); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-black px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(0,210,255,0.4)] text-sm"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" /> Log Daily Data
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Logs" value={totalLogs} icon={Target} trend="Entries" color="text-primary" />
        <StatCard title="Avg Study/Code" value={(avgStudy).toFixed(1) + 'h'} icon={TrendingUp} trend="Daily Avg" color="text-secondary" />
        <StatCard title="Avg Mood" value={(avgMood).toFixed(1) + '/10'} icon={Zap} trend="Index" color="text-accent" />
        <StatCard title="Burnout Risk" value={avgStudy > 8 ? 'High' : 'Low'} icon={Activity} trend="Status" color={avgStudy > 8 ? 'text-red-400' : 'text-green-400'} />
      </div>

      {/* Row 2: AI Insights & Coaching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BrainCircuit className="text-primary w-5 h-5" /> Pattern Recognition
          </h3>
          <div className="space-y-3">
            {patterns.length > 0 ? patterns.map((p, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 leading-relaxed">{p}</p>
              </div>
            )) : <p className="text-sm text-gray-500">Log more data for pattern detection.</p>}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl glow-border flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="text-secondary w-5 h-5" /> AI Executive Coach
            </h3>
            <button 
              onClick={handleGenerateInsights}
              disabled={isCoachingLoading}
              className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-all ${
                isCoachingLoading ? 'bg-secondary/20 text-secondary/50 cursor-not-allowed' : 'bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30'
              }`}
            >
              {isCoachingLoading ? 'Generating...' : 'Generate Insights'}
            </button>
          </div>

          <div className="flex-1 p-4 bg-secondary/5 rounded-xl border border-secondary/10 flex flex-col">
            {isCoachingLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-secondary/70">Analyzing your matrix...</p>
              </div>
            ) : coaching ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="text-gray-400">Trend: <span className={coaching.productivityTrend === 'improving' ? 'text-green-400' : 'text-yellow-400'}>{coaching.productivityTrend?.toUpperCase()}</span></span>
                    <span className="text-gray-400">Burnout Risk: <span className={coaching.burnoutRisk === 'high' ? 'text-red-400' : 'text-green-400'}>{coaching.burnoutRisk?.toUpperCase()}</span></span>
                  </div>
                </div>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">"{coaching.summary}"</p>
                <ul className="space-y-2 mt-2">
                  {coaching.suggestions?.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500 text-center">Click generate to receive personalized AI coaching.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Future Scenarios Simulation */}
      <div className="glass-panel rounded-2xl p-6 glow-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Play className="text-primary w-5 h-5" /> 30-Day Future Simulator
            </h3>
            <p className="text-sm text-gray-400 mt-1">AI predictive modeling based on your recent habit trajectories.</p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={isSyncing}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(138,43,226,0.3)] ${
              isSyncing ? 'bg-primary/50 text-white/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/80 text-white'
            }`}
          >
            {isSyncing ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {simulationResult ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white/5 border border-green-500/30 flex flex-col">
              <h4 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wider">Best Case Scenario</h4>
              <p className="text-sm text-gray-300 leading-relaxed flex-1">{simulationResult.bestCase}</p>
            </div>
            <div className="p-5 rounded-xl bg-primary/10 border border-primary/30 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 animate-pulse" />
              <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider relative z-10">Current Trajectory</h4>
              <p className="text-sm text-blue-50 leading-relaxed flex-1 relative z-10 font-medium">{simulationResult.currentPath}</p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-red-500/30 flex flex-col">
              <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">Worst Case Scenario</h4>
              <p className="text-sm text-gray-300 leading-relaxed flex-1">{simulationResult.worstCase}</p>
            </div>
          </div>
        ) : (
          <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
            <p className="text-gray-500 text-sm">Run simulation to visualize your possible futures.</p>
          </div>
        )}
      </div>

      {/* Row 4: Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-auto lg:h-[350px]">
        <div className="glass-panel rounded-2xl p-4 md:p-6 glow-border flex flex-col">
          <h3 className="text-base md:text-lg font-semibold mb-4">Focus Trajectory (Last 14 Days)</h3>
          <div className="flex-1 min-h-[250px]">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8a2be2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCode" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="study" stroke="#8a2be2" strokeWidth={3} fillOpacity={1} fill="url(#colorStudy)" />
                  <Area type="monotone" dataKey="coding" stroke="#00d2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCode)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-500">Log data to view trajectory.</div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 md:p-6 glow-border flex flex-col">
          <h3 className="text-base md:text-lg font-semibold mb-4">Mood vs Productivity</h3>
          <div className="flex-1 min-h-[250px]">
            {barData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.95)', border: 'none', borderRadius: '8px' }} />
                   <Bar dataKey="mood" fill="#ff007a" radius={[4, 4, 0, 0]} name="Mood Index" />
                   <Bar dataKey="productivity" fill="#00d2ff" radius={[4, 4, 0, 0]} name="Total Focus Hours" />
                 </BarChart>
               </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <div className="glass-panel p-3 md:p-6 rounded-2xl glow-border">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-400 truncate">{title}</p>
          <h4 className="text-xl md:text-3xl font-bold mt-1 md:mt-2">{value}</h4>
        </div>
        <div className={`p-2 md:p-3 rounded-xl bg-white/5 ${color} shrink-0`}>
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
      </div>
      <div className="mt-2 md:mt-4 flex items-center gap-2">
        <span className="text-xs md:text-sm font-medium text-gray-400">{trend}</span>
      </div>
    </div>
  );
}
