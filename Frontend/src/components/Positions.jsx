import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

export default function Positions() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const user = useSelector(state => state.auth.user);
  const { positions: accountPositions, metrics, closePosition } = useTradingAccount(user?._id);
  
  const positions = accountPositions.map(position => ({
    id: position.id || position.sym,
    market: position.sym,
    type: position.type,
    side: 'LONG',
    leverage: '1x',
    size: `${position.qty} units`,
    notional: `₹${position.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    entry: `₹${position.avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    mark: `₹${position.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    liqPrice: 'N/A',
    pnl: `${position.pnl >= 0 ? '+' : '-'}₹${Math.abs(position.pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    pnlPct: `${position.pnlPct >= 0 ? '+' : ''}${position.pnlPct.toFixed(2)}%`,
    isProfitable: position.pnl >= 0,
    source: position
  }));

  const marginMetrics = {
    totalEquity: `₹${metrics.totalEquity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    unrealizedPnL: `${metrics.unrealizedPnl >= 0 ? '+' : '-'}₹${Math.abs(metrics.unrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    availableMargin: `₹${(metrics.totalEquity - metrics.invested).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    maintenanceMargin: `₹${(metrics.invested * 0.1).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  };

  const filteredPositions = activeFilter === 'All' 
    ? positions 
    : positions.filter(pos => pos.type === activeFilter);
  const searchedPositions = filteredPositions.filter(pos => pos.market.toLowerCase().includes(search.toLowerCase()));

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    // FIXED: flex-col md:flex-row and h-[100dvh] for mobile viewport safety
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#FAFAFA] dark:bg-[#000000] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* ── GLOBAL STYLE INJECTION TO HIDE SCROLLBARS ── */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
          }
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
          }
        `}
      </style>
      
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      {/* FIXED: added w-full min-w-0 to prevent flex blowout */}
      <div className="flex-1 w-full min-w-0 relative overflow-y-auto overflow-x-hidden">
        
        {/* Structural Background (contained within wrapper) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] md:w-[600px] md:h-[600px] bg-rose-500/5 dark:bg-rose-900/10 rounded-full blur-[150px]" />
          {/* Subtle dot matrix grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        {/* FIXED: Scaled down padding for mobile */}
        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-10">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 w-full">
            
            {/* HEADER METRICS */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2 md:mb-4">
              <div>
                {/* FIXED: Scaled text down for mobile */}
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">Open Positions</h1>
                <div className="flex items-center gap-2 md:gap-3">
                  <p className="text-zinc-500 font-medium tracking-wide text-sm md:text-base">Unrealized PnL:</p>
                  <span className="text-lg md:text-xl font-black text-emerald-500 bg-emerald-500/10 px-2 md:px-3 py-0.5 rounded-md border border-emerald-500/20">{marginMetrics.unrealizedPnL}</span>
                </div>
              </div>
              
              {/* FIXED: Made buttons wrap nicely on small screens */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button onClick={async () => { for (const position of accountPositions) await closePosition(position); }} className="flex-1 md:flex-none justify-center px-4 md:px-6 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs md:text-sm font-bold hover:bg-rose-500/20 transition-colors">
                  Close All
                </button>
                <Link to={user?._id ? `/Portfolio/${user._id}` : '/Login'} className="flex-1 md:flex-none text-center px-4 md:px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs md:text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Manage Margin
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full">
              
              {/* ================= LEFT COLUMN: POSITIONS TABLE ================= */}
              {/* FIXED: Added w-full min-w-0 constraint */}
              <motion.div variants={item} className="xl:col-span-3 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] shadow-sm overflow-hidden flex flex-col w-full min-w-0">
                
                {/* FIXED: Scaled padding and made flex wrap properly */}
                <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* FIXED: Scrollable horizontal filters */}
                  <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Crypto', 'Stocks', 'Forex'].map(filter => (
                      <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeFilter === filter ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full lg:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input value={search} onChange={event => setSearch(event.target.value)} type="text" placeholder="Filter positions..." className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" />
                  </div>
                </div>

                {/* FIXED: Added w-full and no-scrollbar here */}
                <div className="overflow-x-auto w-full no-scrollbar flex-1">
                  <table className="w-full text-left border-collapse min-w-[900px] md:min-w-[1000px]">
                    <thead>
                      <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-black/[0.02] dark:bg-white/[0.02]">
                        <th className="py-4 px-4 md:px-6 font-medium">Market</th>
                        <th className="py-4 px-4 font-medium text-right">Size / Notional</th>
                        <th className="py-4 px-4 font-medium text-right">Entry Price</th>
                        <th className="py-4 px-4 font-medium text-right">Mark Price</th>
                        <th className="py-4 px-4 font-medium text-right">Liq. Price</th>
                        <th className="py-4 px-4 md:px-6 font-medium text-right">Unrealized PnL</th>
                        <th className="py-4 px-4 md:px-6 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <AnimatePresence mode="popLayout">
                        {searchedPositions.map((pos) => (
                          <motion.tr 
                            key={pos.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* Market Details */}
                            <td className="py-4 md:py-5 px-4 md:px-6">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className={`w-1 h-10 rounded-full ${pos.side === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm md:text-base">{pos.market}</span>
                                    <span className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">{pos.leverage}</span>
                                  </div>
                                  <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-sm ${pos.side === 'LONG' ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'}`}>
                                    {pos.side}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Size & Notional */}
                            <td className="py-4 md:py-5 px-4 text-right">
                              <p className="font-bold font-mono text-xs md:text-sm">{pos.size}</p>
                              <p className="text-[10px] md:text-xs text-zinc-500 font-mono mt-0.5">{pos.notional}</p>
                            </td>

                            <td className="py-4 md:py-5 px-4 text-right font-mono text-xs md:text-sm text-zinc-600 dark:text-zinc-400">{pos.entry}</td>
                            <td className="py-4 md:py-5 px-4 text-right font-mono text-xs md:text-sm font-medium">{pos.mark}</td>
                            <td className="py-4 md:py-5 px-4 text-right font-mono text-xs md:text-sm text-orange-500/80">{pos.liqPrice}</td>

                            {/* PnL */}
                            <td className="py-4 md:py-5 px-4 md:px-6 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`font-bold font-mono text-sm md:text-base ${pos.isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {pos.pnl}
                                </span>
                                <span className="text-[10px] md:text-xs font-medium text-zinc-500 mt-0.5">{pos.pnlPct} (ROE)</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 md:py-5 px-4 md:px-6 text-center">
                              <button onClick={() => closePosition(pos.source)} className="px-3 md:px-4 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-[10px] md:text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                Close
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* ================= RIGHT COLUMN: MARGIN & RISK ================= */}
              {/* FIXED: Added w-full min-w-0 */}
              <motion.div variants={item} className="xl:col-span-1 space-y-6 flex flex-col w-full min-w-0">
                
                {/* Margin Overview Card */}
                {/* FIXED: Scaled padding */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                  
                  <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 md:mb-6">Account Margin</h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-medium text-zinc-500">Total Equity</span>
                      <span className="font-mono font-bold text-sm md:text-base">{marginMetrics.totalEquity}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-medium text-zinc-500">Available Margin</span>
                      <span className="font-mono font-bold text-sm md:text-base text-emerald-500">{marginMetrics.availableMargin}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-medium text-zinc-500">Maintenance Margin</span>
                      <span className="font-mono font-bold text-sm md:text-base text-orange-500">{marginMetrics.maintenanceMargin}</span>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8">
                    <div className="flex justify-between text-[10px] md:text-xs font-bold mb-2">
                      <span>Margin Ratio</span>
                      <span className="text-emerald-500">Safe (31.6%)</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-2 md:h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex">
                      <motion.div initial={{ width: 0 }} animate={{ width: '31.6%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-emerald-500 rounded-l-full" />
                      <div className="h-full w-[2px] bg-[#0A0A0A] z-10" />
                      <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-orange-500" />
                    </div>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 mt-2 text-right">Liquidation at 100%</p>
                  </div>
                </div>

                {/* Risk Profile Visualization */}
                {/* FIXED: Scaled padding */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-sm flex-1 flex flex-col">
                  <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Risk Profile</h3>
                  
                  {/* Abstract Data Visualization */}
                  <div className="flex-1 w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl relative overflow-hidden min-h-[150px] flex items-center justify-center">
                    
                    {/* Concentric Risk Rings */}
                    <div className="absolute w-32 h-32 md:w-40 md:h-40 border border-white/5 rounded-full" />
                    <div className="absolute w-20 h-20 md:w-24 md:h-24 border border-white/10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-black text-emerald-400">LOW</p>
                        <p className="text-[7px] md:text-[8px] tracking-widest uppercase text-zinc-500">Exposure</p>
                      </div>
                    </div>
                    
                    {/* Animated Orbiting Dots representing positions */}
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-transparent">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full absolute top-[-5px] md:top-[-6px] left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </motion.div>
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border border-transparent">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-400 rounded-full absolute bottom-[-3px] md:bottom-[-4px] left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
                    </motion.div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2 md:p-3 text-center">
                      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Long Exp.</p>
                      <p className="font-mono font-bold text-xs md:text-sm text-emerald-500">82.5%</p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2 md:p-3 text-center">
                      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Short Exp.</p>
                      <p className="font-mono font-bold text-xs md:text-sm text-rose-500">17.5%</p>
                    </div>
                  </div>
                </div>

              </motion.div>

            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}