import React, { useState } from 'react';
import { getMaskFromCidr } from '../utils/subnetCalc';

export default function CidrReference({ activeCidr }) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate CIDR ranges for reference
  // We'll focus on /8 to /32 as these are standard.
  const referenceData = Array.from({ length: 25 }, (_, i) => {
    const cidr = i + 8;
    const hostBits = 32 - cidr;
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = hostBits >= 2 ? totalHosts - 2 : (hostBits === 1 ? 2 : 1);
    const mask = getMaskFromCidr(cidr);
    
    // Calculate block size in the active octet
    let octetNum = 4;
    let bitOffset = cidr;
    if (cidr <= 8) {
      octetNum = 1;
    } else if (cidr <= 16) {
      octetNum = 2;
      bitOffset = cidr - 8;
    } else if (cidr <= 24) {
      octetNum = 3;
      bitOffset = cidr - 16;
    } else {
      octetNum = 4;
      bitOffset = cidr - 24;
    }

    const blockSize = Math.pow(2, 8 - bitOffset);

    return {
      cidr,
      mask,
      blockSize: cidr === 32 ? 1 : blockSize,
      octet: octetNum,
      usableHosts
    };
  });

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-lg backdrop-blur-sm transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-semibold text-slate-200 focus:outline-none cursor-pointer group"
      >
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            CIDR & Subnet Mask Reference Cheat Sheet
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-slate-400 transition-transform duration-350 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 overflow-hidden animate-fadeIn">
          <p className="text-xs text-slate-400 mb-4">
            Below is a cheat sheet showing subnet sizes, masks, and hosts. The row matching your current selection (/<span className="font-semibold text-indigo-400">{activeCidr}</span>) is highlighted in green.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/30 max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/80 font-bold text-slate-400 sticky top-0 z-10">
                  <th className="px-3 py-2.5">CIDR</th>
                  <th className="px-3 py-2.5">Subnet Mask</th>
                  <th className="px-3 py-2.5">Block Size</th>
                  <th className="px-3 py-2.5">Usable Hosts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {referenceData.map((row) => {
                  const isActive = row.cidr === activeCidr;
                  return (
                    <tr
                      key={row.cidr}
                      className={`transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-l-emerald-500 font-semibold'
                          : 'hover:bg-slate-900/20'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold">/{row.cidr}</td>
                      <td className="px-3 py-2">{row.mask}</td>
                      <td className="px-3 py-2">
                        {row.blockSize} <span className="text-[9px] text-slate-500 font-normal">({row.cidr <= 32 ? `Octet ${row.octet}` : ''})</span>
                      </td>
                      <td className="px-3 py-2">{formatNumber(row.usableHosts)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
