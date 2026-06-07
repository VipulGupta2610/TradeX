import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('Profile');
  
  // Using user's profile data implicitly integrated
  const [profileData, setProfileData] = useState({
    name: 'Vipul Gupta',
    email: 'vipulgupta92998@gmail.com',
    workspace: 'Personal Sandbox'
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-rose-500/30 relative overflow-hidden">
      
      {/* BACKGROUND: Identity Matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(244,63,94,0.05),transparent_60%)] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-24 flex flex-col md:flex-row gap-12">
        
        {/* Left Nav */}
        <div className="w-full md:w-64 shrink-0">
          <h1 className="text-3xl font-black tracking-tighter mb-8">Settings</h1>
          <nav className="flex flex-col gap-2">
            {['Profile', 'Security', 'Billing & Plans', 'Notifications', 'Danger Zone'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <motion.div variants={container} initial="hidden" animate="show" className="flex-1 bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[40px] p-8 md:p-12 shadow-2xl">
          
          {activeTab === 'Profile' && (
            <motion.div variants={item} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Profile Information</h2>
                <p className="text-sm text-zinc-500">Update your account details and public persona.</p>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 p-[2px]">
                  <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center text-3xl font-black">
                    {profileData.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <button className="px-5 py-2.5 rounded-xl bg-white/10 text-sm font-bold hover:bg-white/20 transition-colors mb-2 block">Change Avatar</button>
                  <p className="text-xs text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-rose-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Workspace</label>
                  <input type="text" value={profileData.workspace} onChange={(e) => setProfileData({...profileData, workspace: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-rose-500/50 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input type="email" value={profileData.email} disabled className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 text-zinc-500 cursor-not-allowed" />
                  <p className="text-xs text-zinc-500 mt-1">To change your email, contact support.</p>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button className="px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'Danger Zone' && (
            <motion.div variants={item} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-rose-500">Danger Zone</h2>
                <p className="text-sm text-zinc-500">Irreversible, destructive actions regarding your account.</p>
              </div>
              <div className="p-6 border border-rose-500/20 rounded-2xl bg-rose-500/5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white mb-1">Delete Account</h4>
                  <p className="text-xs text-rose-200/60">Permanently delete your data and API keys.</p>
                </div>
                <button className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors">Delete Account</button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}