import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Subscription() {
  const [billing, setBilling] = useState('Annually');
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-amber-500/30 relative overflow-hidden">
      
      {/* BACKGROUND: Prestige Core */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vw] max-w-[1000px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_60%)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(16,185,129,0.05),transparent_60%)] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_10%,transparent_100%)]" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-24 text-center">
        <motion.div variants={container} initial="hidden" animate="show">
          
          <motion.h2 variants={item} className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> Unlock Infrastructure
          </motion.h2>
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Scale without limits.</motion.h1>
          <motion.p variants={item} className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">Institutional-grade execution, dedicated WebSockets, and massive rate limits for serious developers and prop firms.</motion.p>

          {/* Billing Toggle */}
          <motion.div variants={item} className="inline-flex bg-white/5 border border-white/10 rounded-full p-1.5 mb-16 relative">
            <div className="absolute -top-3 -right-6 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-black uppercase rounded-full tracking-widest rotate-12">Save 20%</div>
            {['Monthly', 'Annually'].map(type => (
              <button key={type} onClick={() => setBilling(type)} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${billing === type ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
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
              <motion.div key={i} variants={item} className={`relative bg-[#0A0A0A]/80 backdrop-blur-3xl border rounded-[40px] p-10 overflow-hidden group transition-all duration-500 ${plan.popular ? 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] -translate-y-4' : 'border-white/10 hover:border-white/20'}`}>
                {plan.popular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />}
                
                <h3 className="text-2xl font-black mb-2">{plan.tier}</h3>
                <p className="text-sm text-zinc-500 h-10">{plan.desc}</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black font-mono">{plan.price}</span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && <span className="text-zinc-500 font-medium">/mo</span>}
                </div>
                <button className={`w-full py-4 rounded-xl font-bold text-sm mb-8 transition-colors ${plan.popular ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/10 hover:bg-white/20'}`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Includes:</p>
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium">
                      <svg className={`w-4 h-4 ${plan.popular ? 'text-amber-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}