import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from "react-hook-form"
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google"
import toast, { Toaster } from "react-hot-toast"
import { api } from '../api/axios';
import {useNavigate} from "react-router-dom"
import {useDispatch} from "react-redux"
import { loginuser } from '../redux/authSlice';
import axios from 'axios';

export default function SignupUltra() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', name: '',isPass:true, password: '' });
  const [focusedInput, setFocusedInput] = useState(null);

  const { handleSubmit, formState: { isSubmitting } } = useForm();

const navigate = useNavigate();
const dispatch = useDispatch()

  // Staggered Text Animation Variants
  const textContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const textItem = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.4 } }
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Fetch the user's profile using the access token
        const { data: user } = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        console.log(user);

        // 2. Prepare the payload for your backend
        const info = {
          name: user.name,
          email: user.email,
          isPass: false
        };

        // 3. Send to your database via your existing API instance
        const res = await api.post("/user/signup", info);
        console.log(res);

        toast.success("Signup successfully");

        // Uncomment these when ready:
        dispatch(loginuser(res.data.sending_user));
        navigate(`/Dashboard/${res.data.sending_user._id}`);

      } catch (error) {
        console.error("Authentication Error:", error);
        toast.error("Failed to authenticate with backend.");
      }
    },
    onError: () => {
      toast.error("Google Login Failed");
    }
  });
  const onsubmit = async () => {
    console.log(formData)
    try {
      const res = await api.post("/user/signup" , formData)
      console.log(res)
      toast.success("Signup successfull")
            dispatch(loginuser(res.data.sending_user));
        navigate(`/Dashboard/${res.data.sending_user._id}`);
    } catch (error) {
      console.log("Error at onsubmit ")
      console.log(error)
      toast.error("Internal Server Error")
    }
  }

  return (
    <div className="themeable-page min-h-screen bg-[#000000] text-white flex overflow-hidden font-sans selection:bg-emerald-500/30">
      <Toaster />
      {/* ================= LEFT PANEL: BRAND & VISUAL ================= */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 border-r border-white/[0.05] overflow-hidden">

        {/* CSS Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/40 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-900/30 blur-[130px]" />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-zinc-800/50 blur-[100px]" />
        </div>

        {/* Tactile Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-black text-xs">
            TX
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-300">TRADEX.IO</span>
        </div>

        {/* Middle: Massive Typography */}
        <div className="relative z-10 my-auto pt-20">
          <motion.div variants={textContainer} initial="hidden" animate="show" className="flex flex-col">
            {["INSTITUTIONAL", "GRADE", "EXECUTION."].map((word, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h1
                  variants={textItem}
                  className={`text-[5rem] xl:text-[6.5rem] font-black leading-[0.85] tracking-tighter ${i === 1 ? 'text-transparent' : 'text-white'
                    }`}
                  style={i === 1 ? { WebkitTextStroke: '1px rgba(255,255,255,0.8)' } : {}}
                >
                  {word}
                </motion.h1>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
            className="mt-12 text-zinc-400 text-lg max-w-md font-medium leading-relaxed border-l border-emerald-500 pl-6"
          >
            Deploy high-frequency paper trading infrastructure into your stack in minutes.
          </motion.p>
        </div>

        {/* Bottom: Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="relative z-10 flex items-center gap-6 pb-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 z-[${5 - i}]`}>
                0{i}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-zinc-500">
            Joined by <span className="text-white">10,000+</span> developers.
          </p>
        </motion.div>
      </div>

      {/* ================= RIGHT PANEL: INTERACTIVE FORM ================= */}
      <div className="w-full lg:w-[55%] flex flex-col relative bg-[#050505]">

        {/* Top Nav: Sign In Link */}
        <div className="absolute top-0 w-full p-8 flex justify-end z-20">
          <p className="text-sm font-medium text-zinc-500">
            Already have an account? <a href="/login" className="text-white hover:text-emerald-400 transition-colors ml-2">Sign in</a>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 sm:px-16 md:px-24">
          <div className="w-full max-w-[420px]">

            {/* Minimalist Progress Indicators */}
            <div className="flex gap-2 mb-12">
              {[1, 2].map((i) => (
                <div key={i} className="h-1 flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: step >= i ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="h-full bg-white"
                  />
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onsubmit)}>
              <AnimatePresence mode="wait">
                {/* STEP 1: Basic Info & OAuth */}
                {step === 1 && (
                  <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Create your workspace</h2>
                    <p className="text-zinc-500 text-sm mb-10">Use your work email to get started.</p>

                    {/* OAuth Buttons - Linear Style */}
                    <div className="space-y-3 mb-8">
                      <button
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg bg-[#0A0A0A] border border-white/[0.08] hover:bg-white/[0.02] hover:border-white/[0.15] transition-all text-sm font-medium text-zinc-300"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                        </svg>
                        Continue with Google
                      </button>

                      {/* <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg bg-[#0A0A0A] border border-white/[0.08] hover:bg-white/[0.02] hover:border-white/[0.15] transition-all text-sm font-medium text-zinc-300">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                      Continue with GitHub
                    </button> */}
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px bg-white/[0.05] flex-1" />
                      <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Or</span>
                      <div className="h-px bg-white/[0.05] flex-1" />
                    </div>

                    {/* High-End Brutalist Input */}
                    <div className="space-y-5">

                      <div className="relative">
                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedInput === 'email' || formData.email ? 'text-[10px] top-2 text-emerald-400' : 'text-sm top-4 text-zinc-500'}`}>
                          Work Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                        />
                      </div>


                    </div>

                    <motion.button
                      type='button'
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      disabled={!formData.email}
                      className="w-full bg-white text-black font-bold text-sm py-4 rounded-lg mt-6 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                )}

                {/* STEP 2: Details */}
                {step === 2 && (
                  <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Almost there</h2>
                    <p className="text-zinc-500 text-sm mb-10">Secure your account and set up your workspace.</p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedInput === 'name' || formData.name ? 'text-[10px] top-2 text-emerald-400' : 'text-sm top-4 text-zinc-500'}`}>
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocusedInput('name')}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all"
                          />
                        </div>
{/* 
                        <div className="relative">
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedInput === 'workspace' || formData.workspace ? 'text-[10px] top-2 text-emerald-400' : 'text-sm top-4 text-zinc-500'}`}>
                            Number
                          </label>
                          <input
                            type="number"
                            value={formData.workspace}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            onFocus={() => setFocusedInput('number')}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all"
                          />
                        </div> */}
                      </div>

                      <div className="relative">
                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedInput === 'password' || formData.password ? 'text-[10px] top-2 text-emerald-400' : 'text-sm top-4 text-zinc-500'}`}>
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-4 rounded-lg font-medium text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                      type='submit'
                        whileTap={{ scale: 0.98 }}
                        disabled={!formData.name ||  !formData.password}
                        className="flex-1 bg-white text-black font-bold text-sm py-4 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        Initialize Terminal
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
