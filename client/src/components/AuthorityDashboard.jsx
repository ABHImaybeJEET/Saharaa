// client/src/components/AuthorityDashboard.jsx
import React, { useState } from "react";
import DisasterMap from "./DisasterMap";
import ExecutiveSummaryHeader from "./ExecutiveSummaryHeader";
import { 
  AlertTriangle, 
  Flame, 
  Building, 
  Zap, 
  CheckCircle, 
  Phone, 
  X, 
  Search, 
  Sparkles, 
  Clock, 
  ChevronRight,
  Navigation,
  Map
} from "lucide-react";
import { executeManualOverride, resolveReport } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

export default function AuthorityDashboard({
  region,
  reports = [],
  resources = [],
  allocations = [],
  imdAlerts = [],
  broadcastAlerts = [],
  metrics = {},
  selectedReport,
  setSelectedReport,
  onOpenBroadcastModal,
  onOpenDeployModal,
  onOpenCitizenModal,
  onOpenSmsModal,
  onOpenSitRep,
  onResolveReport,
  theme = "dark",
  lang = "en",
  translations
}) {
  const [filterType, setFilterType] = useState("all"); // "all" | "critical" | "flood" | "medical" | "shelterless"
  const [searchQuery, setSearchQuery] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const t = translations ? (translations[lang] || translations.en) : {};

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (filterType === "critical" && r.severity !== "critical") return false;
    if (filterType === "flood" && r.category !== "flood") return false;
    if (filterType === "medical" && r.category !== "medical") return false;
    if (filterType === "shelterless" && r.category !== "shelterless") return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLoc = (r.location_name || "").toLowerCase().includes(q);
      const matchDesc = (r.description || "").toLowerCase().includes(q);
      const matchPhone = (r.phone || "").includes(q);
      return matchLoc || matchDesc || matchPhone;
    }
    return true;
  });

  // Calculate nearest recommended resource for selected report
  const getResourceRecommendations = (report) => {
    if (!report) return [];

    return resources.map(res => {
      const R = 6371;
      const dLat = (res.lat - report.lat) * (Math.PI / 180);
      const dLon = (res.lng - report.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(report.lat * (Math.PI / 180)) *
        Math.cos(res.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = parseFloat((R * c).toFixed(2));
      const isAvailable = res.current_load < res.capacity;
      const etaMinutes = Math.max(3, Math.round(dist * 4 + 3));

      // Match suitability score
      let matchScore = 100 - dist * 5;
      if (report.category === "flood" && res.type === "rescue_team") matchScore += 20;
      if (report.category === "shelterless" && res.type === "shelter") matchScore += 25;
      if (report.category === "medical" && res.name.toLowerCase().includes("medical")) matchScore += 25;
      if (!isAvailable) matchScore -= 50;

      return {
        resource: res,
        distanceKm: dist,
        etaMinutes,
        isAvailable,
        matchScore: Math.round(matchScore)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const currentAllocation = selectedReport 
    ? allocations.find(a => a.report_id === selectedReport.id && a.status === "active") 
    : null;
  const currentAssignedResource = currentAllocation 
    ? resources.find(r => r.id === currentAllocation.resource_id) 
    : null;

  const [mobileTab, setMobileTab] = useState("map"); // "map" | "triage"

  const recommendations = selectedReport ? getResourceRecommendations(selectedReport) : [];
  const topRecommended = recommendations.length > 0 ? recommendations[0] : null;

  const handleQuickDispatch = async (resourceId) => {
    if (!selectedReport) return;
    setDispatching(true);
    soundEngine.playRadarPing();

    try {
      await executeManualOverride({
        report_id: selectedReport.id,
        resource_id: resourceId,
        notes: "1-Click Direct Authority Dispatch"
      });
      soundEngine.playDispatchTone();
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-3 min-w-0 font-sans">
      
      {/* 1. Top Executive Disaster Operations Summary Header */}
      <ExecutiveSummaryHeader
        reports={reports}
        resources={resources}
        allocations={allocations}
        metrics={metrics}
        filterType={filterType}
        setFilterType={setFilterType}
        onOpenBroadcastModal={onOpenBroadcastModal}
        onOpenDeployModal={onOpenDeployModal}
        onOpenCitizenModal={onOpenCitizenModal}
        onOpenSitRep={onOpenSitRep}
        lang={lang}
        translations={translations}
      />

      {/* Mobile/Tablet Sub-Tab Switcher (Visible only on < lg screens) */}
      <div className="flex lg:hidden items-center bg-theme-subtle p-1 rounded-xl border border-theme-border text-xs font-bold w-full">
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setMobileTab("map");
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
            mobileTab === "map"
              ? "bg-red-600 text-white shadow-sm font-bold"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Tactical Map</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playUiClick();
            setMobileTab("triage");
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
            mobileTab === "triage"
              ? "bg-red-600 text-white shadow-sm font-bold"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Triage Queue ({filteredReports.length})</span>
        </button>
      </div>

      {/* 2. Main Authority Layout: Unified Split on Desktop, Tabbed on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[500px]">
        
        {/* Centerpiece Map + Direct Incident Dispatch Drawer */}
        <div className={`lg:col-span-8 flex flex-col space-y-3 min-w-0 ${
          mobileTab === "map" ? "flex" : "hidden lg:flex"
        }`}>
          
          {/* Interactive Map (Centerpiece) */}
          <div className="relative w-full">
            <DisasterMap
              region={region}
              reports={reports}
              resources={resources}
              allocations={allocations}
              imdAlerts={imdAlerts}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
              onResolveReport={onResolveReport}
              onOpenOverrideModal={(rep) => setSelectedReport(rep)}
              theme={theme}
              lang={lang}
              translations={translations}
            />
          </div>

          {/* Detail & 1-Click Dispatch Panel (If Incident Selected) */}
          {selectedReport && (
            <div className="w-full bg-theme-card border border-red-500/60 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 transition-colors">
              <div className="flex items-start justify-between pb-3 border-b border-theme-border">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                      INCIDENT #{selectedReport.id.slice(-6)}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                      selectedReport.severity === "critical" ? "bg-red-600 text-white" : "bg-orange-600 text-white"
                    }`}>
                      {selectedReport.severity} {selectedReport.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-theme-primary">
                    {selectedReport.location_name || "Incident Location"}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedReport.status !== "resolved" && (
                    <button
                      onClick={() => onResolveReport(selectedReport.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve Mission</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-subtle transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body: Description + Smart Resource Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
                
                {/* Left Side: Incident Facts */}
                <div className="md:col-span-5 space-y-2 text-xs">
                  <p className="text-theme-secondary text-xs leading-relaxed bg-theme-subtle p-3 rounded-xl border border-theme-border font-sans">
                    "{selectedReport.description}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-theme-muted font-mono">
                    <span className="flex items-center gap-1 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>{selectedReport.phone || "No Callback"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-theme-muted" />
                      <span>{new Date(selectedReport.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>

                  {/* Photo Preview if available */}
                  {selectedReport.photo_url && (
                    <div className="rounded-xl overflow-hidden border border-theme-border max-h-24 shadow-sm">
                      <img 
                        src={selectedReport.photo_url} 
                        alt="Disaster Site Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                {/* Right Side: Core Innovation - Smart Resource Recommendation & 1-Click Dispatch */}
                <div className="md:col-span-7 bg-theme-subtle border border-theme-border rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-theme-border text-xs">
                      <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Recommended Resource (Spatial Match)</span>
                      </span>
                    </div>

                    {/* Candidate Unit Card */}
                    {topRecommended ? (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-theme-primary">
                            {topRecommended.resource.name}
                          </span>
                          <span className="font-mono text-cyan-700 dark:text-cyan-400 font-extrabold text-xs">
                            {topRecommended.distanceKm} km (~{topRecommended.etaMinutes} min)
                          </span>
                        </div>

                        <div className="text-xs text-theme-muted flex items-center space-x-3 font-mono">
                          <span>Type: {topRecommended.resource.type.replace("_", " ")}</span>
                          <span>•</span>
                          <span>Load: {topRecommended.resource.current_load}/{topRecommended.resource.capacity}</span>
                        </div>

                        <p className="text-xs text-theme-muted truncate">
                          Equip: {topRecommended.resource.equipment}
                        </p>
                      </div>
                    ) : (
                      <div className="text-theme-muted text-xs py-2">No available resources in proximity.</div>
                    )}
                  </div>

                  {/* 1-Click Dispatch Button */}
                  {topRecommended && (
                    <button
                      disabled={dispatching || !topRecommended.isAvailable}
                      onClick={() => handleQuickDispatch(topRecommended.resource.id)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
                    >
                      <Zap className="w-4 h-4" />
                      <span>
                        {dispatching ? "DISPATCHING UNIT..." : `DISPATCH ${topRecommended.resource.name.split(" ")[0]} NOW (${topRecommended.distanceKm} KM)`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Incident Triage Column */}
        <div className={`lg:col-span-4 flex flex-col bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-sm transition-colors ${
          mobileTab === "triage" ? "flex" : "hidden lg:flex"
        }`}>
          
          {/* Header & Search Bar */}
          <div className="p-3.5 border-b border-theme-border flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-theme-primary">
              {t.triage_title || "Incident Queue"} ({filteredReports.length})
            </span>
            <div className="relative w-44">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search site, text..."
                className="w-full pl-7 pr-2.5 py-1 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500 font-sans"
              />
            </div>
          </div>

          {/* Incident Cards List with clean non-colliding layout */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 max-h-[420px] lg:max-h-[620px]">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-xs text-theme-muted font-mono">
                No incidents matching criteria.
              </div>
            ) : (
              filteredReports.map(report => {
                const isSelected = selectedReport?.id === report.id;
                const isAssigned = report.status === "resource_assigned";
                const isResolved = report.status === "resolved";

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      soundEngine.playRadarPing();
                      setSelectedReport(report);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col space-y-1.5 ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500/40"
                        : isResolved
                        ? "bg-theme-subtle border-theme-border opacity-60"
                        : "bg-theme-card border-theme-border hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    }`}
                  >
                    {/* Line 1: Severity Badge + Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-[9px] uppercase ${
                        report.severity === "critical" ? "bg-red-600 text-white shadow-sm" :
                        report.severity === "high" ? "bg-orange-600 text-white" :
                        "bg-yellow-600 text-white"
                      }`}>
                        {report.severity}
                      </span>

                      <span className={`text-[10px] font-mono font-bold ${
                        isResolved ? "text-emerald-600 dark:text-emerald-400" :
                        isAssigned ? "text-cyan-600 dark:text-cyan-400" :
                        "text-amber-600 dark:text-amber-400"
                      }`}>
                        {isResolved ? "✓ Done" : isAssigned ? "⚡ Dispatched" : "⚠️ Unassigned"}
                      </span>
                    </div>

                    {/* Line 2: Prominent Location Name */}
                    <h4 className="font-bold text-theme-primary text-xs truncate">
                      {report.location_name || "Incident Location"}
                    </h4>

                    {/* Line 3: Situation Description */}
                    <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed font-sans">
                      {report.description}
                    </p>

                    {/* Line 4: Category + Action */}
                    <div className="flex items-center justify-between text-xs text-theme-muted font-mono pt-1.5 border-t border-theme-border">
                      <span className="font-semibold uppercase">{report.category}</span>
                      <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-0.5">
                        Inspect & Dispatch <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
