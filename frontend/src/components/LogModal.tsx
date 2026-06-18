"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createLog } from "@/services/logs";

export default function LogModal({ isOpen, onClose, onLogAdded, isPast }: any) {
  const [date, setDate] = useState("");
  const [studyHours, setStudy] = useState<number | "">("");
  const [screenTime, setScreen] = useState<number | "">("");
  const [sleepHours, setSleep] = useState<number | "">("");
  const [codingHours, setCoding] = useState<number | "">("");
  const [mood, setMood] = useState(5);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setStudy("");
      setScreen("");
      setSleep("");
      setCoding("");
      setMood(5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        studyHours: Number(studyHours) || 0, 
        screenTime: Number(screenTime) || 0, 
        sleepHours: Number(sleepHours) || 0, 
        codingHours: Number(codingHours) || 0, 
        mood, 
        date 
      };
      const data = await createLog(payload);
      if (data.success) {
        toast.success("Matrix data synced successfully!");
        onLogAdded();
        onClose();
      } else {
        toast.error(data.error || "Failed to sync data.");
      }
    } catch (err) {
      toast.error("Network error. Backend offline.");
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl glow-border p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 glow-text text-primary">Log Daily Matrix</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isPast && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Date</label>
              <input 
                type="date" required max={new Date().toISOString().split('T')[0]}
                style={{ colorScheme: "dark" }}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" 
                value={date} onChange={e => setDate(e.target.value)} 
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Study Hours</label>
              <input type="number" placeholder="0" min="0" step="0.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={studyHours} onChange={e => setStudy(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Coding Hours</label>
              <input type="number" placeholder="0" min="0" step="0.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={codingHours} onChange={e => setCoding(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Screen Time</label>
              <input type="number" placeholder="0" min="0" step="0.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={screenTime} onChange={e => setScreen(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sleep Hours</label>
              <input type="number" placeholder="0" min="0" step="0.5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={sleepHours} onChange={e => setSleep(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Mood (1-10)</label>
            <input type="range" min="1" max="10" className="w-full accent-primary" value={mood} onChange={e => setMood(Number(e.target.value))} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Depleted</span>
              <span className="font-bold text-white text-base">{mood}</span>
              <span>Optimal</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.5)] mt-6">
            {isSubmitting ? "Syncing..." : "Sync Matrix Data"}
          </button>
        </form>
      </div>
    </div>
  );
}
