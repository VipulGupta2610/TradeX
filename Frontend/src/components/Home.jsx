import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const NAV_LINKS = ["Product", "Developers", "Enterprise", "Pricing", "Blog"];

const TICKER_ITEMS = [
  { sym: "AAPL", val: "+3.12%", price: "$189.34" },
  { sym: "BTC", val: "+4.89%", price: "$67,420" },
  { sym: "TSLA", val: "-1.02%", price: "$212.44" },
  { sym: "NIFTY", val: "+1.87%", price: "21,843" },
  { sym: "ETH", val: "+2.31%", price: "$3,210" },
  { sym: "NVDA", val: "+6.21%", price: "$872.20" },
  { sym: "SPY", val: "+0.97%", price: "$511.88" },
  { sym: "AMZN", val: "+1.55%", price: "$178.90" },
];

const FEATURES = [
  {
    icon: "⬡",
    title: "Institutional-Grade Simulation",
    desc: "Execute paper trades with real market data, microsecond fills, and realistic slippage modeling. Train like a professional.",
    tag: "SIMULATION ENGINE",
  },
  {
    icon: "◈",
    title: "Live Market Data APIs",
    desc: "WebSocket streams for equities, crypto, forex, and futures. Sub-100ms latency. REST & gRPC endpoints included.",
    tag: "DATA INFRASTRUCTURE",
  },
  {
    icon: "◉",
    title: "Embeddable Chart SDK",
    desc: "Drop TradingView-compatible charts into any app with a single import. Fully customizable with React or vanilla JS.",
    tag: "CHARTING",
  },
  {
    icon: "⬟",
    title: "Portfolio Intelligence",
    desc: "Real-time P&L, Greeks, Sharpe ratios, drawdown analysis and risk attribution dashboards out of the box.",
    tag: "ANALYTICS",
  },
  {
    icon: "⬠",
    title: "Multi-Asset Order Books",
    desc: "Level 2 depth-of-market, consolidated tape, options chains and futures spreads all in one unified feed.",
    tag: "ORDER FLOW",
  },
  {
    icon: "◇",
    title: "Backtesting Framework",
    desc: "Run strategy backtests over 20 years of OHLCV data with event-driven simulation and transaction cost models.",
    tag: "STRATEGY TESTING",
  },
];

