"use client";
import { useState } from "react";
import { submitFeatureRequest } from "@/services/support";
import toast from "react-hot-toast";
import { Lightbulb, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FeatureRequest() {
  const [category, setCategory] = useState("Dashboard & Analytics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitFeatureRequest({ category, title, description });
      if (res.success) {
        setSubmitted(true);
      } else {
        toast.error(res.error || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto pt-16 flex flex-col items-center justify-center text-center space-y-6 pb-16">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Thank You</h2>
        <p className="text-gray-400 text-lg">Thanks for helping improve Reality Drift. Your submission has been recorded and your feature request has been sent to the platform owner.</p>
        <Link href="/help" className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/5 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-8 pt-4">
      <div className="flex items-center gap-4">
        <Link href="/help" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Feature Request</h2>
          <p className="text-gray-400 text-sm">Have an idea to make Reality Drift better? We're all ears.</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Lightbulb className="w-64 h-64 text-white" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
            >
              <option value="Dashboard & Analytics">Dashboard & Analytics</option>
              <option value="AI Coach & Simulator">AI Coach & Simulator</option>
              <option value="Project Tracking">Project Tracking</option>
              <option value="Logging Experience">Logging Experience</option>
              <option value="Integrations">Integrations</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Title *</label>
            <input 
              type="text" required placeholder="Short summary of your idea"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description *</label>
            <textarea 
              required placeholder="How would this feature work? What problem does it solve?" rows={5}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors resize-none"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Feature Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
