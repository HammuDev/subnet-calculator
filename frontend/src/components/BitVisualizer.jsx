import React from 'react';
import { ipToInt } from '../utils/subnetCalc';

export default function BitVisualizer({ ip, startCidr, borrowedBits, hostBits }) {
  // Convert IP to a 32-bit binary string
  let binaryStr = '';
  try {
    const ipIntVal = ipToInt(ip);
    binaryStr = ipIntVal.toString(2).padStart(32, '0');
  } catch (e) {
    binaryStr = '0'.repeat(32);
  }

  // Group into 4 octets
  const octets = [
    binaryStr.slice(0, 8),
    binaryStr.slice(8, 16),
    binaryStr.slice(16, 24),
    binaryStr.slice(24, 32)
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>32-Bit Binary Visualizer</span>
      </h2>

      <p className="text-xs text-slate-400 mb-6">
        See how the IPv4 address is partitioned in binary. The network portion is split into network bits, borrowed subnet bits, and host bits.
      </p>

      {/* Grid of Octets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 select-none mb-6">
        {octets.map((octet, octetIdx) => (
          <div key={octetIdx} className="space-y-1.5">
            <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              Octet {octetIdx + 1}
            </span>
            <div className="flex space-x-1">
              {octet.split('').map((bit, bitIdx) => {
                const globalIdx = octetIdx * 8 + bitIdx;
                let bitType = 'host'; // network, subnet, host
                
                if (globalIdx < startCidr) {
                  bitType = 'network';
                } else if (globalIdx < startCidr + borrowedBits) {
                  bitType = 'subnet';
                }

                // Determine styling based on type
                let cellClass = '';
                if (bitType === 'network') {
                  cellClass = 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-inner shadow-sky-500/10';
                } else if (bitType === 'subnet') {
                  cellClass = 'bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-inner shadow-violet-500/10';
                } else {
                  cellClass = 'bg-slate-800/40 text-slate-500 border-slate-750';
                }

                return (
                  <div
                    key={bitIdx}
                    className={`flex-1 aspect-square flex items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-all duration-300 hover:scale-105 ${cellClass}`}
                    title={`Bit ${globalIdx + 1}: ${bitType.toUpperCase()} Bit`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
            <span className="block text-center text-xs font-mono font-bold text-slate-400 bg-slate-950/40 py-1 rounded-md mt-1 border border-slate-850">
              {parseInt(octet, 2)}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Legend */}
      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-slate-950/50 border border-slate-850 text-xs">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded bg-sky-500/20 border border-sky-500/50"></div>
          <div>
            <span className="block font-medium text-slate-200">Network Bits</span>
            <span className="text-[10px] text-slate-400 font-mono">{startCidr} bits</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 border-l border-slate-800/60 pl-3">
          <div className="h-3 w-3 rounded bg-violet-600/30 border border-violet-500/50"></div>
          <div>
            <span className="block font-medium text-slate-200">Subnet Bits</span>
            <span className="text-[10px] text-slate-400 font-mono">+{borrowedBits} bits</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-l border-slate-800/60 pl-3">
          <div className="h-3 w-3 rounded bg-slate-800 border border-slate-700"></div>
          <div>
            <span className="block font-medium text-slate-200">Host Bits</span>
            <span className="text-[10px] text-slate-400 font-mono">{hostBits} bits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
