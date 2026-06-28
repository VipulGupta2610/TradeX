import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [isDark, setIsDark] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Enforcing dark mode for the premium security aesthetic
    document.documentElement.classList.add('dark');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Mock API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  // Framer Motion Variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-blue-500/30 relative flex items-center justify-center overflow-hidden">
      
      {/* --- SECURE RELAY BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed bg-[#020202]">
        
        {/* Sweeping Cryptographic Glow */}
        <motion.div 
          animate={{ x: ['-50%', '50%', '-50%'], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] max-w-[1000px] max-h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)] blur-[120px]" 
        />
        
        {/* Deep Security Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        
        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* --- TOP BRANDING --- */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          TX
        </div>
        <span className="font-bold tracking-[0.2em] text-sm text-white">TRADEX</span>
      </div>

      {/* --- RECOVERY CARD --- */}
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: REQUEST FORM */}
          {!isSubmitted && (
            <motion.div 
              key="form"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight mb-2">Reset Credentials</h1>
                  <p className="text-sm text-zinc-500">Enter your email address and we'll send you a secure link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Account Email</label>
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
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !email}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      'Send Recovery Link'
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <a href="/Login" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Return to Login
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: SUCCESS / EMAIL SENT */}
          {isSubmitted && (
            <motion.div 
              key="success"
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-blue-500/20 rounded-[32px] shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden text-center"
            >
              <div className="p-8 md:p-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center mb-6"
                >
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </motion.div>
                
                <h2 className="text-2xl font-black tracking-tight text-white mb-3">Check Your Inbox</h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  We've sent a secure recovery link to <span className="font-bold text-white">{email}</span>. Please check your spam folder if you don't see it within 5 minutes.
                </p>
                
                <a 
                  href="/Login"
                  className="w-full inline-flex items-center justify-center py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
                >
                  Return to Login
                </a>

                <div className="mt-8 text-center">
                  <p className="text-xs font-medium text-zinc-500">
                    Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="font-bold text-white hover:text-blue-400 transition-colors">Click to resend</button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM SUPPORT LINK --- */}
      <div className="absolute bottom-8 text-center w-full z-50">
        <a href="/Support" className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest">
          Contact Engineering Support
        </a>
      </div>

    </div>
  );
}