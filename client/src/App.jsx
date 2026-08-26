// client/src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MetricCards from "./components/MetricCards";
import DisasterMap from "./components/DisasterMap";
import TriageQueue from "./components/TriageQueue";
import ResourcePanel from "./components/ResourcePanel";
import CitizenReportModal from "./components/CitizenReportModal";
import SmsSimulatorModal from "./components/SmsSimulatorModal";
import ManualOverrideModal from "./components/ManualOverrideModal";
import DeployResourceModal from "./components/DeployResourceModal";
import AuditFeed from "./components/AuditFeed";
import { socket, fetchState, resetDemoState, triggerScenarioStep, resolveReport } from "./utils/api";
import { AlertTriangle, Bell, Sparkles, X, Radio, ArrowRight, Map, Send, MessageSquare, Building } from "lucide-react";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState("map"); // "map" | "report" | "gsm" | "resources"
  const [region, setRegion] = useState(null);
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [imdAlerts, setImdAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState({});

  // UI state & layer toggles
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [allocLinesEnabled, setAllocLinesEnabled] = useState(true);
  const [activeScenarioStep, setActiveScenarioStep] = useState(null);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [overrideModalReport, setOverrideModalReport] = useState(null);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // Live Toast Notification
  const [toast, setToast] = useState(null);

  // Initialize socket & fetch state
  useEffect(() => {
    fetchState()
      .then(data => {
        setRegion(data.region);
        setReports(data.reports || []);
        setResources(data.resources || []);
        setAllocations(data.allocations || []);
        setImdAlerts(data.imdAlerts || []);
        setAuditLogs(data.auditLogs || []);
        setMetrics(data.metrics || {});
      })
      .catch(err => console.error("Initial state load error:", err));

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("initial_state", (data) => {
      setRegion(data.region);
      setReports(data.reports || []);
      setResources(data.resources || []);
      setAllocations(data.allocations || []);
      setImdAlerts(data.imdAlerts || []);
      setAuditLogs(data.auditLogs || []);
      setMetrics(data.metrics || {});
    });

    socket.on("state_update", (payload) => {
      if (payload.data) {
        setReports(payload.data.reports || []);
        setResources(payload.data.resources || []);
        setAllocations(payload.data.allocations || []);
        setAuditLogs(payload.data.auditLogs || []);
        setMetrics(payload.data.metrics || {});
      }

      if (payload.type === "report_created" || payload.type === "sms_report_created") {
        const rep = payload.latestReport;
        const alloc = payload.allocationResult;
        setToast({
          title: `New ${rep.severity.toUpperCase()} ${rep.category.toUpperCase()} Incident`,
          message: alloc?.success 
            ? `Auto-dispatched to ${alloc.resource?.name} (${alloc.allocation?.distance_km} km)`
            : `Could not auto-assign: ${alloc?.reason || 'Escalated to human queue'}`,
          type: alloc?.success ? "match" : "escalate"
        });
      } else if (payload.type === "allocation_overridden") {
        setToast({
          title: "Dispatcher Override Applied",
          message: "Unit re-routed successfully.",
          type: "override"
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("initial_state");
      socket.off("state_update");
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleMapClick = (latlng) => {
    setClickedCoords(latlng);
    setIsCitizenModalOpen(true);
  };

  const handleTriggerScenario = async (step) => {
    setActiveScenarioStep(step);
    try {
      await triggerScenarioStep(step);
    } catch (err) {
      console.error("Scenario trigger error:", err);
    }
  };

  const handleResetDemo = async () => {
    setActiveScenarioStep(null);
    setSelectedReport(null);
    try {
      await resetDemoState();
      setToast({
        title: "Simulation Grid Reset",
        message: "Restored initial seed state and tactical units.",
        type: "info"
      });
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await resolveReport(reportId);
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-tactical-950 text-slate-100 font-sans">
      {/* Top Tactical Navigation Bar */}
      <Navbar
        isConnected={isConnected}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCitizenReport={() => {
          setClickedCoords(null);
          setIsCitizenModalOpen(true);
        }}
        onOpenSmsSimulator={() => setIsSmsModalOpen(true)}
        onResetDemo={handleResetDemo}
        onTriggerScenario={handleTriggerScenario}
        activeScenarioStep={activeScenarioStep}
        heatmapEnabled={heatmapEnabled}
        setHeatmapEnabled={setHeatmapEnabled}
        alertsEnabled={alertsEnabled}
        setAlertsEnabled={setAlertsEnabled}
        allocLinesEnabled={allocLinesEnabled}
        setAllocLinesEnabled={setAllocLinesEnabled}
      />

      {/* Main Workspace */}
      <main className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 max-w-[1700px] w-full mx-auto flex flex-col">
        
        {/* Metric Cards Row */}
        <MetricCards
          metrics={metrics}
          totalReports={reports.length}
          activeAllocations={allocations.filter(a => a.status === 'active').length}
        />

        {/* VIEW 1: Full Tactical Command Center (Map + Incident Triage + Units) */}
        {currentView === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[620px] animate-in fade-in duration-200">
            
            {/* Left: Triage Feed (4 cols) */}
            <div className="lg:col-span-4 h-[600px] lg:h-full">
              <TriageQueue
                reports={reports}
                resources={resources}
                allocations={allocations}
                selectedReport={selectedReport}
                onSelectReport={setSelectedReport}
                onOpenOverrideModal={setOverrideModalReport}
                onResolveReport={handleResolve}
              />
            </div>

            {/* Center: Interactive Map (5 cols) */}
            <div className="lg:col-span-5 h-[500px] lg:h-full flex flex-col">
              <DisasterMap
                region={region}
                reports={reports}
                resources={resources}
                allocations={allocations}
                imdAlerts={imdAlerts}
                heatmapEnabled={heatmapEnabled}
                alertsEnabled={alertsEnabled}
                allocLinesEnabled={allocLinesEnabled}
                selectedReport={selectedReport}
                onSelectReport={setSelectedReport}
                onMapClick={handleMapClick}
                onResolveReport={handleResolve}
                onOpenOverrideModal={setOverrideModalReport}
              />
            </div>

            {/* Right: Relief Resources (3 cols) */}
            <div className="lg:col-span-3 h-[500px] lg:h-full">
              <ResourcePanel
                resources={resources}
                allocations={allocations}
                onOpenDeployModal={() => {
                  setClickedCoords(null);
                  setIsDeployModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Dedicated Citizen SOS Portal (No background map) */}
        {currentView === "report" && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-red-500" />
                  <span>Citizen Emergency SOS Portal</span>
                </h2>
                <button
                  onClick={() => setCurrentView("map")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-tactical-800 hover:bg-tactical-700 text-slate-300 font-semibold"
                >
                  Return to Map
                </button>
              </div>

              {/* Render Citizen Modal in inline mode */}
              <div className="bg-tactical-900 border border-tactical-700 rounded-2xl shadow-2xl p-4">
                <CitizenReportModal
                  isOpen={true}
                  onClose={() => setCurrentView("map")}
                  onSuccess={() => setCurrentView("map")}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Dedicated GSM Ingestion Gateway (No background map) */}
        {currentView === "gsm" && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span>Offline GSM / SMS Ingestion Hub</span>
                </h2>
                <button
                  onClick={() => setCurrentView("map")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-tactical-800 hover:bg-tactical-700 text-slate-300 font-semibold"
                >
                  Return to Map
                </button>
              </div>

              <div className="bg-tactical-900 border border-tactical-700 rounded-2xl shadow-2xl p-4">
                <SmsSimulatorModal
                  isOpen={true}
                  onClose={() => setCurrentView("map")}
                  onSuccess={() => setCurrentView("map")}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Dedicated Relief Units Grid (No background map) */}
        {currentView === "resources" && (
          <div className="flex-1 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <span>Emergency Units & Relief Camps Grid</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDeployModalOpen(true)}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  + Deploy New Unit
                </button>
                <button
                  onClick={() => setCurrentView("map")}
                  className="text-xs px-3 py-1.5 rounded-xl bg-tactical-800 hover:bg-tactical-700 text-slate-300 font-semibold"
                >
                  Return to Map
                </button>
              </div>
            </div>

            <div className="h-[650px]">
              <ResourcePanel
                resources={resources}
                allocations={allocations}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Real-time Decision Audit Stream */}
        <AuditFeed logs={auditLogs} />
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[10000] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 max-w-sm backdrop-blur-xl ${
            toast.type === "match" ? "bg-cyan-950/90 border-cyan-500 text-cyan-100 shadow-cyan-500/20" :
            toast.type === "escalate" ? "bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-500/20" :
            toast.type === "override" ? "bg-indigo-950/90 border-indigo-500 text-indigo-100 shadow-indigo-500/20" :
            "bg-tactical-900/95 border-tactical-700 text-slate-100"
          }`}>
            <div className="p-1 rounded-lg bg-black/30 mt-0.5">
              {toast.type === "match" ? <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> :
               toast.type === "escalate" ? <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" /> :
               <Sparkles className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-white tracking-wide">{toast.title}</div>
              <div className="mt-0.5 opacity-90 text-[11px] leading-tight">{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Popups & Modals (z-[9999]) */}
      <CitizenReportModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        initialCoords={clickedCoords}
      />

      <SmsSimulatorModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />

      <ManualOverrideModal
        isOpen={!!overrideModalReport}
        onClose={() => setOverrideModalReport(null)}
        report={overrideModalReport}
        resources={resources}
        allocations={allocations}
      />

      <DeployResourceModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        initialCoords={clickedCoords}
      />
    </div>
  );
}
