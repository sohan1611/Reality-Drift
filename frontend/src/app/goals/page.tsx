"use client";
import { useState, useEffect } from "react";
import { Plus, Target, CheckCircle2, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getGoals, createGoal, deleteGoal as deleteGoalRequest } from "@/services/goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'FOCUS', target: 8, operator: '>=', title: '' });

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const data = await getGoals();
      if (data.success) setGoals(data.data);
    } catch (e) {
      toast.error("Failed to load goals.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createGoal(formData);
      if (data.success) {
        toast.success("Goal created!");
        setIsFormOpen(false);
        fetchGoals();
      } else {
        toast.error(data.error || "Failed to create goal.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const data = await deleteGoalRequest(id);
      if (data.success) {
        toast.success("Goal deleted.");
        fetchGoals();
      } else {
        toast.error("Failed to delete goal.");
      }
    } catch (e) {
      toast.error("Failed to delete goal.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white/90">Goals</h2>
          <p className="text-white/40 mt-1.5 text-sm">Define and track your active habits and limits.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Metric Type</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="FOCUS">Focus Hours / Day</option>
                  <option value="SLEEP">Sleep Hours / Day</option>
                  <option value="SCREEN_TIME">Screen Time Limit</option>
                  <option value="EXERCISE">Exercise Sessions / Week</option>
                  <option value="MOOD">Mood Score</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              {formData.type === 'CUSTOM' && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Custom Title</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    placeholder="e.g. Read Pages"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-white/60 mb-2">Target Operator</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                  value={formData.operator}
                  onChange={(e) => setFormData({...formData, operator: e.target.value})}
                >
                  <option value=">=">At least {'>='}</option>
                  <option value="<=">At most {'<='}</option>
                  <option value="==">Exactly {'=='}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Target Value</label>
                <input 
                  type="number"
                  step="0.5"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Save Goal</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse flex gap-4">
          <div className="bg-white/5 rounded-xl h-32 w-full"></div>
          <div className="bg-white/5 rounded-xl h-32 w-full"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white/80 font-medium">No active goals</h3>
          <p className="text-white/40 text-sm mt-1">Set a goal to start tracking your habit momentum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white/5 border border-white/5 rounded-xl p-6 relative group">
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <h3 className="text-white/90 font-medium capitalize mb-1">{goal.title || goal.type.replace('_', ' ').toLowerCase()}</h3>
              <p className="text-white/50 text-sm mb-4">Target: {goal.operator} {goal.target}</p>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/70">Current: {goal.currentValue.toFixed(1)}</span>
                <span className={`text-sm font-medium ${goal.isMeeting ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {goal.progress}% Complete
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${goal.isMeeting ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
