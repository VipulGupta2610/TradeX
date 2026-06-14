import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

// --- Mock Leaderboard Data ---
const topTraders = [
  { rank: 1, name: 'Alex Chen', handle: '@achen_trades', pnl: '+$452,890', roi: '+412.5%', winRate: '72.4%', tier: 'Grandmaster', avatar: 'AC', isUp: true },
  { rank: 2, name: 'Sarah Jenkins', handle: '@s_jenx', pnl: '+$318,400', roi: '+285.0%', winRate: '68.9%', tier: 'Master', avatar: 'SJ', isUp: true },
  { rank: 3, name: 'Marcus Vance', handle: '@vance_capital', pnl: '+$275,150', roi: '+210.2%', winRate: '64.5%', tier: 'Master', avatar: 'MV', isUp: true },
  { rank: 4, name: 'Elena Rostova', handle: '@elena_r', pnl: '+$198,200', roi: '+175.4%', winRate: '66.2%', tier: 'Diamond', avatar: 'ER', isUp: true },
  { rank: 5, name: 'David Kim', handle: '@dkim_fx', pnl: '+$185,050', roi: '+160.8%', winRate: '61.8%', tier: 'Diamond', avatar: 'DK', isUp: true },
  { rank: 6, name: 'James O\'Connor', handle: '@joc_trading', pnl: '+$162,900', roi: '+142.0%', winRate: '59.5%', tier: 'Platinum', avatar: 'JO', isUp: true },
  { rank: 7, name: 'Aisha Patel', handle: '@aisha_p', pnl: '+$145,300', roi: '+128.5%', winRate: '63.1%', tier: 'Platinum', avatar: 'AP', isUp: false },
  { rank: 8, name: 'Michael Chang', handle: '@m_chang', pnl: '+$132,100', roi: '+115.2%', winRate: '58.4%', tier: 'Platinum', avatar: 'MC', isUp: true },
  { rank: 9, name: 'Sophie Laurent', handle: '@sophie_l', pnl: '+$118,500', roi: '+105.8%', winRate: '60.2%', tier: 'Gold', avatar: 'SL', isUp: false },
  { rank: 10, name: 'Lucas Wright', handle: '@lucas_w', pnl: '+$98,400', roi: '+95.0%', winRate: '57.9%', tier: 'Gold', avatar: 'LW', isUp: true },
];

