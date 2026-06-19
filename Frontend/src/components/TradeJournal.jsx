import React, { useState, useEffect, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Sidebar from '../assets/Sidebar';
import { api } from '../api/axios';
import { useSelector } from 'react-redux';

// --- Helper Functions for Dynamic Math ---
const calculateStats = (trades) => {
  if (!trades || trades.length === 0) return { winRate: "0%", profitFactor: "0.00", bestSetup: "N/A" };

  const winningTrades = trades.filter(t => t.realizedPnl > 0);
  const losingTrades = trades.filter(t => t.realizedPnl <= 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.realizedPnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.realizedPnl, 0));

  const winRate = (winningTrades.length / trades.length) * 100;
  const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);

  // Find most frequent setup among winners
  const setupCounts = winningTrades.reduce((acc, t) => {
    if (t.setupName) acc[t.setupName] = (acc[t.setupName] || 0) + 1;
    return acc;
  }, {});
  const bestSetup = Object.keys(setupCounts).sort((a, b) => setupCounts[b] - setupCounts[a])[0] || "N/A";

  return {
    totalTrades: trades.length,
    winRate: `${winRate.toFixed(1)}%`,
    profitFactor: profitFactor.toFixed(2),
    bestSetup
  };
};

const generateHeatmap = (trades) => {
  // Create an array of 90 items representing the last 90 days.
  // In a production app, you'd map actual dates to these squares.
  // For now, we are mapping the last 90 trades' PnL status directly.
  const last90Trades = trades.slice(0, 90);
  const heatmap = Array.from({ length: 90 }, () => 'empty'); // Default state

  last90Trades.forEach((trade, i) => {
    if (trade.realizedPnl > 500) heatmap[i] = 'win-high';
    else if (trade.realizedPnl > 0) heatmap[i] = 'win-low';
    else if (trade.realizedPnl > -200) heatmap[i] = 'loss-low';
    else heatmap[i] = 'loss-high';
  });

  return heatmap;
};

