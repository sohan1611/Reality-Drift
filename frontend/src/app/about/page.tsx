import Image from "next/image";
import { Rocket, Code, Database } from "lucide-react";

export default function About() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      <div className="text-center space-y-4 pt-8">
        <h2 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary glow-text">Reality Drift</h2>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
          The ultimate AI-powered life simulator. We bridge the gap between your daily habits and your potential future.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl glow-border">
        <h3 className="text-2xl font-bold mb-4 border-b border-white/10 pb-4">Our Mission</h3>
        <p className="text-gray-300 leading-relaxed text-lg">
          At Reality Drift, we believe that the future is simply a mathematical projection of the present. By analyzing micro-habits—sleep, focus time, and digital consumption—our engine provides you with unparalleled clarity into where your current trajectory leads, helping you steer away from burnout and toward optimal flow states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-border text-center">
          <Rocket className="w-10 h-10 text-primary mx-auto mb-4" />
          <h4 className="text-xl font-bold mb-2">Pioneering UX</h4>
          <p className="text-sm text-gray-400">Glassmorphism and deep-space aesthetic design to keep your focus locked in.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl glow-border text-center">
          <Code className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h4 className="text-xl font-bold mb-2">Advanced Engine</h4>
          <p className="text-sm text-gray-400">Powered by Next.js and Prisma, providing a flawless synchronization matrix.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl glow-border text-center">
          <Database className="w-10 h-10 text-accent mx-auto mb-4" />
          <h4 className="text-xl font-bold mb-2">Data Integrity</h4>
          <p className="text-sm text-gray-400">Your neural data remains strictly encrypted and analyzed only with your consent.</p>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-white/5">
        <p className="text-sm text-gray-500">Reality Drift v1.0.0. Engineered for the future.</p>
      </div>
    </div>
  );
}
