import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { api } from "../api/axios.js";

/* ═══════════════════════════════════════════════════════════════════
   TRADEX PRO — Zerodha Kite / TradingView inspired
   Ultra-premium dark terminal with AI assistant
   Fonts: Geist + JetBrains Mono
═══════════════════════════════════════════════════════════════════ */

const SYMBOLS = [
  { sym:"MEESHO",  exch:"NSE", name:"Meesho Ltd",        price:165.34, chg:+0.09, chgPct:+0.05, vol:"31.002K", oi:null },
  { sym:"NIFTY50", exch:"NSE", name:"Nifty 50 Index",    price:23416.55,chg:+10.95,chgPct:+0.05,vol:"—",       oi:null },
  { sym:"SENSEX",  exch:"BSE", name:"BSE Sensex",        price:74360.01,chg:+13.84,chgPct:+0.02,vol:"—",       oi:null },
  { sym:"RELIANCE",exch:"NSE", name:"Reliance Industries",price:2891.40,chg:+18.60,chgPct:+0.65,vol:"4.2M",    oi:null },
  { sym:"TCS",     exch:"NSE", name:"Tata Consultancy",  price:3754.80,chg:-22.30,chgPct:-0.59, vol:"1.1M",    oi:null },
  { sym:"INFY",    exch:"NSE", name:"Infosys Ltd",       price:1812.55,chg:+9.45, chgPct:+0.52, vol:"2.8M",    oi:null },
  { sym:"HDFCBANK",exch:"NSE", name:"HDFC Bank",         price:1678.90,chg:-5.40, chgPct:-0.32, vol:"5.6M",    oi:null },
  { sym:"ADANIENT",exch:"NSE", name:"Adani Enterprises", price:2456.30,chg:+34.20,chgPct:+1.41, vol:"890K",    oi:null },
  { sym:"WIPRO",   exch:"NSE", name:"Wipro Ltd",         price:478.65, chg:+2.15, chgPct:+0.45, vol:"3.2M",    oi:null },
  { sym:"SBIN",    exch:"NSE", name:"State Bank India",  price:812.40, chg:+6.80, chgPct:+0.84, vol:"7.8M",    oi:null },
  { sym:"BAJFINANCE",exch:"NSE",name:"Bajaj Finance",    price:7234.50,chg:-45.30,chgPct:-0.62, vol:"420K",    oi:null },
  { sym:"TATAMOTORS",exch:"NSE",name:"Tata Motors",      price:987.65, chg:+12.40,chgPct:+1.27, vol:"6.1M",    oi:null },
];

const TF_DAY   = ["1D","5D","1M","3M","6M","1Y","3Y","5Y"];
const TF_INTRA = ["1m","3m","5m","10m","15m","30m","1h","2h","4h"];

const DRAW_TOOLS = [
  {id:"cursor",  svg:"M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z", tip:"Cursor (Esc)"},
  {id:"crosshair",svg:"M12 2v20M2 12h20",               tip:"Crosshair"},
  {id:"line",    svg:"M5 19L19 5",                       tip:"Trend Line (T)"},
  {id:"hline",   svg:"M3 12h18",                         tip:"Horizontal Line (H)"},
  {id:"vline",   svg:"M12 3v18",                         tip:"Vertical Line"},
  {id:"ray",     svg:"M5 12h14M15 8l4 4-4 4",           tip:"Ray"},
  {id:"arrow",   svg:"M5 12h14M15 8l4 4-4 4M5 8l-4 4 4 4",tip:"Arrow"},
  {id:"rect",    svg:"M3 3h18v18H3z",                    tip:"Rectangle (R)"},
  {id:"circle",  svg:"M12 2a10 10 0 100 20A10 10 0 0012 2z",tip:"Circle"},
  {id:"fib",     svg:"M3 6h18M3 10h18M3 14h18M3 18h14",  tip:"Fibonacci (F)"},
  {id:"channel", svg:"M3 6l18 4M3 14l18 4",              tip:"Parallel Channel"},
  {id:"measure", svg:"M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3",tip:"Measure"},
  {id:"text",    svg:"M4 6h16M4 12h10M4 18h8",           tip:"Text"},
  {id:"erase",   svg:"M20 20H7L3 16l10-10 7 7-1.5 1.5M6.5 17.5l10-10",tip:"Eraser"},
];

const INDICATORS_LIST = [
  {id:"ma",    label:"MA",    params:"(20)",  color:"#3b82f6"},
  {id:"ema",   label:"EMA",   params:"(9)",   color:"#f59e0b"},
  {id:"vwap",  label:"VWAP",  params:"",      color:"#8b5cf6"},
  {id:"bb",    label:"BB",    params:"(20,2)",color:"#10b981"},
  {id:"rsi",   label:"RSI",   params:"(14)",  color:"#ec4899"},
  {id:"macd",  label:"MACD",  params:"",      color:"#06b6d4"},
  {id:"stoch", label:"Stoch", params:"(14,3)",color:"#f97316"},
  {id:"atr",   label:"ATR",   params:"(14)",  color:"#84cc16"},
  {id:"vol",   label:"Volume",params:"",      color:"#64748b"},
];

const AI_RESPONSES = {
  default: (sym, price, chg) => `**${sym}** is currently trading at ₹${price.toFixed(2)}, ${chg>=0?"up":"down"} ${Math.abs(chg).toFixed(2)}% today.\n\nKey observations:\n• **Support** at ₹${(price*0.97).toFixed(2)} (recent swing low)\n• **Resistance** at ₹${(price*1.03).toFixed(2)} (200 DMA)\n• RSI at 52 — neutral momentum\n• Volume is ${chg>0?"above":"below"} 20-day average\n\n**AI Sentiment:** ${chg>=0?"🟢 Mildly Bullish":"🔴 Cautious"} — watch for breakout above ₹${(price*1.025).toFixed(2)}`,
  analysis: (sym) => `**Technical Analysis for ${sym}**\n\n📊 **Pattern Detected:** Descending Channel\n📍 **Current Phase:** Distribution\n\n**Levels to watch:**\n• Strong Support: ₹${(Math.random()*10+160).toFixed(2)}\n• Pivot: ₹${(Math.random()*5+168).toFixed(2)}\n• Target 1: ₹${(Math.random()*8+172).toFixed(2)}\n• Target 2: ₹${(Math.random()*10+178).toFixed(2)}\n\n**Risk:** ₹${(Math.random()*5+158).toFixed(2)} (Stop Loss)\n\n⚠️ *Not financial advice. Use for educational purposes only.*`,
  news: (sym) => `**Latest News for ${sym}**\n\n📰 Q4 results beat estimates by 8% — PAT ₹2,840 Cr vs ₹2,620 Cr est.\n📰 Board approves ₹500 Cr buyback at ₹185/share\n📰 FII buying ₹340 Cr in last 5 sessions\n📰 Brokerage upgrades to BUY with TP ₹195\n\n**Overall Sentiment: 🟢 Positive**`,
  predict: (sym, price) => `**AI Price Forecast — ${sym}**\n\n🤖 Model confidence: 71%\n\n| Horizon | Target | Probability |\n|---------|--------|-------------|\n| 1 Day   | ₹${(price*1.008).toFixed(2)} | 64% |\n| 1 Week  | ₹${(price*1.022).toFixed(2)} | 58% |\n| 1 Month | ₹${(price*1.058).toFixed(2)} | 44% |\n\n*Based on: LSTM model, historical patterns, volume profile, options OI data.*\n\n⚠️ *AI predictions are probabilistic, not guarantees.*`,
};

function genCandles(base, n=200) {
  const out=[]; let p=base; const now=Date.now();
  for(let i=n;i>=0;i--){
    const o=p, d=(Math.random()-0.47)*p*0.018;
    const c=Math.max(o+d,o*0.97);
    const h=Math.max(o,c)+Math.random()*p*0.007;
    const l=Math.min(o,c)-Math.random()*p*0.007;
    out.push({open:o,high:h,low:l,close:c,volume:5e4+Math.random()*9e5,time:now-i*60000});
    p=c;
  }
  return out;
}

function fmtPrice(p,sym=""){
  if(!p) return "0";
  if(p>10000) return p.toLocaleString("en-IN",{maximumFractionDigits:2});
  if(p>100)   return p.toFixed(2);
  return p.toFixed(2);
}

// Simple markdown renderer
function Markdown({text}){
  if(!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{fontSize:11,lineHeight:1.65,color:"#cbd5e1"}}>
      {lines.map((line,i)=>{
        if(line.startsWith("**") && line.endsWith("**") && !line.slice(2,-2).includes("**"))
          return <div key={i} style={{fontWeight:700,color:"#f1f5f9",marginTop:i>0?4:0}}>{line.slice(2,-2)}</div>;
        if(line.startsWith("• "))
          return <div key={i} style={{paddingLeft:12,position:"relative",color:"#94a3b8"}}><span style={{position:"absolute",left:2}}>•</span>{line.slice(2).replace(/\*\*(.*?)\*\*/g,(_,m)=>m)}</div>;
        if(line.startsWith("📊")||line.startsWith("📍")||line.startsWith("📰")||line.startsWith("⚠️")||line.startsWith("🤖"))
          return <div key={i} style={{marginTop:3,color:"#94a3b8"}}>{line.replace(/\*\*(.*?)\*\*/g,(_,m)=>`【${m}】`)}</div>;
        if(line.startsWith("| "))
          return <div key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#64748b",borderBottom:"1px solid rgba(255,255,255,0.04)",paddingBottom:2}}>{line}</div>;
        if(line==="") return <div key={i} style={{height:4}}/>;
        // inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <div key={i} style={{color:"#94a3b8"}}>{parts.map((p,j)=>j%2===1?<strong key={j} style={{color:"#e2e8f0",fontWeight:600}}>{p}</strong>:<span key={j}>{p}</span>)}</div>;
      })}
    </div>
  );
}

