"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { login } from "@/services/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password });
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
          <p className="text-gray-400">Welcome Back</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.5)]">
            Log In
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm text-gray-400 mb-4">Or continue with</p>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: credentialResponse.credential })
                });
                const data = await res.json();
                if (data.success) {
                  localStorage.setItem("token", data.token);
                  router.push("/");
                } else {
                  setError(data.error);
                }
              } catch (err) {
                setError("Google login failed");
              }
            }}
            onError={() => {
              setError('Google Login Failed');
            }}
            theme="filled_black"
            shape="pill"
            width="300"
          />
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account? <Link href="/signup" className="text-secondary hover:text-white transition-colors">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
