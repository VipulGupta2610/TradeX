import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTradingAccount } from '../hooks/useTradingAccount';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

// --- Mock AI Data ---
const initialMessages = [
  { id: 1, sender: 'ai', text: 'Good morning. I noticed your session yesterday ended with two consecutive losses on TSLA. Your risk per trade increased by 40% on the final setup.', time: '09:00' },
  { id: 2, sender: 'user', text: 'Yeah, I tilted a bit after missing the morning breakout.', time: '09:02' },
  { id: 3, sender: 'ai', text: 'Acknowledged. Revenge trading reduces your edge. Based on your historical data, your win rate drops from 68% to 22% immediately following a missed setup. I recommend enabling the "15-Minute Cooldown" protocol for today.', time: '09:03', hasAction: true },
];

const cognitiveMetrics = [
  { label: 'Discipline Score', value: 85, target: 90, color: 'bg-emerald-500' },
  { label: 'Risk Adherence', value: 92, target: 95, color: 'bg-blue-500' },
  { label: 'Emotional Stability', value: 64, target: 80, color: 'bg-rose-500' },
];

export default function AICoach() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('tradex_ai_messages');
    return stored ? JSON.parse(stored) : initialMessages;
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Track how many messages the user has sent in the current session
  const [sessionQueryCount, setSessionQueryCount] = useState(0); 

  const user = useSelector(state => state.auth.user);
  const { positions, orders, metrics } = useTradingAccount(user?._id);

  useEffect(() => {
    localStorage.setItem('tradex_ai_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue, time: 'Just now' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Check if this is a follow-up question
    const isFollowUp = sessionQueryCount >= 1;
    setSessionQueryCount((prev) => prev + 1);

    setTimeout(() => {
      setIsTyping(false);
      
      // Determine the AI's response based on the query count
      const aiResponseText = isFollowUp 
        ? "This feature is currently under construction. 🚧" 
        : `Your live paper account has ${positions.length} open position${positions.length === 1 ? '' : 's'}, ${orders.filter(order => order.status === 'OPEN').length} pending order${orders.filter(order => order.status === 'OPEN').length === 1 ? '' : 's'}, and ${metrics.unrealizedPnl >= 0 ? 'an unrealized gain' : 'an unrealized loss'} of ₹${Math.abs(metrics.unrealizedPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}. Keep position size aligned with your available cash of ₹${metrics.totalEquity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`;

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        time: 'Just now'
      }]);
    }, 800);
  };

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- NEURAL CORE BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFAFA] dark:bg-[#020202] transition-colors duration-500">
          
          {/* Pulsing Central AI Core */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle,rgba(34,211,238,0.15),transparent_60%)] blur-[120px]" 
          />
          
          {/* Secondary processing nodes */}
          <motion.div 
            animate={{ x: [30, -30, 30], y: [20, -20, 20], opacity: [0.1, 0.2, 0.1] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_60%)] blur-[100px]" 
          />

          {/* Scanlines / Server Rack Vibe */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] mix-blend-overlay opacity-30" />
          
          {/* Fine Grain Tactile Noise */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-4">
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" /> Agent 04 Online
                </h2>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Trading Mentor.
                </h1>
              </motion.div>

              {/* AI Status Bento */}
              <motion.div variants={item} className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/[0.05] backdrop-blur-md">
                <div className="px-6 py-3 flex items-center gap-4 border-r border-black/5 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model Engine</p>
                    <p className="font-mono font-bold text-sm text-black dark:text-white">TRADEX-LLM-v2</p>
                  </div>
                </div>
                <div className="px-6 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Analysis Feed</p>
                    <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-500">Live Sync</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[700px]">
              
              {/* --- LEFT: CHAT INTERFACE (Spans 8 cols) --- */}
              <motion.div variants={item} className="xl:col-span-8 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Chat Header */}
                <div className="px-8 py-6 border-b border-black/5 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 p-[1px]">
                        <div className="w-full h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0A0A0A]" />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight">Strategy Analyst</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Scanning portfolio data...</p>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide z-10 flex flex-col">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-5 rounded-3xl backdrop-blur-md text-sm md:text-base leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-black/5 dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-black dark:text-white rounded-tr-sm' 
                              : 'bg-white/50 dark:bg-[#111] border border-cyan-500/20 text-zinc-800 dark:text-zinc-200 rounded-tl-sm shadow-[0_0_20px_rgba(34,211,238,0.05)]'
                          }`}>
                            {msg.text}
                            
                            {/* Specific Action Buttons for AI */}
                            {msg.hasAction && (
                              <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex gap-3">
                                <button className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs hover:bg-cyan-500/30 transition-colors border border-cyan-500/30">
                                  Enable Cooldown
                                </button>
                                <button className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10">
                                  View Analysis
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono mt-2 px-2">{msg.time}</span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* AI Typing Indicator */}
                    {isTyping && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-start"
                      >
                        <div className="p-5 rounded-3xl bg-white/50 dark:bg-[#111] border border-cyan-500/20 rounded-tl-sm flex gap-1.5 items-center shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan-500" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-black/5 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] z-10">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about your recent performance, or request a strategy review..." 
                      className="w-full bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl pl-6 pr-16 py-5 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-colors shadow-sm dark:shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="absolute right-3 w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white dark:text-black hover:bg-cyan-600 dark:hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* --- RIGHT: REAL-TIME ANALYTICS (Spans 4 cols) --- */}
              <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-6">
                
                {/* Cognitive Status Card */}
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-8 shadow-xl flex-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-500" />
                  
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold tracking-tight">Real-Time Cognitive Status</h3>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-500 text-[10px] font-bold border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Elevated Risk
                    </span>
                  </div>

                  <div className="space-y-8">
                    {cognitiveMetrics.map((metric, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-end mb-3">
                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{metric.label}</span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black font-mono ${metric.value < metric.target ? 'text-black dark:text-white' : 'text-emerald-600 dark:text-emerald-500'}`}>{metric.value}</span>
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-600">/ 100</span>
                          </div>
                        </div>
                        {/* Dual Progress Bar (Current vs Target) */}
                        <div className="relative w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          {/* Target Marker */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-black/20 dark:bg-white/20 z-10" style={{ left: `${metric.target}%` }} />
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${metric.value}%` }} 
                            transition={{ duration: 1.5, delay: 0.2 + (idx * 0.1), ease: "easeOut" }} 
                            className={`h-full rounded-full ${metric.color} shadow-[0_0_10px_currentColor] opacity-80`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Insights Card */}
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-8 shadow-xl">
                  <h3 className="font-bold tracking-tight mb-6">AI Prescriptions</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-xs font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Reduce Position Sizing</p>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-9">Volatility on Crypto assets is 3x standard deviation. Scale down by 50%.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-xs font-bold text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Setup Alignment High</p>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-9">Market conditions heavily favor your "Breakout Pullback" edge today.</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}