// client/src/components/DisasterMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Polyline, 
  Tooltip, 
  useMap, 
  useMapEvents 
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { 
  AlertTriangle, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  Crosshair, 
  Layers, 
  Radio, 
  Flame, 
  Zap, 
  HelpCircle, 
  Info,
  Filter,
  Eye
} from "lucide-react";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Highly Legible, Cyber-Tactical Incident Pin with Location Label
function createReportIcon(report) {
  const severityConfig = {
    critical: { bg: "#ef4444", border: "#b91c1c", badgeBg: "#7f1d1d", text: "#fee2e2", label: "CRITICAL" },
    high: { bg: "#f97316", border: "#c2410c", badgeBg: "#7c2d12", text: "#ffedd5", label: "HIGH" },
    medium: { bg: "#eab308", border: "#a16207", badgeBg: "#713f12", text: "#fef9c3", label: "MEDIUM" },
    low: { bg: "#06b6d4", border: "#0e7490", badgeBg: "#164e63", text: "#cffafe", label: "LOW" }
  };

  const cfg = severityConfig[report.severity] || severityConfig.medium;
  const isResolved = report.status === "resolved";
  const isAssigned = report.status === "resource_assigned";

  const categoryEmoji = {
    flood: "🌊",
    trapped: "🚨",
    medical: "🚑",
    shelterless: "🏕️",
    food_water: "🍞",
    landslide: "⛰️"
  }[report.category] || "⚠️";

  const shortName = (report.location_name || "Incident").split(",")[0].substring(0, 16);

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
      <!-- Permanent Floating Label -->
      <div style="
        background: rgba(3, 7, 18, 0.92);
        color: ${isResolved ? '#94a3b8' : cfg.text};
        border: 1px solid ${isResolved ? '#334155' : cfg.bg};
        box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: system-ui, sans-serif;
      ">
        <span style="color: ${cfg.bg}; font-size: 8px;">●</span>
        <span>${shortName}</span>
        ${isAssigned ? '<span style="color: #06b6d4; font-size: 9px;">⚡</span>' : ''}
      </div>

      <!-- Icon Pin Body -->
      <div class="${isResolved ? '' : report.severity === 'critical' ? 'pulse-pin-critical' : ''}" style="
        background: ${isResolved ? '#334155' : cfg.bg};
        border: 2px solid #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.9), 0 0 10px ${isResolved ? 'transparent' : cfg.bg + '80'};
      ">
        ${isResolved ? '✓' : categoryEmoji}
      </div>

      <!-- Triangle Pointer -->
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid ${isResolved ? '#334155' : cfg.bg};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-report-marker",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -45]
  });
}

// Highly Legible Resource Marker with Unit Name & Capacity Gauge
function createResourceIcon(resource) {
  const typeIcons = {
    rescue_team: { icon: "🚤", label: "Rescue Boat", color: "#06b6d4" },
    shelter: { icon: "🏛️", label: "Shelter", color: "#10b981" },
    supply_stock: { icon: "📦", label: "Supply Depot", color: "#f59e0b" }
  };

  const info = typeIcons[resource.type] || { icon: "📍", label: "Unit", color: "#06b6d4" };
  const isFull = resource.current_load >= resource.capacity;
  const statusColor = isFull ? "#ef4444" : resource.current_load / resource.capacity > 0.75 ? "#f59e0b" : info.color;
  const shortName = resource.name.split("-")[0].replace("Battalion", "Bn").substring(0, 16);

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
      <!-- Permanent Label with Capacity -->
      <div style="
        background: rgba(8, 14, 26, 0.94);
        color: #f1f5f9;
        border: 1px solid ${statusColor};
        box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: system-ui, sans-serif;
      ">
        <span style="color: ${statusColor};">${info.icon}</span>
        <span>${shortName}</span>
        <span style="
          background: ${statusColor}25;
          color: ${statusColor};
          padding: 1px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 9px;
        ">${resource.current_load}/${resource.capacity}</span>
      </div>

      <!-- Tactical Square Pin -->
      <div style="
        background: #090e17;
        border: 2px solid ${statusColor};
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.9), 0 0 10px ${statusColor}60;
        transform: rotate(45deg);
      ">
        <span style="transform: rotate(-45deg); display: block;">${info.icon}</span>
      </div>

      <!-- Pointer -->
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid ${statusColor};
        margin-top: 2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-resource-marker",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -45]
  });
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    }
  });
  return null;
}

