import { useState , useEffect} from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import ThemeToggle from '../components/ThemeToggle';

const navLinks = [
  ['Markets', '/Markets'],
  ['Infrastructure', '/TradingTerminal'],
  ['API', '/ApiDashboard'],
  ['Docs', '/LearningCenter'],
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
const navigate = useNavigate()
useEffect(() => {
if (user!=undefined || user!=null){
  navigate(`/Dashboard/${user._id}`)
}
}, [])


console.log("this is navabr page")

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-1/2 top-4 z-100 flex w-[94%] max-w-7xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-3xl border border-black/10 bg-white/80 px-4 py-3 text-black shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#050505]/80 dark:text-white md:top-6 md:w-[90%] md:rounded-full md:px-8 md:py-4"
    >
      <Link to="/" className="shrink-0">
        <h1 className="text-lg font-bold tracking-widest">TRADEX</h1>
      </Link>

      <div className="mr-auto hidden gap-6 whitespace-nowrap text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
        {navLinks.map(([label, path]) => (
          <Link key={path} to={path} className="transition-colors hover:text-black dark:hover:text-white">
            {label}
          </Link>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {user ? (
          <Link to={`/Dashboard/${user._id}`} className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold uppercase text-white shadow-inner">
              {user.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden text-sm font-medium capitalize sm:block">{user.name}</span>
          </Link>
        ) : (
          <Link to="/Login" className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">
            Login
          </Link>
        )}

        <ThemeToggle className="hidden sm:inline-flex" />
        <Link to="/TradingTerminal" className="hidden sm:block">
          <span className="block whitespace-nowrap rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:px-6">
            Launch App
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex w-full flex-col gap-1 border-t border-black/10 pt-3 text-sm dark:border-white/10 md:hidden">
          {navLinks.map(([label, path]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
              {label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2">
            <ThemeToggle />
            <Link to="/TradingTerminal" onClick={() => setMenuOpen(false)} className="flex-1 rounded-full bg-black px-4 py-2 text-center font-semibold text-white dark:bg-white dark:text-black">
              Launch App
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
