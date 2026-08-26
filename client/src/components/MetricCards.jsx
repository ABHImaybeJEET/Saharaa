// client/src/components/MetricCards.jsx
import React from "react";
import { AlertOctagon, Users, ShieldAlert, Cpu, Radio, Zap } from "lucide-react";

export default function MetricCards({ metrics, totalReports, activeAllocations }) {
  const {
    criticalReports = 0,
    escalatedReports = 0,
    availableCapacityPct = 0,
    totalResources = 0
  } = metrics || {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* 1. Critical Emergency Reports */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-red-900/50 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-red-400 uppercase font-mono">
            Critical Triage
          </span>
          <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{criticalReports}</span>
          <span className="text-[11px] text-slate-400">/ {totalReports} total</span>
        </div>
        <div className="mt-1 text-[10px] text-red-400 font-medium truncate">
          Priority 1 Dispatches
        </div>
      </div>

      {/* 2. Active Allocations */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-900/50 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 uppercase font-mono">
            Active Sorties
          </span>
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{activeAllocations}</span>
          <span className="text-[11px] text-slate-400">En route / on site</span>
        </div>
        <div className="mt-1 text-[10px] text-cyan-300 font-medium truncate">
          Spatial Matching OK
        </div>
      </div>

      {/* 3. Capacity Remaining */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-900/50 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase font-mono">
            Relief Headroom
          </span>
          <Users className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{availableCapacityPct}%</span>
          <span className="text-[11px] text-slate-400">Free slots</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              availableCapacityPct < 20 ? 'bg-red-500' : availableCapacityPct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, availableCapacityPct)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Escalations */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/50 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase font-mono">
            Manual Escalations
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className={`text-xl sm:text-2xl font-black font-mono ${escalatedReports > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {escalatedReports}
          </span>
          <span className="text-[11px] text-slate-400">Need review</span>
        </div>
        <div className="mt-1 text-[10px] text-amber-300 font-medium truncate">
          {escalatedReports > 0 ? "⚠️ Needs Human Action" : "✓ Grid Balanced"}
        </div>
      </div>

      {/* 5. Total Units */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-indigo-900/50 shadow-md col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-indigo-400 uppercase font-mono">
            Deployed Units
          </span>
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalResources}</span>
          <span className="text-[11px] text-slate-400">Bases & Boats</span>
        </div>
        <div className="mt-1 text-[10px] text-indigo-300 font-medium truncate">
          Live Coordination Active
        </div>
      </div>
    </div>
  );
}
