import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   TRADEX PRO — Industry-level trading terminal
   Zerodha / Angel One inspired — fully functional
   Features: Live chart, pan/zoom, all drawing tools, indicators,
   order book, AI assistant, positions, orders, depth, option chain
═══════════════════════════════════════════════════════════════════ */

// ── DATA GENERATION ──────────────────────────────────────────────
function generateCandles(base, n = 500, volatility = 0.015) {
  const out = [];
  let p = base;
  const now = Date.now();
  // Generate enough history
  for (let i = n; i >= 0; i--) {
    const drift = (Math.random() - 0.48) * p * volatility;
    const open = p;
    const close = Math.max(open + drift, open * 0.92);
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
  { sym: "NIFTY50", exch: "NSE", name: "Nifty 50 Index", base: 23416.55, color: "#3b82f6", volatility: 0.008 },
  { sym: "SENSEX", exch: "BSE", name: "BSE Sensex", base: 74360.01, color: "#8b5cf6", volatility: 0.008 },
  { sym: "BTCUSDT", exch: "BINANCE", name: "Bitcoin / USDT", base: 65000, color: "#f59e0b", volatility: 0.02 },
  { sym: "RELIANCE", exch: "NSE", name: "Reliance Industries", base: 2891.40, color: "#10b981", volatility: 0.012 },
  { sym: "TCS", exch: "NSE", name: "Tata Consultancy", base: 3754.80, color: "#06b6d4", volatility: 0.01 },
  { sym: "INFY", exch: "NSE", name: "Infosys Ltd", base: 1812.55, color: "#ec4899", volatility: 0.011 },
  { sym: "HDFCBANK", exch: "NSE", name: "HDFC Bank", base: 1678.90, color: "#f97316", volatility: 0.009 },
  { sym: "ADANIENT", exch: "NSE", name: "Adani Enterprises", base: 2456.30, color: "#84cc16", volatility: 0.018 },
  { sym: "WIPRO", exch: "NSE", name: "Wipro Ltd", base: 478.65, color: "#a78bfa", volatility: 0.013 },
  { sym: "SBIN", exch: "NSE", name: "State Bank India", base: 812.40, color: "#34d399", volatility: 0.011 },
  { sym: "BAJFINANCE", exch: "NSE", name: "Bajaj Finance", base: 7234.50, color: "#fb923c", volatility: 0.014 },
  { sym: "TATAMOTORS", exch: "NSE", name: "Tata Motors", base: 987.65, color: "#60a5fa", volatility: 0.016 },
  { sym: "AAPL", exch: "NASDAQ", name: "Apple Inc", base: 185.00, color: "#c084fc", volatility: 0.012 },
  { sym: "MEESHO", exch: "NSE", name: "Meesho Ltd", base: 165.34, color: "#f87171", volatility: 0.015 },
];

const TF_INTRA = ["1m","3m","5m","10m","15m","30m","1h","2h","4h"];
const TF_DAY   = ["1D","5D","1M","3M","6M","1Y","3Y","5Y"];

const CHART_TYPES = [
  { id:"candle", label:"Candles", icon:"▥" },
  { id:"heikin", label:"Heikin Ashi", icon:"◈" },
  { id:"bar",    label:"OHLC Bars", icon:"☰" },
  { id:"line",   label:"Line",   icon:"╱" },
  { id:"area",   label:"Area",   icon:"◺" },
  { id:"baseline",label:"Baseline",icon:"⊟" },
];

const DRAW_TOOLS = [
  { id:"cursor",   svg:"M5 3l14 9-7 1-4 7z",                                   tip:"Cursor (Esc)" },
  { id:"crosshair",svg:"M12 2v20M2 12h20",                                      tip:"Crosshair" },
  { id:"line",     svg:"M5 19L19 5",                                            tip:"Trend Line (T)" },
  { id:"ray",      svg:"M3 12h18M15 8l4 4-4 4",                                tip:"Ray" },
  { id:"hline",    svg:"M3 12h18",                                              tip:"Horizontal Line (H)" },
  { id:"vline",    svg:"M12 3v18",                                              tip:"Vertical Line (V)" },
  { id:"arrow",    svg:"M5 12h14M15 8l4 4-4 4",                                tip:"Arrow" },
  { id:"rect",     svg:"M3 3h18v18H3z",                                         tip:"Rectangle (R)" },
  { id:"circle",   svg:"M12 2a10 10 0 100 20A10 10 0 0012 2z",                 tip:"Circle" },
  { id:"triangle", svg:"M12 3L3 21h18z",                                        tip:"Triangle" },
  { id:"fib",      svg:"M3 6h18M3 10h18M3 14h18M3 18h14",                      tip:"Fibonacci (F)" },
  { id:"pitchfork",svg:"M12 3v18M5 7l7 4M19 7l-7 4",                           tip:"Pitchfork" },
  { id:"channel",  svg:"M3 6l18 4M3 14l18 4",                                  tip:"Parallel Channel" },
  { id:"measure",  svg:"M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3",                  tip:"Measure" },
  { id:"text",     svg:"M4 6h16M4 12h10M4 18h8",                               tip:"Text (X)" },
  { id:"erase",    svg:"M20 20H7L3 16l10-10 7 7-1.5 1.5M6.5 17.5l10-10",      tip:"Eraser (Del)" },
];

const INDICATORS_LIST = [
  { id:"ma",    label:"MA",    params:"(20)",    color:"#3b82f6",  type:"overlay" },
  { id:"ema",   label:"EMA",   params:"(9)",     color:"#f59e0b",  type:"overlay" },
  { id:"ema2",  label:"EMA",   params:"(21)",    color:"#ec4899",  type:"overlay" },
  { id:"vwap",  label:"VWAP",  params:"",        color:"#8b5cf6",  type:"overlay" },
  { id:"bb",    label:"BB",    params:"(20,2)",  color:"#10b981",  type:"overlay" },
  { id:"ich",   label:"Ichimoku",params:"",      color:"#06b6d4",  type:"overlay" },
  { id:"psar",  label:"PSAR",  params:"",        color:"#f97316",  type:"overlay" },
  { id:"rsi",   label:"RSI",   params:"(14)",    color:"#ec4899",  type:"sub" },
  { id:"macd",  label:"MACD",  params:"",        color:"#06b6d4",  type:"sub" },
  { id:"stoch", label:"Stoch", params:"(14,3)",  color:"#f97316",  type:"sub" },
  { id:"atr",   label:"ATR",   params:"(14)",    color:"#84cc16",  type:"sub" },
  { id:"vol",   label:"Volume",params:"",        color:"#64748b",  type:"vol" },
  { id:"obv",   label:"OBV",   params:"",        color:"#a78bfa",  type:"sub" },
  { id:"cci",   label:"CCI",   params:"(20)",    color:"#34d399",  type:"sub" },
];

// ── UTILITIES ────────────────────────────────────────────────────
const fmt = (p, dec=2) => {
  if (p == null || isNaN(p)) return "0.00";
  const n = Number(p);
  if (n > 100000) return n.toLocaleString("en-IN", { maximumFractionDigits: dec });
  return n.toFixed(dec);
};
const fmtVol = (v) => {
  if (v >= 1e7) return (v/1e7).toFixed(2)+"Cr";
  if (v >= 1e5) return (v/1e5).toFixed(2)+"L";
  if (v >= 1000) return (v/1000).toFixed(1)+"K";
  return v.toFixed(0);
};
const clamp = (v,mn,mx) => Math.min(Math.max(v,mn),mx);

// ── MARKDOWN RENDERER ─────────────────────────────────────────────
function Markdown({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize:11.5, lineHeight:1.7, color:"#cbd5e1" }}>
      {text.split("\n").map((line,i) => {
        if (line.startsWith("### ")) return <div key={i} style={{fontWeight:700,color:"#f1f5f9",fontSize:12,marginTop:8,marginBottom:2}}>{line.slice(4)}</div>;
        if (line.startsWith("## ")) return <div key={i} style={{fontWeight:800,color:"#f8fafc",fontSize:13,marginTop:10,marginBottom:3,borderBottom:"1px solid rgba(255,255,255,0.08)",paddingBottom:4}}>{line.slice(3)}</div>;
        if (line.startsWith("| ")) return <div key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#64748b",borderBottom:"1px solid rgba(255,255,255,0.04)",padding:"2px 0"}}>{line}</div>;
        if (line === "---") return <hr key={i} style={{border:"none",borderTop:"1px solid rgba(255,255,255,0.08)",margin:"6px 0"}}/>;
        if (line === "") return <div key={i} style={{height:5}}/>;
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
        const isBullet = line.startsWith("• ") || line.startsWith("- ");
        const content = (
          <span>{parts.map((p,j) => {
            if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} style={{color:"#e2e8f0",fontWeight:700}}>{p.slice(2,-2)}</strong>;
            if (p.startsWith("`") && p.endsWith("`")) return <code key={j} style={{fontFamily:"'JetBrains Mono',monospace",background:"rgba(255,255,255,0.08)",padding:"1px 4px",borderRadius:3,fontSize:10}}>{p.slice(1,-1)}</code>;
            return <span key={j}>{p}</span>;
          })}</span>
        );
        if (isBullet) return <div key={i} style={{paddingLeft:14,position:"relative",color:"#94a3b8",marginBottom:2}}><span style={{position:"absolute",left:2,color:"#60a5fa"}}>›</span>{content}</div>;
        return <div key={i} style={{color:"#94a3b8",marginBottom:1}}>{content}</div>;
      })}
    </div>
  );
}

// ── ORDER DIALOG ──────────────────────────────────────────────────
function OrderDialog({ sym, price, side, onClose, onConfirm }) {
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState("MARKET");
  const [limitPrice, setLimitPrice] = useState(fmt(price));
  const [slPrice, setSlPrice] = useState(fmt(side==="BUY" ? price*0.98 : price*1.02));
  const [targetPrice, setTargetPrice] = useState(fmt(side==="BUY" ? price*1.03 : price*0.97));
  const [useSlTarget, setUseSlTarget] = useState(false);
  const val = Number(qty) * Number(orderType==="MARKET"?price:limitPrice);

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)"}}>
      <div style={{width:340,background:"#1e222d",border:`1px solid ${side==="BUY"?"rgba(8,153,129,0.4)":"rgba(242,54,69,0.4)"}`,borderRadius:12,overflow:"hidden",boxShadow:`0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${side==="BUY"?"rgba(8,153,129,0.1)":"rgba(242,54,69,0.1)"}`}}>
        <div style={{padding:"14px 16px",background:side==="BUY"?"rgba(8,153,129,0.12)":"rgba(242,54,69,0.12)",borderBottom:`1px solid ${side==="BUY"?"rgba(8,153,129,0.2)":"rgba(242,54,69,0.2)"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:side==="BUY"?"#089981":"#f23645"}}>{side} {sym}</div>
            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Market Price: ₹{fmt(price)}</div>
          </div>
          <button onClick={onClose} style={{color:"#6b7280",fontSize:18,cursor:"pointer",border:"none",background:"none"}}>✕</button>
        </div>
        <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
          {/* Order type */}
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>Order Type</div>
            <div style={{display:"flex",gap:4}}>
              {["MARKET","LIMIT","SL","SL-M"].map(t=>(
                <button key={t} onClick={()=>setOrderType(t)} style={{flex:1,padding:"5px 0",borderRadius:4,fontSize:10,fontWeight:700,border:`1px solid ${orderType===t?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)"}`,background:orderType===t?"rgba(255,255,255,0.1)":"transparent",color:orderType===t?"#f1f5f9":"#6b7280",cursor:"pointer"}}>{t}</button>
              ))}
            </div>
          </div>
          {/* Qty */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:4,fontWeight:600}}>Quantity</div>
              <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1"
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
            </div>
            {orderType!=="MARKET" && (
              <div>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:4,fontWeight:600}}>Limit Price</div>
                <input value={limitPrice} onChange={e=>setLimitPrice(e.target.value)} type="number"
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
              </div>
            )}
          </div>
          {/* SL + Target */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:32,height:17,borderRadius:9,background:useSlTarget?"#2962ff":"#374151",display:"flex",alignItems:"center",padding:2,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>setUseSlTarget(v=>!v)}>
              <div style={{width:13,height:13,borderRadius:"50%",background:"#fff",transition:"all 0.2s",transform:useSlTarget?"translateX(15px)":"translateX(0)"}}/>
            </div>
            <span style={{fontSize:10.5,color:"#94a3b8",fontWeight:600}}>Add Stop Loss & Target</span>
          </div>
          {useSlTarget && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:10,color:"#f23645",marginBottom:4,fontWeight:600}}>Stop Loss</div>
                <input value={slPrice} onChange={e=>setSlPrice(e.target.value)} type="number"
                  style={{width:"100%",background:"rgba(242,54,69,0.08)",border:"1px solid rgba(242,54,69,0.2)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:"#089981",marginBottom:4,fontWeight:600}}>Target</div>
                <input value={targetPrice} onChange={e=>setTargetPrice(e.target.value)} type="number"
                  style={{width:"100%",background:"rgba(8,153,129,0.08)",border:"1px solid rgba(8,153,129,0.2)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
              </div>
            </div>
          )}
          {/* Value */}
          <div style={{padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:6,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
              <span style={{color:"#6b7280"}}>Order Value</span>
              <span style={{color:"#f1f5f9",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>₹{fmt(val)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:4}}>
              <span style={{color:"#6b7280"}}>Margin Required</span>
              <span style={{color:"#f59e0b",fontFamily:"'JetBrains Mono',monospace"}}>₹{fmt(val*0.2)}</span>
            </div>
          </div>
          {/* Confirm */}
          <button onClick={()=>onConfirm({sym,side,qty:Number(qty),price:Number(orderType==="MARKET"?price:limitPrice),type:orderType})}
            style={{padding:"12px 0",borderRadius:8,background:side==="BUY"?"#089981":"#f23645",color:"#fff",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",boxShadow:`0 4px 20px ${side==="BUY"?"rgba(8,153,129,0.4)":"rgba(242,54,69,0.4)"}`}}>
            {side} {qty} {sym} @ {orderType==="MARKET"?"Market":"₹"+limitPrice}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ALERT DIALOG ──────────────────────────────────────────────────
function AlertDialog({ sym, price, onClose, onSet }) {
  const [alertPrice, setAlertPrice] = useState(fmt(price*1.02));
  const [condition, setCondition] = useState("crosses_above");
  const [note, setNote] = useState("");
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)"}}>
      <div style={{width:320,background:"#1e222d",border:"1px solid rgba(245,158,11,0.3)",borderRadius:12,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        <div style={{padding:"14px 16px",background:"rgba(245,158,11,0.1)",borderBottom:"1px solid rgba(245,158,11,0.2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#f59e0b"}}>⊕ Set Alert — {sym}</div>
          <button onClick={onClose} style={{color:"#6b7280",fontSize:18,cursor:"pointer",border:"none",background:"none"}}>✕</button>
        </div>
        <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600}}>Condition</div>
            <select value={condition} onChange={e=>setCondition(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:12,outline:"none",cursor:"pointer"}}>
              <option value="crosses_above">Price crosses above</option>
              <option value="crosses_below">Price crosses below</option>
              <option value="touches">Price touches</option>
              <option value="percent_up">% up from current</option>
              <option value="percent_down">% down from current</option>
            </select>
          </div>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600}}>Alert Price</div>
            <input value={alertPrice} onChange={e=>setAlertPrice(e.target.value)} type="number"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600}}>Note (optional)</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:12,outline:"none"}}/>
          </div>
          <button onClick={()=>{onSet({sym,price:Number(alertPrice),condition,note});onClose();}}
            style={{padding:"10px 0",borderRadius:8,background:"rgba(245,158,11,0.2)",color:"#f59e0b",fontWeight:700,fontSize:13,border:"1px solid rgba(245,158,11,0.4)",cursor:"pointer"}}>
            Set Alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TOAST NOTIFICATION ────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return ()=>clearTimeout(t); }, []);
  const colors = { success:"#089981", error:"#f23645", info:"#2962ff", warning:"#f59e0b" };
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:2000,padding:"10px 18px",background:"#1e222d",border:`1px solid ${colors[type]||colors.info}`,borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:10,animation:"fadeUp 0.3s ease",minWidth:280}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:colors[type]||colors.info,boxShadow:`0 0 8px ${colors[type]||colors.info}`,flexShrink:0}}/>
      <span style={{fontSize:12,color:"#f1f5f9",fontWeight:500}}>{message}</span>
    </div>
  );
}

