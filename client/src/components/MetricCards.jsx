// client/src/components/MetricCards.jsx
import React from "react";
import { AlertOctagon, Activity, Users, ShieldAlert, Cpu, Radio, Zap } from "lucide-react";

export default function MetricCards({ metrics, totalReports, activeAllocations }) {
  const {
    criticalReports = 0,
    escalatedReports = 0,
    availableCapacityPct = 0,
    totalResources = 0
  } = metrics || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* 1. Critical Emergency Reports */}
      <div className="glass-panel p-3.5 rounded-2xl border-l-4 border-l-red-500 relative overflow-hidden group hover:border-tactical-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase font-mono">
            Critical Triage
          </span>
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <AlertOctagon className="w-4 h-4 animate-pulse-fast" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white font-mono">{criticalReports}</span>
          <span className="text-xs text-slate-400">/ {totalReports} active reports</span>
        </div>
        <div className="mt-1 flex items-center text-[10px] text-red-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
          Priority 1 Immediate Rescue
        </div>
      </div>

      {/* 2. Active Allocations */}
      <div className="glass-panel p-3.5 rounded-2xl border-l-4 border-l-cyan-500 relative overflow-hidden group hover:border-tactical-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase font-mono">
            Active Dispatches
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white font-mono">{activeAllocations}</span>
          <span className="text-xs text-slate-400">Units in transit/site</span>
        </div>
        <div className="mt-1 flex items-center text-[10px] text-cyan-300 font-medium">
          <Zap className="w-3 h-3 mr-1 text-cyan-400" />
          Spatial Match Haversine OK
        </div>
      </div>

      {/* 3. Capacity Remaining */}
      <div className="glass-panel p-3.5 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden group hover:border-tactical-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
            Shelter & Resource Headroom
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white font-mono">{availableCapacityPct}%</span>
          <span className="text-xs text-slate-400">Free headroom</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              availableCapacityPct < 20 ? 'bg-red-500' : availableCapacityPct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, availableCapacityPct)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Escalations / Unassigned */}
      <div className="glass-panel p-3.5 rounded-2xl border-l-4 border-l-amber-500 relative overflow-hidden group hover:border-tactical-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase font-mono">
            Manual Escalations
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className={`text-2xl font-black font-mono ${escalatedReports > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {escalatedReports}
          </span>
          <span className="text-xs text-slate-400">Need human dispatch</span>
        </div>
        <div className="mt-1 flex items-center text-[10px] text-amber-300 font-medium">
          {escalatedReports > 0 ? "⚠️ Saturation / Radius limit" : "✓ Auto-triage clear"}
        </div>
      </div>

      {/* 5. Total Units On Grid */}
      <div className="hidden lg:block glass-panel p-3.5 rounded-2xl border-l-4 border-l-indigo-500 relative overflow-hidden group hover:border-tactical-600 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase font-mono">
            Deployment Grid
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white font-mono">{totalResources}</span>
          <span className="text-xs text-slate-400">Tactical units & camps</span>
        </div>
        <div className="mt-1 flex items-center text-[10px] text-indigo-300 font-medium">
          <Activity className="w-3 h-3 mr-1" /> Ready for live routing
        </div>
      </div>
    </div>
  );
}
