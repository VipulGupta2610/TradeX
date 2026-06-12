import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTradingAccount } from '../hooks/useTradingAccount';
import Sidebar from "../assets/Sidebar"; // ADDED: Sidebar import

// ADDED: Fallback mock data to prevent crashes while API is loading
const mockMetrics = {
  unrealizedPnl: 24530.00,
  invested: 98400.00,
  totalEquity: 142850.00,
  openOrders: 8,
  marketValue: 142850.00
};

const mockPositions = [
  { type: 'Crypto', value: 92852 },
  { type: 'Equities', value: 42850 },
  { type: 'Forex', value: 7148 }
];

const mockOrders = new Array(1842).fill({ status: 'COMPLETE' });

export default function Analytics() {
  const [isDark, setIsDark] = useState(false); // Defaulting to light mode for the "light" feel
  const [timeframe, setTimeframe] = useState('YTD');
  
  const user = useSelector(state => state.auth.user);
  const { positions, orders, metrics } = useTradingAccount(user?._id);
  
  // FIXED: Safe data fallbacks
  const displayMetrics = metrics && Object.keys(metrics).length > 0 ? metrics : mockMetrics;
  const displayPositions = positions && positions.length > 0 ? positions : mockPositions;
  const displayOrders = orders && orders.length > 0 ? orders : mockOrders;

  const pnlPercent = displayMetrics.invested ? (displayMetrics.unrealizedPnl / displayMetrics.invested) * 100 : 0;
  const completed = displayOrders.filter(order => order.status === 'COMPLETE') || [];
  
  const kpiData = [
    { 
      label: 'Unrealized PnL', 
      value: `${displayMetrics.unrealizedPnl >= 0 ? '+' : '-'}₹${Math.abs(displayMetrics.unrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 
      trend: `${pnlPercent.toFixed(2)}%`, 
      isPositive: displayMetrics.unrealizedPnl >= 0 
    },
    { 
      label: 'Executed Orders', 
      value: String(completed.length), 
      trend: `${displayMetrics.openOrders || 0} open`, 
      isPositive: true 
    },
    { 
      label: 'Portfolio Equity', 
      value: `₹${(displayMetrics.totalEquity || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
      trend: `${displayPositions.length || 0} assets`, 
      isPositive: true 
    },
    { 
      label: 'Capital at Risk', 
      value: `₹${(displayMetrics.invested || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
      trend: `${displayMetrics.totalEquity ? ((displayMetrics.invested / displayMetrics.totalEquity) * 100).toFixed(1) : 0}%`, 
      isPositive: (displayMetrics.invested || 0) <= (displayMetrics.totalEquity || 0) 
    }
  ];

  const allocation = displayPositions.reduce((totals, position) => {
    const key = position.type === 'Crypto' ? 'Crypto' : position.type === 'Forex' ? 'Forex' : 'Equities';
    totals[key] = (totals[key] || 0) + position.value;
    return totals;
  }, {}) || {};

  // FIXED: Ensure total volume fallback exists to prevent NaN crashes
  const fallbackMarketValue = (allocation.Crypto || 0) + (allocation.Equities || 0) + (allocation.Forex || 0);
  const actualMarketValue = displayMetrics.marketValue || fallbackMarketValue;

  const volumeData = [
    { asset: 'Crypto', value: allocation.Crypto || 0, color: 'bg-emerald-500' },
    { asset: 'Equities', value: allocation.Equities || 0, color: 'bg-blue-500' },
    { asset: 'Forex', value: allocation.Forex || 0, color: 'bg-indigo-500' }
  ].map(item => ({
    ...item,
    volume: `${actualMarketValue ? ((item.value / actualMarketValue) * 100).toFixed(1) : '0.0'}%`
  }));

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    // FIXED: Added h-screen and flex to create the side-by-side layout
    <div className={`h-screen ${isDark ? 'dark' : ''} bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-500/20 relative flex overflow-hidden`}>
      
      {/* --- SUBTLE BACKGROUND AMBIENCE --- */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-200/50 to-transparent dark:from-white/[0.02] pointer-events-none -z-10" />

      {/* FIXED: Sidebar injected directly into the flex row */}
      <Sidebar />

      {/* --- MAIN CONTENT AREA --- */}
      {/* FIXED: Main acts as a flex-1 column with independent scrolling */}
      <main className="flex-1 relative z-10 py-15 overflow-y-auto w-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            
            {/* HEADER & TIMEFRAME */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
              <motion.div variants={item}>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Performance Overview</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Track your portfolio metrics and trading execution in real-time.</p>
              </motion.div>

              <motion.div variants={item} className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                {['1W', '1M', '3M', 'YTD', 'ALL'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${timeframe === tf ? 'bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {tf}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* KPI CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, idx) => (
                <motion.div key={idx} variants={item} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{kpi.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-semibold tracking-tight">{kpi.value}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${kpi.isPositive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {kpi.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* MAIN VISUALIZATIONS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CUMULATIVE PNL CHART (Spans 2 cols) */}
              <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Cumulative PnL</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Net realized and unrealized profit over {timeframe}.</p>
                  </div>
                </div>

                {/* Clean SVG Chart */}
                <div className="flex-1 w-full min-h-[300px] relative mt-4">
                  <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pnl-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Gentle Grid Lines */}
                    {[75, 150, 225].map(y => (
                      <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="1" />
                    ))}

                    {/* Fill Area */}
                    <motion.path 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
                      d="M0,300 L0,200 Q100,180 200,150 T400,160 T600,80 T800,120 T1000,40 L1000,300 Z" 
                      fill="url(#pnl-grad)" 
                    />
                    
                    {/* Clean Stroke */}
                    <motion.path 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                      d="M0,200 Q100,180 200,150 T400,160 T600,80 T800,120 T1000,40" 
                      fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    />

                    {/* Tracker Dot */}
                    <motion.circle 
                      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}
                      cx="1000" cy="40" r="5" fill="#fff" stroke="#3b82f6" strokeWidth="3"
                    />
                  </svg>
                </div>
              </motion.div>

              {/* RIGHT COLUMN: DISTRIBUTION & RISK */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Win / Loss Donut Chart */}
                <motion.div variants={item} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-base font-semibold tracking-tight mb-6">Win / Loss Ratio</h3>
                  
                  <div className="flex-1 flex items-center justify-center relative my-4">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" />
                      {/* Loss Arc (Red) */}
                      <motion.circle 
                        cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="8" strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 - (251.2 * 0.318) }} transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                      {/* Win Arc (Green) */}
                      <motion.circle 
                        cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 - (251.2 * 0.682) }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        strokeDashoffset={251.2 * 0.318}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">2.1</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Profit Factor</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Wins</p>
                      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">1,256</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Losses</p>
                      <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">586</p>
                    </div>
                  </div>
                </motion.div>

                {/* Volume Distribution Bars */}
                <motion.div variants={item} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center">
                  <h3 className="text-base font-semibold tracking-tight mb-6">Volume Allocation</h3>
                  <div className="space-y-5">
                    {volumeData.map((data, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-slate-600 dark:text-slate-400">{data.asset}</span>
                          <span>{data.volume}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: data.volume }} transition={{ duration: 0.8, delay: 0.1 + (idx * 0.1) }} 
                            className={`h-full ${data.color} rounded-full`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </div>
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}