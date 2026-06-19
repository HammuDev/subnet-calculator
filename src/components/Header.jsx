import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Network Node SVG Logo */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-5 w-5 text-white animate-pulse"
              >
                <rect x="16" y="16" width="6" height="6" rx="1" />
                <rect x="2" y="16" width="6" height="6" rx="1" />
                <rect x="9" y="2" width="6" height="6" rx="1" />
                <path d="M12 8v8M5 16v-4h14v4" />
              </svg>
              {/* Ping notification light */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                NetSubnet <span className="text-xs font-semibold px-2 py-0.5 ml-2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">v2.0 CCNA</span>
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">Advanced IP Subnetting & Network Partitioning Tool</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400 font-mono hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Calculations Local</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
