import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyOTP() {
  const [step, setStep] = useState(2); // Starts at 2: OTP | 3: New Password | 4: Success
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email"; // Fallback if navigated directly

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    document.documentElement.classList.add('dark');
    // If no email is found in state, redirect back to step 1
    if (!location.state?.email) {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.join('').length !== 6) return;
    setIsProcessing(true);
    
    // Mock verifying OTP
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 1500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) return;
    setIsProcessing(true);
    
    // Mock saving password
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
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

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 2: ENTER OTP */}
          {step === 2 && (
            <motion.div key="step2" variants={cardVariants} initial="hidden" animate="show" exit="exit" className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] rounded-[32px] overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight mb-2">Verify Identity</h1>
                  <p className="text-sm text-zinc-400">We've sent a 6-digit verification code to <br/><span className="text-white font-bold">{email}</span></p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 md:w-14 md:h-16 bg-black/50 border border-white/10 rounded-xl text-center text-xl font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 focus:bg-cyan-500/5 transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing || otp.join('').length !== 6}
                    className="w-full py-4 rounded-xl bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {isProcessing ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Verify Code'}
                  </button>
                </form>

                <div className="mt-8 text-center space-y-3">
                  <p className="text-xs font-medium text-zinc-500">
                    Didn't receive it? <button onClick={() => setOtp(['', '', '', '', '', ''])} className="font-bold text-white hover:text-cyan-400 transition-colors">Resend Code</button>
                  </p>
                  <button onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">Use different email</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <motion.div key="step3" variants={cardVariants} initial="hidden" animate="show" exit="exit" className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight mb-2">Secure Account</h1>
                  <p className="text-sm text-zinc-500">Identity verified. Please create a new, strong password for your account.</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Confirm Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing || !passwords.new || passwords.new !== passwords.confirm}
                    className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {isProcessing ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div key="step4" variants={cardVariants} initial="hidden" animate="show" className="bg-emerald-500/5 backdrop-blur-3xl border border-emerald-500/20 rounded-[32px] shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden text-center p-8 md:p-12">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </motion.div>
              
              <h2 className="text-2xl font-black tracking-tight text-white mb-3">Password Updated</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Your cryptographic keys have been rotated successfully. You can now access the terminal.
              </p>
              
              <a 
                href="/Login"
                className="w-full inline-flex items-center justify-center py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                Go to Login
              </a>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}