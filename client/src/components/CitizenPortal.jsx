// client/src/components/CitizenPortal.jsx
import React, { useState } from "react";
import { 
  Send, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Building, 
  LifeBuoy, 
  Radio, 
  CheckCircle, 
  Navigation, 
  Sparkles, 
  MessageSquare, 
  Clock,
  Compass,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { submitCitizenReport } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

export default function CitizenPortal({
  resources = [],
  broadcastAlerts = [],
  imdAlerts = [],
  onOpenSmsSimulator,
  lang = "en",
  translations
}) {
  const [activeTab, setActiveTab] = useState("alerts"); // "alerts" | "report" | "shelters" | "contacts"
  
  // Citizen SOS form state
  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState("critical");
  const [locationName, setLocationName] = useState("Milan Subway, Santacruz");
  const [lat, setLat] = useState(19.0800);
  const [lng, setLng] = useState(72.8420);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("+91 98200 12345");
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [error, setError] = useState(null);

  const t = translations ? (translations[lang] || translations.en) : {};

  const CATEGORIES = [
    { id: "flood", label: lang === "hi" ? "बाढ़ एवं जलभराव" : lang === "mr" ? "पूर आणि पाणी भरणे" : "Flood Inundation", icon: "🌊" },
    { id: "trapped", label: lang === "hi" ? "फंसे हुए लोग" : lang === "mr" ? "अडकलेले नागरिक" : "Stranded / Trapped", icon: "🚨" },
    { id: "medical", label: lang === "hi" ? "चिकित्सा आपातकाल" : lang === "mr" ? "वैद्यकीय आणीबाणी" : "Medical Crisis", icon: "🚑" },
    { id: "shelterless", label: lang === "hi" ? "छतविहीन / विस्थापित" : lang === "mr" ? "बेघर / निवारा गरज" : "Shelter / Roof Gone", icon: "🏕️" },
    { id: "food_water", label: lang === "hi" ? "राशन व पेयजल" : lang === "mr" ? "अन्न व पिण्याचे पाणी" : "Food / Clean Water", icon: "🍞" }
  ];

  const SEVERITIES = [
    { id: "critical", label: "CRITICAL", color: "bg-red-600 border-red-500 text-white", sub: "< 1 hr urgency" },
    { id: "high", label: "HIGH", color: "bg-orange-600 border-orange-500 text-white", sub: "Severe situation" },
    { id: "medium", label: "MEDIUM", color: "bg-amber-600 border-amber-500 text-white", sub: "Displaced / Damage" }
  ];

  const SHELTERS = resources.filter(r => r.type === "shelter" || r.type === "supply_stock");

  const handleUseGPS = () => {
    soundEngine.playUiClick();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationName(`GPS Position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          setLat(19.0760);
          setLng(72.8777);
          setLocationName("Central Metro Sector 4");
        }
      );
    }
  };

  const handleSubmitSOS = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    soundEngine.playRadarPing();

    try {
      const payload = {
        category,
        severity,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description: description.trim() || `${category.toUpperCase()} emergency assistance requested by citizen.`,
        phone: phone.trim(),
        location_name: locationName.trim()
      };

      const res = await submitCitizenReport(payload);
      soundEngine.playDispatchTone();
      setSubmittedReport(res);
    } catch (err) {
      setError(err.message || "Failed to submit disaster report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 space-y-3 font-sans animate-in fade-in duration-200">
      
      {/* 1. Header with Active Disaster Status */}
      <div className="bg-theme-card border border-theme-border rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black shadow-md shadow-red-600/30">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-theme-primary">
                {lang === "hi" ? "नागरिक आपदा सहायता पोर्टल" : lang === "mr" ? "नागरिक आपत्ती साहाय्य केंद्र" : "Citizen Disaster Assistance Portal"}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-mono text-[9px] font-bold border border-red-500/30">
                ACTIVE 24/7
              </span>
            </div>
            <p className="text-xs text-theme-muted">
              {lang === "hi" ? "सीधा आपातकालीन संपर्क, राहत शिविर खोजें और लाइव अलर्ट प्राप्त करें" : lang === "mr" ? "थेट आणीबाणी मदत, निवारा छावण्या आणि धोक्याची पूर्वसूचना" : "Direct emergency SOS, verified relief shelters, and live early warnings"}
            </p>
          </div>
        </div>

        {/* Quick Offline SMS trigger */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            if (onOpenSmsSimulator) onOpenSmsSimulator();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-theme-subtle border border-purple-400 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all font-mono"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "ऑफ़लाइन SMS SOS" : lang === "mr" ? "ऑफलाइन SMS मदत" : "Zero-Data SMS SOS"}</span>
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center space-x-1.5 bg-theme-subtle p-1 rounded-xl border border-theme-border text-xs font-bold transition-colors duration-200">
        {[
          { id: "alerts", label: lang === "hi" ? "📢 लाइव अलर्ट" : lang === "mr" ? "📢 थेट इशारे" : `📢 Alerts (${broadcastAlerts.length})`, icon: Radio },
          { id: "report", label: lang === "hi" ? "🚨 आपातकालीन SOS" : lang === "mr" ? "🚨 आणीबाणी SOS" : "🚨 Report SOS", icon: Send },
          { id: "shelters", label: lang === "hi" ? "🏛️ राहत शिविर" : lang === "mr" ? "🏛️ निवारा छावण्या" : `🏛️ Shelters (${SHELTERS.length})`, icon: Building },
          { id: "contacts", label: lang === "hi" ? "📞 हेल्पलाइन" : lang === "mr" ? "📞 मदत क्रमांक" : "📞 Helplines", icon: Phone }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playUiClick();
              setActiveTab(tab.id);
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-sm font-bold"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: Active Disaster Early-Warnings & Alerts (Clean Solid High-Contrast Cards) */}
      {activeTab === "alerts" && (
        <div className="space-y-2.5">
          {broadcastAlerts.length === 0 ? (
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl text-center text-theme-muted text-xs font-mono">
              No active warnings currently in effect.
            </div>
          ) : (
            broadcastAlerts.map(alert => (
              <div 
                key={alert.id}
                className="bg-theme-card border-2 border-red-500/80 rounded-2xl p-4 shadow-sm space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-theme-primary">
                      {alert.title}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase text-white ${
                    alert.level === "red" ? "bg-red-600" : "bg-orange-600"
                  }`}>
                    {alert.level} ALERT
                  </span>
                </div>

                <p className="text-xs text-theme-secondary leading-relaxed font-sans">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between text-xs text-theme-muted font-mono pt-1 border-t border-theme-border">
                  <span>Target Area: <strong className="text-theme-primary">{alert.area}</strong></span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Report Incident & Request Help */}
      {activeTab === "report" && (
        <div className="bg-theme-card border border-theme-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors duration-200">
          
          {submittedReport ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-base font-bold text-theme-primary">
                  {lang === "hi" ? "आपातकालीन SOS प्रेषित हो गया!" : lang === "mr" ? "आणीबाणी SOS यशस्वीरित्या पाठवला!" : "Emergency SOS Broadcasted!"}
                </h2>
                <p className="text-xs text-theme-muted mt-1">
                  Incident Ticket <strong className="font-mono text-cyan-600 dark:text-cyan-400">#{submittedReport.report?.id.slice(-6)}</strong> has been received at Disaster Command.
                </p>
              </div>

              {submittedReport.allocationResult?.success ? (
                <div className="max-w-md mx-auto bg-theme-subtle border border-cyan-400 dark:border-cyan-700 p-3.5 rounded-xl text-left space-y-1">
                  <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>RESCUE UNIT DISPATCHED</span>
                  </div>
                  <div className="text-xs font-semibold text-theme-primary">
                    Assigned: {submittedReport.allocationResult.resource?.name}
                  </div>
                  <div className="text-xs text-cyan-700 dark:text-cyan-300 font-mono">
                    Distance: {submittedReport.allocationResult.allocation?.distance_km} km | Est. ETA: ~{submittedReport.allocationResult.allocation?.eta_minutes} min
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-theme-subtle border border-amber-400 dark:border-amber-700 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-left">
                  ⚠️ Local units currently en route. Chief dispatcher has received priority escalation.
                </div>
              )}

              <button
                onClick={() => setSubmittedReport(null)}
                className="py-2 px-5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
              >
                Report Another Emergency
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSOS} className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              {/* Step 1: Category */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1.5 text-theme-secondary">
                  1. Select Emergency Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiClick();
                        setCategory(cat.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                        category === cat.id
                          ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-sm font-bold"
                          : "bg-theme-subtle border-theme-border text-theme-secondary hover:border-theme-medium"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Severity */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1.5 text-theme-secondary">
                  2. Urgency Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SEVERITIES.map(sev => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiClick();
                        setSeverity(sev.id);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        severity === sev.id
                          ? `${sev.color} shadow-sm font-bold`
                          : "bg-theme-subtle border-theme-border text-theme-muted"
                      }`}
                    >
                      <div className="font-mono text-xs font-extrabold">{sev.label}</div>
                      <div className="text-[10px] opacity-90 mt-0.5">{sev.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Location */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase font-mono text-theme-secondary">
                    3. Location:
                  </label>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="flex items-center space-x-1 text-xs text-cyan-600 dark:text-cyan-400 font-semibold font-mono"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Auto-Detect GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Milan Subway / Bandra Station"
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Step 4: Description & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
                    4. Situation Details:
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Number of stranded people, water depth, medical conditions..."
                    className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono mb-1 text-theme-secondary">
                    5. Callback Phone:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 bg-theme-subtle border border-theme-border rounded-xl text-xs text-theme-primary font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Big Submit SOS Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "TRANSMITTING SOS..." : "BROADCAST EMERGENCY SOS DISPATCH"}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: Find Nearest Relief Shelters */}
      {activeTab === "shelters" && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SHELTERS.map(shelter => {
              const freeBeds = shelter.capacity - shelter.current_load;
              const fillPct = Math.round((shelter.current_load / shelter.capacity) * 100);

              return (
                <div 
                  key={shelter.id}
                  className="bg-theme-card border border-theme-border rounded-2xl p-3.5 shadow-sm space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>RELIEF CAMP</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        freeBeds <= 0 
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" 
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      }`}>
                        {freeBeds > 0 ? `${freeBeds} Free Slots` : "FULL"}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-theme-primary mt-1">
                      {shelter.name}
                    </h3>

                    {/* Capacity Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-theme-muted font-mono">
                        <span>Occupancy</span>
                        <span>{shelter.current_load} / {shelter.capacity} ({fillPct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            fillPct > 90 ? "bg-red-500" : fillPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-xs text-theme-muted mt-2 leading-relaxed">
                      {shelter.equipment}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-theme-border flex items-center justify-between text-xs">
                    <span className="text-xs text-theme-muted font-mono">{shelter.contact_info}</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Emergency Contacts & Helplines */}
      {activeTab === "contacts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { title: "National Emergency Response", number: "112", desc: "All-in-one Police, Fire & Disaster", color: "bg-red-600" },
            { title: "Ambulance & Mobile ICU", number: "108", desc: "24x7 Critical Medical Evacuation", color: "bg-rose-600" },
            { title: "Disaster Control Room", number: "1077", desc: "District Disaster Management Authority", color: "bg-orange-600" },
            { title: "Flood & Coastal Inundation", number: "1916", desc: "Municipal Monsoon Control Desk", color: "bg-cyan-600" }
          ].map((c, idx) => (
            <div 
              key={idx}
              className="bg-theme-card border border-theme-border p-3.5 rounded-2xl shadow-sm flex items-center justify-between space-x-3 transition-colors duration-200"
            >
              <div>
                <h3 className="text-xs font-bold text-theme-primary">{c.title}</h3>
                <p className="text-xs text-theme-muted mt-0.5">{c.desc}</p>
                <div className="font-mono text-base font-extrabold text-red-600 dark:text-red-400 mt-1">
                  {c.number}
                </div>
              </div>

              <a
                href={`tel:${c.number}`}
                className={`p-3 rounded-xl ${c.color} text-white hover:opacity-90 transition-opacity shadow-sm`}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
