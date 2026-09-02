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
  Cpu,
  Target,
  Truck,
  HeartPulse,
  Award,
  Globe
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
    floodRiskIndex: 88,
    estimatedProtected: 1420
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
        floodRiskIndex: Math.max(80, Math.min(96, prev.floodRiskIndex + (Math.floor(Math.random() * 3) - 1))),
        estimatedProtected: prev.estimatedProtected + (Math.random() > 0.6 ? 2 : 0)
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

  const rescueTeams = resources.filter(r => r.type === "rescue_team");
  const shelters = resources.filter(r => r.type === "shelter");
  const supplyHubs = resources.filter(r => r.type === "supply_stock");

  // Zone Risk Status
  const ZONES = [
    { name: "Zone 1: Kurla Mithi Basin", risk: "CRITICAL FLOOD", level: "critical", waterLevel: "5.2 ft", status: "Sluice gates active" },
    { name: "Zone 2: Bandra - BKC Corridor", risk: "HIGH INUNDATION", level: "high", waterLevel: "3.8 ft", status: "Drainage pumps running" },
    { name: "Zone 3: Milan Subway & Santacruz", risk: "SUBWAY SUBMERGED", level: "critical", waterLevel: "6.0 ft", status: "Traffic diverted" },
    { name: "Zone 4: Andheri East MIDC", risk: "GALE DAMAGE", level: "medium", waterLevel: "2.1 ft", status: "Shelter camp active" },
    { name: "Zone 5: Thane Creek Coastal Belt", risk: "HIGH TIDE SURGE", level: "high", waterLevel: "4.8 ft", status: "Coastal alert" }
  ];

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
      
      {/* 1. TOP STRATEGIC MISSION CONTROL HUD */}
      <div className="w-full bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Row 1: Brand, Live Indicators & Navigation Jump Links */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-theme-border">
          
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-theme-primary tracking-tight font-sans">
                  SAHARAA STRATEGIC COMMAND & IMPACT OVERVIEW
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
                <span>Multi-Agency Spatial Dispatch & Strategic Humanitarian Operations</span>
                <span>•</span>
                <span className="font-mono text-theme-secondary font-semibold">{currentTime} IST</span>
              </p>
            </div>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onSelectMode("authority");
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Launch Tactical Map</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onSelectMode("citizen");
              }}
              className="px-3.5 py-2 rounded-xl bg-theme-subtle hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme-border text-theme-primary font-bold text-xs flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
              <span>Citizen SOS Portal</span>
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

        {/* Row 2: 4 High-Impact Strategic Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Card 1: Lives Protected & Evacuated */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Citizens Protected
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {telemetry.estimatedProtected.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                + Evacuated
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-secondary font-mono pt-1 border-t border-theme-border">
              <span>Coverage: <strong className="text-theme-primary">99.4%</strong></span>
              <span>Zero-Data: <strong className="text-purple-600 dark:text-purple-400">GSM Active</strong></span>
            </div>
          </div>

          {/* Card 2: Spatial Match Latency & Sorties */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Dispatch Latency
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                0.04s
              </span>
              <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold font-mono">
                Haversine Math
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-secondary font-mono pt-1 border-t border-theme-border">
              <span>Sorties: <strong className="text-theme-primary">{activeAllocations.length} Active</strong></span>
              <span>Avg ETA: <strong className="text-cyan-600 dark:text-cyan-400">~6m</strong></span>
            </div>
          </div>

          {/* Card 3: Relief Camp Bed Availability */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-muted font-mono">
                Relief Headroom
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {freeSlots}
              </span>
              <span className="text-xs text-theme-muted">
                Free Slots ({100 - occupancyPct}% Avail)
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    occupancyPct > 90 ? "bg-red-500" : occupancyPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-theme-muted">
                <span>Load: {totalLoad}/{totalCapacity}</span>
                <span>{shelters.length} Shelters Verified</span>
              </div>
            </div>
          </div>

          {/* Card 4: Environmental Flood Risk Index */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>IMD Risk Index</span>
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
                Hazard: {telemetry.floodRiskIndex}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-secondary font-mono pt-1 border-t border-theme-border">
              <span>Tide: <strong className="text-theme-primary">{telemetry.tideHeight}m</strong></span>
              <span>Gusts: <strong className="text-amber-600 dark:text-amber-400">{telemetry.windGust} km/h</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL IMPACT MATRIX & BASIN RISK ZONES (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 cols): Coastal Basin Risk Zones & Choke Points */}
        <div className="lg:col-span-7 bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                Metro Basin Inundation Zones & Critical Choke Points
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-theme-muted uppercase">
              Real-Time Hydrotelemetry
            </span>
          </div>

          <div className="space-y-2">
            {ZONES.map((zone, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-theme-subtle border border-theme-border hover:border-theme-medium transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-theme-primary truncate">
                      {zone.name}
                    </span>
                    <span className={`px-2 py-0.2 rounded font-mono font-black text-[9px] uppercase ${
                      zone.level === "critical" ? "bg-red-600 text-white" :
                      zone.level === "high" ? "bg-orange-600 text-white" : "bg-amber-600 text-white"
                    }`}>
                      {zone.risk}
                    </span>
                  </div>
                  <div className="text-[11px] text-theme-muted font-mono">
                    Water Level: <strong className="text-theme-primary">{zone.waterLevel}</strong> • {zone.status}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onSelectMode("authority");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-theme-card border border-theme-border hover:border-red-500 text-theme-primary text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Focus Map</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Multi-Agency Resource Readiness Radar */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Agency Matrix */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                  Multi-Agency Deployment Strength
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                100% OPERATIONAL
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { agency: "NDRF 5th Battalion", type: "Inflatable Zodiac Boats & High-Water Gear", units: "3 Boats", load: "18 / 40", color: "bg-red-500" },
                { agency: "SDRF Evacuation Unit", type: "Rigid Hull Boats & Drone Recon", units: "2 Boats", load: "10 / 25", color: "bg-cyan-500" },
                { agency: "BMC Disaster Relief Camps", type: "RO Water Plants & Medical Triage Halls", units: "2 Camps", load: "670 / 850", color: "bg-amber-500" },
                { agency: "Trauma ICU Mobile Squad", type: "Oxygen Defibrillator Ambulances", units: "1 Squad", load: "14 / 15", color: "bg-rose-500" },
              ].map((ag, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-theme-subtle border border-theme-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-theme-primary">{ag.agency}</span>
                    <span className="font-mono text-[10px] text-theme-muted font-bold">{ag.load} Capacity</span>
                  </div>
                  <div className="text-[11px] text-theme-muted">{ag.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Crisis Drill Simulation */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm sm:text-base font-extrabold text-theme-primary">
                  Rapid Crisis Simulation Injector
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { step: 1, title: "1. Cyclone Flood", sub: "Web SOS Report" },
                { step: 2, title: "2. Offline SMS SOS", sub: "Bandra PIN 400050" },
                { step: 3, title: "3. ICU Oxygen SOS", sub: "Mobile ICU unit" },
                { step: 4, title: "4. Slum Roof Blowoff", sub: "Shelter routing" },
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

      {/* 3. EMERGENCY HELPLINES DOCK */}
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
