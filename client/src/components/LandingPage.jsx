// client/src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Map, 
  Users, 
  MessageSquare, 
  Radio, 
  Zap, 
  Building, 
  LifeBuoy, 
  Flame, 
  Phone, 
  Compass, 
  Navigation, 
  Activity, 
  CloudRain, 
  Waves, 
  Wind, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  BarChart3,
  TrendingUp,
  Cpu
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";
import { triggerScenarioStep } from "../utils/api";

export default function LandingPage({
  reports = [],
  resources = [],
  allocations = [],
  broadcastAlerts = [],
  imdAlerts = [],
  metrics = {},
  onSelectMode,
  onOpenCitizenModal,
  onOpenSmsModal,
  onOpenBroadcastModal,
  onOpenDemoTour,
  onOpenSitRep,
  onOpenDeployModal,
  lang = "en",
  translations
}) {
  const [selectedIncidentFilter, setSelectedIncidentFilter] = useState("all");
  const [drillExecuting, setDrillExecuting] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real-time environmental telemetry simulation
  const [telemetry, setTelemetry] = useState({
    rainfall: 154,
    windGust: 82,
    tideHeight: 4.85,
    floodRiskIndex: 88
  });

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const sensorInterval = setInterval(() => {
      setTelemetry(prev => ({
        rainfall: Math.max(130, Math.min(190, prev.rainfall + (Math.floor(Math.random() * 5) - 2))),
        windGust: Math.max(70, Math.min(105, prev.windGust + (Math.floor(Math.random() * 5) - 2))),
        tideHeight: parseFloat((4.80 + Math.sin(Date.now() / 30000) * 0.12).toFixed(2)),
        floodRiskIndex: Math.max(80, Math.min(96, prev.floodRiskIndex + (Math.floor(Math.random() * 3) - 1)))
      }));
    }, 4000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(sensorInterval);
    };
  }, []);

  // Computed state
  const totalReports = reports.length;
  const activeReports = reports.filter(r => r.status !== "resolved");
  const criticalReports = activeReports.filter(r => r.severity === "critical");
  const highReports = activeReports.filter(r => r.severity === "high");
  const mediumReports = activeReports.filter(r => r.severity === "medium");
  const resolvedReports = reports.filter(r => r.status === "resolved");

  const activeAllocations = allocations.filter(a => a.status === "active");
  const totalCapacity = resources.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalLoad = resources.reduce((sum, r) => sum + (r.current_load || 0), 0);
  const freeSlots = Math.max(0, totalCapacity - totalLoad);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0;
  const matchRatePct = totalReports > 0 ? Math.round((allocations.length / totalReports) * 100) : 100;

  const filteredIncidents = activeReports.filter(r => {
    if (selectedIncidentFilter === "critical") return r.severity === "critical";
    if (selectedIncidentFilter === "high") return r.severity === "high";
    if (selectedIncidentFilter === "flood") return r.category === "flood";
    if (selectedIncidentFilter === "medical") return r.category === "medical";
    return true;
  });

  const handleRunDrill = async (stepNum) => {
    setDrillExecuting(stepNum);
    soundEngine.playRadarPing();
    try {
      await triggerScenarioStep(stepNum);
      soundEngine.playDispatchTone();
    } catch (err) {
      console.error("Drill error:", err);
    } finally {
      setTimeout(() => setDrillExecuting(null), 1200);
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-4 font-sans animate-in fade-in duration-200">
      
      {/* 1. TOP MISSION CONTROL HEADER HUD */}
      <div className="w-full bg-theme-card border border-theme-border rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-theme-border">
          
          {/* Left Title & Status */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-theme-primary tracking-tight font-sans">
                  SAHARAA CRISIS OPERATIONS DASHBOARD
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-mono text-[10px] font-extrabold border border-red-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE GRID ONLINE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30 hidden sm:inline">
                  MUMBAI - THANE BASIN
                </span>
              </div>
              <p className="text-xs text-theme-muted mt-0.5 flex items-center gap-2">
                <span>Autonomous Spatial Allocation & Multi-Agency Humanitarian Grid</span>
                <span>•</span>
                <span className="font-mono text-theme-secondary font-semibold">{currentTime} IST</span>
              </p>
            </div>
          </div>

          {/* Right Fast Action Launchers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onSelectMode("authority");
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Tactical Map</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onSelectMode("citizen");
              }}
              className="px-3.5 py-2 rounded-xl bg-theme-subtle hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme-border text-theme-primary font-bold text-xs flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onOpenSmsModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-bold text-xs font-mono flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Gateway</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onOpenBroadcastModal();
              }}
              className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>Broadcast</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onOpenSitRep();
              }}
              className="p-2 rounded-xl bg-theme-subtle border border-theme-border text-theme-muted hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Generate Emergency SitRep"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 4 EXECUTIVE TELEMETRY GAUGES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Meter 1: Incident Triage Status */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Active Emergencies
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono">
                {activeReports.length}
              </span>
              <span className="text-xs text-theme-muted">
                / {totalReports} Total Logs
              </span>
            </div>

            {/* Micro Breakdown Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-red-600 h-full transition-all" 
                  style={{ width: `${totalReports > 0 ? (criticalReports.length / totalReports) * 100 : 0}%` }}
                  title="Critical"
                ></div>
                <div 
                  className="bg-orange-500 h-full transition-all" 
                  style={{ width: `${totalReports > 0 ? (highReports.length / totalReports) * 100 : 0}%` }}
                  title="High"
                ></div>
                <div 
                  className="bg-amber-500 h-full transition-all" 
                  style={{ width: `${totalReports > 0 ? (mediumReports.length / totalReports) * 100 : 0}%` }}
                  title="Medium"
                ></div>
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${totalReports > 0 ? (resolvedReports.length / totalReports) * 100 : 0}%` }}
                  title="Resolved"
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-theme-muted">
                <span className="text-red-600 dark:text-red-400 font-bold">{criticalReports.length} Crit</span>
                <span className="text-orange-600 dark:text-orange-400 font-bold">{highReports.length} High</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{resolvedReports.length} Done</span>
              </div>
            </div>
          </div>

          {/* Meter 2: Sortie Dispatch & Spatial Engine */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Sortie Auto-Match
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {activeAllocations.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                ● En Route ({matchRatePct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-secondary font-mono pt-1 border-t border-theme-border">
              <span>Avg Haversine: <strong className="text-theme-primary">1.4 km</strong></span>
              <span>ETA: <strong className="text-cyan-600 dark:text-cyan-400">~6m</strong></span>
            </div>
          </div>

          {/* Meter 3: Shelter Headroom & Relief Capacity */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Relief Capacity
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {freeSlots}
              </span>
              <span className="text-xs text-theme-muted">
                Free Slots ({100 - occupancyPct}% Avail)
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    occupancyPct > 90 ? "bg-red-500" : occupancyPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-theme-muted">
                <span>Load: {totalLoad}/{totalCapacity}</span>
                <span>{resources.length} Units Active</span>
              </div>
            </div>
          </div>

          {/* Meter 4: Live Climate Sensor Telemetry */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>IMD Sensor HUD</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-theme-primary">
                Rain: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{telemetry.rainfall} mm/h</strong>
              </span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                Risk: {telemetry.floodRiskIndex}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-secondary font-mono pt-1 border-t border-theme-border">
              <span>Tide: <strong className="text-theme-primary">{telemetry.tideHeight}m</strong></span>
              <span>Gusts: <strong className="text-amber-600 dark:text-amber-400">{telemetry.windGust} km/h</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE DASHBOARD SECTION (2 Columns: Live Incident Feed vs Resource Deployment Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 cols): Live Incident Triage Stream */}
        <div className="lg:col-span-7 bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
          
          {/* Header & Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                  Live Incident Queue & Spatial Triage
                </h2>
              </div>
              <p className="text-xs text-theme-muted mt-0.5">
                Incoming citizen web & offline SMS reports mapped with automated dispatch recommendations
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 bg-theme-subtle p-0.5 rounded-xl border border-theme-border text-xs">
              {[
                { id: "all", label: "All" },
                { id: "critical", label: "🔥 Crit" },
                { id: "high", label: "⚡ High" },
                { id: "flood", label: "🌊 Flood" },
                { id: "medical", label: "🚑 Med" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSelectedIncidentFilter(tab.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedIncidentFilter === tab.id
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-theme-muted hover:text-theme-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-theme-muted font-mono border border-dashed border-theme-border rounded-xl">
                No active incidents in this filter category.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const alloc = allocations.find(a => a.report_id === inc.id && a.status === "active");
                const assignedRes = alloc ? resources.find(r => r.id === alloc.resource_id) : null;

                return (
                  <div 
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border hover:border-theme-medium transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase text-white ${
                          inc.severity === "critical" ? "bg-red-600" :
                          inc.severity === "high" ? "bg-orange-600" : "bg-amber-600"
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="text-xs font-bold text-theme-primary">
                          {inc.location_name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-theme-muted">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                        <span className="uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-theme-primary font-bold">
                          {inc.source}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed font-sans">
                      {inc.description}
                    </p>

                    {/* Dispatch Status Strip */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-theme-border/60">
                      {alloc && assignedRes ? (
                        <div className="flex items-center space-x-1.5 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono">
                          <Zap className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>Assigned: <strong>{assignedRes.name}</strong></span>
                          <span>({alloc.distance_km} km, ~{alloc.eta_minutes}m)</span>
                        </div>
                      ) : (
                        <div className="text-amber-700 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Pending manual dispatcher review</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          soundEngine.playUiClick();
                          onSelectMode("authority");
                        }}
                        className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                      >
                        <span>Inspect in Map</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Resource Deployment Grid & Rapid Drills */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Widget: Deployed Resource Units */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                  Deployed Emergency Units
                </h2>
              </div>
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onOpenDeployModal();
                }}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Unit</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {resources.map(res => {
                const fillPct = Math.round((res.current_load / res.capacity) * 100);
                const isAvailable = res.current_load < res.capacity;

                return (
                  <div key={res.id} className="p-2.5 rounded-xl bg-theme-subtle border border-theme-border text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-theme-primary truncate max-w-[190px]">
                        {res.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                        !isAvailable ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {isAvailable ? "Available" : "Full"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-theme-muted font-mono">
                        <span>Load: {res.current_load} / {res.capacity}</span>
                        <span>{fillPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            fillPct > 90 ? "bg-red-500" : fillPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget: 1-Click Interactive Crisis Simulator */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                  Simulate Crisis Scenario (1-Click)
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { step: 1, title: "1. Cyclone Inundation", sub: "Web SOS / Kurla" },
                { step: 2, title: "2. Offline SMS SOS", sub: "Pincode 400050" },
                { step: 3, title: "3. ICU Evacuation", sub: "Mobile ICU unit" },
                { step: 4, title: "4. Slum Roof Blowoff", sub: "Shelter camp routing" },
              ].map(drill => (
                <button
                  key={drill.step}
                  onClick={() => handleRunDrill(drill.step)}
                  disabled={drillExecuting !== null}
                  className="p-2.5 rounded-xl bg-theme-subtle border border-theme-border text-left hover:border-amber-500/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-theme-primary flex items-center justify-between">
                    <span>{drill.title}</span>
                    {drillExecuting === drill.step && <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />}
                  </div>
                  <div className="text-[10px] text-theme-muted mt-0.5">{drill.sub}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. EMERGENCY HOTLINES & MUNICIPAL DESK STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { title: "National Emergency", number: "112", subtitle: "All-in-one Police & Fire", color: "text-red-600 dark:text-red-400" },
          { title: "Ambulance & Trauma", number: "108", subtitle: "24x7 Medical Evac", color: "text-rose-600 dark:text-rose-400" },
          { title: "Disaster Control Room", number: "1077", subtitle: "DDMA Coastal Cell", color: "text-orange-600 dark:text-orange-400" },
          { title: "Monsoon Waterlogging", number: "1916", subtitle: "Municipal Flood Desk", color: "text-cyan-600 dark:text-cyan-400" }
        ].map((item, idx) => (
          <div key={idx} className="bg-theme-card border border-theme-border rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-theme-primary">{item.title}</div>
              <div className="text-[10px] text-theme-muted">{item.subtitle}</div>
              <div className={`font-mono text-base font-extrabold mt-0.5 ${item.color}`}>
                {item.number}
              </div>
            </div>
            <a
              href={`tel:${item.number}`}
              className="p-2 rounded-lg bg-theme-subtle border border-theme-border text-theme-primary hover:bg-red-600 hover:text-white transition-colors"
              title={`Call ${item.number}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