function HeatmapLayer({ reports, enabled }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (enabled && reports && reports.length > 0) {
      const severityWeights = { critical: 1.0, high: 0.75, medium: 0.45, low: 0.25 };
      const points = reports
        .filter(r => r.status !== "resolved")
        .map(r => [r.lat, r.lng, severityWeights[r.severity] || 0.5]);

      if (points.length > 0 && L.heatLayer) {
        heatLayerRef.current = L.heatLayer(points, {
          radius: 35,
          blur: 25,
          maxZoom: 16,
          max: 1.0,
          gradient: { 0.2: '#06b6d4', 0.4: '#eab308', 0.6: '#f97316', 0.85: '#ef4444', 1.0: '#b91c1c' }
        }).addTo(map);
      }
    }

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, reports, enabled]);

  return null;
}

function MapViewController({ center, zoom, selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (selectedReport) {
      map.flyTo([selectedReport.lat, selectedReport.lng], 14, { duration: 1.2 });
    }
  }, [selectedReport, map]);

  return null;
}

export default function DisasterMap({
  region,
  reports = [],
  resources = [],
  allocations = [],
  imdAlerts = [],
  heatmapEnabled = false,
  alertsEnabled = true,
  allocLinesEnabled = true,
  selectedReport = null,
  onSelectReport,
  onMapClick,
  onResolveReport,
  onOpenOverrideModal
}) {
  const defaultCenter = region?.center || [19.0760, 72.8777];
  const defaultZoom = region?.zoom || 12;
  const mapRef = useRef(null);

  // Quick Layer Filter State
  const [filterMode, setFilterMode] = useState("all"); // "all" | "incidents" | "rescue" | "shelters"

  const displayedReports = reports.filter(r => {
    if (filterMode === "shelters" || filterMode === "rescue") return false;
    return true;
  });

  const displayedResources = resources.filter(res => {
    if (filterMode === "incidents") return false;
    if (filterMode === "rescue") return res.type === "rescue_team";
    if (filterMode === "shelters") return res.type === "shelter" || res.type === "supply_stock";
    return true;
  });

  const activeAllocationLines = allocations
    .filter(a => a.status === "active")
    .map(alloc => {
      const report = reports.find(r => r.id === alloc.report_id);
      const resource = resources.find(res => res.id === alloc.resource_id);
      if (report && resource) {
        return {
          allocation: alloc,
          report,
          resource,
          positions: [
            [resource.lat, resource.lng],
            [report.lat, report.lng]
          ]
        };
      }
      return null;
    })
    .filter(Boolean);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, defaultZoom, { duration: 1.0 });
    }
  };

  return (
    <div className="relative isolate z-0 w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#020617] flex flex-col">
      
      {/* Top Floating Telemetry & Quick Filter HUD */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Quick View Filter Chips */}
        <div className="pointer-events-auto flex items-center space-x-1 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] shadow-xl">
          {[
            { id: "all", label: "Show All" },
            { id: "incidents", label: "🚨 Incidents Only" },
            { id: "rescue", label: "🚤 Rescue Teams" },
            { id: "shelters", label: "🏛️ Shelters" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterMode === tab.id
                  ? "bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Map Grid Controls */}
        <div className="pointer-events-auto flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={handleRecenter}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-all text-xs flex items-center gap-1.5 font-mono font-semibold"
            title="Recenter Grid Coordinates"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="flex-1 w-full h-full min-h-[350px]">
        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Crisp Noire Dark Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          <MapClickHandler onMapClick={onMapClick} />
          <MapViewController center={defaultCenter} zoom={defaultZoom} selectedReport={selectedReport} />
          <HeatmapLayer reports={reports} enabled={heatmapEnabled} />

          {/* 1. IMD Hazard Risk Zones */}
          {alertsEnabled && imdAlerts.map(alert => (
            <Polygon
              key={alert.id}
              positions={alert.coordinates}
              pathOptions={{
                color: alert.color,
                fillColor: alert.fillColor,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: "6, 6"
              }}
            >
              <Tooltip sticky>
                <div className="p-1 font-sans text-xs">
                  <div className="flex items-center space-x-1 font-bold text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-400" />
                    <span>{alert.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 max-w-[220px]">
                    {alert.description}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    Source: {alert.issuedBy}
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

          {/* 2. Dispatch Vector Lines */}
          {allocLinesEnabled && activeAllocationLines.map(({ allocation, report, resource, positions }) => (
            <Polyline
              key={allocation.id}
              positions={positions}
              pathOptions={{
                color: "#06b6d4",
                weight: 3,
                opacity: 0.95,
                className: "allocation-dash-line"
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1 font-mono text-cyan-200">
                  <div className="text-cyan-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>DISPATCH VECTOR: {allocation.distance_km} KM</span>
                  </div>
                  <div className="text-white mt-0.5 font-semibold">
                    {resource.name} → {report.location_name || 'Incident'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Est. Transit Time: <strong className="text-amber-300">~{allocation.eta_minutes} mins</strong>
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          ))}

          {/* 3. Clearly Labeled Resource Markers */}
          {displayedResources.map(resource => (
            <Marker
              key={resource.id}
              position={[resource.lat, resource.lng]}
              icon={createResourceIcon(resource)}
            >
              <Popup>
                <div className="p-3 min-w-[250px] font-sans text-slate-100 bg-slate-950/95 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      {resource.type.replace("_", " ")}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      resource.current_load >= resource.capacity
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}>
                      {resource.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mt-2 leading-snug">
                    {resource.name}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px]">
                      <span className="text-slate-400">Current Load:</span>
                      <span className="font-mono font-bold text-white">
                        {resource.current_load} / {resource.capacity} units
                      </span>
                    </div>

                    {resource.equipment && (
                      <div className="text-[10px] text-slate-400 bg-slate-900/40 p-1.5 rounded">
                        🧰 {resource.equipment}
                      </div>
                    )}

                    {resource.contact_info && (
                      <div className="flex items-center text-[10px] text-slate-300 font-mono pt-1">
                        <Phone className="w-3 h-3 mr-1 text-slate-500" />
                        <span>{resource.contact_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 4. Clearly Labeled Incident Markers */}
          {displayedReports.map(report => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={createReportIcon(report)}
              eventHandlers={{
                click: () => onSelectReport && onSelectReport(report)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[260px] font-sans text-slate-100 bg-slate-950/95 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                        report.severity === "critical" ? "bg-red-950 text-red-400 border border-red-800" :
                        report.severity === "high" ? "bg-orange-950 text-orange-400 border border-orange-800" :
                        report.severity === "medium" ? "bg-yellow-950 text-yellow-400 border border-yellow-800" :
                        "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      }`}>
                        {report.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{report.id.slice(-6)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {report.source === "sms" ? "📱 GSM SMS" : "🌐 Web SOS"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-white">
                    {report.location_name || "Incident Site"}
                  </div>

                  <p className="mt-1 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {report.description}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center text-slate-300">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" />
                      <span>{report.phone}</span>
                    </div>
                    <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Quick Dispatch & Resolve Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOverrideModal(report);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                    >
                      Re-Route Unit
                    </button>

                    {report.status !== "resolved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolveReport(report.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1"
                        title="Mark Mission Resolved"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Floating Bottom Help & Legend Bar */}
      <div className="p-2 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-300">Critical (P1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">High (P2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-slate-900 border border-cyan-400"></span>
            <span className="text-slate-300">Rescue Units</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400"></span>
            <span className="text-slate-300">Dispatch Lines</span>
          </div>
        </div>

        <div className="flex items-center text-[10px] text-cyan-400/90 font-sans">
          <Info className="w-3 h-3 mr-1" />
          <span>Click anywhere on map to report incident or drop relief unit</span>
        </div>
      </div>
    </div>
  );
}
