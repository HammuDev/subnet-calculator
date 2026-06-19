import React, { useState, useEffect } from 'react';
import { getSubnetDetails } from '../utils/subnetCalc';

export default function SubnetTable({ results, requestedSubnets }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!results || results.error) return null;

  const {
    ipAddress,
    newCidr,
    alignedBaseIpInt,
    totalSubnetsPossible
  } = results;

  // The actual number of subnets we need to display
  const totalSubnetsToDisplay = Math.min(requestedSubnets, totalSubnetsPossible);

  // Total pages
  const totalPages = Math.ceil(totalSubnetsToDisplay / pageSize);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [requestedSubnets, newCidr]);

  // Generate subnets for current page
  const pageSubnets = [];
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalSubnetsToDisplay);

  for (let i = startIdx; i < endIdx; i++) {
    const details = getSubnetDetails(alignedBaseIpInt, newCidr, i);
    if (details) {
      pageSubnets.push(details);
    }
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Subnet #', 'Network Address', 'First Usable IP', 'Last Usable IP', 'Broadcast Address'];
    // Safety cap at 50,000 subnets
    const maxCsvRows = Math.min(totalSubnetsToDisplay, 50000);
    
    let csvContent = headers.join(',') + '\n';
    
    for (let i = 0; i < maxCsvRows; i++) {
      const details = getSubnetDetails(alignedBaseIpInt, newCidr, i);
      if (details) {
        // Wrap range/values in quotes to avoid breaking comma splits
        const row = [
          `Subnet ${details.index}`,
          details.network,
          details.firstUsable,
          details.lastUsable,
          details.broadcast
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subnet_breakdown_${ipAddress}_slash_${newCidr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Subnet Partition Breakdown</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Displaying subnets {totalSubnetsToDisplay > 0 ? startIdx + 1 : 0} to {endIdx} of {totalSubnetsToDisplay} calculated.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Page size selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="page-size" className="text-xs text-slate-400 font-mono">Show:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-850 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md shadow-emerald-500/5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Warning if CSV is capped */}
      {totalSubnetsToDisplay > 50000 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-400 flex items-start space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold block">Large Dataset Warning</span>
            <span>Generating too many rows can crash the browser. CSV export is limited to the first 50,000 subnets.</span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              <th className="px-4 py-3.5">Subnet #</th>
              <th className="px-4 py-3.5">Network Address</th>
              <th className="px-4 py-3.5">Usable IP Range</th>
              <th className="px-4 py-3.5">Broadcast Address</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 font-mono text-sm text-slate-300">
            {pageSubnets.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                  No subnets calculated. Enter a configuration above.
                </td>
              </tr>
            ) : (
              pageSubnets.map((sub, idx) => (
                <tr key={sub.index} className="hover:bg-slate-900/35 transition-colors group">
                  <td className="px-4 py-3.5 font-semibold text-slate-400">
                    Subnet {sub.index}
                  </td>
                  <td className="px-4 py-3.5 text-white font-semibold">
                    {sub.network}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {sub.range}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {sub.broadcast}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleCopy(`${sub.network} | Usable: ${sub.range} | Broadcast: ${sub.broadcast}`, sub.index)}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition-all inline-flex items-center space-x-1 cursor-pointer"
                      title="Copy subnet details"
                    >
                      {copiedIndex === sub.index ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      )}
                      <span className="text-[10px] px-1 hidden group-hover:inline-block">
                        {copiedIndex === sub.index ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-850">
          <div className="text-xs text-slate-400">
            Page <span className="text-slate-200 font-semibold">{currentPage}</span> of{' '}
            <span className="text-slate-200 font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2 select-none">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              Previous
            </button>
            
            {/* Quick page numbers around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage - 2 + i;
              // Adjust if we are near the boundaries
              if (currentPage <= 2) pageNum = i + 1;
              if (currentPage >= totalPages - 1) pageNum = totalPages - 4 + i;
              
              const activePage = Math.max(1, Math.min(pageNum, totalPages));
              
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(activePage)}
                  className={`h-8 w-8 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === activePage
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:border-slate-750 hover:text-slate-200'
                  }`}
                >
                  {activePage}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950 disabled:hover:text-slate-400 transition-all cursor-pointer"
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
