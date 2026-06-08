import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from "socket.io-client";

// Mock Market Data

const socket = io("http://localhost:2222");

export default function Markets() {
  const [marketData, setMarketData] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [activeFilter, setActiveFilter] = useState('All');

// Inside your Markets.jsx
  const assetMap = {
    // Cryptos
    "BINANCE:BTCUSDT": { name: "Bitcoin", ticker: "BTC", type: "Crypto" },
    "BINANCE:ETHUSDT": { name: "Ethereum", ticker: "ETH", type: "Crypto" },
    "BINANCE:SOLUSDT": { name: "Solana", ticker: "SOL", type: "Crypto" },
    "BINANCE:XRPUSDT": { name: "Ripple", ticker: "XRP", type: "Crypto" },
    
    // Stocks
    "AAPL": { name: "Apple Inc.", ticker: "AAPL", type: "Stocks" },
    "TSLA": { name: "Tesla Inc.", ticker: "TSLA", type: "Stocks" },
    "MSFT": { name: "Microsoft", ticker: "MSFT", type: "Stocks" },
    "GOOGL": { name: "Alphabet", ticker: "GOOGL", type: "Stocks" },
    "RELIANCE": { name: "Reliance Industries", ticker: "RELIANCE", type: "Stocks" },
    "TCS": { name: "Tata Consultancy", ticker: "TCS", type: "Stocks" },
    "INFY": { name: "Infosys Ltd", ticker: "INFY", type: "Stocks" },
    "HDFCBANK": { name: "HDFC Bank", ticker: "HDFCBANK", type: "Stocks" }
  };

  useEffect(() => {

    socket.on("price-update", (data) => {

  const asset = assetMap[data.symbol];

  if (!asset) return;

  setMarketData((prev) => {

    const existing = prev.find(
      item => item.ticker === asset.ticker
    );

    if (existing) {

      return prev.map(item =>

        item.ticker === asset.ticker

          ? {
              ...item,
              price: Number(data.price).toFixed(2)
            }

          : item

      );

    }

    return [

      ...prev,

      {
        id: Date.now(),
        name: asset.name,
        ticker: asset.ticker,
        price: Number(data.price).toFixed(2),
        change: "Live",
        isPositive: true,
        type: asset.type,
        volume: "-"
      }

    ];

  });

});

    return () => {
      socket.off("price-update");
    };

  }, []);

  // Toggle Tailwind Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const filteredData = activeFilter === 'All'
    ? marketData
    : marketData.filter(item => item.type === activeFilter);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#000000] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-emerald-500/30 overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-zinc-800/40 rounded-full blur-[150px]" />
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/50 dark:bg-black/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs transition-colors">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-800 dark:text-zinc-300">MARKETS</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            )}
          </button>
          <a href="/dashboard" className="px-5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity">
            Terminal
          </a>
        </div>
      </nav>

      {/* INFINITE TICKER TAPE */}
      <div className="relative z-40 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-[#050505]/80 backdrop-blur-md overflow-hidden flex whitespace-nowrap py-3">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex gap-8 px-4 items-center text-xs font-mono font-bold tracking-widest"
        >
          {/* Duplicated for smooth infinite scroll */}
          {[...marketData, ...marketData].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-zinc-500">{item.ticker}</span>
              <span className="text-black dark:text-white">{item.price}</span>
              <span className={item.isPositive ? 'text-emerald-500' : 'text-red-500'}>
                {item.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-[4rem] lg:text-[5.5rem] font-black leading-[0.85] tracking-tighter mb-4">
              GLOBAL
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1px rgba(255,255,255,0.8)' : '1px rgba(0,0,0,0.8)' }}>MARKETS.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-md">
              Real-time infrastructure feeds. Analyze, execute, and scale with absolute precision.
            </p>
          </motion.div>

          {/* Controls: Search & Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
          >
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search markets..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* View Toggle */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1A1A1A] shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#1A1A1A] shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
            </div>
          </motion.div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Crypto', 'Stocks', 'Forex'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === tab
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-black dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/10'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DYNAMIC DATA DISPLAY */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" : "flex flex-col space-y-2"}
          >

            {/* --- LIST VIEW --- */}
            {viewMode === 'list' && (
              <div className="w-full border border-black/10 dark:border-white/10 rounded-[24px] bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-black/5 dark:border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <div className="col-span-4 lg:col-span-3">Asset</div>
                  <div className="col-span-3 hidden lg:block">Type</div>
                  <div className="col-span-4 lg:col-span-2 text-right">Price</div>
                  <div className="col-span-4 lg:col-span-2 text-right">24h Change</div>
                  <div className="col-span-2 text-right hidden lg:block">Volume</div>
                </div>

                {/* Table Body */}
                {filteredData.map((asset) => (
                  <motion.div
                    variants={itemVariants}
                    key={asset.id}
                    className="grid grid-cols-12 gap-4 p-6 items-center border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="col-span-4 lg:col-span-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                        {asset.ticker[0]}
                      </div>
                      <div>
                        <p className="font-bold">{asset.name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{asset.ticker}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden lg:block text-sm text-zinc-500">
                      <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs">{asset.type}</span>
                    </div>
                    <div className="col-span-4 lg:col-span-2 text-right font-mono font-medium">
                      {asset.price}
                    </div>
                    <div className={`col-span-4 lg:col-span-2 text-right font-bold flex justify-end items-center gap-2 ${asset.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {asset.change}
                      {asset.isPositive ?
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> :
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                      }
                    </div>
                    <div className="col-span-2 text-right hidden lg:block text-sm text-zinc-500 font-mono">
                      {asset.volume}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* --- GRID (BENTO) VIEW --- */}
            {viewMode === 'grid' && filteredData.map((asset) => (
              <motion.div
                variants={itemVariants}
                key={asset.id}
                className="relative group bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[24px] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform" />

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 inline-block">
                      {asset.type}
                    </span>
                    <h3 className="font-black text-xl tracking-tight">{asset.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{asset.ticker}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-xs bg-black/5 dark:bg-white/5">
                    {asset.ticker[0]}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-2xl font-mono font-medium">{asset.price}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-sm ${asset.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {asset.isPositive ?
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg> :
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-7-7m7 7l7-7" /></svg>
                    }
                    {asset.change}
                  </div>
                </div>
              </motion.div>
            ))}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}