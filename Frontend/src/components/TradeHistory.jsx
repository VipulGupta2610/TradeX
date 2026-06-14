import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';
import { exportCsv } from '../utils/exportCsv';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

export default function TradeHistory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const user = useSelector(state => state.auth.user);
  const { orders } = useTradingAccount(user?._id);
  
  const tradeHistory = orders.filter(order => order.status === 'COMPLETE').map(order => ({
    id: order.id,
    time: order.time,
    date: new Date().toLocaleDateString('en-IN'),
    market: order.sym,
    side: order.side === 'BUY' ? 'LONG' : 'SHORT',
    action: order.side === 'BUY' ? 'Open' : 'Close',
    size: `${order.qty} units`,
    execPrice: `₹${Number(order.price || 0).toLocaleString('en-IN')}`,
    fee: '₹0.00',
    realizedPnL: '-',
    isWin: null
  }));

  const filteredTrades = activeFilter === 'All' 
    ? tradeHistory 
    : activeFilter === 'Wins' 
      ? tradeHistory.filter(trade => trade.isWin === true)
      : activeFilter === 'Losses'
        ? tradeHistory.filter(trade => trade.isWin === false)
        : tradeHistory.filter(trade => trade.action === 'Open');
  const searchedTrades = filteredTrades.filter(trade =>
    `${trade.id} ${trade.market}`.toLowerCase().includes(search.toLowerCase())
  );

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
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- IMMERSIVE BACKGROUND --- */}
        {/* Removed 'fixed' so it stays inside the flex-1 wrapper */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)] blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.04),transparent_60%)] blur-[100px]" />
          
          {/* Fine Grain Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]" />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            
            {/* HEADER & METRICS ROW */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-8">
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Performance Ledger
                </h2>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Trade History.</h1>
              </motion.div>

              {/* Performance Analytics Bento */}
              <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[180px] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Realized PnL</p>
                  <p className="text-2xl font-mono font-black text-emerald-500">+$12,480.25</p>
                </div>
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[160px] shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Win Rate</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-mono font-black">68.5%</p>
                    <span className="text-xs font-bold text-emerald-500 mb-1">↑ 2.1%</span>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[160px] shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Fees Paid</p>
                  <p className="text-2xl font-mono font-black text-zinc-400">-$412.50</p>
                </div>
              </motion.div>
            </div>

            {/* MAIN DATA TABLE WRAPPER */}
            <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
              
              {/* Filters & Actions Bar */}
              <div className="p-8 border-b border-black/5 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black/[0.01] dark:bg-white/[0.01]">
                
                {/* Specialized PnL Filters */}
                <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05]">
                  {['All', 'Wins', 'Losses', 'Openings'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setActiveFilter(status)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeFilter === status ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Advanced Actions */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input value={search} onChange={event => setSearch(event.target.value)} type="text" placeholder="Search Trade ID or Market..." className="w-full bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner" />
                  </div>
                  <button onClick={() => exportCsv('tradex-trades.csv', searchedTrades)} className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export PnL
                  </button>
                </div>
              </div>

              {/* The Table */}
              <div className="overflow-x-auto p-4 sm:p-8">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-black/5 dark:border-white/[0.05]">
                      <th className="pb-6 pl-4 font-medium w-[15%]">Time / ID</th>
                      <th className="pb-6 font-medium w-[15%]">Market</th>
                      <th className="pb-6 font-medium text-center w-[10%]">Action</th>
                      <th className="pb-6 font-medium text-right w-[15%]">Size</th>
                      <th className="pb-6 font-medium text-right w-[15%]">Exec Price</th>
                      <th className="pb-6 font-medium text-right w-[10%]">Fee</th>
                      <th className="pb-6 pr-4 font-medium text-right w-[20%]">Realized PnL</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence mode="popLayout">
                      {searchedTrades.map((trade, index) => (
                        <motion.tr 
                          key={trade.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: 0.03 * index }}
                          className="group border-b border-black/5 dark:border-white/[0.03] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          
                          {/* Time & ID */}
                          <td className="py-6 pl-4 rounded-l-2xl">
                            <p className="font-mono font-bold text-sm mb-1">{trade.time}</p>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{trade.date} · {trade.id}</p>
                          </td>
                          
                          {/* Market & Side */}
                          <td className="py-6">
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center justify-center w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 ${trade.side === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trade.side === 'LONG' ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>
                                )}
                              </span>
                              <div>
                                <span className="font-bold text-base tracking-wide block">{trade.market}</span>
                                <span className="text-[10px] font-bold text-zinc-500">{trade.side}</span>
                              </div>
                            </div>
                          </td>

                          {/* Trade Action (Open/Close) */}
                          <td className="py-6 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                              trade.action === 'Open' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                            }`}>
                              {trade.action}
                            </span>
                          </td>

                          {/* Size */}
                          <td className="py-6 text-right font-mono font-medium text-sm text-zinc-600 dark:text-zinc-300">
                            {trade.size}
                          </td>

                          {/* Executed Price */}
                          <td className="py-6 text-right font-mono font-bold text-base">
                            {trade.execPrice}
                          </td>

                          {/* Fee */}
                          <td className="py-6 text-right font-mono text-xs text-zinc-500">
                            {trade.fee}
                          </td>

                          {/* Realized PnL */}
                          <td className="py-6 pr-4 rounded-r-2xl text-right">
                            {trade.isWin === null ? (
                              <span className="font-mono text-zinc-500 font-medium">-</span>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className={`font-black font-mono text-lg ${trade.isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {trade.realizedPnL}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${trade.isWin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                  {trade.isWin ? 'PROFIT' : 'LOSS'}
                                </span>
                              </div>
                            )}
                          </td>
                          
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                
                {searchedTrades.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-lg font-bold text-zinc-400">No trades match this filter.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination / Footer */}
              <div className="p-6 border-t border-black/5 dark:border-white/[0.05] flex justify-between items-center bg-black/[0.01] dark:bg-white/[0.01]">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Showing {searchedTrades.length} records</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 text-zinc-500 hover:text-white transition-colors disabled:opacity-50" disabled>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}