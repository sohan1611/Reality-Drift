"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Users, Target, Zap, Plus, BrainCircuit, Lightbulb, Activity, ArrowRight, Play, AlertCircle, CheckCircle2, MinusCircle, Clock, TrendingDown, RefreshCcw, FileText
} from "lucide-react";
import LogModal from "@/components/LogModal";
import toast from "react-hot-toast";

import { getAnalytics } from "@/services/analytics";
import { runSimulation, getCoaching, getWeeklyReport } from "@/services/ai";

export default function Dashboard() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPastLog, setIsPastLog] = useState(false);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  const [coaching, setCoaching] = useState<any>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);

  const [report, setReport] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getAnalytics();
      if (data && data.success) {
        setAnalyticsData(data.data);
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
        toast.success("Simulation complete.");
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
        toast.success("Insights generated successfully.");
      } else {
        toast.error(coachData?.error || "Failed to generate AI insights.");
      }
    } catch (e) {
      toast.error("Error communicating with AI service.");
    }
    setIsCoachingLoading(false);
  };

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    try {
      const reportData = await getWeeklyReport();
      if (reportData && reportData.success) {
        setReport(reportData.data);
        toast.success("Weekly report generated.");
      } else {
        toast.error("Failed to generate report.");
      }
    } catch(e) {
      toast.error("Error generating report.");
    }
    setIsReportLoading(false);
  };

  const realityScore = analyticsData?.realityScore || { current: 0, weekChange: 0, monthChange: 0 };
  const momentum = analyticsData?.momentum || { status: 'Stable ➖', changes: { focus: 0, mood: 0, consistency: 0 } };
  const drifts = analyticsData?.drifts || [];
  const correlations = analyticsData?.correlations || [];
  const avgStudy = analyticsData?.averages?.studyHours || 0;
  const totalLogs = analyticsData?.trends?.length || 0;

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

      {/* 1 & 2: KPI Cards (Score & Momentum prioritized) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Reality Score" 
          value={realityScore.current} 
          subtitle={realityScore.weekChange > 0 ? `+${realityScore.weekChange} this week` : `${realityScore.weekChange} this week`}
          icon={Target} 
          color={realityScore.current >= 70 ? "text-emerald-400" : realityScore.current >= 40 ? "text-amber-400" : "text-red-400"} 
        />
        <StatCard 
          title="Momentum" 
          value={momentum.status.replace(/[^a-zA-Z]/g, '')} 
          subtitle={momentum.status}
          icon={momentum.status.includes('Rising') ? TrendingUp : momentum.status.includes('Falling') ? TrendingDown : Activity} 
          color={momentum.status.includes('Rising') ? "text-blue-400" : momentum.status.includes('Falling') ? "text-amber-400" : "text-gray-400"} 
        />
        <StatCard 
          title="Avg Focus" 
          value={`${avgStudy.toFixed(1)}h`} 
          subtitle="Daily historical avg"
          icon={Clock} 
          color="text-white/60" 
        />
        <StatCard 
          title="Total Logs" 
          value={totalLogs} 
          subtitle="Days tracked"
          icon={Users} 
          color="text-white/60" 
        />
      </div>

      {/* Goals Progress */}
      {analyticsData?.goals && analyticsData.goals.length > 0 && (
        <div>
          <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> Active Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.goals.map((g: any) => (
              <div key={g.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white/90 text-sm font-medium capitalize">{g.title || g.type.replace('_', ' ').toLowerCase()}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.progress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {g.progress}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                  <div className={`h-1.5 rounded-full transition-all ${g.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(g.progress, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Life Areas Score */}
      {analyticsData?.lifeAreas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/5 rounded-xl p-6">
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Productivity</h3>
            <div className="text-3xl font-bold text-white/90 mb-1">{analyticsData.lifeAreas.productivity.score}</div>
            <p className="text-white/40 text-sm mt-3">Focus: {analyticsData.lifeAreas.productivity.contributors.focus} • Coding: {analyticsData.lifeAreas.productivity.contributors.coding} • Consistency: {analyticsData.lifeAreas.productivity.contributors.consistency}</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-6">
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Health</h3>
            <div className="text-3xl font-bold text-white/90 mb-1">{analyticsData.lifeAreas.health.score}</div>
            <p className="text-white/40 text-sm mt-3">Sleep: {analyticsData.lifeAreas.health.contributors.sleep} • Exercise: {analyticsData.lifeAreas.health.contributors.exercise} • Burnout: {analyticsData.lifeAreas.health.contributors.screenTime}</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-6">
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Mental State</h3>
            <div className="text-3xl font-bold text-white/90 mb-1">{analyticsData.lifeAreas.mentalState.score}</div>
            <p className="text-white/40 text-sm mt-3">Mood: {analyticsData.lifeAreas.mentalState.contributors.mood} • Momentum: {analyticsData.lifeAreas.mentalState.contributors.momentum} • Recovery: {analyticsData.lifeAreas.mentalState.contributors.recovery}</p>
          </div>
        </div>
      )}

      {/* 3. Drift Detection Alert Panel */}
      {drifts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">Drift Detection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drifts.map((drift: any, i: number) => (
              <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${drift.direction === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${drift.direction === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {drift.direction === 'positive' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${drift.direction === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {drift.direction === 'positive' ? 'Positive Ascent' : 'Negative Drift'} Detected
                  </h4>
                  <p className="text-sm text-white/70 mt-1">{drift.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 & 6. AI Coach and Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Executive Coach (takes 3 columns) */}
        <div className="lg:col-span-3 glass-panel rounded-xl premium-border flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-white/[0.04] flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400" /> Executive Coach
            </h3>
            <button 
              onClick={handleGenerateInsights}
              disabled={isCoachingLoading}
              className={`text-xs px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                isCoachingLoading ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20'
              }`}
            >
              {isCoachingLoading ? (
                <><RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Analyzing</>
              ) : 'Update Coaching'}
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            {coaching ? (
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
                <Lightbulb className="w-8 h-8 opacity-20" />
                <p className="text-sm font-medium">Request insights to analyze your data context.</p>
              </div>
            )}
          </div>
        </div>

        {/* Correlation Insights (takes 2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl premium-border flex flex-col h-[400px]">
          <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase mb-5 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" /> Correlated Habits
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-2">
            {correlations.length > 0 ? correlations.map((c: any, i: number) => (
              <div key={i} className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.04] flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white/90">{c.cause}</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                  <span className={`text-sm font-bold ${c.impact === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>{c.effect}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>Confidence: <span className="text-white/60">{c.confidence}</span></span>
                  <span>n={c.sampleSize}</span>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-3">
                <Activity className="w-6 h-6 opacity-50" />
                <p className="text-sm font-medium">Log more data to uncover correlations.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. 30-Day Outlook */}
      <div className="glass-panel rounded-xl premium-border overflow-hidden">
        <div className="p-6 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase flex items-center gap-2">
              <Play className="w-4 h-4 text-violet-400" /> 30-Day Outlook
            </h3>
            <p className="text-xs text-white/40 mt-1">Trajectory modeling based on your current momentum.</p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={isSyncing}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isSyncing ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Run Simulation'}
          </button>
        </div>

        <div className="p-6">
          {simulationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-white/5 z-0" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-cyan-400/90 uppercase tracking-widest">Optimized</h4>
                </div>
                <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex-1">
                  <p className="text-sm text-white/60 leading-relaxed">{typeof simulationResult.bestCase === 'string' ? simulationResult.bestCase : simulationResult.bestCase?.text}</p>
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
                  <p className="text-sm text-white/80 font-medium leading-relaxed">{typeof simulationResult.currentPath === 'string' ? simulationResult.currentPath : simulationResult.currentPath?.text}</p>
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
                  <p className="text-sm text-white/60 leading-relaxed">{typeof simulationResult.worstCase === 'string' ? simulationResult.worstCase : simulationResult.worstCase?.text}</p>
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

        {/* Forecast Accuracy Panel */}
        {simulationResult?.forecastEvaluation && (
          <div className="border-t border-white/[0.04] p-6 bg-white/[0.01]">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Forecast Accuracy</h4>
            {simulationResult.forecastEvaluation.status === 'ready' && simulationResult.forecastEvaluation.overallAccuracy !== null ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white/90">{simulationResult.forecastEvaluation.overallAccuracy}%</span>
                      <span className="text-xs text-white/40">Overall Accuracy</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white/80">{simulationResult.forecastEvaluation.latestMetrics?.focus || 0}%</span>
                        <span className="text-xs text-white/40">Focus</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white/80">{simulationResult.forecastEvaluation.latestMetrics?.mood || 0}%</span>
                        <span className="text-xs text-white/40">Mood</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white/80">{simulationResult.forecastEvaluation.latestMetrics?.sleep || 0}%</span>
                        <span className="text-xs text-white/40">Sleep</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${simulationResult.forecastEvaluation.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : simulationResult.forecastEvaluation.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      Confidence: {simulationResult.forecastEvaluation.confidence}
                    </div>
                    <div className="px-3 py-1.5 rounded-md text-xs font-semibold border bg-white/5 text-white/60 border-white/10">
                      Sample: {simulationResult.forecastEvaluation.history.length} forecasts
                    </div>
                  </div>
                </div>

                {simulationResult.forecastEvaluation.history.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Prediction History</h5>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {simulationResult.forecastEvaluation.history.map((hist: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] min-w-[120px]">
                          <span className="text-xs text-white/50">{new Date(hist.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-lg font-bold text-white/80">{hist.overall}%</span>
                            <span className="text-[10px] font-medium text-emerald-400/80">ACC</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : simulationResult.forecastEvaluation.status === 'maturing' && simulationResult.forecastEvaluation.maturing ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <Activity className="w-5 h-5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-400">Data Sufficiency: Maturing</span>
                  <span className="text-xs text-white/50">{simulationResult.forecastEvaluation.maturing.daysCollected} / 30 Days Collected</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Not enough data to calculate forecast accuracy.</p>
            )}
          </div>
        )}
      </div>

      {/* 7. Weekly Report */}
      <div className="glass-panel rounded-xl premium-border overflow-hidden">
        <div className="p-6 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-pink-400" /> Weekly Synthesis
            </h3>
            <p className="text-xs text-white/40 mt-1">High-level summary of your week's core metrics.</p>
          </div>
          <button 
            onClick={handleGenerateReport}
            disabled={isReportLoading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isReportLoading ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border border-pink-600/20'
            }`}
          >
            {isReportLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Fetch Report'}
          </button>
        </div>

        <div className="p-6">
          {report ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Biggest Win</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{report.biggestWin}</p>
                </div>
                <div className="p-5 rounded-lg bg-amber-500/[0.03] border border-amber-500/20">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">Biggest Risk</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{report.biggestRisk}</p>
                </div>
              </div>
              <div className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-base text-white/70 leading-relaxed font-medium">{report.narrative}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-white/30 space-y-3 border border-dashed border-white/10 rounded-lg">
              <FileText className="w-6 h-6 opacity-40" />
              <p className="text-sm font-medium">No report generated for this week yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="glass-panel p-5 rounded-xl premium-border flex flex-col justify-between h-32 hover:bg-white/[0.02] transition-colors relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider truncate pr-2">{title}</p>
        <Icon className={`w-4 h-4 ${color} shrink-0`} />
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-bold tracking-tight text-white/90 mb-1">{value}</h4>
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>
      <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl bg-current ${color}`} />
    </div>
  );
}
