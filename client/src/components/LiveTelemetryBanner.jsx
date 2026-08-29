// client/src/components/LiveTelemetryBanner.jsx
import React, { useState, useEffect } from "react";
import { 
  CloudRain, 
  Wind, 
  Waves, 
  AlertTriangle, 
  FileText, 
  Network, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Globe, 
  Zap,
  Radio,
  Sliders,
  Compass
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function LiveTelemetryBanner({
  lang = "en",
  setLang,
  translations,
  onOpenSitRep,
  onOpenMeshModal,
  onOpenCustomScenarioModal,
  onOpenGuide,
  theme = "dark"
}) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Simulated dynamic sensor fluctuations for high-tech HUD realism
  const [telemetry, setTelemetry] = useState({
    rainfall: 148,
    windGust: 84,
    tideHeight: 4.82,
    floodIndex: 87
  });

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        rainfall: Math.max(120, Math.min(180, prev.rainfall + (Math.floor(Math.random() * 5) - 2))),
        windGust: Math.max(70, Math.min(105, prev.windGust + (Math.floor(Math.random() * 5) - 2))),
        tideHeight: parseFloat((4.80 + Math.sin(Date.now() / 30000) * 0.15).toFixed(2)),
        floodIndex: Math.max(75, Math.min(96, prev.floodIndex + (Math.floor(Math.random() * 3) - 1)))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEngine.setSoundEnabled(next);
    if (next) soundEngine.playUiClick();
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    soundEngine.setVoiceEnabled(next);
    if (next) {
      soundEngine.speakAnnouncement(
        lang === "hi" ? "आवाज चेतावनी सक्रिय" : lang === "mr" ? "आवाज अलर्ट सुरू" : "Voice advisory annunciator activated",
        lang
      );
    }
  };

  return (
    <div className="w-full bg-slate-950/90 dark:bg-slate-950/90 bg-white/95 text-slate-100 dark:text-slate-100 text-slate-900 border-y border-slate-800/80 dark:border-slate-800/80 border-slate-200 px-3 sm:px-4 py-2 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 text-xs transition-colors duration-200">
      
      {/* Left: Live Hazard Ticker */}
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-950/80 dark:bg-red-950/80 bg-red-100 border border-red-700/80 dark:border-red-700/80 border-red-300 text-red-400 dark:text-red-300 text-red-700 font-mono font-extrabold shrink-0 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[10px] tracking-wider uppercase">IMD RED ALERT</span>
        </div>
        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate flex items-center gap-1.5">
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-mono">#08-04:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{t.cyclone_alert}</span>
        </div>
      </div>

      {/* Center: Live Environmental Sensors HUD */}
      <div className="hidden lg:flex items-center space-x-4 bg-slate-900/80 dark:bg-slate-900/80 bg-slate-100 px-3 py-1 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-300 text-[11px] font-mono">
        <div className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-300">
          <CloudRain className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-slate-500 dark:text-slate-400">{t.telemetry_rainfall}:</span>
          <strong className="text-slate-900 dark:text-white">{telemetry.rainfall} mm/h</strong>
        </div>

        <div className="w-px h-3 bg-slate-700 dark:bg-slate-800 bg-slate-300"></div>

        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-300">
          <Wind className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-500 dark:text-slate-400">{t.telemetry_wind}:</span>
          <strong className="text-slate-900 dark:text-white">{telemetry.windGust} km/h</strong>
        </div>

        <div className="w-px h-3 bg-slate-700 dark:bg-slate-800 bg-slate-300"></div>

        <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-300">
          <Waves className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-500 dark:text-slate-400">{t.telemetry_tide}:</span>
          <strong className="text-slate-900 dark:text-white">{telemetry.tideHeight}m</strong>
        </div>

        <div className="w-px h-3 bg-slate-700 dark:bg-slate-800 bg-slate-300"></div>

        <div className="flex items-center space-x-1 text-rose-600 dark:text-rose-300">
          <Zap className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-500 dark:text-slate-400">{t.telemetry_flood_risk}:</span>
          <strong className="text-rose-600 dark:text-rose-400 font-bold">{telemetry.floodIndex}%</strong>
        </div>
      </div>

      {/* Right: Quick Tactical Utilities & Controls */}
      <div className="flex items-center space-x-1.5 shrink-0">
        
        {/* Situation Report (SitRep) Export Button */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenSitRep();
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-900 bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 hover:bg-slate-200 border border-slate-700 dark:border-slate-700 border-slate-300 text-slate-300 dark:text-slate-200 text-slate-800 hover:text-cyan-400 dark:hover:text-cyan-300 text-[11px] font-semibold transition-all shadow-sm"
          title="Generate Official Disaster Situation Report"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{t.btn_sitrep}</span>
        </button>

        {/* Mesh Topology Visualizer Button */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenMeshModal();
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-900 bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 hover:bg-slate-200 border border-slate-700 dark:border-slate-700 border-slate-300 text-slate-300 dark:text-slate-200 text-slate-800 hover:text-purple-400 dark:hover:text-purple-300 text-[11px] font-semibold transition-all shadow-sm"
          title="LoRaWAN & Offline Packet Mesh Topology"
        >
          <Network className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">{t.btn_mesh}</span>
        </button>

        {/* Custom Scenario Injector Button */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenCustomScenarioModal();
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-900 bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-800 hover:bg-slate-200 border border-slate-700 dark:border-slate-700 border-slate-300 text-slate-300 dark:text-slate-200 text-slate-800 hover:text-amber-400 dark:hover:text-amber-300 text-[11px] font-semibold transition-all shadow-sm"
          title="Inject Custom Disaster Scenario Event"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">{t.btn_custom_disaster}</span>
        </button>

        {/* Audio FX Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`p-1.5 rounded-lg border transition-all ${
            audioEnabled 
              ? "bg-slate-900 dark:bg-slate-900 bg-cyan-50 text-cyan-400 dark:text-cyan-300 text-cyan-700 border-cyan-500/60" 
              : "bg-slate-950 dark:bg-slate-950 bg-slate-100 text-slate-400 border-slate-800 dark:border-slate-800 border-slate-300"
          }`}
          title={audioEnabled ? t.audio_on : t.audio_off}
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Voice Annunciator Toggle */}
        <button
          onClick={handleToggleVoice}
          className={`p-1.5 rounded-lg border transition-all ${
            voiceEnabled 
              ? "bg-slate-900 dark:bg-slate-900 bg-emerald-50 text-emerald-400 dark:text-emerald-300 text-emerald-700 border-emerald-500/60" 
              : "bg-slate-950 dark:bg-slate-950 bg-slate-100 text-slate-400 border-slate-800 dark:border-slate-800 border-slate-300"
          }`}
          title={voiceEnabled ? t.voice_on : t.voice_off}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-slate-900 dark:bg-slate-900 bg-slate-100 p-0.5 rounded-lg border border-slate-700 dark:border-slate-700 border-slate-300 text-[10px] font-mono font-bold">
          {[
            { code: "en", label: "EN" },
            { code: "hi", label: "हि" },
            { code: "mr", label: "म" }
          ].map(l => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                soundEngine.playUiClick();
              }}
              className={`px-1.5 py-0.5 rounded transition-all ${
                lang === l.code
                  ? "bg-red-600 text-white font-black shadow-sm"
                  : "text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-200 dark:hover:text-slate-200 hover:text-slate-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
