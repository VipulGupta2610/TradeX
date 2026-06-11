import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';
import { exportCsv } from '../utils/exportCsv';

// --- Mock Order History Data ---
const orderHistory = [
  { id: 'ORD-8X92F', time: '14:23:05', date: 'Oct 24, 2026', market: 'BTC-PERP', type: 'Market', side: 'BUY', size: '2.5 BTC', price: '$64,230.50', total: '$160,576.25', fee: '$32.11', status: 'Filled' },
  { id: 'ORD-7T41M', time: '11:05:12', date: 'Oct 24, 2026', market: 'ETH/USD', type: 'Limit', side: 'SELL', size: '15.0 ETH', price: '$3,450.00', total: '$51,750.00', fee: '$10.35', status: 'Filled' },
  { id: 'ORD-2P99K', time: '09:15:00', date: 'Oct 24, 2026', market: 'NVDA', type: 'Limit', side: 'BUY', size: '50 Shares', price: '$870.00', total: '$43,500.00', fee: '$0.00', status: 'Pending' },
  { id: 'ORD-5L22A', time: '16:45:33', date: 'Oct 23, 2026', market: 'SOL-PERP', type: 'Stop Market', side: 'SELL', size: '150 SOL', price: '$142.10', total: '$21,315.00', fee: '$5.32', status: 'Filled' },
  { id: 'ORD-9M11Z', time: '14:30:22', date: 'Oct 23, 2026', market: 'TSLA', type: 'Limit', side: 'BUY', size: '100 Shares', price: '$165.00', total: '$16,500.00', fee: '$0.00', status: 'Canceled' },
  { id: 'ORD-1K88J', time: '10:05:41', date: 'Oct 22, 2026', market: 'AAPL', type: 'Market', side: 'BUY', size: '200 Shares', price: '$189.40', total: '$37,880.00', fee: '$0.00', status: 'Filled' },
  { id: 'ORD-3R44C', time: '08:22:15', date: 'Oct 22, 2026', market: 'EUR/USD', type: 'Limit', side: 'SELL', size: '100,000 EUR', price: '1.0850', total: '$108,500.00', fee: '$2.50', status: 'Filled' },
];

export default function OrderHistory() {
  const [isDark, setIsDark] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const user = useSelector(state => state.auth.user);
  const { orders, metrics } = useTradingAccount(user?._id);
  const orderHistory = orders.map(order => ({
    id: order.id,
    time: order.time,
    date: new Date().toLocaleDateString('en-IN'),
    market: order.sym,
    type: order.type,
    side: order.side,
    size: `${order.qty} units`,
    price: `₹${Number(order.price || 0).toLocaleString('en-IN')}`,
    total: `₹${(Number(order.price || 0) * Number(order.qty || 0)).toLocaleString('en-IN')}`,
    fee: '₹0.00',
    status: order.status === 'COMPLETE' ? 'Filled' : order.status === 'OPEN' ? 'Pending' : 'Canceled'
  }));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const filteredOrders = activeFilter === 'All' 
    ? orderHistory 
    : orderHistory.filter(order => order.status === activeFilter);
  const searchedOrders = filteredOrders.filter(order =>
    `${order.id} ${order.market}`.toLowerCase().includes(search.toLowerCase())
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 relative">
      
      {/* --- IMMERSIVE BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)] blur-[100px]" />
        
        {/* Fine Grain Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]" />
      </div>

      {/* --- TOP NAVIGATION (Minimal) --- */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-[#020202]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs shadow-lg">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">ORDER LOG</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link to={user?._id ? `/Dashboard/${user._id}` : '/Login'} className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Back to Terminal
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* HEADER & METRICS ROW */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-8">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Execution History
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Order Book.</h1>
            </motion.div>

            {/* Quick Analytics Bento */}
            <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[160px] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">30D Volume</p>
                <p className="text-2xl font-mono font-black">₹{orders.reduce((sum, order) => sum + Number(order.price || 0) * Number(order.qty || 0), 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[160px] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Trades</p>
                <p className="text-2xl font-mono font-black">{orders.length}</p>
              </div>
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl p-5 min-w-[160px] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fill Rate</p>
                <p className="text-2xl font-mono font-black text-emerald-500">{orders.length ? ((metrics.executedOrders / orders.length) * 100).toFixed(1) : '0.0'}%</p>
              </div>
            </motion.div>
          </div>

          {/* MAIN DATA TABLE WRAPPER */}
          <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Filters & Actions Bar */}
            <div className="p-8 border-b border-black/5 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black/[0.01] dark:bg-white/[0.01]">
              
              {/* Status Filters */}
              <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05]">
                {['All', 'Filled', 'Pending', 'Canceled'].map(status => (
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
                  <input value={search} onChange={event => setSearch(event.target.value)} type="text" placeholder="Search Order ID or Market..." className="w-full bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner" />
                </div>
                <button onClick={() => exportCsv('tradex-orders.csv', searchedOrders)} className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  CSV
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
                    <th className="pb-6 font-medium w-[10%]">Type</th>
                    <th className="pb-6 font-medium text-right w-[15%]">Price</th>
                    <th className="pb-6 font-medium text-right w-[15%]">Amount / Total</th>
                    <th className="pb-6 font-medium text-center w-[15%]">Status</th>
                    <th className="pb-6 pr-4 font-medium text-right w-[10%]">Fee</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {searchedOrders.map((order, index) => (
                      <motion.tr 
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: order.status === 'Canceled' ? 0.6 : 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: 0.03 * index }}
                        className="group border-b border-black/5 dark:border-white/[0.03] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:opacity-100 transition-all cursor-pointer"
                      >
                        
                        {/* Time & ID */}
                        <td className="py-6 pl-4 rounded-l-2xl">
                          <p className="font-mono font-bold text-sm mb-1">{order.time}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{order.date} · {order.id}</p>
                        </td>
                        
                        {/* Market & Side */}
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/10 ${order.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {order.side}
                            </span>
                            <span className="font-bold text-base tracking-wide">{order.market}</span>
                          </div>
                        </td>

                        {/* Order Type */}
                        <td className="py-6 text-zinc-600 dark:text-zinc-400 font-medium">
                          {order.type}
                        </td>

                        {/* Executed Price */}
                        <td className="py-6 text-right font-mono font-bold text-base">
                          {order.price}
                        </td>

                        {/* Amount & Total Notional */}
                        <td className="py-6 text-right">
                          <p className="font-mono font-medium text-sm mb-1 text-zinc-600 dark:text-zinc-300">{order.size}</p>
                          <p className="text-xs font-mono font-bold">{order.total}</p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border ${
                            order.status === 'Filled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                            order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                          }`}>
                            {order.status === 'Filled' && <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            {order.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                            {order.status === 'Canceled' && <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                            {order.status}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="py-6 pr-4 rounded-r-2xl text-right font-mono text-xs text-zinc-500">
                          {order.fee}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {searchedOrders.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-lg font-bold text-zinc-400">No orders found.</p>
                  <p className="text-sm text-zinc-600 mt-1">Try adjusting your filters.</p>
                </div>
              )}
            </div>
            
            {/* Pagination / Footer */}
            <div className="p-6 border-t border-black/5 dark:border-white/[0.05] flex justify-between items-center bg-black/[0.01] dark:bg-white/[0.01]">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Showing {searchedOrders.length} records</p>
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
  );
}
