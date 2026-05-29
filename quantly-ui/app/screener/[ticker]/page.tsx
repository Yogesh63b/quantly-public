'use client';

import ShapWaterfall from '@/components/ShapWaterfall';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import {
  Activity,
  DollarSign,
  AlertTriangle,
  Cpu,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export default function TearSheet({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const resolvedParams = use(params);
  const ticker = resolvedParams.ticker;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/stock/${ticker}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [ticker]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 animate-pulse">
        Loading Quant Models...
      </div>
    );

  const stats = data.stats || {};
  const isDistressed = (stats.Relative_Score ?? 0) < -2;

  const regime = data.regime || {
    regime_label: 'Unknown',
    pca_confidence: 0,
    cluster_id: -1,
  };

  const trend = data.nowcast?.trend || 'Stable';

  const TrendIcon =
    trend === 'Expanding'
      ? TrendingUp
      : trend === 'Deteriorating'
      ? TrendingDown
      : Minus;

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    if (payload.isAnomaly) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ef4444"
          stroke="#450a0a"
          strokeWidth={3}
          className="animate-pulse"
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-8">
      {/* Header */}
      <Link
        href="/screener"
        className="text-indigo-500 hover:text-indigo-400 text-sm font-medium mb-6 inline-block"
      >
        &larr; Back to Screener Universe
      </Link>

      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            {data.ticker}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {stats.sector || 'Sector Unknown'} • Algorithmic Tear Sheet
          </p>
        </div>

        <div className="text-right">
          <div
            className={`px-4 py-2 rounded-md border font-semibold ${
              isDistressed
                ? 'bg-red-900/30 text-red-400 border-red-800/50'
                : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
            }`}
          >
            {isDistressed ? 'ELEVATED RISK FLAG' : 'SYSTEM NOMINAL'}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Price Action & ML Overlays
          </h2>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                  tickMargin={10}
                  minTickGap={30}
                />

                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(val) => `$${val}`}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                  }}
                  itemStyle={{
                    color: '#818cf8',
                    fontWeight: 'bold',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={renderCustomDot}
                  activeDot={{
                    r: 8,
                    fill: '#818cf8',
                    stroke: '#1e293b',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Insider Flow */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Net Insider Flow
            </h3>

            <div
              className={`text-3xl font-bold font-mono ${
                (stats.net_insider_flow ?? 0) > 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              ${((stats.net_insider_flow ?? 0) / 1000000).toFixed(2)}M
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Aggregated 90-day SEC Form 4 Filings
            </p>
          </div>

          {/* Z-Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Fundamental Z-Score
            </h3>

            <div className="text-3xl font-bold font-mono text-white">
              {(stats['Z-Score'] ?? 0).toFixed(2)}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Distance from sector baseline
            </p>
          </div>

          {/* XGBOOST NOWCAST */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/20 to-transparent"></div>

            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
              <Activity className="w-4 h-4 text-indigo-400" />
              XGBoost CF Nowcast
            </h3>

            <div className="flex justify-between items-end mt-4 relative z-10">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Lagging SEC Reported
                </p>

              <div className="text-xl font-mono text-slate-400 line-through decoration-slate-600">
                ${((stats.operating_cash_flow ?? 0) / 1000000).toFixed(2)}M
              </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-indigo-400 mb-1 font-semibold">
                  Real-Time Prediction
                </p>

                <div
                  className={`text-3xl font-bold font-mono ${
                    (data.nowcast?.prediction ?? 0) >
                    (stats.operating_cash_flow ?? 0)
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  $
                  {(
                    (data.nowcast?.prediction ?? 0) / 1000000
                  ).toFixed(2)}
                  M
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <TrendIcon
                  className={`w-4 h-4 ${
                    trend === 'Expanding'
                      ? 'text-emerald-400'
                      : trend === 'Deteriorating'
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                />
                Trajectory:
                <span
                  className={
                    trend === 'Expanding'
                      ? 'text-emerald-400'
                      : trend === 'Deteriorating'
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }
                >
                  {trend}
                </span>
              </span>

              <span className="text-xs text-slate-600 font-mono">
                R² {data.nowcast?.confidence ?? 0}%
              </span>
            </div>
            {data.nowcast && (
              <ShapWaterfall nowcast={data.nowcast} />
            )}
          </div>

          {/* PCA REGIME */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl border-l-4 border-l-indigo-500">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Market Regime (PCA)
            </h3>

            <div className="text-lg font-bold text-white mt-3 leading-tight">
              {regime.regime_label}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">
                  Model Confidence (Variance)
                </span>
                <span className="text-xs font-mono text-indigo-400">
                  {regime.pca_confidence}%
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      Math.max(regime.pca_confidence, 5),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Isolation Forest */}
          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-indigo-500/10">
              <Cpu className="w-32 h-32" />
            </div>

            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-2 relative z-10">
              Unsupervised ML (Isolation Forest)
            </h3>

            {data.anomaly_count > 0 ? (
              <>
                <div className="text-3xl font-bold font-mono text-red-400 relative z-10 mt-2">
                  {data.anomaly_count} Flags
                </div>

                <p className="text-xs text-indigo-300/70 mt-2 relative z-10">
                  Anomalous volume/volatility days detected. See red indicators
                  on the chart.
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold font-mono text-emerald-400 relative z-10 mt-2">
                  0 Flags
                </div>

                <p className="text-xs text-indigo-300/70 mt-2 relative z-10">
                  Normal market behavior detected. No structural price anomalies
                  found recently.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}