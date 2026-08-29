// client/src/components/MetricCards.jsx
import React from "react";
import { AlertOctagon, Users, ShieldAlert, Cpu, Radio, Zap, ArrowUpRight } from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function MetricCards({ 
  metrics, 
  totalReports, 
  activeAllocations, 
  lang = "en", 
  translations 
}) {
  const {
    criticalReports = 0,
    escalatedReports = 0,
    availableCapacityPct = 0,
    totalResources = 0
  } = metrics || {};

  const t = translations ? (translations[lang] || translations.en) : {
    metric_critical: "Critical Triage",
    metric_critical_sub: "Priority 1 Dispatches",
    metric_sorties: "Active Sorties",
    metric_sorties_sub: "Spatial Matching OK",
    metric_capacity: "Relief Headroom",
    metric_capacity_sub: "Free slots",
    metric_escalations: "Manual Escalations",
    metric_escalations_sub: "Need review",
    metric_units: "Deployed Units",
    metric_units_sub: "Live Coordination Active"
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* 1. Critical Emergency Reports */}
      <div 
        onClick={() => soundEngine.playUiClick()}
        className="bg-slate-950/80 hover:bg-slate-950 p-3 rounded-2xl border border-red-900/50 hover:border-red-600/70 shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-red-400 uppercase font-mono">
            {t.metric_critical}
          </span>
          <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{criticalReports}</span>
          <span className="text-[11px] text-slate-400">/ {totalReports} total</span>
        </div>
        <div className="mt-1 text-[10px] text-red-400 font-medium truncate flex items-center justify-between">
          <span>{t.metric_critical_sub}</span>
          <ArrowUpRight className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 2. Active Allocations */}
      <div 
        onClick={() => soundEngine.playUiClick()}
        className="bg-slate-950/80 hover:bg-slate-950 p-3 rounded-2xl border border-cyan-900/50 hover:border-cyan-600/70 shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 uppercase font-mono">
            {t.metric_sorties}
          </span>
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{activeAllocations}</span>
          <span className="text-[11px] text-slate-400">En route / on site</span>
        </div>
        <div className="mt-1 text-[10px] text-cyan-300 font-medium truncate flex items-center justify-between">
          <span>{t.metric_sorties_sub}</span>
          <ArrowUpRight className="w-3 h-3 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 3. Capacity Remaining */}
      <div 
        onClick={() => soundEngine.playUiClick()}
        className="bg-slate-950/80 hover:bg-slate-950 p-3 rounded-2xl border border-emerald-900/50 hover:border-emerald-600/70 shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase font-mono">
            {t.metric_capacity}
          </span>
          <Users className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{availableCapacityPct}%</span>
          <span className="text-[11px] text-slate-400">{t.metric_capacity_sub}</span>
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
      <div 
        onClick={() => soundEngine.playUiClick()}
        className="bg-slate-950/80 hover:bg-slate-950 p-3 rounded-2xl border border-amber-900/50 hover:border-amber-600/70 shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase font-mono">
            {t.metric_escalations}
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className={`text-xl sm:text-2xl font-black font-mono ${escalatedReports > 0 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
            {escalatedReports}
          </span>
          <span className="text-[11px] text-slate-400">{t.metric_escalations_sub}</span>
        </div>
        <div className="mt-1 text-[10px] text-amber-300 font-medium truncate flex items-center justify-between">
          <span>{escalatedReports > 0 ? "⚠️ Human Override Queue" : "✓ Grid Balanced"}</span>
          <ArrowUpRight className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 5. Total Units */}
      <div 
        onClick={() => soundEngine.playUiClick()}
        className="bg-slate-950/80 hover:bg-slate-950 p-3 rounded-2xl border border-indigo-900/50 hover:border-indigo-600/70 shadow-md col-span-2 sm:col-span-1 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-indigo-400 uppercase font-mono">
            {t.metric_units}
          </span>
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalResources}</span>
          <span className="text-[11px] text-slate-400">Bases & Boats</span>
        </div>
        <div className="mt-1 text-[10px] text-indigo-300 font-medium truncate flex items-center justify-between">
          <span>{t.metric_units_sub}</span>
          <ArrowUpRight className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
