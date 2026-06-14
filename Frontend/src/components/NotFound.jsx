import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-950 dark:bg-[#050505] dark:text-white">
      <ThemeToggle className="absolute right-6 top-6" />
      <div className="max-w-lg text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-500">404</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Page not found.</h1>
        <p className="mx-auto mt-5 max-w-md text-zinc-500">The route may have moved, or the link is no longer available.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">Go home</Link>
          <Link to="/Markets" className="rounded-full border border-black/10 px-6 py-3 text-sm font-bold dark:border-white/10">Browse markets</Link>
        </div>
      </div>
    </main>
  );
}
