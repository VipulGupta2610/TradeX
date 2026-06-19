import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/tradingApi';
import { loginuser } from '../redux/authSlice';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

export default function Subscription() {
  const [billing, setBilling] = useState('Annually');
  const [message, setMessage] = useState('');
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const selectPlan = async tier => {
    if (!user?._id) {
      navigate('/Login');
      return;
    }
    const plan = tier.toLowerCase() === 'hobby' ? 'free' : tier.toLowerCase();
    if (plan === 'enterprise') {
      window.open('mailto:sales@tradex.io?subject=TradEx Enterprise Plan', '_self');
      return;
    }
    const response = await updateProfile(user._id, { plan });
    dispatch(loginuser(response.data.user));
    setMessage(`${tier} plan activated.`);
  };
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

  return (
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* ── GLOBAL STYLE INJECTION TO HIDE SCROLLBARS ── */}
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
          }
        `}
      </style>
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- BACKGROUND: Prestige Core --- */}
        {/* Removed 'fixed' and added dark mode transitions */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFAFA] dark:bg-[#020202] transition-colors duration-500">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vw] max-w-[1000px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_60%)] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(16,185,129,0.05),transparent_60%)] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_10%,transparent_100%)]" />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 text-center">
          
          {/* Theme Toggle in Header Area */}
          <div className="flex justify-end mb-8">
            <ThemeToggle />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="pt-8">
            
            <motion.h2 variants={item} className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> Unlock Infrastructure
            </motion.h2>
            <motion.h1 variants={item} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Scale without limits.</motion.h1>
            <motion.p variants={item} className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-12">Institutional-grade execution, dedicated WebSockets, and massive rate limits for serious developers and prop firms.</motion.p>

            {/* Billing Toggle */}
            <motion.div variants={item} className="inline-flex bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1.5 mb-16 relative">
              <div className="absolute -top-3 -right-6 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-black uppercase rounded-full tracking-widest rotate-12">Save 20%</div>
              {['Monthly', 'Annually'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setBilling(type)} 
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${billing === type ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { tier: 'Hobby', price: 'Free', desc: 'Perfect for testing and prototyping.', features: ['10,000 API requests/mo', 'Standard REST API', 'Delayed Market Data', 'Community Support'] },
                { tier: 'Pro', price: billing === 'Annually' ? '$79' : '$99', desc: 'For active traders and scalable apps.', features: ['500,000 API requests/mo', 'Dedicated WebSockets', 'Real-time Market Data', 'Priority Email Support', 'Advanced Charting Hooks'], popular: true },
                { tier: 'Enterprise', price: 'Custom', desc: 'White-labeling and prop firm infrastructure.', features: ['Unlimited API requests', 'Custom Rate Limits', 'White-labeled Webhooks', 'Dedicated Slack Channel', 'SLA Guarantee'] }
              ].map((plan, i) => (
                <motion.div 
                  key={i} 
                  variants={item} 
                  className={`relative bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border rounded-[40px] p-10 overflow-hidden group transition-all duration-500 shadow-xl ${plan.popular ? 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] -translate-y-4' : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'}`}
                >
                  {plan.popular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />}
                  
                  <h3 className="text-2xl font-black mb-2">{plan.tier}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 h-10">{plan.desc}</p>
                  <div className="my-8 flex items-baseline gap-1">
                    <span className="text-5xl font-black font-mono">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Custom' && <span className="text-zinc-500 font-medium">/mo</span>}
                  </div>
                  <button 
                    onClick={() => selectPlan(plan.tier)} 
                    className={`w-full py-4 rounded-xl font-bold text-sm mb-8 transition-colors ${plan.popular ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20'}`}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </button>
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Includes:</p>
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <svg className={`w-4 h-4 ${plan.popular ? 'text-amber-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {message && <p className="mt-8 text-emerald-600 dark:text-emerald-400 font-bold">{message}</p>}
          </motion.div>
        </main>
      </div>
    </div>
  );
}