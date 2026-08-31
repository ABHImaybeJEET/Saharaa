// client/src/components/DemoTourModal.jsx
import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Radio, 
  Send, 
  Zap, 
  Building, 
  Compass, 
  Play,
  Pause,
  Info,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  ChevronRight
} from "lucide-react";
import { triggerScenarioStep, broadcastAlert, executeManualOverride } from "../utils/api";
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

  const t = translations ? (translations[lang] || translations.en) : {};

  const STEPS = [
    {
      step: 1,
      badge: "STEP 1: INGESTION",
      title: "Citizen Reports Disaster via Web / Mobile",
      summary: "A citizen stranded by flash flood submits an emergency SOS with coordinates and photos.",
      mechanism: "Backend receives coordinates (19.066, 72.879), validates emergency payload, logs incident ticket, and triggers spatial matching.",
      actionLabel: "Simulate & Drop Citizen SOS",
      execute: async () => {
        await triggerScenarioStep(1);
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 2,
      badge: "STEP 2: SPATIAL MATCH",
      title: "Real-Time Spatial Distance & Capacity Matching",
      summary: "Incident appears on the Authority Map. Platform calculates distance to all rescue units.",
      mechanism: "Haversine formula calculates straight-line distance (1.54 km) and selects NDRF Battalion 05 based on available capacity (18/40).",
      actionLabel: "Inspect Spatial Recommendation",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 3,
      badge: "STEP 3: 1-CLICK DISPATCH",
      title: "Authority 1-Click Dispatch & Sortie Routing",
      summary: "Incident commander deploys recommended unit with a single tap. Live animated route appears.",
      mechanism: "Unit capacity increments (18/40 → 19/40), status updates to 'en_route', ETA is estimated (~6 mins), and animated route is drawn.",
      actionLabel: "Authorize Direct Dispatch",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 4,
      badge: "STEP 4: BROADCAST",
      title: "Authority Issues Official Disaster Red Alert",
      summary: "Authority broadcasts a regional flash flood warning to all citizens and evacuation teams.",
      mechanism: "WebSocket broadcast pushes Red Alert bulletin across web clients and offline SMS mesh with evacuation guidance.",
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
      badge: "STEP 5: CITIZEN EVACUATION",
      title: "Citizen Receives Warning & Finds Nearest Shelter",
      summary: "Citizen portal updates with the Red Alert warning, open shelter capacity, and GPS directions.",
      mechanism: "Citizens view verified shelter bed counts, supply status, emergency helplines, and 1-click Google Maps navigation.",
      actionLabel: "View Citizen Evacuation Match",
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
      }, 4500);
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-theme-primary">
                Interactive Disaster Response Walkthrough
              </h2>
              <p className="text-xs text-theme-muted">
                Step-by-step interactive demonstration of the end-to-end coordination workflow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                setAutoPlaying(!autoPlaying);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                autoPlaying 
                  ? "bg-amber-600 text-white border-amber-500 shadow-sm" 
                  : "bg-theme-card text-theme-secondary border-theme-border hover:border-theme-medium"
              }`}
              title={autoPlaying ? "Pause Auto Play" : "Auto Play 5-Step Demo"}
            >
              {autoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoPlaying ? "Auto: ON" : "Auto-Play"}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                setAutoPlaying(false);
                onClose();
              }}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="p-3 border-b border-theme-border bg-theme-card flex items-center justify-between gap-1 overflow-x-auto">
          {STEPS.map((s) => {
            const isPast = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <button
                key={s.step}
                onClick={() => handleExecuteStep(s.step)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                  isCurrent
                    ? "bg-red-600 text-white shadow-sm"
                    : isPast
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-theme-subtle text-theme-muted hover:text-theme-primary"
                }`}
              >
                <span>{s.step}</span>
                {isPast && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Active Step Details Container */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Step Badge & Title */}
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold tracking-wider uppercase bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {currentStepObj.badge}
            </span>
            <h3 className="text-base font-extrabold text-theme-primary">
              {currentStepObj.title}
            </h3>
            <p className="text-xs text-theme-secondary leading-relaxed font-sans">
              {currentStepObj.summary}
            </p>
          </div>

          {/* Under The Hood Explanation Card */}
          <div className="bg-theme-subtle border border-theme-border rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-mono font-bold text-theme-primary">
              <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>How It Works Under the Hood:</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed font-mono">
              {currentStepObj.mechanism}
            </p>
          </div>

          {/* Step Progress Checklist */}
          <div className="space-y-2 pt-2 border-t border-theme-border">
            <div className="text-[11px] font-bold uppercase font-mono text-theme-muted">
              Workflow Checklist:
            </div>
            <div className="space-y-1.5">
              {STEPS.map(s => (
                <div 
                  key={s.step}
                  onClick={() => handleExecuteStep(s.step)}
                  className={`p-2 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between ${
                    s.step === currentStep
                      ? "bg-red-50 dark:bg-red-950/40 border border-red-400 text-theme-primary font-bold"
                      : s.step < currentStep
                      ? "text-emerald-700 dark:text-emerald-300 line-through opacity-75"
                      : "text-theme-muted opacity-60"
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                  {s.step < currentStep ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : s.step === currentStep ? (
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0"></span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-theme-border bg-theme-subtle flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || running}
            className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-secondary text-xs font-bold transition-all border border-theme-border disabled:opacity-30 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNext}
            disabled={running}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{running ? "EXECUTING..." : currentStep === STEPS.length ? "Finish Tour" : currentStepObj.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
