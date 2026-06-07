import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ApiDashboard() {
  const [activeKey, setActiveKey] = useState('pk_live_9x8a7...');
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* BACKGROUND: Data Stream Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_60%)] blur-[100px]" />
        <motion.div animate={{ opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] mix-blend-overlay opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-24">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          <div className="flex justify-between items-end mb-8">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Developer Console
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">API & Webhooks.</h1>
            </motion.div>
            <motion.div variants={item} className="flex gap-4">
              <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors">Read Docs</button>
              <button className="px-6 py-3 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)]">+ Generate Key</button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Keys Management */}
            <motion.div variants={item} className="xl:col-span-2 bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[40px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Authentication Keys</h3>
              <div className="space-y-4">
                {[
                  { name: 'Production Default', key: 'pk_live_9x8a7...', created: 'Oct 12, 2026', lastUsed: 'Just now' },
                  { name: 'Staging Environment', key: 'pk_test_4m2v1...', created: 'Oct 10, 2026', lastUsed: '2 hours ago' }
                ].map((k, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold">{k.name}</p>
                        <p className="text-xs font-mono text-zinc-500 mt-1">{k.key} <span className="ml-2 text-[10px] bg-white/10 px-2 py-0.5 rounded cursor-pointer hover:text-white">Copy</span></p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-zinc-500 mb-1">Last Used: {k.lastUsed}</p>
                      <button className="text-xs font-bold text-rose-500 hover:text-rose-400">Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div variants={item} className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-colors" />
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">30D Request Volume</h3>
              <h2 className="text-5xl font-black font-mono tracking-tighter mb-2">1.24M</h2>
              <p className="text-sm text-emerald-400 font-bold mb-8">100% Success Rate</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Avg Latency</span>
                  <span className="font-mono font-bold text-cyan-400">42ms</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Rate Limit</span>
                  <span className="font-mono font-bold">100 / sec</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}