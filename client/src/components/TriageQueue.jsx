// client/src/components/TriageQueue.jsx
import React, { useState } from "react";
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone, 
  Navigation, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ShieldAlert, 
  Send, 
  Zap,
  CheckCheck,
  BrainCircuit,
  Share2
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function TriageQueue({
  reports = [],
  resources = [],
  allocations = [],
  selectedReport,
  onSelectReport,
  onOpenOverrideModal,
  onResolveReport,
  onOpenAiCopilot,
  lang = "en",
  translations
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const t = translations ? (translations[lang] || translations.en) : {
    triage_title: "Live Incident Triage",
    triage_sub: "Auto-Sorted by Risk & Age",
    triage_search_ph: "Search incidents by location, text, phone...",
    tab_all: "All Feed",
    tab_critical: "🔥 Critical",
    tab_escalated: "⚠️ Escalated",
    tab_assigned: "⚡ Assigned",
    tab_resolved: "✓ Resolved",
    btn_override: "Override",
    btn_resolve: "Resolve",
    status_resolved: "Mission Resolved & Closed",
    status_escalated: "ESCALATED - Needs Dispatcher Action"
  };

  const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };

  // Filter & sort reports
  const filteredReports = reports
    .filter(r => {
      if (filter === "critical") return r.severity === "critical" && r.status !== "resolved";
      if (filter === "escalated") return r.status === "escalated";
      if (filter === "assigned") return r.status === "resource_assigned";
      if (filter === "resolved") return r.status === "resolved";
      if (filter === "unresolved") return r.status !== "resolved";
      return true;
    })
    .filter(r => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.description.toLowerCase().includes(q) ||
        (r.location_name && r.location_name.toLowerCase().includes(q)) ||
        r.severity.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    })
    .sort((a, b) => {
      // Unresolved first
      if (a.status === "resolved" && b.status !== "resolved") return 1;
      if (b.status === "resolved" && a.status !== "resolved") return -1;
      // Severity priority
      const sevA = severityOrder[a.severity] || 5;
      const sevB = severityOrder[b.severity] || 5;
      if (sevA !== sevB) return sevA - sevB;
      // Then timestamp (newest first)
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  return (
    <div className="glass-panel flex flex-col h-full rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/70">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              {t.triage_title} ({reports.filter(r => r.status !== 'resolved').length} Active)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {t.triage_sub}
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.triage_search_ph}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-medium no-scrollbar">
            {[
              { id: "all", label: t.tab_all },
              { id: "critical", label: t.tab_critical },
              { id: "escalated", label: t.tab_escalated },
              { id: "assigned", label: t.tab_assigned },
              { id: "resolved", label: t.tab_resolved }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playUiClick();
                  setFilter(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredReports.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">
            <CheckCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            No incidents matching the current filter.
          </div>
        ) : (
          filteredReports.map(report => {
            const isSelected = selectedReport?.id === report.id;
            const isResolved = report.status === "resolved";
            const isEscalated = report.status === "escalated";
            
            // Find active allocation for this report
            const allocation = allocations.find(a => a.report_id === report.id && a.status === "active");
            const allocatedResource = allocation ? resources.find(res => res.id === allocation.resource_id) : null;

            return (
              <div
                key={report.id}
                onClick={() => {
                  soundEngine.playRadarPing();
                  if (onSelectReport) onSelectReport(report);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? "bg-slate-900 border-red-500/80 shadow-lg shadow-red-500/10"
                    : isResolved
                    ? "bg-slate-950/40 border-slate-800/40 opacity-70"
                    : report.severity === "critical"
                    ? "bg-red-950/20 border-red-900/60 hover:border-red-600/60"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Row: Severity, Source, Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                      report.severity === "critical" ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                      report.severity === "high" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" :
                      report.severity === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                      "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    }`}>
                      {report.severity}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 capitalize">
                      {report.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      #{report.id.slice(-6)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Location & Text */}
                <div className="mt-2 text-xs font-semibold text-slate-200">
                  {report.location_name || `Lat: ${report.lat.toFixed(3)}, Lng: ${report.lng.toFixed(3)}`}
                </div>
                <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Allocation / Status Banner */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  {isResolved ? (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-800/40">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        {t.status_resolved}
                      </span>
                    </div>
                  ) : isEscalated ? (
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-700/60">
                      <span className="flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        {t.status_escalated}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenOverrideModal(report);
                        }}
                        className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded font-bold hover:bg-amber-400 text-[10px]"
                      >
                        Assign Unit
                      </button>
                    </div>
                  ) : allocatedResource ? (
                    <div className="flex items-center justify-between text-[11px] bg-cyan-950/30 px-2.5 py-1.5 rounded-lg border border-cyan-800/40">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-cyan-200 font-semibold truncate">
                          {allocatedResource.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-300 shrink-0 ml-2">
                        {allocation.distance_km} km ({allocation.eta_minutes}m ETA)
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <span>Awaiting allocation match...</span>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-[10px] font-mono text-slate-400">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" />
                      {report.phone}
                    </span>
                    {report.source === "sms" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                        SMS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {onOpenAiCopilot && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAiCopilot(report);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1"
                        title="AI Triage Copilot Analysis"
                      >
                        <BrainCircuit className="w-3 h-3" />
                        <span>AI Triage</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOverrideModal(report);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-bold transition-all"
                      title="Manual override / reassign resource"
                    >
                      {t.btn_override}
                    </button>

                    {!isResolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playResolveTone();
                          onResolveReport(report.id);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                        title="Mark resolved"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
