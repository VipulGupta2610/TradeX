import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

// IMPORT SIDEBAR
import Sidebar from '../assets/Sidebar';

export default function LearningCenter() {
  const [activeTrack, setActiveTrack] = useState('All Tracks');
  const [progress, setProgress] = useState(() => Number(localStorage.getItem('tradex_course_progress') || 65));
  
  const resumeCourse = () => {
    const next = Math.min(progress + 5, 100);
    setProgress(next);
    localStorage.setItem('tradex_course_progress', String(next));
  };
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    // FIXED LAYOUT: flex, h-screen, overflow-hidden
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#020202] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <Sidebar />

      {/* --- SCROLLABLE MAIN WRAPPER --- */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* --- BACKGROUND: Synaptic Web --- */}
        {/* Removed 'fixed' and added theme transitions */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFAFA] dark:bg-[#020202] transition-colors duration-500">
          <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.1),transparent_60%)] blur-[100px]" />
          {/* SVG Node Network Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='2' fill='%236366f1'/%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%236366f1'/%3E%3Ccircle cx='150' cy='150' r='1.5' fill='%236366f1'/%3E%3Cpath d='M50 50 L100 100 L150 150' stroke='%236366f1' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3C/svg%3E")` }} />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
          
          {/* Theme Toggle in Header Area */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 dark:border-white/5 pb-8">
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Tradex Academy</h2>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Master the Edge.</h1>
              </motion.div>
              <motion.div variants={item} className="flex max-w-full gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['All Tracks', 'Algorithmic Trading', 'Market Structure', 'API Docs'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTrack(tab)} 
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTrack === tab 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Featured Course */}
              <motion.div variants={item} className="xl:col-span-8 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] overflow-hidden group cursor-pointer shadow-xl">
                <div className="h-72 w-full bg-indigo-500/10 dark:bg-indigo-900/20 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#0A0A0A] to-transparent z-10" />
                  <div className="w-20 h-20 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center z-20 group-hover:scale-110 transition-transform shadow-xl">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="p-8 relative z-20 -mt-20">
                  <span className="px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20 dark:border-indigo-500/30">Masterclass</span>
                  <h3 className="text-3xl font-black mt-4 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Institutional Order Flow & Liquidity</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Learn how to read the tape, spot institutional footprints in the order book, and execute alongside smart money.</p>
                  <div className="mt-6 flex items-center gap-6 text-sm font-bold text-zinc-500">
                    <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 2h 45m</span>
                    <span>12 Modules</span>
                  </div>
                </div>
              </motion.div>

              {/* User Progress */}
              <motion.div variants={item} className="xl:col-span-4 bg-white/60 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border border-black/5 dark:border-white/[0.08] rounded-[40px] p-8 flex flex-col shadow-xl">
                <h3 className="text-xl font-bold mb-6 tracking-tight">Your Path</h3>
                <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-3xl p-6 border border-black/5 dark:border-white/5 flex flex-col">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Module</p>
                  <h4 className="font-bold text-lg mb-6">Building a REST API Scanner</h4>
                  
                  <div className="mt-auto">
                    <div className="w-full h-2 bg-black/10 dark:bg-black/50 rounded-full overflow-hidden mb-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      />
                    </div>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 text-right">{progress}% Completed</p>
                    
                    <button 
                      onClick={resumeCourse} 
                      className="w-full mt-8 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                    >
                      {progress >= 100 ? 'Course Complete' : 'Resume Course'}
                    </button>
                    <Link to="/TradingTerminal" className="block text-center mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-70 transition-opacity">
                      Practice in terminal →
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}