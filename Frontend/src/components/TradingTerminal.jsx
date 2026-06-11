import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux"
import {Link} from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:2222";
const socket = io(API_BASE);

/* ═══════════════════════════════════════════════════════════════════
   TRADEX PRO v2.0 — Best-in-class Trading Terminal (LIVE DATA)
   Features:
   ✅ Angel One parity: watchlist, chart, indicators, drawing tools,
      depth, option chain, positions, orders, alerts, news
   ✅ New: Multi-layout charts, Market Scanner, Heatmap, AI Analysis,
      Portfolio analytics, Advanced order types, Risk calculator,
      Economic calendar, Screener, Dark/Light theme, Mini charts,
      P&L chart, Trade journal, Smart alerts, Hotkeys
═══════════════════════════════════════════════════════════════════ */

// ── GLOBAL STYLES ────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#0b0e1a; color:#e2e8f0; overflow:hidden; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
  input,textarea,button,select { font-family:'Inter',sans-serif; background:none; border:none; outline:none; cursor:pointer; color:inherit; }
  .mono { font-family:'JetBrains Mono',monospace; }

  /* LEFT TOOLBAR BUTTONS - FIXED: much larger, visible */
  .tool-btn {
    width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center;
    color:#8899bb; border:1px solid transparent; transition:all 0.12s; font-size:13px; cursor:pointer;
    background:transparent; flex-shrink:0;
  }
  .tool-btn:hover { background:rgba(99,130,255,0.15); color:#aec0ff; border-color:rgba(99,130,255,0.25); }
  .tool-active { background:rgba(41,98,255,0.22) !important; color:#7da8ff !important; border-color:rgba(41,98,255,0.45) !important; }

  /* RIGHT PANEL TABS */
  .rp-tab {
    width:100%; min-height:56px; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; border-radius:0; transition:all 0.12s; border-left:3px solid transparent; padding:6px 2px; cursor:pointer;
    color:#94a3b8;
  }
  .rp-tab:hover { background:rgba(99,130,255,0.12); color:#c7d7f4; }
  .rp-tab-active { background:rgba(41,98,255,0.18); border-left-color:#2962ff; color:#7da8ff; }

  /* BUY/SELL */
  .buy-btn { background:linear-gradient(135deg,#089981,#05c79f); color:#fff; font-weight:700; border-radius:5px; font-size:12px; padding:5px 14px; transition:all 0.12s; border:none; cursor:pointer; letter-spacing:0.03em; }
  .buy-btn:hover { background:linear-gradient(135deg,#0ba88f,#08d9ad); box-shadow:0 2px 12px rgba(8,153,129,0.35); }
  .sell-btn { background:linear-gradient(135deg,#f23645,#e02535); color:#fff; font-weight:700; border-radius:5px; font-size:12px; padding:5px 14px; transition:all 0.12s; border:none; cursor:pointer; letter-spacing:0.03em; }
  .sell-btn:hover { background:linear-gradient(135deg,#f5404f,#e53040); box-shadow:0 2px 12px rgba(242,54,69,0.35); }

  /* BADGES */
  .badge-up { color:#089981; font-size:9.5px; font-weight:700; font-family:'JetBrains Mono',monospace; background:rgba(8,153,129,0.1); padding:1px 5px; border-radius:3px; }
  .badge-dn { color:#f23645; font-size:9.5px; font-weight:700; font-family:'JetBrains Mono',monospace; background:rgba(242,54,69,0.1); padding:1px 5px; border-radius:3px; }

  /* WATCHLIST */
  .sym-row { cursor:pointer; transition:all 0.1s; }
  .sym-row:hover { background:rgba(255,255,255,0.03); }
  .sym-row-active { background:rgba(41,98,255,0.08) !important; border-left:2px solid #2962ff !important; }

  /* TABLE */
  .t-head { padding:4px 8px; font-size:9px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid rgba(255,255,255,0.05); white-space:nowrap; }
  .t-row:hover { background:rgba(255,255,255,0.025); }
  .t-cell { padding:5px 8px; font-size:10.5px; color:#94a3b8; white-space:nowrap; }

  /* INDICATORS */
  .ind-chip { display:flex; align-items:center; gap:5px; padding:4px 8px; border-radius:5px; font-size:9.5px; font-weight:600; border:1px solid rgba(255,255,255,0.07); color:#6b7280; transition:all 0.1s; cursor:pointer; }
  .ind-chip:hover { background:rgba(255,255,255,0.05); color:#94a3b8; }
  .ind-on { background:rgba(41,98,255,0.12) !important; border-color:rgba(41,98,255,0.3) !important; color:#60a5fa !important; }

  /* TOGGLE */
  .toggle { width:28px; height:15px; border-radius:8px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; padding:1px; flex-shrink:0; }
  .toggle-on { background:#2962ff; }
  .toggle-off { background:rgba(255,255,255,0.12); }
  .toggle-thumb { width:13px; height:13px; border-radius:50%; background:#fff; transition:transform 0.2s; }

  /* DEPTH ROW */
  .depth-row { padding:4px 10px; border-bottom:1px solid rgba(255,255,255,0.025); overflow:hidden; min-height:26px; }
  .depth-row:hover { background:rgba(255,255,255,0.02); }

  /* SCANNER ROW */
  .scan-row { padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:all 0.1s; }
  .scan-row:hover { background:rgba(41,98,255,0.06); }

  /* AI MESSAGES */
  .ai-msg-bot { background:rgba(255,255,255,0.03); border-radius:10px; border-bottom-left-radius:2px; padding:10px 12px; border:1px solid rgba(255,255,255,0.06); }
  .ai-msg-user { background:rgba(41,98,255,0.12); border-radius:10px; border-bottom-right-radius:2px; padding:8px 12px; margin-left:20px; border:1px solid rgba(41,98,255,0.2); font-size:11.5px; color:#c7d7f4; text-align:right; }

  /* TOAST */
  .toast { background:#1e2335; border-radius:8px; padding:10px 14px; font-size:11.5px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.08); min-width:240px; max-width:340px; animation:slideIn 0.25s ease; }
  @keyframes slideIn { from { transform:translateX(30px); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes fadeUp { from { transform:translateY(8px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .fade-up { animation:fadeUp 0.2s ease; }

  /* SCALPER */
  @keyframes scalperPulse { 0%,100%{box-shadow:0 0 8px rgba(41,98,255,0.4);} 50%{box-shadow:0 0 20px rgba(41,98,255,0.7);} }
  .scalper-pulse { animation:scalperPulse 1.4s infinite; }

  /* DOT ANIMATION */
  @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
  .dot1,.dot2,.dot3 { width:4px;height:4px;border-radius:50%;background:#60a5fa;display:inline-block; }
  .dot1{animation:blink 1.2s infinite;} .dot2{animation:blink 1.2s 0.2s infinite;} .dot3{animation:blink 1.2s 0.4s infinite;}

  /* LIVE DOT */
  @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  .live-dot { animation:livePulse 1.5s ease-in-out infinite; }

  /* HEATMAP cells */
  .hm-cell { border-radius:4px; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:all 0.15s; padding:4px; overflow:hidden; }
  .hm-cell:hover { filter:brightness(1.2); transform:scale(1.02); }

  /* MINI SPARKLINE */
  .sparkline-canvas { display:block; }

  /* PORTFOLIO CHART */
  .portfolio-bar { border-radius:3px 3px 0 0; transition:height 0.3s ease; }

  /* HEADER NAV */
  .nav-tab { padding:0 12px; height:100%; display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:#5a6a8a; border-bottom:2px solid transparent; transition:all 0.12s; cursor:pointer; white-space:nowrap; }
  .nav-tab:hover { color:#8899cc; background:rgba(255,255,255,0.02); }
  .nav-tab-active { color:#7da8ff; border-bottom-color:#2962ff; }

  /* SCREENER */
  .screen-chip { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:600; border:1px solid rgba(255,255,255,0.08); color:#6b7280; cursor:pointer; transition:all 0.12s; }
  .screen-chip:hover { border-color:rgba(41,98,255,0.3); color:#60a5fa; }
  .screen-chip-on { background:rgba(41,98,255,0.14); border-color:rgba(41,98,255,0.35); color:#60a5fa; }

  /* RISK CALC */
  .rc-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:6px 10px; font-size:11.5px; color:#e2e8f0; width:100%; font-family:'JetBrains Mono',monospace; }
  .rc-input:focus { border-color:rgba(41,98,255,0.4); background:rgba(41,98,255,0.04); }

  /* GLOW effects */
  .glow-green { box-shadow:0 0 12px rgba(8,153,129,0.3); }
  .glow-red { box-shadow:0 0 12px rgba(242,54,69,0.3); }
  .glow-blue { box-shadow:0 0 12px rgba(41,98,255,0.3); }
`;

// ── DATA ──────────────────────────────────────────────────────────
function generateCandles(base, n = 500, volatility = 0.015) {
  const out = []; let p = base; const now = Date.now();
  for (let i = n; i >= 0; i--) {
    const drift = (Math.random() - 0.48) * p * volatility;
    const open = p; const close = Math.max(open + drift, open * 0.92);
    const range = Math.abs(drift) + Math.random() * p * 0.006;
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;
    const volume = 50000 + Math.random() * 2000000;
    out.push({ open, high, low, close, volume, time: now - i * 60000 });
    p = close;
  }
  return out;
}

const SYMBOLS = [
  { sym: "AAPL", exch: "NASDAQ", name: "Apple Inc", base: 185, color: "#c084fc", volatility: 0.012, sector: "Tech" },


  { sym: "BTC/USD", exch: "CRYPTO", name: "Bitcoin", base: 65000, color: "#f59e0b", volatility: 0.020, sector: "Crypto" },

  { sym: "XAU/USD", exch: "COMMOD", name: "Gold Spot", base: 2350, color: "#eab308", volatility: 0.010, sector: "Commodity" },

  { sym: "EUR/USD", exch: "FOREX", name: "Euro / Dollar", base: 1.08, color: "#3b82f6", volatility: 0.004, sector: "Forex" },
];

const TF_INTRA = ["1m", "3m", "5m", "10m", "15m", "30m", "1h", "2h", "4h"];
const TF_DAY = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y"];

const TF_MAP = {
  "1m": "1min", "3m": "5min", "5m": "5min", "10m": "15min", "15m": "15min",
  "30m": "30min", "1h": "1h", "2h": "2h", "4h": "4h",
  "1D": "1day", "1W": "1week", "1M": "1month", "3M": "1month", "6M": "1month", "1Y": "1month", "3Y": "1month"
};

const SYM_TO_API = {
  "NIFTY 50": "NIFTY",
  "BTC/USD": "BTCUSDT",
  "ETH/USD": "ETHUSDT",
  "XAU/USD": "GOLD",
  "WTI": "OIL",
};

const BACKEND_TICKER_MAP = {
  "BTC": "BTC/USD",
  "ETH": "ETH/USD",
  "NIFTY": "NIFTY 50",
  "BANKNIFTY": "BANKNIFTY",
  "SENSEX": "SENSEX",
  "GOLD": "XAU/USD",
  "OIL": "WTI",
};

SYMBOLS.forEach(s => {
  if (!SYM_TO_API[s.sym]) SYM_TO_API[s.sym] = s.sym;
  if (!BACKEND_TICKER_MAP[s.sym]) BACKEND_TICKER_MAP[s.sym] = s.sym;
});

async function fetchCandles(sym, interval = "1min", outputsize = 200) {
  const apiSym = SYM_TO_API[sym] || sym;
  try {
    const res = await fetch(
      `${API_BASE}/markets/candles/${encodeURIComponent(apiSym)}?interval=${interval}&outputsize=${outputsize}`
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("[fetchCandles] failed for", sym, e.message);
    return null;
  }
}

async function tradingRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Trading request failed");
  return data;
}

const CHART_TYPES = [
  { id: "candle", label: "Candles", icon: "▥" },
  { id: "heikin", label: "Heikin Ashi", icon: "◈" },
  { id: "bar", label: "OHLC Bars", icon: "☰" },
  { id: "line", label: "Line", icon: "╱" },
  { id: "area", label: "Area", icon: "◺" },
  { id: "baseline", label: "Baseline", icon: "⊟" },
  { id: "renko", label: "Renko", icon: "⊞" },
];

const DRAW_TOOLS = [
  { id: "cursor", svg: "M5 3l14 9-7 1-4 7z", tip: "Cursor (Esc)" },
  { id: "crosshair", svg: "M12 2v20M2 12h20", tip: "Crosshair" },
  { id: "line", svg: "M5 19L19 5", tip: "Trend Line (T)" },
  { id: "ray", svg: "M3 12h18M15 8l4 4-4 4", tip: "Ray" },
  { id: "extended", svg: "M2 12h20M6 8l-4 4 4 4M18 8l4 4-4 4", tip: "Extended Line" },
  { id: "hline", svg: "M3 12h18", tip: "Horizontal Line (H)" },
  { id: "vline", svg: "M12 3v18", tip: "Vertical Line (V)" },
  { id: "arrow", svg: "M5 12h14M15 8l4 4-4 4", tip: "Arrow" },
  { id: "rect", svg: "M3 3h18v18H3z", tip: "Rectangle (R)" },
  { id: "circle", svg: "M12 2a10 10 0 100 20A10 10 0 0012 2z", tip: "Circle" },
  { id: "triangle", svg: "M12 3L3 21h18z", tip: "Triangle" },
  { id: "fib", svg: "M3 6h18M3 10h18M3 14h18M3 18h14", tip: "Fibonacci (F)" },
  { id: "fibcircle", svg: "M12 2a10 10 0 100 20M12 7a5 5 0 100 10", tip: "Fib Circle" },
  { id: "pitchfork", svg: "M12 3v18M5 7l7 4M19 7l-7 4", tip: "Pitchfork" },
  { id: "channel", svg: "M3 6l18 4M3 14l18 4", tip: "Parallel Channel" },
  { id: "measure", svg: "M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3", tip: "Measure" },
  { id: "text", svg: "M4 6h16M4 12h10M4 18h8", tip: "Text (X)" },
  { id: "erase", svg: "M20 20H7L3 16l10-10 7 7-1.5 1.5", tip: "Eraser (Del)" },
];

const INDICATORS_LIST = [
  { id: "ma", label: "MA", params: "(20)", color: "#3b82f6", type: "overlay" },
  { id: "ema", label: "EMA", params: "(9)", color: "#f59e0b", type: "overlay" },
  { id: "ema2", label: "EMA", params: "(21)", color: "#ec4899", type: "overlay" },
  { id: "ema3", label: "EMA", params: "(50)", color: "#84cc16", type: "overlay" },
  { id: "ema200", label: "EMA", params: "(200)", color: "#a78bfa", type: "overlay" },
  { id: "vwap", label: "VWAP", params: "", color: "#8b5cf6", type: "overlay" },
  { id: "bb", label: "BB", params: "(20,2)", color: "#10b981", type: "overlay" },
  { id: "ich", label: "Ichimoku", params: "", color: "#06b6d4", type: "overlay" },
  { id: "psar", label: "PSAR", params: "", color: "#f97316", type: "overlay" },
  { id: "sr", label: "Sup/Res", params: "", color: "#fbbf24", type: "overlay" },
  { id: "rsi", label: "RSI", params: "(14)", color: "#ec4899", type: "sub" },
  { id: "macd", label: "MACD", params: "", color: "#06b6d4", type: "sub" },
  { id: "stoch", label: "Stoch", params: "(14,3)", color: "#f97316", type: "sub" },
  { id: "atr", label: "ATR", params: "(14)", color: "#84cc16", type: "sub" },
  { id: "vol", label: "Volume", params: "", color: "#64748b", type: "vol" },
  { id: "obv", label: "OBV", params: "", color: "#a78bfa", type: "sub" },
  { id: "cci", label: "CCI", params: "(20)", color: "#34d399", type: "sub" },
  { id: "adx", label: "ADX", params: "(14)", color: "#fbbf24", type: "sub" },
  { id: "wpr", label: "%R", params: "(14)", color: "#f87171", type: "sub" },
];

const SCANNER_CRITERIA = [
  "RSI < 30 (Oversold)", "RSI > 70 (Overbought)", "MACD Bullish Cross", "MACD Bearish Cross",
  "Above 20 EMA", "Below 20 EMA", "52W High", "52W Low", "Volume Surge", "Breakout",
  "Squeeze Momentum", "Supertrend Buy", "Supertrend Sell", "Golden Cross", "Death Cross",
];

const HEATMAP_DATA = [
  { sym: "RELIANCE", sector: "Energy", chg: 1.24, mktcap: 195 },
  { sym: "TCS", sector: "IT", chg: -0.45, mktcap: 137 },
  { sym: "HDFCBANK", sector: "Banking", chg: 0.87, mktcap: 125 },
  { sym: "INFY", sector: "IT", chg: -1.12, mktcap: 76 },
  { sym: "ICICIBANK", sector: "Banking", chg: 1.56, mktcap: 84 },
  { sym: "WIPRO", sector: "IT", chg: -0.33, mktcap: 27 },
  { sym: "LT", sector: "Infra", chg: 2.10, mktcap: 52 },
  { sym: "SBIN", sector: "Banking", chg: 0.65, mktcap: 72 },
  { sym: "BAJFINANCE", sector: "NBFC", chg: -0.78, mktcap: 43 },
  { sym: "TATAMOTORS", sector: "Auto", chg: 3.21, mktcap: 38 },
  { sym: "ADANIENT", sector: "Conglom", chg: -2.45, mktcap: 28 },
  { sym: "AXISBANK", sector: "Banking", chg: 0.92, mktcap: 46 },
  { sym: "SUNPHARMA", sector: "Pharma", chg: 1.34, mktcap: 37 },
  { sym: "TITAN", sector: "Consumer", chg: -0.56, mktcap: 29 },
  { sym: "KOTAKBANK", sector: "Banking", chg: 0.14, mktcap: 35 },
  { sym: "M&M", sector: "Auto", chg: 2.76, mktcap: 31 },
  { sym: "POWERGRID", sector: "Utility", chg: 0.44, mktcap: 22 },
  { sym: "NTPC", sector: "Utility", chg: 1.02, mktcap: 20 },
  { sym: "ONGC", sector: "Energy", chg: -0.67, mktcap: 18 },
  { sym: "JSWSTEEL", sector: "Metals", chg: 1.89, mktcap: 16 },
];

const fmt = (p, dec = 2) => { if (p == null || isNaN(p)) return "0.00"; const n = Number(p); if (n > 100000) return n.toLocaleString("en-IN", { maximumFractionDigits: dec }); return n.toFixed(dec); };
const fmtVol = (v) => { if (v >= 1e7) return (v / 1e7).toFixed(2) + "Cr"; if (v >= 1e5) return (v / 1e5).toFixed(2) + "L"; if (v >= 1000) return (v / 1000).toFixed(1) + "K"; return v.toFixed(0); };
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

// ── MARKDOWN ──────────────────────────────────────────────────────
function Markdown({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.75, color: "#cbd5e1" }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <div key={i} style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 12, marginTop: 8, marginBottom: 2 }}>{line.slice(4)}</div>;
        if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 800, color: "#f8fafc", fontSize: 13, marginTop: 10, marginBottom: 3, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 4 }}>{line.slice(3)}</div>;
        if (line.startsWith("# ")) return <div key={i} style={{ fontWeight: 900, color: "#fff", fontSize: 14, marginTop: 12, marginBottom: 4 }}>{line.slice(2)}</div>;
        if (line === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "8px 0" }} />;
        if (line === "") return <div key={i} style={{ height: 5 }} />;
        const parts = line.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
        const isBullet = line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ");
        const content = <span>{parts.map((p, j) => {
          if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} style={{ color: "#e2e8f0", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
          if (p.startsWith("`") && p.endsWith("`")) return <code key={j} style={{ fontFamily: "'JetBrains Mono',monospace", background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>{p.slice(1, -1)}</code>;
          if (p.startsWith("*") && p.endsWith("*")) return <em key={j} style={{ color: "#94a3b8" }}>{p.slice(1, -1)}</em>;
          return <span key={j}>{p}</span>;
        })}</span>;
        if (isBullet) return <div key={i} style={{ paddingLeft: 14, position: "relative", color: "#94a3b8", marginBottom: 3 }}><span style={{ position: "absolute", left: 2, color: "#60a5fa" }}>›</span>{content}</div>;
        return <div key={i} style={{ color: "#94a3b8", marginBottom: 2 }}>{content}</div>;
      })}
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  const colors = { success: "#089981", error: "#f23645", warning: "#f59e0b", info: "#3b82f6" };
  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
  return (
    <div className="toast" style={{ borderLeft: `3px solid ${colors[type] || colors.info}` }}>
      <span style={{ color: colors[type] || colors.info, fontSize: 14, fontWeight: 700 }}>{icons[type] || icons.info}</span>
      <span style={{ color: "#e2e8f0" }}>{message}</span>
    </div>
  );
}

// ── ORDER DIALOG ──────────────────────────────────────────────────
function OrderDialog({ sym, price, side, onClose, onConfirm }) {
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState("MARKET");
  const [limitPrice, setLimitPrice] = useState(fmt(price));
  const [slPrice, setSlPrice] = useState(fmt(side === "BUY" ? price * 0.98 : price * 1.02));
  const [target, setTarget] = useState(fmt(side === "BUY" ? price * 1.03 : price * 0.97));
  const [product, setProduct] = useState("MIS");
  const [validity] = useState("DAY");
  const [useSlTarget, setUseSlTarget] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const val = Number(qty) * Number(orderType === "MARKET" ? price : limitPrice);
  const rr = useSlTarget ? Math.abs((Number(target) - Number(orderType === "MARKET" ? price : limitPrice)) / Math.abs(Number(slPrice) - Number(orderType === "MARKET" ? price : limitPrice))) : 0;
  const submitOrder = async () => {
    if (!Number.isFinite(Number(qty)) || Number(qty) <= 0) {
      setSubmitError("Enter a valid quantity");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await onConfirm({
        sym,
        side,
        qty: Number(qty),
        orderType,
        price: orderType === "MARKET" ? price : Number(limitPrice),
        marketPrice: price,
        product,
        validity
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)" }}>
      <div style={{ width: 380, background: "#141824", border: `1px solid ${side === "BUY" ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)"}`, borderRadius: 14, overflow: "hidden", boxShadow: `0 24px 64px rgba(0,0,0,0.7)` }}>
        <div style={{ padding: "14px 18px", background: side === "BUY" ? "rgba(8,153,129,0.1)" : "rgba(242,54,69,0.1)", borderBottom: `1px solid ${side === "BUY" ? "rgba(8,153,129,0.2)" : "rgba(242,54,69,0.2)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: side === "BUY" ? "#089981" : "#f23645" }}>{side} {sym}</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>LTP: ₹{fmt(price)} · {new Date().toLocaleTimeString()}</div>
          </div>
          <button onClick={onClose} style={{ color: "#6b7280", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["MIS", "CNC", "NRML"].map(p => (
              <button key={p} onClick={() => setProduct(p)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, fontSize: 10.5, fontWeight: 700, border: `1px solid ${product === p ? "rgba(41,98,255,0.5)" : "rgba(255,255,255,0.07)"}`, background: product === p ? "rgba(41,98,255,0.12)" : "transparent", color: product === p ? "#7da8ff" : "#6b7280" }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["MARKET", "LIMIT", "SL", "SL-M"].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 10, fontWeight: 700, border: `1px solid ${orderType === t ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`, background: orderType === t ? "rgba(255,255,255,0.1)" : "transparent", color: orderType === t ? "#f1f5f9" : "#6b7280" }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Quantity</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setQty(v => String(Math.max(1, Number(v) - 1)))} style={{ width: 22, height: 28, borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 16 }}>−</button>
                <input value={qty} onChange={e => setQty(e.target.value)} type="number" min="1" style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "4px 6px", fontSize: 12, color: "#f1f5f9", textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }} />
                <button onClick={() => setQty(v => String(Number(v) + 1))} style={{ width: 22, height: 28, borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 16 }}>+</button>
              </div>
            </div>
            {orderType !== "MARKET" && <div>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Limit Price</div>
              <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} type="number" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "5px 8px", fontSize: 12, color: "#f1f5f9", fontFamily: "'JetBrains Mono',monospace" }} />
            </div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className={`toggle ${useSlTarget ? "toggle-on" : "toggle-off"}`} onClick={() => setUseSlTarget(v => !v)}><div className="toggle-thumb" style={{ transform: useSlTarget ? "translateX(13px)" : "translateX(0)" }} /></div>
            <span style={{ fontSize: 10.5, color: "#6b7280", fontWeight: 600 }}>SL & Target</span>
            {useSlTarget && rr > 0 && <span style={{ fontSize: 9.5, color: rr >= 2 ? "#089981" : "#f59e0b", fontWeight: 700, marginLeft: "auto" }}>R:R = 1:{rr.toFixed(1)}</span>}
          </div>
          {useSlTarget && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "#f23645", marginBottom: 4, fontWeight: 600 }}>Stop Loss</div>
              <input value={slPrice} onChange={e => setSlPrice(e.target.value)} type="number" style={{ width: "100%", background: "rgba(242,54,69,0.05)", border: "1px solid rgba(242,54,69,0.2)", borderRadius: 4, padding: "5px 8px", fontSize: 12, color: "#f87171", fontFamily: "'JetBrains Mono',monospace" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#089981", marginBottom: 4, fontWeight: 600 }}>Target</div>
              <input value={target} onChange={e => setTarget(e.target.value)} type="number" style={{ width: "100%", background: "rgba(8,153,129,0.05)", border: "1px solid rgba(8,153,129,0.2)", borderRadius: 4, padding: "5px 8px", fontSize: 12, color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }} />
            </div>
          </div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: "#6b7280" }}>Est. Value</span>
            <span className="mono" style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 12 }}>₹{val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
          {submitError && <div style={{ fontSize: 10.5, color: "#f87171", padding: "7px 9px", borderRadius: 5, background: "rgba(242,54,69,0.08)", border: "1px solid rgba(242,54,69,0.18)" }}>{submitError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={submitting} className="sell-btn" style={{ flex: 1, padding: "9px 0", fontSize: 12, borderRadius: 6, opacity: submitting ? 0.55 : 1 }} onClick={onClose}>Cancel</button>
            <button disabled={submitting} className={side === "BUY" ? "buy-btn" : "sell-btn"} style={{ flex: 2, padding: "9px 0", fontSize: 13, borderRadius: 6, opacity: submitting ? 0.65 : 1 }} onClick={submitOrder}>
              {submitting ? "PLACING..." : `${side} ${qty} ${sym}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ALERT DIALOG ──────────────────────────────────────────────────
function AlertDialog({ sym, price, onClose, onSet }) {
  const [ap, setAp] = useState(fmt(price));
  const [cond, setCond] = useState("PRICE_ABOVE");
  const [note, setNote] = useState("");
  const [alertType, setAlertType] = useState("ONCE");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)" }}>
      <div style={{ width: 320, background: "#141824", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 56px rgba(0,0,0,0.65)" }}>
        <div style={{ padding: "14px 16px", background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#f59e0b" }}>⊕ Set Alert · {sym}</div>
          <button onClick={onClose} style={{ color: "#6b7280", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Condition</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[["PRICE_ABOVE", "Price Above"], ["PRICE_BELOW", "Price Below"], ["PCT_CHANGE", "% Change"], ["VOLUME_SURGE", "Vol Surge"]].map(([v, l]) => (
                <button key={v} onClick={() => setCond(v)} style={{ padding: "5px 0", borderRadius: 4, fontSize: 10, fontWeight: 600, border: `1px solid ${cond === v ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`, background: cond === v ? "rgba(245,158,11,0.1)" : "transparent", color: cond === v ? "#f59e0b" : "#6b7280" }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Alert Price</div>
            <input value={ap} onChange={e => setAp(e.target.value)} type="number" className="rc-input" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Alert Type</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["ONCE", "EVERY", "CLOSING"].map(t => (
                <button key={t} onClick={() => setAlertType(t)} style={{ flex: 1, padding: "4px 0", borderRadius: 4, fontSize: 9.5, fontWeight: 600, border: `1px solid ${alertType === t ? "rgba(41,98,255,0.4)" : "rgba(255,255,255,0.07)"}`, background: alertType === t ? "rgba(41,98,255,0.1)" : "transparent", color: alertType === t ? "#7da8ff" : "#6b7280" }}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Note (optional)</div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." className="rc-input" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#e2e8f0", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "7px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280", fontSize: 11 }}>Cancel</button>
            <button onClick={() => { onSet({ sym, price: Number(ap), condition: cond, alertType, note }); onClose(); }} style={{ flex: 2, padding: "7px 0", borderRadius: 5, background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", fontWeight: 700, fontSize: 11 }}>Set Alert</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RISK CALCULATOR ───────────────────────────────────────────────
function RiskCalc({ price, onClose }) {
  const [capital, setCapital] = useState("100000");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState(fmt(price));
  const [sl, setSl] = useState(fmt(price * 0.98));
  const [target, setTarget] = useState(fmt(price * 1.03));
  const riskAmt = Number(capital) * Number(risk) / 100;
  const slDiff = Math.abs(Number(entry) - Number(sl));
  const qty = slDiff > 0 ? Math.floor(riskAmt / slDiff) : 0;
  const tgtDiff = Math.abs(Number(target) - Number(entry));
  const rr = slDiff > 0 ? tgtDiff / slDiff : 0;
  const invest = qty * Number(entry);
  const potProfit = qty * tgtDiff;
  const maxLoss = qty * slDiff;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)" }}>
      <div style={{ width: 360, background: "#141824", border: "1px solid rgba(99,130,255,0.3)", borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
        <div style={{ padding: "14px 16px", background: "rgba(99,130,255,0.08)", borderBottom: "1px solid rgba(99,130,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#7da8ff" }}>⚖ Risk Calculator</div>
          <button onClick={onClose} style={{ color: "#6b7280", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Capital (₹)", capital, setCapital], ["Risk %", risk, setRisk], ["Entry", entry, setEntry], ["Stop Loss", sl, setSl], ["Target", target, setTarget]].map(([l, v, s]) => (
              <div key={l}>
                <div style={{ fontSize: 9.5, color: "#6b7280", marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                <input value={v} onChange={e => s(e.target.value)} type="number" className="rc-input" />
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["Position Size", qty + " shares", "#60a5fa"], ["Investment", `₹${invest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, "#94a3b8"], ["Risk:Reward", `1 : ${rr.toFixed(2)}`, rr >= 2 ? "#089981" : rr >= 1.5 ? "#f59e0b" : "#f23645"], ["Max Loss", `₹${maxLoss.toFixed(0)}`, "#f23645"], ["Pot. Profit", `₹${potProfit.toFixed(0)}`, "#089981"], ["Risk Amt", `₹${riskAmt.toFixed(0)}`, "#f59e0b"]].map(([l, v, c]) => (
              <div key={l}>
                <div style={{ fontSize: 9, color: "#4b5563", marginBottom: 2, textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          {rr >= 2 && <div style={{ textAlign: "center", fontSize: 10, color: "#089981", fontWeight: 600 }}>✓ Good Risk:Reward Ratio</div>}
          {rr < 1 && rr > 0 && <div style={{ textAlign: "center", fontSize: 10, color: "#f23645", fontWeight: 600 }}>⚠ Poor Risk:Reward — consider adjusting</div>}
          <button onClick={onClose} style={{ padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 11 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── MINI SPARKLINE ────────────────────────────────────────────────
function Sparkline({ data, color, width = 60, height = 20 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c || !data?.length) return;
    const ctx = c.getContext("2d");
    const DPR = window.devicePixelRatio || 1;
    c.width = width * DPR; c.height = height * DPR;
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, width, height);
    const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * width, y: height - (((v - mn) / rng) * (height - 4) + 2) }));
    ctx.strokeStyle = color || "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    // Fill
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath();
    ctx.fillStyle = (color || "#3b82f6") + "22"; ctx.fill();
  }, [data, color, width, height]);
  return <canvas ref={ref} className="sparkline-canvas" style={{ width, height }} />;
}

// ── MAIN TERMINAL ─────────────────────────────────────────────────
export default function TradingTerminal() {
  // Candle store
  const [candleStore, setCandleStore] = useState(() => {
    const s = {};
    SYMBOLS.forEach(sym => { s[sym.sym] = generateCandles(sym.base, 600, sym.volatility); });
    return s;
  });

  const selector = useSelector(state => state?.auth?.user)
  const userId = selector?._id;
  // console.log(selector)
  const [accountBalance, setAccountBalance] = useState(selector?.virtualBalance ?? 0);
  // console.log(selector)

  // State
  const [activeSym, setActiveSym] = useState(SYMBOLS[0]);
  const [tfMode, setTfMode] = useState("intra");
  const [tf, setTf] = useState("5m");
  const [ct, setCt] = useState("candle");
  const [tool, setTool] = useState("cursor");
  const [dColor, setDColor] = useState("#2962ff");
  const [activeInds, setActiveInds] = useState(["vol", "ema", "rsi"]);
  const [showIndPanel, setShowIndPanel] = useState(false);
  const [draws, setDraws] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [rightPanel, setRightPanel] = useState("watchlist");
  const [bottomPanel, setBottomPanel] = useState("pos");
  const [grid, setGrid] = useState(true);
  const [logScale, setLogScale] = useState(false);
  const [symSearch, setSymSearch] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([{ role: "assistant", text: "## 🤖 TradEx AI\n\nPowered by Claude — your intelligent trading co-pilot.\n\n**Try asking:**\n- `Analyse NIFTY 50` — full technical analysis\n- `Scan for breakouts` — market scanner\n- `Risk for 100 shares at ₹2500 SL ₹2450` — position sizing\n- `Explain Ichimoku` — education\n- `Best indicator for trending market` — strategy\n- `News sentiment for RELIANCE` — news analysis\n\n*⚠ Not financial advice. For educational purposes only.*" }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [instantOrders, setInstantOrders] = useState(true);
  const [scalperMode, setScalerMode] = useState(false);
  const [viewOffset, setViewOffset] = useState(0);
  const [barsVisible, setBarsVisible] = useState(120);
  const isPanning = useRef(false);
  const panStart = useRef(null);
  const panOffsetStart = useRef(0);
  const [mainView, setMainView] = useState("chart");
  const [scanFilter, setScanFilter] = useState("RSI < 30 (Oversold)");
  const [heatmapBy, setHeatmapBy] = useState("chg");
  const [journalEntries, setJournalEntries] = useState([
    { id: 1, date: "2026-06-07", sym: "RELIANCE", side: "BUY", qty: 5, entry: 2850, exit: 2920, pnl: 350, note: "Breakout above resistance. Held for 2 days.", rating: 4 },
    { id: 2, date: "2026-06-06", sym: "TCS", side: "SELL", qty: 3, entry: 3780, exit: 3820, pnl: -120, note: "Stopped out. Should have waited for confirmation.", rating: 2 },
    { id: 3, date: "2026-06-05", sym: "INFY", side: "BUY", qty: 10, entry: 1780, exit: 1840, pnl: 600, note: "EMA crossover played out well.", rating: 5 },
  ]);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [multiChart, setMultiChart] = useState(false);

  const cvs = useRef(null);
  const raf = useRef(null);
  const chatEndRef = useRef(null);
  const pricesRef = useRef({});
  const ordersRef = useRef([]);
  const processingOrders = useRef(false);

  // Price state
  const [prices, setPrices] = useState(() => {
    const p = {};
    SYMBOLS.forEach(s => { p[s.sym] = { price: s.base, prevPrice: s.base, chg: 0, chgPct: 0 }; });
    return p;
  });
  const [xhair, setXhair] = useState(null);
  const [hoverC, setHoverC] = useState(null);

  // Positions & orders
  const [positions, setPositions] = useState([
    { sym: "RELIANCE", exch: "NSE", qty: 5, avg: 2850.00, side: "long" },
    { sym: "TCS", exch: "NSE", qty: 3, avg: 3820.00, side: "long" },
    { sym: "INFY", exch: "NSE", qty: 10, avg: 1780.00, side: "long" },
    { sym: "HDFCBANK", exch: "NSE", qty: 8, avg: 1650.00, side: "long" },
  ]);
  const [orders, setOrders] = useState([
    { id: "ORD001", sym: "INFY", exch: "NSE", type: "Limit", side: "BUY", qty: 10, price: 1800, status: "OPEN", time: "09:15", product: "MIS" },
    { id: "ORD002", sym: "HDFCBANK", exch: "NSE", type: "SL-M", side: "SELL", qty: 5, price: 1670, status: "OPEN", time: "10:22", product: "CNC" },
    { id: "ORD003", sym: "SBIN", exch: "NSE", type: "Market", side: "BUY", qty: 50, price: 0, status: "COMPLETE", time: "11:05", product: "MIS" },
    { id: "ORD004", sym: "TCS", exch: "NSE", type: "Limit", side: "BUY", qty: 2, price: 3700, status: "COMPLETE", time: "12:30", product: "CNC" },
  ]);

  const applyTradingState = useCallback(data => {
    if (Array.isArray(data.positions)) setPositions(data.positions);
    if (Array.isArray(data.orders)) setOrders(data.orders);
    if (Number.isFinite(Number(data.balance))) setAccountBalance(Number(data.balance));
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
  }, []);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    const eventName = `order-update:${userId}`;
    const receiveState = data => {
      if (active) applyTradingState(data);
    };

    tradingRequest(`/user/Orders/${userId}`)
      .then(receiveState)
      .catch(error => addToast(error.message, "error"));

    socket.on(eventName, receiveState);
    return () => {
      active = false;
      socket.off(eventName, receiveState);
    };
  }, [userId, selector?.virtualBalance, applyTradingState, addToast]);

  useEffect(() => {
    if (!userId) return undefined;

    const timer = setInterval(async () => {
      if (processingOrders.current) return;
      const symbols = [...new Set(
        ordersRef.current.filter(order => order.status === "OPEN").map(order => order.sym)
      )];
      if (symbols.length === 0) return;

      processingOrders.current = true;
      try {
        for (const symbol of symbols) {
          const marketPrice = pricesRef.current[symbol]?.price;
          if (!Number.isFinite(Number(marketPrice)) || Number(marketPrice) <= 0) continue;
          const state = await tradingRequest(`/user/Orders/process/${userId}`, {
            method: "POST",
            body: JSON.stringify({ symbol, marketPrice })
          });
          applyTradingState(state);
        }
      } catch (error) {
        console.warn("[orders] live processing failed:", error.message);
      } finally {
        processingOrders.current = false;
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [userId, applyTradingState]);

  // ── LIVE DATA SYNC ───────────────────────────────────────────────

  useEffect(() => {
    socket.on("snapshot", (data) => {
      setPrices(prev => {
        const next = { ...prev };
        data.forEach(item => {
          const sym = BACKEND_TICKER_MAP[item.ticker] || item.ticker;
          if (sym) {
            next[sym] = {
              price: item.price,
              prevPrice: item.prevPrice ?? item.price,
              chgPct: item.changePct ?? 0,
              chg: item.price - (item.prevPrice ?? item.price),
            };
          }
        });
        return next;
      });
    });

    socket.on("price-update", quote => {
      const sym = BACKEND_TICKER_MAP[quote.ticker] || quote.ticker;

      setPrices(prev => ({
        ...prev,
        [sym]: {
          price: quote.price,
          prevPrice: quote.prevPrice ?? quote.price,
          chgPct: quote.changePct ?? 0,
          chg: quote.price - (quote.prevPrice ?? quote.price),
        }
      }));

      // Update last candle
      setCandleStore(prev => {
        if (!prev[sym]) return prev;
        const candles = [...prev[sym]];
        if (candles.length === 0) return prev;
        const last = { ...candles[candles.length - 1] };
        const livePrice = Number(quote.price);
        last.close = livePrice;
        last.high = Math.max(last.high, livePrice);
        last.low = Math.min(last.low, livePrice);
        last.volume = (last.volume || 0) + 100;
        candles[candles.length - 1] = last;
        return { ...prev, [sym]: candles };
      });
    });

    return () => {
      socket.off("snapshot");
      socket.off("price-update");
    };
  }, []);

  // ── CANDLE GENERATION INTERVAL ───────────────────────────────────
  useEffect(() => {
    const intervalMap = {
      "1m": 60000, "3m": 180000, "5m": 300000,
      "10m": 600000, "15m": 900000, "30m": 1800000, "1h": 3600000
    };
    const duration = intervalMap[tf] || 60000;

    const timer = setInterval(() => {
      setCandleStore(prev => {
        const symbol = activeSym.sym;
        if (!prev[symbol]?.length) return prev;
        const candles = [...prev[symbol]];
        const last = candles[candles.length - 1];
        candles.push({
          open: last.close,
          high: last.close,
          low: last.close,
          close: last.close,
          volume: 0,
          time: Date.now()
        });
        return { ...prev, [symbol]: candles.slice(-1000) };
      });
    }, duration);

    return () => clearInterval(timer);
  }, [activeSym.sym, tf]);

  // ── FETCH HISTORICAL DATA ────────────────────────────────────────
  useEffect(() => {
    const loadCandles = async () => {
      const interval = TF_MAP[tf] || "1min";
      const data = await fetchCandles(activeSym.sym, interval, 200);

      if (data && data.values && Array.isArray(data.values) && data.values.length > 0) {
        const candles = data.values
          .map(v => ({
            open: Number(v.open),
            high: Number(v.high),
            low: Number(v.low),
            close: Number(v.close),
            volume: Number(v.volume) || 0,
            time: new Date(v.datetime).getTime()
          }))
          .filter(c => !isNaN(c.open))
          .sort((a, b) => a.time - b.time);

        if (candles.length > 0) {
          setCandleStore(prev => ({ ...prev, [activeSym.sym]: candles }));

          const last = candles[candles.length - 1];
          setPrices(prev => {
            if (!prev[activeSym.sym]?.price) {
              return {
                ...prev,
                [activeSym.sym]: {
                  price: last.close,
                  prevPrice: last.open,
                  chgPct: ((last.close - last.open) / last.open) * 100,
                  chg: last.close - last.open
                }
              };
            }
            return prev;
          });
          return;
        }
      }
      console.log("[loadCandles] Using initial seed data for", activeSym.sym);
    };

    loadCandles();
  }, [activeSym.sym, tf]);

  // Derivations
  const activePrice = prices[activeSym.sym]?.price || activeSym.base;
  const activeChg = prices[activeSym.sym]?.chg || 0;
  const activeChgPct = prices[activeSym.sym]?.chgPct || 0;
  const isUp = activeChgPct >= 0;
  const totalPnl = useMemo(() => positions.reduce((s, p) => {
    const lv = prices[p.sym] || { price: p.avg };
    return s + (lv.price - p.avg) * p.qty * (p.side === "short" ? -1 : 1);
  }, 0), [positions, prices]);
  const filtSym = useMemo(() => SYMBOLS.filter(s => !symSearch || s.sym.toLowerCase().includes(symSearch.toLowerCase()) || s.name.toLowerCase().includes(symSearch.toLowerCase())), [symSearch]);

  // ── INDICATOR COMPUTATION ─────────────────────────────────────────
  const computeMA = (data, period) => data.map((_, i) => i < period - 1 ? null : data.slice(i - period + 1, i + 1).reduce((a, x) => a + x.close, 0) / period);
  const computeEMA = (data, period) => { const k = 2 / (period + 1); let e = data[0]?.close || 0; return data.map(c => { e = c.close * k + e * (1 - k); return e; }); };
  const computeRSI = (data, period = 14) => data.map((_, i) => { if (i < period) return null; let g = 0, l = 0; for (let j = i - period + 1; j <= i; j++) { const d = data[j].close - data[j - 1].close; d > 0 ? g += d : l -= d; } return l === 0 ? 100 : 100 - 100 / (1 + g / l); });
  const computeVWAP = (data) => { let cv = 0, vol = 0; return data.map(c => { const tp = (c.high + c.low + c.close) / 3; cv += tp * c.volume; vol += c.volume; return vol ? cv / vol : tp; }); };
  const computeBB = (data, p = 20, std = 2) => { const ma = computeMA(data, p); return data.map((_, i) => { if (i < p - 1) return { mid: null, up: null, dn: null }; const sl = data.slice(i - p + 1, i + 1); const m = ma[i]; const sd = Math.sqrt(sl.reduce((a, x) => a + (x.close - m) ** 2, 0) / p); return { mid: m, up: m + std * sd, dn: m - std * sd }; }); };

  // ── DRAW CHART ────────────────────────────────────────────────────
  const drawChart = useCallback(() => {
    const el = cvs.current; if (!el) return;
    const ctx = el.getContext("2d");
    const DPR = window.devicePixelRatio || 1;
    const W = el.offsetWidth, H = el.offsetHeight;
    if (el.width !== W * DPR || el.height !== H * DPR) { el.width = W * DPR; el.height = H * DPR; ctx.scale(DPR, DPR); }
    ctx.clearRect(0, 0, W, H);

    const allCandles = candleStore[activeSym.sym] || [];
    if (!allCandles.length) return;

    let data = allCandles;
    if (ct === "heikin") {
      data = allCandles.map((c, i) => {
        const C = (c.open + c.high + c.low + c.close) / 4;
        const O = i > 0 ? (allCandles[i - 1].open + allCandles[i - 1].close) / 2 : (c.open + c.close) / 2;
        return { ...c, open: O, close: C, high: Math.max(c.high, O, C), low: Math.min(c.low, O, C) };
      });
    }

    const HAS_VOL = activeInds.includes("vol");
    const HAS_RSI = activeInds.includes("rsi");
    const HAS_MACD = activeInds.includes("macd");
    const HAS_STOCH = activeInds.includes("stoch");
    const HAS_ATR = activeInds.includes("atr");
    const HAS_OBV = activeInds.includes("obv");
    const HAS_CCI = activeInds.includes("cci");
    const HAS_ADX = activeInds.includes("adx");
    const HAS_WPR = activeInds.includes("wpr");
    const subPanels = [HAS_RSI, HAS_MACD, HAS_STOCH, HAS_ATR, HAS_OBV, HAS_CCI, HAS_ADX, HAS_WPR].filter(Boolean).length;
    const VOL_H = HAS_VOL ? 70 : 0;
    const SUB_H = 80;
    const MAIN_H = H - VOL_H - subPanels * SUB_H;
    const PT = 28, RP = 78, LP = 4;
    const chartW = W - RP - LP;

    const maxBars = Math.min(barsVisible, data.length);
    const startIdx = Math.max(0, data.length - maxBars - viewOffset);
    const endIdx = Math.max(1, data.length - viewOffset);
    const vis = data.slice(startIdx, endIdx);
    if (!vis.length) return;

    const highs = vis.map(c => c.high), lows = vis.map(c => c.low);
    let maxP = Math.max(...highs), minP = Math.min(...lows);
    const pad = (maxP - minP) * 0.07;
    maxP += pad; minP -= pad;
    if (maxP === minP) { maxP += 1; minP -= 1; }
    const pRng = maxP - minP;
    const cW = chartW / vis.length;
    const bW = Math.max(Math.min(cW * 0.72, 14), 1);

    const toY = p => {
      if (logScale) { const logMin = Math.log(minP), logMax = Math.log(maxP); return PT + (1 - (Math.log(p) - logMin) / (logMax - logMin)) * (MAIN_H - PT - 2); }
      return PT + (1 - (p - minP) / pRng) * (MAIN_H - PT - 2);
    };
    const fromY = y => minP + (1 - (y - PT) / (MAIN_H - PT - 2)) * pRng;

    // BG
    ctx.fillStyle = "#0f1117"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#131722"; ctx.fillRect(0, 0, W, MAIN_H + VOL_H);

    // GRID
    if (grid) {
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
      const rows = 8;
      for (let r = 0; r <= rows; r++) { const y = PT + (r / rows) * (MAIN_H - PT - 2); ctx.beginPath(); ctx.moveTo(LP, y); ctx.lineTo(W - RP, y); ctx.stroke(); }
      const cols = Math.min(8, vis.length);
      for (let c = 0; c <= cols; c++) { const x = LP + (c / cols) * chartW; ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, MAIN_H + VOL_H); ctx.stroke(); }
    }

    // PRICE LABELS
    ctx.fillStyle = "#374151"; ctx.font = "9px 'JetBrains Mono',monospace"; ctx.textAlign = "right";
    for (let r = 0; r <= 6; r++) {
      const p = minP + (r / 6) * pRng;
      const y = toY(p);
      if (y > PT && y < MAIN_H) { ctx.fillText(fmt(p), W - RP + 74, y + 3); }
    }

    // TIME LABELS
    ctx.textAlign = "center"; ctx.fillStyle = "#374151"; ctx.font = "8px 'JetBrains Mono',monospace";
    const labelStep = Math.max(1, Math.round(vis.length / 8));
    vis.forEach((c, i) => {
      if (i % labelStep === 0) {
        const d = new Date(c.time);
        const label = tfMode === "intra" ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}` : `${d.getDate()}/${d.getMonth() + 1}`;
        ctx.fillText(label, LP + (i + 0.5) * cW, MAIN_H + VOL_H - 4);
      }
    });

    // VWAP
    if (activeInds.includes("vwap")) {
      const vv = computeVWAP(vis);
      ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      vv.forEach((v, i) => { const x = LP + (i + 0.5) * cW, y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke(); ctx.setLineDash([]);
    }

    // BOLLINGER BANDS
    if (activeInds.includes("bb")) {
      const bb = computeBB(vis);
      ["up", "mid", "dn"].forEach((k, ki) => {
        ctx.strokeStyle = ki === 1 ? "#10b981" : "rgba(16,185,129,0.4)"; ctx.lineWidth = ki === 1 ? 1 : 0.8;
        if (ki !== 1) ctx.setLineDash([3, 3]);
        ctx.beginPath();
        bb.forEach((b, i) => { if (b[k] == null) return; const x = LP + (i + 0.5) * cW, y = toY(b[k]); i === 0 || bb[i - 1][k] == null ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.stroke(); ctx.setLineDash([]);
      });
      // Fill
      ctx.fillStyle = "rgba(16,185,129,0.04)"; ctx.beginPath();
      const validBB = bb.map((b, i) => ({ ...b, x: LP + (i + 0.5) * cW })).filter(b => b.up != null);
      if (validBB.length > 1) {
        validBB.forEach(b => ctx.lineTo(b.x, toY(b.up)));
        [...validBB].reverse().forEach(b => ctx.lineTo(b.x, toY(b.dn)));
        ctx.closePath(); ctx.fill();
      }
    }

    // MA lines
    const maMap = { ma: [computeMA(vis, 20), "#3b82f6", 1.2], ema: [computeEMA(vis, 9), "#f59e0b", 1.2], ema2: [computeEMA(vis, 21), "#ec4899", 1.2], ema3: [computeEMA(vis, 50), "#84cc16", 1], ema200: [computeEMA(vis, 200), "#a78bfa", 1] };
    Object.entries(maMap).forEach(([id, [vals, color, lw]]) => {
      if (!activeInds.includes(id)) return;
      ctx.strokeStyle = color; ctx.lineWidth = lw;
      ctx.beginPath();
      vals.forEach((v, i) => { if (v == null) return; const x = LP + (i + 0.5) * cW, y = toY(v); (!i || vals[i - 1] == null) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
    });

    // PSAR
    if (activeInds.includes("psar")) {
      const STEP = 0.02, MAX_AF = 0.2; let bull = true, ep = vis[0].low, af = STEP, psar = vis[0].high;
      vis.forEach((c, i) => {
        if (i === 0) return;
        const x = LP + (i + 0.5) * cW, y = toY(psar);
        ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        psar = bull ? psar + af * (ep - psar) : psar - af * (psar - ep);
        if (bull) { if (c.close < psar) { bull = false; psar = ep; ep = c.low; af = STEP; } else { if (c.high > ep) { ep = c.high; af = Math.min(af + STEP, MAX_AF); } } }
        else { if (c.close > psar) { bull = true; psar = ep; ep = c.high; af = STEP; } else { if (c.low < ep) { ep = c.low; af = Math.min(af + STEP, MAX_AF); } } }
      });
    }

    // CANDLES / LINE / AREA / BAR
    if (ct === "line" || ct === "area") {
      const pts = vis.map((c, i) => ({ x: LP + (i + 0.5) * cW, y: toY(c.close) }));
      if (ct === "area") {
        const grad = ctx.createLinearGradient(0, PT, 0, MAIN_H);
        grad.addColorStop(0, activeSym.color + "50"); grad.addColorStop(1, activeSym.color + "05");
        ctx.fillStyle = grad; ctx.beginPath();
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, MAIN_H - 4); ctx.lineTo(pts[0].x, MAIN_H - 4); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = activeSym.color; ctx.lineWidth = 1.8; ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else {
      vis.forEach((c, i) => {
        const x = LP + i * cW; const mid = x + cW / 2;
        const isUp = c.close >= c.open;
        const bull = "#089981", bear = "#f23645";
        if (ct === "bar") {
          ctx.strokeStyle = isUp ? bull : bear; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(mid, toY(c.high)); ctx.lineTo(mid, toY(c.low)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(mid - bW / 2, toY(c.open)); ctx.lineTo(mid, toY(c.open)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(mid, toY(c.close)); ctx.lineTo(mid + bW / 2, toY(c.close)); ctx.stroke();
        } else if (ct === "baseline") {
          const base = toY((maxP + minP) / 2);
          ctx.strokeStyle = isUp ? bull : bear; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(mid, toY(c.high)); ctx.lineTo(mid, toY(c.low)); ctx.stroke();
          ctx.fillStyle = toY(c.close) < base ? "rgba(8,153,129,0.6)" : "rgba(242,54,69,0.6)";
          ctx.fillRect(x + (cW - bW) / 2, Math.min(toY(c.close), base), bW, Math.abs(toY(c.close) - base));
        } else {
          // Standard candle
          ctx.strokeStyle = isUp ? bull : bear; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(mid, toY(c.high)); ctx.lineTo(mid, toY(c.low)); ctx.stroke();
          const oy = toY(c.open), cy = toY(c.close);
          const bodyH = Math.max(Math.abs(cy - oy), 1);
          ctx.fillStyle = isUp ? bull : bear;
          ctx.fillRect(x + (cW - bW) / 2, Math.min(oy, cy), bW, bodyH);
          if (!isUp) { ctx.strokeStyle = bear; ctx.lineWidth = 0.5; ctx.strokeRect(x + (cW - bW) / 2, Math.min(oy, cy), bW, bodyH); }
        }
      });
    }

    // VOLUME
    if (HAS_VOL) {
      const maxV = Math.max(...vis.map(c => c.volume)) || 1;
      const VY = MAIN_H;
      vis.forEach((c, i) => {
        const x = LP + i * cW;
        const vh = (c.volume / maxV) * VOL_H * 0.85;
        ctx.fillStyle = c.close >= c.open ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)";
        ctx.fillRect(x + (cW - bW) / 2, VY + VOL_H - vh, bW, vh);
      });
      ctx.fillStyle = "#374151"; ctx.font = "bold 8px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
      ctx.fillText("VOL", LP + 4, VY + 10);
    }

    // SUB PANELS
    let subY = MAIN_H + VOL_H;

    const drawSubPanel = (label, color, vals, levels = [], unit = "") => {
      const ST = subY; const endY = subY + SUB_H;
      ctx.fillStyle = "#0e1117"; ctx.fillRect(0, ST, W, SUB_H);
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ST); ctx.lineTo(W, ST); ctx.stroke();
      ctx.fillStyle = "#374151"; ctx.font = "bold 8px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
      ctx.fillText(label, LP + 4, ST + 11);
      const nonNull = vals.filter(v => v != null);
      if (!nonNull.length) { subY = endY; return; }
      const mn = Math.min(...nonNull), mx = Math.max(...nonNull), rng = mx - mn || 1;
      const sTY = v => ST + 14 + (1 - (v - mn) / rng) * (SUB_H - 22);
      levels.forEach(({ v, col }) => {
        const y = sTY(v);
        ctx.strokeStyle = col; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(LP, y); ctx.lineTo(W - RP, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(100,120,150,0.6)"; ctx.textAlign = "right"; ctx.font = "7.5px 'JetBrains Mono',monospace";
        ctx.fillText(v, W - 2, y + 3);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath();
      vals.forEach((v, i) => { if (v == null) return; const x = LP + (i + 0.5) * cW, y = sTY(v); (!i || vals[i - 1] == null) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
      const last = nonNull[nonNull.length - 1];
      ctx.fillStyle = color + "22";
      ctx.fillRect(W - RP, ST, RP - 1, SUB_H);
      ctx.fillStyle = color; ctx.font = "bold 8px 'JetBrains Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText(last.toFixed(1), W - RP + (RP - 1) / 2, ST + SUB_H / 2 + 3);
      subY = endY;
    };

    if (HAS_RSI) { const rsi = computeRSI(vis); drawSubPanel("RSI(14)", "#ec4899", rsi, [{ v: 70, col: "rgba(242,54,69,0.35)" }, { v: 50, col: "rgba(255,255,255,0.08)" }, { v: 30, col: "rgba(8,153,129,0.35)" }]); }
    if (HAS_MACD) {
      const emaFn = (d, p) => { const k = 2 / (p + 1); let e = d[0]; return d.map(v => { e = v * k + e * (1 - k); return e; }); };
      const cl = vis.map(c => c.close); const e12 = emaFn(cl, 12), e26 = emaFn(cl, 26);
      const macdL = e12.map((v, i) => v - e26[i]); const sig = emaFn(macdL, 9);
      const ST = subY; const endY = subY + SUB_H;
      ctx.fillStyle = "#0e1117"; ctx.fillRect(0, ST, W, SUB_H);
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, ST); ctx.lineTo(W, ST); ctx.stroke();
      ctx.fillStyle = "#374151"; ctx.font = "bold 8px 'JetBrains Mono',monospace"; ctx.textAlign = "left"; ctx.fillText("MACD(12,26,9)", LP + 4, ST + 11);
      const hist = macdL.map((v, i) => v - sig[i]); const maxH = Math.max(...hist.map(Math.abs)) || 1; const mid2 = ST + SUB_H / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.moveTo(LP, mid2); ctx.lineTo(W - RP, mid2); ctx.stroke();
      hist.forEach((h, i) => { const x = LP + i * cW, bh = Math.abs(h / maxH) * (SUB_H / 2 - 14); ctx.fillStyle = h >= 0 ? "rgba(8,153,129,0.7)" : "rgba(242,54,69,0.7)"; ctx.fillRect(x + cW * 0.15, h >= 0 ? mid2 - bh : mid2, cW * 0.7, bh); });
      const mn2 = Math.min(...macdL), mx2 = Math.max(...macdL), rng2 = mx2 - mn2 || 1; const sTY2 = v => ST + 14 + (1 - (v - mn2) / rng2) * (SUB_H - 22);
      ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 1.2; ctx.beginPath(); macdL.forEach((v, i) => { const x = LP + (i + 0.5) * cW, y = sTY2(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.beginPath(); sig.forEach((v, i) => { const x = LP + (i + 0.5) * cW, y = sTY2(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
      subY = endY;
    }
    if (HAS_STOCH) {
      const per = 14, sma = 3;
      const kv = vis.map((_, i) => { if (i < per - 1) return null; const sl = vis.slice(i - per + 1, i + 1); const hi = Math.max(...sl.map(c => c.high)), lo = Math.min(...sl.map(c => c.low)); return hi === lo ? 50 : (vis[i].close - lo) / (hi - lo) * 100; });
      const dv = kv.map((_, i) => i < sma - 1 || kv[i] == null ? null : kv.slice(i - sma + 1, i + 1).reduce((a, x) => a + (x || 0), 0) / sma);
      drawSubPanel("Stoch(14,3)", "#f97316", kv, [{ v: 80, col: "rgba(242,54,69,0.3)" }, { v: 20, col: "rgba(8,153,129,0.3)" }]);
    }
    if (HAS_ATR) {
      const atrV = vis.map((c, i) => i === 0 ? c.high - c.low : Math.max(c.high - c.low, Math.abs(c.high - vis[i - 1].close), Math.abs(c.low - vis[i - 1].close)));
      const per = 14; const atrSm = atrV.map((_, i) => i < per ? null : atrV.slice(i - per + 1, i + 1).reduce((a, b) => a + b, 0) / per);
      drawSubPanel("ATR(14)", "#84cc16", atrSm);
    }
    if (HAS_OBV) { let obv = 0; const obvV = vis.map((c, i) => { obv += i === 0 ? c.volume : (c.close >= vis[i - 1].close ? c.volume : -c.volume); return obv; }); drawSubPanel("OBV", "#a78bfa", obvV); }
    if (HAS_CCI) { const per = 20; const cciV = vis.map((_, i) => { if (i < per - 1) return null; const sl = vis.slice(i - per + 1, i + 1); const tp = sl.map(c => (c.high + c.low + c.close) / 3); const mn = tp.reduce((a, b) => a + b, 0) / per; const md = tp.reduce((a, b) => a + Math.abs(b - mn), 0) / per; return md === 0 ? 0 : (tp[tp.length - 1] - mn) / (0.015 * md); }); drawSubPanel("CCI(20)", "#34d399", cciV, [{ v: 100, col: "rgba(242,54,69,0.3)" }, { v: 0, col: "rgba(255,255,255,0.08)" }, { v: -100, col: "rgba(8,153,129,0.3)" }]); }
    if (HAS_ADX) {
      const per = 14; const adxV = vis.map((_, i) => { if (i < per) return null; let pdm = 0, ndm = 0, tr = 0; for (let j = i - per + 1; j <= i; j++) { const h = vis[j].high - vis[j - 1 || 0].high, l = vis[j - 1 || 0].low - vis[j].low; pdm += Math.max(h, 0); ndm += Math.max(l, 0); tr += Math.max(vis[j].high - vis[j].low, Math.abs(vis[j].high - (vis[j - 1 || 0].close || 0)), Math.abs(vis[j].low - (vis[j - 1 || 0].close || 0))); } const di = tr ? 100 * Math.abs(pdm - ndm) / tr : 0; return di; });
      drawSubPanel("ADX(14)", "#fbbf24", adxV, [{ v: 25, col: "rgba(251,191,36,0.3)" }]);
    }
    if (HAS_WPR) { const per = 14; const wV = vis.map((_, i) => { if (i < per - 1) return null; const sl = vis.slice(i - per + 1, i + 1); const hi = Math.max(...sl.map(c => c.high)), lo = Math.min(...sl.map(c => c.low)); return hi === lo ? -50 : ((hi - vis[i].close) / (hi - lo)) * (-100); }); drawSubPanel("%R(14)", "#f87171", wV, [{ v: -20, col: "rgba(242,54,69,0.3)" }, { v: -80, col: "rgba(8,153,129,0.3)" }]); }

    // LIVE PRICE LINE
    const lastC = vis[vis.length - 1]?.close;
    if (lastC) {
      const cy = toY(lastC);
      if (cy > PT && cy < MAIN_H) {
        const isUpL = lastC >= (vis[vis.length - 2]?.close || lastC);
        ctx.strokeStyle = isUpL ? "rgba(8,153,129,0.7)" : "rgba(242,54,69,0.7)";
        ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(LP, cy); ctx.lineTo(W - RP, cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = isUpL ? "#089981" : "#f23645";
        ctx.fillRect(W - RP, cy - 10, RP - 1, 20);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 9.5px 'JetBrains Mono',monospace";
        ctx.fillText(fmt(lastC), W - RP + (RP - 1) / 2, cy + 3);
      }
    }

    // ALERT LINES
    alerts.filter(a => a.sym === activeSym.sym).forEach(a => {
      if (a.price < minP || a.price > maxP) return;
      const ay = toY(a.price);
      ctx.strokeStyle = "rgba(245,158,11,0.7)"; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(LP, ay); ctx.lineTo(W - RP, ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(245,158,11,0.15)"; ctx.fillRect(LP, ay - 1, chartW, 2);
      ctx.fillStyle = "#f59e0b"; ctx.font = "bold 8.5px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
      ctx.fillText(`⊕ ${fmt(a.price)}`, LP + 4, ay - 3);
    });

    // CROSSHAIR
    if (xhair && xhair.y < MAIN_H) {
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(xhair.x, PT); ctx.lineTo(xhair.x, MAIN_H + VOL_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LP, xhair.y); ctx.lineTo(W - RP, xhair.y); ctx.stroke();
      ctx.setLineDash([]);
      const hp = fromY(xhair.y);
      if (hp > 0 && xhair.y > PT && xhair.y < MAIN_H) {
        ctx.fillStyle = "#1e2840"; ctx.fillRect(W - RP, xhair.y - 10, RP - 1, 20);
        ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.strokeRect(W - RP, xhair.y - 10, RP - 1, 20);
        ctx.fillStyle = "#c9d5ef"; ctx.textAlign = "center"; ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.fillText(fmt(hp), W - RP + (RP - 1) / 2, xhair.y + 3);
      }
      if (xhair.x > LP && xhair.x < W - RP) {
        const idx = Math.floor((xhair.x - LP) / cW);
        if (idx >= 0 && idx < vis.length) {
          const d = new Date(vis[idx].time);
          const label = tfMode === "intra" ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}` : `${d.getDate()}/${d.getMonth() + 1}`;
          ctx.fillStyle = "#1e2840"; ctx.fillRect(xhair.x - 30, MAIN_H + VOL_H - 18, 60, 15);
          ctx.fillStyle = "#c9d5ef"; ctx.textAlign = "center"; ctx.font = "9px 'JetBrains Mono',monospace";
          ctx.fillText(label, xhair.x, MAIN_H + VOL_H - 8);
        }
      }
    }

    // OHLCV HEADER
    if (hoverC) {
      const up = hoverC.close >= hoverC.open;
      ctx.fillStyle = "rgba(11,14,26,0.95)"; ctx.fillRect(LP, 0, W, 24);
      ctx.font = "bold 10px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
      const items = [["O", hoverC.open, "#94a3b8"], ["H", hoverC.high, "#089981"], ["L", hoverC.low, "#f23645"], ["C", hoverC.close, up ? "#089981" : "#f23645"], ["V", fmtVol(hoverC.volume), "#6b7280"]];
      let xx = LP + 6;
      items.forEach(([l, v, c]) => {
        ctx.fillStyle = "#4b5563"; ctx.fillText(l + " ", xx, 16); xx += ctx.measureText(l + " ").width;
        ctx.fillStyle = c; const vs = typeof v === "string" ? v : fmt(v); ctx.fillText(vs + "  ", xx, 16); xx += ctx.measureText(vs + "  ").width;
      });
    }

    // DRAWINGS
    ctx.textAlign = "left";
    draws.forEach(d => {
      ctx.strokeStyle = d.color; ctx.lineWidth = 1.8; ctx.setLineDash([]);
      ctx.shadowColor = d.color + "44"; ctx.shadowBlur = 4;
      if (["line", "ray", "arrow", "extended"].includes(d.type)) {
        ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke();
        if (d.type === "arrow") { const a = Math.atan2(d.y2 - d.y1, d.x2 - d.x1); ctx.beginPath(); ctx.moveTo(d.x2, d.y2); ctx.lineTo(d.x2 - 12 * Math.cos(a - 0.4), d.y2 - 12 * Math.sin(a - 0.4)); ctx.lineTo(d.x2 - 12 * Math.cos(a + 0.4), d.y2 - 12 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fillStyle = d.color; ctx.fill(); }
      } else if (d.type === "hline") {
        ctx.beginPath(); ctx.moveTo(LP, d.y1); ctx.lineTo(W - RP, d.y1); ctx.stroke();
        const hp = fromY(d.y1); ctx.fillStyle = d.color + "cc"; ctx.font = "8.5px 'JetBrains Mono',monospace"; ctx.textAlign = "right"; ctx.fillText(fmt(hp), W - RP - 2, d.y1 - 3);
      } else if (d.type === "vline") {
        ctx.beginPath(); ctx.moveTo(d.x1, PT); ctx.lineTo(d.x1, MAIN_H + VOL_H); ctx.stroke();
      } else if (d.type === "rect") {
        ctx.strokeRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1); ctx.fillStyle = d.color + "10"; ctx.fillRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1);
      } else if (d.type === "circle") {
        const rx = Math.abs(d.x2 - d.x1) / 2, ry = Math.abs(d.y2 - d.y1) / 2; ctx.beginPath(); ctx.ellipse(d.x1 + rx, d.y1 + ry, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = d.color + "08"; ctx.fill();
      } else if (d.type === "triangle") {
        const mx = (d.x1 + d.x2) / 2; ctx.beginPath(); ctx.moveTo(mx, d.y1); ctx.lineTo(d.x1, d.y2); ctx.lineTo(d.x2, d.y2); ctx.closePath(); ctx.stroke(); ctx.fillStyle = d.color + "0a"; ctx.fill();
      } else if (d.type === "fib") {
        const cols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#94a3b8"];
        [0, 0.236, 0.382, 0.5, 0.618, 0.764, 0.786, 1].forEach((lv, li) => {
          const y = d.y1 + (d.y2 - d.y1) * lv; ctx.strokeStyle = cols[li % cols.length] + "99"; ctx.shadowColor = "transparent";
          ctx.beginPath(); ctx.moveTo(Math.min(d.x1, d.x2), y); ctx.lineTo(Math.max(d.x1, d.x2), y); ctx.stroke();
          ctx.fillStyle = cols[li % cols.length] + "cc"; ctx.font = "7.5px 'JetBrains Mono',monospace"; ctx.textAlign = "left";
          ctx.fillText(`${(lv * 100).toFixed(1)}%  ${fmt(fromY(y))}`, Math.min(d.x1, d.x2) + 3, y - 2);
        });
      } else if (d.type === "channel") {
        const dy = d.y2 - d.y1; ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke(); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(d.x1, d.y1 + dy); ctx.lineTo(d.x2, d.y2 + dy); ctx.stroke(); ctx.setLineDash([]);
      } else if (d.type === "measure") {
        ctx.strokeRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1);
        const p1 = fromY(d.y1), p2 = fromY(d.y2); const pct = ((p2 - p1) / p1 * 100).toFixed(2);
        ctx.fillStyle = "rgba(18,24,40,0.9)"; ctx.fillRect((d.x1 + d.x2) / 2 - 44, (d.y1 + d.y2) / 2 - 9, 88, 18);
        ctx.fillStyle = p2 > p1 ? "#089981" : "#f23645"; ctx.font = "bold 9px 'JetBrains Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText(`${pct}%  Δ${fmt(Math.abs(p2 - p1))}`, (d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2 + 4);
      }
      ctx.shadowBlur = 0;
    });

    // INSTANT ORDER BUTTONS
    if (instantOrders && lastC) {
      const cy = toY(lastC);
      if (cy > PT + 24 && cy < MAIN_H - 24) {
        ctx.fillStyle = "rgba(8,153,129,0.88)"; ctx.beginPath(); ctx.roundRect(LP + 4, cy - 22, 80, 18, 3); ctx.fill();
        ctx.fillStyle = "rgba(242,54,69,0.88)"; ctx.beginPath(); ctx.roundRect(LP + 90, cy - 22, 80, 18, 3); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 9px Inter,sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`BUY @ ${fmt(lastC)}`, LP + 44, cy - 10);
        ctx.fillText(`SELL @ ${fmt(lastC)}`, LP + 130, cy - 10);
      }
    }
  }, [candleStore, activeSym, xhair, draws, ct, activeInds, grid, hoverC, instantOrders, barsVisible, viewOffset, logScale, alerts, tfMode]);

  useEffect(() => { const ro = new ResizeObserver(() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(drawChart); }); if (cvs.current) ro.observe(cvs.current); return () => { ro.disconnect(); cancelAnimationFrame(raf.current); }; }, [drawChart]);
  useEffect(() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(drawChart); }, [drawChart]);

  // ── CANVAS EVENTS ─────────────────────────────────────────────────
  const getXY = e => { const r = cvs.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  const onMM = useCallback(e => {
    const { x, y } = getXY(e); setXhair({ x, y });
    const allC = candleStore[activeSym.sym] || [];
    const W = cvs.current.offsetWidth, RP = 78, LP = 4;
    const n = Math.min(barsVisible, allC.length);
    const startIdx = Math.max(0, allC.length - n - viewOffset); const endIdx = Math.max(1, allC.length - viewOffset);
    const vis = allC.slice(startIdx, endIdx); const cW = (W - RP - LP) / vis.length;
    const idx = Math.floor((x - LP) / cW);
    if (idx >= 0 && idx < vis.length) setHoverC(vis[idx]);
    if (isPanning.current && panStart.current) {
      const dx = x - panStart.current; const n2 = Math.min(barsVisible, allC.length); const cW2 = (W - RP - LP) / n2;
      const delta = Math.round(dx / cW2); const newOff = clamp(panOffsetStart.current - delta, 0, allC.length - n2); setViewOffset(newOff);
    }
    if (drawing && drawStart) {
      cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => {
        drawChart(); const ctx2 = cvs.current?.getContext("2d"); if (!ctx2) return;
        ctx2.strokeStyle = dColor; ctx2.lineWidth = 1.5; ctx2.setLineDash([]);
        if (["line", "ray", "arrow", "extended"].includes(tool)) { ctx2.beginPath(); ctx2.moveTo(drawStart.x, drawStart.y); ctx2.lineTo(x, y); ctx2.stroke(); }
        else if (tool === "rect") { ctx2.strokeRect(drawStart.x, drawStart.y, x - drawStart.x, y - drawStart.y); }
        else if (tool === "circle") { const rx = Math.abs(x - drawStart.x) / 2, ry = Math.abs(y - drawStart.y) / 2; ctx2.beginPath(); ctx2.ellipse(drawStart.x + rx, drawStart.y + ry, rx, ry, 0, 0, Math.PI * 2); ctx2.stroke(); }
        else if (["fib", "channel", "measure", "triangle"].includes(tool)) { ctx2.beginPath(); ctx2.moveTo(drawStart.x, drawStart.y); ctx2.lineTo(x, y); ctx2.stroke(); }
      });
    }
  }, [drawChart, candleStore, activeSym, barsVisible, viewOffset, drawing, drawStart, dColor, tool]);

  const onMD = useCallback(e => {
    const { x, y } = getXY(e);
    if (tool === "cursor" || tool === "crosshair") { isPanning.current = true; panStart.current = x; panOffsetStart.current = viewOffset; return; }
    if (tool === "hline") { setDraws(p => [...p, { type: "hline", x1: 0, y1: y, color: dColor }]); return; }
    if (tool === "vline") { setDraws(p => [...p, { type: "vline", x1: x, y1: 0, color: dColor }]); return; }
    if (tool === "erase") { setDraws(p => p.filter(d => { const mx = (d.x1 + (d.x2 || d.x1)) / 2, my = (d.y1 + (d.y2 || d.y1)) / 2; return Math.hypot(mx - x, my - y) > 28; })); return; }
    if (instantOrders && tool === "cursor") {
      const allC = candleStore[activeSym.sym] || []; const lastC = allC[allC.length - 1]?.close || 0;
      if (x >= 4 && x <= 84) { setShowOrderDialog({ side: "BUY", price: lastC }); return; }
      if (x >= 90 && x <= 170) { setShowOrderDialog({ side: "SELL", price: lastC }); return; }
    }
    setDrawing(true); setDrawStart({ x, y });
  }, [tool, dColor, viewOffset, instantOrders, candleStore, activeSym]);

  const onMU = useCallback(e => {
    isPanning.current = false; panStart.current = null;
    if (!drawing || !drawStart) return;
    const { x, y } = getXY(e);
    if (tool !== "cursor" && tool !== "crosshair" && tool !== "hline" && tool !== "vline" && tool !== "erase") {
      const newDraw = { type: tool, x1: drawStart.x, y1: drawStart.y, x2: x, y2: y, color: dColor };
      setDraws(p => [...p, newDraw]);
    }
    setDrawing(false); setDrawStart(null);
  }, [drawing, drawStart, tool, dColor]);

  const onWheel = useCallback(e => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.2 : 0.83;
    setBarsVisible(v => clamp(Math.round(v * factor), 20, 700));
  }, []);

  // AI
  const sendAI = useCallback(async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim(); setAiInput("");
    setAiMessages(p => [...p, { role: "user", text: msg }]);
    setAiLoading(true);
    try {
      const allC = candleStore[activeSym.sym] || [];
      const recent = allC.slice(-20).map(c => ({ o: fmt(c.open), h: fmt(c.high), l: fmt(c.low), c: fmt(c.close) }));
      const rsiVals = allC.slice(-14); let g = 0, l = 0;
      rsiVals.forEach((_, i) => { if (i === 0) return; const d = rsiVals[i].close - rsiVals[i - 1].close; d > 0 ? g += d : l -= d; });
      const rsi = l === 0 ? 100 : Math.round(100 - 100 / (1 + g / l));
      const ema9 = allC.slice(-9).reduce((a, c) => a + c.close, 0) / 9;
      const ema21 = allC.slice(-21).reduce((a, c) => a + c.close, 0) / 21;
      const price = prices[activeSym.sym]?.price || activeSym.base;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are TradEx AI, a professional trading assistant integrated into a trading terminal. You have access to live market data for the active symbol.

Active Symbol: ${activeSym.sym} (${activeSym.name})
Exchange: ${activeSym.exch}
Current Price: ${fmt(price)}
Daily Change: ${prices[activeSym.sym]?.chgPct?.toFixed(2) || 0}%
RSI(14): ${rsi}
EMA9: ${fmt(ema9)}
EMA21: ${fmt(ema21)}
EMA Trend: ${ema9 > ema21 ? "BULLISH (9 EMA > 21 EMA)" : "BEARISH (9 EMA < 21 EMA)"}
Recent OHLC (last 20 candles): ${JSON.stringify(recent.slice(-5))}

Current Portfolio P&L: ₹${fmt(totalPnl)}

Provide concise, actionable analysis. Use bullet points and bold for key levels. Always add ⚠️ "Not financial advice" disclaimer. Format well with markdown.`,
          messages: [...aiMessages.filter(m => m.role !== "assistant" || aiMessages.indexOf(m) > 0).slice(-8).map(m => ({ role: m.role, content: m.text })), { role: "user", content: msg }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "Sorry, I couldn't process that request.";
      setAiMessages(p => [...p, { role: "assistant", text }]);
    } catch (e) {
      setAiMessages(p => [...p, { role: "assistant", text: "⚠️ API connection error. Please check your connection and try again." }]);
    }
    setAiLoading(false);
  }, [aiInput, aiLoading, aiMessages, activeSym, candleStore, prices, totalPnl]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages]);

  const handleOrder = useCallback(async (order) => {
    if (!userId) throw new Error("Please log in to place an order");

    const data = await tradingRequest("/user/Orders", {
      method: "POST",
      body: JSON.stringify({
        userid: userId,
        symbol: order.sym,
        name: activeSym.name,
        exchange: activeSym.exch,
        ordertype: order.orderType,
        side: order.side,
        product: order.product,
        validity: order.validity,
        quantity: order.qty,
        price: order.price,
        marketPrice: order.marketPrice
      })
    });

    applyTradingState(data);
    const executed = data.order?.status === "COMPLETE";
    addToast(
      executed
        ? `${order.side} ${order.qty} ${order.sym} @ ₹${fmt(data.order.price)} executed`
        : `${order.side} ${order.qty} ${order.sym} order placed`,
      executed ? (order.side === "BUY" ? "success" : "error") : "warning"
    );
  }, [userId, activeSym, applyTradingState, addToast]);

  const handleCancelOrder = useCallback(async order => {
    if (!userId) return;
    try {
      const data = await tradingRequest(`/user/Orders/${userId}/${order.id}/cancel`, {
        method: "PATCH"
      });
      applyTradingState(data);
      addToast(`${order.sym} order cancelled`, "warning");
    } catch (error) {
      addToast(error.message, "error");
    }
  }, [userId, applyTradingState, addToast]);

  // Scanner data
  const scannerResults = useMemo(() => SYMBOLS.map(s => {
    const candles = candleStore[s.sym] || [];
    const price = prices[s.sym]?.price || s.base;
    const chgPct = prices[s.sym]?.chgPct || 0;
    const vol = candles.slice(-1)[0]?.volume || 0;
    const avgVol = candles.slice(-20).reduce((a, c) => a + c.volume, 0) / 20 || 1;
    const rsiData = candles.slice(-15); let g = 0, l = 0;
    rsiData.forEach((_, i) => { if (i === 0) return; const d = rsiData[i].close - rsiData[i - 1].close; d > 0 ? g += d : l -= d; });
    const rsi = l === 0 ? 100 : Math.round(100 - 100 / (1 + g / l));
    return { ...s, price, chgPct, rsi, volRatio: vol / avgVol };
  }), [candleStore, prices]);

  // Hotkeys
  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "escape") setTool("cursor");
      if (k === "t") setTool("line");
      if (k === "h") setTool("hline");
      if (k === "v") setTool("vline");
      if (k === "r") setTool("rect");
      if (k === "f") setTool("fib");
      if (k === "x") setTool("text");
      if (k === "delete" || k === "backspace") setDraws(p => p.slice(0, -1));
      if (e.ctrlKey && k === "z") setDraws(p => p.slice(0, -1));
      if (k === "a" && e.ctrlKey) { e.preventDefault(); setShowAI(v => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: "#0b0e1a", overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>
      <style>{STYLES}</style>

      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <div style={{ height: 44, background: "#0d1020", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 12px", gap: 0, flexShrink: 0, zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 16, borderRight: "1px solid rgba(255,255,255,0.07)", marginRight: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#1a3aff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", boxShadow: "0 0 12px rgba(41,98,255,0.4)" }}>TX</div>
       <Link to={"/"}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: "#e2e8f0", letterSpacing: "0.02em" }}>TRADEX PRO</div>
            <div style={{ fontSize: 8, color: "#2962ff", fontWeight: 600, letterSpacing: "0.06em" }}>NEXT GEN TERMINAL</div>
          </div>
       </Link>
        </div>

        {/* Main Nav */}
        {[
          { id: "chart", label: "Chart", icon: "📈" },
          { id: "heatmap", label: "Heatmap", icon: "⬛" },
          { id: "scanner", label: "Scanner", icon: "🔍" },
          { id: "portfolio", label: "Portfolio", icon: "💼" },
          { id: "journal", label: "Journal", icon: "📓" },
          { id: "calendar", label: "Calendar", icon: "📅" },
        ].map(v => (
          <button key={v.id} className={`nav-tab ${mainView === v.id ? "nav-tab-active" : ""}`} onClick={() => setMainView(v.id)}>
            <span style={{ fontSize: 12 }}>{v.icon}</span>{v.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Market Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#089981", display: "block" }} />
            <span style={{ color: "#089981", fontWeight: 600 }}>MARKETS OPEN</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#4b5563", fontFamily: "'JetBrains Mono',monospace" }}>
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          {/* Global indices ticker */}
          <div style={{ display: "flex", gap: 10, fontSize: 10 }}>
            {[{ n: "NIFTY", v: "23,850", c: true }, { n: "SENSEX", v: "78,400", c: true }, { n: "BTC", v: "$65,020", c: false }].map(x => (
              <div key={x.n} style={{ display: "flex", gap: 4 }}>
                <span style={{ color: "#4b5563", fontWeight: 600 }}>{x.n}</span>
                <span className="mono" style={{ color: x.c ? "#089981" : "#f23645", fontWeight: 700 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </div>


        {/* Action buttons */}
   <Link to={`/Dashboard/${userId}`}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowRiskCalc(true)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600, border: "1px solid rgba(99,130,255,0.25)", color: "#7da8ff", background: "rgba(41,98,255,0.08)" }}>⚖ Risk Calc</button>
          <button onClick={() => setShowAlertDialog(true)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600, border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", background: "rgba(245,158,11,0.06)" }}>⊕ Alert</button>
          <button onClick={() => setShowAI(v => !v)} style={{ padding: "4px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, border: `1px solid rgba(41,98,255,${showAI ? 0.5 : 0.25})`, color: showAI ? "#fff" : "#7da8ff", background: showAI ? "linear-gradient(135deg,#2962ff,#7c3aed)" : "rgba(41,98,255,0.08)", transition: "all 0.15s" }}>✦ AI</button>

          {/* User Profile Integration */}
          {selector ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 10, borderLeft: "1px solid rgba(255,255,255,0.1)", marginLeft: 4 }}>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  {selector.name}
                  <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 4, background: "rgba(41,98,255,0.2)", color: "#7da8ff", textTransform: "uppercase" }}>{selector.plan}</span>
                </div>
                <div style={{ fontSize: 10, color: "#089981", fontWeight: 600 }}>₹{accountBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2962ff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(41,98,255,0.3)" }}>
                {selector.name ? selector.name.charAt(0).toUpperCase() : "👤"}
              </div>
            </div>
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>👤</div>
          )}
        </div>
   </Link>
      </div>

      {/* ── CHART TOOLBAR ─────────────────────────────────────────────── */}
      {mainView === "chart" && (
        <div style={{ height: 38, background: "#0f1220", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 6px", gap: 4, flexShrink: 0, overflowX: "auto" }}>
          {/* Symbol search */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, padding: "3px 8px", minWidth: 140, marginRight: 4 }}>
            <span style={{ color: "#4b5563", fontSize: 12 }}>⌕</span>
            <span style={{ fontWeight: 700, fontSize: 11.5, color: "#e2e8f0" }}>{activeSym.sym}</span>
            <span style={{ fontSize: 9, color: "#374151", fontFamily: "'JetBrains Mono',monospace" }}>{activeSym.exch}</span>
          </div>

          {/* Price display */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 10, borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: 15, fontWeight: 800, color: isUp ? "#089981" : "#f23645" }}>{fmt(activePrice)}</span>
            <span className={isUp ? "badge-up" : "badge-dn"}>{isUp ? "▲" : "▼"} {Math.abs(activeChgPct).toFixed(2)}%</span>
            <span className="mono" style={{ fontSize: 10, color: activeChg >= 0 ? "#089981" : "#f23645" }}>{activeChg >= 0 ? "+" : ""}{fmt(activeChg)}</span>
          </div>

          {/* Timeframe */}
          <div style={{ display: "flex", gap: 1, padding: "2px", background: "rgba(255,255,255,0.03)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.05)" }}>
            {["intra", "day"].map(m => (
              <button key={m} onClick={() => { setTfMode(m); setTf(m === "intra" ? "5m" : "1D"); }} style={{ padding: "2px 7px", borderRadius: 3, fontSize: 9.5, fontWeight: 700, background: tfMode === m ? "rgba(255,255,255,0.1)" : "transparent", color: tfMode === m ? "#e2e8f0" : "#4b5563", transition: "all 0.1s" }}>{m === "intra" ? "INTRA" : "DAILY"}</button>
            ))}
          </div>
          {(tfMode === "intra" ? TF_INTRA : TF_DAY).map(t => (
            <button key={t} onClick={() => setTf(t)} style={{ padding: "2px 7px", borderRadius: 3, fontSize: 10, fontWeight: tf === t ? 700 : 500, background: tf === t ? "rgba(41,98,255,0.18)" : "transparent", color: tf === t ? "#7da8ff" : "#4b5563", border: `1px solid ${tf === t ? "rgba(41,98,255,0.35)" : "transparent"}`, transition: "all 0.1s" }}>{t}</button>
          ))}

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 3px" }} />

          {/* Chart type */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowChartTypeMenu(v => !v)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", background: showChartTypeMenu ? "rgba(255,255,255,0.06)" : "transparent" }}>
              <span>{CHART_TYPES.find(c => c.id === ct)?.icon}</span>
              <span>{CHART_TYPES.find(c => c.id === ct)?.label}</span>
              <span style={{ fontSize: 8, opacity: 0.5 }}>▼</span>
            </button>
            {showChartTypeMenu && (
              <div className="fade-up" style={{ position: "absolute", top: 34, left: 0, zIndex: 200, background: "#1a1e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", minWidth: 140 }}>
                {CHART_TYPES.map(c => (
                  <button key={c.id} onClick={() => { setCt(c.id); setShowChartTypeMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "5px 8px", borderRadius: 4, fontSize: 11, fontWeight: ct === c.id ? 700 : 400, color: ct === c.id ? "#7da8ff" : "#94a3b8", background: ct === c.id ? "rgba(41,98,255,0.1)" : "transparent" }}>
                    <span>{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Indicators */}
          <button onClick={() => setShowIndPanel(v => !v)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 4, fontSize: 10.5, fontWeight: 600, border: `1px solid rgba(255,255,255,${showIndPanel ? 0.15 : 0.07})`, color: showIndPanel ? "#7da8ff" : "#6b7280", background: showIndPanel ? "rgba(41,98,255,0.1)" : "transparent" }}>
            ƒ Indicators {activeInds.length > 0 && <span style={{ fontSize: 9, background: "#2962ff", borderRadius: 10, padding: "0 5px", color: "#fff" }}>{activeInds.length}</span>}
          </button>

          <div style={{ flex: 1 }} />

          {/* Quick Buy/Sell */}
          <button className="buy-btn" style={{ padding: "4px 14px", fontSize: 11 }} onClick={() => { console.log("Buy button clicked"); setShowOrderDialog({ side: "BUY", price: activePrice }); }}>B</button>
          <input value={orderQty} onChange={e => setOrderQty(e.target.value)} type="number" min="1" style={{ width: 36, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "3px 6px", fontSize: 11, color: "#f1f5f9", textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }} />
          <button className="sell-btn" style={{ padding: "4px 14px", fontSize: 11 }} onClick={() => { console.log("Sell button clicked"); setShowOrderDialog({ side: "SELL", price: activePrice }); }}>S</button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 3px" }} />

          {/* Options */}
          <button onClick={() => setGrid(v => !v)} className="tool-btn" title="Grid" style={{ color: grid ? "#7da8ff" : "#374151", width: 24, height: 24, fontSize: 11 }}>⊞</button>
          <button onClick={() => setLogScale(v => !v)} className={`tool-btn ${logScale ? "tool-active" : ""}`} title="Log Scale" style={{ width: 28, height: 24, fontSize: 9.5, fontWeight: 700 }}>LOG</button>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9.5, color: "#374151", fontWeight: 600 }}>Instant</span>
            <div className={`toggle ${instantOrders ? "toggle-on" : "toggle-off"}`} onClick={() => setInstantOrders(v => !v)}><div className="toggle-thumb" style={{ transform: instantOrders ? "translateX(13px)" : "translateX(0)" }} /></div>
          </div>
          <button className="tool-btn" onClick={() => setDraws(p => p.slice(0, -1))} title="Undo" style={{ width: 24, height: 24, fontSize: 13 }}>↩</button>
          <button className="tool-btn" onClick={() => setDraws([])} title="Clear All" style={{ width: 24, height: 24, fontSize: 12 }}>🗑</button>
          <button onClick={() => setScalerMode(v => !v)} className={scalperMode ? "scalper-pulse" : ""} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, border: `1px solid ${scalperMode ? "rgba(41,98,255,0.5)" : "rgba(255,255,255,0.07)"}`, background: scalperMode ? "rgba(41,98,255,0.14)" : "transparent", color: scalperMode ? "#60a5fa" : "#6b7280", flexShrink: 0 }}>
            ⚡ {scalperMode ? "SCALPER ON" : "SCALPER"}
          </button>
        </div>
      )}

      {/* ── INDICATOR PANEL ───────────────────────────────────────────── */}
      {showIndPanel && mainView === "chart" && (
        <div className="fade-up" style={{ position: "absolute", top: 82, left: 200, zIndex: 200, background: "#181c2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, width: 340, boxShadow: "0 16px 48px rgba(0,0,0,0.65)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#4b5563", textTransform: "uppercase", marginBottom: 10 }}>Technical Indicators</div>
          {["overlay", "vol", "sub"].map(type => (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 8.5, color: "#374151", fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>{type === "overlay" ? "Overlay" : type === "vol" ? "Volume" : "Oscillators"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                {INDICATORS_LIST.filter(i => i.type === type).map(ind => (
                  <button key={ind.id} className={`ind-chip ${activeInds.includes(ind.id) ? "ind-on" : ""}`} onClick={() => setActiveInds(p => p.includes(ind.id) ? p.filter(x => x !== ind.id) : [...p, ind.id])}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ind.color, flexShrink: 0 }} />
                    {ind.label}{ind.params}
                    {activeInds.includes(ind.id) && <span style={{ marginLeft: "auto", color: "#60a5fa", fontSize: 8 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button onClick={() => { setActiveInds([]); }} style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid rgba(255,255,255,0.07)", color: "#6b7280", fontSize: 10 }}>Clear</button>
            <button onClick={() => setShowIndPanel(false)} style={{ flex: 1, padding: "4px 0", borderRadius: 4, background: "rgba(41,98,255,0.12)", border: "1px solid rgba(41,98,255,0.25)", color: "#7da8ff", fontSize: 10, fontWeight: 600 }}>Done</button>
          </div>
        </div>
      )}

      {/* ── MAIN BODY ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT TOOLBAR ── */}
        {mainView === "chart" && (
          <div style={{ width: 40, background: "#0d1020", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0", gap: 2, flexShrink: 0, overflowY: "auto", zIndex: 5 }}>
            {DRAW_TOOLS.map(t => (
              <button key={t.id} title={t.tip} className={`tool-btn ${tool === t.id ? "tool-active" : ""}`} onClick={() => setTool(t.id)} style={{ width: 32, height: 32 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.svg} /></svg>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
            {["#2962ff", "#089981", "#f23645", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#ffffff", "#64748b"].map(c => (
              <button key={c} onClick={() => setDColor(c)} title={c}
                style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: `2.5px solid ${dColor === c ? "rgba(255,255,255,0.9)" : "transparent"}`, margin: "1.5px 0", boxShadow: dColor === c ? `0 0 8px ${c}` : "" }} />
            ))}
            <div style={{ height: 6 }} />
          </div>
        )}

        {/* ── CHART / MAIN VIEW AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "#0f1117" }}>
          {mainView === "chart" && (
            <>
              {/* Symbol bar */}
              <div style={{ padding: "4px 12px 4px", background: "#131722", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: "#f1f5f9" }}>{activeSym.sym}</span>
                  <span style={{ fontSize: 9, color: "#4b5563", fontFamily: "'JetBrains Mono',monospace", border: "1px solid rgba(255,255,255,0.07)", padding: "1px 5px", borderRadius: 3 }}>{activeSym.exch}</span>
                  <span style={{ fontSize: 9, color: "#4b5563" }}>{activeSym.name}</span>
                </div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: isUp ? "#089981" : "#f23645" }}>{fmt(activePrice)}</div>
                <span className={isUp ? "badge-up" : "badge-dn"}>{isUp ? "▲" : "▼"} {Math.abs(activeChgPct).toFixed(2)}%</span>
                <span className="mono" style={{ fontSize: 10, color: activeChg >= 0 ? "#089981" : "#f23645" }}>{activeChg >= 0 ? "+" : ""}{fmt(activeChg)}</span>
                {hoverC && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["O", hoverC.open, "#94a3b8"], ["H", hoverC.high, "#089981"], ["L", hoverC.low, "#f23645"], ["C", hoverC.close, hoverC.close >= hoverC.open ? "#089981" : "#f23645"]].map(([l, v, c]) => (
                      <span key={l} className="mono" style={{ fontSize: 10.5 }}><span style={{ color: "#6b7280" }}>{l} </span><span style={{ color: c, fontWeight: 600 }}>{fmt(v)}</span></span>
                    ))}
                    <span className="mono" style={{ fontSize: 10, color: "#6b7280" }}>Vol <span style={{ color: "#94a3b8" }}>{fmtVol(hoverC.volume)}</span></span>
                  </div>
                )}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 9, color: "#089981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#089981", display: "block" }} />LIVE
                </span>
              </div>

              {/* Canvas */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <canvas ref={cvs}
                  style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
                  onMouseMove={onMM} onMouseDown={onMD} onMouseUp={onMU}
                  onMouseLeave={() => { setXhair(null); setHoverC(null); }}
                  onWheel={onWheel}
                  onDoubleClick={e => { const { x, y } = getXY(e); setDraws(p => [...p, { type: "hline", x1: 0, y1: y, color: dColor }]); }}
                  onClick={() => { if (showIndPanel) setShowIndPanel(false); if (showChartTypeMenu) setShowChartTypeMenu(false); }}
                />
                {/* Zoom controls */}
                <div style={{ position: "absolute", bottom: 6, left: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <button onClick={() => setBarsVisible(v => clamp(Math.round(v * 0.8), 20, 700))} style={{ width: 22, height: 22, borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "#7da8ff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>+</button>
                  <span style={{ fontSize: 9, color: "#374151", fontFamily: "'JetBrains Mono',monospace" }}>{barsVisible}b</span>
                  <button onClick={() => setBarsVisible(v => clamp(Math.round(v * 1.25), 20, 700))} style={{ width: 22, height: 22, borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "#7da8ff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>−</button>
                  <button onClick={() => { setViewOffset(0); setBarsVisible(120); }} style={{ width: 22, height: 22, borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "#7da8ff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>⊙</button>
                </div>
                <div style={{ position: "absolute", bottom: 6, right: 84, fontSize: 8.5, color: "#2a3345", fontFamily: "'JetBrains Mono',monospace" }}>Scroll=zoom · Drag=pan · Double-click=H-line · Hotkeys: T H V R F</div>
              </div>

              {/* BOTTOM PANEL */}
              <div style={{ background: "#131722", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", height: 32, padding: "0 8px", borderBottom: "1px solid rgba(55,255,255,0.04)" }}>
                  {[["pos", "Positions", positions.length], ["orders", "Orders", orders.filter(o => o.status === "OPEN").length], ["hist", "Trade History", null], ["alerts", "Alerts", alerts.length], ["news", "News", null], ["depth2", "Depth", null]].map(([id, l, cnt]) => (
                    <button key={id} onClick={() => setBottomPanel(v => v === id ? null : id)}
                      style={{ padding: "0 10px", height: "100%", fontSize: 10.5, fontWeight: 500, borderBottom: `2px solid ${bottomPanel === id ? "#2962ff" : "transparent"}`, color: bottomPanel === id ? "#e2e8f0" : "#6b7280", transition: "all 0.12s", whiteSpace: "nowrap" }}>
                      {l}{cnt != null && <span style={{ marginLeft: 4, padding: "0 4px", borderRadius: 8, fontSize: 8, background: cnt > 0 ? "rgba(41,98,255,0.15)" : "rgba(255,255,255,0.06)", color: cnt > 0 ? "#60a5fa" : "#6b7280" }}>{cnt}</span>}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span className="mono" style={{ fontSize: 10.5, color: totalPnl >= 0 ? "#089981" : "#f23645", fontWeight: 700, paddingRight: 10 }}>
                    Day P&L: {totalPnl >= 0 ? "+" : ""}₹{fmt(Math.abs(totalPnl))}
                  </span>
                </div>
                {bottomPanel && (
                  <div style={{ maxHeight: 170, overflowY: "auto" }}>
                    {bottomPanel === "pos" && (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Symbol", "Exchange", "Qty", "Avg", "LTP", "P&L", "P&L%", "Action"].map(h => <th key={h} className="t-head">{h}</th>)}</tr></thead>
                        <tbody>
                          {positions.map((p, i) => {
                            const lv = prices[p.sym] || { price: p.avg };
                            const pnl = (lv.price - p.avg) * p.qty * (p.side === "short" ? -1 : 1);
                            const pct = (pnl / (p.avg * p.qty)) * 100;
                            return <tr key={i} className="t-row">
                              <td className="t-cell" style={{ fontWeight: 600, color: "#f1f5f9" }}>{p.sym}</td>
                              <td className="t-cell" style={{ color: "#374151", fontSize: 9 }}>{p.exch}</td>
                              <td className="t-cell mono">{p.qty}</td>
                              <td className="t-cell mono" style={{ color: "#94a3b8" }}>₹{fmt(p.avg)}</td>
                              <td className="t-cell mono" style={{ fontWeight: 600 }}>₹{fmt(lv.price)}</td>
                              <td className="t-cell mono" style={{ color: pnl >= 0 ? "#089981" : "#f23645", fontWeight: 700 }}>{pnl >= 0 ? "+" : ""}₹{fmt(Math.abs(pnl))}</td>
                              <td className="t-cell mono" style={{ color: pct >= 0 ? "#089981" : "#f23645" }}>{pct.toFixed(2)}%</td>
                              <td className="t-cell"><div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => { setActiveSym(SYMBOLS.find(s => s.sym === p.sym) || activeSym); setShowOrderDialog({ side: p.side === "long" ? "SELL" : "BUY", price: lv.price }); }} style={{ padding: "2px 8px", fontSize: 9, borderRadius: 3, background: "rgba(242,54,69,0.1)", border: "1px solid rgba(242,54,69,0.2)", color: "#f23645", fontWeight: 600 }}>Exit</button>
                                <button onClick={() => setActiveSym(SYMBOLS.find(s => s.sym === p.sym) || activeSym)} style={{ padding: "2px 8px", fontSize: 9, borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}>Chart</button>
                              </div></td>
                            </tr>;
                          })}
                        </tbody>
                      </table>
                    )}
                    {bottomPanel === "orders" && (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["ID", "Symbol", "Product", "Type", "Side", "Qty", "Price", "Status", "Time", "Action"].map(h => <th key={h} className="t-head">{h}</th>)}</tr></thead>
                        <tbody>
                          {orders.map((o, i) => (
                            <tr key={i} className="t-row">
                              <td className="t-cell mono" style={{ color: "#374151", fontSize: 9 }}>{o.id}</td>
                              <td className="t-cell" style={{ fontWeight: 600, color: "#f1f5f9" }}>{o.sym}</td>
                              <td className="t-cell" style={{ fontSize: 9, color: "#6b7280" }}>{o.product || "MIS"}</td>
                              <td className="t-cell mono" style={{ fontSize: 10 }}>{o.type}</td>
                              <td className="t-cell"><span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700, background: o.side === "BUY" ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)", color: o.side === "BUY" ? "#089981" : "#f23645" }}>{o.side}</span></td>
                              <td className="t-cell mono">{o.qty}</td>
                              <td className="t-cell mono" style={{ color: "#94a3b8" }}>{o.price > 0 ? `₹${fmt(o.price)}` : "Market"}</td>
                              <td className="t-cell"><span style={{ padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 700, background: o.status === "OPEN" ? "rgba(245,158,11,0.12)" : o.status === "COMPLETE" ? "rgba(8,153,129,0.12)" : "rgba(100,116,139,0.12)", color: o.status === "OPEN" ? "#f59e0b" : o.status === "COMPLETE" ? "#089981" : "#6b7280" }}>{o.status}</span></td>
                              <td className="t-cell mono" style={{ color: "#374151", fontSize: 9.5 }}>{o.time}</td>
                              <td className="t-cell">{o.status === "OPEN" && <button onClick={() => handleCancelOrder(o)} style={{ padding: "2px 6px", fontSize: 9, borderRadius: 3, border: "1px solid rgba(242,54,69,0.2)", color: "#f23645" }}>Cancel</button>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {bottomPanel === "alerts" && (
                      <div style={{ padding: "6px 12px" }}>
                        {alerts.length === 0 ? <div style={{ color: "#374151", fontSize: 11, padding: "20px 0", textAlign: "center" }}>No alerts. Click ⊕ Alert to add one.</div> :
                          alerts.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <span style={{ color: "#f59e0b", fontSize: 13 }}>⊕</span>
                              <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 11 }}>{a.sym}</span>
                              <span style={{ color: "#6b7280", fontSize: 10 }}>{a.condition?.replace(/_/g, " ")}</span>
                              <span className="mono" style={{ color: "#f59e0b", fontWeight: 700, fontSize: 11 }}>₹{fmt(a.price)}</span>
                              <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>{a.alertType}</span>
                              {a.note && <span style={{ color: "#374151", fontSize: 10, fontStyle: "italic" }}>{a.note}</span>}
                              <button onClick={() => setAlerts(p => p.filter((_, j) => j !== i))} style={{ marginLeft: "auto", color: "#374151", fontSize: 13 }}>✕</button>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    {bottomPanel === "news" && (
                      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {[{ sym: "RELIANCE", time: "14:32", text: "Q4 PAT rises 12% YoY to ₹18,950 Cr, beats analyst estimates on strong refining margins", sentiment: "positive" },
                        { sym: "NIFTY 50", time: "14:15", text: "Nifty scales 24,000 amid broad-based FII buying; banking and IT sectors lead gains", sentiment: "positive" },
                        { sym: "TCS", time: "13:10", text: "Bags $500M contract from European bank for 5-year digital transformation program", sentiment: "positive" },
                        { sym: "INFY", time: "12:40", text: "Upgrades FY26 revenue guidance to 7-8%; margin outlook stable despite macro uncertainty", sentiment: "neutral" },
                        { sym: "BTC/USD", time: "11:05", text: "Bitcoin ETF inflows hit record $800M single-day; eyes $70K as key resistance", sentiment: "positive" },
                        { sym: "HDFCBANK", time: "10:20", text: "RBI approves branch expansion plan; analyst upgrades to BUY with ₹1,900 target", sentiment: "positive" },
                        ].map((n, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 9, color: "#374151", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, marginTop: 1 }}>{n.time}</span>
                            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(41,98,255,0.1)", color: "#60a5fa", fontWeight: 700, flexShrink: 0 }}>{n.sym}</span>
                            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{n.text}</span>
                            <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 10, flexShrink: 0, background: n.sentiment === "positive" ? "rgba(8,153,129,0.1)" : n.sentiment === "negative" ? "rgba(242,54,69,0.1)" : "rgba(255,255,255,0.05)", color: n.sentiment === "positive" ? "#10b981" : n.sentiment === "negative" ? "#f23645" : "#6b7280" }}>{n.sentiment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {bottomPanel === "depth2" && (() => {
                      const p = activePrice;
                      const bids = [...Array(5)].map((_, i) => ({ price: p - (5 - i) * p * 0.0003, qty: Math.floor(Math.random() * 800 + 50), orders: Math.floor(Math.random() * 20 + 2) }));
                      const asks = [...Array(5)].map((_, i) => ({ price: p + (i + 1) * p * 0.0003, qty: Math.floor(Math.random() * 800 + 50), orders: Math.floor(Math.random() * 20 + 2) }));
                      const maxQ = Math.max(...[...bids, ...asks].map(x => x.qty));
                      return (
                        <div style={{ display: "flex", gap: 0 }}>
                          <table style={{ flex: 1, borderCollapse: "collapse" }}>
                            <thead><tr>{["Orders", "Qty", "Bid Price"].map(h => <th key={h} className="t-head" style={{ textAlign: "right" }}>{h}</th>)}</tr></thead>
                            <tbody>
                              {[...bids].reverse().map((b, i) => (
                                <tr key={i} className="t-row" style={{ position: "relative" }}>
                                  <td className="t-cell mono" style={{ textAlign: "right", color: "#6b7280", fontSize: 9 }}>{b.orders}</td>
                                  <td className="t-cell mono" style={{ textAlign: "right", color: "#089981", fontWeight: 600 }}>{b.qty}</td>
                                  <td className="t-cell mono" style={{ textAlign: "right", color: "#089981", fontWeight: 700, position: "relative" }}>
                                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(b.qty / maxQ) * 60}%`, background: "rgba(8,153,129,0.1)", pointerEvents: "none" }} />
                                    {fmt(b.price)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ width: 1, background: "rgba(255,255,255,0.05)" }} />
                          <table style={{ flex: 1, borderCollapse: "collapse" }}>
                            <thead><tr>{["Ask Price", "Qty", "Orders"].map(h => <th key={h} className="t-head">{h}</th>)}</tr></thead>
                            <tbody>
                              {asks.map((a, i) => (
                                <tr key={i} className="t-row">
                                  <td className="t-cell mono" style={{ color: "#f23645", fontWeight: 700, position: "relative" }}>
                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(a.qty / maxQ) * 60}%`, background: "rgba(242,54,69,0.1)", pointerEvents: "none" }} />
                                    {fmt(a.price)}
                                  </td>
                                  <td className="t-cell mono" style={{ color: "#f23645", fontWeight: 600 }}>{a.qty}</td>
                                  <td className="t-cell mono" style={{ color: "#6b7280", fontSize: 9 }}>{a.orders}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                    {bottomPanel === "hist" && (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Date", "Symbol", "Side", "Qty", "Entry", "Exit", "P&L", "P&L%"].map(h => <th key={h} className="t-head">{h}</th>)}</tr></thead>
                        <tbody>
                          {[...journalEntries].reverse().map((e, i) => (
                            <tr key={i} className="t-row">
                              <td className="t-cell mono" style={{ color: "#374151", fontSize: 9 }}>{e.date}</td>
                              <td className="t-cell" style={{ fontWeight: 600, color: "#f1f5f9" }}>{e.sym}</td>
                              <td className="t-cell"><span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700, background: e.side === "BUY" ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)", color: e.side === "BUY" ? "#089981" : "#f23645" }}>{e.side}</span></td>
                              <td className="t-cell mono">{e.qty}</td>
                              <td className="t-cell mono" style={{ color: "#94a3b8" }}>₹{e.entry}</td>
                              <td className="t-cell mono" style={{ color: "#94a3b8" }}>₹{e.exit}</td>
                              <td className="t-cell mono" style={{ color: e.pnl >= 0 ? "#089981" : "#f23645", fontWeight: 700 }}>{e.pnl >= 0 ? "+" : ""}₹{e.pnl}</td>
                              <td className="t-cell mono" style={{ color: e.pnl >= 0 ? "#089981" : "#f23645" }}>{((e.pnl / (e.entry * e.qty)) * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── HEATMAP ── */}
          {mainView === "heatmap" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9" }}>Market Heatmap</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Nifty 50 stocks by {heatmapBy === "chg" ? "daily change" : "market cap"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["chg", "% Change"], ["mktcap", "Mkt Cap"]].map(([v, l]) => (
                    <button key={v} onClick={() => setHeatmapBy(v)} className={`screen-chip ${heatmapBy === v ? "screen-chip-on" : ""}`}>{l}</button>
                  ))}
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 10, color: "#6b7280" }}>
                <span>Bearish</span>
                {[-3, -2, -1, 0, 1, 2, 3].map(v => (
                  <div key={v} style={{ width: 28, height: 12, borderRadius: 2, background: v < 0 ? `rgba(242,54,69,${Math.min(Math.abs(v) / 3, 1) * 0.8 + 0.1})` : v > 0 ? `rgba(8,153,129,${Math.min(v / 3, 1) * 0.8 + 0.1})` : "rgba(255,255,255,0.08)" }} />
                ))}
                <span>Bullish</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {HEATMAP_DATA.map((s, i) => {
                  const chg = s.chg + (Math.random() - 0.5) * 0.4;
                  const size = Math.max(60, s.mktcap * 0.7);
                  const bg = chg > 0 ? `rgba(8,153,129,${Math.min(Math.abs(chg) / 4, 1) * 0.75 + 0.08})` : `rgba(242,54,69,${Math.min(Math.abs(chg) / 4, 1) * 0.75 + 0.08})`;
                  return (
                    <div key={i} className="hm-cell" onClick={() => { const sym = SYMBOLS.find(x => x.sym === s.sym); if (sym) { setActiveSym(sym); setMainView("chart"); } }}
                      style={{ width: size, height: size * 0.65, background: bg, border: `1px solid ${chg > 0 ? "rgba(8,153,129,0.2)" : "rgba(242,54,69,0.2)"}` }}>
                      <div style={{ fontSize: Math.max(9, size / 8), fontWeight: 700, color: "#fff", textAlign: "center" }}>{s.sym}</div>
                      <div style={{ fontSize: Math.max(8, size / 9), fontWeight: 600, color: chg >= 0 ? "#5eead4" : "#fca5a5" }}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</div>
                      <div style={{ fontSize: Math.max(7, size / 12), color: "rgba(255,255,255,0.4)" }}>{s.sector}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SCANNER ── */}
          {mainView === "scanner" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0d1020" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9", marginBottom: 12 }}>Market Scanner</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SCANNER_CRITERIA.map(c => (
                    <button key={c} className={`screen-chip ${scanFilter === c ? "screen-chip-on" : ""}`} onClick={() => setScanFilter(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ position: "sticky", top: 0, background: "#0d1020", zIndex: 1 }}>{["Symbol", "Exchange", "Sector", "Price", "Change", "RSI", "Vol Ratio", "Signal", "Action"].map(h => <th key={h} className="t-head">{h}</th>)}</tr></thead>
                  <tbody>
                    {scannerResults
                      .filter(s => scanFilter.includes("RSI < 30") ? s.rsi < 35 : scanFilter.includes("RSI > 70") ? s.rsi > 65 : scanFilter.includes("52W High") ? s.chgPct > 1.5 : scanFilter.includes("Volume") ? s.volRatio > 1.5 : scanFilter.includes("Breakout") ? s.chgPct > 2 : s.rsi < 50)
                      .map((s, i) => (
                        <tr key={i} className="t-row scan-row" onClick={() => { const sym = SYMBOLS.find(x => x.sym === s.sym); if (sym) { setActiveSym(sym); setMainView("chart"); } }}>
                          <td className="t-cell" style={{ fontWeight: 700, color: "#e2e8f0" }}>{s.sym}</td>
                          <td className="t-cell" style={{ fontSize: 9, color: "#374151" }}>{s.exch}</td>
                          <td className="t-cell" style={{ fontSize: 9.5, color: "#6b7280" }}>{s.sector}</td>
                          <td className="t-cell mono" style={{ fontWeight: 600 }}>₹{fmt(s.price)}</td>
                          <td className="t-cell"><span className={s.chgPct >= 0 ? "badge-up" : "badge-dn"}>{s.chgPct >= 0 ? "▲" : "▼"} {Math.abs(s.chgPct).toFixed(2)}%</span></td>
                          <td className="t-cell mono" style={{ color: s.rsi > 70 ? "#f23645" : s.rsi < 30 ? "#089981" : "#94a3b8", fontWeight: 700 }}>{s.rsi}</td>
                          <td className="t-cell mono" style={{ color: s.volRatio > 1.5 ? "#f59e0b" : "#94a3b8" }}>{s.volRatio.toFixed(1)}x</td>
                          <td className="t-cell"><span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, fontWeight: 700, background: s.chgPct > 0 ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)", color: s.chgPct > 0 ? "#089981" : "#f23645" }}>{s.chgPct > 0 ? "BULLISH" : "BEARISH"}</span></td>
                          <td className="t-cell"><button className="buy-btn" style={{ padding: "2px 8px", fontSize: 9 }} onClick={e => { e.stopPropagation(); setActiveSym(s); setShowOrderDialog({ side: "BUY", price: s.price }); }}>Trade</button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PORTFOLIO ── */}
          {mainView === "portfolio" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9", marginBottom: 6 }}>Portfolio Overview</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { l: "Total Invested", v: `₹${(positions.reduce((s, p) => s + p.avg * p.qty, 0) / 100000).toFixed(2)}L`, c: "#60a5fa" },
                  { l: "Current Value", v: `₹${(positions.reduce((s, p) => s + (prices[p.sym]?.price || p.avg) * p.qty, 0) / 100000).toFixed(2)}L`, c: "#7da8ff" },
                  { l: "Day P&L", v: `${totalPnl >= 0 ? "+" : ""}₹${fmt(Math.abs(totalPnl))}`, c: totalPnl >= 0 ? "#089981" : "#f23645" },
                  { l: "Total Returns", v: `${totalPnl >= 0 ? "+" : ""}${((totalPnl / positions.reduce((s, p) => s + p.avg * p.qty, 0.01)) * 100).toFixed(2)}%`, c: totalPnl >= 0 ? "#089981" : "#f23645" },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>Holdings</div>
                  {positions.map((p, i) => {
                    const lv = prices[p.sym] || { price: p.avg };
                    const pnl = (lv.price - p.avg) * p.qty;
                    const pct = (pnl / (p.avg * p.qty)) * 100;
                    const totalInvested = positions.reduce((s, x) => s + x.avg * x.qty, 0.01);
                    const weight = (p.avg * p.qty / totalInvested) * 100;
                    const candles = candleStore[p.sym] || [];
                    const sparkData = candles.slice(-30).map(c => c.close);
                    return (
                      <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>{p.sym}</span>
                            <span style={{ fontSize: 9, color: "#374151", marginLeft: 5 }}>{p.qty} shares</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Sparkline data={sparkData} color={pnl >= 0 ? "#089981" : "#f23645"} />
                            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: pnl >= 0 ? "#089981" : "#f23645" }}>{pnl >= 0 ? "+" : ""}₹{fmt(Math.abs(pnl))}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#6b7280", marginBottom: 4 }}>
                          <span>Avg: <span className="mono" style={{ color: "#94a3b8" }}>₹{fmt(p.avg)}</span></span>
                          <span>LTP: <span className="mono" style={{ color: pnl >= 0 ? "#089981" : "#f23645" }}>₹{fmt(lv.price)}</span></span>
                          <span style={{ color: pct >= 0 ? "#089981" : "#f23645", fontWeight: 600 }}>{pct.toFixed(2)}%</span>
                          <span style={{ marginLeft: "auto", color: "#374151" }}>{weight.toFixed(1)}% weight</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(Math.abs(pct) * 4, 100)}%`, background: pnl >= 0 ? "#089981" : "#f23645", transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>Sector Allocation</div>
                    {Object.entries(positions.reduce((acc, p) => { const sector = SYMBOLS.find(s => s.sym === p.sym)?.sector || "Other"; acc[sector] = (acc[sector] || 0) + p.avg * p.qty; return acc; }, {})).map(([sector, val], i) => {
                      const total = positions.reduce((s, p) => s + p.avg * p.qty, 0.01);
                      const pct = (val / total) * 100;
                      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#f97316"];
                      return (
                        <div key={sector} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{sector}</span>
                            <span style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
                            <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: colors[i % colors.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 12 }}>Quick Stats</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[["Open Positions", positions.length], ["Open Orders", orders.filter(o => o.status === "OPEN").length], ["Active Alerts", alerts.length], ["Win Rate", "67%"]].map(([l, v]) => (
                        <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ fontSize: 9.5, color: "#6b7280", marginBottom: 2, textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                          <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TRADE JOURNAL ── */}
          {mainView === "journal" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9" }}>Trade Journal</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Record, review and improve your trades</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(8,153,129,0.1)", border: "1px solid rgba(8,153,129,0.2)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 2 }}>WIN RATE</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#089981" }}>67%</div>
                  </div>
                  <div style={{ background: "rgba(41,98,255,0.1)", border: "1px solid rgba(41,98,255,0.2)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 2 }}>TOTAL P&L</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#7da8ff" }}>+₹{journalEntries.reduce((s, e) => s + e.pnl, 0)}</div>
                  </div>
                  <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 2 }}>AVG RATING</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{(journalEntries.reduce((s, e) => s + e.rating, 0) / journalEntries.length).toFixed(1)} ⭐</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...journalEntries].reverse().map((e, i) => (
                  <div key={i} style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9" }}>{e.sym}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: e.side === "BUY" ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)", color: e.side === "BUY" ? "#089981" : "#f23645" }}>{e.side}</span>
                        <span style={{ fontSize: 10, color: "#6b7280" }}>{e.date}</span>
                        <span style={{ fontSize: 10, color: "#6b7280" }}>{e.qty} shares</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: e.pnl >= 0 ? "#089981" : "#f23645" }}>{e.pnl >= 0 ? "+" : ""}₹{e.pnl}</span>
                        <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 14, color: s <= e.rating ? "#f59e0b" : "rgba(255,255,255,0.1)" }}>★</span>)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#6b7280", marginBottom: 8 }}>
                      <span>Entry: <span className="mono" style={{ color: "#94a3b8" }}>₹{e.entry}</span></span>
                      <span>Exit: <span className="mono" style={{ color: "#94a3b8" }}>₹{e.exit}</span></span>
                      <span>Return: <span className="mono" style={{ color: e.pnl >= 0 ? "#089981" : "#f23645" }}>{((e.pnl / (e.entry * e.qty)) * 100).toFixed(2)}%</span></span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `3px solid ${e.pnl >= 0 ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)"}` }}>"{e.note}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {mainView === "calendar" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9", marginBottom: 6 }}>Economic Calendar</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16 }}>Upcoming events that may impact markets</div>
              {[
                { date: "Today", time: "10:00", event: "RBI Monetary Policy Meeting", impact: "HIGH", country: "🇮🇳", prev: "-", exp: "6.5%", act: "6.5%" },
                { date: "Today", time: "14:30", event: "US CPI Data (YoY)", impact: "HIGH", country: "🇺🇸", prev: "3.2%", exp: "3.1%", act: "-" },
                { date: "Tomorrow", time: "09:00", event: "India Trade Balance", impact: "MEDIUM", country: "🇮🇳", prev: "-$19B", exp: "-$18B", act: "-" },
                { date: "Tomorrow", time: "15:30", event: "US Initial Jobless Claims", impact: "MEDIUM", country: "🇺🇸", prev: "220K", exp: "225K", act: "-" },
                { date: "Jun 12", time: "08:30", event: "India Industrial Production", impact: "MEDIUM", country: "🇮🇳", prev: "5.2%", exp: "5.5%", act: "-" },
                { date: "Jun 13", time: "18:00", event: "FOMC Meeting Minutes", impact: "HIGH", country: "🇺🇸", prev: "-", exp: "-", act: "-" },
                { date: "Jun 14", time: "09:15", event: "India WPI Inflation", impact: "LOW", country: "🇮🇳", prev: "1.1%", exp: "1.3%", act: "-" },
                { date: "Jun 17", time: "15:00", event: "India Advance Estimates GDP", impact: "HIGH", country: "🇮🇳", prev: "8.4%", exp: "7.8%", act: "-" },
              ].map((e, i) => (
                <div key={i} style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 70, flexShrink: 0 }}>
                    <div style={{ fontSize: 9.5, color: "#374151", fontWeight: 600 }}>{e.date}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono',monospace" }}>{e.time}</div>
                  </div>
                  <div style={{ fontSize: 12, flexShrink: 0 }}>{e.country}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{e.event}</div>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, flexShrink: 0, background: e.impact === "HIGH" ? "rgba(242,54,69,0.12)" : e.impact === "MEDIUM" ? "rgba(245,158,11,0.12)" : "rgba(8,153,129,0.12)", color: e.impact === "HIGH" ? "#f23645" : e.impact === "MEDIUM" ? "#f59e0b" : "#089981" }}>{e.impact}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flexShrink: 0, textAlign: "center" }}>
                    {[["Prev", e.prev, "#6b7280"], ["Exp", e.exp, "#94a3b8"], ["Act", e.act, e.act !== "-" ? "#f59e0b" : "#374151"]].map(([l, v, c]) => (
                      <div key={l}>
                        <div style={{ fontSize: 8.5, color: "#374151", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{l}</div>
                        <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT ICON SIDEBAR ── */}
        <div style={{ width: 64, background: "#0d1020", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", flexShrink: 0, zIndex: 5 }}>
          {[
            { id: "watchlist", icon: "☰", tip: "Watch" },
            { id: "positions", icon: "◐", tip: "Posn" },
            { id: "orders", icon: "⊟", tip: "Orders" },
            { id: "depth", icon: "≡", tip: "Depth" },
            { id: "optionchain", icon: "⋯", tip: "Options" },
            { id: "info", icon: "ℹ", tip: "Info" },
          ].map(p => (
            <button key={p.id} title={p.tip} className={`rp-tab ${rightPanel === p.id ? "rp-tab-active" : ""}`} onClick={() => setRightPanel(v => v === p.id ? null : p.id)}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontSize: 9, color: rightPanel === p.id ? "#7da8ff" : "#94a3b8", letterSpacing: "0.04em", fontWeight: 600 }}>{p.tip}</span>
            </button>
          ))}
        </div>

        {/* ── RIGHT PANEL ── */}
        {rightPanel && (
          <div style={{ width: 256, background: "#0f1220", borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>

            {/* WATCHLIST */}
            {rightPanel === "watchlist" && <>
              <div style={{ padding: "8px 10px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#374151", fontSize: 13 }}>⌕</span>
                  <input value={symSearch} onChange={e => setSymSearch(e.target.value)} placeholder="Search symbol..."
                    style={{ flex: 1, fontSize: 11, color: "#d1d5db", background: "transparent" }} />
                  {symSearch && <button onClick={() => setSymSearch("")} style={{ color: "#374151", fontSize: 12 }}>✕</button>}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {["Index", "Banking", "IT", "Energy", "Auto", "NBFC", "Infra", "Conglom", "Crypto", "Commodity", "Forex", "Tech", "Semicon"].map(sector => {
                  const syms = filtSym.filter(s => s.sector === sector);
                  if (!syms.length && symSearch) return null;
                  const sectorSyms = symSearch ? syms : syms;
                  if (!sectorSyms.length) return null;
                  return (
                    <div key={sector}>
                      {!symSearch && <div style={{ fontSize: 8.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", padding: "5px 10px 2px", letterSpacing: "0.08em" }}>{sector}</div>}
                      {sectorSyms.map(s => {
                        const lv = prices[s.sym] || { price: s.base, chgPct: 0 };
                        const up = lv.chgPct >= 0;
                        const isActive = activeSym.sym === s.sym;
                        const candles = candleStore[s.sym] || [];
                        const spark = candles.slice(-20).map(c => c.close);
                        return (
                          <div key={s.sym} className={`sym-row ${isActive ? "sym-row-active" : ""}`} onClick={() => { setActiveSym(s); if (mainView !== "chart") setMainView("chart"); }} style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.02)", borderLeft: isActive ? "2px solid #2962ff" : "2px solid transparent" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 11.5, color: isActive ? "#7da8ff" : "#e2e8f0" }}>{s.sym}</span>
                                <span style={{ fontSize: 8, color: "#374151", marginLeft: 4 }}>{s.exch}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Sparkline data={spark} color={up ? "#089981" : "#f23645"} width={36} height={14} />
                                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: up ? "#089981" : "#f23645" }}>{fmt(lv.price)}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                              <span style={{ fontSize: 9, color: "#2a3345" }}>{s.name.slice(0, 18)}</span>
                              <span className={up ? "badge-up" : "badge-dn"}>{up ? "▲" : "▼"} {Math.abs(lv.chgPct).toFixed(2)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>}

            {/* POSITIONS */}
            {rightPanel === "positions" && <>
              <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>Positions</span>
                <span className="mono" style={{ fontSize: 11, color: totalPnl >= 0 ? "#089981" : "#f23645", fontWeight: 700 }}>{totalPnl >= 0 ? "+" : ""}₹{fmt(Math.abs(totalPnl))}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {positions.map((p, i) => {
                  const lv = prices[p.sym] || { price: p.avg };
                  const pnl = (lv.price - p.avg) * p.qty * (p.side === "short" ? -1 : 1);
                  const pct = (pnl / (p.avg * p.qty)) * 100;
                  return (
                    <div key={i} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>{p.sym}</span>
                          <span style={{ marginLeft: 6, padding: "1px 5px", borderRadius: 3, fontSize: 8.5, fontWeight: 700, background: p.side === "long" ? "rgba(8,153,129,0.15)" : "rgba(242,54,69,0.15)", color: p.side === "long" ? "#089981" : "#f23645" }}>{p.side.toUpperCase()}</span>
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: pnl >= 0 ? "#089981" : "#f23645", fontWeight: 700 }}>{pnl >= 0 ? "+" : ""}₹{fmt(Math.abs(pnl))}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7280", display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span>Qty:<span className="mono" style={{ color: "#94a3b8", marginLeft: 3 }}>{p.qty}</span></span>
                        <span>Avg:<span className="mono" style={{ color: "#94a3b8", marginLeft: 3 }}>₹{fmt(p.avg)}</span></span>
                        <span>LTP:<span className="mono" style={{ color: pnl >= 0 ? "#089981" : "#f23645", marginLeft: 3 }}>₹{fmt(lv.price)}</span></span>
                      </div>
                      <div style={{ fontSize: 9.5, color: pct >= 0 ? "#089981" : "#f23645", fontWeight: 600, marginBottom: 5 }}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginBottom: 6 }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(Math.abs(pct) * 5, 100)}%`, background: pnl >= 0 ? "#089981" : "#f23645" }} />
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="sell-btn" style={{ flex: 1, padding: "3px 0", fontSize: 10, borderRadius: 4 }} onClick={() => { setActiveSym(SYMBOLS.find(s => s.sym === p.sym) || activeSym); setShowOrderDialog({ side: p.side === "long" ? "SELL" : "BUY", price: lv.price }); }}>Exit</button>
                        <button style={{ flex: 1, padding: "3px 0", fontSize: 10, borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280", fontWeight: 600 }} onClick={() => { setActiveSym(SYMBOLS.find(s => s.sym === p.sym) || activeSym); setMainView("chart"); }}>Chart</button>
                        <button style={{ flex: 0, padding: "3px 8px", fontSize: 10, borderRadius: 4, border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }} onClick={() => setShowAlertDialog(true)}>⊕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* ORDERS */}
            {rightPanel === "orders" && <>
              <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>Orders</span>
                <span style={{ fontSize: 9, color: "#6b7280" }}>{orders.filter(o => o.status === "OPEN").length} open · {orders.filter(o => o.status === "COMPLETE").length} done</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {orders.map((o, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 11.5, color: "#f1f5f9" }}>{o.sym}</span>
                      <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 8.5, fontWeight: 700, background: o.status === "OPEN" ? "rgba(245,158,11,0.12)" : o.status === "COMPLETE" ? "rgba(8,153,129,0.12)" : "rgba(100,116,139,0.12)", color: o.status === "OPEN" ? "#f59e0b" : o.status === "COMPLETE" ? "#089981" : "#6b7280" }}>{o.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#6b7280", display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ padding: "1px 6px", borderRadius: 3, fontWeight: 700, fontSize: 9.5, background: o.side === "BUY" ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)", color: o.side === "BUY" ? "#089981" : "#f23645" }}>{o.side}</span>
                      <span>{o.type}</span>
                      <span className="mono" style={{ color: "#94a3b8" }}>{o.qty} qty</span>
                      {o.price > 0 && <span className="mono" style={{ color: "#94a3b8" }}>@ ₹{fmt(o.price)}</span>}
                      <span style={{ color: "#374151", marginLeft: "auto" }}>{o.time}</span>
                    </div>
                    {o.status === "OPEN" && <button onClick={() => handleCancelOrder(o)} style={{ marginTop: 2, padding: "2px 10px", fontSize: 9, borderRadius: 3, border: "1px solid rgba(242,54,69,0.25)", color: "rgba(242,54,69,0.7)", fontWeight: 600 }}>Cancel</button>}
                  </div>
                ))}
              </div>
            </>}

            {/* MARKET DEPTH */}
            {rightPanel === "depth" && (() => {
              const p = activePrice;
              const bids = [...Array(7)].map((_, i) => ({ price: p - (7 - i) * p * 0.0003, qty: Math.floor(Math.random() * 900 + 50), orders: Math.floor(Math.random() * 25 + 1) }));
              const asks = [...Array(7)].map((_, i) => ({ price: p + (i + 1) * p * 0.0003, qty: Math.floor(Math.random() * 900 + 50), orders: Math.floor(Math.random() * 25 + 1) }));
              const maxQ = Math.max(...[...bids, ...asks].map(x => x.qty));
              const totBid = bids.reduce((s, x) => s + x.qty, 0);
              const totAsk = asks.reduce((s, x) => s + x.qty, 0);
              return <>
                <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>{activeSym.sym}</span>
                    <span className={isUp ? "badge-up" : "badge-dn"}>{isUp ? "▲" : "▼"} {Math.abs(activeChgPct).toFixed(2)}%</span>
                  </div>
                  <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: isUp ? "#089981" : "#f23645" }}>{fmt(activePrice)}</div>
                  <div style={{ marginTop: 8, height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(242,54,69,0.3)" }}>
                    <div style={{ height: "100%", background: "rgba(8,153,129,0.6)", width: `${(totBid / (totBid + totAsk)) * 100}%`, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9 }}>
                    <span style={{ color: "#089981", fontWeight: 600 }}>Buy {((totBid / (totBid + totAsk)) * 100).toFixed(0)}%</span>
                    <span style={{ color: "#f23645", fontWeight: 600 }}>Sell {((totAsk / (totBid + totAsk)) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {["Buy Qty", "Price", "Sell Qty"].map((h, i) => <span key={h} style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.08em", color: "#374151", textTransform: "uppercase", textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>{h}</span>)}
                </div>
                {[...Array(7)].map((_, i) => {
                  const bid = bids[6 - i], ask = asks[i];
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", position: "relative", cursor: "pointer", minHeight: 28 }} className="depth-row">
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(bid.qty / maxQ) * 45}%`, background: "rgba(8,153,129,0.1)" }} />
                      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(ask.qty / maxQ) * 45}%`, background: "rgba(242,54,69,0.1)" }} />
                      <div style={{ position: "relative" }}>
                        <div className="mono" style={{ fontSize: 10.5, color: "#089981", fontWeight: 600 }}>{bid.qty}</div>
                        <div style={{ fontSize: 7.5, color: "#374151" }}>{bid.orders} orders</div>
                      </div>
                      <div style={{ textAlign: "center", position: "relative" }}>
                        <div className="mono" style={{ fontSize: 10, color: "#089981" }}>{fmt(bid.price)}</div>
                        <div className="mono" style={{ fontSize: 10, color: "#f23645" }}>{fmt(ask.price)}</div>
                      </div>
                      <div style={{ textAlign: "right", position: "relative" }}>
                        <div className="mono" style={{ fontSize: 10.5, color: "#f23645", fontWeight: 600 }}>{ask.qty}</div>
                        <div style={{ fontSize: 7.5, color: "#374151", textAlign: "right" }}>{ask.orders} orders</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10 }}>
                  {[["Total Buy", totBid, "#089981"], ["Total Sell", totAsk, "#f23645"], ["Upper Ckt", fmt(p * 1.2), "#6b7280"], ["Lower Ckt", fmt(p * 0.8), "#6b7280"], ["52W High", fmt(p * 1.35), "#089981"], ["52W Low", fmt(p * 0.65), "#f23645"]].map(([l, v, c]) => (
                    <div key={l}><div style={{ color: "#374151", fontSize: 8, textTransform: "uppercase", marginBottom: 1, fontWeight: 600 }}>{l}</div><div className="mono" style={{ color: c, fontWeight: 700 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <button className="buy-btn" style={{ padding: "9px 0", borderRadius: 6, fontSize: 12 }} onClick={() => setShowOrderDialog({ side: "BUY", price: activePrice })}>BUY</button>
                  <button className="sell-btn" style={{ padding: "9px 0", borderRadius: 6, fontSize: 12 }} onClick={() => setShowOrderDialog({ side: "SELL", price: activePrice })}>SELL</button>
                </div>
              </>;
            })()}

            {/* OPTION CHAIN */}
            {rightPanel === "optionchain" && <>
              <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9", marginBottom: 6 }}>Option Chain · {activeSym.sym}</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {["Weekly", "Monthly", "Quarterly"].map((e, i) => (
                    <button key={e} style={{ padding: "2px 8px", borderRadius: 3, fontSize: 9.5, fontWeight: 600, border: `1px solid rgba(255,255,255,${i === 0 ? 0.14 : 0.06})`, background: i === 0 ? "rgba(255,255,255,0.06)" : "transparent", color: i === 0 ? "#e2e8f0" : "#6b7280" }}>{e}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#6b7280" }}>
                  <span>PCR: <span className="mono" style={{ color: "#f59e0b", fontWeight: 600 }}>0.87</span></span>
                  <span>Max Pain: <span className="mono" style={{ color: "#94a3b8", fontWeight: 600 }}>{fmt(Math.round(activePrice / 100) * 100)}</span></span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 56px 1fr", padding: "3px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["CALLS", "Strike", "PUTS"].map((h, i) => <span key={h} style={{ fontSize: 7.5, fontWeight: 700, color: i === 0 ? "#089981" : i === 2 ? "#f23645" : "#6b7280", textAlign: i === 0 ? "left" : i === 1 ? "center" : "right", letterSpacing: "0.08em" }}>{h}</span>)}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {[...Array(14)].map((_, i) => {
                  const baseStrike = Math.round(activePrice / 50) * 50;
                  const strike = baseStrike + (i - 7) * 50;
                  const isATM = Math.abs(activePrice - strike) < 25;
                  const diff = Math.abs(activePrice - strike);
                  const iv = 14 + Math.random() * 12;
                  const callPr = (Math.max(activePrice - strike, 0) + diff * 0.08 + Math.random() * 8 + 0.5).toFixed(2);
                  const putPr = (Math.max(strike - activePrice, 0) + diff * 0.08 + Math.random() * 8 + 0.5).toFixed(2);
                  const callOI = Math.floor(Math.random() * 9000 + 100);
                  const putOI = Math.floor(Math.random() * 9000 + 100);
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 56px 1fr", padding: "3px 6px", borderBottom: "1px solid rgba(255,255,255,0.025)", background: isATM ? "rgba(41,98,255,0.07)" : "transparent" }}>
                      <div>
                        <div className="mono" style={{ fontSize: 10.5, color: "#089981", fontWeight: 600 }}>₹{callPr}</div>
                        <div style={{ fontSize: 7, color: "#374151" }}>{(callOI / 1000).toFixed(1)}K IV:{iv.toFixed(0)}%</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="mono" style={{ fontSize: 10, fontWeight: 800, color: isATM ? "#60a5fa" : "#6b7280" }}>{strike.toLocaleString()}</div>
                        {isATM && <div style={{ fontSize: 7, color: "#374151" }}>ATM</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 10.5, color: "#f23645", fontWeight: 600 }}>₹{putPr}</div>
                        <div style={{ fontSize: 7, color: "#374151", textAlign: "right" }}>{(putOI / 1000).toFixed(1)}K IV:{(iv + 2).toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* SYMBOL INFO */}
            {rightPanel === "info" && <>
              <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9" }}>{activeSym.sym} · Info</div>
                <div style={{ fontSize: 9.5, color: "#6b7280", marginTop: 2 }}>{activeSym.name}</div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["Open", fmt(activePrice * 0.998)], ["High", fmt(activePrice * 1.018)], ["Low", fmt(activePrice * 0.982)], ["Close", fmt(activePrice)], ["Volume", fmtVol(Math.random() * 5e6 + 1e6)], ["Avg Vol", fmtVol(Math.random() * 4e6 + 1e6)], ["52W High", fmt(activePrice * 1.35)], ["52W Low", fmt(activePrice * 0.65)]].map(([l, v]) => (
                    <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 5, padding: "7px 8px" }}>
                      <div style={{ fontSize: 8.5, color: "#374151", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{l}</div>
                      <div className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "#e2e8f0" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#374151", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Fundamentals</div>
                  {[["P/E Ratio", "22.4x"], ["Market Cap", `₹${(Math.random() * 200000 + 50000).toFixed(0)}Cr`], ["EPS", "₹124.50"], ["Dividend", "₹8.00 (1.2%)"], ["Book Value", "₹980"], ["ROE", "18.4%"]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 10.5, color: "#6b7280" }}>{l}</span>
                      <span className="mono" style={{ fontSize: 10.5, color: "#e2e8f0", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#374151", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Analyst Ratings</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {[["BUY", "12", "#089981"], ["HOLD", "5", "#f59e0b"], ["SELL", "2", "#f23645"]].map(([l, n, c]) => (
                      <div key={l} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 5, background: `rgba(${c === "#089981" ? "8,153,129" : c === "#f59e0b" ? "245,158,11" : "242,54,69"},0.1)`, border: `1px solid ${c}30` }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{n}</div>
                        <div style={{ fontSize: 9, color: c, fontWeight: 600 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 3, fontSize: 10, color: "#6b7280" }}>
                    <span>Target: </span>
                    <span className="mono" style={{ color: "#089981", fontWeight: 700 }}>₹{fmt(activePrice * 1.22)}</span>
                    <span style={{ marginLeft: 4 }}>({(22).toFixed(1)}% upside)</span>
                  </div>
                </div>
              </div>
            </>}
          </div>
        )}

        {/* ── AI PANEL ── */}
        {showAI && (
          <div className="fade-up" style={{ width: 330, background: "#0a0e1e", borderLeft: "1px solid rgba(41,98,255,0.2)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(41,98,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(41,98,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#1a3aff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 16px rgba(41,98,255,0.5)" }}>✦</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: "#f1f5f9" }}>TradEx AI</div>
                  <div style={{ fontSize: 8, color: "#60a5fa" }}>Powered by Claude · Real-time context</div>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} style={{ color: "#4b5563", fontSize: 16, padding: "2px 6px" }}>✕</button>
            </div>
            {/* Context bar */}
            <div style={{ padding: "6px 10px", background: "rgba(41,98,255,0.04)", borderBottom: "1px solid rgba(41,98,255,0.1)", fontSize: 9, color: "#374151", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span>{activeSym.sym}</span>
              <span style={{ color: isUp ? "#089981" : "#f23645" }}>{fmt(activePrice)}</span>
              <span>RSI≈{(Math.random() * 30 + 35).toFixed(0)}</span>
              <span style={{ color: isUp ? "#089981" : "#f23645" }}>{isUp ? "▲" : "▼"}{Math.abs(activeChgPct).toFixed(2)}%</span>
            </div>
            {/* Quick prompts */}
            <div style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[`Analyse ${activeSym.sym}`, `News & sentiment`, `Best entry signal`, `Key support levels`, `Explain RSI`, `Market outlook`].map(q => (
                <button key={q} onClick={() => { setAiInput(q); setTimeout(() => document.getElementById("ai-send")?.click(), 50); }}
                  style={{ padding: "3px 8px", borderRadius: 20, fontSize: 8.5, border: "1px solid rgba(41,98,255,0.25)", color: "#60a5fa", background: "rgba(41,98,255,0.07)", fontWeight: 500, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {aiMessages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "ai-msg-user" : "ai-msg-bot"}>
                  {m.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg,#1a3aff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff" }}>✦</div><span style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700 }}>TradEx AI</span></div>}
                  {m.role === "user" && <div style={{ fontSize: 9, color: "#374151", marginBottom: 3, textAlign: "right" }}>You</div>}
                  <Markdown text={m.text} />
                </div>
              ))}
              {aiLoading && <div className="ai-msg-bot"><div style={{ display: "flex", gap: 5, alignItems: "center" }}><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg,#1a3aff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>✦</div><span style={{ fontSize: 10, color: "#60a5fa" }}>Analysing…</span><span className="dot1" /><span className="dot2" /><span className="dot3" /></div></div>}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(41,98,255,0.1)" }}>
              <div style={{ position: "relative" }}>
                <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
                  placeholder={`Ask about ${activeSym.sym}…`} rows={2}
                  style={{ width: "100%", background: "#0d1526", border: "1px solid rgba(41,98,255,0.2)", borderRadius: 8, padding: "8px 38px 8px 12px", fontSize: 11.5, color: "#e2e8f0", resize: "none", outline: "none", fontFamily: "Inter,sans-serif" }} />
                <button id="ai-send" onClick={sendAI} disabled={aiLoading || !aiInput.trim()}
                  style={{ position: "absolute", right: 8, bottom: 8, width: 26, height: 26, borderRadius: 6, background: aiInput.trim() && !aiLoading ? "linear-gradient(135deg,#1a3aff,#7c3aed)" : "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.15s" }}>↑</button>
              </div>
              <div style={{ fontSize: 7.5, color: "#1e293b", marginTop: 3 }}>Enter=send · Shift+Enter=newline · Ctrl+A=toggle AI · Not financial advice</div>
            </div>
          </div>
        )}
      </div>

      {/* ── DIALOGS ── */}
      {showOrderDialog && <OrderDialog sym={activeSym.sym} price={showOrderDialog.price} side={showOrderDialog.side} onClose={() => setShowOrderDialog(null)} onConfirm={handleOrder} />}
      {showAlertDialog && <AlertDialog sym={activeSym.sym} price={activePrice} onClose={() => setShowAlertDialog(false)} onSet={(a) => { setAlerts(p => [...p, a]); addToast(`Alert set for ${a.sym} @ ₹${fmt(a.price)}`, "warning"); }} />}
      {showRiskCalc && <RiskCalc price={activePrice} onClose={() => setShowRiskCalc(false)} />}

      {/* ── TOASTS ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => setToasts(p => p.filter(x => x.id !== t.id))} />)}
      </div>
    </div>
  );
}
