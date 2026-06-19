import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

function Sidebar() {
  const user = useSelector((state) => state?.auth?.user);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const userPath = (route) => user?._id ? `/${route}/${user._id}` : '/Login';
  const navigation = [
    ['Overview', userPath('Dashboard')],
    ['Portfolio', userPath('Portfolio')],
    ['Analytics', userPath('Analytics')],
    ['Watchlist', userPath('Watchlist')],
    ['Positions', userPath('Positions')],
    ['TradingTerminal', '/TradingTerminal'],
    ['Order History', '/OrderHistory'],
    ['Trade History', '/TradeHistory'],
    ['Trade Journal', userPath('TradeJournal')],
    // ['Market Explorer', '/MarketExplorer'],
    // ['Leaderboard', '/Leaderboard'],
    // ['Challenges', '/Challenges'],
    // ['AI Coach', '/AICoach'],
    // ['Learning Center', '/LearningCenter'],
    ['Subscription', '/Subscription'],
    ['Report a Bug', '/BugReport'],
  ];

  return (
    <aside className="relative z-40 flex h-auto w-full shrink-0 flex-col border-b border-black/5 bg-white/90 backdrop-blur-xl dark:border-white/5 dark:bg-[#050505]/90 md:h-full md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-black/5 px-4 dark:border-white/5 md:h-20 md:px-8">
        <Link to="/" className="flex min-w-0 items-center">
          <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-black text-white dark:bg-white dark:text-black">TX</div>
          <span className="truncate text-sm font-bold tracking-[0.2em] text-black dark:text-white">TRADEX.IO</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle className="p-2" />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
            aria-expanded={isOpen}
            aria-label="Toggle dashboard navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} max-h-[70vh] flex-1 space-y-1 overflow-y-auto p-4 md:block md:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        {/* <p className="mb-2 mt-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Terminal</p> */}
        {navigation.map(([label, path]) => {
          const isActive = location.pathname === path || (label === 'Overview' && location.pathname.startsWith('/Dashboard/'));
          return (
            <Link
              key={label}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white'
                  : 'text-zinc-300 hover:bg-black/[0.02] hover:text-black dark:hover:bg-white/[0.02] dark:hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}

        <p className="mb-2 mt-8 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Developer</p>
        {[
          ['API Keys', '/ApiDashboard'],
          ['Webhooks', '/ApiDashboard'],
          ['Documentation', '/LearningCenter'],
        ].map(([label, path]) => (
          <Link
            key={label}
            to={path}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-black/[0.02] hover:text-black dark:hover:bg-white/[0.02] dark:hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} shrink-0 border-t border-black/5 bg-white/50 p-4 backdrop-blur-md dark:border-white/5 dark:bg-[#050505]/50 md:block`}>
        <Link to={userPath('AccountSettings')} onClick={() => setIsOpen(false)}>
          <div className="flex items-center gap-3 rounded-xl bg-black/5 px-4 py-3 transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-xs font-bold text-white shadow-inner">
              {(user?.name || 'Trader').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold capitalize text-black dark:text-white">{user?.name || 'Trader'}</p>
              <p className="truncate font-mono text-[10px] text-zinc-500">{user?.plan || 'free'} Tier</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