// ── MAIN TERMINAL ─────────────────────────────────────────────────
export default function TradingTerminal() {
  // Candle data store (per symbol)
  const [candleStore, setCandleStore] = useState(() => {
    const s = {};
    SYMBOLS.forEach(sym => { s[sym.sym] = generateCandles(sym.base, 600, sym.volatility); });
    return s;
  });

  const [activeSym, setActiveSym] = useState(SYMBOLS[0]);
  const [tfMode, setTfMode] = useState("intra");
  const [tf, setTf] = useState("1m");
  const [ct, setCt] = useState("candle");
  const [tool, setTool] = useState("cursor");
  const [dColor, setDColor] = useState("#3b82f6");
  const [activeInds, setActiveInds] = useState(["vol","ma","ema"]);
  const [showIndPanel, setShowIndPanel] = useState(false);
  const [draws, setDraws] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [rightPanel, setRightPanel] = useState("watchlist");
  const [bottomPanel, setBottomPanel] = useState(null);
  const [grid, setGrid] = useState(true);
  const [logScale, setLogScale] = useState(false);
  const [symSearch, setSymSearch] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role:"assistant", text:"## 👋 TradEx AI Ready\n\nI'm your AI trading assistant powered by Claude. Ask me anything:\n\n- **Analyse NIFTY50** — technical analysis\n- **News for RELIANCE** — latest news\n- **Predict TCS price** — AI forecast\n- **What is RSI?** — indicator education\n- **Best entry for INFY** — trade setup\n\n*Not financial advice. Educational only.*" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [scalperMode, setScalerMode] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(null); // {side, price}
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [instantOrders, setInstantOrders] = useState(true);
  const [showTheme] = useState("dark");

  // Zoom & pan state
  const [viewOffset, setViewOffset] = useState(0); // bars from right (0 = latest)
  const [barsVisible, setBarsVisible] = useState(120); // zoom level
  const isPanning = useRef(false);
  const panStart = useRef(null);
  const panOffsetStart = useRef(0);

  // Price state
  const [prices, setPrices] = useState(() => {
    const p = {};
    SYMBOLS.forEach(s => {
      p[s.sym] = { price: s.base, prevPrice: s.base, chg: 0, chgPct: 0 };
    });
    return p;
  });
  const [xhair, setXhair] = useState(null);
  const [hoverC, setHoverC] = useState(null);

  // Positions & orders
  const [positions, setPositions] = useState([
    { sym:"RELIANCE", exch:"NSE", qty:5,  avg:2850.00, side:"long" },
    { sym:"TCS",      exch:"NSE", qty:3,  avg:3820.00, side:"long" },
    { sym:"INFY",     exch:"NSE", qty:10, avg:1780.00, side:"long" },
  ]);
  const [orders, setOrders] = useState([
    { id:"ORD001",sym:"INFY",    exch:"NSE",type:"Limit", side:"BUY", qty:10, price:1800,status:"OPEN",   time:"09:15" },
    { id:"ORD002",sym:"HDFCBANK",exch:"NSE",type:"SL-M",  side:"SELL",qty:5,  price:1670,status:"OPEN",   time:"10:22" },
    { id:"ORD003",sym:"SBIN",    exch:"NSE",type:"Market",side:"BUY", qty:50, price:0,   status:"COMPLETE",time:"11:05" },
  ]);

  const cvs = useRef(null);
  const raf = useRef(null);
  const chatEndRef = useRef(null);

  const addToast = (message, type="info") => {
    const id = Date.now();
    setToasts(p=>[...p, {id,message,type}]);
  };

  // ── LIVE TICK SIMULATION ─────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setCandleStore(prev => {
        const next = {...prev};
        SYMBOLS.forEach(sym => {
          const candles = [...prev[sym.sym]];
          if (!candles.length) return;
          const last = {...candles[candles.length-1]};
          const drift = (Math.random()-0.488) * last.close * sym.volatility * 0.1;
          last.close = Math.max(last.close + drift, last.close * 0.995);
          last.high = Math.max(last.high, last.close);
          last.low = Math.min(last.low, last.close);
          last.volume += Math.random() * 5000;
          candles[candles.length-1] = last;
          next[sym.sym] = candles;
        });
        return next;
      });
      setPrices(prev => {
        const n = {...prev};
        SYMBOLS.forEach(sym => {
          const candles = candleStore[sym.sym];
          if (!candles?.length) return;
          const last = candles[candles.length-1];
          const first = candles[0];
          n[sym.sym] = {
            price: last.close,
            prevPrice: prev[sym.sym].price,
            chg: last.close - first.close,
            chgPct: ((last.close - first.close)/first.close)*100,
          };
        });
        return n;
      });
    }, 800);
    return () => clearInterval(iv);
  }, [candleStore]);

  // ── NEW CANDLE every minute ──────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setCandleStore(prev => {
        const next = {...prev};
        SYMBOLS.forEach(sym => {
          const candles = [...prev[sym.sym]];
          if (!candles.length) return;
          const last = candles[candles.length-1];
          const newCandle = {
            open: last.close,
            high: last.close * (1 + Math.random()*0.005),
            low:  last.close * (1 - Math.random()*0.005),
            close:last.close * (1 + (Math.random()-0.48)*0.008),
            volume: 50000 + Math.random()*500000,
            time: Date.now(),
          };
          next[sym.sym] = [...candles.slice(-599), newCandle];
        });
        return next;
      });
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // ── CHART INDICATORS COMPUTATION ─────────────────────────────────
  const computeMA = (data, period) => data.map((_,i) =>
    i<period-1 ? null : data.slice(i-period+1,i+1).reduce((a,x)=>a+x.close,0)/period
  );
  const computeEMA = (data, period) => {
    const k = 2/(period+1); let e = data[0]?.close||0;
    return data.map(c => { e = c.close*k + e*(1-k); return e; });
  };
  const computeRSI = (data, period=14) => {
    return data.map((_,i) => {
      if (i<period) return null;
      let g=0,l=0;
      for (let j=i-period+1;j<=i;j++) { const d=data[j].close-data[j-1].close; d>0?g+=d:l-=d; }
      return l===0?100:100-100/(1+g/l);
    });
  };

  // ── DRAW CHART ───────────────────────────────────────────────────
  const drawChart = useCallback(() => {
    const el = cvs.current; if (!el) return;
    const ctx = el.getContext("2d");
    const DPR = window.devicePixelRatio||1;
    const W = el.offsetWidth, H = el.offsetHeight;
    if (el.width!==W*DPR||el.height!==H*DPR) { el.width=W*DPR; el.height=H*DPR; ctx.scale(DPR,DPR); }
    ctx.clearRect(0,0,W,H);

    const allCandles = candleStore[activeSym.sym] || [];
    if (!allCandles.length) return;

    // Apply heikin ashi transform
    let data = allCandles;
    if (ct==="heikin") {
      data = allCandles.map((c,i) => {
        const C = (c.open+c.high+c.low+c.close)/4;
        const O = i>0 ? (allCandles[i-1].open+allCandles[i-1].close)/2 : (c.open+c.close)/2;
        return {...c, open:O, close:C, high:Math.max(c.high,O,C), low:Math.min(c.low,O,C)};
      });
    }

    // Subpanel heights
    const HAS_VOL   = activeInds.includes("vol");
    const HAS_RSI   = activeInds.includes("rsi");
    const HAS_MACD  = activeInds.includes("macd");
    const HAS_STOCH = activeInds.includes("stoch");
    const HAS_ATR   = activeInds.includes("atr");
    const HAS_OBV   = activeInds.includes("obv");
    const HAS_CCI   = activeInds.includes("cci");
    const subPanels = [HAS_RSI,HAS_MACD,HAS_STOCH,HAS_ATR,HAS_OBV,HAS_CCI].filter(Boolean).length;
    const VOL_H = HAS_VOL ? 64 : 0;
    const SUB_H = 76;
    const MAIN_H = H - VOL_H - subPanels*SUB_H;
    const PT = 26, RP = 76, LP = 4;
    const chartW = W - RP - LP;

    // Pan/zoom: which candles are visible
    const maxBars = Math.min(barsVisible, data.length);
    const startIdx = Math.max(0, data.length - maxBars - viewOffset);
    const endIdx   = Math.max(1, data.length - viewOffset);
    const vis = data.slice(startIdx, endIdx);
    if (!vis.length) return;

    // Price range
    const highs = vis.map(c=>c.high), lows = vis.map(c=>c.low);
    let maxP = Math.max(...highs), minP = Math.min(...lows);
    const pad = (maxP-minP)*0.06;
    maxP+=pad; minP-=pad;
    if (maxP===minP) { maxP+=1; minP-=1; }
    const pRng = maxP-minP;
    const cW = chartW/vis.length;
    const bW = Math.max(Math.min(cW*0.72, 14), 1);

    const toY = p => {
      if (logScale) {
        const logMin = Math.log(minP), logMax = Math.log(maxP);
        return PT + (1-(Math.log(p)-logMin)/(logMax-logMin))*(MAIN_H-PT-2);
      }
      return PT + (1-(p-minP)/pRng)*(MAIN_H-PT-2);
    };
    const fromY = y => minP + (1-(y-PT)/(MAIN_H-PT-2))*pRng;

    // Background
    ctx.fillStyle = "#0f1117"; ctx.fillRect(0,0,W,H);
    // Main chart bg
    ctx.fillStyle = "#131722"; ctx.fillRect(0,0,W,MAIN_H+VOL_H);

    // ── GRID ────────────────────────────────────────────────────────
    if (grid) {
      ctx.font = "9px 'JetBrains Mono',monospace";
      // Horizontal
      const priceStep = (maxP-minP)/6;
      for (let i=0; i<=6; i++) {
        const pr = minP + i*priceStep;
        const y = toY(pr);
        ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth=1; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(LP,y); ctx.lineTo(W-RP,y); ctx.stroke();
        ctx.fillStyle = "rgba(120,130,150,0.5)"; ctx.textAlign="right";
        ctx.fillText(fmt(pr), W-2, y+3);
      }
      // Vertical time labels
      const step = Math.max(1, Math.floor(vis.length/10));
      vis.forEach((c,i) => {
        if (i%step!==0) return;
        const x = LP+(i+0.5)*cW;
        ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x,PT); ctx.lineTo(x,MAIN_H+VOL_H); ctx.stroke();
        const d = new Date(c.time);
        ctx.fillStyle = "rgba(80,96,115,0.7)"; ctx.textAlign="center";
        const label = tfMode==="intra"
          ? d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0")
          : d.getDate()+"/"+String(d.getMonth()+1).padStart(2,"0");
        ctx.fillText(label, x, MAIN_H+VOL_H-2);
      });
    }

    // ── OVERLAY INDICATORS ──────────────────────────────────────────
    const drawLine2 = (vals, color, lw=1.2, dash=[]) => {
      ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.setLineDash(dash);
      ctx.shadowColor=color+"55"; ctx.shadowBlur=3;
      ctx.beginPath(); let started=false;
      vals.forEach((v,i)=>{ if(v==null)return; const x=LP+(i+0.5)*cW,y=toY(v); !started?(ctx.moveTo(x,y),started=true):ctx.lineTo(x,y); });
      ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur=0;
    };
    if (activeInds.includes("ma")) drawLine2(computeMA(vis,20), "#3b82f6");
    if (activeInds.includes("ema"))  drawLine2(computeEMA(vis,9),  "#f59e0b");
    if (activeInds.includes("ema2")) drawLine2(computeEMA(vis,21), "#ec4899");
    if (activeInds.includes("vwap")) {
      let cvp=0,cv=0;
      const vals = vis.map(c=>{ const tp=(c.high+c.low+c.close)/3; cvp+=tp*c.volume; cv+=c.volume; return cvp/cv; });
      drawLine2(vals, "#8b5cf6", 1.4, [5,3]);
    }
    if (activeInds.includes("bb")) {
      const per=20; const up=[],lo=[],mid=[];
      vis.forEach((_,i)=>{
        if(i<per-1){up.push(null);lo.push(null);mid.push(null);return;}
        const sl=vis.slice(i-per+1,i+1).map(x=>x.close);
        const mn=sl.reduce((a,b)=>a+b,0)/per;
        const sd=Math.sqrt(sl.reduce((a,b)=>a+(b-mn)**2,0)/per);
        up.push(mn+2*sd); lo.push(mn-2*sd); mid.push(mn);
      });
      drawLine2(up, "rgba(16,185,129,0.55)", 1, [4,2]);
      drawLine2(lo, "rgba(16,185,129,0.55)", 1, [4,2]);
      drawLine2(mid,"rgba(16,185,129,0.35)", 0.8);
      // Fill between bands
      ctx.beginPath(); let s=false;
      up.forEach((v,i)=>{ if(v==null)return; const x=LP+(i+0.5)*cW,y=toY(v); !s?(ctx.moveTo(x,y),s=true):ctx.lineTo(x,y); });
      for(let i=lo.length-1;i>=0;i--){ if(lo[i]==null)continue; ctx.lineTo(LP+(i+0.5)*cW,toY(lo[i])); }
      ctx.closePath(); ctx.fillStyle="rgba(16,185,129,0.04)"; ctx.fill();
    }
    if (activeInds.includes("psar")) {
      // Simple PSAR approximation
      const vals = vis.map((c,i)=>i%2===0?c.high*1.001:c.low*0.999);
      vals.forEach((v,i)=>{
        const x=LP+(i+0.5)*cW, y=toY(v);
        ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2);
        ctx.fillStyle="#f97316"; ctx.fill();
      });
    }

    // ── CANDLES / BARS / LINES ──────────────────────────────────────
    const bull="#089981", bear="#f23645";
    if (ct==="line"||ct==="area"||ct==="baseline") {
      const baseline = ct==="baseline" ? (minP+maxP)/2 : null;
      ctx.beginPath();
      vis.forEach((c,i)=>{ const x=LP+(i+0.5)*cW,y=toY(c.close); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      if (ct==="area"||ct==="baseline") {
        const grad=ctx.createLinearGradient(0,PT,0,MAIN_H);
        grad.addColorStop(0,"rgba(41,98,255,0.3)"); grad.addColorStop(1,"rgba(41,98,255,0)");
        ctx.lineTo(LP+(vis.length-0.5)*cW,MAIN_H); ctx.lineTo(LP+0.5*cW,MAIN_H);
        ctx.closePath(); ctx.fillStyle=grad; ctx.fill(); ctx.beginPath();
        vis.forEach((c,i)=>{ const x=LP+(i+0.5)*cW,y=toY(c.close); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      }
      ctx.strokeStyle=ct==="baseline"?"#2962ff":"#2962ff"; ctx.lineWidth=1.8; ctx.setLineDash([]); ctx.shadowBlur=0; ctx.stroke();
      if (ct==="baseline"&&baseline) {
        const by=toY(baseline);
        ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(LP,by); ctx.lineTo(W-RP,by); ctx.stroke(); ctx.setLineDash([]);
      }
    } else {
      vis.forEach((c,i)=>{
        const x=LP+i*cW, cx=x+cW/2;
        const up=c.close>=c.open, col=up?bull:bear;
        if (ct==="candle"||ct==="heikin") {
          ctx.strokeStyle=col; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(cx,toY(c.high)); ctx.lineTo(cx,toY(c.low)); ctx.stroke();
          const bT=toY(Math.max(c.open,c.close)), bB=toY(Math.min(c.open,c.close)), bh=Math.max(bB-bT,1);
          ctx.fillStyle=up?bull:bear; ctx.fillRect(cx-bW/2,bT,bW,bh);
        } else if (ct==="bar") {
          ctx.strokeStyle=col; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(cx,toY(c.high)); ctx.lineTo(cx,toY(c.low)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx-bW/2,toY(c.open)); ctx.lineTo(cx,toY(c.open)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx,toY(c.close)); ctx.lineTo(cx+bW/2,toY(c.close)); ctx.stroke();
        }
      });
    }

    // ── VOLUME ──────────────────────────────────────────────────────
    if (HAS_VOL) {
      const VT = MAIN_H;
      ctx.fillStyle="#131722"; ctx.fillRect(0,VT,W,VOL_H);
      ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,VT); ctx.lineTo(W,VT); ctx.stroke();
      const maxV=Math.max(...vis.map(c=>c.volume));
      vis.forEach((c,i)=>{
        const up=c.close>=c.open, x=LP+i*cW;
        const vh=(c.volume/maxV)*(VOL_H-8);
        ctx.fillStyle=up?"rgba(8,153,129,0.5)":"rgba(242,54,69,0.5)";
        ctx.fillRect(x+cW*0.1,VT+(VOL_H-8-vh),cW*0.8,vh);
      });
      // Vol MA
      const vma=computeMA(vis.map((c,i)=>({...c,close:c.volume,open:c.volume,high:c.volume,low:c.volume})),20);
      ctx.strokeStyle="rgba(135,206,235,0.5)"; ctx.lineWidth=1; ctx.beginPath();
      vma.forEach((v,i)=>{ if(!v)return; const x=LP+(i+0.5)*cW,y=VT+(VOL_H-8-(v/maxV)*(VOL_H-8)); i===0||!vma[i-1]?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke();
      ctx.fillStyle="rgba(80,100,120,0.6)"; ctx.font="8px 'JetBrains Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("VOL",LP+4,VT+9);
    }

    // ── SUB PANELS ──────────────────────────────────────────────────
    let subY = MAIN_H + VOL_H;

    const drawSubPanel = (label, color, lineVals, levelLines=[]) => {
      const ST=subY; subY+=SUB_H;
      ctx.fillStyle="#0e1117"; ctx.fillRect(0,ST,W,SUB_H);
      ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,ST); ctx.lineTo(W,ST); ctx.stroke();
      ctx.fillStyle="#475569"; ctx.font="bold 8px 'JetBrains Mono',monospace"; ctx.textAlign="left";
      ctx.fillText(label,LP+4,ST+10);
      const mn=Math.min(...lineVals.filter(v=>v!=null));
      const mx=Math.max(...lineVals.filter(v=>v!=null));
      const rng=mx-mn||1;
      const sTY = v=>ST+12+(1-(v-mn)/rng)*(SUB_H-20);
      levelLines.forEach(({v,col})=>{
        const y=sTY(v);
        ctx.strokeStyle=col||"rgba(255,255,255,0.08)"; ctx.setLineDash([2,3]);
        ctx.beginPath(); ctx.moveTo(LP,y); ctx.lineTo(W-RP,y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle="rgba(100,116,139,0.5)"; ctx.textAlign="right"; ctx.font="8px 'JetBrains Mono',monospace";
        ctx.fillText(v.toFixed(0),W-2,y+3);
      });
      ctx.strokeStyle=color; ctx.lineWidth=1.3; ctx.setLineDash([]);
      ctx.shadowColor=color+"44"; ctx.shadowBlur=2;
      ctx.beginPath(); let s=false;
      lineVals.forEach((v,i)=>{ if(v==null)return; const x=LP+(i+0.5)*cW,y=sTY(v); !s?(ctx.moveTo(x,y),s=true):ctx.lineTo(x,y); });
      ctx.stroke(); ctx.shadowBlur=0;
      // Current value label
      const last=lineVals.filter(v=>v!=null).at(-1);
      if (last!=null) {
        const ly=sTY(last);
        ctx.fillStyle=color; ctx.fillRect(W-RP,ly-8,RP-1,16);
        ctx.fillStyle="#000"; ctx.textAlign="center"; ctx.font="bold 9px 'JetBrains Mono',monospace";
        ctx.fillText(last.toFixed(1),W-RP+(RP-1)/2,ly+3);
      }
    };

    if (HAS_RSI) {
      const rsi=computeRSI(vis);
      drawSubPanel("RSI(14)","#ec4899",rsi,[{v:70,col:"rgba(242,54,69,0.3)"},{v:50,col:"rgba(255,255,255,0.08)"},{v:30,col:"rgba(8,153,129,0.3)"}]);
    }
    if (HAS_MACD) {
      const emaFn=(d,p)=>{ const k=2/(p+1);let e=d[0];return d.map(v=>{e=v*k+e*(1-k);return e;}); };
      const cl=vis.map(c=>c.close);
      const e12=emaFn(cl,12),e26=emaFn(cl,26);
      const macdL=e12.map((v,i)=>v-e26[i]);
      const sig=emaFn(macdL,9);
      // MACD histogram
      const ST=subY; const endY=subY+SUB_H;
      ctx.fillStyle="#0e1117"; ctx.fillRect(0,ST,W,SUB_H);
      ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,ST); ctx.lineTo(W,ST); ctx.stroke();
      ctx.fillStyle="#475569"; ctx.font="bold 8px 'JetBrains Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("MACD(12,26,9)",LP+4,ST+10);
      const hist=macdL.map((v,i)=>v-sig[i]);
      const maxH=Math.max(...hist.map(Math.abs))||1;
      const mid2=ST+SUB_H/2;
      ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.moveTo(LP,mid2); ctx.lineTo(W-RP,mid2); ctx.stroke();
      hist.forEach((h,i)=>{
        const x=LP+i*cW, bh=Math.abs(h/maxH)*(SUB_H/2-12);
        ctx.fillStyle=h>=0?"rgba(8,153,129,0.65)":"rgba(242,54,69,0.65)";
        ctx.fillRect(x+cW*0.15,h>=0?mid2-bh:mid2,cW*0.7,bh);
      });
      const mn2=Math.min(...macdL),mx2=Math.max(...macdL);
      const rng2=mx2-mn2||1;
      const sTY2=v=>ST+12+(1-(v-mn2)/rng2)*(SUB_H-20);
      ctx.strokeStyle="#06b6d4"; ctx.lineWidth=1; ctx.beginPath();
      macdL.forEach((v,i)=>{ const x=LP+(i+0.5)*cW,y=sTY2(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke();
      ctx.strokeStyle="#f59e0b"; ctx.lineWidth=1; ctx.setLineDash([3,2]); ctx.beginPath();
      sig.forEach((v,i)=>{ const x=LP+(i+0.5)*cW,y=sTY2(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke(); ctx.setLineDash([]);
      subY=endY;
    }
    if (HAS_STOCH) {
      const per=14,sma=3;
      const kv=vis.map((_,i)=>{ if(i<per-1)return null; const sl=vis.slice(i-per+1,i+1); const hi=Math.max(...sl.map(c=>c.high)),lo=Math.min(...sl.map(c=>c.low)); return hi===lo?50:(vis[i].close-lo)/(hi-lo)*100; });
      const dv=kv.map((_,i)=>i<sma-1||kv[i]==null?null:kv.slice(i-sma+1,i+1).reduce((a,x)=>a+(x||0),0)/sma);
      const ST=subY; subY+=SUB_H;
      ctx.fillStyle="#0e1117"; ctx.fillRect(0,ST,W,SUB_H);
      ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,ST); ctx.lineTo(W,ST); ctx.stroke();
      ctx.fillStyle="#475569"; ctx.font="bold 8px 'JetBrains Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("Stoch(14,3)",LP+4,ST+10);
      const sTY=v=>ST+12+(1-v/100)*(SUB_H-20);
      [20,50,80].forEach(lv=>{
        const y=sTY(lv);
        ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.setLineDash([2,3]);
        ctx.beginPath(); ctx.moveTo(LP,y); ctx.lineTo(W-RP,y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle="rgba(80,100,120,0.5)"; ctx.textAlign="right"; ctx.font="8px 'JetBrains Mono',monospace";
        ctx.fillText(lv,W-2,y+3);
      });
      ctx.strokeStyle="#3b82f6"; ctx.lineWidth=1; ctx.beginPath();
      kv.forEach((v,i)=>{ if(v==null)return; const x=LP+(i+0.5)*cW,y=sTY(v); !i||kv[i-1]==null?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke();
      ctx.strokeStyle="#f97316"; ctx.lineWidth=1; ctx.setLineDash([2,2]); ctx.beginPath();
      dv.forEach((v,i)=>{ if(v==null)return; const x=LP+(i+0.5)*cW,y=sTY(v); !i||dv[i-1]==null?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke(); ctx.setLineDash([]);
    }
    if (HAS_ATR) {
      const atrV=vis.map((c,i)=>i===0?c.high-c.low:Math.max(c.high-c.low,Math.abs(c.high-vis[i-1].close),Math.abs(c.low-vis[i-1].close)));
      const per=14;
      const atrSm=atrV.map((_,i)=>i<per?null:atrV.slice(i-per+1,i+1).reduce((a,b)=>a+b,0)/per);
      drawSubPanel("ATR(14)","#84cc16",atrSm);
    }
    if (HAS_OBV) {
      let obv=0; const obvV=vis.map((c,i)=>{ obv+=i===0?c.volume:(c.close>=vis[i-1].close?c.volume:-c.volume); return obv; });
      drawSubPanel("OBV","#a78bfa",obvV);
    }
    if (HAS_CCI) {
      const per=20;
      const cciV=vis.map((_,i)=>{ if(i<per-1)return null; const sl=vis.slice(i-per+1,i+1); const tp=sl.map(c=>(c.high+c.low+c.close)/3); const mn=tp.reduce((a,b)=>a+b,0)/per; const md=tp.reduce((a,b)=>a+Math.abs(b-mn),0)/per; return md===0?0:(tp[tp.length-1]-mn)/(0.015*md); });
      drawSubPanel("CCI(20)","#34d399",cciV,[{v:100,col:"rgba(242,54,69,0.3)"},{v:0,col:"rgba(255,255,255,0.08)"},{v:-100,col:"rgba(8,153,129,0.3)"}]);
    }

    // ── LIVE PRICE LINE ──────────────────────────────────────────────
    const lastC = vis[vis.length-1]?.close;
    if (lastC) {
      const cy = toY(lastC);
      if (cy>PT && cy<MAIN_H) {
        const isUp = lastC >= (vis[vis.length-2]?.close||lastC);
        ctx.strokeStyle=isUp?"rgba(8,153,129,0.6)":"rgba(242,54,69,0.6)";
        ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(LP,cy); ctx.lineTo(W-RP,cy); ctx.stroke(); ctx.setLineDash([]);
        const tag=fmt(lastC);
        ctx.fillStyle=isUp?"#089981":"#f23645";
        ctx.fillRect(W-RP,cy-9,RP-1,18);
        ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.font="bold 9.5px 'JetBrains Mono',monospace";
        ctx.fillText(tag,W-RP+(RP-1)/2,cy+3);
      }
    }

    // ── ALERT LINES ──────────────────────────────────────────────────
    alerts.filter(a=>a.sym===activeSym.sym).forEach(a=>{
      if (a.price<minP||a.price>maxP) return;
      const ay=toY(a.price);
      ctx.strokeStyle="rgba(245,158,11,0.6)"; ctx.lineWidth=1; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(LP,ay); ctx.lineTo(W-RP,ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="#f59e0b"; ctx.font="9px 'JetBrains Mono',monospace"; ctx.textAlign="right";
      ctx.fillText(`⊕ ${fmt(a.price)}`,W-RP-2,ay-2);
    });

    // ── CROSSHAIR ───────────────────────────────────────────────────
    if (xhair && xhair.y<MAIN_H) {
      ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(xhair.x,PT); ctx.lineTo(xhair.x,MAIN_H+VOL_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LP,xhair.y); ctx.lineTo(W-RP,xhair.y); ctx.stroke();
      ctx.setLineDash([]);
      // Price label
      const hp=fromY(xhair.y);
      if (hp>0&&xhair.y>PT&&xhair.y<MAIN_H) {
        ctx.fillStyle="#2a3549"; ctx.fillRect(W-RP,xhair.y-9,RP-1,18);
        ctx.strokeStyle="rgba(255,255,255,0.12)"; ctx.lineWidth=1; ctx.strokeRect(W-RP,xhair.y-9,RP-1,18);
        ctx.fillStyle="#d1d5db"; ctx.textAlign="center"; ctx.font="9px 'JetBrains Mono',monospace";
        ctx.fillText(fmt(hp),W-RP+(RP-1)/2,xhair.y+3);
      }
      // Time label
      if (xhair.x>LP&&xhair.x<W-RP) {
        const idx=Math.floor((xhair.x-LP)/cW);
        if (idx>=0&&idx<vis.length) {
          const d=new Date(vis[idx].time);
          const label = tfMode==="intra"
            ? d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0")
            : d.getDate()+"/"+(d.getMonth()+1);
          ctx.fillStyle="#2a3549"; ctx.fillRect(xhair.x-28,MAIN_H+VOL_H-17,56,15);
          ctx.fillStyle="#d1d5db"; ctx.textAlign="center"; ctx.font="9px 'JetBrains Mono',monospace";
          ctx.fillText(label,xhair.x,MAIN_H+VOL_H-7);
        }
      }
    }

    // ── OHLCV HEADER ────────────────────────────────────────────────
    if (hoverC) {
      const up=hoverC.close>=hoverC.open;
      ctx.fillStyle="rgba(15,18,28,0.92)"; ctx.fillRect(LP,0,W,22);
      ctx.font="bold 10px 'JetBrains Mono',monospace"; ctx.textAlign="left";
      const items=[["O",hoverC.open,"#94a3b8"],["H",hoverC.high,"#089981"],["L",hoverC.low,"#f23645"],["C",hoverC.close,up?"#089981":"#f23645"],["V",fmtVol(hoverC.volume),"#6b7280"]];
      let xx=LP+6;
      items.forEach(([l,v,c])=>{
        ctx.fillStyle="#475569"; ctx.fillText(l+" ",xx,15); xx+=ctx.measureText(l+" ").width;
        ctx.fillStyle=c; const vs=typeof v==="string"?v:fmt(v); ctx.fillText(vs+"  ",xx,15); xx+=ctx.measureText(vs+"  ").width;
      });
    }

    // ── DRAWINGS ────────────────────────────────────────────────────
    ctx.textAlign="left";
    draws.forEach(d => {
      ctx.strokeStyle=d.color; ctx.lineWidth=1.8; ctx.setLineDash([]);
      ctx.shadowColor=d.color+"44"; ctx.shadowBlur=4;
      if (["line","ray","arrow"].includes(d.type)) {
        ctx.beginPath(); ctx.moveTo(d.x1,d.y1); ctx.lineTo(d.x2,d.y2); ctx.stroke();
        if (d.type==="arrow") {
          const a=Math.atan2(d.y2-d.y1,d.x2-d.x1);
          ctx.beginPath(); ctx.moveTo(d.x2,d.y2);
          ctx.lineTo(d.x2-12*Math.cos(a-0.4),d.y2-12*Math.sin(a-0.4));
          ctx.lineTo(d.x2-12*Math.cos(a+0.4),d.y2-12*Math.sin(a+0.4));
          ctx.closePath(); ctx.fillStyle=d.color; ctx.fill();
        }
      } else if (d.type==="hline") {
        ctx.beginPath(); ctx.moveTo(LP,d.y1); ctx.lineTo(W-RP,d.y1); ctx.stroke();
        const hp=fromY(d.y1);
        ctx.fillStyle=d.color+"cc"; ctx.font="9px 'JetBrains Mono',monospace"; ctx.textAlign="right";
        ctx.fillText(fmt(hp),W-RP-2,d.y1-2);
      } else if (d.type==="vline") {
        ctx.beginPath(); ctx.moveTo(d.x1,PT); ctx.lineTo(d.x1,MAIN_H+VOL_H); ctx.stroke();
      } else if (d.type==="rect") {
        ctx.strokeRect(d.x1,d.y1,d.x2-d.x1,d.y2-d.y1);
        ctx.fillStyle=d.color+"12"; ctx.fillRect(d.x1,d.y1,d.x2-d.x1,d.y2-d.y1);
      } else if (d.type==="circle") {
        const rx=Math.abs(d.x2-d.x1)/2,ry=Math.abs(d.y2-d.y1)/2;
        ctx.beginPath(); ctx.ellipse(d.x1+rx,d.y1+ry,rx,ry,0,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=d.color+"08"; ctx.fill();
      } else if (d.type==="triangle") {
        const mx=(d.x1+d.x2)/2;
        ctx.beginPath(); ctx.moveTo(mx,d.y1); ctx.lineTo(d.x1,d.y2); ctx.lineTo(d.x2,d.y2); ctx.closePath(); ctx.stroke();
        ctx.fillStyle=d.color+"0a"; ctx.fill();
      } else if (d.type==="fib") {
        const cols=["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#8b5cf6","#ec4899"];
        [0,0.236,0.382,0.5,0.618,0.786,1].forEach((lv,li)=>{
          const y=d.y1+(d.y2-d.y1)*lv;
          ctx.strokeStyle=cols[li]+"99"; ctx.shadowColor="transparent";
          ctx.beginPath(); ctx.moveTo(Math.min(d.x1,d.x2),y); ctx.lineTo(Math.max(d.x1,d.x2),y); ctx.stroke();
          const pr=fromY(y);
          ctx.fillStyle=cols[li]+"cc"; ctx.font="8px 'JetBrains Mono',monospace"; ctx.textAlign="left";
          ctx.fillText(`${(lv*100).toFixed(1)}% ${fmt(pr)}`,Math.min(d.x1,d.x2)+2,y-2);
        });
      } else if (d.type==="channel") {
        const dy=d.y2-d.y1;
        ctx.beginPath(); ctx.moveTo(d.x1,d.y1); ctx.lineTo(d.x2,d.y2); ctx.stroke();
        ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.moveTo(d.x1,d.y1+dy); ctx.lineTo(d.x2,d.y2+dy); ctx.stroke();
        ctx.setLineDash([]);
      } else if (d.type==="measure") {
        ctx.strokeRect(d.x1,d.y1,d.x2-d.x1,d.y2-d.y1);
        const p1=fromY(d.y1),p2=fromY(d.y2);
        const pct=((p2-p1)/p1*100).toFixed(2);
        ctx.fillStyle="rgba(20,26,40,0.85)"; ctx.fillRect((d.x1+d.x2)/2-40,(d.y1+d.y2)/2-8,80,16);
        ctx.fillStyle=p2>p1?"#089981":"#f23645"; ctx.font="bold 9px 'JetBrains Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(`${pct}%  Δ${fmt(Math.abs(p2-p1))}`,(d.x1+d.x2)/2,(d.y1+d.y2)/2+3);
      }
      ctx.shadowBlur=0;
    });

    // ── INSTANT ORDER BUTTONS ────────────────────────────────────────
    if (instantOrders && lastC) {
      const cy=toY(lastC);
      if (cy>PT+20&&cy<MAIN_H-20) {
        ctx.fillStyle="rgba(8,153,129,0.9)"; ctx.fillRect(LP+4,cy-20,76,17);
        ctx.fillStyle="rgba(242,54,69,0.9)"; ctx.fillRect(LP+86,cy-20,76,17);
        ctx.fillStyle="#fff"; ctx.font="bold 8.5px sans-serif"; ctx.textAlign="center";
        ctx.fillText(`B ${fmt(lastC)}`,LP+4+38,cy-9);
        ctx.fillText(`S ${fmt(lastC)}`,LP+86+38,cy-9);
      }
    }
  }, [candleStore, activeSym, xhair, draws, ct, activeInds, grid, hoverC, instantOrders, barsVisible, viewOffset, logScale, alerts, tfMode]);

  useEffect(() => {
    const ro = new ResizeObserver(()=>{ cancelAnimationFrame(raf.current); raf.current=requestAnimationFrame(drawChart); });
    if (cvs.current) ro.observe(cvs.current);
    return () => { ro.disconnect(); cancelAnimationFrame(raf.current); };
  }, [drawChart]);
  useEffect(() => { cancelAnimationFrame(raf.current); raf.current=requestAnimationFrame(drawChart); }, [drawChart]);

  // ── CANVAS EVENTS ────────────────────────────────────────────────
  const getXY = e => { const r=cvs.current.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; };

  const onMM = useCallback(e => {
    const {x,y} = getXY(e);
    setXhair({x,y});
    const allC = candleStore[activeSym.sym]||[];
    const W = cvs.current.offsetWidth, RP=76, LP=4;
    const n=Math.min(barsVisible, allC.length);
    const startIdx=Math.max(0,allC.length-n-viewOffset);
    const endIdx=Math.max(1,allC.length-viewOffset);
    const vis=allC.slice(startIdx,endIdx);
    const cW=(W-RP-LP)/vis.length;
    const idx=Math.floor((x-LP)/cW);
    if (idx>=0&&idx<vis.length) setHoverC(vis[idx]);
    // Pan
    if (isPanning.current && panStart.current) {
      const dx=x-panStart.current;
      const allCandles=candleStore[activeSym.sym]||[];
      const n2=Math.min(barsVisible,allCandles.length);
      const cW2=(W-RP-LP)/n2;
      const delta=Math.round(dx/cW2);
      const newOff=clamp(panOffsetStart.current-delta,0,allCandles.length-n2);
      setViewOffset(newOff);
    }
    // Drawing preview
    if (drawing && drawStart) {
      cancelAnimationFrame(raf.current); raf.current=requestAnimationFrame(()=>{
        drawChart();
        const ctx2=cvs.current?.getContext("2d"); if(!ctx2)return;
        ctx2.strokeStyle=dColor; ctx2.lineWidth=1.5; ctx2.setLineDash([]);
        if (["line","ray","arrow"].includes(tool)) { ctx2.beginPath(); ctx2.moveTo(drawStart.x,drawStart.y); ctx2.lineTo(x,y); ctx2.stroke(); }
        else if (tool==="rect") { ctx2.strokeRect(drawStart.x,drawStart.y,x-drawStart.x,y-drawStart.y); }
        else if (tool==="circle") { const rx=Math.abs(x-drawStart.x)/2,ry=Math.abs(y-drawStart.y)/2; ctx2.beginPath(); ctx2.ellipse(drawStart.x+rx,drawStart.y+ry,rx,ry,0,0,Math.PI*2); ctx2.stroke(); }
        else if (tool==="fib"||tool==="channel"||tool==="measure"||tool==="triangle") { ctx2.beginPath(); ctx2.moveTo(drawStart.x,drawStart.y); ctx2.lineTo(x,y); ctx2.stroke(); }
      });
    }
  }, [drawChart, candleStore, activeSym, barsVisible, viewOffset, drawing, drawStart, dColor, tool]);

  const onMD = useCallback(e => {
    const {x,y} = getXY(e);
    if (tool==="cursor"||tool==="crosshair") { isPanning.current=true; panStart.current=x; panOffsetStart.current=viewOffset; return; }
    if (tool==="hline") { setDraws(p=>[...p,{type:"hline",x1:0,y1:y,color:dColor}]); return; }
    if (tool==="vline") { setDraws(p=>[...p,{type:"vline",x1:x,y1:0,color:dColor}]); return; }
    if (tool==="erase") {
      setDraws(p=>p.filter(d=>{
        const mx=(d.x1+(d.x2||d.x1))/2, my=(d.y1+(d.y2||d.y1))/2;
        return Math.hypot(mx-x,my-y)>25;
      })); return;
    }
    // Check instant order click
    if (instantOrders && tool==="cursor") {
      const allC=candleStore[activeSym.sym]||[];
      const lastC=allC[allC.length-1]?.close||0;
      if (x>=4&&x<=80) { setShowOrderDialog({side:"BUY",price:lastC}); return; }
      if (x>=86&&x<=162) { setShowOrderDialog({side:"SELL",price:lastC}); return; }
    }
    setDrawing(true); setDrawStart({x,y});
  }, [tool, dColor, viewOffset, instantOrders, candleStore, activeSym]);

  const onMU = useCallback(e => {
    isPanning.current=false; panStart.current=null;
    if (!drawing||!drawStart) return;
    const {x,y}=getXY(e);
    if (Math.abs(x-drawStart.x)>3||Math.abs(y-drawStart.y)>3)
      setDraws(p=>[...p,{type:tool,x1:drawStart.x,y1:drawStart.y,x2:x,y2:y,color:dColor}]);
    setDrawing(false); setDrawStart(null);
  }, [drawing, drawStart, tool, dColor]);

  const onWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.12 : 0.88;
    setBarsVisible(prev => clamp(Math.round(prev*delta), 20, 600));
  }, []);

  useEffect(() => {
    const el = cvs.current; if(!el) return;
    el.addEventListener("wheel", onWheel, {passive:false});
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      const k=e.key.toLowerCase();
      if (k==="escape") setTool("cursor");
      else if (k==="t") setTool("line");
      else if (k==="h") setTool("hline");
      else if (k==="v") setTool("vline");
      else if (k==="r") setTool("rect");
      else if (k==="f") setTool("fib");
      else if (k==="x") setTool("text");
      else if (k==="delete"||k==="backspace") setDraws(p=>p.slice(0,-1));
      else if ((e.ctrlKey||e.metaKey)&&k==="z") setDraws(p=>p.slice(0,-1));
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  }, []);

  // ── AI ASSISTANT ─────────────────────────────────────────────────
  const sendAI = async () => {
    if (!aiInput.trim()||aiLoading) return;
    const q = aiInput.trim(); setAiInput(""); setAiLoading(true);
    setAiMessages(p=>[...p,{role:"user",text:q}]);
    const allC=candleStore[activeSym.sym]||[];
    const lastC=allC[allC.length-1];
    const openC=allC[allC.length-20]||allC[0];
    const rsi=computeRSI(allC.slice(-50)).filter(v=>v!=null).at(-1);
    const maVal=computeMA(allC.slice(-25),20).at(-1);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are TradEx AI, an expert Indian stock market trading assistant. 
You analyze charts with technical precision like a professional trader.
Current instrument: ${activeSym.sym} (${activeSym.name}) on ${activeSym.exch}
Current price: ₹${fmt(lastC?.close)} | Open: ₹${fmt(openC?.close)} | High: ₹${fmt(Math.max(...allC.slice(-20).map(c=>c.high)))} | Low: ₹${fmt(Math.min(...allC.slice(-20).map(c=>c.low)))}
RSI(14): ${rsi?.toFixed(1)||"N/A"} | MA(20): ₹${fmt(maVal)}
Active indicators: ${activeInds.join(", ")} | Timeframe: ${tf} | Chart type: ${ct}
Respond in markdown with specific price levels, percentages, and actionable insights.
Always end with a disclaimer: *Not financial advice. Educational only.*`,
          messages:[
            ...aiMessages.slice(-6).map(m=>({role:m.role,content:m.text})),
            {role:"user",content:q}
          ]
        })
      });
      const data=await resp.json();
      const text=data.content?.[0]?.text||"Sorry, I couldn't process that request.";
      setAiMessages(p=>[...p,{role:"assistant",text}]);
    } catch(err) {
      setAiMessages(p=>[...p,{role:"assistant",text:"⚠️ Connection error. Please check your network and try again."}]);
    }
    setAiLoading(false);
  };

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[aiMessages]);

  // ── HELPERS ──────────────────────────────────────────────────────
  const livePrice = sym => prices[sym.sym]?.price || sym.base;
  const activePrice = livePrice(activeSym);
  const activeChgPct = prices[activeSym.sym]?.chgPct||0;
  const isUp = activeChgPct >= 0;
  const totalPnl = positions.reduce((s,p)=>s+((prices[p.sym]?.price||p.avg)-p.avg)*p.qty*(p.side==="short"?-1:1),0);
  const filtSym = SYMBOLS.filter(s=>s.sym.toLowerCase().includes(symSearch.toLowerCase())||s.name.toLowerCase().includes(symSearch.toLowerCase()));

  const handleOrder = (o) => {
    setOrders(p=>[{id:`ORD${Date.now()}`,sym:o.sym,exch:activeSym.exch,type:o.type,side:o.side,qty:o.qty,price:o.price,status:o.type==="MARKET"?"COMPLETE":"OPEN",time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}, ...p]);
    if (o.side==="BUY"&&o.type==="MARKET") {
      setPositions(p=>{
        const ex=p.find(x=>x.sym===o.sym);
        if (ex) return p.map(x=>x.sym===o.sym?{...x,qty:x.qty+o.qty,avg:(x.avg*x.qty+o.price*o.qty)/(x.qty+o.qty)}:x);
        return [...p,{sym:o.sym,exch:activeSym.exch,qty:o.qty,avg:o.price,side:"long"}];
      });
    }
    setShowOrderDialog(null);
    addToast(`${o.side} ${o.qty} ${o.sym} @ ₹${fmt(o.price)} — Order placed!`, o.side==="BUY"?"success":"error");
  };

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Geist','Inter','Helvetica Neue',sans-serif",background:"#0f1117",color:"#d1d5db",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",fontSize:12}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        button{cursor:pointer;border:none;background:none;color:inherit;font:inherit;}
        input,select,textarea{outline:none;border:none;background:none;color:inherit;font:inherit;}
        ::-webkit-scrollbar{width:3px;height:3px;background:transparent;}
        ::-webkit-scrollbar-thumb{background:#2a2e3a;border-radius:2px;}
        .mono{font-family:'JetBrains Mono',monospace;}
        .nav-link{color:#6b7280;font-size:12px;font-weight:500;padding:0 4px;transition:color 0.12s;cursor:pointer;}
        .nav-link:hover{color:#f1f5f9;}
        .nav-active{color:#2962ff!important;font-weight:700;}
        .tool-btn{width:30px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;color:#6b7280;transition:all 0.12s;cursor:pointer;font-size:11px;}
        .tool-btn:hover{background:rgba(255,255,255,0.06);color:#d1d5db;}
        .tool-active{background:rgba(41,98,255,0.18)!important;color:#3b82f6!important;}
        .ind-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.07);font-size:10px;font-weight:600;color:#6b7280;cursor:pointer;transition:all 0.12s;font-family:'JetBrains Mono',monospace;white-space:nowrap;}
        .ind-chip:hover{border-color:rgba(255,255,255,0.14);color:#9ca3af;}
        .ind-on{border-color:rgba(41,98,255,0.4)!important;background:rgba(41,98,255,0.1)!important;color:#60a5fa!important;}
        .tf-btn{padding:2px 7px;border-radius:3px;font-size:10.5px;font-weight:600;color:#6b7280;font-family:'JetBrains Mono',monospace;transition:all 0.12s;}
        .tf-btn:hover{color:#d1d5db;background:rgba(255,255,255,0.05);}
        .tf-active{background:rgba(255,255,255,0.1)!important;color:#f1f5f9!important;}
        .rp-tab{display:flex;flex-direction:column;align-items:center;padding:10px 0;cursor:pointer;border-left:2px solid transparent;transition:all 0.12s;gap:4px;width:100%;}
        .rp-tab:hover{background:rgba(255,255,255,0.03);}
        .rp-tab-active{background:rgba(41,98,255,0.07)!important;border-left-color:#2962ff!important;}
        .t-row{cursor:pointer;} .t-row:hover td{background:rgba(255,255,255,0.025);}
        .t-head{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4b5563;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05);}
        .t-cell{padding:6px 8px;font-size:10.5px;border-bottom:1px solid rgba(255,255,255,0.03);}
        .buy-btn{background:#089981;color:#fff;font-weight:700;font-size:11px;padding:5px 14px;border-radius:4px;transition:all 0.12s;}
        .buy-btn:hover{background:#0ab59e;box-shadow:0 0 16px rgba(8,153,129,0.4);}
        .sell-btn{background:#f23645;color:#fff;font-weight:700;font-size:11px;padding:5px 14px;border-radius:4px;transition:all 0.12s;}
        .sell-btn:hover{background:#ff4d5e;box-shadow:0 0 16px rgba(242,54,69,0.4);}
        .sym-row{cursor:pointer;border-left:2px solid transparent;transition:all 0.1s;}
        .sym-row:hover{background:rgba(255,255,255,0.025);}
        .sym-row-active{background:rgba(41,98,255,0.07)!important;border-left-color:#2962ff!important;}
        .ct-btn{padding:2px 6px;border-radius:3px;font-size:10px;color:#6b7280;transition:all 0.12s;font-weight:500;}
        .ct-btn:hover{color:#d1d5db;background:rgba(255,255,255,0.05);}
        .ct-active{background:rgba(255,255,255,0.08)!important;color:#f1f5f9!important;}
        .badge-up{background:rgba(8,153,129,0.15);color:#089981;border:1px solid rgba(8,153,129,0.2);padding:1px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;}
        .badge-dn{background:rgba(242,54,69,0.15);color:#f23645;border:1px solid rgba(242,54,69,0.2);padding:1px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;}
        .ai-msg-user{background:#1e293b;border-radius:8px 8px 0 8px;padding:8px 12px;max-width:88%;align-self:flex-end;}
        .ai-msg-bot{background:#0d1526;border:1px solid rgba(41,98,255,0.15);border-radius:8px 8px 8px 0;padding:10px 12px;max-width:97%;align-self:flex-start;}
        .toggle{width:32px;height:17px;border-radius:9px;transition:all 0.2s;display:flex;align-items:center;padding:2px;cursor:pointer;flex-shrink:0;}
        .toggle-on{background:#2962ff;}
        .toggle-off{background:#374151;}
        .toggle-thumb{width:13px;height:13px;border-radius:50%;background:#fff;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
        .depth-row{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;padding:2px 8px;font-size:10.5px;cursor:pointer;}
        .depth-row:hover{background:rgba(255,255,255,0.025);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes typing{0%,80%,100%{opacity:0}40%{opacity:1}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(41,98,255,0.4)}50%{box-shadow:0 0 0 4px rgba(41,98,255,0)}}
        .fade-up{animation:fadeUp 0.2s ease;}
        .live-dot{animation:blink 1.4s infinite;}
        .dot1{animation:typing 1.2s 0s infinite;display:block;width:4px;height:4px;border-radius:50%;background:#60a5fa;}
        .dot2{animation:typing 1.2s 0.2s infinite;display:block;width:4px;height:4px;border-radius:50%;background:#60a5fa;}
        .dot3{animation:typing 1.2s 0.4s infinite;display:block;width:4px;height:4px;border-radius:50%;background:#60a5fa;}
        .scalper-pulse{animation:pulse 2s infinite;}
        input[type=number]::-webkit-inner-spin-button{display:none;}
      `}</style>

      {/* ── TOP NAV ──────────────────────────────────────────────── */}
      <nav style={{height:44,background:"#1a1d2a",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",padding:"0 10px",gap:10,flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingRight:10,borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#2962ff,#1565c0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",letterSpacing:"-0.5px"}}>TX</div>
          <span style={{fontWeight:800,fontSize:13,color:"#f1f5f9",letterSpacing:"-0.3px"}}>TradEx</span>
        </div>
        {/* Index tickers */}
        <div style={{display:"flex",gap:18}}>
          {SYMBOLS.slice(0,3).map(s=>{
            const lv=prices[s.sym]||{price:s.base,chgPct:0};
            const up=lv.chgPct>=0;
            return (
              <div key={s.sym} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={()=>setActiveSym(s)}>
                <span style={{fontSize:10.5,fontWeight:700,color:"#64748b"}}>{s.sym}</span>
                <span className="mono" style={{fontSize:11.5,fontWeight:700,color:up?"#089981":"#f23645"}}>{fmt(lv.price)}</span>
                <span style={{fontSize:9.5,color:up?"#089981":"#f23645",fontFamily:"'JetBrains Mono',monospace"}}>{up?"▲":"▼"} {Math.abs(lv.chgPct).toFixed(2)}%</span>
              </div>
            );
          })}
        </div>
        {/* Search */}
        <div style={{flex:1,maxWidth:280,margin:"0 8px"}}>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:6,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#4b5563",fontSize:13}}>⌕</span>
            <input value={symSearch} onChange={e=>setSymSearch(e.target.value)} placeholder="Search symbols, indices, stocks..."
              style={{flex:1,fontSize:11,color:"#d1d5db"}}/>
            {symSearch&&<button onClick={()=>setSymSearch("")} style={{color:"#6b7280",fontSize:11}}>✕</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:14,paddingLeft:4}}>
          {["Markets","Charts","Portfolio","Orders","Tools"].map((l,i)=>(
            <span key={l} className={`nav-link ${i===1?"nav-active":""}`}>{l}</span>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button style={{position:"relative",fontSize:15,color:"#6b7280",padding:"2px 6px"}} title="Notifications">
            🔔<span style={{position:"absolute",top:0,right:0,width:7,height:7,borderRadius:"50%",background:"#f23645",border:"1px solid #1a1d2a"}}/>
          </button>
          <button onClick={()=>setShowAlertDialog(true)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,fontSize:10.5,fontWeight:700,border:"1px solid rgba(245,158,11,0.3)",background:"rgba(245,158,11,0.08)",color:"#f59e0b"}}>
            ⊕ Alert
          </button>
          <button onClick={()=>setShowAI(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:`1px solid rgba(41,98,255,${showAI?0.6:0.25})`,background:`rgba(41,98,255,${showAI?0.2:0.07})`,color:showAI?"#93c5fd":"#6b7280",transition:"all 0.15s"}}
            className={showAI?"scalper-pulse":""}>
            ✦ AI
          </button>
          <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:"0 2px 8px rgba(41,98,255,0.4)"}}>VC</div>
        </div>
      </nav>

      {/* ── CHART TOOLBAR ─────────────────────────────────────────── */}
      <div style={{height:38,background:"#1a1d2a",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:4,padding:"0 6px",flexShrink:0,overflowX:"auto"}}>
        {/* TF buttons */}
        <div style={{display:"flex",gap:0,paddingRight:7,borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          {(tfMode==="intra"?TF_INTRA:TF_DAY).map(t=>(
            <button key={t} className={`tf-btn ${tf===t?"tf-active":""}`} onClick={()=>setTf(t)}>{t}</button>
          ))}
          <button onClick={()=>setTfMode(m=>m==="intra"?"day":"intra")}
            style={{padding:"1px 6px",borderRadius:3,fontSize:9.5,color:"#4b5563",marginLeft:2,border:"1px solid rgba(255,255,255,0.06)"}}>
            {tfMode==="intra"?"D▾":"i▾"}
          </button>
        </div>
        {/* Chart types */}
        <div style={{display:"flex",gap:0,paddingRight:7,borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          {CHART_TYPES.map(({id,icon,label})=>(
            <button key={id} className={`ct-btn ${ct===id?"ct-active":""}`} title={label} onClick={()=>setCt(id)}>{icon}</button>
          ))}
        </div>
        {/* Indicators button */}
        <button onClick={()=>setShowIndPanel(v=>!v)}
          style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:4,fontSize:10.5,fontWeight:600,border:`1px solid rgba(255,255,255,${showIndPanel?0.14:0.06})`,background:showIndPanel?"rgba(255,255,255,0.05)":"transparent",color:showIndPanel?"#d1d5db":"#6b7280",transition:"all 0.12s",flexShrink:0}}>
          ƒ Indicators {activeInds.length>0&&<span style={{color:"#60a5fa",fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{activeInds.length}</span>}
        </button>
        {/* Active indicators */}
        <div style={{display:"flex",gap:4,overflow:"hidden",flex:1}}>
          {INDICATORS_LIST.filter(i=>activeInds.includes(i.id)).map(ind=>(
            <span key={ind.id} className="ind-chip ind-on" onClick={()=>setActiveInds(p=>p.filter(x=>x!==ind.id))}>
              <span style={{width:5,height:5,borderRadius:"50%",background:ind.color}}/>
              {ind.label}{ind.params} ✕
            </span>
          ))}
        </div>
        <div style={{flex:1}}/>
        {/* Options */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <button onClick={()=>setGrid(v=>!v)} className="tool-btn" title={grid?"Hide Grid":"Show Grid"} style={{color:grid?"#6b7280":"#374151"}}>⊞</button>
          <button onClick={()=>setLogScale(v=>!v)} className={`tool-btn ${logScale?"tool-active":""}`} title="Log Scale">log</button>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:10,color:"#6b7280",fontWeight:600}}>Instant</span>
            <div className={`toggle ${instantOrders?"toggle-on":"toggle-off"}`} onClick={()=>setInstantOrders(v=>!v)}>
              <div className="toggle-thumb" style={{transform:instantOrders?"translateX(15px)":"translateX(0)"}}/>
            </div>
          </div>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.06)"}}/>
          <button className="tool-btn" onClick={()=>setDraws(p=>p.slice(0,-1))} title="Undo (Ctrl+Z)">↩</button>
          <button className="tool-btn" onClick={()=>setDraws([])} title="Clear All">🗑</button>
          <button className="tool-btn" onClick={()=>{setViewOffset(0);setBarsVisible(120);}} title="Reset View">⊙</button>
          <button className="tool-btn" title="Alert" onClick={()=>setShowAlertDialog(true)} style={{color:"#f59e0b"}}>⊕</button>
          <button onClick={()=>setScalerMode(v=>!v)}
            className={scalperMode?"scalper-pulse":""}
            style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:700,border:`1px solid ${scalperMode?"rgba(41,98,255,0.5)":"rgba(255,255,255,0.07)"}`,background:scalperMode?"rgba(41,98,255,0.14)":"transparent",color:scalperMode?"#60a5fa":"#6b7280",transition:"all 0.15s"}}>
            ⚡ {scalperMode?"SCALPER ON":"SCALPER"}
          </button>
        </div>
      </div>

      {/* ── INDICATOR PANEL DROPDOWN ──────────────────────────────── */}
      {showIndPanel && (
        <div className="fade-up" style={{position:"absolute",top:128,left:240,zIndex:100,background:"#1a1d2a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:14,width:320,boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:"#4b5563",textTransform:"uppercase",marginBottom:10}}>Indicators</div>
          {["overlay","vol","sub"].map(type=>(
            <div key={type} style={{marginBottom:10}}>
              <div style={{fontSize:9,color:"#374151",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>{type==="overlay"?"Overlay":type==="vol"?"Volume":"Oscillators"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                {INDICATORS_LIST.filter(i=>i.type===type).map(ind=>(
                  <button key={ind.id} className={`ind-chip ${activeInds.includes(ind.id)?"ind-on":""}`}
                    onClick={()=>setActiveInds(p=>p.includes(ind.id)?p.filter(x=>x!==ind.id):[...p,ind.id])}
                    style={{justifyContent:"flex-start",padding:"4px 8px"}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:ind.color,flexShrink:0}}/>
                    {ind.label}{ind.params}
                    {activeInds.includes(ind.id)&&<span style={{marginLeft:"auto",color:"#60a5fa",fontSize:9}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={()=>{setActiveInds([]);setShowIndPanel(false);}} style={{width:"100%",marginTop:4,padding:"4px 0",borderRadius:4,border:"1px solid rgba(255,255,255,0.06)",color:"#6b7280",fontSize:10}}>Clear All</button>
        </div>
      )}

      {/* ── MAIN BODY ─────────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

        {/* LEFT TOOLBAR */}
        <div style={{width:34,background:"#1a1d2a",borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 0",gap:1,flexShrink:0,overflowY:"auto",zIndex:5}}>
          {DRAW_TOOLS.map(t=>(
            <button key={t.id} title={t.tip} className={`tool-btn ${tool===t.id?"tool-active":""}`} onClick={()=>setTool(t.id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.svg}/>
              </svg>
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{width:14,height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0"}}/>
          {["#2962ff","#089981","#f23645","#f59e0b","#8b5cf6","#ec4899","#ffffff","#64748b"].map(c=>(
            <button key={c} onClick={()=>setDColor(c)} title={c}
              style={{width:13,height:13,borderRadius:"50%",background:c,border:`2px solid ${dColor===c?"rgba(255,255,255,0.8)":"transparent"}`,margin:"1px 0",boxShadow:dColor===c?`0 0 6px ${c}`:""}}/>
          ))}
          <div style={{height:6}}/>
        </div>

        {/* CHART + SYMBOL HEADER */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
          {/* Symbol bar */}
          <div style={{padding:"4px 10px 3px",background:"#131722",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontWeight:800,fontSize:13,color:"#f1f5f9"}}>{activeSym.sym}</span>
              <span style={{fontSize:9.5,color:"#4b5563",fontFamily:"'JetBrains Mono',monospace",border:"1px solid rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:3}}>{activeSym.exch}</span>
            </div>
            <div className="mono" style={{fontSize:16,fontWeight:800,color:isUp?"#089981":"#f23645"}}>{fmt(activePrice)}</div>
            <span className={isUp?"badge-up":"badge-dn"}>{isUp?"▲":"▼"} {Math.abs(activeChgPct).toFixed(2)}%</span>
            <span className="mono" style={{fontSize:10,color:prices[activeSym.sym]?.chg>=0?"#089981":"#f23645"}}>
              {prices[activeSym.sym]?.chg>=0?"+":""}{fmt(prices[activeSym.sym]?.chg||0)}
            </span>
            <div style={{width:1,height:18,background:"rgba(255,255,255,0.07)"}}/>
            {/* Quick order */}
            <button className="buy-btn" onClick={()=>setShowOrderDialog({side:"BUY",price:activePrice})}>BUY</button>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <input value={orderQty} onChange={e=>setOrderQty(e.target.value)} type="number" min="1"
                style={{width:38,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,padding:"3px 6px",fontSize:11,color:"#f1f5f9",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
            <button className="sell-btn" onClick={()=>setShowOrderDialog({side:"SELL",price:activePrice})}>SELL</button>
            <div style={{width:1,height:18,background:"rgba(255,255,255,0.07)"}}/>
            {/* OHLCV on hover */}
            {hoverC && (
              <div style={{display:"flex",gap:10}}>
                {[["O",hoverC.open,"#94a3b8"],["H",hoverC.high,"#089981"],["L",hoverC.low,"#f23645"],["C",hoverC.close,hoverC.close>=hoverC.open?"#089981":"#f23645"]].map(([l,v,c])=>(
                  <span key={l} className="mono" style={{fontSize:10.5}}>
                    <span style={{color:"#6b7280"}}>{l} </span>
                    <span style={{color:c,fontWeight:600}}>{fmt(v)}</span>
                  </span>
                ))}
                <span className="mono" style={{fontSize:10,color:"#6b7280"}}>Vol <span style={{color:"#94a3b8"}}>{fmtVol(hoverC.volume)}</span></span>
              </div>
            )}
            <div style={{flex:1}}/>
            <span style={{display:"flex",alignItems:"center",gap:4,fontSize:9.5,color:"#089981"}}>
              <span className="live-dot" style={{width:5,height:5,borderRadius:"50%",background:"#089981",display:"block"}}/>LIVE
            </span>
            <span style={{fontSize:9.5,color:"#4b5563",fontFamily:"'JetBrains Mono',monospace"}}>
              {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </span>
          </div>

          {/* Canvas */}
          <div style={{flex:1,position:"relative",overflow:"hidden"}}>
            <canvas ref={cvs}
              style={{width:"100%",height:"100%",display:"block",cursor:tool==="cursor"||tool==="crosshair"?"crosshair":"crosshair"}}
              onMouseMove={onMM} onMouseDown={onMD} onMouseUp={onMU}
              onMouseLeave={()=>{setXhair(null);setHoverC(null);}}
              onDoubleClick={e=>{ const {x,y}=getXY(e); setDraws(p=>[...p,{type:"hline",x1:0,y1:y,color:dColor}]); }}
              onClick={e=>{ if(showIndPanel)setShowIndPanel(false); }}
            />
            {/* Zoom control overlay */}
            <div style={{position:"absolute",bottom:6,left:12,display:"flex",alignItems:"center",gap:6}}>
              <button onClick={()=>setBarsVisible(v=>clamp(Math.round(v*0.8),20,600))} style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.06)",color:"#6b7280",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              <span style={{fontSize:9,color:"#374151",fontFamily:"'JetBrains Mono',monospace"}}>{barsVisible}b</span>
              <button onClick={()=>setBarsVisible(v=>clamp(Math.round(v*1.25),20,600))} style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.06)",color:"#6b7280",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <button onClick={()=>{setViewOffset(0);setBarsVisible(120);}} style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.06)",color:"#6b7280",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>⊙</button>
            </div>
            <div style={{position:"absolute",bottom:6,right:82,fontSize:9,color:"#374151",fontFamily:"'JetBrains Mono',monospace"}}>
              Scroll to zoom · Drag to pan · Double-click: H-line
            </div>
          </div>

          {/* BOTTOM PANEL */}
          <div style={{background:"#131722",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",height:30,padding:"0 10px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              {[["pos","Positions",positions.length],["orders","Orders",orders.filter(o=>o.status==="OPEN").length],["hist","History",null],["alerts","Alerts",alerts.length],["news","News",null]].map(([id,l,cnt])=>(
                <button key={id} onClick={()=>setBottomPanel(v=>v===id?null:id)}
                  style={{padding:"0 10px",height:"100%",fontSize:10.5,fontWeight:500,borderBottom:`2px solid ${bottomPanel===id?"#2962ff":"transparent"}`,color:bottomPanel===id?"#f1f5f9":"#6b7280",transition:"all 0.12s",whiteSpace:"nowrap"}}>
                  {l}{cnt!=null&&<span style={{marginLeft:4,padding:"0 4px",borderRadius:8,fontSize:8,background:"rgba(255,255,255,0.06)",color:"#6b7280"}}>{cnt}</span>}
                </button>
              ))}
              <div style={{flex:1}}/>
              <span className="mono" style={{fontSize:10.5,color:totalPnl>=0?"#089981":"#f23645",fontWeight:700,paddingRight:8}}>
                P&L: {totalPnl>=0?"+":""}₹{fmt(Math.abs(totalPnl))}
              </span>
            </div>
            {/* Panel content */}
            {bottomPanel==="pos" && (
              <div style={{maxHeight:160,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Symbol","Qty","Avg","LTP","P&L","P&L%","Action"].map(h=><th key={h} className="t-head" style={{textAlign:"left"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {positions.map((p,i)=>{
                      const lv=prices[p.sym]||{price:p.avg};
                      const pnl=(lv.price-p.avg)*p.qty*(p.side==="short"?-1:1);
                      const pct=(pnl/(p.avg*p.qty))*100;
                      return <tr key={i} className="t-row">
                        <td className="t-cell" style={{fontWeight:600,color:"#f1f5f9"}}>{p.sym} <span style={{fontSize:9,color:"#4b5563"}}>{p.exch}</span></td>
                        <td className="t-cell mono">{p.qty}</td>
                        <td className="t-cell mono" style={{color:"#94a3b8"}}>₹{fmt(p.avg)}</td>
                        <td className="t-cell mono" style={{fontWeight:600}}>₹{fmt(lv.price)}</td>
                        <td className="t-cell mono" style={{color:pnl>=0?"#089981":"#f23645",fontWeight:700}}>₹{fmt(Math.abs(pnl))}</td>
                        <td className="t-cell mono" style={{color:pct>=0?"#089981":"#f23645"}}>{pct.toFixed(2)}%</td>
                        <td className="t-cell"><div style={{display:"flex",gap:4}}>
                          <button onClick={()=>{setShowOrderDialog({side:p.side==="long"?"SELL":"BUY",price:lv.price});}} style={{padding:"2px 8px",fontSize:9,borderRadius:3,background:"rgba(242,54,69,0.12)",border:"1px solid rgba(242,54,69,0.2)",color:"#f23645",fontWeight:600}}>Exit</button>
                          <button onClick={()=>setActiveSym(SYMBOLS.find(s=>s.sym===p.sym)||activeSym)} style={{padding:"2px 8px",fontSize:9,borderRadius:3,border:"1px solid rgba(255,255,255,0.08)",color:"#6b7280"}}>Chart</button>
                        </div></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {bottomPanel==="orders" && (
              <div style={{maxHeight:160,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["ID","Symbol","Type","Side","Qty","Price","Status","Time","Action"].map(h=><th key={h} className="t-head" style={{textAlign:"left"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.map((o,i)=>(
                      <tr key={i} className="t-row">
                        <td className="t-cell mono" style={{color:"#4b5563",fontSize:9}}>{o.id}</td>
                        <td className="t-cell" style={{fontWeight:600,color:"#f1f5f9"}}>{o.sym}</td>
                        <td className="t-cell mono" style={{fontSize:10}}>{o.type}</td>
                        <td className="t-cell"><span style={{padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:o.side==="BUY"?"rgba(8,153,129,0.12)":"rgba(242,54,69,0.12)",color:o.side==="BUY"?"#089981":"#f23645"}}>{o.side}</span></td>
                        <td className="t-cell mono">{o.qty}</td>
                        <td className="t-cell mono" style={{color:"#94a3b8"}}>{o.price>0?`₹${fmt(o.price)}`:"Market"}</td>
                        <td className="t-cell"><span style={{padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,background:o.status==="OPEN"?"rgba(245,158,11,0.12)":"rgba(8,153,129,0.12)",color:o.status==="OPEN"?"#f59e0b":"#089981"}}>{o.status}</span></td>
                        <td className="t-cell mono" style={{color:"#4b5563",fontSize:10}}>{o.time}</td>
                        <td className="t-cell">{o.status==="OPEN"&&<button onClick={()=>setOrders(p=>p.map((x,j)=>i===j?{...x,status:"CANCELLED"}:x))} style={{padding:"2px 6px",fontSize:9,borderRadius:3,border:"1px solid rgba(242,54,69,0.2)",color:"#f23645"}}>Cancel</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {bottomPanel==="alerts" && (
              <div style={{maxHeight:160,overflowY:"auto",padding:"6px 10px"}}>
                {alerts.length===0?<div style={{color:"#4b5563",fontSize:11,padding:"20px 0",textAlign:"center"}}>No alerts set. Click ⊕ Alert to add one.</div>:
                  alerts.map((a,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{color:"#f59e0b",fontSize:13}}>⊕</span>
                      <span style={{fontWeight:600,color:"#f1f5f9",fontSize:11}}>{a.sym}</span>
                      <span style={{color:"#6b7280",fontSize:10}}>{a.condition.replace(/_/g," ")}</span>
                      <span className="mono" style={{color:"#f59e0b",fontWeight:700,fontSize:11}}>₹{fmt(a.price)}</span>
                      {a.note&&<span style={{color:"#4b5563",fontSize:10,fontStyle:"italic"}}>{a.note}</span>}
                      <button onClick={()=>setAlerts(p=>p.filter((_,j)=>j!==i))} style={{marginLeft:"auto",color:"#4b5563",fontSize:11}}>✕</button>
                    </div>
                  ))
                }
              </div>
            )}
            {bottomPanel==="news" && (
              <div style={{maxHeight:160,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {sym:"RELIANCE",time:"14:32",text:"Reliance Industries Q4 PAT rises 12% YoY to ₹18,950 Cr, beats estimates"},
                  {sym:"TCS",time:"13:15",text:"TCS bags $500M contract from European bank for digital transformation"},
                  {sym:"NIFTY50",time:"12:48",text:"NIFTY50 scales new highs amid FII buying; IT and Banking lead gains"},
                  {sym:"INFY",time:"11:30",text:"Infosys upgrades FY25 revenue guidance to 7-8%; margin outlook stable"},
                  {sym:"BTCUSDT",time:"10:05",text:"Bitcoin ETF inflows hit record $800M single-day; BTC eyes $70K resistance"},
                ].map((n,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <span style={{fontSize:9,color:"#4b5563",fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginTop:1}}>{n.time}</span>
                    <span style={{fontSize:9.5,padding:"1px 5px",borderRadius:3,background:"rgba(41,98,255,0.1)",color:"#60a5fa",fontWeight:700,flexShrink:0,alignSelf:"flex-start"}}>{n.sym}</span>
                    <span style={{fontSize:10.5,color:"#94a3b8"}}>{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ICON SIDEBAR */}
        <div style={{width:42,background:"#1a1d2a",borderLeft:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0",flexShrink:0,zIndex:5}}>
          {[{id:"watchlist",icon:"☰",tip:"Watchlist"},{id:"positions",icon:"◐",tip:"Positions"},{id:"orders",icon:"⊟",tip:"Orders"},{id:"depth",icon:"≡",tip:"Depth"},{id:"optionchain",icon:"⋯",tip:"Options"}].map(p=>(
            <button key={p.id} title={p.tip} className={`rp-tab ${rightPanel===p.id?"rp-tab-active":""}`} onClick={()=>setRightPanel(v=>v===p.id?null:p.id)}>
              <span style={{fontSize:14,color:"#6b7280"}}>{p.icon}</span>
              <span style={{fontSize:6.5,color:"#4b5563",letterSpacing:"0.04em",fontWeight:600}}>{p.tip.slice(0,5)}</span>
            </button>
          ))}
        </div>

        {/* RIGHT PANEL */}
        {rightPanel && (
          <div style={{width:252,background:"#131722",borderLeft:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>

            {/* WATCHLIST */}
            {rightPanel==="watchlist" && <>
              <div style={{padding:"7px 10px 5px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:5,padding:"4px 8px",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:"#4b5563",fontSize:12}}>⌕</span>
                  <input value={symSearch} onChange={e=>setSymSearch(e.target.value)} placeholder="Search..."
                    style={{flex:1,fontSize:11,color:"#d1d5db"}}/>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {filtSym.map(s=>{
                  const lv=prices[s.sym]||{price:s.base,chgPct:0};
                  const up=lv.chgPct>=0;
                  const isActive=activeSym.sym===s.sym;
                  return (
                    <div key={s.sym} className={`sym-row ${isActive?"sym-row-active":""}`}
                      onClick={()=>setActiveSym(s)}
                      style={{padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.025)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <span style={{fontWeight:700,fontSize:11.5,color:isActive?"#60a5fa":"#e2e8f0"}}>{s.sym}</span>
                          <span style={{fontSize:8.5,color:"#374151",marginLeft:4,fontFamily:"'JetBrains Mono',monospace"}}>{s.exch}</span>
                        </div>
                        <span className="mono" style={{fontSize:11,fontWeight:700,color:up?"#089981":"#f23645"}}>{fmt(lv.price)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                        <span style={{fontSize:9,color:"#374151"}}>{s.name.slice(0,20)}</span>
                        <span className={up?"badge-up":"badge-dn"}>{up?"▲":"▼"} {Math.abs(lv.chgPct).toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* POSITIONS */}
            {rightPanel==="positions" && <>
              <div style={{padding:"9px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>Positions</span>
                <span className="mono" style={{fontSize:11,color:totalPnl>=0?"#089981":"#f23645",fontWeight:700}}>{totalPnl>=0?"+":""}₹{fmt(Math.abs(totalPnl))}</span>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {positions.map((p,i)=>{
                  const lv=prices[p.sym]||{price:p.avg};
                  const pnl=(lv.price-p.avg)*p.qty*(p.side==="short"?-1:1);
                  const pct=(pnl/(p.avg*p.qty))*100;
                  return (
                    <div key={i} style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div>
                          <span style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>{p.sym}</span>
                          <span style={{marginLeft:6,padding:"1px 5px",borderRadius:3,fontSize:8.5,fontWeight:700,background:p.side==="long"?"rgba(8,153,129,0.15)":"rgba(242,54,69,0.15)",color:p.side==="long"?"#089981":"#f23645"}}>{p.side.toUpperCase()}</span>
                        </div>
                        <span className="mono" style={{fontSize:11,color:pnl>=0?"#089981":"#f23645",fontWeight:700}}>{pnl>=0?"+":""}₹{fmt(Math.abs(pnl))}</span>
                      </div>
                      <div style={{fontSize:10,color:"#6b7280",display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span>Qty:<span className="mono" style={{color:"#94a3b8",marginLeft:4}}>{p.qty}</span></span>
                        <span>Avg:<span className="mono" style={{color:"#94a3b8",marginLeft:4}}>₹{fmt(p.avg)}</span></span>
                        <span>LTP:<span className="mono" style={{color:pnl>=0?"#089981":"#f23645",marginLeft:4}}>₹{fmt(lv.price)}</span></span>
                        <span className="mono" style={{color:pct>=0?"#089981":"#f23645"}}>{pct.toFixed(2)}%</span>
                      </div>
                      {/* PnL bar */}
                      <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)",marginBottom:6}}>
                        <div style={{height:"100%",borderRadius:2,width:`${Math.min(Math.abs(pct)*5,100)}%`,background:pnl>=0?"#089981":"#f23645"}}/>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button className="sell-btn" style={{padding:"3px 10px",fontSize:10,flex:1}} onClick={()=>setShowOrderDialog({side:p.side==="long"?"SELL":"BUY",price:lv.price})}>Exit</button>
                        <button style={{padding:"3px 10px",fontSize:10,borderRadius:4,border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",fontWeight:600,flex:1}} onClick={()=>setActiveSym(SYMBOLS.find(s=>s.sym===p.sym)||activeSym)}>Chart</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* ORDERS */}
            {rightPanel==="orders" && <>
              <div style={{padding:"9px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>Orders</span>
                <span style={{fontSize:9,color:"#6b7280"}}>{orders.filter(o=>o.status==="OPEN").length} open · {orders.filter(o=>o.status==="COMPLETE").length} done</span>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {orders.map((o,i)=>(
                  <div key={i} style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:11.5,color:"#f1f5f9"}}>{o.sym}</span>
                      <span style={{padding:"1px 6px",borderRadius:3,fontSize:8.5,fontWeight:700,background:o.status==="OPEN"?"rgba(245,158,11,0.12)":o.status==="COMPLETE"?"rgba(8,153,129,0.12)":"rgba(100,116,139,0.12)",color:o.status==="OPEN"?"#f59e0b":o.status==="COMPLETE"?"#089981":"#6b7280"}}>{o.status}</span>
                    </div>
                    <div style={{fontSize:10,color:"#6b7280",display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{padding:"1px 6px",borderRadius:3,fontWeight:700,fontSize:9.5,background:o.side==="BUY"?"rgba(8,153,129,0.12)":"rgba(242,54,69,0.12)",color:o.side==="BUY"?"#089981":"#f23645"}}>{o.side}</span>
                      <span>{o.type}</span>
                      <span className="mono" style={{color:"#94a3b8"}}>{o.qty} qty</span>
                      {o.price>0&&<span className="mono" style={{color:"#94a3b8"}}>@ ₹{fmt(o.price)}</span>}
                      <span style={{color:"#374151"}}>{o.time}</span>
                    </div>
                    {o.status==="OPEN"&&(
                      <button onClick={()=>setOrders(p=>p.map((x,j)=>j===i?{...x,status:"CANCELLED"}:x))}
                        style={{marginTop:6,padding:"2px 10px",fontSize:9,borderRadius:3,border:"1px solid rgba(242,54,69,0.25)",color:"rgba(242,54,69,0.7)",fontWeight:600}}>Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            </>}

            {/* MARKET DEPTH */}
            {rightPanel==="depth" && (()=>{
              const lv=prices[activeSym.sym]||{price:activeSym.base};
              const p=lv.price;
              const bids=[...Array(5)].map((_,i)=>({price:p-(5-i)*p*0.0003,qty:Math.floor(Math.random()*800+50)}));
              const asks=[...Array(5)].map((_,i)=>({price:p+(i+1)*p*0.0003,qty:Math.floor(Math.random()*800+50)}));
              const maxQ=Math.max(...[...bids,...asks].map(x=>x.qty));
              return <>
                <div style={{padding:"8px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>{activeSym.sym}</span>
                    <span className={isUp?"badge-up":"badge-dn"}>{isUp?"▲":"▼"} {Math.abs(activeChgPct).toFixed(2)}%</span>
                  </div>
                  <div className="mono" style={{fontSize:18,fontWeight:800,color:isUp?"#089981":"#f23645"}}>{fmt(activePrice)}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"3px 8px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  {["Buy Qty","Price","Sell Qty"].map((h,i)=>(
                    <span key={h} style={{fontSize:7.5,fontWeight:700,letterSpacing:"0.08em",color:"#374151",textTransform:"uppercase",textAlign:i===0?"left":i===1?"center":"right"}}>{h}</span>
                  ))}
                </div>
                {[...Array(5)].map((_,i)=>{
                  const bid=bids[4-i], ask=asks[i];
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",position:"relative",cursor:"pointer"}} className="depth-row">
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${(bid.qty/maxQ)*45}%`,background:"rgba(8,153,129,0.1)"}}/>
                      <div style={{position:"absolute",right:0,top:0,bottom:0,width:`${(ask.qty/maxQ)*45}%`,background:"rgba(242,54,69,0.1)"}}/>
                      <span className="mono" style={{position:"relative",color:"#089981",fontSize:11,fontWeight:600}}>{bid.qty}</span>
                      <div style={{textAlign:"center",position:"relative"}}>
                        <div className="mono" style={{fontSize:10,color:"#089981"}}>{fmt(bid.price)}</div>
                        <div className="mono" style={{fontSize:10,color:"#f23645"}}>{fmt(ask.price)}</div>
                      </div>
                      <span className="mono" style={{position:"relative",textAlign:"right",color:"#f23645",fontSize:11,fontWeight:600}}>{ask.qty}</span>
                    </div>
                  );
                })}
                <div style={{padding:"6px 12px",borderTop:"1px solid rgba(255,255,255,0.04)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:10}}>
                  {[["Total Buy",bids.reduce((s,x)=>s+x.qty,0)],["Total Sell",asks.reduce((s,x)=>s+x.qty,0)],["Upper Circuit",fmt(p*1.2)],["Lower Circuit",fmt(p*0.8)]].map(([l,v])=>(
                    <div key={l}><div style={{color:"#374151",fontSize:8,textTransform:"uppercase",marginBottom:1}}>{l}</div><div className="mono" style={{color:"#94a3b8",fontWeight:600}}>{v}</div></div>
                  ))}
                </div>
                <div style={{padding:"8px 12px",borderTop:"1px solid rgba(255,255,255,0.04)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <button className="buy-btn" style={{padding:"8px 0",borderRadius:5,fontSize:12}} onClick={()=>setShowOrderDialog({side:"BUY",price:activePrice})}>BUY</button>
                  <button className="sell-btn" style={{padding:"8px 0",borderRadius:5,fontSize:12}} onClick={()=>setShowOrderDialog({side:"SELL",price:activePrice})}>SELL</button>
                </div>
              </>;
            })()}

            {/* OPTION CHAIN */}
            {rightPanel==="optionchain" && <>
              <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{fontWeight:700,fontSize:12,color:"#f1f5f9",marginBottom:5}}>Option Chain</div>
                <div style={{display:"flex",gap:4}}>
                  {["Weekly","Monthly","Quarterly"].map((e,i)=>(
                    <button key={e} style={{padding:"2px 8px",borderRadius:3,fontSize:9.5,fontWeight:600,border:`1px solid rgba(255,255,255,${i===0?0.14:0.06})`,background:i===0?"rgba(255,255,255,0.06)":"transparent",color:i===0?"#e2e8f0":"#6b7280"}}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",padding:"3px 6px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                {["CALLS","Strike","PUTS"].map((h,i)=>(
                  <span key={h} style={{fontSize:7.5,fontWeight:700,color:i===0?"#089981":i===2?"#f23645":"#6b7280",textAlign:i===0?"left":i===1?"center":"right",letterSpacing:"0.08em"}}>{h}</span>
                ))}
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {[...Array(12)].map((_,i)=>{
                  const baseStrike = Math.round(activePrice/50)*50;
                  const strike = baseStrike + (i-6)*50;
                  const isATM = i===6;
                  const diff = Math.abs(activePrice-strike);
                  const iv = 15+Math.random()*10;
                  const callPr = (Math.max(activePrice-strike,0)+diff*0.1+Math.random()*10+0.5).toFixed(2);
                  const putPr  = (Math.max(strike-activePrice,0)+diff*0.1+Math.random()*10+0.5).toFixed(2);
                  const callOI = Math.floor(Math.random()*9000+100);
                  const putOI  = Math.floor(Math.random()*9000+100);
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",padding:"3px 6px",borderBottom:"1px solid rgba(255,255,255,0.025)",background:isATM?"rgba(41,98,255,0.07)":"transparent"}}>
                      <div>
                        <div className="mono" style={{fontSize:10.5,color:"#089981",fontWeight:600}}>₹{callPr}</div>
                        <div style={{fontSize:7.5,color:"#374151"}}>{(callOI/1000).toFixed(1)}K IV:{iv.toFixed(0)}%</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div className="mono" style={{fontSize:10.5,fontWeight:800,color:isATM?"#60a5fa":"#94a3b8"}}>{strike.toLocaleString()}</div>
                        {isATM&&<div style={{fontSize:7,color:"#4b5563"}}>ATM</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="mono" style={{fontSize:10.5,color:"#f23645",fontWeight:600}}>₹{putPr}</div>
                        <div style={{fontSize:7.5,color:"#374151",textAlign:"right"}}>{(putOI/1000).toFixed(1)}K IV:{(iv+2).toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}
          </div>
        )}

        {/* AI PANEL */}
        {showAI && (
          <div className="fade-up" style={{width:320,background:"#0a0f1e",borderLeft:"1px solid rgba(41,98,255,0.2)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(41,98,255,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(41,98,255,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,boxShadow:"0 0 16px rgba(41,98,255,0.5)"}}>✦</div>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:"#f1f5f9"}}>TradEx AI</div>
                  <div style={{fontSize:8.5,color:"#60a5fa"}}>Powered by Claude · Real-time context</div>
                </div>
              </div>
              <button onClick={()=>setShowAI(false)} style={{color:"#4b5563",fontSize:16,padding:"2px 6px"}}>✕</button>
            </div>
            {/* Quick prompts */}
            <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",gap:4,flexWrap:"wrap"}}>
              {[`Analyse ${activeSym.sym}`,`News`,`Predict price`,`Trade setup`,`RSI meaning`].map(q=>(
                <button key={q} onClick={()=>{setAiInput(q);setTimeout(()=>document.getElementById("ai-send")?.click(),50);}}
                  style={{padding:"3px 8px",borderRadius:20,fontSize:9,border:"1px solid rgba(41,98,255,0.25)",color:"#60a5fa",background:"rgba(41,98,255,0.07)",fontWeight:500,cursor:"pointer"}}>
                  {q}
                </button>
              ))}
            </div>
            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:10}}>
              {aiMessages.map((m,i)=>(
                <div key={i} className={m.role==="user"?"ai-msg-user":"ai-msg-bot"}>
                  {m.role==="assistant"&&(
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                      <div style={{width:16,height:16,borderRadius:4,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff"}}>✦</div>
                      <span style={{fontSize:9,color:"#60a5fa",fontWeight:700}}>TradEx AI</span>
                    </div>
                  )}
                  {m.role==="user"&&<div style={{fontSize:9.5,color:"#475569",marginBottom:4,textAlign:"right"}}>You</div>}
                  <Markdown text={m.text}/>
                </div>
              ))}
              {aiLoading&&(
                <div className="ai-msg-bot">
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <div style={{width:16,height:16,borderRadius:4,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>✦</div>
                    <span style={{fontSize:10,color:"#60a5fa"}}>Analysing</span>
                    <span className="dot1"/><span className="dot2"/><span className="dot3"/>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            {/* Input */}
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(41,98,255,0.1)"}}>
              <div style={{position:"relative"}}>
                <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI();} }}
                  placeholder={`Ask about ${activeSym.sym}…`} rows={2}
                  style={{width:"100%",paddingRight:38,background:"#0d1526",border:"1px solid rgba(41,98,255,0.2)",borderRadius:8,padding:"8px 38px 8px 12px",fontSize:11.5,color:"#e2e8f0",resize:"none",outline:"none"}}/>
                <button id="ai-send" onClick={sendAI} disabled={aiLoading||!aiInput.trim()}
                  style={{position:"absolute",right:8,bottom:8,width:26,height:26,borderRadius:6,background:aiInput.trim()&&!aiLoading?"#2962ff":"#1e293b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",border:"none",cursor:"pointer",transition:"all 0.15s"}}>
                  ↑
                </button>
              </div>
              <div style={{fontSize:8,color:"#1e293b",marginTop:4}}>Enter to send · Shift+Enter for newline · Not financial advice</div>
            </div>
          </div>
        )}
      </div>

      {/* ── DIALOGS & OVERLAYS ─────────────────────────────────────── */}
      {showOrderDialog && (
        <OrderDialog sym={activeSym.sym} price={showOrderDialog.price} side={showOrderDialog.side}
          onClose={()=>setShowOrderDialog(null)} onConfirm={handleOrder}/>
      )}
      {showAlertDialog && (
        <AlertDialog sym={activeSym.sym} price={activePrice}
          onClose={()=>setShowAlertDialog(false)}
          onSet={(a)=>{ setAlerts(p=>[...p,a]); addToast(`Alert set for ${a.sym} @ ₹${fmt(a.price)}`,"warning"); }}/>
      )}

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:2000,display:"flex",flexDirection:"column",gap:8}}>
        {toasts.map(t=>(
          <Toast key={t.id} message={t.message} type={t.type} onDone={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}/>
        ))}
      </div>
    </div>
  );
}