// client/src/components/BroadcastAlertModal.jsx
import React, { useState } from "react";
import { 
  X, 
  Radio, 
  Send, 
  AlertTriangle, 
  Bell, 
  ShieldAlert,
  Users
} from "lucide-react";
import { broadcastAlert } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

export default function BroadcastAlertModal({
  isOpen,
  onClose,
  onSuccess,
  lang = "en",
  translations
}) {
  const t = translations ? (translations[lang] || translations.en) : {};

  const PRESET_ALERTS = [
    {
      title: "IMD RED ALERT: Flash Flood Warning in Mithi River Basin",
      message: "Water level crossed 5.2ft danger mark. Citizens in Kurla and Santacruz lowlands must evacuate to relief shelters immediately.",
      level: "red",
      area: "Kurla, Santacruz & Mithi Basin"
    },
    {
      title: "IMD ORANGE ALERT: Heavy Cyclone Gusts & Inundation",
      message: "Gust speeds reaching 90km/h expected between 14:00 and 19:00 IST. Stay indoors and avoid subways and sea facing roads.",
      level: "orange",
      area: "Western Coastal Zone"
    },
    {
      title: "EVACUATION ORDER: Milan & Bandra Subways Submerged",
      message: "Subways submerged over 4.5ft. Inflatable boat sorties operational. Avoid all low-lying transit corridors.",
      level: "red",
      area: "Milan & Bandra Transit Sectors"
    }
  ];

  const [title, setTitle] = useState(PRESET_ALERTS[0].title);
  const [message, setMessage] = useState(PRESET_ALERTS[0].message);
  const [level, setLevel] = useState(PRESET_ALERTS[0].level);
  const [area, setArea] = useState(PRESET_ALERTS[0].area);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setError(null);
    setSending(true);
    soundEngine.playRadarPing();

    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        level,
        area: area.trim()
      };

      const result = await broadcastAlert(payload);
      soundEngine.playDispatchTone();
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to broadcast emergency alert");
    } finally {
      setSending(false);
    }
  };

  const handleSelectPreset = (preset) => {
    soundEngine.playUiClick();
    setTitle(preset.title);
    setMessage(preset.message);
    setLevel(preset.level);
    setArea(preset.area);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-theme-primary">
                Disaster Early-Warning Broadcast
              </h2>
              <p className="text-xs text-theme-muted">
                Push official emergency bulletins across Web, App & SMS mesh
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-2 text-theme-secondary">
              1. Official Advisory Presets:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_ALERTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    title === preset.title
                      ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-sm font-semibold"
                      : "bg-theme-subtle border-theme-border text-theme-secondary hover:border-theme-medium"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="truncate pr-2">{preset.title}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase shrink-0 ${
                      preset.level === "red" ? "bg-red-600 text-white" : "bg-orange-600 text-white"
                    }`}>
                      {preset.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-theme-muted truncate mt-0.5 font-mono">
                    Target Area: {preset.area}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Level & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
                2. Threat Severity Level:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500 font-mono font-bold"
              >
                <option value="red">🚨 RED ALERT (Immediate Danger)</option>
                <option value="orange">⚠️ ORANGE ALERT (Severe Risk)</option>
                <option value="yellow">⚡ YELLOW ADVISORY (Be Aware)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
                3. Target Evacuation Sector:
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Mithi Basin, Kurla"
                className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Bulletin Title */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
              4. Warning Headline:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FLASH FLOOD IMMINENT: EVACUATE TO ST JUDE SHELTER"
              className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500 font-bold"
            />
          </div>

          {/* Bulletin Message */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
              5. Citizen Instructions & Evacuation Route:
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear shelter locations, safe route instructions, and helpline numbers..."
              className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500 leading-relaxed font-sans"
            />
          </div>

          {/* Submit Broadcast Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>{sending ? "TRANSMITTING BROADCAST..." : "PUSH OFFICIAL DISASTER BULLETIN"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
