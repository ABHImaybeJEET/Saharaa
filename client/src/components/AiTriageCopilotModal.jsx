// client/src/components/AiTriageCopilotModal.jsx
import React, { useState } from "react";
import { 
  X, 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  Send, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  Copy, 
  Check, 
  Share2,
  Zap,
  RotateCcw
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function AiTriageCopilotModal({
  isOpen,
  onClose,
  report,
  resources = [],
  allocations = [],
  onOpenOverrideModal,
  onResolveReport
}) {
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen || !report) return null;

  // Active allocation
  const alloc = allocations.find(a => a.report_id === report.id && a.status === "active");
  const assignedResource = alloc ? resources.find(r => r.id === alloc.resource_id) : null;

  // AI Priority Score Calculation (0 to 100)
  const severityPoints = { critical: 50, high: 35, medium: 20, low: 10 }[report.severity] || 20;
  const categoryPoints = { trapped: 25, flood: 20, medical: 25, shelterless: 15, food_water: 10, landslide: 25 }[report.category] || 15;
  const minutesOld = Math.floor((Date.now() - new Date(report.timestamp).getTime()) / 60000);
  const timePoints = Math.min(25, Math.floor(minutesOld * 1.5));
  const priorityScore = Math.min(100, severityPoints + categoryPoints + timePoints);

  // Tactical WhatsApp / SMS Dispatch Order format
  const dispatchOrder = `🚨 *SAHARAA TACTICAL DISPATCH ORDER*
Incident ID: #${report.id.slice(-6)}
Priority Score: ${priorityScore}/100 (${report.severity.toUpperCase()})
Location: ${report.location_name || 'Incident Grid'} (Lat: ${report.lat.toFixed(4)}, Lng: ${report.lng.toFixed(4)})
Category: ${report.category.toUpperCase()}
Details: ${report.description}
Callback: ${report.phone}
Assigned Unit: ${assignedResource ? assignedResource.name : 'UNASSIGNED - IMMEDIATE ACTION REQUIRED'}
Distance / ETA: ${alloc ? `${alloc.distance_km} km / ~${alloc.eta_minutes} mins` : 'N/A'}
Auth: Saharaa Command Mesh`;

  const handleCopyDispatch = () => {
    navigator.clipboard.writeText(dispatchOrder);
    setCopiedMsg(true);
    soundEngine.playUiClick();
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(dispatchOrder);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-theme-primary uppercase tracking-wider font-mono">
                  AI Triage Copilot & Incident Telemetry
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                  AUTONOMOUS REASONING
                </span>
              </div>
              <p className="text-xs text-theme-muted">
                Spatial optimization breakdown, vulnerability scoring & field dispatch orders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Incident Overview Card */}
          <div className="bg-theme-subtle p-4 rounded-xl border border-theme-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                  report.severity === "critical" ? "bg-red-600 text-white" :
                  report.severity === "high" ? "bg-orange-600 text-white" :
                  "bg-amber-600 text-white"
                }`}>
                  {report.severity}
                </span>
                <span className="text-xs font-bold text-theme-primary font-mono">
                  #{report.id.slice(-6)} • {report.category.toUpperCase()}
                </span>
              </div>

              <span className="text-xs text-theme-muted font-mono">
                {report.source === "sms" ? "📱 GSM SMS" : "🌐 Web SOS"} ({minutesOld} min ago)
              </span>
            </div>

            <div className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{report.location_name || `Lat: ${report.lat.toFixed(4)}, Lng: ${report.lng.toFixed(4)}`}</span>
            </div>

            <p className="text-xs text-theme-secondary leading-relaxed bg-theme-card p-3 rounded-lg border border-theme-border font-sans">
              "{report.description}"
            </p>

            <div className="flex items-center space-x-3 text-xs text-theme-muted font-mono pt-1">
              <span>Phone: <strong className="text-theme-primary">{report.phone}</strong></span>
              <span>•</span>
              <span>Coords: <strong className="text-cyan-600 dark:text-cyan-400">{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</strong></span>
            </div>
          </div>

          {/* AI Priority Scoring & Reasoning Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Score Pill */}
            <div className="bg-theme-subtle border border-theme-border p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Risk Index</span>
                </div>
                <div className="text-3xl font-black font-mono text-theme-primary mt-1">
                  {priorityScore}<span className="text-sm font-normal text-theme-muted">/100</span>
                </div>
              </div>
              <div className="text-[10px] text-theme-secondary mt-2 font-mono">
                Severity (+{severityPoints}) | Hazard (+{categoryPoints}) | Aging (+{timePoints})
              </div>
            </div>

            {/* AI Decision Reasoning */}
            <div className="md:col-span-2 bg-theme-subtle border border-theme-border p-3.5 rounded-xl space-y-1 text-xs">
              <div className="text-[10px] uppercase font-mono font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Autonomous Haversine Dispatch Reasoning</span>
              </div>
              <p className="text-theme-secondary text-xs leading-relaxed font-sans">
                {assignedResource ? (
                  <>
                    Selected <strong className="text-theme-primary">{assignedResource.name}</strong> as optimal match: closest eligible base (<strong className="text-cyan-600 dark:text-cyan-400">{alloc.distance_km} km</strong> straight-line), adequate capacity headroom (<strong className="text-emerald-600 dark:text-emerald-400">{assignedResource.capacity - assignedResource.current_load} free slots</strong>), and specialized equipment (<span className="text-theme-secondary">{assignedResource.equipment}</span>).
                  </>
                ) : (
                  <>
                    <strong className="text-amber-600 dark:text-amber-400">Escalated to human queue:</strong> Direct matching radius exceeded or all nearest tactical teams at 100% capacity. Human commander judgment required.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 1-Click WhatsApp / SMS Field Dispatch Order Generator */}
          <div className="p-3.5 rounded-xl bg-theme-subtle border border-theme-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-theme-muted flex items-center gap-1.5">
                <Send className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Field Dispatch Order (Ready to Transmit)</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopyDispatch}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-theme-card hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-primary text-xs font-mono transition-all border border-theme-border"
                >
                  {copiedMsg ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMsg ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <Share2 className="w-3 h-3" />
                  <span>WhatsApp Field Order</span>
                </button>
              </div>
            </div>

            <pre className="text-xs font-mono text-theme-secondary bg-theme-card p-3 rounded-lg border border-theme-border overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {dispatchOrder}
            </pre>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-theme-border">
            <button
              onClick={() => {
                onClose();
                onOpenOverrideModal(report);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              Reassign / Override Unit
            </button>

            {report.status !== "resolved" && (
              <button
                onClick={() => {
                  onResolveReport(report.id);
                  soundEngine.playResolveTone();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Incident Resolved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
