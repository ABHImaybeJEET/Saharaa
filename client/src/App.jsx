// client/src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthorityDashboard from "./components/AuthorityDashboard";
import CitizenPortal from "./components/CitizenPortal";
import BroadcastAlertModal from "./components/BroadcastAlertModal";
import DemoTourModal from "./components/DemoTourModal";
import CitizenReportModal from "./components/CitizenReportModal";
import SmsSimulatorModal from "./components/SmsSimulatorModal";
import SitRepModal from "./components/SitRepModal";
import DeployResourceModal from "./components/DeployResourceModal";
import { socket, fetchState, resetDemoState, resolveReport } from "./utils/api";
import { soundEngine } from "./utils/soundEffects";
import { TRANSLATIONS } from "./utils/translations";
import { 
  AlertTriangle, 
  Sparkles, 
  X, 
  Radio, 
  Zap, 
  CheckCircle,
  Phone
} from "lucide-react";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentMode, setCurrentMode] = useState("authority"); // "authority" | "citizen"
  const [lang, setLang] = useState(() => localStorage.getItem("saharaa_lang") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("saharaa_theme") || "dark");

  const [region, setRegion] = useState(null);
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [imdAlerts, setImdAlerts] = useState([]);
  const [broadcastAlerts, setBroadcastAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState({});

  // Modals & UI States
  const [selectedReport, setSelectedReport] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Live Toast Notification
  const [toast, setToast] = useState(null);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem("saharaa_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // Language Sync
  useEffect(() => {
    localStorage.setItem("saharaa_lang", lang);
  }, [lang]);

  // Initial State Fetch & Real-Time Socket Connection
  useEffect(() => {
    fetchState()
      .then(data => {
        setRegion(data.region);
        setReports(data.reports || []);
        setResources(data.resources || []);
        setAllocations(data.allocations || []);
        setBroadcastAlerts(data.broadcastAlerts || []);
        setImdAlerts(data.imdAlerts || []);
        setAuditLogs(data.auditLogs || []);
        setMetrics(data.metrics || {});
      })
      .catch(err => console.error("Initial load error:", err));

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("initial_state", (data) => {
      setRegion(data.region);
      setReports(data.reports || []);
      setResources(data.resources || []);
      setAllocations(data.allocations || []);
      setBroadcastAlerts(data.broadcastAlerts || []);
      setImdAlerts(data.imdAlerts || []);
      setAuditLogs(data.auditLogs || []);
      setMetrics(data.metrics || {});
    });

    socket.on("state_update", (payload) => {
      if (payload.data) {
        setReports(payload.data.reports || []);
        setResources(payload.data.resources || []);
        setAllocations(payload.data.allocations || []);
        setBroadcastAlerts(payload.data.broadcastAlerts || []);
        setAuditLogs(payload.data.auditLogs || []);
        setMetrics(payload.data.metrics || {});
      }

      if (payload.type === "report_created" || payload.type === "sms_report_created") {
        const rep = payload.latestReport;
        const alloc = payload.allocationResult;
        
        if (rep?.severity === "critical") {
          soundEngine.playEmergencyAlert();
        } else {
          soundEngine.playDispatchTone();
        }

        setToast({
          title: `New ${rep.severity.toUpperCase()} Emergency: ${rep.location_name || 'Incident Site'}`,
          message: alloc?.success 
            ? `Recommended & auto-matched to ${alloc.resource?.name} (${alloc.allocation?.distance_km} km)`
            : `Needs authority action: ${alloc?.reason || 'Capacity limit'}`,
          type: alloc?.success ? "match" : "escalate"
        });
      } else if (payload.type === "alert_broadcasted") {
        soundEngine.playEmergencyAlert();
        setToast({
          title: `📢 ${payload.alert.level.toUpperCase()} ALERT: ${payload.alert.title}`,
          message: payload.alert.message,
          type: "alert"
        });
      } else if (payload.type === "allocation_overridden") {
        soundEngine.playDispatchTone();
        setToast({
          title: "Resource Dispatched Successfully",
          message: "Team en route with live spatial tracking.",
          type: "match"
        });
      } else if (payload.type === "report_resolved") {
        soundEngine.playResolveTone();
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

  const handleResetDemo = async () => {
    setSelectedReport(null);
    soundEngine.playResolveTone();
    try {
      await resetDemoState();
      setToast({
        title: "Grid Restored",
        message: "Default state and resource locations reset.",
        type: "info"
      });
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const handleResolve = async (reportId) => {
    soundEngine.playResolveTone();
    try {
      await resolveReport(reportId);
      setSelectedReport(null);
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* 1. Top Navigation Bar */}
      <Navbar
        isConnected={isConnected}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onResetDemo={handleResetDemo}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        translations={TRANSLATIONS}
      />

      {/* 2. Main Body: Authority Command vs Citizen Portal */}
      <main className="flex-1 p-2 sm:p-3 md:p-4 max-w-[1700px] w-full mx-auto flex flex-col">
        {currentMode === "authority" ? (
          <AuthorityDashboard
            region={region}
            reports={reports}
            resources={resources}
            allocations={allocations}
            imdAlerts={imdAlerts}
            broadcastAlerts={broadcastAlerts}
            metrics={metrics}
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
            onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
            onOpenSmsModal={() => setIsSmsModalOpen(true)}
            onOpenSitRep={() => setIsSitRepOpen(true)}
            onResolveReport={handleResolve}
            theme={theme}
            lang={lang}
            translations={TRANSLATIONS}
          />
        ) : (
          <CitizenPortal
            resources={resources}
            broadcastAlerts={broadcastAlerts}
            imdAlerts={imdAlerts}
            onOpenSmsSimulator={() => setIsSmsModalOpen(true)}
            lang={lang}
            translations={TRANSLATIONS}
          />
        )}
      </main>

      {/* 3. Toast Notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-5 z-[10000] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-3.5 rounded-2xl shadow-2xl border flex items-start space-x-3 max-w-sm backdrop-blur-xl ${
            toast.type === "alert" ? "bg-red-950/95 border-red-500 text-red-100 shadow-red-500/20" :
            toast.type === "match" ? "bg-cyan-950/95 border-cyan-500 text-cyan-100 shadow-cyan-500/20" :
            toast.type === "escalate" ? "bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-500/20" :
            "bg-slate-900/95 border-slate-700 text-slate-100"
          }`}>
            <div className="p-1 rounded-lg bg-black/30 mt-0.5 shrink-0">
              {toast.type === "alert" ? <Radio className="w-4 h-4 text-red-400 animate-pulse" /> :
               toast.type === "match" ? <Zap className="w-4 h-4 text-cyan-400" /> :
               <AlertTriangle className="w-4 h-4 text-amber-400" />}
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

      {/* 4. Modals */}
      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        lang={lang}
        translations={TRANSLATIONS}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onSelectView={(view) => setCurrentMode(view)}
        lang={lang}
        translations={TRANSLATIONS}
      />

      <CitizenReportModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        lang={lang}
        translations={TRANSLATIONS}
      />

      <SmsSimulatorModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        lang={lang}
        translations={TRANSLATIONS}
      />

      <SitRepModal
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
        region={region}
        reports={reports}
        resources={resources}
        allocations={allocations}
        metrics={metrics}
      />

      <DeployResourceModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        lang={lang}
        translations={TRANSLATIONS}
      />
    </div>
  );
}
