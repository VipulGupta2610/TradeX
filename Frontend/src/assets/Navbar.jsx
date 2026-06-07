import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  
  // Access the user from Redux state
  const user = useSelector(state => state.auth.user);
  
  // Determine if the user is logged in based on the Redux state
  const isLoggedIn = !!user;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-100
        backdrop-blur-xl 
        bg-white/70 dark:bg-[#050505]/60 
        border border-black/10 dark:border-white/10
        rounded-full px-6 md:px-8 py-3 md:py-4 flex items-center gap-4 md:gap-8 shadow-2xl
        transition-colors duration-300 text-black dark:text-white w-[95%] md:w-[90%] max-w-7xl justify-between min-w-max"
    >
      <Link to="/" className="shrink-0">
        <h1 className="font-bold tracking-widest text-lg md:mr-4">TRADEX</h1>
      </Link>

      {/* Added whitespace-nowrap to prevent text from crushing */}
      <div className="hidden md:flex gap-6 font-medium text-sm text-zinc-600 dark:text-zinc-400 mr-auto whitespace-nowrap">
        <Link to="/Markets" className="hover:text-black dark:hover:text-white transition-colors">
          Markets
        </Link>
        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Infrastructure</a>
        <Link to="/ApiDashboard"  className="hover:text-black dark:hover:text-white transition-colors">
        
        API
        </Link>
        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Docs</a>
      </div>

      {/* Added shrink-0 to prevent buttons from squishing */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Auth Section */}
        {isLoggedIn ? (
          <Link to={`/Dashboard/${user._id}`}>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Go to Dashboard"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-inner uppercase shrink-0">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <span className="font-medium text-sm hidden sm:block whitespace-nowrap capitalize">
                {user.name}
              </span>
            </button>
          </Link>
        ) : (
          <Link to="/Login" className="shrink-0">
            <button className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap">
              Login
            </button>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center shrink-0"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
        </button>

        <Link to="/TradingTerminal" className="shrink-0">
          <button className="bg-black dark:bg-white text-white dark:text-black px-4 md:px-6 py-2 rounded-full font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm whitespace-nowrap">
            Launch App
          </button>
        </Link>
      </div>
    </motion.nav>
  );
}

export default Navbar;