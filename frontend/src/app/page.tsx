'use client';

import { Store, Utensils, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function IQZeenLandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300 font-sans selection:bg-amber-500/30 overflow-hidden relative flex flex-col items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl mb-6">
            <span className="text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tighter">IQZeen</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Smart Restaurant Systems</h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">Select a restaurant portal below to access the Owner KDS Dashboards or simulate a Customer Table Menu.</p>
        </div>

        {/* Restaurant Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Shaan Restaurant Card */}
          <div className="bg-[#151515] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-[40px] group-hover:bg-amber-500/20 transition-all"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                <Store className="text-amber-500 w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Shaan Restaurant</h2>
                <p className="text-sm text-gray-400 font-medium tracking-wide">Authentic Indian Cuisine</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/dashboard/login" className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10 group/btn">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-gray-400 group-hover/btn:text-white" />
                  <span className="font-bold text-gray-200 group-hover/btn:text-white">Owner Dashboard</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/btn:text-amber-500 group-hover/btn:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/menu/qr-table-1" className="w-full flex items-center justify-between p-4 bg-amber-500/10 rounded-xl hover:bg-amber-500/20 transition-colors border border-amber-500/20 group/btn">
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-500">Customer Menu (Table 1)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500/50 group-hover/btn:text-amber-500 group-hover/btn:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* S&A Cafe Card */}
          <div className="bg-[#151515] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-[40px] group-hover:bg-orange-500/20 transition-all"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                <Store className="text-orange-500 w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">S&A Cafe</h2>
                <p className="text-sm text-gray-400 font-medium tracking-wide">Modern Desi Theme</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/dashboard/login" className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10 group/btn">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-gray-400 group-hover/btn:text-white" />
                  <span className="font-bold text-gray-200 group-hover/btn:text-white">Owner Dashboard</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/btn:text-orange-500 group-hover/btn:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/menu/sanda-table-1" className="w-full flex items-center justify-between p-4 bg-orange-500/10 rounded-xl hover:bg-orange-500/20 transition-colors border border-orange-500/20 group/btn">
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-orange-500">Customer Menu (Table 1)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500/50 group-hover/btn:text-orange-500 group-hover/btn:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

        </div>

        {/* Global Access Login */}
        <div className="mt-16 text-center">
          <Link href="/dashboard/login" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <LogIn className="w-5 h-5" />
            Central System Login
          </Link>
        </div>

      </div>
    </div>
  );
}
