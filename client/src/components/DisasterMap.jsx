// client/src/components/DisasterMap.jsx
import React, { useEffect, useRef } from "react";
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
  ShieldAlert, 
  LifeBuoy, 
  Home, 
  Package, 
  Ambulance, 
  Phone, 
  Clock, 
  Send, 
  ArrowRight, 
  CheckCircle,
  ExternalLink,
  Flame
} from "lucide-react";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom HTML Pin Generator for Reports
function createReportIcon(report) {
  const severityColors = {
    critical: { bg: "#ef4444", border: "#b91c1c", ring: "rgba(239, 68, 68, 0.4)", text: "#fee2e2" },
    high: { bg: "#f97316", border: "#c2410c", ring: "rgba(249, 115, 22, 0.35)", text: "#ffedd5" },
    medium: { bg: "#eab308", border: "#a16207", ring: "rgba(234, 179, 8, 0.3)", text: "#fef9c3" },
    low: { bg: "#06b6d4", border: "#0e7490", ring: "rgba(6, 182, 212, 0.3)", text: "#cffafe" }
  };

  const style = severityColors[report.severity] || severityColors.medium;
  const isCritical = report.severity === "critical";
  const isHigh = report.severity === "high";
  const isResolved = report.status === "resolved";

  const categoryEmoji = {
    flood: "🌊",
    trapped: "🚨",
    medical: "🚑",
    shelterless: "🏕️",
    food_water: "🍞",
    landslide: "⛰️"
  }[report.category] || "⚠️";

  const pulseClass = isResolved ? "" : isCritical ? "pulse-pin-critical" : isHigh ? "pulse-pin-high" : "";

  const html = `
    <div class="relative flex items-center justify-center ${pulseClass}" style="width: 32px; height: 32px;">
      <div style="
        background-color: ${isResolved ? '#64748b' : style.bg};
        border: 2px solid ${isResolved ? '#334155' : style.border};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        color: white;
        cursor: pointer;
      ">
        ${isResolved ? "✓" : categoryEmoji}
      </div>
      <div style="
        position: absolute;
        bottom: -5px;
        font-size: 9px;
        font-weight: 800;
        background: #0f172a;
        color: ${style.bg};
        border: 1px solid ${style.bg};
        padding: 0px 4px;
        border-radius: 4px;
        text-transform: uppercase;
        font-family: monospace;
      ">
        ${report.severity.substring(0, 4)}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-report-pin",
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Custom HTML Pin Generator for Resources
function createResourceIcon(resource) {
  const typeIcons = {
    rescue_team: "🚤",
    shelter: "🏛️",
    supply_stock: "📦"
  };

  const statusColor = 
    resource.current_load >= resource.capacity ? "#ef4444" :
    resource.current_load / resource.capacity > 0.7 ? "#f59e0b" : "#10b981";

  const emoji = typeIcons[resource.type] || "📍";

  const html = `
    <div class="relative flex items-center justify-center" style="width: 36px; height: 36px;">
      <div style="
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border: 2px solid ${statusColor};
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.6);
        transform: rotate(45deg);
      ">
        <span style="transform: rotate(-45deg); display: block;">${emoji}</span>
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        font-size: 8px;
        font-weight: 700;
        background: #020617;
        color: ${statusColor};
        border: 1px solid ${statusColor};
        padding: 0px 3px;
        border-radius: 3px;
        font-family: monospace;
      ">
        ${resource.current_load}/${resource.capacity}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-resource-pin",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

