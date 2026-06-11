import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTradingAccount } from '../hooks/useTradingAccount';
import { adjustVirtualFunds } from '../api/tradingApi';

const portfolioMetrics = {
  totalBalance: "$142,850.00",
  invested: "$98,400.00",
  cash: "$44,450.00",
  totalPnL: "+$24,530.00",
  totalPnLPercent: "+20.7%",
  dailyPnL: "+$1,240.50",
  dailyPnLPercent: "+0.88%",
  isProfitable: true
};

const holdings = [
  { id: 1, ticker: 'BTC', name: 'Bitcoin', type: 'Crypto', qty: '2.45', avgPrice: '$42,100.00', currentPrice: '$64,230.00', totalValue: '$157,363.50', pnl: '+$54,218.50', pnlPercent: '+52.56%', isUp: true, sparkline: "M0,40 Q10,35 20,40 T40,30 T60,35 T80,10 T100,5" },
  { id: 2, ticker: 'NVDA', name: 'NVIDIA Corp', type: 'Stocks', qty: '125', avgPrice: '$450.20', currentPrice: '$875.20', totalValue: '$109,400.00', pnl: '+$53,125.00', pnlPercent: '+94.40%', isUp: true, sparkline: "M0,50 Q15,40 30,30 T60,20 T80,10 T100,0" },
  { id: 3, ticker: 'ETH', name: 'Ethereum', type: 'Crypto', qty: '18.2', avgPrice: '$2,800.00', currentPrice: '$3,450.80', totalValue: '$62,804.56', pnl: '+$11,844.56', pnlPercent: '+23.24%', isUp: true, sparkline: "M0,30 Q20,35 40,20 T70,25 T100,10" },
  { id: 4, ticker: 'TSLA', name: 'Tesla Inc', type: 'Stocks', qty: '400', avgPrice: '$210.50', currentPrice: '$175.34', totalValue: '$70,136.00', pnl: '-$14,064.00', pnlPercent: '-16.70%', isUp: false, sparkline: "M0,10 Q20,15 40,30 T70,40 T100,50" },
  { id: 5, ticker: 'AAPL', name: 'Apple Inc', type: 'Stocks', qty: '150', avgPrice: '$175.00', currentPrice: '$189.43', totalValue: '$28,414.50', pnl: '+$2,164.50', pnlPercent: '+8.24%', isUp: true, sparkline: "M0,35 Q20,40 40,25 T70,15 T100,10" },
];

