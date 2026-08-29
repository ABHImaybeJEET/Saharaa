// client/src/components/CommanderGuideModal.jsx
import React from "react";
import { 
  X, 
  Compass, 
  Zap, 
  Send, 
  MessageSquare, 
  BrainCircuit, 
  Layers, 
  Sliders, 
  CheckCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function CommanderGuideModal({
  isOpen,
  onClose,
  lang = "en",
  translations
}) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;

  const GUIDE_SECTIONS = [
    {
      icon: Send,
      title: t.guide_step1_title || "1. Real-Time Spatial Matching",
      desc: t.guide_step1_desc || "Every citizen SOS calculates Haversine straight-line distance to nearest boats/shelters and draws live dispatch lines on the map.",
      badge: "AUTOMATION",
      color: "border-cyan-400 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300"
    },
    {
      icon: MessageSquare,
      title: t.guide_step2_title || "2. Offline Telephony (Zero-Internet)",
      desc: t.guide_step2_desc || "When cellular data collapses, plain text SMS messages (e.g. FLOOD 400050 CRITICAL...) are geocoded and dispatched seamlessly.",
      badge: "SURVIVABILITY",
      color: "border-purple-400 dark:border-purple-800 text-purple-700 dark:text-purple-300"
    },
    {
      icon: BrainCircuit,
      title: t.guide_step3_title || "3. AI Copilot & 1-Click WhatsApp Orders",
      desc: t.guide_step3_desc || "Inspect any incident to view AI risk scoring (0-100), natural language reasoning, and generate ready-to-send WhatsApp field orders.",
      badge: "AI INTELLIGENCE",
      color: "border-indigo-400 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
    },
    {
      icon: Layers,
      title: t.guide_step4_title || "4. Multi-Layer Map & Inundation Zones",
      desc: t.guide_step4_desc || "Switch between Google Street, Satellite Recon, and Terrain Topo maps with live Mithi river flood hazard polygons.",
      badge: "SITUATIONAL AWARENESS",
      color: "border-emerald-400 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-theme-primary uppercase tracking-wider font-mono">
                {t.guide_modal_title || "Saharaa Command Grid: Quick Guide"}
              </h2>
              <p className="text-xs text-theme-muted">
                {t.guide_modal_sub || "60-Second walkthrough for dispatchers and judges"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GUIDE_SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border bg-theme-subtle flex flex-col justify-between space-y-2 ${sec.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-theme-border">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="font-bold text-xs">{sec.title}</span>
                      </div>
                    </div>
                    <p className="text-xs text-theme-secondary leading-relaxed mt-2 font-sans">
                      {sec.desc}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85">
                    ● {sec.badge}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Demo Script Suggestion */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border space-y-1.5 text-xs font-mono">
            <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended 30-Second Tour:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-theme-secondary leading-relaxed font-sans">
              <li>Click <strong>"+ SOS"</strong> to drop a Critical Flood emergency on the map.</li>
              <li>Use <strong>"1-Click Demo Tour"</strong> in the top header to run through the full end-to-end incident lifecycle.</li>
              <li>Inspect any incident to view AI risk scoring (0-100) and 1-Click Dispatch.</li>
            </ol>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/30"
          >
            Got It, Launch Command Center
          </button>
        </div>
      </div>
    </div>
  );
}
