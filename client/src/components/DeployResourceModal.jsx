// client/src/components/DeployResourceModal.jsx
import React, { useState } from "react";
import { 
  X, 
  Plus, 
  Building, 
  LifeBuoy, 
  Package, 
  MapPin, 
  Phone, 
  ShieldCheck 
} from "lucide-react";
import { deployNewResource } from "../utils/api";

export default function DeployResourceModal({
  isOpen,
  onClose,
  initialCoords = null,
  onSuccess
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("rescue_team");
  const [capacity, setCapacity] = useState("50");
  const [lat, setLat] = useState(initialCoords?.lat || 19.0900);
  const [lng, setLng] = useState(initialCoords?.lng || 72.8600);
  const [contactInfo, setContactInfo] = useState("+91 98200 99112 (Cmd. Joshi)");
  const [equipment, setEquipment] = useState("High-clearance rescue truck, 2x Zodiac boats, first aid");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a unit/shelter name");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await deployNewResource({
        name: name.trim(),
        type,
        capacity: parseInt(capacity, 10),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        contact_info: contactInfo.trim(),
        equipment: equipment.trim()
      });
      if (onSuccess) onSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to deploy resource");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-tactical-900 border border-tactical-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-tactical-800 bg-tactical-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Deploy Emergency Resource
              </h2>
              <p className="text-[11px] text-slate-400">
                Register a new relief shelter, rescue crew, or supply depot
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
              Unit / Camp Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SDRF Tactical Rescue Unit 08"
              className="w-full px-3 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                Resource Type:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-2.5 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100"
              >
                <option value="rescue_team">🚤 Rescue Boat / Team</option>
                <option value="shelter">🏛️ Relief Shelter</option>
                <option value="supply_stock">📦 Food / Supply Depot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
                Total Capacity:
              </label>
              <input
                type="number"
                required
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400">Deploy Lat:</span>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-tactical-950 border border-tactical-700 rounded-lg text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Deploy Lng:</span>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-tactical-950 border border-tactical-700 rounded-lg text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
              Contact / Officer In Charge:
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1">
              Equipment / Stock Description:
            </label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-3 py-2 bg-tactical-950 border border-tactical-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>REGISTERING DEPLOYMENT...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>DEPLOY UNIT TO ACTIVE GRID</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
