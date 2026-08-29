// client/src/components/CitizenReportModal.jsx
import React, { useState } from "react";
import { 
  X, 
  Send, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  Phone, 
  CheckCircle, 
  Radio, 
  Navigation, 
  Sparkles,
  LifeBuoy
} from "lucide-react";
import { submitCitizenReport } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

const SAMPLE_PHOTOS = [
  { label: "Subway Inundation", url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80" },
  { label: "Stranded Rooftop", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80" },
  { label: "Waterlogged Alley", url: "https://images.unsplash.com/photo-1516214104703-d870798883c5?w=600&auto=format&fit=crop&q=80" }
];

export default function CitizenReportModal({
  isOpen,
  onClose,
  initialCoords = null,
  onSuccess,
  lang = "en",
  translations
}) {
  const t = translations ? (translations[lang] || translations.en) : {};

  const CATEGORIES = [
    { id: "flood", label: t.cat_flood || "Flood Inundation", icon: "🌊", desc: "Rising water levels / submerged streets" },
    { id: "trapped", label: t.cat_trapped || "Stranded / Trapped", icon: "🚨", desc: "People stuck on roofs / collapsed areas" },
    { id: "medical", label: t.cat_medical || "Medical Crisis", icon: "🚑", desc: "Critical injuries / oxygen / stroke" },
    { id: "shelterless", label: t.cat_shelterless || "Shelter / Roof Gone", icon: "🏕️", desc: "Displaced families needing emergency camp" },
    { id: "food_water", label: t.cat_food_water || "Food / RO Water", icon: "🍞", desc: "Ration shortage / drinking water need" },
    { id: "landslide", label: t.cat_landslide || "Landslide Risk", icon: "⛰️", desc: "Debris blockage / hill slope erosion" }
  ];

  const SEVERITY_LEVELS = [
    { id: "critical", label: t.sev_critical || "CRITICAL", color: "bg-red-600 border-red-500 text-white", desc: "Immediate life threat (< 1 hr)" },
    { id: "high", label: t.sev_high || "HIGH", color: "bg-orange-600 border-orange-500 text-white", desc: "Severe condition, escalating" },
    { id: "medium", label: t.sev_medium || "MEDIUM", color: "bg-amber-600 border-amber-500 text-white", desc: "Significant damage / displaced" },
    { id: "low", label: t.sev_low || "LOW", color: "bg-cyan-600 border-cyan-500 text-white", desc: "Advisory / minor assistance" }
  ];

  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState("critical");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("+91 98200 12345");
  const [locationName, setLocationName] = useState("Milan Subway / Santacruz West");
  const [lat, setLat] = useState(initialCoords?.lat || 19.0800);
  const [lng, setLng] = useState(initialCoords?.lng || 72.8420);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleUseGPS = () => {
    soundEngine.playUiClick();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationName(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          const rLat = 19.0760 + (Math.random() - 0.5) * 0.04;
          const rLng = 72.8777 + (Math.random() - 0.5) * 0.04;
          setLat(rLat);
          setLng(rLng);
          setLocationName("Metro Flood Zone Sector 4");
        }
      );
    }
  };

  const handleSubmit = async (e) => {
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
        description: description.trim() || `${category.toUpperCase()} incident reported by citizen. Immediate response needed.`,
        photo_url: photoUrl,
        phone: phone.trim(),
        location_name: locationName.trim()
      };

      const res = await submitCitizenReport(payload);
      soundEngine.playDispatchTone();
      setSubmittedReport(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || "Failed to submit disaster report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                {t.sos_title || "Citizen Emergency SOS Portal"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.sos_subtitle || "Direct link to Emergency Dispatch Grid"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Submitted Success View */}
        {submittedReport ? (
          <div className="p-6 text-center space-y-4 font-sans">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.sos_success_title || "Emergency Report Transmitted!"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Report <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">#{submittedReport.report.id.slice(-6)}</span> {t.sos_success_desc || "has been broadcasted across the authority command mesh."}
              </p>
            </div>

            {submittedReport.allocationResult?.success ? (
              <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 p-3.5 rounded-xl text-left space-y-1">
                <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  {t.sos_matched_badge || "AUTOMATED DISPATCH MATCHED"}
                </div>
                <div className="text-xs text-slate-900 dark:text-white">
                  Unit: <span className="font-semibold">{submittedReport.allocationResult.resource?.name}</span>
                </div>
                <div className="text-xs text-cyan-700 dark:text-cyan-300 font-mono">
                  Distance: {submittedReport.allocationResult.allocation?.distance_km} km | 
                  Est. ETA: ~{submittedReport.allocationResult.allocation?.eta_minutes} min
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-left text-xs text-amber-800 dark:text-amber-300">
                {t.sos_escalated_badge || "⚠️ All direct local units currently engaged. Report escalated directly to chief dispatcher."}
              </div>
            )}

            <button
              onClick={() => {
                soundEngine.playUiClick();
                setSubmittedReport(null);
                onClose();
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/30"
            >
              {t.sos_return_btn || "Return to Command View"}
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* 1. Category Selection */}
            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-2 text-slate-700 dark:text-slate-300">
                {t.sos_cat_label || "1. Incident Category"}
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
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      category === cat.id
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Severity Level */}
            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-2 text-slate-700 dark:text-slate-300">
                {t.sos_sev_label || "2. Urgency / Severity Level"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEVERITY_LEVELS.map(sev => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setSeverity(sev.id);
                    }}
                    className={`py-2 px-2 rounded-xl border text-center font-mono text-xs font-extrabold transition-all ${
                      severity === sev.id
                        ? `${sev.color} shadow-sm`
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location & Coordinates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase font-mono text-slate-700 dark:text-slate-300">
                  {t.sos_loc_label || "3. Incident Location"}
                </label>
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="flex items-center space-x-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-mono font-semibold"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{t.sos_gps_btn || "Use Device GPS"}</span>
                </button>
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Bandra Subway, near Pillar 14"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-xs text-slate-500">Lat:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Lng:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-1.5 text-slate-700 dark:text-slate-300">
                {t.sos_desc_label || "4. Situation Description"}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.sos_desc_ph || "Describe number of people, water depth, immediate medical requirements..."}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* 5. Phone Callback & Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-700 dark:text-slate-300">
                  {t.sos_phone_label || "Callback Phone"}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-700 dark:text-slate-300">
                  {t.sos_photo_label || "Sample Field Photo"}
                </label>
                <select
                  value={photoUrl || ""}
                  onChange={(e) => setPhotoUrl(e.target.value || null)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="">{t.sos_photo_none || "No Photo"}</option>
                  {SAMPLE_PHOTOS.map((p, idx) => (
                    <option key={idx} value={p.url}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>{t.sos_submitting || "TRANSMITTING SOS..."}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.sos_submit_btn || "BROADCAST EMERGENCY SOS DISPATCH"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
