// client/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Radio, 
  Send, 
  MessageSquare, 
  RotateCcw, 
  Layers, 
  Flame, 
  Sparkles,
  ChevronDown
} from "lucide-react";

export default function Navbar({
  isConnected,
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
    <header className="bg-tactical-900/95 border-b border-tactical-700/50 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-4 max-w-[1700px] mx-auto">
        
        {/* Brand & Connection Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 shadow-md shadow-red-600/20 text-white font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-wider text-white">
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

        {/* Center: Map Layers */}
        <div className="hidden md:flex items-center space-x-1 bg-tactical-950/80 p-1 rounded-xl border border-tactical-800/80 text-xs">
          <button
            onClick={() => setAllocLinesEnabled(!allocLinesEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              allocLinesEnabled
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle live dispatch lines"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Dispatch Vectors</span>
          </button>

          <button
            onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              heatmapEnabled
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle severity density heatmap"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              alertsEnabled
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle IMD alert hazard zones"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>IMD Hazards</span>
          </button>
        </div>

        {/* Right: Actions & Tactical Drills */}
        <div className="flex items-center space-x-2">
          
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
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-tactical-900 border border-tactical-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-sans"
                onMouseLeave={() => setDrillMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-tactical-800 mb-1">
                  Disaster Response Drills
                </div>
                
                <button
                  onClick={() => {
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

          {/* SMS / GSM Button */}
          <button
            onClick={onOpenSmsSimulator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-800/60 text-xs font-semibold transition-all"
            title="Open Offline GSM / SMS Intake Terminal"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">GSM / SMS SOS</span>
          </button>

          {/* Citizen Report SOS Button */}
          <button
            onClick={onOpenCitizenReport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
}
