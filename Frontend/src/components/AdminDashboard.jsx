import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/axios';

// --- Mock Admin Data ---
const adminKpis = [
  { label: 'Total Users', value: '124,592', trend: '+1,204 this week', color: 'text-white' },
  { label: 'Active MRR', value: '$842.5K', trend: '+12.4% MoM', color: 'text-emerald-500' },
  { label: 'API Load', value: '42K req/s', trend: 'Stable', color: 'text-cyan-400' },
  { label: 'System Errors', value: '0.04%', trend: '-0.01% today', color: 'text-rose-500' },
];

const auditLogs = [
  { id: 'LOG-9921', user: 'alex@capital.com', action: 'Upgraded to Enterprise', ip: '192.168.1.1', time: '2m ago', status: 'Success' },
  { id: 'LOG-9920', user: 'system_core', action: 'Engine v2.4 Deployment', ip: 'internal', time: '14m ago', status: 'Success' },
  { id: 'LOG-9919', user: 'unknown', action: 'Failed Admin Login', ip: '45.22.19.11', time: '1h ago', status: 'Warning' },
  { id: 'LOG-9918', user: 'sarah@propfirm.io', action: 'Generated API Key', ip: '104.22.1.9', time: '3h ago', status: 'Success' },
  { id: 'LOG-9917', user: 'risk_engine', action: 'Liquidated Account #4421', ip: 'internal', time: '5h ago', status: 'Critical' },
];

export default function AdminDashboard() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(async () => {
    const res = await api.get("/admin/AdminDashboard")
    console.log(res)
  }, [])


  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans overflow-hidden selection:bg-rose-500/30">

      {/* --- ROOT ACCESS BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed bg-[#020202]">
        {/* Elevated Privilege Gradients (Crimson & Indigo) */}
        <motion.div
          animate={{ x: [-20, 20, -20], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.08),transparent_60%)] blur-[100px]"
        />
        <motion.div
          animate={{ x: [20, -20, 20], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.08),transparent_60%)] blur-[120px]"
        />

        {/* Fine Grain Tactile Noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* Deep Data Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]" />
      </div>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/[0.05] bg-[#050505]/80 backdrop-blur-2xl flex flex-col justify-between z-20 relative hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/[0.05]">
            <div className="w-8 h-8 bg-rose-500 text-white flex items-center justify-center rounded-lg font-black text-xs mr-3 shadow-[0_0_15px_rgba(225,29,72,0.4)]">
              TX
            </div>
            <span className="font-bold tracking-[0.2em] text-sm text-white">ADMIN</span>
          </div>

          <div className="p-4 space-y-1 mt-4">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Platform</p>
            {['Overview', 'Users', 'Subscriptions', 'Financials'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}

            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-2">Infrastructure</p>
            {['System Health', 'API Logs', 'Risk Engine'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-zinc-500 hover:text-white hover:bg-white/5`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl cursor-pointer hover:bg-rose-500/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              ROOT
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-rose-500">Superadmin</p>
              <p className="text-[10px] text-rose-400/60 font-mono truncate">ID: 0000-1</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">

        {/* Top Header */}
        <header className="h-20 border-b border-white/[0.05] flex items-center justify-between px-8 bg-[#050505]/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">{activeTab}</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Nominal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search users, TXIDs..." className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-rose-500/50 transition-colors" />
            </div>
            <button className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative">
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-[1600px] mx-auto space-y-8">

            {/* KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {adminKpis.map((kpi, idx) => (
                <motion.div key={idx} variants={item} className="bg-white/5 backdrop-blur-3xl border border-white/[0.08] rounded-[24px] p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{kpi.label}</p>
                  <h3 className={`text-4xl font-black font-mono tracking-tight ${kpi.color}`}>{kpi.value}</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-3">{kpi.trend}</p>
                </motion.div>
              ))}
            </div>

            {/* CHARTS & HEALTH ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

              {/* Revenue Chart */}
              <motion.div variants={item} className="xl:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-8 shadow-xl flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 z-10">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Revenue Growth</h3>
                    <p className="text-sm text-zinc-500">Monthly Recurring Revenue (MRR) - Trailing 6 Months</p>
                  </div>
                  <button className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">Export Report</button>
                </div>

                {/* SVG Bar Chart Simulation */}
                <div className="flex-1 w-full flex items-end justify-between gap-4 mt-8 z-10 h-[250px]">
                  {[40, 55, 45, 70, 85, 100].map((height, i) => (
                    <div key={i} className="w-full flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-400 rounded-t-lg relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs font-mono border border-white/10">
                          ${(height * 8.4).toFixed(1)}K
                        </div>
                      </motion.div>
                      <span className="text-xs text-zinc-500 font-mono tracking-widest">M{i + 1}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* System Health / Server Nodes */}
              <motion.div variants={item} className="xl:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-8 shadow-xl flex flex-col">
                <h3 className="text-lg font-bold tracking-tight mb-8">Node Infrastructure</h3>
                <div className="space-y-6 flex-1">
                  {[
                    { name: 'US-East (Trade Engine)', load: 45, status: 'Healthy', color: 'bg-emerald-500' },
                    { name: 'EU-Central (WebSockets)', load: 82, status: 'High Load', color: 'bg-amber-500' },
                    { name: 'AP-South (Database)', load: 32, status: 'Healthy', color: 'bg-emerald-500' },
                  ].map((node, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-zinc-300">{node.name}</span>
                        <span className="text-xs font-mono text-zinc-500">{node.load}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${node.load}%` }} transition={{ duration: 1, delay: 0.2 }} className={`h-full ${node.color} rounded-full`} />
                      </div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500 text-right">{node.status}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 mt-6 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors">Manage Fleet</button>
              </motion.div>
            </div>

            {/* AUDIT LOG TABLE */}
            <motion.div variants={item} className="bg-white/5 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] shadow-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/[0.05] flex justify-between items-center">
                <h3 className="text-lg font-bold tracking-tight">Global Audit Log</h3>
                <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">View All Logs →</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.05] bg-black/20">
                      <th className="py-4 pl-8 font-medium">Log ID / Time</th>
                      <th className="py-4 font-medium">User / System</th>
                      <th className="py-4 font-medium">Action Event</th>
                      <th className="py-4 font-medium font-mono text-right">IP Origin</th>
                      <th className="py-4 pr-8 font-medium text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence>
                      {auditLogs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <td className="py-5 pl-8">
                            <p className="font-mono font-bold text-xs text-zinc-300">{log.id}</p>
                            <p className="text-[10px] text-zinc-500">{log.time}</p>
                          </td>
                          <td className="py-5 font-medium text-zinc-300">
                            {log.user}
                          </td>
                          <td className="py-5 font-bold text-white">
                            {log.action}
                          </td>
                          <td className="py-5 text-right font-mono text-xs text-zinc-500">
                            {log.ip}
                          </td>
                          <td className="py-5 pr-8 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${log.status === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                log.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}>
                              {log.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}