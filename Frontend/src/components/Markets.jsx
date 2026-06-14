import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from "socket.io-client";
import ThemeToggle from "./ThemeToggle";

// ─── Socket (singleton outside component to avoid re-connects) ───────────────
const socket = io("http://localhost:2222", {
  transports: ["websocket"],
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
});

// ─── Asset metadata (used as seed / fallback until live data arrives) ─────────
const ASSET_META = [
  // Crypto
  { symbol: "BTC/USD",      ticker: "BTC",       name: "Bitcoin",             type: "Crypto",   icon: "₿" },
  { symbol: "ETH/USD",      ticker: "ETH",       name: "Ethereum",            type: "Crypto",   icon: "Ξ" },
  { symbol: "SOL/USD",      ticker: "SOL",       name: "Solana",              type: "Crypto",   icon: "◎" },
  { symbol: "XRP/USD",      ticker: "XRP",       name: "Ripple",              type: "Crypto",   icon: "✕" },
  { symbol: "BNB/USD",      ticker: "BNB",       name: "BNB",                 type: "Crypto",   icon: "B" },
  { symbol: "ADA/USD",      ticker: "ADA",       name: "Cardano",             type: "Crypto",   icon: "₳" },
  // US Stocks
  { symbol: "AAPL",         ticker: "AAPL",      name: "Apple Inc.",          type: "Stocks",   icon: "" },
  { symbol: "TSLA",         ticker: "TSLA",      name: "Tesla Inc.",          type: "Stocks",   icon: "T" },
  { symbol: "MSFT",         ticker: "MSFT",      name: "Microsoft",           type: "Stocks",   icon: "M" },
  { symbol: "GOOGL",        ticker: "GOOGL",     name: "Alphabet",            type: "Stocks",   icon: "G" },
  { symbol: "AMZN",         ticker: "AMZN",      name: "Amazon",              type: "Stocks",   icon: "A" },
  { symbol: "NVDA",         ticker: "NVDA",      name: "NVIDIA",              type: "Stocks",   icon: "N" },
  // Indian Stocks
  { symbol: "RELIANCE:NSE", ticker: "RELIANCE",  name: "Reliance Industries", type: "Stocks",   icon: "R" },
  { symbol: "TCS:NSE",      ticker: "TCS",       name: "Tata Consultancy",    type: "Stocks",   icon: "T" },
  { symbol: "INFY:NSE",     ticker: "INFY",      name: "Infosys Ltd",         type: "Stocks",   icon: "I" },
  { symbol: "HDFCBANK:NSE", ticker: "HDFCBANK",  name: "HDFC Bank",           type: "Stocks",   icon: "H" },
  // Forex
  { symbol: "EUR/USD",      ticker: "EUR/USD",   name: "Euro / Dollar",       type: "Forex",    icon: "€" },
  { symbol: "GBP/USD",      ticker: "GBP/USD",   name: "British Pound",       type: "Forex",    icon: "£" },
  { symbol: "USD/JPY",      ticker: "USD/JPY",   name: "Dollar / Yen",        type: "Forex",    icon: "¥" },
  { symbol: "USD/INR",      ticker: "USD/INR",   name: "Dollar / Rupee",      type: "Forex",    icon: "₹" },
  // Commodities
  { symbol: "XAU/USD",      ticker: "GOLD",      name: "Gold",                type: "Commodity",icon: "Au" },
  { symbol: "XAG/USD",      ticker: "SILVER",    name: "Silver",              type: "Commodity",icon: "Ag" },
  { symbol: "WTI/USD",      ticker: "OIL",       name: "Crude Oil (WTI)",     type: "Commodity",icon: "🛢" },
];

// Build lookup by symbol
const META_BY_SYMBOL = {};
ASSET_META.forEach(a => { META_BY_SYMBOL[a.symbol] = a; });

