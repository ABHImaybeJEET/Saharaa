// client/src/components/AuditFeed.jsx
import React, { useState } from "react";
import { Terminal, Shield, Zap, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function AuditFeed({ logs = [] }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="glass-panel rounded-2xl border border-tactical-800 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="px-4 py-2.5 bg-tactical-900/80 border-b border-tactical-800 flex items-center justify-between cursor-pointer select-none hover:bg-tactical-850 transition-all"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Saharaa Autonomous Coordination Audit Stream
          </span>
          <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-800 text-[10px]">
            LIVE LOGS ({logs.length})
          </span>
        </div>

        <button className="text-slate-400 hover:text-white">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Log Feed */}
      {!collapsed && (
        <div className="p-3 max-h-36 overflow-y-auto space-y-1.5 bg-tactical-950/90 divide-y divide-tactical-900/60">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-[11px]">No system events logged yet.</div>
          ) : (
            logs.map(log => {
              const isAlloc = log.type === "allocation";
              const isWarning = log.type === "warning" || log.message.includes("[ESCALATION]");
              const isOverride = log.type === "override";
              const isSuccess = log.type === "success";

              return (
                <div key={log.id} className="pt-1.5 first:pt-0 flex items-start space-x-2 text-[11px] leading-relaxed">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  
                  <span className={
                    isWarning ? "text-amber-400 font-medium" :
                    isOverride ? "text-indigo-300 font-medium" :
                    isAlloc ? "text-cyan-300 font-medium" :
                    isSuccess ? "text-emerald-400 font-medium" :
                    "text-slate-300"
                  }>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
