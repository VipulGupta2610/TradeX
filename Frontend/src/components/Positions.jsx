import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';

// --- Mock Derivatives Data ---
const positions = [
  { id: 1, market: 'BTC-PERP', type: 'Crypto', side: 'LONG', leverage: '20x', size: '2.5 BTC', notional: '$160,575.00', entry: '$63,210.50', mark: '$64,230.00', liqPrice: '$60,100.00', pnl: '+$2,548.75', pnlPct: '+40.32%', isProfitable: true },
  { id: 2, market: 'ETH-PERP', type: 'Crypto', side: 'SHORT', leverage: '10x', size: '50.0 ETH', notional: '$172,540.00', entry: '$3,550.00', mark: '$3,450.80', liqPrice: '$3,800.00', pnl: '+$4,960.00', pnlPct: '+27.94%', isProfitable: true },
  { id: 3, market: 'NVDA-FUT', type: 'Stocks', side: 'LONG', leverage: '5x', size: '100 Shares', notional: '$87,520.00', entry: '$890.00', mark: '$875.20', liqPrice: '$715.00', pnl: '-$1,480.00', pnlPct: '-8.31%', isProfitable: false },
  { id: 4, market: 'SOL-PERP', type: 'Crypto', side: 'LONG', leverage: '15x', size: '250 SOL', notional: '$36,300.00', entry: '$140.00', mark: '$145.20', liqPrice: '$132.50', pnl: '+$1,300.00', pnlPct: '+55.71%', isProfitable: true },
];

const marginMetrics = {
  totalEquity: "$142,850.00",
  unrealizedPnL: "+$7,328.75",
  marginUsed: "$45,210.00",
  availableMargin: "$97,640.00",
  marginLevel: "315%",
  maintenanceMargin: "$22,605.00",
};

export default function Positions() {
  const [isDark, setIsDark] = useState(true);
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

  // Toggle Tailwind Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#000000] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Structural Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-900/10 rounded-full blur-[150px]" />
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/50 dark:bg-black/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">POSITIONS</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link to={user?._id ? `/Dashboard/${user._id}` : '/Login'} className="px-5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-8 py-10 overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          
          {/* HEADER METRICS */}
          <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Open Positions</h1>
              <div className="flex items-center gap-3">
                <p className="text-zinc-500 font-medium tracking-wide">Unrealized PnL:</p>
                <span className="text-xl font-black text-emerald-500 bg-emerald-500/10 px-3 py-0.5 rounded-md border border-emerald-500/20">{marginMetrics.unrealizedPnL}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={async () => { for (const position of accountPositions) await closePosition(position); }} className="px-6 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors">
                Close All
              </button>
              <button className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Manage Margin
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* ================= LEFT COLUMN: POSITIONS TABLE ================= */}
            <motion.div variants={item} className="xl:col-span-3 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
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
                <div className="relative w-full sm:w-64">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input value={search} onChange={event => setSearch(event.target.value)} type="text" placeholder="Filter positions..." className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-black/[0.02] dark:bg-white/[0.02]">
                      <th className="py-4 px-6 font-medium">Market</th>
                      <th className="py-4 px-4 font-medium text-right">Size / Notional</th>
                      <th className="py-4 px-4 font-medium text-right">Entry Price</th>
                      <th className="py-4 px-4 font-medium text-right">Mark Price</th>
                      <th className="py-4 px-4 font-medium text-right">Liq. Price</th>
                      <th className="py-4 px-6 font-medium text-right">Unrealized PnL</th>
                      <th className="py-4 px-6 font-medium text-center">Action</th>
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
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-1 h-10 rounded-full ${pos.side === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-base">{pos.market}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">{pos.leverage}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${pos.side === 'LONG' ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'}`}>
                                  {pos.side}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Size & Notional */}
                          <td className="py-5 px-4 text-right">
                            <p className="font-bold font-mono text-sm">{pos.size}</p>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">{pos.notional}</p>
                          </td>

                          <td className="py-5 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400">{pos.entry}</td>
                          <td className="py-5 px-4 text-right font-mono font-medium">{pos.mark}</td>
                          <td className="py-5 px-4 text-right font-mono text-orange-500/80">{pos.liqPrice}</td>

                          {/* PnL */}
                          <td className="py-5 px-6 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`font-bold font-mono text-base ${pos.isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {pos.pnl}
                              </span>
                              <span className="text-xs font-medium text-zinc-500 mt-0.5">{pos.pnlPct} (ROE)</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-5 px-6 text-center">
                            <button onClick={() => closePosition(pos.source)} className="px-4 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
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
            <motion.div variants={item} className="xl:col-span-1 space-y-6 flex flex-col">
              
              {/* Margin Overview Card */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[32px] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Account Margin</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-500">Total Equity</span>
                    <span className="font-mono font-bold">{marginMetrics.totalEquity}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-500">Available Margin</span>
                    <span className="font-mono font-bold text-emerald-500">{marginMetrics.availableMargin}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-500">Maintenance Margin</span>
                    <span className="font-mono font-bold text-orange-500">{marginMetrics.maintenanceMargin}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Margin Ratio</span>
                    <span className="text-emerald-500">Safe (31.6%)</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div initial={{ width: 0 }} animate={{ width: '31.6%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-emerald-500 rounded-l-full" />
                    <div className="h-full w-[2px] bg-[#0A0A0A] z-10" />
                    <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-orange-500" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 text-right">Liquidation at 100%</p>
                </div>
              </div>

              {/* Risk Profile Visualization */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Risk Profile</h3>
                
                {/* Abstract Data Visualization */}
                <div className="flex-1 w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl relative overflow-hidden min-h-[150px] flex items-center justify-center">
                  
                  {/* Concentric Risk Rings */}
                  <div className="absolute w-40 h-40 border border-white/5 rounded-full" />
                  <div className="absolute w-24 h-24 border border-white/10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-400">LOW</p>
                      <p className="text-[8px] tracking-widest uppercase text-zinc-500">Exposure</p>
                    </div>
                  </div>
                  
                  {/* Animated Orbiting Dots representing positions */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-40 h-40 rounded-full border border-transparent">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full absolute top-[-6px] left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </motion.div>
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-24 h-24 rounded-full border border-transparent">
                    <div className="w-2 h-2 bg-rose-400 rounded-full absolute bottom-[-4px] left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
                  </motion.div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Long Exp.</p>
                    <p className="font-mono font-bold text-sm text-emerald-500">82.5%</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Short Exp.</p>
                    <p className="font-mono font-bold text-sm text-rose-500">17.5%</p>
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
