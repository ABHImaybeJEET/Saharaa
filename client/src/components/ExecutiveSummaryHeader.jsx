// client/src/components/ExecutiveSummaryHeader.jsx
import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Flame, 
  Building, 
  Zap, 
  Radio, 
  CloudRain, 
  FileText, 
  Plus
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function ExecutiveSummaryHeader({
  reports = [],
  resources = [],
  allocations = [],
  metrics = {},
  filterType = "all",
  setFilterType,
  onOpenBroadcastModal,
  onOpenDeployModal,
  onOpenCitizenModal,
  onOpenSitRep,
  lang = "en",
  translations
}) {
  const t = translations ? (translations[lang] || translations.en) : {};

  // Live fluctuating environmental sensors for operational realism
  const [sensors, setSensors] = useState({
    rainfall: 148,
    windGust: 84,
    tideHeight: 4.82,
    floodRiskIndex: 87
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        rainfall: Math.max(125, Math.min(185, prev.rainfall + (Math.floor(Math.random() * 5) - 2))),
        windGust: Math.max(72, Math.min(105, prev.windGust + (Math.floor(Math.random() * 5) - 2))),
        tideHeight: parseFloat((4.80 + Math.sin(Date.now() / 35000) * 0.15).toFixed(2)),
        floodRiskIndex: Math.max(78, Math.min(96, prev.floodRiskIndex + (Math.floor(Math.random() * 3) - 1)))
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Compute breakdown stats
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.severity === "critical" && r.status !== "resolved").length;
  const highCount = reports.filter(r => r.severity === "high" && r.status !== "resolved").length;
  const activeSorties = allocations.filter(a => a.status === "active").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;

  const floodCount = reports.filter(r => r.category === "flood" && r.status !== "resolved").length;
  const medicalCount = reports.filter(r => r.category === "medical" && r.status !== "resolved").length;
  const shelterCount = reports.filter(r => r.category === "shelterless" && r.status !== "resolved").length;

  const totalCapacity = resources.reduce((sum, r) => sum + r.capacity, 0);
  const totalLoad = resources.reduce((sum, r) => sum + r.current_load, 0);
  const freeCapacity = Math.max(0, totalCapacity - totalLoad);
  const capacityPct = totalCapacity > 0 ? Math.round((freeCapacity / totalCapacity) * 100) : 0;

  return (
    <div className="w-full bg-theme-card border border-theme-border rounded-2xl p-3 sm:p-4 shadow-sm space-y-3 transition-colors duration-200">
      
      {/* Row 1: Executive KPI Cards Grid (2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: Active Triage */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Active Triage
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              {totalReports - resolvedCount}
            </span>
            <span className="text-xs text-theme-muted">
              / {totalReports} total
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium pt-1.5 border-t border-theme-border text-theme-secondary">
            <span className="text-red-600 dark:text-red-400 font-bold">{criticalCount} Critical</span>
            <span>•</span>
            <span className="text-orange-600 dark:text-orange-400 font-bold">{highCount} High</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{resolvedCount} Done</span>
          </div>
        </div>

        {/* Card 2: Active Sorties */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Active Sorties
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {activeSorties}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ● Teams In Transit
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-theme-secondary pt-1.5 border-t border-theme-border">
            <span>Avg: <strong className="text-theme-primary">1.6 km</strong></span>
            <span>ETA: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">~7 mins</strong></span>
          </div>
        </div>

        {/* Card 3: Shelter Headroom */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              Shelter Space
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Building className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {capacityPct}%
            </span>
            <span className="text-xs text-theme-muted">
              ({freeCapacity} beds free)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-0.5">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalLoad / (totalCapacity || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Environmental Hazard HUD */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>IMD Red Alert</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1.5 flex items-baseline justify-between">
            <div className="text-xs font-bold text-theme-primary">
              Rain: <strong className="text-cyan-600 dark:text-cyan-400">{sensors.rainfall} mm/h</strong>
            </div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400">
              Risk: {sensors.floodRiskIndex}%
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-theme-secondary pt-1.5 border-t border-theme-border">
            <span>Tide: <strong className="text-theme-primary">{sensors.tideHeight}m</strong></span>
            <span>Gusts: <strong className="text-amber-600 dark:text-amber-400">{sensors.windGust} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Category Micro-Filter Pills + Action Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-theme-border text-xs">
        
        {/* Left: Disaster Type Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-0.5">
          {[
            { id: "all", label: "All Incidents", count: totalReports - resolvedCount },
            { id: "critical", label: "🔥 Critical", count: criticalCount },
            { id: "flood", label: "🌊 Flood", count: floodCount },
            { id: "medical", label: "🚑 Medical", count: medicalCount },
            { id: "shelterless", label: "🏕️ Shelters", count: shelterCount }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => {
                soundEngine.playUiClick();
                setFilterType(pill.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                filterType === pill.id
                  ? "bg-red-600 text-white shadow-sm font-bold"
                  : "bg-theme-subtle text-theme-secondary hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span>{pill.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filterType === pill.id ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-700 text-theme-primary"
              }`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Fast Authority Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Broadcast Emergency Warning */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenBroadcastModal();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Broadcast Warning</span>
            <span className="sm:hidden">Broadcast</span>
          </button>

          {/* Situation Report (SitRep) */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSitRep();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-theme-subtle hover:bg-slate-200 dark:hover:bg-slate-800 text-theme-primary text-xs font-semibold transition-all border border-theme-border"
          >
            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>SitRep</span>
          </button>

          {/* Deploy New Resource Unit */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenDeployModal();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Unit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
