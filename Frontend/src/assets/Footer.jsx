import React from 'react';

const Footer = () => {
  return (
    <>
       {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-200 bg-zinc-50 px-8 lg:px-20 py-16 text-zinc-950 transition-colors duration-300 dark:border-white/[0.05] dark:bg-black dark:text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#34d399,#22d3ee)" }}>
                  <span className="text-black font-black text-xs">TX</span>
                </div>
                <span className="font-bold text-lg tracking-tight">TradEx</span>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">The complete infrastructure platform for next-generation trading products.</p>
            </div>
            {[
              { heading: "Product", links: ["Paper Trading", "Market Data", "Analytics", "Backtesting", "SDK"] },
              { heading: "Developers", links: ["Docs", "API Reference", "Changelog", "Status", "GitHub"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Security", "Contact"] },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-zinc-600 hover:text-zinc-950 dark:hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-200 pt-8 flex flex-wrap justify-between items-center gap-4 dark:border-white/[0.05]">
            <p className="text-zinc-700 text-sm">© 2025 TradEx, Inc. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map(l => (
                <a key={l} href="#" className="text-zinc-600 text-sm hover:text-zinc-950 dark:text-zinc-700 dark:hover:text-zinc-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
