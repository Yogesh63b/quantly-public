'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ShapProps {
  nowcast: {
    prediction: number;
    shap_base: number;
    shap_values: Record<string, number>;
  };
}

export default function ShapWaterfall({ nowcast }: ShapProps) {
  if (!nowcast || !nowcast.shap_values) return null;

  const { shap_base, shap_values, prediction } = nowcast;

  // Build the sequential blocks for the waterfall matrix
  const features = Object.keys(shap_values);
  let currentRunningTotal = shap_base;

  const data = [
    {
      name: 'Base Value',
      displayValue: (shap_base / 1000000).toFixed(2),
      floatingBottom: 0,
      barHeight: shap_base / 1000000,
      isTotal: true,
    },
  ];

  features.forEach((feat) => {
    const val = shap_values[feat] / 1000000; // Scale to Millions
    const start = currentRunningTotal / 1000000;
    currentRunningTotal += shap_values[feat];
    const end = currentRunningTotal / 1000000;

    data.push({
      name: feat.replace('_', ' '),
      displayValue: (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)),
      floatingBottom: Math.min(start, end),
      barHeight: Math.abs(val),
      isTotal: false,
    });
  });

  data.push({
    name: 'Final Nowcast',
    displayValue: (prediction / 1000000).toFixed(2),
    floatingBottom: 0,
    barHeight: prediction / 1000000,
    isTotal: true,
  });

  return (
    <div className="w-full h-[320px] mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
        Model Attribution Vectors ($ Millions)
      </p>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded shadow-lg text-xs">
                    <p className="font-semibold text-slate-300">{item.name}</p>
                    <p className="text-indigo-400 font-mono">${item.displayValue}M</p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Transparent base bar to create the floating waterfall effect */}
          <Bar dataKey="floatingBottom" stackId="a" fill="transparent" />
          {/* Visible value bar */}
          <Bar dataKey="barHeight" stackId="a">
            {data.map((entry, index) => {
              let barColor = '#6366f1'; // Default Indigo for total targets
              if (!entry.isTotal) {
                barColor = parseFloat(entry.displayValue) >= 0 ? '#10b981' : '#ef4444'; // Green for positive, Red for negative
              }
              return <Cell key={`cell-${index}`} fill={barColor} opacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}