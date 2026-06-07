import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// --- Mock Data ---
const recentActivity = [
  { id: 1, type: 'Buy', asset: 'BTC', pair: 'BTC/USD', amount: '0.245', price: '$64,230', status: 'Filled', time: '2m ago' },
  { id: 2, type: 'Sell', asset: 'ETH', pair: 'ETH/USD', amount: '12.5', price: '$3,450', status: 'Filled', time: '1h ago' },
  { id: 3, type: 'API', asset: 'Webhook', pair: 'POST /v1/orders', amount: '-', price: '-', status: 'Success', time: '3h ago' },
  { id: 4, type: 'Buy', asset: 'SOL', pair: 'SOL/USD', amount: '145.0', price: '$145.20', status: 'Pending', time: '5h ago' },
];

const watchlist = [
  { ticker: 'AAPL', price: '$189.43', change: '-0.85%', up: false },
  { ticker: 'NVDA', price: '$875.20', change: '+4.12%', up: true },
  { ticker: 'TSLA', price: '$175.34', change: '-2.10%', up: false },
];

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

const selector = useSelector(state=>state.auth.user)

  // Toggle Tailwind Dark Mode
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#000000] text-black dark:text-white transition-colors duration-500 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Noise Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#050505]/50 backdrop-blur-xl flex flex-col justify-between z-20 relative">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-black/5 dark:border-white/5">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs mr-3">TX</div>
            <span className="font-bold tracking-[0.2em] text-sm">TRADEX.IO</span>
          </div>

          <div className="p-4 space-y-1 mt-4">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Terminal</p>
            {['Overview', 'Portfolio', 'Analytics', 'WatchList'].map((tab) => (
             <Link to={`/${tab}/${selector._id}`}>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' 
                    : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                {tab}
              </button>
             </Link>
            ))}

            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-2">Developer</p>
            {['API Keys', 'Webhooks', 'Documentation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              VG
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-black dark:text-white">Vipul Gupta</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">Pro Tier</p>
            </div>
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/30 dark:bg-black/30 backdrop-blur-md">
          <h1 className="text-xl font-bold tracking-tight">{activeTab}</h1>
          
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A]/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-500">API: Operational</span>
            </div>

            {/* Theme Toggle */}
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
            
            {/* --- TOP ROW BENTO GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Portfolio Value Card (Spans 2 columns) */}
              <motion.div variants={item} className="lg:col-span-2 relative bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-colors duration-700" />
                
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Balance</p>
                <div className="flex items-end gap-4 mb-8">
                  <h2 className="text-5xl font-black tracking-tighter">$124,532.00</h2>
                  <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-sm font-bold mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +2.4% (24h)
                  </div>
                </div>

                {/* Abstract Line Chart SVG */}
                <div className="h-32 w-full mt-auto relative">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,100 L0,50 Q20,40 40,60 T80,40 T120,70 T160,30 T200,50 T240,20 T280,40 T320,10 T360,30 T400,10 L400,100 Z" fill="url(#chart-grad)" />
                    <motion.path 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                      d="M0,50 Q20,40 40,60 T80,40 T120,70 T160,30 T200,50 T240,20 T280,40 T320,10 T360,30 T400,10" 
                      fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" 
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Developer API Metrics */}
              <motion.div variants={item} className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">API Usage</p>
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/5 dark:bg-white/10 rounded-md">Billing Cycle</span>
                </div>
                
                <div className="my-auto">
                  <p className="text-4xl font-black tracking-tight mb-1">1.2M <span className="text-xl text-zinc-500 font-medium">/ 2M</span></p>
                  <p className="text-xs text-zinc-500 font-mono">Requests this month</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                  <button className="w-full text-center text-sm font-bold text-black dark:text-white hover:opacity-70 transition-opacity">
                    Upgrade Infrastructure →
                  </button>
                </div>
              </motion.div>
            </div>

            {/* --- BOTTOM ROW BENTO GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activity Table (Spans 2 columns) */}
              <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Execution Log</h3>
                  <button className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">View All</button>
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
                      {recentActivity.map((tx, i) => (
                        <tr key={tx.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-[10px]">{tx.asset[0]}</div>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Quick Actions / Watchlist */}
              <motion.div variants={item} className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="font-bold text-lg mb-6">Market Watch</h3>
                
                <div className="space-y-4 mb-auto">
                  {watchlist.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer">
                      <span className="font-bold font-mono text-sm">{item.ticker}</span>
                      <div className="text-right">
                        <p className="font-mono text-sm">{item.price}</p>
                        <p className={`text-[10px] font-bold ${item.up ? 'text-emerald-500' : 'text-rose-500'}`}>{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Action Button */}
                <button className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Launch Execution Terminal
                </button>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}