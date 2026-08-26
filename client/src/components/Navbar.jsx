// client/src/components/Navbar.jsx
import React, { useState } from "react";
import { 
  ShieldAlert, 
  Radio, 
  Send, 
  MessageSquare, 
  RotateCcw, 
  Layers, 
  Flame, 
  Sparkles, 
  ChevronDown, 
  Map, 
  Building, 
  Compass
} from "lucide-react";

export default function Navbar({
  isConnected,
  currentView = "map",
  setCurrentView,
  onOpenCitizenReport,
  onOpenSmsSimulator,
  onResetDemo,
  onTriggerScenario,
  activeScenarioStep,
  heatmapEnabled,
  setHeatmapEnabled,
  alertsEnabled,
  setAlertsEnabled,
  allocLinesEnabled,
  setAllocLinesEnabled
}) {
  const [drillMenuOpen, setDrillMenuOpen] = useState(false);

  return (
    <header className="bg-tactical-900/95 border-b border-tactical-700/50 backdrop-blur-md sticky top-0 z-[1000] px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3 max-w-[1700px] mx-auto">
        
        {/* Brand & Connection Badge */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => setCurrentView("map")}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 shadow-md shadow-red-600/20 text-white font-bold cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 
                onClick={() => setCurrentView("map")}
                className="text-base font-extrabold tracking-wider text-white cursor-pointer"
              >
                SAHARAA <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/80 text-red-400 border border-red-800/60 font-mono font-bold">COMMAND</span>
              </h1>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={isConnected ? "text-emerald-300" : "text-rose-400"}>
                  {isConnected ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Geospatial Crisis Coordination & Resource Allocation Mesh
            </p>
          </div>
        </div>

        {/* Center: Main View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-tactical-950/90 p-1 rounded-xl border border-tactical-800/80 text-xs font-semibold">
          <button
            onClick={() => setCurrentView("map")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === "map"
                ? "bg-red-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Tactical Map</span>
          </button>

          <button
            onClick={() => setCurrentView("report")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === "report"
                ? "bg-red-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Citizen SOS</span>
          </button>

          <button
            onClick={() => setCurrentView("gsm")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === "gsm"
                ? "bg-purple-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>GSM Ingestion</span>
          </button>

          <button
            onClick={() => setCurrentView("resources")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === "resources"
                ? "bg-cyan-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Relief Units</span>
          </button>
        </div>

        {/* Right: Map Layers & Scenario Drills */}
        <div className="flex items-center space-x-2">
          
          {/* Map Layer Toggles (Visible in map view) */}
          {currentView === "map" && (
            <div className="hidden xl:flex items-center space-x-1 bg-tactical-950/80 p-1 rounded-xl border border-tactical-800/80 text-xs">
              <button
                onClick={() => setAllocLinesEnabled(!allocLinesEnabled)}
                className={`p-1.5 rounded-lg transition-all ${
                  allocLinesEnabled
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle live dispatch vectors"
              >
                <Radio className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`p-1.5 rounded-lg transition-all ${
                  heatmapEnabled
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle severity heatmap"
              >
                <Flame className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`p-1.5 rounded-lg transition-all ${
                  alertsEnabled
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle IMD hazard polygons"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tactical Scenarios Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDrillMenuOpen(!drillMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-tactical-800 hover:bg-tactical-700 text-slate-200 border border-tactical-700 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tactical Drills</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {drillMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-tactical-900 border border-tactical-700 shadow-2xl p-2 z-[1100] animate-in fade-in zoom-in-95 font-sans"
                onMouseLeave={() => setDrillMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-tactical-800 mb-1">
                  Disaster Response Drills
                </div>
                
                <button
                  onClick={() => {
                    setCurrentView("map");
                    onTriggerScenario(1);
                    setDrillMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex flex-col ${
                    activeScenarioStep === 1 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "text-slate-300 hover:bg-tactical-800"
                  }`}
                >
                  <span className="font-semibold text-white">1. Flash Flood Surge</span>
                  <span className="text-[10px] text-slate-400">Triggers web SOS & automatic boat dispatch</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView("map");
                    onTriggerScenario(2);
                    setDrillMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex flex-col mt-1 ${
                    activeScenarioStep === 2 ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "text-slate-300 hover:bg-tactical-800"
                  }`}
                >
                  <span className="font-semibold text-white">2. Offline GSM / SMS SOS</span>
                  <span className="text-[10px] text-slate-400">Ingests feature-phone text from cutoff zone</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView("map");
                    onTriggerScenario(3);
                    setDrillMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex flex-col mt-1 ${
                    activeScenarioStep === 3 ? "bg-red-500/20 text-red-300 border border-red-500/40 font-bold" : "text-slate-300 hover:bg-tactical-800"
                  }`}
                >
                  <span className="font-semibold text-white">3. Grid Saturation Crisis</span>
                  <span className="text-[10px] text-slate-400">Tests capacity limits & triggers escalation</span>
                </button>

                <div className="border-t border-tactical-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onResetDemo();
                      setDrillMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-tactical-800 flex items-center space-x-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Scenario Grid</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick SOS Trigger */}
          <button
            onClick={onOpenCitizenReport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+ SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
