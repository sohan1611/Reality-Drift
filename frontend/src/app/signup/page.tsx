"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signup } from "@/services/auth";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await signup({ name, email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Network error. Is backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] -z-10"></div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md glow-border relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary glow-text mb-2">Reality Drift</h1>
          <p className="text-gray-400">Initialize New Neural Profile</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Designation (Name)</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={name} onChange={e => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Identity</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Access Key (Password)</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-secondary hover:bg-secondary/80 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,210,255,0.5)] mt-4">
            Initialize Sequence
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already synced? <Link href="/login" className="text-primary hover:text-white transition-colors">Login here</Link>
        </p>
      </div>
    </div>
  );
}
