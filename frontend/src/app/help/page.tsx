import { HelpCircle, FileText, Zap, Shield } from "lucide-react";

export default function Help() {
  const faqs = [
    { q: "How does the tracking work?", a: "By submitting your daily logs, our system processes the variables and maps your trajectory over 30 days." },
    { q: "Why is my Burnout Risk high?", a: "The system detects when your active hours vastly exceed recovery (sleep/downtime) across a 7-day period." },
    { q: "Can I connect external datasets?", a: "External API integrations (e.g., GitHub, WakaTime) are planned for Reality Drift v2.0." },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight glow-text">Command Center Support</h2>
        <p className="text-gray-400 text-lg">Access documentation and platform troubleshooting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl glow-border text-center hover:bg-white/5 transition-colors cursor-pointer">
          <FileText className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold">Documentation</h3>
          <p className="text-sm text-gray-400 mt-2">Read the complete manual for Reality Drift operation.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl glow-border text-center hover:bg-white/5 transition-colors cursor-pointer">
          <Zap className="w-8 h-8 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-bold">API Reference</h3>
          <p className="text-sm text-gray-400 mt-2">Integrate your custom modules with our endpoints.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl glow-border text-center hover:bg-white/5 transition-colors cursor-pointer">
          <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
          <h3 className="text-lg font-bold">Security</h3>
          <p className="text-sm text-gray-400 mt-2">Review our data encryption and privacy protocols.</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl glow-border mt-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="text-primary w-6 h-6" /> 
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
              <h4 className="text-lg font-medium text-blue-100">{faq.q}</h4>
              <p className="text-gray-400 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
