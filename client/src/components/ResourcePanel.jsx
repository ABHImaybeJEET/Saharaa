// client/src/components/ResourcePanel.jsx
import React, { useState } from "react";
import { 
  Building, 
  LifeBuoy, 
  Package, 
  Ambulance, 
  Plus, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Zap, 
  Filter, 
  Flame 
} from "lucide-react";

export default function ResourcePanel({
  resources = [],
  allocations = [],
  onOpenDeployModal
}) {
  const [filterType, setFilterType] = useState("all");

  const filteredResources = resources.filter(res => {
    if (filterType === "all") return true;
    return res.type === filterType;
  });

  const typeConfig = {
    rescue_team: { label: "Rescue Units", icon: LifeBuoy, color: "text-cyan-400", bg: "bg-cyan-950/40 border-cyan-800/40" },
    shelter: { label: "Relief Camps", icon: Building, color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-800/40" },
    supply_stock: { label: "Ration Depots", icon: Package, color: "text-amber-400", bg: "bg-amber-950/40 border-amber-800/40" }
  };

  return (
    <div className="glass-panel flex flex-col h-full rounded-2xl border border-tactical-800 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-tactical-800/80 bg-tactical-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Emergency Units ({resources.length})
            </h2>
          </div>

          <button
            onClick={onOpenDeployModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Unit</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-medium no-scrollbar">
          {[
            { id: "all", label: "All Units" },
            { id: "rescue_team", label: "🚤 Rescue Boats/Teams" },
            { id: "shelter", label: "🏛️ Shelters" },
            { id: "supply_stock", label: "📦 Supplies" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20"
                  : "bg-tactical-950/60 text-slate-400 hover:text-slate-200 hover:bg-tactical-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredResources.map(resource => {
          const cfg = typeConfig[resource.type] || typeConfig.rescue_team;
          const Icon = cfg.icon;
          const isFull = resource.current_load >= resource.capacity;
          const loadPct = Math.round((resource.current_load / resource.capacity) * 100);
          const activeAssignments = allocations.filter(a => a.resource_id === resource.id && a.status === "active").length;

          return (
            <div
              key={resource.id}
              className={`p-3 rounded-xl border transition-all ${
                isFull 
                  ? "bg-red-950/20 border-red-900/40" 
                  : "bg-tactical-900/50 border-tactical-800 hover:border-tactical-700"
              }`}
            >
              {/* Unit Title & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {resource.name}
                  </span>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isFull 
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : resource.status === "en_route"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {isFull ? "CAPACITY FULL" : resource.status.toUpperCase()}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-400">Deployed Load:</span>
                  <span className="font-bold text-slate-200">
                    {resource.current_load} / {resource.capacity} ({loadPct}%)
                  </span>
                </div>
                <div className="w-full bg-tactical-950 h-2 rounded-full overflow-hidden border border-tactical-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      loadPct >= 100 ? "bg-red-500" :
                      loadPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, loadPct))}%` }}
                  ></div>
                </div>
              </div>

              {/* Equipment & Details */}
              {resource.equipment && (
                <div className="mt-2 text-[11px] text-slate-400 bg-tactical-950/60 p-2 rounded-lg border border-tactical-800/80 leading-tight">
                  <span className="text-slate-300 font-semibold">Gear:</span> {resource.equipment}
                </div>
              )}

              {/* Footer */}
              <div className="mt-2 pt-2 border-t border-tactical-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center text-slate-300">
                  <Phone className="w-3 h-3 mr-1 text-slate-500" />
                  <span>{resource.contact_info}</span>
                </div>
                <div className="text-cyan-400 font-semibold">
                  {activeAssignments} active sorties
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
