import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Journal Data ---
const journalStats = {
  totalTrades: 142,
  winRate: "68.5%",
  profitFactor: "2.14",
  bestSetup: "Breakout Pullback",
  worstEmotion: "FOMO"
};

const entries = [
  { 
    id: 'JRN-104', 
    date: 'Oct 24, 2026', 
    time: '14:30', 
    market: 'BTC-PERP', 
    direction: 'LONG', 
    pnl: '+$1,450.00', 
    isWin: true,
    setup: 'A+ Setup',
    tags: ['Followed Plan', 'Patience', 'High Volume'],
    notes: 'Waited for the 15m candle to close above the key resistance at 63.5k. Volume confirmed the breakout. Entered on the first pullback to the EMA. Held through initial chop, took 50% off at 2R, trailed the rest.',
    mistakes: 'None. Perfect execution.'
  },
  { 
    id: 'JRN-103', 
    date: 'Oct 23, 2026', 
    time: '09:15', 
    market: 'NVDA', 
    direction: 'LONG', 
    pnl: '-$420.00', 
    isWin: false,
    setup: 'C Setup',
    tags: ['FOMO', 'Revenge Trade', 'Overleveraged'],
    notes: 'Saw the pre-market gap up and immediately bought the open without waiting for a setup. Price immediately reversed. I moved my stop loss down twice before finally taking the hit.',
    mistakes: 'Broke risk management rules. Let emotions dictate the entry.'
  },
  { 
    id: 'JRN-102', 
    date: 'Oct 22, 2026', 
    time: '11:45', 
    market: 'ETH-PERP', 
    direction: 'SHORT', 
    pnl: '+$840.50', 
    isWin: true,
    setup: 'B Setup',
    tags: ['Trend Following', 'Early Exit'],
    notes: 'Caught the rejection at the daily supply zone. Entry was good, but I got nervous during a minor 1m pullback and closed the position early. It went on to hit my original target 20 minutes later.',
    mistakes: 'Cut winners too early. Need to trust the higher timeframe trend.'
  }
];

// Generate fake heatmap data (last 90 days)
const generateHeatmap = () => {
  return Array.from({ length: 90 }, (_, i) => {
    const val = Math.random();
    if (val > 0.8) return 'win-high';
    if (val > 0.4) return 'win-low';
    if (val > 0.2) return 'loss-low';
    return 'loss-high';
  });
};

