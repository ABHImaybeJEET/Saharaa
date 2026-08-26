// client/src/components/ManualOverrideModal.jsx
import React, { useState } from "react";
import { 
  X, 
  ShieldAlert, 
  Check, 
  ArrowRight, 
  MapPin, 
  LifeBuoy, 
  Building, 
  Package, 
  Zap, 
  UserCheck,
  AlertCircle
} from "lucide-react";
import { executeManualOverride } from "../utils/api";

export default function ManualOverrideModal({
  isOpen,
  onClose,
  report,
  resources = [],
  allocations = [],
  onSuccess
}) {
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [overrideNotes, setOverrideNotes] = useState("Tactical priority reassignment by chief dispatcher");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !report) return null;

  // Find existing allocation for this report
  const currentAlloc = allocations.find(a => a.report_id === report.id && a.status === "active");
  const currentResource = currentAlloc ? resources.find(r => r.id === currentAlloc.resource_id) : null;

  // Scored resources with distance
  const candidateResources = resources.map(res => {
    // Quick client-side distance helper
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
    const isCurrent = currentResource?.id === res.id;
    const isFull = res.current_load >= res.capacity;

    return {
      resource: res,
      distanceKm: dist,
      isCurrent,
      isFull
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResourceId) {
      setError("Please select a resource unit to dispatch");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await executeManualOverride({
        report_id: report.id,
        resource_id: selectedResourceId,
        notes: overrideNotes
      });
      if (onSuccess) onSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to execute manual override");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-tactical-900 border border-tactical-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-tactical-800 bg-tactical-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Dispatcher Manual Override
              </h2>
              <p className="text-[11px] text-slate-400">
                Human-in-the-loop tactical reassignment & priority routing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-tactical-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Incident Overview Card */}
          <div className="bg-tactical-950/80 border border-tactical-800 p-3 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                Incident #{report.id.slice(-6)}: {report.location_name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                {report.severity} {report.category}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              "{report.description}"
            </p>
            <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Current Status: <strong className="text-slate-200">{report.status.toUpperCase()}</strong></span>
              {currentResource && (
                <span className="text-cyan-300">Currently Assigned: <strong>{currentResource.name}</strong></span>
              )}
            </div>
          </div>

          {/* Resource Candidates List */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-2">
              Select Unit to Allocate / Reassign:
            </label>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {candidateResources.map(({ resource: res, distanceKm, isCurrent, isFull }) => {
                const isSelected = selectedResourceId === res.id;

                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResourceId(res.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10 text-white"
                        : isCurrent
                        ? "bg-cyan-950/20 border-cyan-800/60 text-slate-200"
                        : "bg-tactical-950/60 border-tactical-800 text-slate-300 hover:border-tactical-700"
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold truncate">{res.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900 text-cyan-200 font-mono">
                            ACTIVE MATCH
                          </span>
                        )}
                        {isFull && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900 text-red-200 font-mono">
                            FULL (FORCE DISPATCH)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3 font-mono">
                        <span>{res.type.replace("_", " ")}</span>
                        <span>•</span>
                        <span>Load: {res.current_load}/{res.capacity}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-indigo-300 text-xs">
                        {distanceKm} km
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ~{Math.max(3, Math.round(distanceKm * 4 + 3))} min
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Override Reason / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
              Dispatcher Reason / Tactical Notes:
            </label>
            <input
              type="text"
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              placeholder="e.g. Higher ground access / amphibious boat needed"
              className="w-full px-3 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>APPLYING DISPATCH OVERRIDE...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>AUTHORIZE & RE-ROUTE UNIT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
