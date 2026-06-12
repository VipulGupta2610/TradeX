import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const selector = useSelector((state) => state?.auth?.user);

  // FIXED: Added state to track the active tab
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#050505]/50 backdrop-blur-xl flex flex-col justify-between z-20 relative">
      <div>
        <div className="h-20 flex items-center px-8 border-b border-black/5 dark:border-white/5">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-lg font-black text-xs mr-3">TX</div>
          <span className="font-bold tracking-[0.2em] text-sm">TRADEX.IO</span>
        </div>

        <div className="p-4 space-y-1 mt-4">
          <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Terminal</p>
          {[
            ['Overview', `/Dashboard/${selector?._id || ''}`],
            ['Portfolio', `/Portfolio/${selector?._id || ''}`],
            ['Analytics', `/Analytics/${selector?._id || ''}`],
            ['WatchList', `/Watchlist/${selector?._id || ''}`],
            ['Positions', `/Positions/${selector?._id || ''}`],
            ['Order History', `/OrderHistory`],
            ['Trade History', `/TradeHistory`],
            ['Trade Journal', `/TradeJournal`],
            ['Market Explorer', `/MarketExplorer`],
            ['Leaderboard', `/Leaderboard`],
            ['Challenges', `/Challenges`],
            ['AICoach', `/AICoach`],
            ['LearningCenter', `/LearningCenter`],
            ['Subscription', `/Subscription`],
          ].map(([tab, path]) => (
            // FIXED: Removed redundant <button> tag and placed properties directly on <Link>
            <Link
              key={tab}
              to={path}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
                : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
            >
              {tab}
            </Link>
          ))}

          <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-2">Developer</p>
          {['API Keys', 'Webhooks', 'Documentation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* User Profile Footer */}

      <Link to={`/AccountSettings/${selector?._id}`}>
        <div className="p-4 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              VG
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-black dark:text-white">{selector?.name || 'Trader'}</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{selector?.plan || 'free'} Tier</p>
            </div>
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

    </aside>
  );
}

export default Sidebar;