// ─── Tiny Sparkline component ─────────────────────────────────────────────────
function Sparkline({ data = [], positive = true, width = 80, height = 32 }) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke={positive ? "#10b981" : "#ef4444"} strokeWidth="1.5" />
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={positive ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

// ─── Format helpers ────────────────────────────────────────────────────────────
function fmtPrice(price, ticker) {
  if (!price && price !== 0) return "—";
  const p = parseFloat(price);
  // Forex and some commodities need more decimals
  const isForex = ticker && ticker.includes("/") && !ticker.includes("USD/INR");
  if (isForex) return p.toFixed(4);
  if (p < 1) return p.toFixed(4);
  if (p < 100) return p.toFixed(2);
  return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChange(pct) {
  if (pct === null || pct === undefined) return "—";
  const n = parseFloat(pct);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Markets() {
  const [assets, setAssets]           = useState(() =>
    ASSET_META.map(m => ({ ...m, price: null, changePct: null, flash: null, history: [] }))
  );
  const [viewMode, setViewMode]       = useState("list");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [connected, setConnected]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sortBy, setSortBy]           = useState("default"); // default | price | change | name
  const [sortDir, setSortDir]         = useState("desc");

  const flashTimers = useRef({});

  // ── Socket effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    const timers = flashTimers.current;
    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Full snapshot on connect
    socket.on("snapshot", (snapshotArr) => {
      setAssets(prev => {
        const map = {};
        snapshotArr.forEach(s => { map[s.symbol] = s; });
        return prev.map(a => {
          const s = map[a.symbol];
          if (!s) return a;
          return {
            ...a,
            price:     s.price,
            changePct: s.changePct,
            history:   s.price ? [s.price] : []
          };
        });
      });
      setLastUpdated(Date.now());
    });

    // Individual price-update
    socket.on("price-update", (data) => {
      const { symbol, price, changePct } = data;

      setAssets(prev => prev.map(a => {
        if (a.symbol !== symbol) return a;

        // Track sparkline history (last 30 ticks)
        const newHistory = [...(a.history || []), price].slice(-30);

        // Flash colour
        const wasHigher = a.price != null && price > a.price;
        const wasLower  = a.price != null && price < a.price;
        const flash     = wasHigher ? "up" : wasLower ? "down" : null;

        // Clear previous flash timer
        if (timers[symbol]) {
          clearTimeout(timers[symbol]);
        }

        return { ...a, price, changePct, history: newHistory, flash };
      }));

      // Clear flash after 800ms
      timers[symbol] = setTimeout(() => {
        setAssets(prev => prev.map(a =>
          a.symbol === symbol ? { ...a, flash: null } : a
        ));
      }, 800);

      setLastUpdated(Date.now());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("snapshot");
      socket.off("price-update");
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // ── Dark mode ──────────────────────────────────────────────────────────────

  // ── Filter + sort + search ─────────────────────────────────────────────────
  const filteredAssets = assets
    .filter(a => {
      if (activeFilter !== "All" && a.type !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.ticker.toLowerCase().includes(q) ||
          a.symbol.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "default") return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "price") return ((a.price ?? 0) - (b.price ?? 0)) * dir;
      if (sortBy === "change") return ((a.changePct ?? 0) - (b.changePct ?? 0)) * dir;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      return 0;
    });

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  // ── Ticker tape data ────────────────────────────────────────────────────────
  const tickerItems = assets.filter(a => a.price != null).slice(0, 12);

  // ── Summary stats ───────────────────────────────────────────────────────────
  const liveCount  = assets.filter(a => a.price != null).length;
  const gainers    = assets.filter(a => (a.changePct ?? 0) > 0).length;
  const losers     = assets.filter(a => (a.changePct ?? 0) < 0).length;

  // ── Animation variants ──────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.04 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit:   { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }
  };

  const sortIcon = (col) => {
    if (sortBy !== col) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-emerald-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const typeColors = {
    Crypto:    "text-violet-400 bg-violet-500/10 border-violet-500/20",
    Stocks:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Forex:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Commodity: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/4 dark:bg-emerald-900/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-500/4 dark:bg-blue-900/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-50 px-6 lg:px-10 py-4 flex justify-between items-center border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-white/60 dark:bg-black/60 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs">TX</div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-700 dark:text-zinc-300">MARKETS</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            connected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
            {connected ? "LIVE" : "OFFLINE"}
          </div>

          <ThemeToggle />
          <a href="/TradingTerminal" className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity">
            Terminal →
          </a>
        </div>
      </nav>

      {/* ── TICKER TAPE ── */}
      <div className="relative z-40 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md overflow-hidden flex whitespace-nowrap py-2.5">
        {[0, 1].map(i => (
          <motion.div
            key={i}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
            className="flex shrink-0"
          >
            {(tickerItems.length > 0 ? tickerItems : ASSET_META.slice(0, 8)).map((a) => (
              <span key={a.symbol + i} className="inline-flex items-center gap-2 px-6 text-xs font-mono border-r border-black/5 dark:border-white/5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{a.ticker}</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {a.price ? fmtPrice(a.price, a.ticker) : "…"}
                </span>
                {a.changePct != null && (
                  <span className={parseFloat(a.changePct) >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {fmtChange(a.changePct)}
                  </span>
                )}
              </span>
            ))}
          </motion.div>
        ))}
      </div>

      {/* ── MAIN ── */}
      <main className="relative z-10 px-6 lg:px-10 py-10 max-w-screen-2xl mx-auto">

        {/* Header + Stats Row */}
        <div className="flex flex-wrap justify-between items-start gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-1">
              Live Markets
            </h1>
            <p className="text-zinc-500 text-sm">
              Real-time prices · {liveCount} assets tracked
              {lastUpdated && (
                <span className="ml-2 text-zinc-400 font-mono text-xs">
                  · updated {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex gap-3"
          >
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs text-zinc-500 mb-0.5">Gainers</p>
              <p className="text-lg font-black text-emerald-500">{gainers}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-red-500/8 dark:bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-xs text-zinc-500 mb-0.5">Losers</p>
              <p className="text-lg font-black text-red-500">{losers}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-0.5">Neutral</p>
              <p className="text-lg font-black">{liveCount - gainers - losers}</p>
            </div>
          </motion.div>
        </div>

        {/* Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or ticker…"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                ✕
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
            {["list", "grid"].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  viewMode === v
                    ? "bg-white dark:bg-[#1A1A1A] shadow text-black dark:text-white"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}>
                {v === "list"
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                }
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {["All", "Crypto", "Stocks", "Forex", "Commodity"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeFilter === tab
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* No results */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-24 text-zinc-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No assets match "{searchQuery}"</p>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        <AnimatePresence mode="wait">
          {viewMode === "list" && filteredAssets.length > 0 && (
            <motion.div
              key={"list-" + activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full border border-black/10 dark:border-white/8 rounded-2xl bg-white/60 dark:bg-[#0A0A0A]/70 backdrop-blur-xl overflow-hidden shadow-sm"
            >
              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-black/5 dark:border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <button onClick={() => handleSort("name")} className="col-span-4 lg:col-span-3 text-left hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  Asset {sortIcon("name")}
                </button>
                <div className="col-span-2 hidden lg:block">Type</div>
                <button onClick={() => handleSort("price")} className="col-span-4 lg:col-span-2 text-right hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors w-full">
                  Price {sortIcon("price")}
                </button>
                <button onClick={() => handleSort("change")} className="col-span-4 lg:col-span-2 text-right hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors w-full">
                  24h % {sortIcon("change")}
                </button>
                <div className="col-span-3 hidden lg:block text-right">Trend</div>
              </div>

              {/* Rows */}
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                {filteredAssets.map((asset) => {
                  const isPos = (asset.changePct ?? 0) >= 0;
                  const flashClass =
                    asset.flash === "up"   ? "bg-emerald-500/10" :
                    asset.flash === "down" ? "bg-red-500/10" : "";

                  return (
                    <motion.div
                      variants={itemVariants}
                      key={asset.symbol}
                      onClick={() => setSelectedAsset(asset.symbol === selectedAsset ? null : asset.symbol)}
                      className={`grid grid-cols-12 gap-3 px-6 py-4 items-center border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer group transition-all duration-300 ${flashClass}`}
                    >
                      {/* Asset name */}
                      <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/8 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                          {asset.icon || asset.ticker[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{asset.name}</p>
                          <p className="text-xs text-zinc-400 font-mono">{asset.ticker}</p>
                        </div>
                      </div>

                      {/* Type badge */}
                      <div className="col-span-2 hidden lg:block">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${typeColors[asset.type] || ""}`}>
                          {asset.type}
                        </span>
                      </div>

                      {/* Price */}
                      <div className={`col-span-4 lg:col-span-2 text-right font-mono font-semibold text-sm transition-colors ${
                        asset.flash === "up"   ? "text-emerald-500" :
                        asset.flash === "down" ? "text-red-500" : ""
                      }`}>
                        {asset.price != null ? fmtPrice(asset.price, asset.ticker) : (
                          <span className="opacity-30 animate-pulse">···</span>
                        )}
                      </div>

                      {/* Change % */}
                      <div className={`col-span-4 lg:col-span-2 text-right font-bold text-sm flex justify-end items-center gap-1.5 ${isPos ? "text-emerald-500" : "text-red-500"}`}>
                        {asset.changePct != null ? (
                          <>
                            {isPos
                              ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>
                              : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7"/></svg>
                            }
                            {fmtChange(asset.changePct)}
                          </>
                        ) : (
                          <span className="opacity-30 animate-pulse text-zinc-400">···</span>
                        )}
                      </div>

                      {/* Sparkline */}
                      <div className="col-span-3 hidden lg:flex justify-end">
                        <Sparkline data={asset.history} positive={isPos} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* ── GRID VIEW ── */}
          {viewMode === "grid" && filteredAssets.length > 0 && (
            <motion.div
              key={"grid-" + activeFilter}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
            >
              {filteredAssets.map((asset) => {
                const isPos = (asset.changePct ?? 0) >= 0;
                return (
                  <motion.div
                    variants={itemVariants}
                    key={asset.symbol}
                    className={`relative group bg-white dark:bg-[#0D0D0D] border border-black/10 dark:border-white/8 rounded-2xl p-5 hover:shadow-lg dark:hover:shadow-black/30 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden ${
                      asset.flash === "up"   ? "ring-1 ring-emerald-500/40" :
                      asset.flash === "down" ? "ring-1 ring-red-500/40" : ""
                    }`}
                  >
                    {/* Bg gradient accent */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl ${isPos ? "bg-gradient-to-br from-emerald-500/3 to-transparent" : "bg-gradient-to-br from-red-500/3 to-transparent"}`} />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border mb-2 inline-block ${typeColors[asset.type] || ""}`}>
                          {asset.type}
                        </span>
                        <h3 className="font-black text-base leading-tight">{asset.name}</h3>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{asset.ticker}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-sm bg-black/3 dark:bg-white/5 shrink-0">
                        {asset.icon || asset.ticker[0]}
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="mb-4 h-8">
                      <Sparkline data={asset.history} positive={isPos} width={180} height={32} />
                    </div>

                    {/* Price + Change */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                        <p className={`text-xl font-mono font-bold transition-colors ${
                          asset.flash === "up" ? "text-emerald-500" :
                          asset.flash === "down" ? "text-red-500" : ""
                        }`}>
                          {asset.price != null ? fmtPrice(asset.price, asset.ticker) : <span className="opacity-30 animate-pulse">···</span>}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold ${isPos ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {isPos
                          ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>
                          : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7"/></svg>
                        }
                        {asset.changePct != null ? fmtChange(asset.changePct) : "—"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline notice */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-900/90 text-red-200 text-xs font-bold px-5 py-3 rounded-full shadow-xl border border-red-700/50 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Disconnected from server — attempting to reconnect…
          </motion.div>
        )}
      </main>
    </div>
  );
}