export default function TradingTerminal() {
  const [activeSym,  setActiveSym]  = useState(SYMBOLS[0]);
  const [tfMode,     setTfMode]     = useState("intra");   // intra | day
  const [tf,         setTf]         = useState("1m");
  const [ct,         setCt]         = useState("candle");  // candle|bar|line|area|heikin
  const [tool,       setTool]       = useState("cursor");
  const [dColor,     setDColor]     = useState("#3b82f6");
  const [activeInds, setActiveInds] = useState(["vol"]);
  const [showIndPanel,setShowIndPanel]=useState(false);
  const [instantOrders,setInstantOrders]=useState(true);
  const [draws,      setDraws]      = useState([]);
  const [drawing,    setDrawing]    = useState(false);
  const [drawStart,  setDrawStart]  = useState(null);
  const [candles,    setCandles]    = useState(()=>genCandles(SYMBOLS[0].price));
  useEffect(() => {

  const loadCandles = async () => {

    try {

      const res = await api.get(
        "/markets/candles/AAPL"
      );

      const data = res.data;

      const formatted = data.c.map((close,index)=>({

        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        time: data.t[index] * 1000,
        volume: data.v[index]

      }));

      setCandles(formatted);

    } catch(error){

      console.log(error);

    }

  };

  loadCandles();

},[]);
  const [live,       setLive]       = useState(SYMBOLS[0].price);
  const [prices,     setPrices]     = useState(()=>Object.fromEntries(SYMBOLS.map(s=>[s.sym,{price:s.price,chg:s.chg,chgPct:s.chgPct}])));
  const [xhair,      setXhair]      = useState(null);
  const [hoverC,     setHoverC]     = useState(null);
  const [rightPanel, setRightPanel] = useState("watchlist");  // watchlist|positions|orders|depth|optionchain
  const [bottomPanel,setBottomPanel]= useState(false);
  const [grid,       setGrid]       = useState(true);
  const [logScale,   setLogScale]   = useState(false);
  const [autoScale,  setAutoScale]  = useState(true);
  const [zoom,       setZoom]       = useState(1);
  const [symSearch,  setSymSearch]  = useState("");
  const [orderQty,   setOrderQty]   = useState("1");
  // AI
  const [showAI,     setShowAI]     = useState(false);
  const [aiInput,    setAiInput]    = useState("");
  const [aiMessages, setAiMessages] = useState([
    {role:"assistant",text:"👋 Hi! I'm your **AI Trading Assistant**. Ask me anything:\n• Analyse MEESHO\n• Latest news for RELIANCE\n• Predict TCS price\n• What is RSI?"}
  ]);
  const [aiLoading,  setAiLoading]  = useState(false);
  // Scalper mode
  const [scalperMode,setScalerMode] = useState(false);
  // Positions
  const [positions] = useState([
    {sym:"MEESHO",  exch:"NSE",qty:20,  avg:169.40,ltp:165.34,side:"long",  pnl:-81.20, pnlPct:-2.40},
    {sym:"RELIANCE",exch:"NSE",qty:5,   avg:2850.00,ltp:2891.40,side:"long",pnl:+207.00,pnlPct:+1.45},
    {sym:"TCS",     exch:"NSE",qty:3,   avg:3820.00,ltp:3754.80,side:"long",pnl:-195.60,pnlPct:-1.71},
  ]);
  const [orders] = useState([
    {id:"ORD001",sym:"INFY",  exch:"NSE",type:"Limit", side:"BUY", qty:10,price:1800,status:"OPEN",  time:"09:15"},
    {id:"ORD002",sym:"HDFCBANK",exch:"NSE",type:"SL-M",side:"SELL",qty:5, price:1670,status:"OPEN",  time:"10:22"},
    {id:"ORD003",sym:"SBIN",  exch:"NSE",type:"Market",side:"BUY", qty:50,price:0,   status:"COMPLETE",time:"11:05"},
  ]);

  const cvs = useRef(null);
  const raf = useRef(null);
  const chatEndRef = useRef(null);

  // Live tick
  useEffect(()=>{
    const iv=setInterval(()=>{
      setLive(p=>{const d=(Math.random()-0.49)*p*0.0015;return parseFloat((p+d).toFixed(p>100?2:4));});
      setPrices(prev=>{
        const n={...prev};
        for(const k in n){
          const d=(Math.random()-0.49)*n[k].price*0.0012;
          n[k]={...n[k],price:parseFloat((n[k].price+d).toFixed(n[k].price>1000?2:2)),chg:parseFloat((n[k].chg+(Math.random()-0.5)*0.05).toFixed(2)),chgPct:parseFloat((n[k].chgPct+(Math.random()-0.5)*0.02).toFixed(2))};
        }
        return n;
      });
      setCandles(prev=>{
        const last={...prev[prev.length-1]};
        last.close=live; last.high=Math.max(last.high,live); last.low=Math.min(last.low,live);
        return [...prev.slice(0,-1),last];
      });
    },600);
    return ()=>clearInterval(iv);
  },[live]);

  useEffect(()=>{
activeSym.sym
    setLive(activeSym.price);
  },[activeSym]);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[aiMessages]);

  // AI handler
  const sendAI = async ()=>{
    if(!aiInput.trim()||aiLoading) return;
    const q=aiInput.trim(); setAiInput(""); setAiLoading(true);
    setAiMessages(p=>[...p,{role:"user",text:q}]);
    await new Promise(r=>setTimeout(r,900+Math.random()*600));
    const ql=q.toLowerCase();
    let resp;
    if(ql.includes("analys")||ql.includes("chart")||ql.includes("pattern"))
      resp=AI_RESPONSES.analysis(activeSym.sym);
    else if(ql.includes("news")||ql.includes("latest"))
      resp=AI_RESPONSES.news(activeSym.sym);
    else if(ql.includes("predict")||ql.includes("forecast")||ql.includes("target"))
      resp=AI_RESPONSES.predict(activeSym.sym,live);
    else
      resp=AI_RESPONSES.default(activeSym.sym,live,activeSym.chgPct);
    setAiMessages(p=>[...p,{role:"assistant",text:resp}]);
    setAiLoading(false);
  };

  // ── CHART DRAW ──────────────────────────────────────────────────────
  const drawChart=useCallback(()=>{
    const el=cvs.current; if(!el) return;
    const ctx=el.getContext("2d");
    const DPR=window.devicePixelRatio||1;
    const W=el.offsetWidth, H=el.offsetHeight;
    if(el.width!==W*DPR||el.height!==H*DPR){el.width=W*DPR;el.height=H*DPR;ctx.scale(DPR,DPR);}
    ctx.clearRect(0,0,W,H);

    const HAS_VOL  = activeInds.includes("vol");
    const HAS_RSI  = activeInds.includes("rsi");
    const HAS_MACD = activeInds.includes("macd");
    const HAS_STOCH= activeInds.includes("stoch");
    const nSub=(HAS_RSI?1:0)+(HAS_MACD?1:0)+(HAS_STOCH?1:0);
    const SUB=72;
    const PH=H-(HAS_VOL?60:0)-nSub*SUB;
    const VT=PH;
    const PT=28;
    const RP=72;
    const LP=4;
    const chartW=W-RP-LP;

    // Background
    ctx.fillStyle="#131722"; ctx.fillRect(0,0,W,H);

    const data=candles;
    if(!data.length) return;
    const n=Math.min(Math.floor(chartW/6),data.length);
    const vis=data.slice(-n);
    const highs=vis.map(c=>c.high), lows=vis.map(c=>c.low);
    let maxP=Math.max(...highs), minP=Math.min(...lows);
    const pad=(maxP-minP)*0.05;
    maxP+=pad; minP-=pad;
    const pRng=maxP-minP;
    const cW=chartW/vis.length;
    const bW=Math.max(Math.min(cW*0.7,12),1);
    const toY=p=>PT+(1-(p-minP)/pRng)*(PH-PT-4);

    // Grid
    if(grid){
      ctx.setLineDash([1,0]);
      // Horizontal grid
      for(let i=0;i<=6;i++){
        const pr=minP+(i/6)*pRng, y=toY(pr);
        ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(LP,y);ctx.lineTo(W-RP,y);ctx.stroke();
        ctx.fillStyle="rgba(148,163,184,0.45)";ctx.textAlign="right";
        ctx.font=`10px 'JetBrains Mono',monospace`;
        ctx.fillText(fmtPrice(pr),W-2,y+3);
      }
      // Vertical grid
      const vStep=Math.floor(vis.length/8)||1;
      vis.forEach((c,i)=>{
        if(i%vStep!==0)return;
        const x=LP+(i+0.5)*cW;
        ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x,PT);ctx.lineTo(x,PH+(HAS_VOL?60:0));ctx.stroke();
        const d=new Date(c.time);
        ctx.fillStyle="rgba(100,116,139,0.6)";ctx.textAlign="center";
        ctx.font="9px 'JetBrains Mono',monospace";
        ctx.fillText(d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0"),x,H-nSub*SUB-2);
      });
    }

    // ── MA
    const drawLine=(vals,color,dash=[])=>{
      ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.setLineDash(dash);
      ctx.shadowColor=color+"44";ctx.shadowBlur=4;
      ctx.beginPath();let st=false;
      vals.forEach((v,i)=>{if(v==null)return;const x=LP+(i+0.5)*cW,y=toY(v);!st?(ctx.moveTo(x,y),st=true):ctx.lineTo(x,y);});
      ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;
    };
    if(activeInds.includes("ma")){
      const per=20,vals=vis.map((_,i)=>i<per-1?null:vis.slice(i-per+1,i+1).reduce((a,x)=>a+x.close,0)/per);
      drawLine(vals,"#3b82f6");
    }
    if(activeInds.includes("ema")){
      const k=2/10;let e=vis[0].close;
      const vals=vis.map(c=>{e=c.close*k+e*(1-k);return e;});
      drawLine(vals,"#f59e0b");
    }
    if(activeInds.includes("vwap")){
      let cvp=0,cv=0;
      const vals=vis.map(c=>{const tp=(c.high+c.low+c.close)/3;cvp+=tp*c.volume;cv+=c.volume;return cvp/cv;});
      drawLine(vals,"#8b5cf6",[5,3]);
    }
    if(activeInds.includes("bb")){
      const per=20;
      const up=[],lo=[];
      vis.forEach((_,i)=>{
        if(i<per-1){up.push(null);lo.push(null);return;}
        const sl=vis.slice(i-per+1,i+1).map(x=>x.close);
        const mn=sl.reduce((a,b)=>a+b,0)/per;
        const sd=Math.sqrt(sl.reduce((a,b)=>a+(b-mn)**2,0)/per);
        up.push(mn+2*sd);lo.push(mn-2*sd);
      });
      drawLine(up,"rgba(16,185,129,0.5)");
      drawLine(lo,"rgba(16,185,129,0.5)");
    }

    // ── Candles
    vis.forEach((c,i)=>{
      const x=LP+i*cW, cx=x+cW/2;
      const isUp=c.close>=c.open;
      const bull="#089981", bear="#f23645";
      let O=c.open,C=c.close,Hi=c.high,Lo=c.low;
      if(ct==="heikin"){
        C=(c.open+c.high+c.low+c.close)/4;
        O=i>0?(vis[i-1].open+vis[i-1].close)/2:(c.open+c.close)/2;
        Hi=Math.max(c.high,O,C);Lo=Math.min(c.low,O,C);
      }
      const up=C>=O,col=up?bull:bear;
      if(ct==="candle"||ct==="heikin"){
        ctx.strokeStyle=col;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(cx,toY(Hi));ctx.lineTo(cx,toY(Lo));ctx.stroke();
        const bT=toY(Math.max(O,C)),bB=toY(Math.min(O,C)),bh=Math.max(bB-bT,1);
        ctx.fillStyle=up?bull:bear;
        ctx.fillRect(cx-bW/2,bT,bW,bh);
      } else if(ct==="bar"){
        ctx.strokeStyle=col;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(cx,toY(Hi));ctx.lineTo(cx,toY(Lo));ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-bW/2,toY(O));ctx.lineTo(cx,toY(O));ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx,toY(C));ctx.lineTo(cx+bW/2,toY(C));ctx.stroke();
      } else if(ct==="line"){
        if(i===0)ctx.beginPath();
        if(i===0)ctx.moveTo(cx,toY(C));else ctx.lineTo(cx,toY(C));
        if(i===vis.length-1){ctx.strokeStyle="#2962ff";ctx.lineWidth=1.8;ctx.stroke();}
      } else if(ct==="area"){
        if(i===0)ctx.beginPath();
        const y=toY(C);
        if(i===0)ctx.moveTo(cx,y);else ctx.lineTo(cx,y);
        if(i===vis.length-1){
          const g=ctx.createLinearGradient(0,PT,0,PH);
          g.addColorStop(0,"rgba(41,98,255,0.25)");g.addColorStop(1,"rgba(41,98,255,0)");
          ctx.lineTo(cx,PH);ctx.lineTo(LP+0.5*cW,PH);ctx.closePath();
          ctx.fillStyle=g;ctx.fill();
          ctx.beginPath();
          vis.forEach((cc,ii)=>{const xx=LP+(ii+0.5)*cW;ii===0?ctx.moveTo(xx,toY(cc.close)):ctx.lineTo(xx,toY(cc.close));});
          ctx.strokeStyle="#2962ff";ctx.lineWidth=1.8;ctx.stroke();
        }
      }
    });

    // ── Volume
    if(HAS_VOL){
      ctx.strokeStyle="rgba(255,255,255,0.04)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,VT);ctx.lineTo(W,VT);ctx.stroke();
      const maxV=Math.max(...vis.map(c=>c.volume));
      vis.forEach((c,i)=>{
        const up=c.close>=c.open,x=LP+i*cW;
        const vh=(c.volume/maxV)*52;
        ctx.fillStyle=up?"rgba(8,153,129,0.5)":"rgba(242,54,69,0.5)";
        ctx.fillRect(x+cW*0.1,VT+(56-vh),cW*0.8,vh);
      });
      // Volume MA line
      const vma=20;
      ctx.strokeStyle="rgba(135,206,235,0.6)";ctx.lineWidth=1;ctx.beginPath();
      vis.forEach((_,i)=>{
        if(i<vma-1)return;
        const avg=vis.slice(i-vma+1,i+1).reduce((a,x)=>a+x.volume,0)/vma;
        const x=LP+(i+0.5)*cW,y=VT+(56-(avg/maxV)*52);
        i===vma-1?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });ctx.stroke();
    }

    // ── RSI
    if(HAS_RSI){
      const RT=H-nSub*SUB;
      ctx.fillStyle="#0e1117";ctx.fillRect(0,RT,W,SUB);
      ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,RT);ctx.lineTo(W,RT);ctx.stroke();
      ctx.fillStyle="#475569";ctx.font="bold 8px 'JetBrains Mono',monospace";ctx.textAlign="left";
      ctx.fillText("RSI(14)",LP+4,RT+11);
      const rsi=[];
      for(let i=14;i<vis.length;i++){
        let g=0,l=0;
        for(let j=i-13;j<=i;j++){const d=vis[j].close-vis[j-1].close;d>0?g+=d:l-=d;}
        rsi.push({i,v:l===0?100:100-100/(1+g/l)});
      }
      [30,50,70].forEach(lv=>{
        const y=RT+(1-lv/100)*(SUB-20)+12;
        ctx.strokeStyle=lv===50?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.1)";
        ctx.setLineDash(lv===50?[]:[ 2,4]);
        ctx.beginPath();ctx.moveTo(LP,y);ctx.lineTo(W-RP,y);ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle="rgba(100,116,139,0.5)";ctx.textAlign="right";ctx.font="8px 'JetBrains Mono',monospace";
        ctx.fillText(lv,W-2,y+3);
      });
      ctx.strokeStyle="#ec4899";ctx.lineWidth=1.3;ctx.beginPath();
      rsi.forEach(({i,v},j)=>{
        const x=LP+(i+0.5)*cW,y=RT+(1-v/100)*(SUB-20)+12;
        j===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });ctx.stroke();
      // RSI current value label
      if(rsi.length){
        const last=rsi[rsi.length-1].v;
        const ly=RT+(1-last/100)*(SUB-20)+12;
        ctx.fillStyle=last>70?"#f23645":last<30?"#089981":"#94a3b8";
        ctx.fillRect(W-RP,ly-8,RP-1,16);
        ctx.fillStyle="#000";ctx.textAlign="center";ctx.font="bold 9px 'JetBrains Mono',monospace";
        ctx.fillText(last.toFixed(1),W-RP+(RP-1)/2,ly+3);
      }
    }

    // ── MACD
    if(HAS_MACD){
      const MT=H-SUB*(HAS_STOCH?2:1);
      ctx.fillStyle="#0e1117";ctx.fillRect(0,MT,W,SUB);
      ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,MT);ctx.lineTo(W,MT);ctx.stroke();
      ctx.fillStyle="#475569";ctx.font="bold 8px 'JetBrains Mono',monospace";ctx.textAlign="left";
      ctx.fillText("MACD(12,26,9)",LP+4,MT+11);
      const emaFn=(d,p)=>{const k=2/(p+1);let e=d[0];return d.map(v=>{e=v*k+e*(1-k);return e;});};
      const cl=vis.map(c=>c.close);
      const e12=emaFn(cl,12),e26=emaFn(cl,26);
      const macdL=e12.map((v,i)=>v-e26[i]);
      const sig=emaFn(macdL,9);
      const hist=macdL.map((v,i)=>v-sig[i]);
      const maxH=Math.max(...hist.map(Math.abs))||1;
      const mid=MT+SUB/2;
      ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.beginPath();ctx.moveTo(LP,mid);ctx.lineTo(W-RP,mid);ctx.stroke();
      hist.forEach((h,i)=>{
        const x=LP+i*cW,bh=Math.abs(h/maxH)*(SUB/2-14);
        const g=ctx.createLinearGradient(0,h>=0?mid-bh:mid,0,h>=0?mid:mid+bh);
        if(h>=0){g.addColorStop(0,"rgba(8,153,129,0.7)");g.addColorStop(1,"rgba(8,153,129,0.1)");}
        else    {g.addColorStop(0,"rgba(242,54,69,0.1)"); g.addColorStop(1,"rgba(242,54,69,0.7)");}
        ctx.fillStyle=g;ctx.fillRect(x+cW*0.1,h>=0?mid-bh:mid,cW*0.8,bh);
      });
      ctx.strokeStyle="#06b6d4";ctx.lineWidth=1;ctx.beginPath();
      macdL.forEach((v,i)=>{const x=LP+(i+0.5)*cW,y=mid-(v/maxH)*(SUB/2-14);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();
      ctx.strokeStyle="#f59e0b";ctx.lineWidth=1;ctx.setLineDash([3,2]);ctx.beginPath();
      sig.forEach((v,i)=>{const x=LP+(i+0.5)*cW,y=mid-(v/maxH)*(SUB/2-14);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();ctx.setLineDash([]);
    }

    // ── Stochastic
    if(HAS_STOCH){
      const ST=H-SUB;
      ctx.fillStyle="#0e1117";ctx.fillRect(0,ST,W,SUB);
      ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.beginPath();ctx.moveTo(0,ST);ctx.lineTo(W,ST);ctx.stroke();
      ctx.fillStyle="#475569";ctx.font="bold 8px 'JetBrains Mono',monospace";ctx.textAlign="left";ctx.fillText("Stoch(14,3)",LP+4,ST+11);
      const per=14,sma=3;
      const kv=[];
      for(let i=per-1;i<vis.length;i++){
        const slice=vis.slice(i-per+1,i+1);
        const hi=Math.max(...slice.map(c=>c.high)),lo=Math.min(...slice.map(c=>c.low));
        kv.push({i,v:hi===lo?50:(vis[i].close-lo)/(hi-lo)*100});
      }
      const dv=kv.map((_,i)=>i<sma-1?null:{i:kv[i].i,v:kv.slice(i-sma+1,i+1).reduce((a,x)=>a+x.v,0)/sma});
      [20,50,80].forEach(lv=>{
        const y=ST+(1-lv/100)*(SUB-20)+12;
        ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(LP,y);ctx.lineTo(W-RP,y);ctx.stroke();ctx.setLineDash([]);
      });
      ctx.strokeStyle="#3b82f6";ctx.lineWidth=1;ctx.beginPath();
      kv.forEach(({i,v},j)=>{const x=LP+(i+0.5)*cW,y=ST+(1-v/100)*(SUB-20)+12;j===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();
      ctx.strokeStyle="#f97316";ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();
      dv.forEach((pt,j)=>{if(!pt)return;const x=LP+(pt.i+0.5)*cW,y=ST+(1-pt.v/100)*(SUB-20)+12;j===0||!dv[j-1]?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();ctx.setLineDash([]);
    }

    // ── ATR label (no panel, just label if enabled)
    if(activeInds.includes("atr")){
      const per=14;
      const atrVals=vis.map((_,i)=>{
        if(i===0)return vis[0].high-vis[0].low;
        const tr=Math.max(vis[i].high-vis[i].low,Math.abs(vis[i].high-vis[i-1].close),Math.abs(vis[i].low-vis[i-1].close));
        return tr;
      });
      const avgATR=atrVals.slice(-per).reduce((a,b)=>a+b,0)/per;
      ctx.fillStyle="rgba(132,204,22,0.8)";ctx.font="9px 'JetBrains Mono',monospace";ctx.textAlign="left";
      ctx.fillText(`ATR(${per}): ${avgATR.toFixed(2)}`,LP+4,PT+20);
    }

    // ── Live price dashed line
    const lastC=data[data.length-1].close;
    const cy=toY(lastC);
    if(cy>PT&&cy<PH){
      const isUp=lastC>=data[data.length-2]?.close;
      ctx.strokeStyle=isUp?"rgba(8,153,129,0.5)":"rgba(242,54,69,0.5)";
      ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(LP,cy);ctx.lineTo(W-RP,cy);ctx.stroke();ctx.setLineDash([]);
      const tag=fmtPrice(lastC);
      ctx.fillStyle=isUp?"#089981":"#f23645";
      ctx.fillRect(W-RP,cy-9,RP-1,18);
      ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 9.5px 'JetBrains Mono',monospace";
      ctx.fillText(tag,W-RP+(RP-1)/2,cy+3);
    }

    // ── Crosshair
    if(xhair){
      ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=1;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.moveTo(xhair.x,PT);ctx.lineTo(xhair.x,PH+(HAS_VOL?60:0));ctx.stroke();
      ctx.beginPath();ctx.moveTo(LP,xhair.y);ctx.lineTo(W-RP,xhair.y);ctx.stroke();
      ctx.setLineDash([]);
      const hp=minP+(1-(xhair.y-PT)/(PH-PT-4))*pRng;
      if(hp>0&&xhair.y>PT&&xhair.y<PH){
        ctx.fillStyle="#364156";ctx.fillRect(W-RP,xhair.y-9,RP-1,18);
        ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.strokeRect(W-RP,xhair.y-9,RP-1,18);
        ctx.fillStyle="#d1d5db";ctx.textAlign="center";ctx.font="9px 'JetBrains Mono',monospace";
        ctx.fillText(fmtPrice(hp),W-RP+(RP-1)/2,xhair.y+3);
      }
      // Time label
      if(xhair.x>LP&&xhair.x<W-RP){
        const idx=Math.floor((xhair.x-LP)/cW);
        if(idx>=0&&idx<vis.length){
          const d=new Date(vis[idx].time);
          const label=d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
          ctx.fillStyle="#364156";ctx.fillRect(xhair.x-24,PH+(HAS_VOL?60:0)-18,48,16);
          ctx.fillStyle="#d1d5db";ctx.textAlign="center";ctx.font="9px 'JetBrains Mono',monospace";
          ctx.fillText(label,xhair.x,PH+(HAS_VOL?60:0)-6);
        }
      }
    }

    // ── OHLCV tooltip at top
    if(hoverC){
      const up=hoverC.close>=hoverC.open;
      ctx.fillStyle="rgba(20,26,36,0.9)";
      ctx.fillRect(LP,0,500,22);
      ctx.font="bold 10px 'JetBrains Mono',monospace";
      const cols=[["O",hoverC.open,"#94a3b8"],["H",hoverC.high,"#089981"],["L",hoverC.low,"#f23645"],["C",hoverC.close,up?"#089981":"#f23645"],["V",(hoverC.volume/1e3).toFixed(0)+"K","#64748b"]];
      let xx=LP+8;
      cols.forEach(([lbl,val,col])=>{
        ctx.fillStyle="#475569";ctx.fillText(lbl+" ",xx,15);xx+=ctx.measureText(lbl+" ").width;
        ctx.fillStyle=col;ctx.fillText(fmtPrice(val)+"  ",xx,15);xx+=ctx.measureText(fmtPrice(val)+"  ").width;
      });
    }

    // ── Drawings
    ctx.textAlign="left";
    draws.forEach(d=>{
      ctx.strokeStyle=d.color;ctx.lineWidth=1.5;ctx.setLineDash([]);
      ctx.shadowColor=d.color+"55";ctx.shadowBlur=3;
      if(["line","ray","arrow"].includes(d.type)){
        ctx.beginPath();ctx.moveTo(d.x1,d.y1);ctx.lineTo(d.x2,d.y2);ctx.stroke();
        if(d.type==="arrow"){
          const a=Math.atan2(d.y2-d.y1,d.x2-d.x1);
          ctx.beginPath();ctx.moveTo(d.x2,d.y2);
          ctx.lineTo(d.x2-11*Math.cos(a-0.4),d.y2-11*Math.sin(a-0.4));
          ctx.lineTo(d.x2-11*Math.cos(a+0.4),d.y2-11*Math.sin(a+0.4));
          ctx.closePath();ctx.fillStyle=d.color;ctx.fill();
        }
      } else if(d.type==="hline"){
        ctx.beginPath();ctx.moveTo(LP,d.y1);ctx.lineTo(W-RP,d.y1);ctx.stroke();
        const hp=minP+(1-(d.y1-PT)/(PH-PT-4))*pRng;
        ctx.fillStyle=d.color+"cc";ctx.font="9px 'JetBrains Mono',monospace";
        ctx.fillText(fmtPrice(hp),W-RP+4,d.y1-2);
      } else if(d.type==="vline"){
        ctx.beginPath();ctx.moveTo(d.x1,PT);ctx.lineTo(d.x1,PH+(HAS_VOL?60:0));ctx.stroke();
      } else if(d.type==="rect"){
        ctx.strokeRect(d.x1,d.y1,d.x2-d.x1,d.y2-d.y1);
        const rgb=d.color.startsWith("#")?[parseInt(d.color.slice(1,3),16),parseInt(d.color.slice(3,5),16),parseInt(d.color.slice(5,7),16)]:[59,130,246];
        ctx.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.07)`;
        ctx.fillRect(d.x1,d.y1,d.x2-d.x1,d.y2-d.y1);
      } else if(d.type==="circle"){
        const rx=Math.abs(d.x2-d.x1)/2,ry=Math.abs(d.y2-d.y1)/2;
        ctx.beginPath();ctx.ellipse(d.x1+rx,d.y1+ry,rx,ry,0,0,Math.PI*2);ctx.stroke();
      } else if(d.type==="fib"){
        [0,0.236,0.382,0.5,0.618,0.786,1].forEach((lv,li)=>{
          const cols=["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#8b5cf6","#ec4899"];
          const y=d.y1+(d.y2-d.y1)*lv;
          ctx.strokeStyle=cols[li]+"99";ctx.shadowColor="transparent";
          ctx.beginPath();ctx.moveTo(d.x1,y);ctx.lineTo(d.x2,y);ctx.stroke();
          ctx.fillStyle=cols[li]+"cc";ctx.font="9px 'JetBrains Mono',monospace";
          ctx.fillText(`${(lv*100).toFixed(1)}%`,d.x2+4,y+3);
        });
      }
      ctx.shadowBlur=0;
    });

    // ── Instant order BUY/SELL buttons overlay
    if(instantOrders){
      const btnY=cy-9;
      if(btnY>PT&&btnY<PH-20){
        ctx.fillStyle="#089981";ctx.fillRect(LP+4,btnY,72,18);
        ctx.fillStyle="#f23645";ctx.fillRect(LP+82,btnY,72,18);
        ctx.fillStyle="#fff";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
        ctx.fillText(`BUY @ ${fmtPrice(lastC)}`,LP+4+36,btnY+12);
        ctx.fillText(`SELL @ ${fmtPrice(lastC)}`,LP+82+36,btnY+12);
      }
    }
  },[candles,xhair,draws,ct,activeInds,grid,hoverC,instantOrders,live]);

  useEffect(()=>{
    const ro=new ResizeObserver(()=>{cancelAnimationFrame(raf.current);raf.current=requestAnimationFrame(drawChart);});
    if(cvs.current)ro.observe(cvs.current);
    return()=>{ro.disconnect();cancelAnimationFrame(raf.current);};
  },[drawChart]);
  useEffect(()=>{cancelAnimationFrame(raf.current);raf.current=requestAnimationFrame(drawChart);},[drawChart]);

  const getXY=e=>{const r=cvs.current.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  const onMM=e=>{
    const{x,y}=getXY(e);setXhair({x,y});
    const vis=candles.slice(-Math.min(Math.floor((cvs.current.offsetWidth-76)/6),candles.length));
    const cW=(cvs.current.offsetWidth-76-4)/vis.length;
    const idx=Math.floor((x-4)/cW);
    if(idx>=0&&idx<vis.length)setHoverC(vis[idx]);
    if(drawing&&drawStart){
      drawChart();
      const ctx=cvs.current.getContext("2d");
      ctx.strokeStyle=dColor;ctx.lineWidth=1.5;
      if(["line","ray","arrow"].includes(tool)){ctx.beginPath();ctx.moveTo(drawStart.x,drawStart.y);ctx.lineTo(x,y);ctx.stroke();}
      else if(tool==="rect"){ctx.strokeRect(drawStart.x,drawStart.y,x-drawStart.x,y-drawStart.y);}
      else if(tool==="circle"){const rx=Math.abs(x-drawStart.x)/2,ry=Math.abs(y-drawStart.y)/2;ctx.beginPath();ctx.ellipse(drawStart.x+rx,drawStart.y+ry,rx,ry,0,0,Math.PI*2);ctx.stroke();}
      else if(tool==="fib"){ctx.beginPath();ctx.moveTo(drawStart.x,drawStart.y);ctx.lineTo(x,y);ctx.stroke();}
    }
  };
  const onMD=e=>{
    if(tool==="cursor"||tool==="crosshair")return;
    const{x,y}=getXY(e);
    if(tool==="hline"){setDraws(p=>[...p,{type:"hline",x1:0,y1:y,color:dColor}]);return;}
    if(tool==="vline"){setDraws(p=>[...p,{type:"vline",x1:x,y1:0,color:dColor}]);return;}
    if(tool==="erase"){setDraws(p=>p.filter(d=>Math.hypot((d.x1+d.x2||d.x1*2)/2-x,(d.y1+d.y2||d.y1*2)/2-y)>20));return;}
    setDrawing(true);setDrawStart({x,y});
  };
  const onMU=e=>{
    if(!drawing||!drawStart)return;
    const{x,y}=getXY(e);
    if(Math.abs(x-drawStart.x)>4||Math.abs(y-drawStart.y)>4)
      setDraws(p=>[...p,{type:tool,x1:drawStart.x,y1:drawStart.y,x2:x,y2:y,color:dColor}]);
    setDrawing(false);setDrawStart(null);
  };

  const liveData=prices[activeSym.sym]||activeSym;
  const isUp=(liveData.chgPct||0)>=0;
  const totalPnl=positions.reduce((s,p)=>s+p.pnl,0);
  const filtSym=SYMBOLS.filter(s=>s.sym.toLowerCase().includes(symSearch.toLowerCase())||s.name.toLowerCase().includes(symSearch.toLowerCase()));

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Geist','Inter','Helvetica Neue',sans-serif",background:"#131722",color:"#d1d5db",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",fontSize:12}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      button{cursor:pointer;border:none;background:none;color:inherit;font:inherit;}
      input,textarea{outline:none;border:none;background:none;color:inherit;font:inherit;}
      ::-webkit-scrollbar{width:3px;height:3px;background:transparent;}
      ::-webkit-scrollbar-thumb{background:#2a2e3a;border-radius:2px;}

      .mono{font-family:'JetBrains Mono',monospace;}
      /* Nav */
      .nav-link{color:#9ca3af;font-size:12.5px;font-weight:500;padding:0 4px;transition:color 0.12s;cursor:pointer;}
      .nav-link:hover{color:#f1f5f9;}
      .nav-active{color:#2962ff!important;}
      /* Tool buttons */
      .tool-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;color:#6b7280;transition:all 0.12s;cursor:pointer;}
      .tool-btn:hover{background:rgba(255,255,255,0.06);color:#d1d5db;}
      .tool-active{background:rgba(41,98,255,0.15)!important;color:#2962ff!important;}
      /* Indicator chips */
      .ind-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);font-size:10px;font-weight:600;color:#6b7280;cursor:pointer;transition:all 0.12s;font-family:'JetBrains Mono',monospace;}
      .ind-chip:hover{border-color:rgba(255,255,255,0.15);color:#9ca3af;}
      .ind-on{border-color:rgba(41,98,255,0.4)!important;background:rgba(41,98,255,0.1)!important;color:#60a5fa!important;}
      /* TF pills */
      .tf-btn{padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;color:#6b7280;font-family:'JetBrains Mono',monospace;transition:all 0.12s;}
      .tf-btn:hover{color:#d1d5db;background:rgba(255,255,255,0.05);}
      .tf-active{background:rgba(255,255,255,0.08)!important;color:#f1f5f9!important;}
      /* Right panel tabs */
      .rp-tab{display:flex;flex-direction:column;align-items:center;padding:10px 0;cursor:pointer;border-right:2px solid transparent;transition:all 0.12s;gap:4px;width:100%;}
      .rp-tab:hover{background:rgba(255,255,255,0.03);}
      .rp-tab-active{background:rgba(41,98,255,0.08)!important;border-right-color:#2962ff!important;}
      .rp-tab-active span{color:#60a5fa!important;}
      /* Tables */
      .t-row:hover{background:rgba(255,255,255,0.03);}
      .t-head{font-size:9px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4b5563;padding:5px 12px;border-bottom:1px solid rgba(255,255,255,0.05);}
      .t-cell{padding:7px 12px;font-size:11px;border-bottom:1px solid rgba(255,255,255,0.03);}
      /* Buy/Sell instant */
      .buy-btn{background:#089981;color:#fff;font-weight:700;font-size:12px;padding:6px 16px;border-radius:4px;transition:all 0.12s;}
      .buy-btn:hover{background:#0ab59e;box-shadow:0 0 12px rgba(8,153,129,0.4);}
      .sell-btn{background:#f23645;color:#fff;font-weight:700;font-size:12px;padding:6px 16px;border-radius:4px;transition:all 0.12s;}
      .sell-btn:hover{background:#ff4d5e;box-shadow:0 0 12px rgba(242,54,69,0.4);}
      /* Sym row */
      .sym-row{cursor:pointer;border-left:2px solid transparent;transition:all 0.1s;}
      .sym-row:hover{background:rgba(255,255,255,0.025);}
      .sym-row-active{background:rgba(41,98,255,0.07)!important;border-left-color:#2962ff!important;}
      /* Chart types */
      .ct-btn{padding:2px 7px;border-radius:3px;font-size:10px;color:#6b7280;transition:all 0.12s;font-weight:500;}
      .ct-btn:hover{color:#d1d5db;background:rgba(255,255,255,0.05);}
      .ct-active{background:rgba(255,255,255,0.08)!important;color:#f1f5f9!important;}
      /* Pill badges */
      .badge-up{background:rgba(8,153,129,0.15);color:#089981;border:1px solid rgba(8,153,129,0.2);padding:1px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;}
      .badge-dn{background:rgba(242,54,69,0.15);color:#f23645;border:1px solid rgba(242,54,69,0.2);padding:1px 6px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;}
      /* AI Panel */
      .ai-msg-user{background:#1e293b;border-radius:8px 8px 0 8px;padding:8px 12px;max-width:85%;align-self:flex-end;}
      .ai-msg-bot{background:#0f172a;border:1px solid rgba(255,255,255,0.06);border-radius:8px 8px 8px 0;padding:8px 12px;max-width:95%;align-self:flex-start;}
      .ai-input{background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;font-size:11.5px;color:#e2e8f0;resize:none;}
      .ai-input:focus{border-color:rgba(41,98,255,0.5);}
      /* Scalper mode */
      .scalper-glow{box-shadow:0 0 0 1px rgba(41,98,255,0.5),0 0 20px rgba(41,98,255,0.1);}
      /* Toggle */
      .toggle{width:32px;height:17px;border-radius:9px;transition:all 0.2s;display:flex;align-items:center;padding:2px;cursor:pointer;}
      .toggle-on{background:#2962ff;}
      .toggle-off{background:#374151;}
      .toggle-thumb{width:13px;height:13px;border-radius:50%;background:#fff;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
      /* Depth bars */
      .depth-row{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;padding:2px 10px;font-size:10.5px;cursor:pointer;}
      .depth-row:hover{background:rgba(255,255,255,0.025);}
      /* Animations */
      @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
      @keyframes typing{0%,80%,100%{opacity:0}40%{opacity:1}}
      .fade-up{animation:fadeUp 0.2s ease;}
      .live-dot{animation:blink 1.5s infinite;}
      .dot1{animation:typing 1.2s 0s infinite;}
      .dot2{animation:typing 1.2s 0.2s infinite;}
      .dot3{animation:typing 1.2s 0.4s infinite;}
      /* Divider */
      .divider{height:1px;background:rgba(255,255,255,0.06);}
    `}</style>

    {/* ═══════════════════════════════════════════════════
        TOP NAV — Zerodha Kite style
    ═══════════════════════════════════════════════════ */}
    <nav style={{height:44,background:"#1e222d",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 12px",gap:12,flexShrink:0,zIndex:30}}>
      {/* Logo + indices */}
      <div style={{display:"flex",alignItems:"center",gap:10,paddingRight:12,borderRight:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#2962ff,#1976d2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",flexShrink:0}}>TX</div>
      </div>
      {/* NIFTY / SENSEX quick view */}
      <div style={{display:"flex",gap:20}}>
        {[SYMBOLS[1],SYMBOLS[2]].map(s=>{
          const lv=prices[s.sym]||s;
          const up=(lv.chgPct||s.chgPct)>=0;
          return (
            <div key={s.sym} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>setActiveSym(s)}>
              <span style={{fontSize:11.5,fontWeight:700,color:"#94a3b8"}}>{s.sym}</span>
              <span className="mono" style={{fontSize:12,fontWeight:700,color:up?"#089981":"#f23645"}}>{(lv.price||s.price).toLocaleString("en-IN",{maximumFractionDigits:2})}</span>
              <span style={{fontSize:10,color:up?"#089981":"#f23645",fontFamily:"'JetBrains Mono',monospace"}}>
                {up?"▲":"▼"} {Math.abs(lv.chgPct||s.chgPct).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {/* Search */}
      <div style={{flex:1,maxWidth:300,marginLeft:8}}>
        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:"#6b7280",fontSize:12}}>⌕</span>
          <input value={symSearch} onChange={e=>setSymSearch(e.target.value)} placeholder="Search for anything  [Ctrl+S]"
            style={{flex:1,fontSize:11.5,color:"#d1d5db",background:"transparent"}}/>
        </div>
      </div>
      {/* Nav links */}
      <div style={{display:"flex",gap:16,paddingLeft:8}}>
        {["Markets","TradeOne","Portfolio","Orders","Positions","Tools ▾"].map((l,i)=>(
          <span key={l} className={`nav-link ${i===1?"nav-active":""}`}>{l}</span>
        ))}
      </div>
      {/* Right actions */}
      <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:8,marginLeft:"auto"}}>
        <button style={{fontSize:16,color:"#6b7280",position:"relative"}} title="Notifications">
          🔔<span style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",background:"#f23645",border:"1px solid #1e222d"}}/>
        </button>
        {/* AI button */}
        <button onClick={()=>setShowAI(v=>!v)}
          style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:`1px solid rgba(41,98,255,${showAI?0.6:0.25})`,background:`rgba(41,98,255,${showAI?0.18:0.07})`,color:showAI?"#93c5fd":"#6b7280",transition:"all 0.15s"}}>
          ✦ AI
        </button>
        <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer"}}>VC</div>
      </div>
    </nav>

    {/* ═══════════════════════════════════════════════════
        CHART HEADER — symbol info + Chart / Overview tabs
    ═══════════════════════════════════════════════════ */}
    <div style={{background:"#1e222d",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
      {/* Tab row */}
      <div style={{display:"flex",alignItems:"center",gap:0,padding:"0 14px",height:36}}>
        <button className={`nav-link`} style={{padding:"0 14px",height:"100%",borderBottom:`2px solid ${true?"#2962ff":"transparent"}`,fontWeight:600,fontSize:12.5,color:"#f1f5f9"}}>Chart</button>
        <button className={`nav-link`} style={{padding:"0 14px",height:"100%",borderBottom:"2px solid transparent",fontSize:12.5}}>Overview</button>
        <div style={{flex:1}}/>
        {/* Scalper mode */}
        <button onClick={()=>setScalerMode(v=>!v)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:700,border:`1px solid ${scalperMode?"rgba(41,98,255,0.5)":"rgba(255,255,255,0.08)"}`,background:scalperMode?"rgba(41,98,255,0.12)":"transparent",color:scalperMode?"#60a5fa":"#6b7280",marginRight:8,transition:"all 0.15s"}}
          className={scalperMode?"scalper-glow":""}>
          ⚡ SCALPER MODE {scalperMode?"↗":""}
        </button>
        <button style={{padding:"4px 10px",borderRadius:4,fontSize:11,border:"1px solid rgba(255,255,255,0.08)",color:"#6b7280",marginRight:4}}>Save</button>
        <button style={{fontSize:14,color:"#6b7280",padding:"4px 8px"}}>⚙</button>
        <button style={{fontSize:14,color:"#6b7280",padding:"4px 8px"}}>📷</button>
        <button style={{fontSize:14,color:"#6b7280",padding:"4px 8px"}} onClick={()=>setBottomPanel(v=>!v)}>⛶</button>
      </div>
    </div>

    {/* ═══════════════════════════════════════════════════
        CHART TOOLBAR
    ═══════════════════════════════════════════════════ */}
    <div style={{height:40,background:"#1e222d",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:6,padding:"0 6px",flexShrink:0,overflowX:"auto"}}>
      {/* Light/Dark toggle */}
      <div className="tool-btn" title="Theme">☀</div>
      {/* TF toggle group */}
      <div style={{display:"flex",gap:0,paddingRight:8,borderRight:"1px solid rgba(255,255,255,0.07)"}}>
        {(tfMode==="intra"?TF_INTRA:TF_DAY).map(t=>(
          <button key={t} className={`tf-btn ${tf===t?"tf-active":""}`} onClick={()=>setTf(t)}>{t}</button>
        ))}
        <button onClick={()=>setTfMode(m=>m==="intra"?"day":"intra")}
          style={{padding:"2px 6px",borderRadius:3,fontSize:10,color:"#4b5563",marginLeft:2,border:"1px solid rgba(255,255,255,0.06)"}}>
          {tfMode==="intra"?"D▾":"i▾"}
        </button>
      </div>
      {/* Chart type */}
      <div style={{display:"flex",gap:0,paddingRight:8,borderRight:"1px solid rgba(255,255,255,0.07)"}}>
        {[["candle","⬜"],["bar","☰"],["line","╱"],["area","◺"],["heikin","◈"]].map(([id,ico])=>(
          <button key={id} className={`ct-btn ${ct===id?"ct-active":""}`} title={id} onClick={()=>setCt(id)}>{ico}</button>
        ))}
      </div>
      {/* Indicators */}
      <button onClick={()=>setShowIndPanel(v=>!v)}
        style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:600,border:`1px solid rgba(255,255,255,${showIndPanel?0.15:0.07})`,background:showIndPanel?"rgba(255,255,255,0.05)":"transparent",color:showIndPanel?"#d1d5db":"#6b7280",transition:"all 0.12s"}}>
        ƒ Indicators {activeInds.length>0&&<span style={{color:"#60a5fa",fontFamily:"'JetBrains Mono',monospace"}}>{activeInds.length}</span>}
      </button>
      {/* Active indicator chips */}
      <div style={{display:"flex",gap:4,flexWrap:"nowrap",overflow:"hidden"}}>
        {INDICATORS_LIST.filter(i=>activeInds.includes(i.id)).map(ind=>(
          <span key={ind.id} className="ind-chip ind-on" onClick={()=>setActiveInds(p=>p.filter(x=>x!==ind.id))}>
            <span style={{width:6,height:6,borderRadius:"50%",background:ind.color,boxShadow:`0 0 4px ${ind.color}`}}/>
            {ind.label}{ind.params} ✕
          </span>
        ))}
      </div>
      {/* Indicator panel dropdown */}
      {showIndPanel&&(
        <div className="fade-up" style={{position:"absolute",top:128,left:260,zIndex:50,background:"#1e222d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:12,width:240,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#4b5563",textTransform:"uppercase",marginBottom:8}}>Add Indicator</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {INDICATORS_LIST.map(ind=>(
              <button key={ind.id} className={`ind-chip ${activeInds.includes(ind.id)?"ind-on":""}`}
                onClick={()=>{setActiveInds(p=>p.includes(ind.id)?p.filter(x=>x!==ind.id):[...p,ind.id]);}}
                style={{justifyContent:"flex-start"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:ind.color}}/>
                {ind.label}{ind.params}
                {activeInds.includes(ind.id)&&<span style={{marginLeft:"auto",color:"#60a5fa"}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Compare */}
      <button style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:4,fontSize:10.5,color:"#6b7280",border:"1px solid rgba(255,255,255,0.06)"}}>⊕ Compare</button>
      <div style={{flex:1}}/>
      {/* Instant orders toggle */}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:10.5,color:"#6b7280",fontWeight:600}}>Instant Orders</span>
        <div className={`toggle ${instantOrders?"toggle-on":"toggle-off"}`} onClick={()=>setInstantOrders(v=>!v)}>
          <div className="toggle-thumb" style={{transform:instantOrders?"translateX(15px)":"translateX(0)"}}/>
        </div>
      </div>
      <div style={{width:1,height:22,background:"rgba(255,255,255,0.07)",margin:"0 4px"}}/>
      {/* Undo/Redo */}
      <button className="tool-btn" onClick={()=>setDraws(p=>p.slice(0,-1))} title="Undo">↩</button>
      <button className="tool-btn" title="Redo">↪</button>
      <button className="tool-btn" title="Reset zoom">⊙</button>
      <button className="tool-btn" title="Alerts" style={{color:"#f59e0b"}}>⊕</button>
    </div>

    {/* ═══════════════════════════════════════════════════
        MAIN BODY
    ═══════════════════════════════════════════════════ */}
    <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

      {/* ── LEFT TOOLBAR (drawing tools) ── */}
      <div style={{width:34,background:"#1e222d",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 0",gap:1,flexShrink:0,overflowY:"auto",zIndex:5}}>
        {DRAW_TOOLS.map(t=>(
          <button key={t.id} title={t.tip} className={`tool-btn ${tool===t.id?"tool-active":""}`} onClick={()=>setTool(t.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.svg}/>
            </svg>
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{width:16,height:1,background:"rgba(255,255,255,0.07)",margin:"4px 0"}}/>
        {/* Color dots */}
        {["#2962ff","#089981","#f23645","#f59e0b","#8b5cf6","#ffffff"].map(c=>(
          <button key={c} onClick={()=>setDColor(c)}
            style={{width:13,height:13,borderRadius:"50%",background:c,border:`2px solid ${dColor===c?"rgba(255,255,255,0.7)":"transparent"}`,margin:"1px 0",transition:"all 0.12s",boxShadow:dColor===c?`0 0 5px ${c}`:""}}/>
        ))}
        <div style={{height:6}}/>
        {/* Trash */}
        <button className="tool-btn" onClick={()=>setDraws([])} title="Clear all drawings" style={{color:"#6b7280",fontSize:12}}>🗑</button>
      </div>

      {/* ── CHART AREA ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
        {/* Symbol + OHLCV header above chart */}
        <div style={{padding:"5px 10px 4px",background:"#1a1e2a",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <span style={{fontWeight:700,fontSize:12.5,color:"#f1f5f9"}}>{activeSym.sym}</span>
          <span style={{fontSize:10.5,color:"#6b7280"}}>·</span>
          <span style={{fontSize:10.5,color:"#6b7280"}}>{activeSym.exch}</span>
          {/* BUY SELL inline */}
          <button className="buy-btn" onClick={()=>{}}>BUY @ {fmtPrice(live)}</button>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span className="mono" style={{fontSize:11,color:"#6b7280"}}>Qty</span>
            <input value={orderQty} onChange={e=>setOrderQty(e.target.value)}
              style={{width:36,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3,padding:"2px 5px",fontSize:11,color:"#f1f5f9",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}/>
          </div>
          <button className="sell-btn">SELL @ {fmtPrice(live)}</button>
          {/* OHLCV from hover */}
          {hoverC&&(
            <div style={{display:"flex",gap:12,marginLeft:8}}>
              {[["O",hoverC.open,"#94a3b8"],["H",hoverC.high,"#089981"],["L",hoverC.low,"#f23645"],["C",hoverC.close,hoverC.close>=hoverC.open?"#089981":"#f23645"]].map(([l,v,c])=>(
                <span key={l} className="mono" style={{fontSize:10.5}}>
                  <span style={{color:"#6b7280"}}>{l} </span>
                  <span style={{color:c,fontWeight:600}}>{fmtPrice(v)}</span>
                </span>
              ))}
              <span className="mono" style={{fontSize:10.5,color:"#6b7280"}}>Vol <span style={{color:"#94a3b8"}}>{(hoverC.volume/1e3).toFixed(0)}K</span></span>
            </div>
          )}
          <div style={{flex:1}}/>
          <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#089981"}}>
            <span className="live-dot" style={{width:5,height:5,borderRadius:"50%",background:"#089981",display:"block"}}/>
            LIVE
          </span>
        </div>

        {/* Canvas */}
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <canvas ref={cvs} style={{width:"100%",height:"100%",display:"block",cursor:tool==="cursor"||tool==="crosshair"?"crosshair":"crosshair"}}
            onMouseMove={onMM} onMouseDown={onMD} onMouseUp={onMU}
            onMouseLeave={()=>{setXhair(null);setHoverC(null);}}
            onClick={e=>{if(showIndPanel)setShowIndPanel(false);}}
          />
          {/* Powered by */}
          <div style={{position:"absolute",bottom:4,left:12,display:"flex",alignItems:"center",gap:6,fontSize:9,color:"#374151"}}>
            <span style={{fontWeight:700,fontSize:10}}>TV</span>
            <span>Powered by</span>
            <span style={{fontWeight:700,color:"#2962ff"}}>Tick by Tick</span>
            <span style={{color:"#374151"}}>·</span>
            {TF_DAY.map(t=>(
              <button key={t} className={`tf-btn ${tf===t?"tf-active":""}`} onClick={()=>setTf(t)} style={{padding:"0 4px",fontSize:9}}>{t}</button>
            ))}
          </div>
          {/* Time display */}
          <div style={{position:"absolute",bottom:4,right:80,fontSize:9,color:"#4b5563",fontFamily:"'JetBrains Mono',monospace"}}>
            {new Date().toLocaleTimeString("en-IN",{hour12:false})} (UTC+5:30)
          </div>
        </div>

        {/* ── BOTTOM PANEL (positions/orders/news) ── */}
        {bottomPanel&&(
          <div style={{height:180,background:"#1a1e2a",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:0,padding:"0 12px",height:32,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              {[["pos","Positions",positions.length],["ord","Orders",orders.filter(o=>o.status==="OPEN").length],["hist","History",null],["alerts","Alerts",2],["news","News",null]].map(([id,l,cnt])=>(
                <button key={id} onClick={()=>setBottomPanel(id)}
                  style={{padding:"0 12px",height:"100%",fontSize:11,fontWeight:500,borderBottom:`2px solid ${bottomPanel===id?"#2962ff":"transparent"}`,color:bottomPanel===id?"#f1f5f9":"#6b7280",transition:"all 0.12s",whiteSpace:"nowrap"}}>
                  {l}{cnt!=null&&<span style={{marginLeft:4,padding:"0 5px",borderRadius:8,fontSize:8,background:"rgba(255,255,255,0.06)",color:"#6b7280"}}>{cnt}</span>}
                </button>
              ))}
              <div style={{flex:1}}/>
              <span style={{fontSize:10,color:totalPnl>=0?"#089981":"#f23645",fontFamily:"'JetBrains Mono',monospace",paddingBottom:6,fontWeight:700}}>
                Total P&L: {totalPnl>=0?"+":""}₹{Math.abs(totalPnl).toFixed(2)}
              </span>
            </div>
            <div style={{flex:1,overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Symbol","Exchange","Qty","Avg","LTP","P&L","P&L %","Action"].map(h=><th key={h} className="t-head" style={{textAlign:"left"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {positions.map((p,i)=>{
                    const lv=prices[p.sym]||p;
                    const pnl=(lv.price-p.avg)*p.qty*(p.side==="short"?-1:1);
                    const pct=(pnl/(p.avg*p.qty))*100;
                    return <tr key={i} className="t-row"><td className="t-cell" style={{fontWeight:600,color:"#f1f5f9"}}>{p.sym}</td><td className="t-cell" style={{color:"#6b7280"}}>{p.exch}</td><td className="t-cell mono">{p.qty}</td><td className="t-cell mono" style={{color:"#94a3b8"}}>₹{p.avg.toFixed(2)}</td><td className="t-cell mono" style={{fontWeight:600}}>₹{fmtPrice(lv.price||p.ltp)}</td><td className="t-cell mono" style={{color:pnl>=0?"#089981":"#f23645",fontWeight:700}}>₹{pnl.toFixed(2)}</td><td className="t-cell mono" style={{color:pct>=0?"#089981":"#f23645"}}>{pct.toFixed(2)}%</td><td className="t-cell"><div style={{display:"flex",gap:4}}><button style={{padding:"2px 8px",fontSize:9,borderRadius:3,border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8"}}>Exit</button><button style={{padding:"2px 8px",fontSize:9,borderRadius:3,border:"1px solid rgba(255,255,255,0.08)",color:"#6b7280"}}>Add</button></div></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT ICON SIDEBAR ── */}
      <div style={{width:44,background:"#1e222d",borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0",flexShrink:0,zIndex:5}}>
        {[
          {id:"watchlist",icon:"☰",tip:"Watchlist"},
          {id:"positions",icon:"◐",tip:"Positions"},
          {id:"orders",   icon:"📋",tip:"Orders"},
          {id:"depth",    icon:"≡",tip:"Market Depth"},
          {id:"optionchain",icon:"⚙",tip:"Option Chain"},
        ].map(p=>(
          <button key={p.id} title={p.tip}
            className={`rp-tab ${rightPanel===p.id?"rp-tab-active":""}`}
            onClick={()=>setRightPanel(v=>v===p.id?null:p.id)}>
            <span style={{fontSize:14,color:"#6b7280"}}>{p.icon}</span>
            <span style={{fontSize:7,color:"#4b5563",letterSpacing:"0.04em",fontWeight:600,writingMode:"horizontal-tb"}}>{p.tip.split(" ")[0].slice(0,5)}</span>
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{fontSize:8,color:"#374151",padding:"6px 0",textAlign:"center",writingMode:"vertical-rl",letterSpacing:"0.05em"}}>MORE</div>
      </div>

      {/* ── RIGHT PANEL CONTENT ── */}
      {rightPanel&&(
        <div style={{width:248,background:"#1a1e2a",borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>

          {/* WATCHLIST */}
          {rightPanel==="watchlist"&&(
            <>
              <div style={{padding:"8px 10px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:5,padding:"4px 8px",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:"#4b5563",fontSize:11}}>⌕</span>
                  <input value={symSearch} onChange={e=>setSymSearch(e.target.value)} placeholder="Search symbols"
                    style={{flex:1,fontSize:11,color:"#d1d5db",background:"transparent"}}/>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {filtSym.map(s=>{
                  const lv=prices[s.sym]||s;
                  const up=(lv.chgPct||s.chgPct)>=0;
                  return (
                    <div key={s.sym} className={`sym-row ${activeSym.sym===s.sym?"sym-row-active":""}`}
                      onClick={()=>setActiveSym(s)}
                      style={{padding:"7px 10px 5px",borderBottom:"1px solid rgba(255,255,255,0.03)",display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <span style={{fontWeight:600,fontSize:11.5,color:activeSym.sym===s.sym?"#60a5fa":"#e2e8f0"}}>{s.sym}</span>
                          <span style={{fontSize:9,color:"#4b5563",marginLeft:4,fontFamily:"'JetBrains Mono',monospace"}}>{s.exch}</span>
                        </div>
                        <span className="mono" style={{fontSize:11,fontWeight:700,color:up?"#089981":"#f23645"}}>{fmtPrice(lv.price||s.price)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:9,color:"#4b5563"}}>{s.name.slice(0,22)}</span>
                        <span className={up?"badge-up":"badge-dn"}>{up?"▲":"▼"} {Math.abs(lv.chgPct||s.chgPct).toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* POSITIONS */}
          {rightPanel==="positions"&&(
            <>
              <div style={{padding:"10px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>Positions</span>
                  <span className="mono" style={{fontSize:11,color:totalPnl>=0?"#089981":"#f23645",fontWeight:700}}>₹{totalPnl.toFixed(2)}</span>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {positions.map((p,i)=>{
                  const lv=prices[p.sym]||p;
                  const pnl=(lv.price-p.avg)*p.qty*(p.side==="short"?-1:1);
                  const pct=(pnl/(p.avg*p.qty))*100;
                  return (
                    <div key={i} style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <div>
                          <span style={{fontWeight:600,fontSize:12,color:"#f1f5f9"}}>{p.sym}</span>
                          <span style={{marginLeft:6,padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,background:p.side==="long"?"rgba(8,153,129,0.15)":"rgba(242,54,69,0.15)",color:p.side==="long"?"#089981":"#f23645"}}>{p.side.toUpperCase()}</span>
                        </div>
                        <span className="mono" style={{fontSize:11,color:pnl>=0?"#089981":"#f23645",fontWeight:700}}>₹{pnl.toFixed(2)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                        <span style={{color:"#6b7280"}}>Qty: <span className="mono" style={{color:"#94a3b8"}}>{p.qty}</span></span>
                        <span style={{color:"#6b7280"}}>Avg: <span className="mono" style={{color:"#94a3b8"}}>₹{p.avg}</span></span>
                        <span style={{color:pct>=0?"#089981":"#f23645"}} className="mono">{pct.toFixed(2)}%</span>
                      </div>
                      <div style={{marginTop:6,display:"flex",gap:4}}>
                        <button className="sell-btn" style={{padding:"3px 10px",fontSize:10}}>Exit</button>
                        <button style={{padding:"3px 10px",fontSize:10,borderRadius:3,border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",fontWeight:600}}>+Add</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ORDERS */}
          {rightPanel==="orders"&&(
            <>
              <div style={{padding:"10px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>Orders</span>
                <span style={{fontSize:9,color:"#6b7280"}}>{orders.filter(o=>o.status==="OPEN").length} open</span>
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {orders.map((o,i)=>(
                  <div key={i} style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:600,fontSize:12,color:"#f1f5f9"}}>{o.sym}</span>
                      <span style={{padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:o.status==="OPEN"?"rgba(245,158,11,0.15)":"rgba(8,153,129,0.15)",color:o.status==="OPEN"?"#f59e0b":"#089981"}}>{o.status}</span>
                    </div>
                    <div style={{fontSize:10,color:"#6b7280",display:"flex",gap:10}}>
                      <span style={{padding:"1px 6px",borderRadius:3,fontWeight:700,background:o.side==="BUY"?"rgba(8,153,129,0.12)":"rgba(242,54,69,0.12)",color:o.side==="BUY"?"#089981":"#f23645"}}>{o.side}</span>
                      <span>{o.type}</span>
                      <span className="mono" style={{color:"#94a3b8"}}>{o.qty} qty</span>
                      {o.price>0&&<span className="mono" style={{color:"#94a3b8"}}>@ ₹{o.price}</span>}
                    </div>
                    {o.status==="OPEN"&&(
                      <button style={{marginTop:6,padding:"2px 10px",fontSize:9,borderRadius:3,border:"1px solid rgba(242,54,69,0.3)",color:"rgba(242,54,69,0.7)",fontWeight:600}}>Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* MARKET DEPTH */}
          {rightPanel==="depth"&&(
            <>
              <div style={{padding:"8px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>{activeSym.sym}</span>
                  <span className={isUp?"badge-up":"badge-dn"}>{isUp?"▲":"▼"} {Math.abs(liveData.chgPct||activeSym.chgPct).toFixed(2)}%</span>
                </div>
                <div className="mono" style={{fontSize:16,fontWeight:700,color:isUp?"#089981":"#f23645"}}>{fmtPrice(live)}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"3px 10px 3px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["Buy Qty","Price","Sell Qty"].map((h,i)=>(
                  <span key={h} style={{fontSize:8,fontWeight:700,letterSpacing:"0.08em",color:"#4b5563",textTransform:"uppercase",textAlign:i===0?"left":i===1?"center":"right"}}>{h}</span>
                ))}
              </div>
              {[...Array(5)].map((_,i)=>{
                const bp=live-(5-i)*live*0.0004, sp=live+(i+1)*live*0.0004;
                const bq=Math.floor(Math.random()*900+50), sq=Math.floor(Math.random()*900+50);
                const bpct=Math.random()*70+10, spct=Math.random()*70+10;
                return (
                  <div key={i} className="depth-row">
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${bpct}%`,background:"rgba(8,153,129,0.08)"}}/>
                    <div style={{position:"absolute",right:0,top:0,bottom:0,width:`${spct}%`,background:"rgba(242,54,69,0.08)"}}/>
                    <span className="mono" style={{position:"relative",color:"#089981",fontSize:11}}>{bq}</span>
                    <span className="mono" style={{position:"relative",textAlign:"center",fontSize:11}}>
                      <span style={{display:"block",color:"#089981"}}>{bp.toFixed(2)}</span>
                      <span style={{display:"block",color:"#f23645"}}>{sp.toFixed(2)}</span>
                    </span>
                    <span className="mono" style={{position:"relative",textAlign:"right",color:"#f23645",fontSize:11}}>{sq}</span>
                  </div>
                );
              })}
              <div style={{padding:"6px 12px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:10}}>
                {[["Total Buy","4,832"],["Total Sell","3,901"],["Open Int","—"],["LTQ","200"]].map(([l,v])=>(
                  <div key={l}><div style={{color:"#4b5563",fontSize:8,textTransform:"uppercase",marginBottom:2}}>{l}</div><div className="mono" style={{color:"#94a3b8",fontWeight:600}}>{v}</div></div>
                ))}
              </div>
              {/* Quick buy/sell */}
              <div style={{padding:"8px 12px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <button className="buy-btn" style={{padding:"8px 0",borderRadius:4,fontSize:11}}>BUY</button>
                <button className="sell-btn" style={{padding:"8px 0",borderRadius:4,fontSize:11}}>SELL</button>
              </div>
            </>
          )}

          {/* OPTION CHAIN */}
          {rightPanel==="optionchain"&&(
            <>
              <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Option Chain</div>
                <div style={{display:"flex",gap:4}}>
                  {["Weekly","Monthly","Quarterly"].map((e,i)=>(
                    <button key={e} style={{padding:"2px 8px",borderRadius:3,fontSize:9.5,fontWeight:600,border:`1px solid rgba(255,255,255,${i===0?0.15:0.07})`,background:i===0?"rgba(255,255,255,0.07)":"transparent",color:i===0?"#e2e8f0":"#6b7280"}}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",padding:"3px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {["CALLS","Strike","PUTS"].map((h,i)=>(
                  <span key={h} style={{fontSize:8,fontWeight:700,color:i===0?"#089981":i===2?"#f23645":"#6b7280",textAlign:i===0?"left":i===1?"center":"right",letterSpacing:"0.08em"}}>{h}</span>
                ))}
              </div>
              <div style={{flex:1,overflowY:"auto"}}>
                {[...Array(10)].map((_,i)=>{
                  const strike=Math.round((live+(i-5)*live*0.01)/50)*50;
                  const callOI=Math.floor(Math.random()*8000+200);
                  const putOI=Math.floor(Math.random()*8000+200);
                  const callPr=(Math.max(live-strike,0)+Math.random()*15+0.5).toFixed(2);
                  const putPr=(Math.max(strike-live,0)+Math.random()*15+0.5).toFixed(2);
                  const isATM=i===5;
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",padding:"4px 8px",borderBottom:"1px solid rgba(255,255,255,0.03)",background:isATM?"rgba(41,98,255,0.06)":"transparent"}}>
                      <div>
                        <div className="mono" style={{fontSize:10.5,color:"#089981",fontWeight:600}}>₹{callPr}</div>
                        <div style={{fontSize:8.5,color:"#4b5563"}}>{(callOI/1000).toFixed(1)}K OI</div>
                      </div>
                      <div style={{textAlign:"center",padding:"0 6px"}}>
                        <div className="mono" style={{fontSize:10.5,fontWeight:700,color:isATM?"#60a5fa":"#94a3b8"}}>{strike.toLocaleString()}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="mono" style={{fontSize:10.5,color:"#f23645",fontWeight:600}}>₹{putPr}</div>
                        <div style={{fontSize:8.5,color:"#4b5563",textAlign:"right"}}>{(putOI/1000).toFixed(1)}K OI</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── AI ASSISTANT PANEL ── */}
      {showAI&&(
        <div className="fade-up" style={{width:320,background:"#0f172a",borderLeft:"1px solid rgba(41,98,255,0.2)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
          {/* Header */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(41,98,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,boxShadow:"0 0 10px rgba(41,98,255,0.4)"}}>✦</div>
              <div>
                <div style={{fontWeight:700,fontSize:12,color:"#f1f5f9"}}>AI Trading Assistant</div>
                <div style={{fontSize:9,color:"#60a5fa"}}>Powered by TradEx AI · GPT-4o</div>
              </div>
            </div>
            <button onClick={()=>setShowAI(false)} style={{color:"#6b7280",fontSize:14}}>✕</button>
          </div>
          {/* Quick prompts */}
          <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:5,flexWrap:"wrap"}}>
            {[`Analyse ${activeSym.sym}`,`News for ${activeSym.sym}`,`Predict price`,`What is RSI?`].map(q=>(
              <button key={q} onClick={()=>{setAiInput(q);setTimeout(()=>document.getElementById("ai-send-btn")?.click(),50);}}
                style={{padding:"3px 8px",borderRadius:20,fontSize:9.5,border:"1px solid rgba(41,98,255,0.25)",color:"#60a5fa",background:"rgba(41,98,255,0.07)",transition:"all 0.12s",fontWeight:500}}>
                {q}
              </button>
            ))}
          </div>
          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:10}}>
            {aiMessages.map((m,i)=>(
              <div key={i} className={m.role==="user"?"ai-msg-user":"ai-msg-bot"}>
                {m.role==="assistant"&&(
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                    <div style={{width:16,height:16,borderRadius:4,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:"#fff"}}>✦</div>
                    <span style={{fontSize:9,color:"#60a5fa",fontWeight:600}}>TradEx AI</span>
                  </div>
                )}
                <Markdown text={m.text}/>
              </div>
            ))}
            {aiLoading&&(
              <div className="ai-msg-bot">
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <div style={{width:16,height:16,borderRadius:4,background:"linear-gradient(135deg,#2962ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900}}>✦</div>
                  <span style={{fontSize:10,color:"#60a5fa"}}>Thinking</span>
                  <span className="dot1" style={{width:4,height:4,borderRadius:"50%",background:"#60a5fa",display:"block"}}/>
                  <span className="dot2" style={{width:4,height:4,borderRadius:"50%",background:"#60a5fa",display:"block"}}/>
                  <span className="dot3" style={{width:4,height:4,borderRadius:"50%",background:"#60a5fa",display:"block"}}/>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
          {/* Input */}
          <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{position:"relative"}}>
              <textarea className="ai-input" value={aiInput} onChange={e=>setAiInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI();}}}
                placeholder={`Ask anything about ${activeSym.sym}…`}
                rows={2} style={{width:"100%",paddingRight:36}}/>
              <button id="ai-send-btn" onClick={sendAI} disabled={aiLoading||!aiInput.trim()}
                style={{position:"absolute",right:8,bottom:8,width:24,height:24,borderRadius:6,background:aiInput.trim()&&!aiLoading?"#2962ff":"#374151",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontSize:12,color:"#fff"}}>
                ↑
              </button>
            </div>
            <div style={{fontSize:8.5,color:"#374151",marginTop:4}}>Enter to send · Shift+Enter for newline · Not financial advice</div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}