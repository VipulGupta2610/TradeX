import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Explorer Data ---
const macroMetrics = [
  { label: 'Global Volume (24h)', value: '$1.42T', trend: '+5.2%', isUp: true },
  { label: 'Market Sentiment', value: 'Greed', index: 72, color: 'text-emerald-500' },
  { label: 'Volatility Index (VIX)', value: '14.20', trend: '-2.1%', isUp: false },
];

const sectorFlows = [
  { name: 'Technology', flow: '+$4.2B', perf: '+2.4%', width: '85%', isUp: true },
  { name: 'Cryptocurrency', flow: '+$1.8B', perf: '+5.8%', width: '60%', isUp: true },
  { name: 'Financials', flow: '+$850M', perf: '+0.4%', width: '40%', isUp: true },
  { name: 'Energy', flow: '-$1.2B', perf: '-1.8%', width: '50%', isUp: false },
  { name: 'Consumer Discretionary', flow: '-$420M', perf: '-0.5%', width: '25%', isUp: false },
];

const heatmapAssets = [
  { ticker: 'BTC', name: 'Bitcoin', perf: '+4.2%', isUp: true, size: 'col-span-2 row-span-2', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
  { ticker: 'NVDA', name: 'NVIDIA', perf: '+6.8%', isUp: true, size: 'col-span-2 row-span-2', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
  { ticker: 'TSLA', name: 'Tesla', perf: '-3.4%', isUp: false, size: 'col-span-1 row-span-2', color: 'bg-rose-500/20 border-rose-500/30 text-rose-400' },
  { ticker: 'ETH', name: 'Ethereum', perf: '+2.1%', isUp: true, size: 'col-span-1 row-span-1', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
  { ticker: 'AAPL', name: 'Apple', perf: '-0.8%', isUp: false, size: 'col-span-1 row-span-1', color: 'bg-rose-500/10 border-rose-500/20 text-rose-500' },
  { ticker: 'SOL', name: 'Solana', perf: '+8.4%', isUp: true, size: 'col-span-1 row-span-1', color: 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300' },
];

export default function MarketExplorer() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-purple-500/30 relative">
      
      {/* --- QUANTUM TOPOGRAPHY BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed bg-[#020202]">
        
        {/* Massive Ambient Gradients (Violet & Teal) */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_60%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_60%)] blur-[100px]" 
        />

        {/* CSS Topography / Contour Map Overlay */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 100 200 Q 150 100 200 200 T 300 200' fill='none' stroke='white' stroke-width='1'/%3E%3Cpath d='M 50 250 Q 150 150 250 250 T 350 250' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M 150 300 Q 200 200 300 300 T 400 300' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`, 
          backgroundSize: '400px 400px' 
        }} />

        {/* Technical Radar Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_20%,transparent_80%)]" />
        
        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-[#020202]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs shadow-lg">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">EXPLORER</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <a href="/Dashboard" className="px-6 py-2.5 rounded-full bg-purple-500 text-white font-bold text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            Execution Terminal
          </a>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* HEADER & MACRO METRICS */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-4">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" /> Live Market Scanners
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Discover Alpha.
              </h1>
            </motion.div>

            {/* Macro Metrics Bento */}
            <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
              {macroMetrics.map((metric, i) => (
                <div key={i} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[180px] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{metric.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-2xl font-mono font-black ${metric.color || 'text-white'}`}>{metric.value}</p>
                    {metric.trend && (
                      <span className={`text-xs font-bold mb-1 ${metric.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {metric.trend}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* --- LEFT: MARKET HEATMAP (Spans 8 cols) --- */}
            <motion.div variants={item} className="xl:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[500px]">
                <div className="px-8 py-6 border-b border-white/[0.05] flex justify-between items-center bg-black/[0.02]">
                  <h3 className="font-bold tracking-tight text-lg">Top Volume Heatmap</h3>
                  <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05]">
                    {['S&P 500', 'Crypto', 'Forex'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CSS Grid Treemap Simulation */}
                <div className="p-6 flex-1">
                  <div className="grid grid-cols-4 grid-rows-3 gap-3 w-full h-full min-h-[400px]">
                    {heatmapAssets.map((asset, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${asset.size} ${asset.color} border rounded-2xl p-4 flex flex-col justify-between hover:brightness-125 transition-all cursor-pointer shadow-lg`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-black text-xl tracking-tight">{asset.ticker}</span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <div>
                          <p className="text-xs opacity-80 font-medium mb-1">{asset.name}</p>
                          <p className="font-mono font-bold text-lg">{asset.perf}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>

            {/* --- RIGHT: SECTOR FLOWS & TRENDING (Spans 4 cols) --- */}
            <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-6">
              
              {/* Sector Money Flow */}
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500" />
                
                <h3 className="font-bold tracking-tight text-lg mb-8">Sector Capital Flow</h3>
                
                <div className="space-y-6">
                  {sectorFlows.map((sector, idx) => (
                    <div key={idx} className="group/bar">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-zinc-300">{sector.name}</span>
                        <div className="text-right">
                          <p className="font-mono text-xs font-bold text-white">{sector.flow}</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-black/10 dark:bg-[#111] rounded-full overflow-hidden border border-white/5 relative">
                        {/* Center Zero Line for Visual Reference */}
                        <div className="absolute top-0 bottom-0 left-[20%] w-px bg-white/20 z-10" />
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: sector.width }} 
                          transition={{ duration: 1.5, delay: 0.2 + (idx * 0.1), ease: "easeOut" }} 
                          className={`h-full rounded-full ${sector.isUp ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} 
                          style={{ marginLeft: sector.isUp ? '20%' : '0' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Now List */}
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 shadow-xl flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold tracking-tight text-lg">Trending Now</h3>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Live
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                  {[
                    { ticker: 'WIF', name: 'Dogwifhat', vol: '$2.1B Vol', up: true, change: '+18.4%' },
                    { ticker: 'SMCI', name: 'Super Micro', vol: '$4.8B Vol', up: true, change: '+12.1%' },
                    { ticker: 'ARM', name: 'Arm Holdings', vol: '$1.2B Vol', up: false, change: '-4.2%' },
                    { ticker: 'RNDR', name: 'Render', vol: '$850M Vol', up: true, change: '+8.7%' },
                  ].map((asset, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-black/20 dark:bg-[#050505] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group/card">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs">
                          {asset.ticker[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover/card:text-purple-400 transition-colors">{asset.ticker}</p>
                          <p className="text-[10px] text-zinc-500">{asset.vol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-bold ${asset.up ? 'text-emerald-500' : 'text-rose-500'}`}>{asset.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors">
                  View Full Screener
                </button>
              </div>

            </motion.div>
          </div>
          
        </motion.div>
      </main>
    </div>
  );
}