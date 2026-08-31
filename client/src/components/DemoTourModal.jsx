// client/src/components/DemoTourModal.jsx
import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  Info, 
  MapPin, 
  Eye,
  Minimize2,
  Maximize2,
  Check,
  Compass,
  Navigation
} from "lucide-react";
import { triggerScenarioStep, broadcastAlert } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

export default function DemoTourModal({
  isOpen,
  onClose,
  onSelectView,
  onSelectReportId,
  lang = "en",
  translations
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [running, setRunning] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const t = translations ? (translations[lang] || translations.en) : {};

  const STEPS = [
    {
      step: 1,
      badge: "STEP 1: INGESTION",
      title: "Citizen Reports Disaster via Web / Mobile",
      summary: "A citizen stranded by flash flood at Milan Subway submits an emergency SOS with coordinates.",
      whatToLookFor: "👉 Look at the Map: A new red pulsating incident pin appears near Milan Subway, and the incident counter updates in the top HUD.",
      actionLabel: "Drop Live Citizen SOS",
      execute: async () => {
        await triggerScenarioStep(1);
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 2,
      badge: "STEP 2: SPATIAL MATCH",
      title: "Haversine Distance & Resource Recommendation",
      summary: "The platform calculates straight-line distance (1.54 km) to all active boats and ambulances.",
      whatToLookFor: "👉 Look at the Incident Queue (Right): NDRF Battalion 05 is matched with 1.54 km distance and ~8 min ETA based on free capacity (18/40).",
      actionLabel: "Inspect Spatial Recommendation",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 3,
      badge: "STEP 3: 1-CLICK DISPATCH",
      title: "Authority 1-Click Dispatch & Sortie Routing",
      summary: "Commander dispatches the unit. Live animated dashed route connects the rescue boat to the flood site.",
      whatToLookFor: "👉 Look at the Map & Queue: An animated cyan transit line is drawn between the boat and the citizen. The unit load increments to 19/40.",
      actionLabel: "Authorize Direct Dispatch",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 4,
      badge: "STEP 4: BROADCAST",
      title: "Authority Broadcasts Disaster Red Alert",
      summary: "Authority pushes an official flash flood emergency bulletin across WebSocket and SMS channels.",
      whatToLookFor: "👉 Look at the Top Banner & Citizen View: Red Alert emergency warning is pushed to all connected clients and offline SMS gateways.",
      actionLabel: "Broadcast Disaster Red Alert",
      execute: async () => {
        await broadcastAlert({
          title: "IMD RED ALERT: Flash Flood Warning in Mithi Basin",
          message: "Water level crossed 5.2ft danger mark. Low-lying residents must evacuate to St. Jude Relief Shelter immediately.",
          level: "red",
          area: "Kurla & Santacruz Lowlands"
        });
        if (onSelectView) onSelectView("citizen");
      }
    },
    {
      step: 5,
      badge: "STEP 5: EVACUATION",
      title: "Citizen Receives Warning & Finds Nearest Shelter",
      summary: "Citizen view shows the emergency bulletin, open relief camps, verified bed counts, and Google Maps directions.",
      whatToLookFor: "👉 Look at the Citizen Portal: The 'Shelters' tab highlights St. Jude Relief Shelter with verified bed availability and 1-click turn-by-turn navigation.",
      actionLabel: "View Citizen Shelter Match",
      execute: async () => {
        if (onSelectView) onSelectView("citizen");
      }
    }
  ];

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (autoPlaying && isOpen) {
      timer = setTimeout(() => {
        if (currentStep < STEPS.length) {
          handleExecuteStep(currentStep + 1);
        } else {
          setAutoPlaying(false);
        }
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [autoPlaying, currentStep, isOpen]);

  if (!isOpen) return null;

  const currentStepObj = STEPS[currentStep - 1];

  const handleExecuteStep = async (stepNum) => {
    setRunning(true);
    soundEngine.playDispatchTone();
    try {
      const stepObj = STEPS[stepNum - 1];
      if (stepObj.execute) await stepObj.execute();
      setCurrentStep(stepNum);
    } catch (err) {
      console.error("Demo step execution error:", err);
    } finally {
      setRunning(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      handleExecuteStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      handleExecuteStep(currentStep - 1);
    }
  };

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-3 duration-200">
        <div className="bg-theme-card text-theme-primary border-2 border-red-500 rounded-2xl shadow-2xl p-2.5 flex items-center space-x-2.5 backdrop-blur-xl">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
            {currentStep}/5
          </div>
          <div className="text-xs font-bold truncate max-w-[200px]">
            {currentStepObj.title}
          </div>
          <button
            onClick={() => handleNext()}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            title="Next Step"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-theme-subtle hover:bg-slate-200 dark:hover:bg-slate-800 text-theme-primary"
            title="Expand Guide"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary"
            title="Close Guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Floating Docked Guide Drawer (Non-blocking bottom-right on desktop, bottom sheet on mobile)
  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-[9999] w-full max-w-full sm:max-w-md md:max-w-lg px-2 sm:px-0 animate-in slide-in-from-bottom-5 duration-300 font-sans pointer-events-auto">
      <div className="bg-theme-card text-theme-primary border-2 border-red-500/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        
        {/* Header */}
        <div className="p-3 bg-theme-subtle border-b border-theme-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-theme-primary">
                  Interactive Crisis Guide
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-mono font-bold">
                  {currentStep} / {STEPS.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                setAutoPlaying(!autoPlaying);
              }}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                autoPlaying 
                  ? "bg-amber-600 text-white border-amber-500 shadow-sm" 
                  : "bg-theme-card text-theme-secondary border-theme-border"
              }`}
              title={autoPlaying ? "Pause Auto Guide" : "Auto Guide"}
            >
              {autoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{autoPlaying ? "Auto" : "Play"}</span>
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Minimize Guide (Keep watching screen)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                setAutoPlaying(false);
                onClose();
              }}
              className="p-1 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Close Guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="p-2 border-b border-theme-border bg-theme-card flex items-center justify-between gap-1">
          {STEPS.map((s) => {
            const isPast = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <button
                key={s.step}
                onClick={() => handleExecuteStep(s.step)}
                className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                  isCurrent
                    ? "bg-red-600 text-white shadow-sm"
                    : isPast
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-theme-subtle text-theme-muted hover:text-theme-primary"
                }`}
                title={s.title}
              >
                <span>{s.step}</span>
                {isPast && <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        <div className="p-3.5 space-y-2.5 max-h-[300px] overflow-y-auto">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                {currentStepObj.badge}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-theme-primary mt-1">
              {currentStepObj.title}
            </h3>
            <p className="text-xs text-theme-secondary mt-0.5 leading-snug">
              {currentStepObj.summary}
            </p>
          </div>

          {/* Visual Pointer Callout Box */}
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-sans font-medium flex items-start space-x-2">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>{currentStepObj.whatToLookFor}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3 border-t border-theme-border bg-theme-subtle flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || running}
            className="px-2.5 py-1.5 rounded-xl bg-theme-card hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-secondary text-xs font-bold transition-all border border-theme-border disabled:opacity-30 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNext}
            disabled={running}
            className="flex-1 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{running ? "EXECUTING..." : currentStep === STEPS.length ? "Finish Tour" : currentStepObj.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
