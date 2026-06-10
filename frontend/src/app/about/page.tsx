import { Target, Activity, Brain } from "lucide-react";

export default function About() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-16">
      <div className="text-center space-y-6 pt-12 pb-8">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Reality Drift</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Understand where your habits are taking you.
        </p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Why Reality Drift Exists</h3>
        <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
          <p>
            Most productivity tools focus entirely on tracking the past—counting how many hours you worked, how many steps you took, or how many tasks you crossed off a list. 
          </p>
          <p>
            However, simply collecting data doesn't automatically translate into better decisions. We built Reality Drift because we wanted a platform that focuses on understanding the trajectory of the future by analyzing patterns in your daily behavior. By transforming simple daily reflections into long-term trends and forecasts, Reality Drift helps you see exactly where your current habits are leading you.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-center text-white">Core Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Clarity</h4>
            <p className="text-gray-400 text-sm leading-relaxed">Understand the hidden patterns inside your everyday habits and daily routines.</p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Consistency</h4>
            <p className="text-gray-400 text-sm leading-relaxed">Small, repeatable actions compound into meaningful and lasting outcomes over time.</p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Reflection</h4>
            <p className="text-gray-400 text-sm leading-relaxed">Better decisions start with objectively understanding your own behavior and outcomes.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-lg mt-12">
        <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">What You Can Expect</h3>
        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
            <p className="text-gray-300"><strong>Better awareness</strong> of how your sleep, focus, and mood interact on a daily basis.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
            <p className="text-gray-300"><strong>Clearer long-term trends</strong> through visual heatmaps and momentum tracking.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
            <p className="text-gray-300"><strong>More informed decisions</strong> using the Simulator to test lifestyle adjustments before committing.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
            <p className="text-gray-300"><strong>Greater consistency</strong> driven by personalized insights and weekly accountability reports.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