const currentUser = {
  rank: 1.432,
  name: 'Vipul Gupta',
  pnl: '+$24,530',
  roi: '+20.7%',
  winRate: '68.5%',
  tier: 'Silver',
  distanceToNext: '$5,470 to Gold'
};

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('This Month');

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  // Podium ordering: Rank 2, Rank 1, Rank 3
  const podium = [topTraders[1], topTraders[0], topTraders[2]];
  const restOfTraders = topTraders.slice(3);

  return (
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-amber-500/30 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- ELYSIUM SPOTLIGHT BACKGROUND --- */}
        {/* Removed 'fixed' so it stays inside the flex-1 wrapper */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFAFA] dark:bg-[#020202] transition-colors duration-500">
          
          {/* Central Golden Spotlight (Rank 1 Focus) */}
          <motion.div 
            animate={{ opacity: [0.15, 0.25, 0.15], scaleY: [1, 1.1, 1] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[40vw] h-[120vh] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)] blur-[100px] origin-top" 
          />
          
          {/* Ambient Royal Blue Flanks */}
          <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(37,99,235,0.06),transparent_60%)] blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(37,99,235,0.06),transparent_60%)] blur-[120px]" />

          {/* Hexagonal Lattice Grid */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.923' viewBox='0 0 60 103.923' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15zM30 103.923l25.98-15v-30l-25.98-15-25.98 15v30z' fill='none' stroke='currentColor' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '60px 103.923px' }} />
          
          {/* Fine Grain Tactile Noise */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12">
          
          {/* Theme Toggle in Header Area */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
            
            {/* HEADER & TIMEFRAME */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <motion.div variants={item} className="flex flex-col items-center md:items-start w-full">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Global Rankings
                </h2>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  Leaderboard.
                </h1>
              </motion.div>

              <motion.div variants={item} className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/[0.05] backdrop-blur-md">
                {['This Week', 'This Month', 'All Time'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${timeframe === tf ? 'bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                  >
                    {tf}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* ================= THE PODIUM (Top 3) ================= */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-center items-end gap-6 pt-12 pb-8">
              {podium.map((trader) => {
                const isFirst = trader.rank === 1;
                const isSecond = trader.rank === 2;
                
                const borderGlow = isFirst ? 'border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.15)]' : isSecond ? 'border-zinc-400/50 dark:border-zinc-300/50 shadow-[0_0_30px_rgba(212,212,216,0.1)]' : 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]';
                const rankColor = isFirst ? 'bg-amber-400 text-black' : isSecond ? 'bg-zinc-400 dark:bg-zinc-300 text-black' : 'bg-orange-500 text-black';
                
                return (
                  <div key={trader.rank} className={`relative flex flex-col items-center w-full md:w-[30%] ${isFirst ? 'md:-translate-y-8 z-20' : 'z-10'}`}>
                    
                    {/* Floating Rank Badge */}
                    <div className={`absolute -top-4 w-8 h-8 rounded-full ${rankColor} font-black flex items-center justify-center text-sm shadow-xl z-20`}>
                      {trader.rank}
                    </div>

                    <div className={`w-full bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border ${borderGlow} rounded-[32px] p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`}>
                      
                      {/* Crown/Glow for #1 */}
                      {isFirst && (
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none" />
                      )}

                      <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl mb-4 border-2 ${isFirst ? 'border-amber-400 bg-amber-400/10 text-amber-500 dark:text-amber-400' : isSecond ? 'border-zinc-400 dark:border-zinc-300 bg-zinc-400/10 dark:bg-zinc-300/10 text-zinc-600 dark:text-zinc-300' : 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500'}`}>
                        {trader.avatar}
                      </div>
                      
                      <h3 className="text-xl font-bold tracking-tight">{trader.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono mb-6">{trader.handle}</p>
                      
                      <div className="w-full space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500 uppercase">Profit</span>
                          <span className="font-mono font-black text-emerald-500">{trader.pnl}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500 uppercase">ROI</span>
                          <span className="font-mono font-bold text-black dark:text-white">{trader.roi}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500 uppercase">Win Rate</span>
                          <span className="font-mono font-bold text-black dark:text-white">{trader.winRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* ================= USER'S PERSONAL RANK CARD ================= */}
            <motion.div variants={item} className="bg-gradient-to-r from-blue-600/20 to-emerald-500/20 p-[1px] rounded-[32px] shadow-2xl">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                  <div className="flex flex-col items-center justify-center px-6 border-r border-black/10 dark:border-white/10">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Your Rank</span>
                    <span className="text-3xl font-black font-mono">#{currentUser.rank.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      VG
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{currentUser.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono">{currentUser.distanceToNext}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 z-10 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Your PnL</p>
                    <p className="font-mono font-black text-emerald-500 text-xl">{currentUser.pnl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Win Rate</p>
                    <p className="font-mono font-bold text-xl">{currentUser.winRate}</p>
                  </div>
                  <button className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:block">
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ================= LEADERBOARD TABLE (Ranks 4+) ================= */}
            <motion.div variants={item} className="bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] shadow-xl overflow-hidden flex flex-col">
              <div className="overflow-x-auto p-4 sm:p-8">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-black/5 dark:border-white/[0.05]">
                      <th className="pb-6 pl-4 font-medium w-[10%]">Rank</th>
                      <th className="pb-6 font-medium w-[25%]">Trader</th>
                      <th className="pb-6 font-medium text-center w-[15%]">Tier</th>
                      <th className="pb-6 font-medium text-right w-[15%]">Win Rate</th>
                      <th className="pb-6 font-medium text-right w-[15%]">ROI</th>
                      <th className="pb-6 pr-4 font-medium text-right w-[20%]">Total PnL</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence>
                      {restOfTraders.map((trader, index) => (
                        <motion.tr 
                          key={trader.rank}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="group border-b border-black/5 dark:border-white/[0.03] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          {/* Rank */}
                          <td className="py-5 pl-4 rounded-l-2xl">
                            <span className="font-mono font-bold text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors text-base">#{trader.rank}</span>
                          </td>
                          
                          {/* Trader Profile */}
                          <td className="py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform shadow-inner">
                                {trader.avatar}
                              </div>
                              <div>
                                <p className="font-bold text-base">{trader.name}</p>
                                <p className="text-xs text-zinc-500 font-mono">{trader.handle}</p>
                              </div>
                            </div>
                          </td>

                          {/* Tier Badge */}
                          <td className="py-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                              trader.tier === 'Diamond' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' : 
                              trader.tier === 'Platinum' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'
                            }`}>
                              {trader.tier}
                            </span>
                          </td>

                          {/* Win Rate */}
                          <td className="py-5 text-right font-mono font-medium text-zinc-600 dark:text-zinc-300">
                            {trader.winRate}
                          </td>

                          {/* ROI */}
                          <td className="py-5 text-right font-mono font-bold">
                            {trader.roi}
                          </td>

                          {/* PnL */}
                          <td className="py-5 pr-4 rounded-r-2xl text-right">
                            <div className="flex justify-end items-center gap-2">
                              <span className="font-black font-mono text-lg text-emerald-500">
                                {trader.pnl}
                              </span>
                              {trader.isUp ? (
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              ) : (
                                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 border-t border-black/5 dark:border-white/[0.05] flex justify-center bg-black/[0.01] dark:bg-white/[0.01]">
                <button className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Load More Rankings
                </button>
              </div>
            </motion.div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}