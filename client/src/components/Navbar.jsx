// client/src/components/Navbar.jsx
import React from "react";
import { 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Map, 
  Users, 
  Sun, 
  Moon, 
  Radio,
  Compass
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function Navbar({
  isConnected,
  currentMode = "authority", // "authority" | "citizen"
  setCurrentMode,
  onOpenBroadcastModal,
  onOpenDemoTour,
  onResetDemo,
  theme = "dark",
  setTheme,
  lang = "en",
  setLang,
  translations
}) {
  const t = translations ? (translations[lang] || translations.en) : {};

  const toggleTheme = () => {
    soundEngine.playUiClick();
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <header className="w-full bg-theme-card text-theme-primary border-b border-theme-border sticky top-0 z-[1000] px-3 sm:px-4 py-2.5 shadow-sm transition-colors duration-200">
      <div className="w-full max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left Row on Mobile: Brand + Mode Toggle + Essential Tools */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => {
              soundEngine.playUiClick();
              setCurrentMode("authority");
            }}
            className="flex items-center space-x-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 shadow-md shadow-red-600/30 flex items-center justify-center text-white font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black tracking-wider text-theme-primary font-sans">
                  SAHARAA
                </span>
                <span className="text-[10px] text-theme-muted font-medium hidden xs:inline">
                  Disaster Coordination
                </span>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} title={isConnected ? "Grid Online" : "Grid Offline"}></span>
              </div>
            </div>
          </div>

          {/* Mode Switcher (Authority vs Citizen) */}
          <div className="flex items-center bg-theme-subtle p-1 rounded-xl border border-theme-border text-xs font-bold shrink-0">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                setCurrentMode("authority");
              }}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                currentMode === "authority"
                  ? "bg-red-600 text-white shadow-sm font-bold"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="text-xs">Authority</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                setCurrentMode("citizen");
              }}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                currentMode === "citizen"
                  ? "bg-red-600 text-white shadow-sm font-bold"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Citizen</span>
            </button>
          </div>

          {/* Mobile Right Controls: Theme + Demo Script trigger */}
          <div className="flex sm:hidden items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-theme-border bg-theme-subtle text-amber-500 dark:text-amber-400"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                if (onOpenDemoTour) onOpenDemoTour();
              }}
              className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm"
              title="Interactive System Guide"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Controls for Tablet & Desktop */}
        <div className="hidden sm:flex items-center space-x-2 shrink-0">
          
          {/* Interactive System Guide */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              if (onOpenDemoTour) onOpenDemoTour();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Interactive Step-by-Step Crisis Response Guide"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Guide</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-theme-border bg-theme-subtle text-amber-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-theme-subtle p-0.5 rounded-xl border border-theme-border text-xs font-mono font-bold">
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
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  lang === l.code
                    ? "bg-red-600 text-white font-black shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Reset Grid Coordinates */}
          <button
            onClick={() => {
              soundEngine.playResolveTone();
              onResetDemo();
            }}
            className="p-1.5 rounded-xl border border-theme-border bg-theme-subtle text-theme-muted hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Reset Grid to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
