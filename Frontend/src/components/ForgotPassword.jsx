import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsProcessing(true);
    
    // Mock sending OTP
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to OTP page and pass the email in state
      navigate('/verify-otp', { state: { email } });
    }, 1500);
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 relative flex items-center justify-center overflow-hidden">
      {/* CRYPTOGRAPHIC VAULT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed bg-[#020202]">
        <motion.div 
          animate={{ x: ['-50%', '50%', '-50%'], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[30vw] max-w-[1000px] max-h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_60%)] blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.1, 1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(59,130,246,0.1),transparent_60%)] blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* TOP BRANDING */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-8 h-8 bg-cyan-500 text-black flex items-center justify-center rounded-lg font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          TX
        </div>
        <span className="font-bold tracking-[0.2em] text-sm text-white">SECURE RECOVERY</span>
      </div>

      {/* RECOVERY CARD */}
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <AnimatePresence mode="wait">
          <motion.div key="step1" variants={cardVariants} initial="hidden" animate="show" exit="exit" className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Reset Password</h1>
                <p className="text-sm text-zinc-500">Enter your account email to receive a secure One-Time Password (OTP).</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing || !email}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Send OTP'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <a href="/Login" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">Return to Login</a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}