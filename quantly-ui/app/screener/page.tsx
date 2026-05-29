'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ScreenerDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDistressOnly, setShowDistressOnly] = useState(false);

// Fetch real data from your FastAPI backend!
  useEffect(() => {
    const fetchScreenerData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/screener');
        
        // Safety check to ensure the backend actually responded
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const json = await response.json();

        // Map Python keys to frontend UI keys
        const formatted = json.map((item: any) => {
          // DEFENSIVE FIX: Use Nullish Coalescing (??) to fallback to 0 if the data is missing
          const relScore = item.Relative_Score ?? 0;
          const zScore = item['Z-Score'] ?? 0;
          const marketCap = item.market_cap ?? 0;
          const cashFlow = item.operating_cash_flow ?? 0;
          
          const isDistressed = relScore < -2.0;
          let riskStatus = "Standard";
          
          if (isDistressed && !item.strong_cash_flow) riskStatus = "True Distress";
          else if (isDistressed && item.strong_cash_flow) riskStatus = "False Alarm (Strong Cash)";

          return {
            symbol: item.symbol || "UNKNOWN",
            sector: item.sector || "Unknown",
            relScore: relScore,
            zScore: zScore,
            marketCap: marketCap,
            cashFlow: cashFlow,
            insiderFlow: item.net_insider_flow ?? 0, 
            risk: riskStatus
          };
        });
        
        // Sort worst scores to the top
        formatted.sort((a: any, b: any) => a.relScore - b.relScore);
        setData(formatted);
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch engine data:", err);
        setLoading(false);
      }
    };

    fetchScreenerData();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val <= -1e9) return `-$${Math.abs(val / 1e9).toFixed(2)}B`;
    if (val <= -1e6) return `-$${Math.abs(val / 1e6).toFixed(2)}M`;
    return `$${val}`;
  };

  // Dynamic Filtering Logic
  const filteredData = data.filter(row => {
    const matchesSearch = row.symbol.includes(searchTerm.toUpperCase()) || row.sector.toUpperCase().includes(searchTerm.toUpperCase());
    const matchesDistress = showDistressOnly ? row.risk === 'True Distress' : true;
    return matchesSearch && matchesDistress;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-8">
      
      <header className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <Link href="/" className="text-indigo-500 hover:text-indigo-400 text-sm font-medium mb-2 inline-block">
            &larr; Back to Engine
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quantly Terminal</h1>
          <p className="text-slate-500 mt-1">Cross-sectional Z-Score anomalies & SEC cash flow analysis</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Status</div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {loading ? "Querying Engine..." : `${data.length.toLocaleString()} Equities Loaded`}
          </div>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search ticker or sector..." 
          className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-md focus:outline-none focus:border-indigo-500 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          onClick={() => setShowDistressOnly(!showDistressOnly)}
          className={`px-4 py-2 rounded-md border transition-colors ${
            showDistressOnly 
            ? 'bg-red-900/50 text-red-200 border-red-500/50' 
            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
          }`}
        >
          {showDistressOnly ? "Viewing: True Distress" : "Filter: True Distress Only"}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
              <th className="p-4 font-semibold">Symbol</th>
              <th className="p-4 font-semibold">Sector</th>
              <th className="p-4 font-semibold text-right">Relative Score</th>
              <th className="p-4 font-semibold text-right">Z-Score</th>
              <th className="p-4 font-semibold text-right">Market Cap</th>
              <th className="p-4 font-semibold text-right">Operating Cash Flow</th>
              <th className="p-4 font-semibold text-right">Net Insider Flow</th>
              <th className="p-4 font-semibold">Risk Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 animate-pulse">
                  Extracting matrix from Data Lake...
                </td>
              </tr>
            )}

            {!loading && filteredData.map((row, idx) => (
              <tr 
                key={idx} 
                className={`hover:bg-slate-800/50 transition-colors ${row.risk === 'True Distress' ? 'bg-red-950/10' : ''}`}
              >
                <td className="p-4 font-bold text-white"><Link href={`/screener/${row.symbol}`}
                className="hover:text-indigo-400 hover:underline">{row.symbol}</Link></td>
                <td className="p-4 text-slate-400">{row.sector}</td>
                <td className={`p-4 text-right font-mono ${row.relScore < -2 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {row.relScore.toFixed(2)}
                </td>
                <td className="p-4 text-right font-mono text-slate-300">{row.zScore.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-slate-300">{formatCurrency(row.marketCap)}</td>
                <td className={`p-4 text-right font-mono ${row.cashFlow < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {formatCurrency(row.cashFlow)}
                </td>
                {/* NEW LINE: Green for Net Buys, Red for Net Sells */}
                <td className={`p-4 text-right font-mono ${row.insiderFlow > 0 ? 'text-emerald-400 font-bold' : row.insiderFlow < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {row.insiderFlow === 0 ? "No Data" : formatCurrency(row.insiderFlow)}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    row.risk === 'True Distress' ? 'bg-red-900/30 text-red-400 border-red-800/50' : 
                    row.risk.includes('False Alarm') ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}