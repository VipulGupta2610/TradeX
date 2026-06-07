import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { api } from '../api/axios';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { loginuser } from '../redux/authSlice';

export default function Login() {

  const { handleSubmit, register, formState: { isSubmitting } } = useForm()
const dispatch = useDispatch()
const navigate = useNavigate()
  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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
        const res = await api.post("/user/login", info);
        console.log(res);

        toast.success("Signup successfully");

        // Uncomment these when ready:
        dispatch(loginuser(res.data.info));
        navigate(`/Dashboard/${res.data.info._id}`);

      } catch (error) {
        console.error("Authentication Error:", error);
        toast.error("Failed to authenticate with backend.");
      }
    },
    onError: () => {
      toast.error("Google Login Failed");
    }
  });
  const onsubmit = async (data) => {
    const info = {
      email: data.email,
      passowrd: data.passowrd
    }
    try {
      const res = await api.post("/user/login", info)
      console.log(res)
      toast.success("Signup successfull")
      dispatch(loginuser(res.data.info));
      navigate(`/Dashboard/${res.data.info._id}`);
    } catch (error) {
      console.log("Error at onsubmit ")
      console.log(error)
      toast.error("Internal Server Error")
    }
  }

  return (
    <div className="themeable-page min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
<Toaster/>
      {/* LEFT PANEL: Authentication Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">

        {/* Top Logo */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <h1 className="font-bold tracking-widest text-xl">TRADEX</h1>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
              Welcome back.
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-10">
              Log in to access your terminal and infrastructure tools.
            </p>
          </motion.div>

                    {/* OAuth Providers */}
            <motion.div variants={itemVariants} className="space-y-4 mb-8">
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
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-zinc-600 text-xs font-medium uppercase tracking-wider">or sign in with email</span>
              <div className="h-px bg-white/10 flex-1" />
            </motion.div>

            {/* Email/Password Form */}
            <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleSubmit(onsubmit)}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400 pl-1">Email Address</label>
                <input
                  type="email"
                  placeholder="developer@company.com"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 focus:bg-white/5 transition-all"
                  {...register("email", { required: true })}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1 pr-2">
                  <label className="text-sm font-medium text-zinc-400">Password</label>
                  <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot password?</a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 focus:bg-white/5 transition-all"
                  {...register("password", { required: true })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold text-sm px-6 py-4 rounded-xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {isSubmitting ? "Logging in your account" : "Login"}
              </button>
            </motion.form>
     

          <motion.div variants={itemVariants} className="mt-10 text-center text-sm text-zinc-500">
            Don't have an account?<Link to="/Signup"> <button className="text-white font-medium hover:underline">SignUp</button></Link>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT PANEL: Visual/Marketing */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center bg-[#020202] border-l border-white/5 overflow-hidden">

        {/* Subtle Background Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Glassmorphic Metric Box */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

            <div className="relative z-10">
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>

              <h3 className="text-3xl font-black leading-tight mb-4 tracking-tight">
                "The most robust paper trading infrastructure we've ever integrated."
              </h3>

              <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-white/20" />
                <div>
                  <p className="text-sm font-bold text-white">Alex Chen</p>
                  <p className="text-xs text-zinc-500">CTO, CapitalFlow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI element */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute -bottom-12 -right-12 bg-[#111] border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-full border border-emerald-500/30 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-1">System Status</p>
              <p className="text-sm font-bold text-emerald-400">All Engines Operational</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
