import React from 'react';

export default function SummaryCards({ results }) {
  if (!results || results.error) return null;

  const {
    ipClass,
    startCidr,
    newCidr,
    subnetMask,
    borrowedBits,
    hostBits,
    totalSubnetsPossible,
    usableHostsPerSubnet,
    alignedBaseIp
  } = results;

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const cardData = [
    {
      title: 'Class Detected',
      value: `Class ${ipClass}`,
      subtext: `Base Network: ${alignedBaseIp}/${startCidr}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      borderColor: 'border-sky-500/20 hover:border-sky-500/40',
      glowColor: 'shadow-sky-500/5'
    },
    {
      title: 'New Subnet Mask',
      value: subnetMask,
      subtext: `CIDR Notation: /${newCidr} (+${borrowedBits} bits)`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      borderColor: 'border-indigo-500/20 hover:border-indigo-500/40',
      glowColor: 'shadow-indigo-500/5'
    },
    {
      title: 'Usable Hosts / Subnet',
      value: formatNumber(usableHostsPerSubnet),
      subtext: `Host Bits Remaining: ${hostBits} bits`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      glowColor: 'shadow-emerald-500/5'
    },
    {
      title: 'Total Subnets Created',
      value: formatNumber(totalSubnetsPossible),
      subtext: `${borrowedBits} bits borrowed from host portion`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
      glowColor: 'shadow-amber-500/5'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
      {cardData.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border bg-slate-900/50 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.borderColor} ${card.glowColor}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/40 border border-slate-850">
              {card.icon}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
            <span className="block text-xs text-slate-400 mt-1 font-mono">{card.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