export default function TradeJournal() { // Pass userId from Auth context
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

const userid = useSelector((state)=>state?.auth?.user?._id)
console.log(userid)

  // --- 1. Fetch Data from Backend ---
 // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await api.get(`/user/TradeJournal/${userid}`);
        
        // FIX: Axios automatically parses JSON. The data is in response.data
        const data = response.data; 
        
        setJournalEntries(data);
        if (data.length > 0) setSelectedEntry(data[0]);
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userid) { // Good practice: Ensure userid exists before fetching
        fetchTrades();
    }
  }, [userid]); // Add userid to dependency array

  // --- 2. Dynamic Memoized Calculations ---
  const journalStats = useMemo(() => calculateStats(journalEntries), [journalEntries]);
  const heatmapData = useMemo(() => generateHeatmap(journalEntries), [journalEntries]);

  // --- 3. Database Update Functions ---
  const saveEntryToDB = async (updatedEntry) => {
    try {
      await fetch(`/api/trades/${updatedEntry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesisNotes: updatedEntry.thesisNotes,
          mistakesNotes: updatedEntry.mistakesNotes,
          tags: updatedEntry.tags,
          setupName: updatedEntry.setupName
        })
      });
      
      // Update local state to reflect DB changes without full reload
      setJournalEntries(prev => prev.map(entry => entry._id === updatedEntry._id ? updatedEntry : entry));
      setSelectedEntry(updatedEntry);
    } catch (error) {
      console.error("Failed to update journal:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const editNotes = () => {
    const newNotes = window.prompt('Update Trade Thesis & Notes', selectedEntry.thesisNotes);
    if (newNotes == null) return;
    saveEntryToDB({ ...selectedEntry, thesisNotes: newNotes });
  };

  const editMistakes = () => {
    const newMistakes = window.prompt('Update Mistakes & Friction Points', selectedEntry.mistakesNotes);
    if (newMistakes == null) return;
    saveEntryToDB({ ...selectedEntry, mistakesNotes: newMistakes });
  };

  const addTag = () => {
    const tag = window.prompt('Tag name');
    if (!tag) return;
    const updatedTags = [...new Set([...(selectedEntry.tags || []), tag])];
    saveEntryToDB({ ...selectedEntry, tags: updatedTags });
  };

  // Framer Motion Variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white">Loading Edge Data...</div>;

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* ── GLOBAL STYLE INJECTION TO HIDE SCROLLBARS ── */}
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
          }
        `}
      </style>
      <Sidebar />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* --- AURORA BACKGROUND (Unchanged) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ x: [-50, 50, -50], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-30%] left-[10%] w-[70vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)] blur-[120px]" />
          <motion.div animate={{ x: [50, -50, 50], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] right-[10%] w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_70%)] blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_20%,transparent_80%)]" />
        </div>

        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          
          <div className="flex justify-end items-center gap-4 mb-8">
            <ThemeToggle />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            
            {/* HEADER & HIGH LEVEL STATS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-4">
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Trading Psychology
                </h2>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Document Your Edge.</h1>
              </motion.div>

              <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[140px] shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Win Rate</p>
                  <p className="text-2xl font-mono font-black text-blue-500">{journalStats.winRate}</p>
                </div>
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[140px] shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Profit Factor</p>
                  <p className="text-2xl font-mono font-black text-black dark:text-white">{journalStats.profitFactor}</p>
                </div>
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-5 min-w-[180px] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best Setup</p>
                  <p className="text-lg font-bold text-black dark:text-white">{journalStats.bestSetup}</p>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* --- LEFT SIDEBAR: PNL HEATMAP & ENTRY LIST --- */}
              <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-6">
                
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold tracking-tight">Consistency Heatmap</h3>
                    <span className="text-xs text-zinc-500 font-medium">Last 90 Trades</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {heatmapData.map((status, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.005 }}
                        className={`w-3.5 h-3.5 rounded-[3px] ${
                          status === 'win-high' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                          status === 'win-low' ? 'bg-emerald-500/40' :
                          status === 'loss-low' ? 'bg-rose-500/40' :
                          status === 'empty' ? 'bg-black/5 dark:bg-white/5' :
                          'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-4 shadow-xl flex-1 flex flex-col min-h-[400px]">
                  <div className="px-2 pb-4 mb-2 border-b border-black/5 dark:border-white/[0.05] flex justify-between items-center">
                    <h3 className="font-bold tracking-tight">Recent Logs</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {journalEntries.map(entry => (
                      <div 
                        key={entry._id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                          selectedEntry?._id === entry._id 
                            ? 'bg-black/5 dark:bg-white/10 dark:border-white/10 shadow-lg' 
                            : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${entry.realizedPnl > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="font-bold text-sm">{entry.symbol}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(entry.closedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex gap-1.5 flex-wrap">
                            {(entry.tags || []).slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 dark:bg-[#000] text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className={`font-mono font-bold text-sm ${entry.realizedPnl > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {entry.realizedPnl > 0 ? '+' : ''}${entry.realizedPnl.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>

              {/* --- RIGHT SIDEBAR: DETAILED ENTRY VIEW --- */}
              {selectedEntry && (
                <motion.div variants={item} className="xl:col-span-8 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
                  
                  <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/[0.05] relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${selectedEntry.realizedPnl > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                            {selectedEntry.realizedPnl > 0 ? 'WINNER' : 'LOSS'}
                          </span>
                          <span className="text-zinc-500 text-xs font-mono">{selectedEntry._id.slice(-6).toUpperCase()} · {new Date(selectedEntry.closedAt).toLocaleString()}</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">{selectedEntry.symbol}</h2>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Realized PnL</p>
                        <p className={`text-4xl font-mono font-black ${selectedEntry.realizedPnl > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {selectedEntry.realizedPnl > 0 ? '+' : ''}${selectedEntry.realizedPnl.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedEntry.setupName && (
                        <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
                          {selectedEntry.setupName}
                        </span>
                      )}
                      {(selectedEntry.tags || []).map(tag => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-[#000] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                      <button onClick={addTag} className="px-3 py-1.5 rounded-lg border border-dashed border-black/20 dark:border-white/20 text-zinc-500 text-xs font-bold hover:text-black dark:hover:text-white hover:border-black/50 dark:hover:border-white/50 transition-colors">
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-8 md:p-10 overflow-y-auto relative z-10 bg-black/[0.02]">
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Trade Thesis & Notes</h3>
                          <button onClick={editNotes} className="text-xs text-blue-500 font-bold hover:underline">Edit</button>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                          {selectedEntry.thesisNotes || "No thesis documented yet. Click edit to add."}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Mistakes & Friction Points</h3>
                          <button onClick={editMistakes} className="text-xs text-rose-500 font-bold hover:underline">Edit</button>
                        </div>
                        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                          <p className="text-rose-600 dark:text-rose-200/80 leading-relaxed font-medium">
                            {selectedEntry.mistakesNotes || "No mistakes documented. Good job!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}