// client/src/components/SitRepModal.jsx
import React, { useState } from "react";
import { 
  X, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  Users, 
  Zap, 
  Building,
  CheckCircle
} from "lucide-react";

export default function SitRepModal({
  isOpen,
  onClose,
  region,
  reports = [],
  resources = [],
  allocations = [],
  metrics = {}
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const timestampStr = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const criticalCount = reports.filter(r => r.severity === "critical" && r.status !== "resolved").length;
  const highCount = reports.filter(r => r.severity === "high" && r.status !== "resolved").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;
  const activeAllocations = allocations.filter(a => a.status === "active");

  const totalCapacity = resources.reduce((sum, r) => sum + r.capacity, 0);
  const totalLoad = resources.reduce((sum, r) => sum + r.current_load, 0);
  const loadPercentage = totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0;

  const markdownSitRep = `# SAHARAA DISASTER SITUATION REPORT (SITREP) #04
**Operational Theatre:** ${region?.name || "Coastal Metro Zone"}
**Generated At:** ${timestampStr} (IST)
**Authorizing Node:** Saharaa Autonomous Coordination Grid & DDMA Command

---

## 1. EXECUTIVE CRISIS SUMMARY
- **Total Emergency Incidents Logged:** ${reports.length}
- **Active Critical (Priority 1) Incidents:** ${criticalCount}
- **High Severity Incidents:** ${highCount}
- **Incidents Resolved & Stabilized:** ${resolvedCount}
- **Active Sorties / Dispatches En Route:** ${activeAllocations.length}
- **Overall Resource Bed/Seat Saturation:** ${loadPercentage}% (${totalLoad} / ${totalCapacity} allocated)

---

## 2. ACTIVE CRITICAL INCIDENT TRIAGE
${reports.filter(r => r.status !== "resolved").map(r => {
  const alloc = allocations.find(a => a.report_id === r.id && a.status === "active");
  const res = alloc ? resources.find(u => u.id === alloc.resource_id) : null;
  return `### [${r.severity.toUpperCase()}] ${r.category.toUpperCase()} - ${r.location_name || 'Site'}
- **Incident ID:** #${r.id.slice(-6)} | **Source:** ${r.source.toUpperCase()} | **Contact:** ${r.phone}
- **Description:** ${r.description}
- **Assignment:** ${res ? `${res.name} (Dist: ${alloc.distance_km} km, ETA: ~${alloc.eta_minutes}m)` : '**UNASSIGNED - ESCALATED TO HUMAN DISPATCHER**'}
`;
}).join("\n")}

---

## 3. RESCUE UNITS & RELIEF CAMPS STATUS
${resources.map(res => `
- **${res.name}** (${res.type.replace('_', ' ').toUpperCase()})
  - Load: ${res.current_load}/${res.capacity} (${Math.round((res.current_load / res.capacity) * 100)}%)
  - Status: ${res.status.toUpperCase()} | Contact: ${res.contact_info}
  - Gear: ${res.equipment}
`).join("")}

---

## 4. INCIDENT COMMAND DIRECTIVES
1. Prioritize inflatable Zodiac boat deployments to subways inundated over 4ft.
2. Route homeless families displaced by tin-roof collapses toward St. Jude Central Relief Shelter.
3. Keep offline LoRa / SMS ingestion frequency open on 400050/400058 gateways.
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownSitRep);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-600/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                Official Disaster Situation Report (SitRep)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized DDMA / NDRF tactical response brief
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-all border border-slate-200 dark:border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy MD"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Brief</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable SitRep Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-xs font-sans bg-white dark:bg-slate-950">
          
          {/* Metadata Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Theatre of Operations</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{region?.name || "Coastal Metro Zone"}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Timestamp</div>
              <div className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold">{timestampStr} IST</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Classification</div>
              <div className="text-xs text-red-600 dark:text-red-400 font-bold">EMERGENCY ACTIVE</div>
            </div>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
              <div className="text-[10px] uppercase font-mono text-red-600 dark:text-red-400 font-bold">Critical (P1)</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{criticalCount}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Immediate threat</div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40">
              <div className="text-[10px] uppercase font-mono text-cyan-700 dark:text-cyan-400 font-bold">Active Sorties</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{activeAllocations.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Dispatched units</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <div className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold">Resolved</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{resolvedCount}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Citizens secured</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
              <div className="text-[10px] uppercase font-mono text-indigo-600 dark:text-indigo-400 font-bold">Bed / Boat Load</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{loadPercentage}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{totalLoad}/{totalCapacity} used</div>
            </div>
          </div>

          {/* Active Incidents Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Priority Incident Breakdown</span>
            </h3>
            
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">ID / Severity</th>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Location</th>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Description</th>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {reports.map(rep => {
                    const alloc = allocations.find(a => a.report_id === rep.id && a.status === "active");
                    const res = alloc ? resources.find(u => u.id === alloc.resource_id) : null;
                    return (
                      <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                        <td className="p-2 font-mono whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rep.severity === "critical" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" :
                            rep.severity === "high" ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                          }`}>
                            {rep.severity.toUpperCase()}
                          </span>
                          <span className="ml-1 text-slate-400 text-[10px]">#{rep.id.slice(-6)}</span>
                        </td>
                        <td className="p-2 font-semibold text-slate-900 dark:text-slate-200">{rep.location_name || 'Incident Site'}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{rep.description}</td>
                        <td className="p-2 font-mono text-[11px]">
                          {rep.status === "resolved" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ RESOLVED</span>
                          ) : res ? (
                            <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{res.name} ({alloc.distance_km}km)</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">⚠️ ESCALATED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commander Directives */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 font-sans">
            <h4 className="font-mono text-xs uppercase font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Tactical Directives for Incident Commanders</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>Deploy high-draft Zodiac rescue boats to Milan Subway & Kurla Basin first due to rapid flood ingress.</li>
              <li>Keep GSM fallback simulator online to receive emergency text dispatches across cutoff pincodes 400050/400058.</li>
              <li>Coordinate inter-agency overflow with North High Ground Stadium when local shelter capacity crosses 85%.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
