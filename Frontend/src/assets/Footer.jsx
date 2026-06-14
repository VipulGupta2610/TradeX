import { Link } from 'react-router-dom';

const footerColumns = [
  { heading: 'Product', links: [['Paper Trading', '/TradingTerminal'], ['Market Data', '/Markets'], ['Analytics', '/Login'], ['AI Coach', '/AICoach'], ['Plans', '/Subscription']] },
  { heading: 'Developers', links: [['Docs', '/LearningCenter'], ['API Reference', '/ApiDashboard'], ['Market Explorer', '/MarketExplorer'], ['Status', '/ApiDashboard'], ['Challenges', '/Challenges']] },
  { heading: 'Explore', links: [['Home', '/'], ['Leaderboard', '/Leaderboard'], ['Journal', '/TradeJournal'], ['Watchlist', '/Login'], ['Contact', 'mailto:support@tradex.io']] },
];

const Footer = () => (
  <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-12 text-zinc-950 transition-colors duration-300 dark:border-white/[0.05] dark:bg-black dark:text-white sm:px-8 lg:px-20 lg:py-16">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 grid gap-10 sm:grid-cols-2 md:grid-cols-5 lg:mb-16">
        <div className="sm:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400">
              <span className="text-xs font-black text-black">TX</span>
            </div>
            <span className="text-lg font-bold tracking-tight">TradEx</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">The complete infrastructure platform for next-generation trading products.</p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.heading}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{column.heading}</p>
            <ul className="space-y-2.5">
              {column.links.map(([label, path]) => (
                <li key={label}>
                  {path.startsWith('mailto:') ? (
                    <a href={path} className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">{label}</a>
                  ) : (
                    <Link to={path} className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-white/[0.05]">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} TradEx, Inc. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Cookies'].map((label) => (
            <Link key={label} to="/Login" className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
