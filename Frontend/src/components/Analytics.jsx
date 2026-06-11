import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';

// --- Mock Analytics Data ---
const kpiData = [
  { label: 'Cumulative PnL', value: '+$42,850.00', trend: '+12.4%', isPositive: true },
  { label: 'Win Rate', value: '68.2%', trend: '+2.1%', isPositive: true },
  { label: 'Sharpe Ratio', value: '2.45', trend: '+0.15', isPositive: true },
  { label: 'Max Drawdown', value: '-14.2%', trend: '-1.2%', isPositive: false },
];

const volumeData = [
  { asset: 'Crypto (Perps)', volume: '65%', color: 'bg-emerald-500' },
  { asset: 'Equities', volume: '25%', color: 'bg-blue-500' },
  { asset: 'Forex', volume: '10%', color: 'bg-purple-500' },
];

export default function Analytics() {
  const [isDark, setIsDark] = useState(true);
  const [timeframe, setTimeframe] = useState('YTD');
  const user = useSelector(state => state.auth.user);
  const { positions, orders, metrics } = useTradingAccount(user?._id);
  const pnlPercent = metrics.invested ? (metrics.unrealizedPnl / metrics.invested) * 100 : 0;
  const completed = orders.filter(order => order.status === 'COMPLETE');
  const kpiData = [
    { label: 'Unrealized PnL', value: `${metrics.unrealizedPnl >= 0 ? '+' : '-'}₹${Math.abs(metrics.unrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, trend: `${pnlPercent.toFixed(2)}%`, isPositive: metrics.unrealizedPnl >= 0 },
    { label: 'Executed Orders', value: String(completed.length), trend: `${metrics.openOrders} open`, isPositive: true },
    { label: 'Portfolio Equity', value: `₹${metrics.totalEquity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, trend: `${positions.length} assets`, isPositive: true },
    { label: 'Capital at Risk', value: `₹${metrics.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, trend: `${metrics.totalEquity ? (metrics.invested / metrics.totalEquity * 100).toFixed(1) : 0}%`, isPositive: metrics.invested <= metrics.totalEquity }
  ];
  const allocation = positions.reduce((totals, position) => {
    const key = position.type === 'Crypto' ? 'Crypto' : position.type === 'Forex' ? 'Forex' : 'Equities';
    totals[key] = (totals[key] || 0) + position.value;
    return totals;
  }, {});
  const volumeData = [
    { asset: 'Crypto', value: allocation.Crypto || 0, color: 'bg-emerald-500' },
    { asset: 'Equities', value: allocation.Equities || 0, color: 'bg-blue-500' },
    { asset: 'Forex', value: allocation.Forex || 0, color: 'bg-purple-500' }
  ].map(item => ({
    ...item,
    volume: `${metrics.marketValue ? (item.value / metrics.marketValue * 100).toFixed(1) : '0.0'}%`
  }));

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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      
      {/* --- IMMERSIVE ANALYTICAL BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        {/* Animated Deep Glows */}
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.07),transparent_60%)] blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [20, -20, 20], y: [20, -20, 20] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)] blur-[120px]" 
        />
        
        {/* Topographic Lines Overlay (CSS Simulated) */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q 25 25, 50 50 T 100 50' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 70 Q 25 45, 50 70 T 100 70' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

        {/* Fine Grain Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-[#020202]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs shadow-lg">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">ANALYTICS</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link to="/TradingTerminal" className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Execution Terminal
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* HEADER & TIMEFRAME */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-4">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> Performance Metrics
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Analytics.</h1>
            </motion.div>

            <motion.div variants={item} className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05] backdrop-blur-md">
              {['1W', '1M', '3M', 'YTD', 'ALL'].map(tf => (
                <button 
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${timeframe === tf ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                >
                  {tf}
                </button>
              ))}
            </motion.div>
          </div>

          {/* KPI CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiData.map((kpi, idx) => (
              <motion.div key={idx} variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-8 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-black font-mono tracking-tight">{kpi.value}</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {kpi.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MAIN VISUALIZATIONS ROW */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* CUMULATIVE PNL CHART (Spans 2 cols) */}
            <motion.div variants={item} className="xl:col-span-2 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 md:p-10 shadow-2xl relative flex flex-col group">
              <div className="flex justify-between items-start mb-8 z-10">
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Cumulative PnL</h3>
                  <p className="text-sm text-zinc-500 font-medium">Net realized and unrealized profit over {timeframe}.</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>

              {/* Massive SVG Chart */}
              <div className="flex-1 w-full min-h-[350px] relative -mx-10 -mb-10 px-10 pb-10">
                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pnl-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[100, 200, 300].map(y => (
                    <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="currentColor" className="text-black/5 dark:text-white/5" strokeWidth="1" strokeDasharray="4 4" />
                  ))}

                  {/* Fill Area */}
                  <motion.path 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
                    d="M0,400 L0,300 Q100,280 200,200 T400,220 T600,100 T800,150 T1000,40 L1000,400 Z" 
                    fill="url(#pnl-grad)" 
                  />
                  
                  {/* Glowing Stroke */}
                  <motion.path 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeOut" }}
                    d="M0,300 Q100,280 200,200 T400,220 T600,100 T800,150 T1000,40" 
                    fill="none" stroke="url(#line-grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0px 8px 12px rgba(59,130,246,0.4))' }}
                  />

                  {/* Animated Tracker Dot */}
                  <motion.circle 
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }}
                    cx="1000" cy="40" r="6" fill="#fff" stroke="#8b5cf6" strokeWidth="4"
                    className="shadow-[0_0_20px_rgba(139,92,246,1)]"
                  />
                </svg>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: DISTRIBUTION & RISK */}
            <div className="xl:col-span-1 flex flex-col gap-8">
              
              {/* Win / Loss Donut Chart */}
              <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 shadow-xl flex-1 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500" />
                
                <h3 className="text-lg font-bold tracking-tight mb-6">Win / Loss Ratio</h3>
                
                <div className="flex-1 flex items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeWidth="12" />
                    {/* Loss Arc (Red) - 31.8% */}
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="12" strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 - (251.2 * 0.318) }} transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    {/* Win Arc (Green) - 68.2% */}
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 - (251.2 * 0.682) }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      strokeDashoffset={251.2 * 0.318} // Offset by the red amount
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-mono">2.1</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Profit Factor</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Winning Trades</p>
                    <p className="text-xl font-black text-emerald-500 font-mono">1,256</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Losing Trades</p>
                    <p className="text-xl font-black text-rose-500 font-mono">586</p>
                  </div>
                </div>
              </motion.div>

              {/* Volume Distribution Bars */}
              <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 shadow-xl flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-bold tracking-tight mb-8">Volume Allocation</h3>
                
                <div className="space-y-6">
                  {volumeData.map((data, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm font-bold mb-3">
                        <span className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{data.asset}</span>
                        <span className="font-mono">{data.volume}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: data.volume }} transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }} 
                          className={`h-full ${data.color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
          
        </motion.div>
      </main>
    </div>
  );
}
