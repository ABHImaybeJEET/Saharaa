// client/src/components/CustomScenarioModal.jsx
import React, { useState } from "react";
import { 
  X, 
  Sliders, 
  Zap, 
  Flame, 
  AlertTriangle, 
  MapPin, 
  Send,
  Navigation
} from "lucide-react";
import { submitCitizenReport } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

const PRESET_DISASTER_EVENTS = [
  {
    title: "Metro Tunnel Flooding (Dadar)",
    category: "flood",
    severity: "critical",
    lat: 19.0178,
    lng: 72.8478,
    location_name: "Dadar Central Metro Subway",
    description: "Sudden stormwater backflow submerged tracks. 14 commuters trapped on platform bench with water at chest level."
  },
  {
    title: "Hospital Power Blackout (Bandra)",
    category: "medical",
    severity: "critical",
    lat: 19.0600,
    lng: 72.8360,
    location_name: "Bandra East Care Clinic",
    description: "Backup DG generator flooded. 4 ICU neonatal units on battery power with < 30 mins remaining."
  },
  {
    title: "Building Balcony Collapse Risk (Kurla)",
    category: "trapped",
    severity: "high",
    lat: 19.0700,
    lng: 72.8790,
    location_name: "Kurla Mithi Riverfront Chawl",
    description: "Foundation soil washed away by Mithi overflow. 28 residents stranded on 1st floor roof."
  }
];

export default function CustomScenarioModal({ isOpen, onClose, onSuccess }) {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [category, setCategory] = useState(PRESET_DISASTER_EVENTS[0].category);
  const [severity, setSeverity] = useState(PRESET_DISASTER_EVENTS[0].severity);
  const [locationName, setLocationName] = useState(PRESET_DISASTER_EVENTS[0].location_name);
  const [lat, setLat] = useState(PRESET_DISASTER_EVENTS[0].lat);
  const [lng, setLng] = useState(PRESET_DISASTER_EVENTS[0].lng);
  const [description, setDescription] = useState(PRESET_DISASTER_EVENTS[0].description);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleApplyPreset = (idx) => {
    const p = PRESET_DISASTER_EVENTS[idx];
    setSelectedPreset(idx);
    setCategory(p.category);
    setSeverity(p.severity);
    setLocationName(p.location_name);
    setLat(p.lat);
    setLng(p.lng);
    setDescription(p.description);
    soundEngine.playUiClick();
  };

  const handleInject = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      soundEngine.playEmergencyAlert();
      const payload = {
        category,
        severity,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description: description.trim(),
        location_name: locationName.trim(),
        phone: "+91 99887 76655"
      };

      const res = await submitCitizenReport(payload);
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to inject disaster scenario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-600/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-theme-primary uppercase tracking-wider font-mono">
                Disaster Event Injector (Sandbox)
              </h2>
              <p className="text-xs text-theme-muted">
                Inject custom multi-hazard emergencies into the live coordination grid
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

        <form onSubmit={handleInject} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary uppercase font-mono mb-1.5">
              Quick Preset Scenarios:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_DISASTER_EVENTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(idx)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedPreset === idx 
                      ? "bg-amber-100 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-white font-semibold" 
                      : "bg-theme-subtle border-theme-border text-theme-secondary hover:border-theme-medium"
                  }`}
                >
                  <div>
                    <div className="font-bold text-theme-primary">{p.title}</div>
                    <div className="text-xs text-theme-muted truncate mt-0.5">{p.location_name}</div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-600 text-white">
                    {p.severity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Location & Coords */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-theme-secondary uppercase font-mono">
              Location Name & Coordinates:
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-amber-500"
            />
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-xs text-theme-muted">Lat:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-theme-subtle border border-theme-border rounded-lg text-theme-primary"
                />
              </div>
              <div>
                <span className="text-xs text-theme-muted">Lng:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-theme-subtle border border-theme-border rounded-lg text-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary uppercase font-mono mb-1">
              Incident Situation:
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-600/30 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>INJECTING INCIDENT...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>INJECT INCIDENT INTO ACTIVE GRID</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