export default function TradeJournal() {
  const [isDark, setIsDark] = useState(true);
  const [journalEntries, setJournalEntries] = useState(() => {
    const stored = localStorage.getItem('tradex_journal');
    return stored ? JSON.parse(stored) : entries;
  });
  const [selectedEntry, setSelectedEntry] = useState(journalEntries[0]);
  const heatmapData = React.useMemo(() => generateHeatmap(), []);
  const saveEntries = next => {
    setJournalEntries(next);
    localStorage.setItem('tradex_journal', JSON.stringify(next));
  };
  const createEntry = () => {
    const market = window.prompt('Market symbol');
    if (!market) return;
    const notes = window.prompt('Trade notes') || '';
    const entry = {
      id: `JRN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      market: market.toUpperCase(),
      direction: 'LONG',
      pnl: '₹0.00',
      isWin: true,
      setup: 'New Setup',
      tags: ['New'],
      notes,
      mistakes: 'Review after trade.'
    };
    saveEntries([entry, ...journalEntries]);
    setSelectedEntry(entry);
  };
  const editEntry = () => {
    const notes = window.prompt('Update notes', selectedEntry.notes);
    if (notes == null) return;
    const updated = { ...selectedEntry, notes };
    saveEntries(journalEntries.map(entry => entry.id === updated.id ? updated : entry));
    setSelectedEntry(updated);
  };
  const addTag = () => {
    const tag = window.prompt('Tag name');
    if (!tag) return;
    const updated = { ...selectedEntry, tags: [...new Set([...selectedEntry.tags, tag])] };
    saveEntries(journalEntries.map(entry => entry.id === updated.id ? updated : entry));
    setSelectedEntry(updated);
  };

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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 relative">
      
      {/* --- NEW: AURORA SPOTLIGHT BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed bg-[#020202]">
        
        {/* Massive Top Aurora Gradients */}
        <motion.div 
          animate={{ x: [-50, 50, -50], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-30%] left-[10%] w-[70vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [50, -50, 50], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[10%] w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_70%)] blur-[120px]" 
        />
        <div className="absolute bottom-[-20%] left-[30%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(168,85,247,0.03),transparent_60%)] blur-[100px]" />

        {/* Structural Spotlight Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_20%,transparent_80%)]" />
        
        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-[#020202]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs shadow-lg">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">JOURNAL</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <button onClick={createEntry} className="px-6 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            + New Entry
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* HEADER & HIGH LEVEL STATS */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-4">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Trading Psychology
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Document Your Edge.</h1>
            </motion.div>

            {/* Quick Stats Bento */}
            <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[140px] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-2xl font-mono font-black text-blue-500">{journalStats.winRate}</p>
              </div>
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[140px] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Profit Factor</p>
                <p className="text-2xl font-mono font-black text-white">{journalStats.profitFactor}</p>
              </div>
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-5 min-w-[180px] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best Setup</p>
                <p className="text-lg font-bold text-white">{journalStats.bestSetup}</p>
              </div>
            </motion.div>
          </div>

          {/* MAIN JOURNAL BENTO GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* --- LEFT SIDEBAR: PNL HEATMAP & ENTRY LIST (Spans 4 cols) --- */}
            <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-6">
              
              {/* Heatmap Card */}
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold tracking-tight">Consistency Heatmap</h3>
                  <span className="text-xs text-zinc-500 font-medium">Last 90 Days</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {heatmapData.map((status, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.005 }}
                      className={`w-3.5 h-3.5 rounded-[3px] ${
                        status === 'win-high' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                        status === 'win-low' ? 'bg-emerald-500/40' :
                        status === 'loss-low' ? 'bg-rose-500/40' :
                        'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Entries List */}
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-4 shadow-xl flex-1 flex flex-col min-h-[400px]">
                <div className="px-2 pb-4 mb-2 border-b border-white/[0.05] flex justify-between items-center">
                  <h3 className="font-bold tracking-tight">Recent Logs</h3>
                  <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {journalEntries.map(entry => (
                    <div 
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        selectedEntry.id === entry.id 
                          ? 'bg-white/10 dark:bg-white/[0.08] border-white/10 shadow-lg' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${entry.isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-bold text-sm">{entry.market}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">{entry.date}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex gap-1.5 flex-wrap">
                          {entry.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/20 dark:bg-[#000] text-zinc-400 border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={`font-mono font-bold text-sm ${entry.isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {entry.pnl}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>

            {/* --- RIGHT SIDEBAR: DETAILED ENTRY VIEW (Spans 8 cols) --- */}
            <motion.div variants={item} className="xl:col-span-8 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
              
              {/* Top Header of the Detail View */}
              <div className="p-8 md:p-10 border-b border-white/[0.05] relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${selectedEntry.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                        {selectedEntry.direction}
                      </span>
                      <span className="text-zinc-500 text-xs font-mono">{selectedEntry.id} · {selectedEntry.date} {selectedEntry.time}</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">{selectedEntry.market}</h2>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Realized PnL</p>
                    <p className={`text-4xl font-mono font-black ${selectedEntry.isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {selectedEntry.pnl}
                    </p>
                  </div>
                </div>

                {/* Tags Area */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                    {selectedEntry.setup}
                  </span>
                  {selectedEntry.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-black/20 dark:bg-[#000] text-zinc-300 border border-white/5 text-xs font-bold">
                      {tag}
                    </span>
                  ))}
                  <button onClick={addTag} className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-zinc-500 text-xs font-bold hover:text-white hover:border-white/50 transition-colors">
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Main Text Content Area */}
              <div className="flex-1 p-8 md:p-10 overflow-y-auto relative z-10 bg-black/[0.02]">
                
                {/* Visual Placeholder for TradingView Snapshot */}
                <div className="w-full h-64 bg-[#050505] rounded-2xl border border-white/5 mb-10 relative overflow-hidden group cursor-pointer flex items-center justify-center">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  {/* Mock Candlestick SVG */}
                  <svg className="w-32 h-32 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l5-5 5 5M7 12l5 5 5-5" /></svg>
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-sm font-bold tracking-widest uppercase">View Attached Chart</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Trade Thesis & Notes</h3>
                    <p className="text-zinc-300 leading-relaxed font-medium">
                      {selectedEntry.notes}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-3">Mistakes & Friction Points</h3>
                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                      <p className="text-rose-200/80 leading-relaxed font-medium">
                        {selectedEntry.mistakes}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-white/[0.05] bg-black/[0.05] flex justify-between items-center z-10 relative">
                <p className="text-xs text-zinc-500">Last edited: Today, 15:42</p>
                <div className="flex gap-3">
                  <button onClick={() => navigator.clipboard.writeText(`${selectedEntry.market}\n${selectedEntry.notes}`)} className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors">
                    Share
                  </button>
                  <button onClick={editEntry} className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg">
                    Edit Journal
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
          
        </motion.div>
      </main>
    </div>
  );
}
