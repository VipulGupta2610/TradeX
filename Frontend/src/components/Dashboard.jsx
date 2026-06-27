import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';
import Sidebar from '../assets/Sidebar';
import ThemeToggle from './ThemeToggle';

export default function Dashboard() {
  const activeTab = 'Overview';

  const user = useSelector((state) => state.auth?.user) || {};
  
  const { 
    orders = [], 
    watchlist: savedWatchlist = [], 
    quotes = {}, 
    metrics = { totalEquity: 0, unrealizedPnl: 0, openOrders: 0 },
    loading 
  } = useTradingAccount(user._id || 'guest_user');

  // --- LIVE INTERACTIVE GRAPH STATE ---
  const [liveData, setLiveData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Maximum number of ticks visible on the chart
  const MAX_POINTS = 20;

  useEffect(() => {
    if (!metrics.totalEquity) return;

    setLiveData(prev => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const exactValue = metrics.totalEquity;
      // Format to 2 decimals for the tooltip display
      const formatted = `₹${exactValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      
      const newPoint = { rawValue: exactValue, label: timeLabel, value: formatted };

      // Initialize with a fake history leading up to the current balance 
      // to ensure the graph looks good immediately upon load
      if (prev.length === 0) {
        return Array.from({ length: MAX_POINTS }).map((_, i) => ({
          rawValue: exactValue * (1 - (MAX_POINTS - 1 - i) * 0.0002), // 0.02% variance seeding
          label: timeLabel,
          value: formatted
        }));
      }

      const next = [...prev, newPoint];
      if (next.length > MAX_POINTS) next.shift();
      return next;
    });
  }, [metrics.totalEquity]); // Triggers exact moment WebSocket changes balance

  // Map live data to SVG Coordinates dynamically
  const { mappedData, pathD, areaD } = useMemo(() => {
    if (liveData.length === 0) return { mappedData: [], pathD: "", areaD: "" };

    const width = 400;
    const height = 100;
    const padding = 15; // Top & bottom padding

    const minVal = Math.min(...liveData.map(d => d.rawValue));
    const maxVal = Math.max(...liveData.map(d => d.rawValue));
    const range = maxVal - minVal || 1; // Prevent division by zero

    const mapped = liveData.map((d, i) => {
      const x = (i / (liveData.length - 1 || 1)) * width;
      // Invert Y axis for SVG (0 is top, 100 is bottom)
      const y = height - padding - ((d.rawValue - minVal) / range) * (height - padding * 2);
      return { ...d, x, y };
    });

    const path = `M ${mapped.map(d => `${d.x},${d.y}`).join(' L ')}`;
    const area = `${path} L ${width},${height} L 0,${height} Z`;

    return { mappedData: mapped, pathD: path, areaD: area };
  }, [liveData]);


  // Process recent orders safely
  const recentActivity = orders.slice(0, 4).map(order => ({
    id: order.id,
    type: order.side === 'BUY' ? 'Buy' : 'Sell',
    asset: order.sym || 'UNKNWN',
    pair: order.sym || 'UNKNOWN',
    amount: order.qty || 0,
    price: `₹${Number(order.price || 0).toLocaleString('en-IN')}`,
    status: order.status === 'COMPLETE' ? 'Filled' : order.status === 'OPEN' ? 'Pending' : 'Canceled'
  }));

  // Process market quotes safely
  const marketWatch = savedWatchlist.slice(0, 3).map(item => {
    const quote = quotes[item.symbol] || {};
    return {
      ticker: item.symbol,
      price: `₹${Number(quote.price || 0).toLocaleString('en-IN')}`,
      change: `${Number(quote.changePct || 0) >= 0 ? '+' : ''}${Number(quote.changePct || 0).toFixed(2)}%`,
      up: Number(quote.changePct || 0) >= 0
    };
  });

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-black transition-colors duration-500 selection:bg-emerald-500/30 dark:bg-[#000000] dark:text-white md:h-screen md:flex-row md:overflow-hidden">
      <style>
        {`
          ::-webkit-scrollbar { display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <Sidebar />
      
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        <header className="h-20 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/30 dark:bg-black/30 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A]/50">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-mono text-zinc-500">{loading ? 'Syncing...' : 'API: Operational'}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Equity Bento Block */}
              <motion.div variants={itemVariants} className="lg:col-span-2 relative bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 overflow-hidden group shadow-sm flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-colors duration-700" />
                
                <div className="relative z-10">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Balance</p>
                  <div className="flex items-end gap-4 mb-8">
                    <h2 className="text-5xl font-black tracking-tighter">
                      {loading ? '₹—' : `₹${(metrics.totalEquity || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    </h2>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold mb-1 ${
                      (metrics.unrealizedPnl || 0) >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={(metrics.unrealizedPnl || 0) >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                      </svg>
                      {(metrics.unrealizedPnl || 0) >= 0 ? '+' : ''}₹{(metrics.unrealizedPnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* LIVE DYNAMIC SVG GRAPH */}
                <div className="h-40 w-full mt-auto relative group/graph cursor-crosshair">
                  
                  {hoveredPoint !== null && mappedData[hoveredPoint] && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute z-20 pointer-events-none flex flex-col items-center"
                      style={{
                        left: `calc(${(mappedData[hoveredPoint].x / 400) * 100}% - 45px)`,
                        top: `calc(${(mappedData[hoveredPoint].y / 100) * 100}% - 45px)`,
                        width: '90px'
                      }}
                    >
                      <div className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl text-center">
                        <span className="block opacity-70 text-[8px] uppercase tracking-wider mb-0.5">{mappedData[hoveredPoint].label}</span>
                        {mappedData[hoveredPoint].value}
                      </div>
                    </motion.div>
                  )}

                  <svg 
                    className="w-full h-full overflow-visible" 
                    viewBox="0 0 400 100" 
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <defs>
                      <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Vertical Crosshair Line */}
                    {hoveredPoint !== null && mappedData[hoveredPoint] && (
                      <line 
                        x1={mappedData[hoveredPoint].x} 
                        y1="0" 
                        x2={mappedData[hoveredPoint].x} 
                        y2="100" 
                        stroke="currentColor" 
                        className="text-black/10 dark:text-white/10"
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                      />
                    )}

                    {/* Background Gradient Area */}
                    <path 
                      d={areaD} 
                      fill="url(#chart-grad)" 
                      className="opacity-60 group-hover/graph:opacity-100 transition-all duration-300 ease-out"
                    />

                    {/* Main Glowing Line */}
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round" 
                      filter="url(#glow)"
                      className="transition-all duration-300 ease-out"
                    />

                    {/* Interactive Nodes */}
                    {mappedData.map((pt, i) => (
                      <g key={i} onMouseEnter={() => setHoveredPoint(i)}>
                        {/* Invisible larger hit area for hover tolerance */}
                        <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" className="cursor-pointer" />
                        
                        {/* Visible Dot */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={hoveredPoint === i ? "5" : "0"} 
                          fill={hoveredPoint === i ? "#ffffff" : "#10b981"} 
                          stroke="#10b981"
                          strokeWidth="2"
                          className="transition-all duration-300 origin-center pointer-events-none drop-shadow-md ease-out"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              </motion.div>

              {/* Order Performance / Metrics Block */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">API Usage</p>
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/5 dark:bg-white/10 rounded-md">Billing Cycle</span>
                </div>
                
                <div className="my-auto">
                  <p className="text-4xl font-black tracking-tight mb-1">{orders.length} <span className="text-xl text-zinc-500 font-medium">orders</span></p>
                  <p className="text-xs text-zinc-500 font-mono">{metrics.openOrders || 0} currently open</p>
                  
                  <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: orders.length > 0 ? '75%' : '0%' }} transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                  <Link to="/Subscription" className="block w-full text-center text-sm font-bold text-black dark:text-white hover:opacity-70 transition-opacity">
                    Upgrade Infrastructure →
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Execution Log Table */}
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Execution Log</h3>
                  <Link to="/OrderHistory" className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">View All</Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
                        <th className="pb-4 font-medium">Asset</th>
                        <th className="pb-4 font-medium">Type</th>
                        <th className="pb-4 font-medium text-right">Amount</th>
                        <th className="pb-4 font-medium text-right">Price</th>
                        <th className="pb-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {recentActivity.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-zinc-400 font-mono text-xs">
                            {loading ? 'Loading execution logs...' : 'No dynamic trade records found.'}
                          </td>
                        </tr>
                      ) : (
                        recentActivity.map((tx) => (
                          <tr key={tx.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-[10px]">
                                  {tx.asset ? tx.asset[0] : '?'}
                                </div>
                                <span className="font-bold font-mono">{tx.pair}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                tx.type === 'Buy' ? 'text-emerald-500 bg-emerald-500/10' : 
                                tx.type === 'Sell' ? 'text-rose-500 bg-rose-500/10' : 
                                'text-blue-500 bg-blue-500/10'
                              }`}>{tx.type}</span>
                            </td>
                            <td className="py-4 text-right font-mono text-zinc-600 dark:text-zinc-400">{tx.amount}</td>
                            <td className="py-4 text-right font-mono">{tx.price}</td>
                            <td className="py-4 text-right">
                              <span className="text-xs text-zinc-500">{tx.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Watchlist Section */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg mb-6">Market Watch</h3>
                
                <div className="space-y-4 mb-auto">
                  {marketWatch.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 font-mono text-xs border border-dashed border-black/5 dark:border-white/5 rounded-xl">
                      {loading ? 'Fetching dynamic tickers...' : 'Watchlist empty.'}
                    </div>
                  ) : (
                    marketWatch.map((watchlistIdx, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer">
                        <span className="font-bold font-mono text-sm">{watchlistIdx.ticker}</span>
                        <div className="text-right">
                          <p className="font-mono text-sm">{watchlistIdx.price}</p>
                          <p className={`text-[10px] font-bold ${watchlistIdx.up ? 'text-emerald-500' : 'text-rose-500'}`}>{watchlistIdx.change}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link to="/TradingTerminal" className="w-full text-center mt-6 bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Launch Execution Terminal
                </Link>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}