const STEPS = [
  { num: "01", title: "Connect your account", desc: "One API key unlocks the full platform. No credit card required to start." },
  { num: "02", title: "Stream live market data", desc: "WebSocket feeds deliver real-time ticks to your app in under 100ms." },
  { num: "03", title: "Execute paper trades", desc: "Simulate fills with real spreads, depth, and latency modeling." },
  { num: "04", title: "Analyze & iterate", desc: "Portfolio analytics surface insights to refine your edge." },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    sub: "forever",
    features: ["100K API calls/month", "5 concurrent streams", "Paper trading", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    sub: "per month",
    features: ["5M API calls/month", "50 concurrent streams", "Backtesting engine", "Priority support", "Custom webhooks"],
    cta: "Start Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "tailored pricing",
    features: ["Unlimited API calls", "Unlimited streams", "White-label SDK", "Dedicated SLA", "SSO & RBAC"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const LOGOS = ["BlackRock", "Sequoia", "Goldman", "a16z", "Citadel", "Binance", "Robinhood", "Deutsche Bank"];

const TESTIMONIALS = [
  {
    quote: "We replaced our in-house paper trading stack with TradEx in a weekend. The API is phenomenal.",
    name: "Arjun Mehta",
    role: "CTO, AlphaFlow Capital",
    avatar: "AM",
  },
  {
    quote: "Our students now practice with real market conditions before they ever touch live capital. Game-changing.",
    name: "Sarah Chen",
    role: "Head of Quant Education, FinLearn",
    avatar: "SC",
  },
  {
    quote: "The embedded charts look better than Bloomberg. Our clients actually prefer our dashboard now.",
    name: "Marcus Okafor",
    role: "Founder, TradeMind",
    avatar: "MO",
  },
];

function TickerBar() {
  return (
    <div className="border-t border-b border-white/[0.06] py-3 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <span key={i} className="text-sm font-mono flex items-center gap-3">
            <span className="text-zinc-200 font-bold tracking-wider">{t.sym}</span>
            <span className="text-zinc-500">{t.price}</span>
            <span className={t.val.startsWith("+") ? "text-emerald-400" : "text-rose-400"}>{t.val}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function GlowOrb({ className }) {
  return (
    <div className={`absolute rounded-full pointer-events-none ${className}`} />
  );
}

function MiniChart() {
  const points = [40, 55, 45, 65, 58, 72, 68, 82, 75, 90, 85, 96];
  const w = 200, h = 80;
  const max = Math.max(...points), min = Math.min(...points);
  const coords = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - ((p - min) / (max - min)) * (h - 10) - 5,
  ]);
  const pathD = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} className="w-full opacity-80">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="themeable-page bg-[#050505] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900&family=DM+Mono:wght@400;500&display=swap');
        .noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
        .grad-text { background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.4)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .accent-text { background: linear-gradient(90deg, #34d399, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-border { background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.07); }
        .feature-card:hover { background: linear-gradient(135deg, rgba(52,211,153,0.05), rgba(34,211,238,0.03)); border-color: rgba(52,211,153,0.2); }
        .plan-card-highlight { background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(34,211,238,0.05)); border: 1px solid rgba(52,211,153,0.3); }
        ::-webkit-scrollbar { width: 4px; background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Fixed Background */}
      <div className="fixed inset-0 -z-10">
        <div className="noise absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(52,211,153,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* ── HERO ── */}
<section ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-24 overflow-hidden bg-[#050505]">
      
      {/* 1. ARCHITECTURAL BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <GlowOrb className="w-[800px] h-[800px] -top-40 left-1/2 -translate-x-1/2 opacity-[0.05] z-0" style={{ background: "radial-gradient(circle,#34d399,transparent 70%)" }} />
      <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Edge-to-Edge Container */}
      <div className="relative z-10 w-full flex justify-between items-center pl-8 lg:pl-16 xl:pl-24 pr-0 pb-20">
        
        {/* LEFT COLUMN: Typography & CTA */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="w-full lg:w-[45%] xl:w-[40%] relative z-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/[0.08] backdrop-blur-md"
            style={{ background: "rgba(52,211,153,0.06)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-emerald-300 text-[11px] font-bold tracking-widest uppercase">Live Market Data · v2.4 Released</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-[4.5rem] md:text-7xl xl:text-[8rem] 2xl:text-[9.5rem] font-black leading-[0.85] tracking-tighter"
          >
            <span className="grad-text">Trade.</span>
            <br />
            <span className="grad-text">Analyze.</span>
            <br />
            <span className="accent-text drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">Scale.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-zinc-400 text-lg xl:text-xl max-w-[480px] leading-relaxed mb-10 mt-8"
          >
            The complete developer infrastructure for paper trading, market data streaming, embedded analytics, and financial product development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button className="px-8 py-4 rounded-full font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-100 shadow-[0_0_40px_rgba(52,211,153,0.25)]" style={{ background: "linear-gradient(135deg,#34d399,#22d3ee)", color: "#050505" }}>
              Start Building Free
            </button>
            <button className="px-8 py-4 rounded-full font-semibold text-sm md:text-base border border-white/10 hover:bg-white/[0.04] transition-colors flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              View Live Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 mt-12"
          >
            <div className="flex -space-x-3">
              {["#34d399", "#22d3ee", "#a78bfa", "#f472b6", "#fb923c"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#050505] flex items-center justify-center text-[10px] font-black shadow-lg" style={{ background: c, color: "#050505" }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500 font-medium">Trusted by <span className="text-white font-bold">100,000+</span> developers</p>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: Eye-Catching Abstract Background */}
        <div className="hidden lg:block w-[55%] xl:w-[60%] relative h-[750px] perspective-1000">
          
          {/* THE NEW ANCHOR: Modern, abstract glowing spline visual bleeding off the edge */}
          <motion.div 
            initial={{ opacity: 0, rotateY: -20, x: 150 }}
            animate={{ opacity: 1, rotateY: -8, x: "5%" }} 
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-[110%] h-[650px] bg-[#020202] border border-white/10 rounded-l-[40px] shadow-[-20px_0_60px_rgba(0,0,0,0.8)] overflow-hidden z-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Soft Ambient Inner Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1),transparent_60%)] pointer-events-none" />

            {/* Fine Grain Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Subtle Inner Grid System */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]" />

            {/* Animated SVG Spline / Momentum Line */}
            <svg className="absolute w-full h-[120%] top-[-10%] left-0" viewBox="0 0 1000 800" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                  <stop offset="20%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="fill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Background blurred line for glow effect */}
              <motion.path
                d="M 0,600 C 200,500 300,700 500,400 C 700,100 800,500 1000,200 L 1000,800 L 0,800 Z"
                fill="url(#fill-grad)"
              />
              <motion.path
                d="M 0,600 C 200,500 300,700 500,400 C 700,100 800,500 1000,200"
                stroke="url(#spline-grad)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                style={{ filter: "blur(8px)" }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              
              {/* Foreground sharp line */}
              <motion.path
                d="M 0,600 C 200,500 300,700 500,400 C 700,100 800,500 1000,200"
                stroke="url(#spline-grad)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, pathOffset: 1 }}
                animate={{ pathLength: 1, pathOffset: 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
              />
              
              {/* Floating Data Nodes on the Spline */}
              <motion.circle cx="500" cy="400" r="4" fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.2] }} transition={{ delay: 2, duration: 2, repeat: Infinity }} />
              <motion.circle cx="780" cy="230" r="4" fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.2] }} transition={{ delay: 2.5, duration: 2, repeat: Infinity }} />
            </svg>
          </motion.div>

          {/* LAYERED FLOATING CARDS */}
          <div className="absolute right-12 xl:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20 w-64 xl:w-72">
            {[
              { sym: "AAPL", price: "$189.34", change: "+3.12%", up: true, delay: 0.4 },
              { sym: "BTC/USDT", price: "$67,420", change: "+4.89%", up: true, delay: 0.55 },
              { sym: "TSLA", price: "$212.44", change: "-1.02%", up: false, delay: 0.7 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1, y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                transition={{ 
                  delay: item.delay, 
                  y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i } 
                }}
                className="card-border rounded-3xl p-6 bg-[#0A0A0A]/60 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 hover:border-white/20 hover:bg-[#0A0A0A]/80 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-bold text-sm xl:text-base tracking-wide">{item.sym}</span>
                  <span className={`text-[10px] xl:text-xs font-bold px-3 py-1 rounded-full ${item.up ? "bg-emerald-400/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-400/10 text-rose-400 border border-rose-500/20"}`}>
                    {item.change}
                  </span>
                </div>
                <p className="text-3xl xl:text-4xl font-black mb-4 tracking-tight">{item.price}</p>
                <div className="h-12 w-full opacity-80">
                  <MiniChart />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>

      {/* ── TICKER ── */}
      <TickerBar />

      {/* ── LOGO STRIP ── */}
      <section className="py-16 px-8 text-center border-b border-white/[0.05]">
        <p className="text-zinc-600 text-xs uppercase tracking-[0.3em] font-semibold mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12 items-center">
          {LOGOS.map(l => (
            <span key={l} className="text-zinc-600 font-bold text-sm tracking-widest hover:text-zinc-400 transition-colors">{l}</span>
          ))}
        </div>
      </section>

      {/* ── BOLD STATEMENT ── */}
      <section className="py-40 px-8 text-center overflow-hidden border-b border-white/[0.05]">
        <motion.h2
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.5rem,7vw,6rem)] font-black leading-tight tracking-tighter"
        >
          THE MARKET DOESN'T FORGIVE.
          <br />
          <span className="text-zinc-600">PRACTICE DOES.</span>
        </motion.h2>
        <motion.p
          whileInView={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-zinc-500 text-xl mt-6 max-w-xl mx-auto"
        >
          Build your edge without risking capital. Then graduate to live markets with confidence.
        </motion.p>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-32 px-8 lg:px-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Platform Capabilities</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Everything you need
              <br />
              <span className="text-zinc-600">to ship faster.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="feature-card card-border rounded-3xl p-8 transition-all duration-300 cursor-default"
              >
                <div className="text-4xl mb-6 text-emerald-300/60">{f.icon}</div>
                <p className="text-xs font-semibold tracking-[0.25em] text-zinc-600 mb-3 uppercase">{f.tag}</p>
                <h3 className="text-xl font-bold mb-3 leading-snug">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-40 px-8 lg:px-20 border-b border-white/[0.05] relative overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] top-0 right-0 opacity-[0.03]" style={{ background: "radial-gradient(circle,#22d3ee,transparent 70%)" }} />
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Getting Started</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Four steps to live.</h2>
          </div>
          <div className="relative">
            <div className="absolute left-[3.25rem] top-8 bottom-8 w-px bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 hidden lg:block" />
            <div className="space-y-0">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -30 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="flex gap-10 items-start group py-10 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl border border-white/[0.08] flex items-center justify-center font-black text-sm text-zinc-600 group-hover:text-emerald-400 group-hover:border-emerald-400/30 transition-colors bg-white/[0.02]" style={{ fontFamily: "'DM Mono', monospace" }}>{s.num}</div>
                  <div className="pt-1">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">{s.title}</h3>
                    <p className="text-zinc-500 text-lg">{s.desc}</p>
                  </div>
                  <div className="ml-auto hidden lg:block pt-2 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 text-2xl">→</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CODE SECTION ── */}
      <section className="py-32 px-8 lg:px-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Developer First</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
              BUILT FOR
              <br />
              <span className="text-zinc-600">DEVELOPERS.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Stop reinventing chart engines and market data pipelines. Ship differentiated financial products in days, not months.
            </p>
            <ul className="space-y-3">
              {["TypeScript SDK with full type coverage", "React hooks for real-time data binding", "OpenAPI 3.0 documented REST endpoints", "FIX protocol support for institutional clients"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-xs">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-3xl overflow-hidden border border-white/[0.07]" style={{ background: "#0A0A0A" }}>
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                  <div className="w-3 h-3 rounded-full bg-green-500/40" />
                </div>
                <span className="text-zinc-600 text-xs font-mono">tradex.ts</span>
                <span className="text-xs text-zinc-600 font-mono">← copy</span>
              </div>
              <pre className="p-8 text-sm leading-loose overflow-x-auto" style={{ fontFamily: "'DM Mono', monospace" }}>
<code>
<span className="text-zinc-500">// Initialize the client</span>{"\n"}
<span className="text-sky-400">import</span> <span className="text-white">&#123; TradEx &#125;</span> <span className="text-sky-400">from</span> <span className="text-emerald-300">'@tradex/sdk'</span>{"\n\n"}
<span className="text-sky-400">const</span> <span className="text-white">client</span> <span className="text-zinc-400">=</span> <span className="text-sky-300">new</span> <span className="text-yellow-300">TradEx</span><span className="text-zinc-400">(&#123;</span>{"\n"}
{"  "}<span className="text-white">apiKey</span><span className="text-zinc-400">:</span> <span className="text-emerald-300">process.env.TRADEX_KEY</span>{"\n"}
<span className="text-zinc-400">&#125;)</span>{"\n\n"}
<span className="text-zinc-500">// Stream live quotes</span>{"\n"}
<span className="text-sky-400">const</span> <span className="text-white">stream</span> <span className="text-zinc-400">=</span> <span className="text-white">client</span><span className="text-zinc-400">.</span><span className="text-yellow-300">subscribe</span><span className="text-zinc-400">([</span><span className="text-emerald-300">'AAPL'</span><span className="text-zinc-400">,</span> <span className="text-emerald-300">'BTC'</span><span className="text-zinc-400">])</span>{"\n"}
<span className="text-white">stream</span><span className="text-zinc-400">.</span><span className="text-yellow-300">on</span><span className="text-zinc-400">(</span><span className="text-emerald-300">'tick'</span><span className="text-zinc-400">, (</span><span className="text-white">data</span><span className="text-zinc-400">) =&gt; &#123;</span>{"\n"}
{"  "}<span className="text-white">console</span><span className="text-zinc-400">.</span><span className="text-yellow-300">log</span><span className="text-zinc-400">(</span><span className="text-white">data</span><span className="text-zinc-400">.</span><span className="text-white">symbol</span><span className="text-zinc-400">,</span> <span className="text-white">data</span><span className="text-zinc-400">.</span><span className="text-white">price</span><span className="text-zinc-400">)</span>{"\n"}
<span className="text-zinc-400">&#125;)</span>{"\n\n"}
<span className="text-zinc-500">// Execute a paper trade</span>{"\n"}
<span className="text-sky-400">const</span> <span className="text-white">order</span> <span className="text-zinc-400">=</span> <span className="text-sky-400">await</span> <span className="text-white">client</span><span className="text-zinc-400">.</span><span className="text-yellow-300">trade</span><span className="text-zinc-400">(&#123;</span>{"\n"}
{"  "}<span className="text-white">symbol</span><span className="text-zinc-400">:</span> <span className="text-emerald-300">'AAPL'</span><span className="text-zinc-400">,</span>{"\n"}
{"  "}<span className="text-white">side</span><span className="text-zinc-400">:</span> <span className="text-emerald-300">'buy'</span><span className="text-zinc-400">,</span>{"\n"}
{"  "}<span className="text-white">quantity</span><span className="text-zinc-400">:</span> <span className="text-yellow-300">100</span>{"\n"}
<span className="text-zinc-400">&#125;)</span>{"\n"}
<span className="text-zinc-400">▊</span>
</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-24 px-8 lg:px-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "1B+", label: "Market events processed" },
              { num: "100K+", label: "Active developers" },
              { num: "<80ms", label: "Median data latency" },
              { num: "99.99%", label: "API uptime SLA" },
            ].map(({ num, label }, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card-border rounded-3xl p-8 text-center"
              >
                <h3 className="text-4xl lg:text-5xl font-black mb-2 accent-text">{num}</h3>
                <p className="text-zinc-500 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-40 px-8 lg:px-20 border-b border-white/[0.05] relative overflow-hidden">
        <GlowOrb className="w-[500px] h-[500px] bottom-0 left-0 opacity-[0.03]" style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-600 text-xs uppercase tracking-[0.3em] font-semibold mb-16">What builders say</p>
          <AnimatePresence mode="wait">
            {TESTIMONIALS.map((t, i) =>
              i === activeTestimonial ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-3xl md:text-4xl font-bold leading-snug tracking-tight mb-10 text-zinc-100">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#34d399,#22d3ee)", color: "#050505" }}>
                      {t.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-zinc-500 text-sm">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? "bg-emerald-400 w-6" : "bg-zinc-700"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-32 px-8 lg:px-20 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Pricing</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Simple, honest pricing.</h2>
            <p className="text-zinc-500 text-lg mt-4">No hidden fees. No surprise invoices. Start free, scale when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-8 relative flex flex-col ${p.highlight ? "plan-card-highlight" : "card-border"}`}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider" style={{ background: "linear-gradient(135deg,#34d399,#22d3ee)", color: "#050505" }}>
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-zinc-500 text-sm font-semibold mb-2 uppercase tracking-wider">{p.name}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">{p.price}</span>
                    <span className="text-zinc-500 mb-2">{p.sub}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-zinc-400 text-sm">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${p.highlight ? "bg-emerald-400/20 text-emerald-400" : "bg-white/5 text-zinc-500"}`} style={{ fontSize: 9 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3.5 rounded-2xl font-semibold transition-all hover:opacity-90 ${p.highlight ? "text-black" : "border border-white/10 text-white hover:bg-white/5"}`} style={p.highlight ? { background: "linear-gradient(135deg,#34d399,#22d3ee)" } : {}}>
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ── */}
      <section className="py-40 px-8 lg:px-20 border-b border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(52,211,153,0.04),transparent)]" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Enterprise</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
              DESIGNED FOR
              <br />
              <span style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.4)", color: "transparent" }}>FINANCE</span>
              <br />
              <span className="accent-text">& WEB3</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Embed fully functional paper-trading environments directly into your fintech product. We handle the infrastructure; you own the experience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "⬡", title: "White-label SDK", desc: "Ship under your brand with our React + Tailwind components" },
              { icon: "◈", title: "Dedicated SLA", desc: "99.99% uptime guarantee with 24/7 enterprise support" },
              { icon: "◉", title: "SSO & RBAC", desc: "Enterprise auth with granular role-based access controls" },
              { icon: "⬟", title: "FIX Protocol", desc: "Native FIX 4.2/4.4/5.0 connectivity for institutional flows" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-border rounded-2xl p-5"
              >
                <span className="text-2xl text-emerald-300/50 mb-3 block">{item.icon}</span>
                <h4 className="font-bold mb-1.5 text-sm">{item.title}</h4>
                <p className="text-zinc-600 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCROLL STORY ── */}
      <section className="border-b border-white/[0.05]">
        {["Practice", "Analyze", "Improve", "Deploy"].map((word) => (
          <div key={word} className="min-h-screen flex items-center justify-center border-t border-white/[0.04] overflow-hidden">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 120 }}
              viewport={{ once: false, margin: "-20%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <h2 className="text-[clamp(4rem,14vw,12rem)] font-black uppercase tracking-tighter grad-text">{word}</h2>
            </motion.div>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="min-h-screen flex flex-col justify-center items-center px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(52,211,153,0.07),transparent)]" />
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-emerald-400/20" style={{ background: "rgba(52,211,153,0.06)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">No credit card required</span>
          </div>
          <h2 className="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter mb-6">
            <span className="grad-text">BUILD.</span>
            <br />
            <span className="grad-text">TRADE.</span>
            <br />
            <span className="accent-text">SCALE.</span>
          </h2>
          <p className="text-zinc-400 max-w-xl text-xl leading-relaxed mb-12">
            Join 100,000+ traders and developers who are building the future of finance on TradEx.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-100 shadow-[0_0_60px_rgba(52,211,153,0.3)]" style={{ background: "linear-gradient(135deg,#34d399,#22d3ee)", color: "#050505" }}>
              Start Building Free
            </button>
            <button className="px-10 py-5 rounded-full font-semibold text-lg border border-white/10 hover:bg-white/[0.04] transition-colors">
              Talk to Sales
            </button>
          </div>
        </motion.div>
      </section>

     
    </div>
  );
}
