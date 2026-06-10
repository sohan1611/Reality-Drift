import { HelpCircle, Activity, BrainCircuit, LineChart, FileText, CalendarClock, MessageSquare, AlertTriangle } from "lucide-react";

export default function Help() {
  const faqs = [
    { q: "How much data do I need before insights become useful?", a: "While the dashboard updates immediately, the system typically requires 7 to 14 days of consistent logging to establish a reliable baseline and generate accurate correlations." },
    { q: "Why is my Forecast Accuracy unavailable?", a: "Forecast Accuracy requires at least 30 days of history to compare past 30-Day Outlook projections against actual recorded outcomes." },
    { q: "What happens if I miss a day of logging?", a: "Missing a single day won't break the system, but it may temporarily lower your Consistency score. The analytics engine will bridge short gaps, but daily logging provides the sharpest insights." },
    { q: "Does Reality Drift store my personal data securely?", a: "Yes. All daily logs and personal metrics are strictly tied to your authenticated account and are never shared publicly. We prioritize data privacy above all else." },
    { q: "How does the Decision Simulator work?", a: "The Simulator takes your personalized historical correlations and applies hypothetical adjustments (like adding +2 hours of sleep) to forecast how those changes would likely impact your Reality Score and Momentum." },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-16">
      <div className="space-y-4 pt-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Help & Learning Center</h2>
        <p className="text-gray-400 text-lg">Learn how Reality Drift works and how to get the most value from your data.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">How Insights Are Generated</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Reality Score
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              A daily measure (0-100) of overall alignment between your focus time, sleep duration, subjective mood, and logging consistency.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-green-400" /> Momentum
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Shows whether your recent habits are mathematically improving (Rising), declining (Falling), or remaining consistent (Stable) across the past week.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Drift Detection
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Identifies meaningful deviations in your behavior compared to your baseline, notifying you of shifts before they solidify into long-term trends.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Forecast Accuracy
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Measures how closely Reality Drift's past 30-day projections matched your actual recorded outcomes, providing a confidence level for future predictions.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 lg:col-span-2">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" /> Decision Simulator
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Takes your personalized historical correlations and applies hypothetical adjustments (like +2 hours of sleep) to forecast how those changes would likely impact your Reality Score.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">Analytics</h4>
            <p className="text-xs text-gray-400">Deep-dive into your historical trends, visual heatmaps, and personalized correlations.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">Decision Simulator</h4>
            <p className="text-xs text-gray-400">Test hypothetical lifestyle changes to see how they impact your future trajectory.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">Weekly Reports</h4>
            <p className="text-xs text-gray-400">Receive an automated summary of your biggest wins and hidden risks every week.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">AI Coach</h4>
            <p className="text-xs text-gray-400">Get personalized, actionable advice tailored to your recent behavioral patterns.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2">
            <h4 className="font-bold text-white mb-2">30-Day Outlook</h4>
            <p className="text-xs text-gray-400">A data-driven projection of what the next month looks like if you maintain your current habits.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 mt-12">
        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          <HelpCircle className="text-primary w-6 h-6" /> 
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <h4 className="text-lg font-medium text-white">{faq.q}</h4>
              <p className="text-gray-400 mt-2 leading-relaxed text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between opacity-60">
            <div>
              <h4 className="font-bold text-white">Report an Issue</h4>
              <p className="text-xs text-gray-400 mt-1">Found a bug? Let us know.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between opacity-60">
            <div>
              <h4 className="font-bold text-white">Feature Requests</h4>
              <p className="text-xs text-gray-400 mt-1">Suggest an improvement.</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
