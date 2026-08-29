// client/src/components/DemoTourModal.jsx
import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Radio, 
  Send, 
  Zap, 
  Building, 
  Compass, 
  Play
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

  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: "1. Citizen Reports Disaster via Web / Mobile",
      desc: "Simulates a citizen dropping an urgent flood report at Milan Subway with photos and high severity.",
      actionLabel: "Simulate Citizen SOS",
      execute: async () => {
        await triggerScenarioStep(1);
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 2,
      title: "2. Real-Time Spatial Recommendation",
      desc: "Incident immediately appears on Authority Command Map. Haversine engine calculates distance and suggests closest available NDRF unit.",
      actionLabel: "Inspect Recommendation",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 3,
      title: "3. Authority 1-Click Dispatch",
      desc: "Authority commander dispatches the recommended boat with a single tap. Load updates and animated dispatch route is drawn.",
      actionLabel: "Proceed to Dispatch",
      execute: async () => {
        if (onSelectView) onSelectView("authority");
      }
    },
    {
      step: 4,
      title: "4. Authority Broadcasts Disaster Alert",
      desc: "Disaster Authority broadcasts an official IMD Red Alert flash flood warning with evacuation directions.",
      actionLabel: "Broadcast Alert",
      execute: async () => {
        await broadcastAlert({
          title: "IMD RED ALERT: Flash Flood Warning in Mithi Basin",
          message: "Water level crossed 5.2ft. Low-lying residents must evacuate to St. Jude Relief Shelter immediately.",
          level: "red",
          area: "Kurla & Santacruz Lowlands"
        });
        if (onSelectView) onSelectView("citizen");
      }
    },
    {
      step: 5,
      title: "5. Citizen Receives Warning & Finds Shelter",
      desc: "Citizen view updates live via Socket.io with the Red Alert warning, nearest open shelters, and free bed availability.",
      actionLabel: "View Citizen Shelter Match",
      execute: async () => {
        if (onSelectView) onSelectView("citizen");
      }
    }
  ];

  const handleStepAction = async () => {
    setRunning(true);
    soundEngine.playDispatchTone();
    try {
      const stepObj = STEPS[currentStep - 1];
      if (stepObj.execute) await stepObj.execute();
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Demo step error:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                PS-05 Core Demo Walkthrough
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step-by-step interactive demonstration of real-time disaster workflow
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Progression */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            {STEPS.map((s) => {
              const isPast = s.step < currentStep;
              const isCurrent = s.step === currentStep;

              return (
                <div 
                  key={s.step}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isCurrent 
                      ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-sm ring-1 ring-cyan-500/40" 
                      : isPast
                      ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={isCurrent ? "text-cyan-700 dark:text-cyan-300" : isPast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                      {s.title}
                    </span>
                    {isPast && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleStepAction}
            disabled={running}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-2"
          >
            <span>{running ? "EXECUTING STEP..." : STEPS[currentStep - 1].actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
