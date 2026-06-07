import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Challenges Data ---
const activeChallenge = {
  id: 'EVAL-992K',
  tier: '100K Pro Evaluation',
  phase: 'Phase 1',
  status: 'Active',
  daysLeft: 22,
  startingBalance: 100000,
  currentBalance: 105240,
  profitTarget: 8000,
  currentProfit: 5240,
  maxDailyLoss: 5000,
  currentDailyLoss: 0,
  maxTotalLoss: 10000,
  currentTotalLoss: 0,
};

const availablePrograms = [
  { id: 'tier-1', name: '50K Starter', size: '$50,000', target: '8%', maxDrawdown: '10%', dailyDrawdown: '5%', fee: '$299', color: 'from-blue-500 to-cyan-400' },
  { id: 'tier-2', name: '100K Pro', size: '$100,000', target: '8%', maxDrawdown: '10%', dailyDrawdown: '5%', fee: '$499', color: 'from-emerald-500 to-teal-400', popular: true },
  { id: 'tier-3', name: '200K Elite', size: '$200,000', target: '8%', maxDrawdown: '10%', dailyDrawdown: '5%', fee: '$999', color: 'from-amber-500 to-orange-500' },
];

export default function Challenges() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  // Helper calculations for progress bars
  const profitPct = Math.min((activeChallenge.currentProfit / activeChallenge.profitTarget) * 100, 100);
  const dailyLossPct = (activeChallenge.currentDailyLoss / activeChallenge.maxDailyLoss) * 100;
  const totalLossPct = (activeChallenge.currentTotalLoss / activeChallenge.maxTotalLoss) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-amber-500/30 relative">
      
      {/* --- PRESTIGE NEXUS BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed bg-[#020202]">
        
        {/* Massive Ambient Prestige Gradients (Indigo & Gold) */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.05, 1] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06),transparent_60%)] blur-[100px]" 
        />

        {/* Technical Crosshair Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_30%,transparent_80%)]">
          {/* Intersection crosses */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:-0.5px_-0.5px]" />
        </div>
        
        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP NAVIGATION (Fixed flex-shrink bug) --- */}
      <nav className="relative z-50 px-6 md:px-8 py-4 md:py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-[#020202]/40 min-w-max">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs shadow-lg">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">EVALUATION</span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <a href="/Dashboard" className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-[1.02] transition-transform shadow-lg shrink-0 whitespace-nowrap">
            Back to Terminal
          </a>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" /> Funded Trader Program
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Prove Your Edge.
              </h1>
            </motion.div>
          </div>

          {/* ================= ACTIVE CHALLENGE TELEMETRY (Hero Bento) ================= */}
          <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl relative overflow-hidden group">
            
            {/* Inner Glow Anchor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="p-8 md:p-12 border-b border-white/[0.05] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                    {activeChallenge.phase}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">{activeChallenge.id}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{activeChallenge.tier}</h2>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Equity</p>
                  <p className="text-3xl font-mono font-black text-white">${activeChallenge.currentBalance.toLocaleString()}</p>
                </div>
                <div className="h-12 w-px bg-white/10 hidden sm:block" />
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Days Remaining</p>
                  <p className="text-3xl font-mono font-black text-amber-500">{activeChallenge.daysLeft}</p>
                </div>
              </div>
            </div>

            {/* Telemetry Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.05] relative z-10 bg-black/[0.02]">
              
              {/* Target Profit */}
              <div className="p-8 md:p-12 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">Profit Target</h3>
                    <p className="text-xl font-mono font-bold text-emerald-500">${activeChallenge.currentProfit.toLocaleString()} <span className="text-sm text-zinc-500">/ ${activeChallenge.profitTarget.toLocaleString()}</span></p>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">{profitPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-[#111] rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${profitPct}%` }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  />
                </div>
              </div>

              {/* Daily Loss Limit */}
              <div className="p-8 md:p-12 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">Daily Loss Limit</h3>
                    <p className="text-xl font-mono font-bold text-rose-500">${activeChallenge.currentDailyLoss.toLocaleString()} <span className="text-sm text-zinc-500">/ ${activeChallenge.maxDailyLoss.toLocaleString()}</span></p>
                  </div>
                  <span className="text-sm font-bold text-rose-500">{dailyLossPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-[#111] rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${dailyLossPct}%` }} transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-3 font-medium">Resets at 00:00 UTC</p>
              </div>

              {/* Total Loss Limit */}
              <div className="p-8 md:p-12 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">Max Drawdown</h3>
                    <p className="text-xl font-mono font-bold text-rose-500">${activeChallenge.currentTotalLoss.toLocaleString()} <span className="text-sm text-zinc-500">/ ${activeChallenge.maxTotalLoss.toLocaleString()}</span></p>
                  </div>
                  <span className="text-sm font-bold text-rose-500">{totalLossPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-[#111] rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${totalLossPct}%` }} transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                    className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-3 font-medium">Trailing from highest watermark</p>
              </div>

            </div>
          </motion.div>

          {/* ================= AVAILABLE PROGRAMS (Store Grid) ================= */}
          <div>
            <div className="flex items-center gap-4 mb-8 pt-8">
              <h3 className="text-2xl font-black tracking-tight">Available Programs</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePrograms.map((program, idx) => (
                <motion.div 
                  key={program.id}
                  variants={item}
                  className={`bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border rounded-[32px] p-8 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 ${program.popular ? 'border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'border-black/5 dark:border-white/[0.08] shadow-xl'}`}
                >
                  {/* Subtle Background Gradient for Card */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${program.color} transition-opacity duration-500`} />
                  
                  {program.popular && (
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}

                  <h4 className="text-3xl font-black tracking-tighter mb-1">{program.size}</h4>
                  <p className="text-sm font-bold text-zinc-500 mb-8">{program.name}</p>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
                      <span className="text-sm text-zinc-400 font-medium">Profit Target</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{program.target}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
                      <span className="text-sm text-zinc-400 font-medium">Max Daily Loss</span>
                      <span className="text-sm font-bold font-mono text-rose-400">{program.dailyDrawdown}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
                      <span className="text-sm text-zinc-400 font-medium">Max Drawdown</span>
                      <span className="text-sm font-bold font-mono text-rose-400">{program.maxDrawdown}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-medium">Minimum Days</span>
                      <span className="text-sm font-bold font-mono text-white">0 Days</span>
                    </div>
                  </div>

                  <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${program.popular ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white text-black hover:bg-zinc-200'}`}>
                    Start Challenge · {program.fee}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}