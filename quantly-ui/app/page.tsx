import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
            Q
          </div>
          <span className="text-xl font-semibold tracking-tight">Quantly</span>
        </div>
        <div className="space-x-6 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#engine" className="hover:text-white transition-colors">The Engine</Link>
          <Link href="/screener" className="px-4 py-2 rounded-md bg-white text-slate-950 hover:bg-slate-200 transition-colors">
            Launch Screener
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-8 flex flex-col items-center justify-center text-center min-h-[90vh] relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          V2 Alpha Engine Live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 max-w-4xl">
          Datasets + AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            = Smarter Trades.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Math catches the distress. AI defines the reality. Scan 13,000+ equities in 15 seconds to find the market's true anomalies before the street wakes up.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <Link 
            href="/screener" 
            className="px-8 py-4 rounded-lg bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            Start Screening
          </Link>
        </div>

      </main>
    </div>
  );
}