export default function PortfolioUltra() {
  const [isDark, setIsDark] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const user = useSelector(state => state.auth.user);
  const { balance, positions, metrics, refresh } = useTradingAccount(user?._id);
  const changeFunds = async direction => {
    const raw = window.prompt(`${direction === 1 ? 'Deposit' : 'Withdraw'} virtual amount`);
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await adjustVirtualFunds(user._id, amount * direction);
    await refresh();
  };
  const holdings = positions.map(position => ({
    id: position.id || position.sym,
    ticker: position.sym,
    name: position.name || position.sym,
    type: position.type,
    qty: position.qty,
    avgPrice: `₹${position.avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    currentPrice: `₹${position.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    totalValue: `₹${position.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    pnl: `${position.pnl >= 0 ? '+' : '-'}₹${Math.abs(position.pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    pnlPercent: `${position.pnlPct >= 0 ? '+' : ''}${position.pnlPct.toFixed(2)}%`,
    isUp: position.pnl >= 0,
    sparkline: position.pnl >= 0 ? "M0,40 Q20,35 40,28 T70,20 T100,8" : "M0,10 Q20,18 40,25 T70,38 T100,45"
  }));
  const portfolioMetrics = {
    totalBalance: `₹${metrics.totalEquity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    cash: `₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    dailyPnL: `${metrics.unrealizedPnl >= 0 ? '+' : '-'}₹${Math.abs(metrics.unrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    totalPnLPercent: `${metrics.invested ? (metrics.unrealizedPnl / metrics.invested * 100).toFixed(2) : '0.00'}%`
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 font-sans relative">
      
      {/* --- IMMERSIVE BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-gradient-radial from-green-100 via-transparent to-transparent blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gradient-radial from-blue-100 via-transparent to-transparent blur-[100px]" />
        {/* Noise & Grid */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-grid" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 flex items-center justify-center rounded-lg font-bold text-xl shadow-lg">
            TX
          </div>
          <span className="font-extrabold tracking-widest text-lg text-gray-700 dark:text-gray-300">PORTFOLIO</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link to="/TradingTerminal" className="px-6 py-2 rounded-full bg-gray-800 text-white font-semibold shadow-md hover:scale-105 transition-transform">
            Execution Terminal
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

          {/* TOP SECTION: ASYMMETRICAL BENTO */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left: Chart */}
            <motion.div variants={item} className="xl:col-span-8 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              {/* Accent glow */}
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-radial from-green-100/50 via-transparent to-transparent rounded-full blur-[150px]" />
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 z-10 relative">
                <div>
                  <h2 className="text-sm font-semibold uppercase text-green-600 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" /> Live Equity
                  </h2>
                  <h1 className="text-6xl font-extrabold tracking-tight mb-4">{portfolioMetrics.totalBalance}</h1>
                  <div className="flex items-center gap-4 text-green-500 font-semibold">
                    <span className="text-xl">{portfolioMetrics.dailyPnL}</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center gap-1 border border-green-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      {portfolioMetrics.totalPnLPercent}
                    </span>
                  </div>
                </div>
                {/* Timeframe Buttons */}
                <div className="flex p-2 bg-gray-200 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 backdrop-blur-md">
                  {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${timeframe === tf ? 'bg-white dark:bg-gray-600 text-black dark:text-white shadow-md' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chart */}
              <div className="flex-1 w-full min-h-[300px] relative -mx-10 -mb-10 px-10 pb-10">
                {/* Crosshair */}
                <div className="absolute left-[70%] top-0 bottom-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fluid-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="#22c55e" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    d="M0,300 L0,220 Q100,200 200,240 T400,180 T600,200 T800,100 T1000,40 L1000,300 Z"
                    fill="url(#fluid-grad)"
                  />
                  {/* Line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                    d="M0,220 Q100,200 200,240 T400,180 T600,200 T800,100 T1000,40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 10px 10px rgba(34,197,94,0.4))' }}
                  />
                  {/* Tracker Dot */}
                  <motion.circle
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8 }}
                    cx="1000"
                    cy="40"
                    r="8"
                    fill="#fff"
                    stroke="#22c55e"
                    strokeWidth="4"
                    className="shadow-lg"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Right: Stats & Allocation */}
            <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-8">

              {/* Purchasing Power Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-300/20 rounded-full blur-[40px] -z-10" />
                <p className="text-xs font-bold uppercase mb-2 text-gray-500">Available Purchasing Power</p>
                <h3 className="text-4xl font-extrabold">{portfolioMetrics.cash}</h3>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => changeFunds(1)} className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-semibold shadow-md hover:scale-105 transition-transform">Deposit</button>
                  <button onClick={() => changeFunds(-1)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition">Withdraw</button>
                </div>
              </div>

              {/* Exposure Map */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg flex-1 flex flex-col justify-center">
                <div className="flex justify-between mb-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Exposure Map</p>
                  <button className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition">Details →</button>
                </div>
                {/* Asset Allocation Bars */}
                <div className="space-y-6">
                  {/* Crypto */}
                  <div>
                    <div className="flex justify-between mb-2 text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-400 rounded-full shadow-inner" /> Cryptocurrencies
                      </span>
                      <span className="text-gray-400">65%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.2 }} className="h-full bg-green-400 rounded-full" />
                    </div>
                  </div>
                  {/* Equities */}
                  <div>
                    <div className="flex justify-between mb-2 text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full shadow-inner" /> Global Equities
                      </span>
                      <span className="text-gray-400">30%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ duration: 1.2, delay: 0.2 }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  {/* Cash & Forex */}
                  <div>
                    <div className="flex justify-between mb-2 text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-400 rounded-full shadow-inner" /> Cash & Forex
                      </span>
                      <span className="text-gray-400">5%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1.2, delay: 0.4 }} className="h-full bg-purple-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

          {/* BOTTOM: Holdings Table */}
          <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl overflow-hidden mt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-3xl font-bold tracking-tight">Active Positions</h2>
              {/* Asset Filters */}
              <div className="flex gap-3 mt-4 sm:mt-0">
                {['All Assets', 'Derivatives', 'Spot'].map((label, idx) => (
                  <button key={label} className={`px-4 py-2 rounded-full text-xs font-semibold transition ${idx === 0 ? 'bg-gray-900 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="uppercase text-gray-400 border-b border-gray-200 dark:border-gray-700 text-[10px] font-semibold tracking-widest">
                    <th className="py-4 pl-4">Asset</th>
                    <th className="py-4 text-right">Balance</th>
                    <th className="py-4 text-right">Avg / Current</th>
                    <th className="py-4 text-center">7D Trend</th>
                    <th className="py-4 pr-4 text-right">Total Return</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {holdings.map((asset, index) => (
                      <motion.tr
                        key={asset.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        {/* Asset info */}
                        <td className="py-4 pl-4 flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 shadow-inner font-bold text-lg">{asset.ticker[0]}</div>
                          <div>
                            <p className="font-semibold">{asset.ticker}</p>
                            <p className="text-xs text-gray-500">{asset.name}</p>
                          </div>
                        </td>
                        {/* Balance */}
                        <td className="py-4 text-right font-semibold">
                          <p className="text-lg">{asset.totalValue}</p>
                          <p className="text-xs mt-1">{asset.qty} {asset.ticker}</p>
                        </td>
                        {/* Prices */}
                        <td className="py-4 text-right">
                          <p className="text-xs text-gray-400 mb-1">Avg: {asset.avgPrice}</p>
                          <p className="font-semibold">{asset.currentPrice}</p>
                        </td>
                        {/* 7D Trend Sparkline */}
                        <td className="py-4 w-24 px-4">
                          <svg className="w-full h-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <motion.path
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2 }}
                              d={asset.sparkline}
                              fill="none"
                              stroke={asset.isUp ? "#22c55e" : "#ef4444"}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ filter: `drop-shadow(0 4px 6px ${asset.isUp ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'})` }}
                            />
                          </svg>
                        </td>
                        {/* PnL */}
                        <td className="py-4 pr-4 text-right font-semibold flex flex-col items-end">
                          <span className={`text-lg ${asset.isUp ? 'text-green-500' : 'text-red-500'}`}>{asset.pnl}</span>
                          <span className={`text-[10px] px-2 py-1 rounded-md mt-2 border ${asset.isUp ? 'border-green-300 bg-green-100 text-green-600' : 'border-red-300 bg-red-100 text-red-600'}`}>
                            {asset.pnlPercent}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
