"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight } from "lucide-react";

export default function RestaurantLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/restaurant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restaurant_token", data.access_token);
        
        if (data.user.restaurantSlug) {
          router.push(`/dashboard/${data.user.restaurantSlug}`);
        } else {
          setError("No restaurant linked to this account.");
        }
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
    <div className="min-h-screen flex bg-[#0A0A0A] selection:bg-amber-500/30">
      
      {/* Left Side: Premium Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop" 
            alt="Premium Restaurant" 
            className="object-cover w-full h-full opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-lg px-12 text-left w-full mt-20">
          <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-8 shadow-2xl">
            <Store className="text-amber-500 w-5 h-5" />
            <span className="text-white text-sm font-bold tracking-widest uppercase">IQZeen Partner</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
            Elevate your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              Dining Experience
            </span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed font-medium mb-12 max-w-md">
            Manage orders, track analytics, and deliver lightning-fast service with our next-generation restaurant terminal.
          </p>
          
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 mt-12">
            <div>
              <div className="text-3xl font-black text-white mb-1">Live</div>
              <div className="text-gray-400 text-sm font-medium">Real-time KDS syncing</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">Instant</div>
              <div className="text-gray-400 text-sm font-medium">QR Ordering & Payments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-600/10 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-orange-600/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="text-white w-8 h-8" />
            </div>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white tracking-tight">Terminal Access</h2>
            <p className="mt-2 text-sm text-gray-400 font-medium">Log in to your restaurant control center.</p>
          </div>

          <div className="mt-10 bg-black/40 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider text-xs">Email Address</label>
                <div className="relative rounded-xl shadow-sm group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1A1A1A]/80 text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 block w-full pl-12 sm:text-sm border-white/10 rounded-xl py-3.5 border outline-none font-medium transition-all"
                    placeholder="owner@restaurant.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider text-xs flex justify-between">
                  <span>Password</span>
                  <a href="#" className="text-amber-500 hover:text-amber-400 normal-case">Forgot?</a>
                </label>
                <div className="relative rounded-xl shadow-sm group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#1A1A1A]/80 text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 block w-full pl-12 sm:text-sm border-white/10 rounded-xl py-3.5 border outline-none font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-amber-500/25 text-sm font-black tracking-widest text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] focus:ring-amber-500 disabled:opacity-70 gap-2 items-center transition-all uppercase hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Authenticating...</span>
                  ) : (
                    <>Access Terminal <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <p className="mt-8 text-center text-xs text-gray-600 font-medium">
            &copy; {new Date().getFullYear()} IQZeen Systems. Secure terminal connection.
          </p>
        </div>
      </div>
    </div>
  );
}
