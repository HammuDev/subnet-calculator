'use client';

import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import CalculatorForm from '../components/CalculatorForm';
import SummaryCards from '../components/SummaryCards';
import BitVisualizer from '../components/BitVisualizer';
import SubnetTable from '../components/SubnetTable';
import CidrReference from '../components/CidrReference';

export default function Home() {
  const [results, setResults] = useState(null);
  const [requestedSubnets, setRequestedSubnets] = useState(4);

  // Callback to calculate subnetting results in real-time
  const handleCalculate = useCallback(async (ip, subnets, baseCidr) => {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, subnets, baseCidr }),
      });
      const data = await response.json();
      setResults(data);
      setRequestedSubnets(subnets);
    } catch (err) {
      setResults({ error: 'Failed to connect to calculation backend.' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background grid overlay for premium aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-1/4 translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Dynamic Warning Alert if calculation has error */}
        {results && results.error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-start space-x-3 shadow-lg backdrop-blur-md animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold block text-base">Calculation Error</span>
              <span className="mt-1 block text-slate-300">{results.error}</span>
            </div>
          </div>
        )}

        {/* 1. Summary Cards Row - only show when we have valid results */}
        {results && !results.error && (
          <SummaryCards results={results} />
        )}

        {/* 2. Form and Visualizer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <CalculatorForm onCalculate={handleCalculate} />
            
            <CidrReference activeCidr={results && !results.error ? results.newCidr : 24} />
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            <BitVisualizer 
              ip={results && !results.error ? results.ipAddress : "192.168.1.0"}
              startCidr={results && !results.error ? results.startCidr : 24}
              borrowedBits={results && !results.error ? results.borrowedBits : 2}
              hostBits={results && !results.error ? results.hostBits : 6}
            />
            
            {/* 3. Subnet Table inside details panel to keep layout balanced */}
            {results && !results.error && (
              <SubnetTable results={results} requestedSubnets={requestedSubnets} />
            )}
          </div>
        </div>

      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} NetSubnet. Built for Network Engineers, Students, & Administrators.</p>
        </div>
      </footer>
    </div>
  );
}
