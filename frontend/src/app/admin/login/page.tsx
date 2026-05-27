"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@iqzeen.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.access_token);
        router.push("/admin");
      } else {
        const errData = await res.json();
        setError(errData.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-xl shadow-indigo-500/20 mb-6 transform transition-transform hover:scale-105">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-2">
            IQZEEN Admin
          </h2>
          <p className="text-gray-400 font-medium">Super User Command Center</p>
        </div>

        {/* Login Card (Glassmorphism) */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  placeholder="admin@iqzeen.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>Authenticating...</>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Secure Login
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 font-medium">
          Protected by IQZEEN Security Systems
        </div>
      </div>
    </div>
  );
}
