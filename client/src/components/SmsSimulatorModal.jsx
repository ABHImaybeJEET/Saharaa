// client/src/components/SmsSimulatorModal.jsx
import React, { useState } from "react";
import { 
  X, 
  MessageSquare, 
  Send, 
  Smartphone, 
  CheckCircle, 
  Radio
} from "lucide-react";
import { submitSmsSimulation } from "../utils/api";
import { soundEngine } from "../utils/soundEffects";

export default function SmsSimulatorModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  lang = "en",
  translations
}) {
  const t = translations ? (translations[lang] || translations.en) : {};

  const PRESET_SMS_TEMPLATES = [
    {
      title: lang === "hi" ? "गंभीर जलभराव में फंसे नागरिक (पिनकोड 400050)" : lang === "mr" ? "अडकलेले नागरिक तातडीची मदत (पिनकोड 400050)" : "Critical Flood Stranded (Pincode 400050)",
      sms: "FLOOD 400050 CRITICAL 4 people stranded on rooftop water reaching 6ft need rescue boat +919820011223"
    },
    {
      title: lang === "hi" ? "आपातकालीन चिकित्सा संकट (पिनकोड 400058)" : lang === "mr" ? "तातडीची वैद्यकीय आणीबाणी (पिनकोड 400058)" : "Urgent Medical Crisis (Pincode 400058)",
      sms: "MEDICAL 400058 HIGH Diabetic elder in insulin shock ground floor inundated +919819922334"
    },
    {
      title: lang === "hi" ? "झुग्गी छत क्षति / विस्थापन (पिनकोड 400069)" : lang === "mr" ? "घरांचे नुकसान व निवारा गरज (पिनकोड 400069)" : "Slum Roof Blown / Shelterless (Pincode 400069)",
      sms: "SHELTER 400069 MEDIUM Heavy cyclone gusts collapsed tin sheds 15 families need dry camp +919833344556"
    },
    {
      title: lang === "hi" ? "प्राकृतिक भाषा आपातकाल (बिना विशेष फॉर्मेट)" : lang === "mr" ? "साध्या भाषेतील आणीबाणी संदेश" : "Natural Emergency SOS (No rigid formatting)",
      sms: "Help urgent flood near Milan Subway water inside car 2 kids crying call 9876543210"
    }
  ];

  const [smsText, setSmsText] = useState(PRESET_SMS_TEMPLATES[0].sms);
  const [senderPhone, setSenderPhone] = useState("+91 98200 88990");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    setError(null);
    setSending(true);
    soundEngine.playRadarPing();

    try {
      const response = await submitSmsSimulation({
        text: smsText.trim(),
        phone: senderPhone.trim()
      });
      soundEngine.playDispatchTone();
      setResult(response);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || "Failed to process incoming SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-600/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                {t.sms_title || "Offline GSM / SMS Ingestion Gateway"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.sms_subtitle || "Receives and geocodes SOS text messages when mobile internet is down"}
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

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Info Box */}
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 p-3 rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.sms_protocol_title || "Offline Telephony Protocol"}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.sms_protocol_desc || "Citizens in cyclone cutoffs send plain text SMS messages. Saharaa parses coordinates, extracts severity, and executes automatic spatial dispatch."}
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase font-mono mb-2 text-slate-700 dark:text-slate-300">
              {t.sms_sample_label || "Sample Inbound Messages:"}
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_SMS_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSmsText(tmpl.sms);
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-left text-xs transition-all"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{tmpl.title}</div>
                  <div className="text-xs font-mono text-purple-700 dark:text-purple-300 truncate mt-0.5">
                    {tmpl.sms}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SMS Form */}
          <form onSubmit={handleSend} className="space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-700 dark:text-slate-300">
                {t.sms_input_label || "Inbound SMS Text:"}
              </label>
              <textarea
                rows={3}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                placeholder="FLOOD 400050 CRITICAL 4 trapped near station 9820011223"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase font-mono mb-1 text-slate-700 dark:text-slate-300">
                {t.sms_phone_label || "Sender Mobile Number:"}
              </label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-purple-600/30 flex items-center justify-center space-x-2"
            >
              {sending ? (
                <span>{t.sms_sending || "INGESTING & PARSING SMS..."}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.sms_send_btn || "TRANSMIT INBOUND SMS"}</span>
                </>
              )}
            </button>
          </form>

          {/* Decoded Result Inspection Box */}
          {result && (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl space-y-2 font-mono text-xs animate-in fade-in">
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>{t.sms_success_title || "SMS INGESTED & GEOLOCATED"}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-xs space-y-1">
                <div>Decoded Severity: <span className="text-red-600 dark:text-red-400 font-bold uppercase">{result.parsedReport?.severity}</span></div>
                <div>Category: <span className="text-cyan-700 dark:text-cyan-400 font-bold">{result.parsedReport?.category}</span></div>
                <div>Resolved Location: <span className="text-amber-700 dark:text-amber-400 font-semibold">{result.parsedReport?.location_name}</span> ({result.parsedReport?.lat.toFixed(3)}, {result.parsedReport?.lng.toFixed(3)})</div>
                <div>Assigned Unit: <span className="font-bold text-slate-900 dark:text-white">{result.allocationResult?.resource?.name || "Escalated to Dispatcher Queue"}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
