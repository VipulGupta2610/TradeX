import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTradingAccount } from '../hooks/useTradingAccount';

// --- Mock Watchlist Data ---
const watchlistData = [
  { id: 'WL-1', ticker: 'BTC-PERP', name: 'Bitcoin', type: 'Crypto', price: '$64,230.50', change: '+$1,450.00', changePct: '+2.45%', isUp: true, vol: '3.2B', sparkline: "M0,40 Q10,35 20,40 T40,30 T60,35 T80,10 T100,5" },
  { id: 'WL-2', ticker: 'NVDA', name: 'NVIDIA Corp', type: 'Equities', price: '$875.20', change: '+$34.10', changePct: '+4.12%', isUp: true, vol: '45.1M', sparkline: "M0,50 Q15,40 30,30 T60,20 T80,10 T100,0" },
  { id: 'WL-3', ticker: 'TSLA', name: 'Tesla Inc', type: 'Equities', price: '$175.34', change: '-$3.20', changePct: '-1.80%', isUp: false, vol: '112.4M', sparkline: "M0,10 Q20,15 40,30 T70,40 T100,50" },
  { id: 'WL-4', ticker: 'SOL-PERP', name: 'Solana', type: 'Crypto', price: '$145.20', change: '+$8.40', changePct: '+6.14%', isUp: true, vol: '1.1B', sparkline: "M0,35 Q20,40 40,25 T70,15 T100,10" },
  { id: 'WL-5', ticker: 'EUR/USD', name: 'Euro / US Dollar', type: 'Forex', price: '1.0845', change: '-0.0015', changePct: '-0.14%', isUp: false, vol: '850M', sparkline: "M0,20 Q20,10 40,25 T70,45 T100,40" },
  { id: 'WL-6', ticker: 'AAPL', name: 'Apple Inc', type: 'Equities', price: '$189.43', change: '-$1.10', changePct: '-0.58%', isUp: false, vol: '54.2M', sparkline: "M0,20 Q25,15 50,30 T75,25 T100,35" },
  { id: 'WL-7', ticker: 'ETH-PERP', name: 'Ethereum', type: 'Crypto', price: '$3,450.80', change: '+$45.20', changePct: '+1.32%', isUp: true, vol: '1.8B', sparkline: "M0,30 Q20,35 40,20 T70,25 T100,10" },
  { id: 'WL-8', ticker: 'GOLD', name: 'Gold Futures', type: 'Commodities', price: '$2,340.10', change: '+$12.40', changePct: '+0.53%', isUp: true, vol: '124K', sparkline: "M0,45 Q20,40 40,30 T70,20 T100,15" },
];

export default function Watchlist() {
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [symbolInput, setSymbolInput] = useState('');
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const { watchlist, quotes, addToWatchlist, removeFromWatchlist } = useTradingAccount(user?._id);
  const watchlistData = watchlist.map(item => {
    const quote = quotes[item.symbol] || {};
    const changePct = Number(quote.changePct || 0);
    return {
      id: item._id || item.symbol,
      ticker: item.symbol,
      name: item.name || quote.name || item.symbol,
      type: item.type === 'Stocks' ? 'Equities' : item.type,
      price: `₹${Number(quote.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      change: `₹${Math.abs((Number(quote.price || 0) - Number(quote.prevPrice || 0))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      changePct: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
      isUp: changePct >= 0,
      vol: 'Live',
      sparkline: changePct >= 0 ? "M0,40 Q20,35 40,28 T70,20 T100,8" : "M0,10 Q20,18 40,25 T70,38 T100,45"
    };
  });
  const handleAdd = async () => {
    const symbol = symbolInput.trim().toUpperCase();
    if (!symbol || !user?._id) return;
    const quote = quotes[symbol];
    await addToWatchlist({
      symbol,
      name: quote?.name || symbol,
      type: quote?.type || (symbol.includes('/') ? 'Crypto' : 'Stocks'),
      exchange: ''
    });
    setSymbolInput('');
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const filteredList = activeCategory === 'All' 
    ? watchlistData 
    : watchlistData.filter(asset => asset.type === activeCategory);

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 relative">
      
      {/* --- IMMERSIVE ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
        {/* Animated Ambient Orbs */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(circle,rgba(16,185,129,0.06),transparent_60%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(168,85,247,0.05),transparent_60%)] blur-[120px]" 
        />
        <div className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] bg-[radial-gradient(circle,rgba(59,130,246,0.04),transparent_60%)] blur-[100px]" />
        
        {/* Fine Grain Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        
        {/* Technical Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]" />
      </div>

   

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          
          {/* HEADER & METRICS ROW */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Custom Views
              </h2>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Market Radar.</h1>
            </motion.div>

            {/* Top Mover Alert */}
            <motion.div variants={item} className="flex gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2">
              <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 min-w-[220px] shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group flex items-center gap-4">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Top Gainer</p>
                  <p className="text-xl font-black font-mono">SOL-PERP <span className="text-emerald-500 text-sm ml-1">+6.14%</span></p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FILTERS & SEARCH */}
          <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05] backdrop-blur-md overflow-x-auto w-full sm:w-auto scrollbar-hide">
              {['All', 'Crypto', 'Equities', 'Forex', 'Commodities'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={symbolInput} onChange={event => setSymbolInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') handleAdd(); }} type="text" placeholder="Add ticker to watchlist..." className="w-full bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-black/10 dark:border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm" />
              <button onClick={handleAdd} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </motion.div>

          {/* GRID GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredList.map((asset) => (
                <motion.div 
                  key={asset.id}
                  layout
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-6 shadow-xl relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer flex flex-col"
                >
                  {/* Hover Accent Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-inner">
                        {asset.ticker[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight tracking-wide">{asset.ticker}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{asset.name}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromWatchlist(asset.ticker)} className="text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1" title="Remove">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Sparkline Chart */}
                  <div className="w-full h-16 mb-4 mt-auto">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`grad-${asset.id}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={asset.isUp ? "#10b981" : "#f43f5e"} stopOpacity="0.2"/>
                          <stop offset="100%" stopColor={asset.isUp ? "#10b981" : "#f43f5e"} stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <motion.path 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}
                        d={`${asset.sparkline} L100,50 L0,50 Z`} fill={`url(#grad-${asset.id})`}
                      />
                      <motion.path 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                        d={asset.sparkline}
                        fill="none" 
                        stroke={asset.isUp ? "#10b981" : "#f43f5e"} 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0px 4px 6px ${asset.isUp ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'})` }}
                      />
                    </svg>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-black font-mono tracking-tight">{asset.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${asset.isUp ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {asset.changePct}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">{asset.change}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Execution Overlay */}
                  <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <button onClick={() => navigate('/TradingTerminal')} className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      Buy
                    </button>
                    <button onClick={() => navigate('/TradingTerminal')} className="px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                      Sell
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredList.length === 0 && (
            <div className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-[32px] bg-white/10 dark:bg-[#0A0A0A]/30">
              <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <p className="text-lg font-bold text-zinc-400">No assets in this category.</p>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
