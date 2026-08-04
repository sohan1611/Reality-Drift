"use client";
import { useState, useEffect } from "react";
import { List, Calendar, AlertTriangle, TrendingUp, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { getReviews } from "@/services/reviews";
import { getWeeklyReport } from "@/services/ai";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getReviews();
      if (data.success) setReviews(data.data);
    } catch (e) {
      toast.error("Failed to load reviews.");
    }
    setIsLoading(false);
  };

  const generateReport = async () => {
    toast.loading("Generating latest report...", { id: 'report' });
    try {
      const data = await getWeeklyReport();
      if (data.success) {
        toast.success("Report generated!", { id: 'report' });
        fetchReviews();
      } else {
        toast.error(data.error || "Failed to generate report.", { id: 'report' });
      }
    } catch (e) {
      toast.error("Network error.", { id: 'report' });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white/90">Weekly Reviews</h2>
          <p className="text-white/40 mt-1.5 text-sm">Your historical AI synthesis and reality assessments.</p>
        </div>
        <button 
          onClick={generateReport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Generate Latest
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="bg-white/5 rounded-xl h-48 w-full"></div>
          <div className="bg-white/5 rounded-xl h-48 w-full"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <List className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white/80 font-medium">No reviews yet</h3>
          <p className="text-white/40 text-sm mt-1">Generate your first weekly report to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-6 relative">
              <div className="flex items-center gap-2 mb-4 text-white/50 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              <div className="space-y-4">
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  {r.reportData.narrative}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Biggest Win
                    </h4>
                    <p className="text-white/80 text-sm">{r.reportData.biggestWin}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Biggest Risk
                    </h4>
                    <p className="text-white/80 text-sm">{r.reportData.biggestRisk}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
