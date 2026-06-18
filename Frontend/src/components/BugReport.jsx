import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function BugReport() {
  const [isDark, setIsDark] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

const selector = useSelector(state=>state?.auth?.user);
// console.log(selector)
  
  const [formState, setFormState] = useState({
    userName:selector?.name,
    userEmail:selector?.email,
    title: '',
    category: 'Execution Engine',
    severity: 'Medium',
    description: ''
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSubmit =async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // console.log(formState)
    try {
        const res = await api.post("/user/BugReport",formState)
        console.log(res)
        toast.success("Bug reported")
        setIsSubmitting(false)
    setFormState({userName:selector?.name,  userEmail:selector?.email, title: '', category: 'Execution Engine', severity: 'Medium', description: '' });
      // Trigger success toast here
    } catch (error) {
        console.log("Error at reporting bug")
        console.log(error)
        console.log(res)
    }
  };

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
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-rose-500/30 overflow-hidden">
      <Toaster/>
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- DIAGNOSTIC MATRIX BACKGROUND --- */}
        {/* Removed 'fixed' and mapped background color to transition properly */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFAFA] dark:bg-[#020202] transition-colors duration-500">
          
          {/* Warning / Diagnostic Ambient Gradients */}
          <motion.div 
            animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.05, 1] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.08),transparent_60%)] blur-[120px]" 
          />
          <motion.div 
            animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.1, 1] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-5%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.05),transparent_60%)] blur-[100px]" 
          />

          {/* Diagnostic Scanning Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]">
            {/* Animated Scanline */}
            <motion.div 
              animate={{ top: ['-10%', '110%'] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.8)]" 
            />
          </div>
          
          {/* Fine Grain Tactile Noise */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12">
          
          {/* Action Header (Replaced Top Nav) */}
          <div className="flex justify-end items-center gap-4 mb-8">
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <a onClick={()=>(window.history.back())} className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-[1.02] transition-transform shadow-lg">
              Back to Terminal
            </a>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" /> Engineering Support
                </h2>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                  Report an Anomaly.
                </h1>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* --- LEFT: ISSUE FORM (Spans 8 cols) --- */}
              <motion.div variants={item} className="xl:col-span-8 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
                
                <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
                  <h3 className="font-bold tracking-tight text-lg">Issue Documentation</h3>
                  <p className="text-sm text-zinc-500 mt-1">Please provide as much context as possible. Our telemetry systems will automatically attach your environment variables.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                  
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Brief Description</label>
                    <input 
                      type="text" 
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({...formState, title: e.target.value})}
                      placeholder="e.g., WebSocket disconnects during high volatility" 
                      className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-rose-500/50 transition-colors shadow-sm dark:shadow-inner" 
                    />
                  </div>

                  {/* Grid for Category & Severity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Category</label>
                      <div className="relative">
                        <select 
                          value={formState.category}
                          onChange={(e) => setFormState({...formState, category: e.target.value})}
                          className="w-full appearance-none bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-rose-500/50 transition-colors shadow-sm dark:shadow-inner cursor-pointer"
                        >
                          <option>Execution Engine</option>
                          <option>Market Data Stream</option>
                          <option>User Interface</option>
                          <option>Account & Billing</option>
                          <option>API & Webhooks</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Impact Severity</label>
                      <div className="relative">
                        <select 
                          value={formState.severity}
                          onChange={(e) => setFormState({...formState, severity: e.target.value})}
                          className={`w-full appearance-none bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none transition-colors shadow-sm dark:shadow-inner cursor-pointer ${
                            formState.severity === 'Critical' ? 'text-rose-600 dark:text-rose-500 focus:border-rose-500/50' : 
                            formState.severity === 'High' ? 'text-orange-600 dark:text-orange-500 focus:border-orange-500/50' : 
                            'text-emerald-600 dark:text-emerald-500 focus:border-emerald-500/50'
                          }`}
                        >
                          <option value="Low">Low (Minor UI/UX)</option>
                          <option value="Medium">Medium (Functionality Impaired)</option>
                          <option value="High">High (Core Feature Broken)</option>
                          <option value="Critical">Critical (System Crash / Data Loss)</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Steps to Reproduce */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Steps to Reproduce</label>
                      <button type="button" className="text-xs font-bold text-cyan-600 dark:text-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400">Use Template</button>
                    </div>
                    <textarea 
                      required
                      value={formState.description}
                      onChange={(e) => setFormState({...formState, description: e.target.value})}
                      placeholder="1. Navigate to the execution terminal...&#10;2. Click on 'Market Buy'...&#10;3. Observe the resulting error code..." 
                      className="w-full h-40 bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-rose-500/50 transition-colors shadow-sm dark:shadow-inner resize-none leading-relaxed" 
                    />
                  </div>

                  {/* File Upload Zone */}
                  {/* <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Attachments (Optional)</label>
                    <div className="w-full border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <p className="font-bold text-sm mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-zinc-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div> */}

                  {/* Submit Action */}
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-8 py-4 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Transmitting...
                        </>
                      ) : 'Submit Diagnostic Report'}
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* --- RIGHT: TELEMETRY & STATUS (Spans 4 cols) --- */}
              <motion.div variants={item} className="xl:col-span-4 flex flex-col gap-6">
                
                {/* Captured Telemetry Card */}
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-500" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold tracking-tight text-lg">Telemetry Payload</h3>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Auto-Captured
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                    To expedite the debugging process, the following environment variables will be securely attached to your report.
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                      <span className="text-zinc-500">Engine_Ver</span>
                      <span className="font-bold text-black dark:text-white">v2.4.1-stable</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                      <span className="text-zinc-500">Browser</span>
                      <span className="font-bold text-black dark:text-white">Chrome 126.0.0</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                      <span className="text-zinc-500">OS_Env</span>
                      <span className="font-bold text-black dark:text-white">macOS 14.5 (ARM64)</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                      <span className="text-zinc-500">WS_Latency</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">42ms (EU-Central)</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                      <span className="text-zinc-500">Viewport</span>
                      <span className="font-bold text-black dark:text-white">2560 x 1440</span>
                    </div>
                  </div>
                </div>

                {/* Service Status Card */}
                <div className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[32px] p-8 shadow-xl flex-1 flex flex-col">
                  <h3 className="font-bold tracking-tight text-lg mb-6">Live Service Status</h3>
                  
                  <div className="space-y-4 flex-1">
                    {[
                      { name: 'Core Order Engine', status: 'Operational', color: 'bg-emerald-500' },
                      { name: 'Market Data Feeds', status: 'Operational', color: 'bg-emerald-500' },
                      { name: 'Historical Analytics', status: 'Degraded', color: 'bg-amber-500' },
                    ].map((service, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#050505]">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{service.status}</span>
                          <span className={`w-2 h-2 rounded-full ${service.color} ${service.status !== 'Operational' && 'animate-pulse'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    View Full Status Page
                  </button>
                </div>

              </motion.div>
            </div>
            
          </motion.div>
        </main>
      </div>
    </div>
  );
}