// Map Click Helper
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// Heatmap Layer using leaflet.heat
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
      const severityWeights = {
        critical: 1.0,
        high: 0.75,
        medium: 0.45,
        low: 0.25
      };

      const points = reports
        .filter(r => r.status !== "resolved")
        .map(r => [
          r.lat,
          r.lng,
          severityWeights[r.severity] || 0.5
        ]);

      if (points.length > 0 && L.heatLayer) {
        heatLayerRef.current = L.heatLayer(points, {
          radius: 35,
          blur: 25,
          maxZoom: 16,
          max: 1.0,
          gradient: {
            0.2: '#06b6d4',
            0.4: '#eab308',
            0.6: '#f97316',
            0.85: '#ef4444',
            1.0: '#b91c1c'
          }
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

// Map View Recenter Controller
function MapViewController({ center, zoom, selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (selectedReport) {
      map.flyTo([selectedReport.lat, selectedReport.lng], 14, {
        duration: 1.2
      });
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

  // Build lines connecting active allocations
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

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-tactical-800 shadow-2xl bg-tactical-950">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Tactical Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapClickHandler onMapClick={onMapClick} />
        <MapViewController center={defaultCenter} zoom={defaultZoom} selectedReport={selectedReport} />
        <HeatmapLayer reports={reports} enabled={heatmapEnabled} />

        {/* 1. IMD Hazard Weather Alerts (Polygons) */}
        {alertsEnabled && imdAlerts.map(alert => (
          <Polygon
            key={alert.id}
            positions={alert.coordinates}
            pathOptions={{
              color: alert.color,
              fillColor: alert.fillColor,
              fillOpacity: alert.fillOpacity,
              weight: 2,
              dashArray: "6, 6"
            }}
          >
            <Tooltip sticky className="custom-imd-tooltip">
              <div className="p-1 font-sans">
                <div className="flex items-center space-x-1 text-xs font-bold" style={{ color: alert.color }}>
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  <span>{alert.title}</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-1 max-w-[240px]">
                  {alert.description}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-1">
                  Issued: {alert.issuedBy}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* 2. Visual Allocation Dispatch Lines (The Star Coordination Feature) */}
        {allocLinesEnabled && activeAllocationLines.map(({ allocation, report, resource, positions }) => (
          <Polyline
            key={allocation.id}
            positions={positions}
            pathOptions={{
              color: "#06b6d4",
              weight: 3,
              opacity: 0.85,
              className: "allocation-dash-line"
            }}
          >
            <Tooltip sticky>
              <div className="text-xs p-1 font-mono">
                <div className="text-cyan-400 font-bold flex items-center gap-1">
                  <span>⚡ ACTIVE DISPATCH ROUTE</span>
                </div>
                <div className="text-slate-200 mt-0.5">
                  <span className="font-semibold text-white">{resource.name}</span> → Incident #{report.id.slice(-6)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Distance: <span className="text-cyan-300 font-bold">{allocation.distance_km} km</span> | 
                  Est. Transit: <span className="text-amber-300 font-bold">{allocation.eta_minutes} min</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Assigned by: {allocation.assigned_by}
                </div>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* 3. Resource Markers */}
        {resources.map(resource => (
          <Marker
            key={resource.id}
            position={[resource.lat, resource.lng]}
            icon={createResourceIcon(resource)}
          >
            <Popup className="tactical-popup">
              <div className="p-2 min-w-[230px] font-sans text-slate-900">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {resource.type.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    resource.current_load >= resource.capacity
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {resource.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                  {resource.name}
                </h3>

                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                    <span>Active Load / Max:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {resource.current_load} / {resource.capacity} units
                    </span>
                  </div>

                  {resource.equipment && (
                    <div className="text-[11px] text-slate-500 italic">
                      🧰 {resource.equipment}
                    </div>
                  )}

                  {resource.contact_info && (
                    <div className="flex items-center text-[11px] text-slate-700 font-medium pt-1">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" />
                      <span>{resource.contact_info}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Citizen Report Markers */}
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createReportIcon(report)}
            eventHandlers={{
              click: () => onSelectReport && onSelectReport(report)
            }}
          >
            <Popup className="tactical-popup">
              <div className="p-2.5 min-w-[260px] font-sans text-slate-900">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                      report.severity === "critical" ? "bg-red-100 text-red-700" :
                      report.severity === "high" ? "bg-orange-100 text-orange-700" :
                      report.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-cyan-100 text-cyan-800"
                    }`}>
                      {report.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{report.id.slice(-6)}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {report.source === "sms" ? "📱 SMS Fallback" : "🌐 Web Form"}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-800">
                  {report.location_name || "Disaster Coordinate Site"}
                </div>

                <p className="mt-1 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  {report.description}
                </p>

                {report.photo_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-28">
                    <img src={report.photo_url} alt="Incident field capture" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-slate-500" />
                    <span className="font-mono">{report.phone}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-3 flex items-center gap-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOverrideModal(report);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-sm"
                  >
                    Dispatcher Override
                  </button>

                  {report.status !== "resolved" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolveReport(report.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                      title="Mark resolved and free up assigned unit"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] glass-panel px-3 py-2 rounded-xl text-[11px] border border-tactical-700 text-slate-300 hidden md:block">
        <div className="font-bold text-xs text-white mb-1 flex items-center gap-1">
          <span>Map Radar Key</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>Critical Report</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-emerald-400"></span>
            <span>Active Resource</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-400"></span>
            <span>Dispatch Vector</span>
          </div>
        </div>
      </div>
    </div>
  );
}
