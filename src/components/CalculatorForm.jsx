import React, { useState, useEffect } from 'react';
import { validateIp, getIpClass, getDefaultCidr } from '../utils/subnetCalc';

export default function CalculatorForm({ onCalculate }) {
  const [ip, setIp] = useState('192.168.1.0');
  const [useOverride, setUseOverride] = useState(false);
  const [baseCidr, setBaseCidr] = useState(24);
  const [subnets, setSubnets] = useState(4);
  const [error, setError] = useState('');
  
  // Real-time IP Class detection
  const ipClass = getIpClass(ip);
  const defaultCidr = getDefaultCidr(ipClass);
  const activeBaseCidr = useOverride ? baseCidr : (defaultCidr || 24);
  
  // Calculate maximum subnets possible to stay within /30 (retains usable hosts)
  const maxBorrowBits = Math.max(0, 30 - activeBaseCidr);
  const maxSubnets = Math.pow(2, maxBorrowBits);
  
  // Adjust base CIDR if class changes
  useEffect(() => {
    if (!useOverride && defaultCidr) {
      setBaseCidr(defaultCidr);
    }
  }, [ipClass, useOverride, defaultCidr]);

  // Adjust subnets count if it exceeds the new limit
  useEffect(() => {
    if (subnets > maxSubnets && maxSubnets > 0) {
      setSubnets(maxSubnets);
    }
  }, [activeBaseCidr, maxSubnets, subnets]);

  // Trigger calculations whenever inputs change
  useEffect(() => {
    if (!validateIp(ip)) {
      setError('Please enter a valid IPv4 address (e.g. 192.168.1.0)');
      return;
    }
    
    if (ipClass === 'D' || ipClass === 'E') {
      setError(`Class ${ipClass} (Multicast/Reserved) addresses cannot be subnetted.`);
      return;
    }
    
    setError('');
    onCalculate(ip, subnets, useOverride ? baseCidr : null);
  }, [ip, subnets, useOverride, baseCidr, onCalculate, ipClass]);

  const handlePresetClick = (val) => {
    if (val <= maxSubnets) {
      setSubnets(val);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Subnet Configuration</span>
      </h2>

      <div className="space-y-6">
        {/* IP Input Field */}
        <div>
          <label htmlFor="ip-input" className="block text-sm font-medium text-slate-300 mb-2">
            Base IP Address
          </label>
          <div className="relative">
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-colors ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
              placeholder="e.g. 192.168.1.0"
            />
            {ipClass && ipClass !== 'Unknown' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Class {ipClass}
              </span>
            )}
          </div>
          {error ? (
            <p className="mt-2 text-xs text-red-400 flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Enter the network address or any host IP inside the network.
            </p>
          )}
        </div>

        {/* CIDR Override Option */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Custom Base Prefix (CIDR)</span>
            <label htmlFor="override-toggle" className="relative inline-flex cursor-pointer items-center">
              <input
                id="override-toggle"
                type="checkbox"
                checked={useOverride}
                onChange={(e) => setUseOverride(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-800 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-600 after:bg-slate-400 after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-indigo-600 peer-checked:after:bg-white peer-focus:outline-none"></div>
            </label>
          </div>
          
          {useOverride && (
            <div className="flex items-center space-x-3 animate-fadeIn">
              <select
                id="cidr-select"
                value={baseCidr}
                onChange={(e) => setBaseCidr(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>
                    /{c} (Mask: {c <= 32 ? ''.padStart(c, '1').padEnd(32, '0').match(/.{1,8}/g).map(bin => parseInt(bin, 2)).join('.') : ''})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Subnets Input & Slider */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="subnet-input" className="text-sm font-medium text-slate-300">
              Required Subnets
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSubnets(prev => Math.max(1, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                -
              </button>
              <input
                id="subnet-input"
                type="number"
                min="1"
                max={maxSubnets > 0 ? maxSubnets : 1000000}
                value={subnets}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1) {
                    setSubnets(Math.min(val, maxSubnets > 0 ? maxSubnets : val));
                  }
                }}
                className="w-20 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-center font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setSubnets(prev => Math.min(prev + 1, maxSubnets > 0 ? maxSubnets : prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Subnet Slider */}
          {maxSubnets > 1 && (
            <div className="mt-3">
              <input
                id="subnet-slider"
                type="range"
                min="1"
                max={Math.min(maxSubnets, 128)} // Cap slider at 128 for smoother UX, but let them type larger numbers
                value={Math.min(subnets, 128)}
                onChange={(e) => setSubnets(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-850 accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 Subnet</span>
                <span>{Math.min(maxSubnets, 128)} Subnets</span>
              </div>
            </div>
          )}

          {/* Quick presets */}
          <div className="mt-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Quick Presets</span>
            <div className="flex flex-wrap gap-2">
              {[2, 4, 8, 16, 32, 64].map((preset) => {
                const isDisabled = preset > maxSubnets;
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                      subnets === preset
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        : isDisabled
                        ? 'bg-slate-900/20 border-slate-850 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-750 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
