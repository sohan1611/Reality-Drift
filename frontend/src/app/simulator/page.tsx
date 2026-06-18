'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Zap, Moon, Monitor, Activity, ChevronRight, BarChart3, Database, AlertCircle, RefreshCcw } from 'lucide-react';
import { simulateDecision } from '@/services/ai';

type Adjustments = {
  sleep: number;
  focus: number;
  screenTime: number;
  exercise: number;
};

type SimulationResult = {
  projected: {
    realityScore: number;
    realityScoreDelta: string;
    focusDeltaPct: number;
    moodDeltaPct: number;
    consistencyDeltaPct: number;
    momentum: string;
  };
  metrics: {
    focus: number;
    mood: number;
    sleep: number;
    exercise: number;
    screenTime: number;
  };
  confidence: {
    level: string;
    logsUsed: number;
    correlationsUsed: number;
    personalDataPct: number;
    heuristicDataPct: number;
    appliedLog: string[];
  };
  reasoning?: string;
  goalAlignment?: any[];
};

export default function SimulatorPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState<Adjustments>({
    sleep: 0,
    focus: 0,
    screenTime: 0,
    exercise: 0
  });
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const presets = [
    { name: 'Exam Prep', icon: <Zap className="w-4 h-4 text-amber-400" />, adjustments: { sleep: 1, focus: 3, screenTime: -2, exercise: 0 } },
    { name: 'Fitness Focus', icon: <Activity className="w-4 h-4 text-emerald-400" />, adjustments: { sleep: 1, focus: 0, screenTime: 0, exercise: 4 } },
    { name: 'Deep Work', icon: <Monitor className="w-4 h-4 text-indigo-400" />, adjustments: { sleep: 0, focus: 2, screenTime: -3, exercise: 0 } },
    { name: 'Recovery', icon: <Moon className="w-4 h-4 text-cyan-400" />, adjustments: { sleep: 2, focus: -1, screenTime: 0, exercise: 2 } },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setAdjustments(preset.adjustments);
  };

  const handleSliderChange = (key: keyof Adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateDecision(adjustments);
      if (res && res.success) {
        setResult(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.04] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Settings className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white/90">Decision Simulator</h1>
            <p className="text-[10px] font-medium text-white/40 tracking-wider">PREDICTIVE REALITY ENGINE</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-xl border border-white/[0.04]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Scenario Presets</h2>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((p, idx) => (
                <button 
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors text-left"
                >
                  <div className="p-2 rounded-md bg-white/[0.02]">
                    {p.icon}
                  </div>
                  <span className="text-sm font-semibold text-white/80">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/[0.04]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">Hypothetical Adjustments</h2>
              <button onClick={() => setAdjustments({sleep:0, focus:0, screenTime:0, exercise:0})} className="text-[10px] text-white/40 hover:text-white">RESET</button>
            </div>

            <div className="space-y-8">
              {/* Sleep */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                    <Moon className="w-4 h-4" /> Sleep (Hours)
                  </label>
                  <span className="text-sm font-bold">{adjustments.sleep > 0 ? '+' : ''}{adjustments.sleep}h</span>
                </div>
                <input 
                  type="range" min="-4" max="4" step="0.5" 
                  value={adjustments.sleep} 
                  onChange={(e) => handleSliderChange('sleep', parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Focus */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Focus (Hours)
                  </label>
                  <span className="text-sm font-bold">{adjustments.focus > 0 ? '+' : ''}{adjustments.focus}h</span>
                </div>
                <input 
                  type="range" min="-6" max="6" step="0.5" 
                  value={adjustments.focus} 
                  onChange={(e) => handleSliderChange('focus', parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              {/* Screen Time */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-pink-400 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Screen Time (Hours)
                  </label>
                  <span className="text-sm font-bold">{adjustments.screenTime > 0 ? '+' : ''}{adjustments.screenTime}h</span>
                </div>
                <input 
                  type="range" min="-6" max="6" step="0.5" 
                  value={adjustments.screenTime} 
                  onChange={(e) => handleSliderChange('screenTime', parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-400"
                />
              </div>

              {/* Exercise */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Exercise (Sessions/Wk)
                  </label>
                  <span className="text-sm font-bold">{adjustments.exercise > 0 ? '+' : ''}{adjustments.exercise}</span>
                </div>
                <input 
                  type="range" min="-5" max="7" step="1" 
                  value={adjustments.exercise} 
                  onChange={(e) => handleSliderChange('exercise', parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full mt-8 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              {isSimulating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              {isSimulating ? 'COMPUTING MATRICES...' : 'SIMULATE OUTCOMES'}
            </button>
          </div>

        </div>

        {/* Right Column: Outcomes */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              {/* Top Meta: Confidence */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.confidence.level === 'High' ? 'bg-emerald-500/10 text-emerald-400' : result.confidence.level === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white/90">Confidence: {result.confidence.level}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{result.confidence.logsUsed} Logs Analyzed</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white/80">{result.confidence.personalDataPct}%</span>
                    <span className="text-[10px] text-white/40 uppercase">Personal Data</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-white/80">{result.confidence.heuristicDataPct}%</span>
                    <span className="text-[10px] text-white/40 uppercase">Heuristics</span>
                  </div>
                </div>
              </div>

              {/* Main KPI: Reality Score */}
              <div className="glass-panel p-8 rounded-2xl border border-white/[0.04] flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute -inset-24 bg-indigo-500/10 blur-3xl rounded-full z-0 pointer-events-none opacity-50"></div>
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-2">Projected Reality Score</h3>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-6xl font-black tracking-tighter text-white">{result.projected.realityScore}</span>
                    <span className={`text-xl font-bold ${result.projected.realityScoreDelta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.projected.realityScoreDelta}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-4 font-medium">Momentum: <span className="text-white/90">{result.projected.momentum}</span></p>
                </div>
              </div>

              {/* Delta Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Focus</span>
                  <span className={`text-2xl font-bold ${result.projected.focusDeltaPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.projected.focusDeltaPct >= 0 ? '+' : ''}{result.projected.focusDeltaPct}%
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Mood</span>
                  <span className={`text-2xl font-bold ${result.projected.moodDeltaPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.projected.moodDeltaPct >= 0 ? '+' : ''}{result.projected.moodDeltaPct}%
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Consistency</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    +MAX
                  </span>
                </div>
              </div>

              {/* Goal Alignment */}
              {result.goalAlignment && result.goalAlignment.length > 0 && (
                <div className="glass-panel p-6 rounded-xl border border-white/[0.04]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Goal Alignment</h3>
                  <div className="space-y-4">
                    {result.goalAlignment.map((g: any) => (
                      <div key={g.id} className="flex flex-col gap-2 p-3 bg-white/[0.02] rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-white/90 capitalize">{g.title || g.type.replace('_', ' ').toLowerCase()}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.status === 'Closer to Goal' ? 'bg-emerald-500/20 text-emerald-400' : g.status === 'Moving Away' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {g.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>Current: {g.currentProgress}%</span>
                          <span>→</span>
                          <span className={g.projectedProgress > g.currentProgress ? 'text-emerald-400 font-medium' : g.projectedProgress < g.currentProgress ? 'text-red-400 font-medium' : ''}>
                            Projected: {g.projectedProgress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explainability Panel */}
              <div className="glass-panel rounded-xl border border-white/[0.04] overflow-hidden">
                <div className="p-4 border-b border-white/[0.04] bg-white/[0.01]">
                  <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Engine Reasoning
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {result.reasoning ? (
                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                      {result.reasoning}
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 italic">Generating natural language explanation...</p>
                  )}
                  
                  <div className="pt-4 border-t border-white/[0.04]">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">Mathematical Correlators Triggered</h4>
                    <ul className="space-y-2">
                      {result.confidence.appliedLog.map((log, i) => (
                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          {log}
                        </li>
                      ))}
                      {result.confidence.appliedLog.length === 0 && (
                        <li className="text-xs text-white/40">No significant correlators triggered. Projection relies heavily on direct baselines.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-bold text-white/80 mb-2">Awaiting Parameters</h3>
              <p className="text-sm text-white/40 max-w-sm">
                Adjust the sliders or select a preset to mathematically simulate how hypothetical changes will impact your Reality Score.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
