import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
  const [isDark, setIsDark] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('standard'); // 'standard' | 'scanning' | 'success'

  useEffect(() => {
    // Force dark mode for admin pages for consistency
    document.documentElement.classList.add('dark');
  }, []);

  const handleStandardLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Trigger success state for demo
    setAuthMode('success');
    setTimeout(() => {
      // window.location.href = '/AdminDashboard';
    }, 1500);
  };

  const handleFaceUnlock = () => {
    setAuthMode('scanning');
    
    // Mock sending photo to backend and scanning duration
    setTimeout(() => {
      setAuthMode('success');
      setTimeout(() => {
        // window.location.href = '/AdminDashboard';
      }, 1500);
    }, 3500); // 3.5 seconds of scanning animation
  };

  // Framer Motion Variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-rose-500/30 relative flex items-center justify-center overflow-hidden">
      
      {/* --- SECURE ROOT BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed bg-[#020202]">
        {/* Elevated Privilege Gradients (Crimson & Indigo) */}
        <motion.div 
          animate={{ x: [-20, 20, -20], opacity: [0.15, 0.25, 0.15] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.12),transparent_60%)] blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [20, -20, 20], opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.1),transparent_60%)] blur-[100px]" 
        />
        
        {/* Deep Data Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        
        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP BRANDING --- */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-8 h-8 bg-rose-500 text-white flex items-center justify-center rounded-lg font-black text-xs shadow-[0_0_15px_rgba(225,29,72,0.4)]">
          TX
        </div>
        <span className="font-bold tracking-[0.2em] text-sm text-white">ROOT ACCESS</span>
      </div>

      {/* --- AUTHENTICATION CARD --- */}
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: STANDARD LOGIN */}
          {authMode === 'standard' && (
            <motion.div 
              key="standard"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
                  <p className="text-sm text-zinc-500">Authenticate to access infrastructure.</p>
                </div>

                <form onSubmit={handleStandardLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Authorized Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@tradex.io"
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-rose-500/50 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Security Key</label>
                      <a href="#" className="text-[10px] font-bold text-rose-500 hover:text-rose-400">Forgot?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-rose-500/50 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all mt-4"
                  >
                    Initialize Session
                  </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Face Unlock Trigger Button */}
                <button 
                  onClick={handleFaceUnlock}
                  className="w-full py-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500/20 transition-all flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Biometric Login
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: BIOMETRIC SCANNING */}
          {authMode === 'scanning' && (
            <motion.div 
              key="scanning"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-[#0A0A0A]/90 backdrop-blur-3xl border border-rose-500/30 rounded-[32px] shadow-[0_0_50px_rgba(225,29,72,0.15)] overflow-hidden flex flex-col items-center justify-center p-12 text-center"
            >
              <h2 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-8 animate-pulse">
                Transmitting to Backend...
              </h2>

              {/* Scanning Container */}
              <div className="relative w-48 h-48 mb-8 border border-white/10 rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center">
                
                {/* Placeholder Face Silhouette */}
                <svg className="w-32 h-32 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>

                {/* Reticle Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-500 rounded-br-lg" />

                {/* Scanning Laser Animation */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,1)] z-10"
                />

                {/* Simulated Data Points overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(225,29,72,0.2)_1px,transparent_1px)] bg-[size:10px_10px] mix-blend-overlay" />
              </div>

              {/* Telemetry Readout */}
              <div className="h-12 flex items-center justify-center">
                <motion.p 
                  animate={{ opacity: [1, 0.3, 1] }} 
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-xs font-mono text-zinc-400"
                >
                  <span className="text-rose-500 font-bold">&gt;</span> Verifying Root Identity...<br/>
                  <span className="text-rose-500 font-bold">&gt;</span> Checking Node Permissions...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* STATE 3: SUCCESS */}
          {authMode === 'success' && (
            <motion.div 
              key="success"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="bg-emerald-500/10 backdrop-blur-3xl border border-emerald-500/30 rounded-[32px] shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </motion.div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Access Granted</h2>
              <p className="text-sm font-mono text-emerald-400">Welcome back, Administrator.</p>
              
              <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM FOOTER / SYSTEM IP --- */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-50 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
        <span>IP: 192.168.0.1 (SECURE)</span>
        <span>TRADEX ADMIN ENGINE V2.4</span>
      </div>
    </div>
  );
}