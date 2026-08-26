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
  ShieldAlert, 
  LifeBuoy, 
  Building, 
  Package, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  Crosshair, 
  Layers, 
  Maximize2, 
  Minimize2,
  Radio,
  Flame,
  Zap
} from "lucide-react";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom HTML Pin Generator for Reports (Noire Cyber-Tactical Style)
function createReportIcon(report) {
  const severityColors = {
    critical: { bg: "#ef4444", border: "#dc2626", text: "#fecaca" },
    high: { bg: "#f97316", border: "#ea580c", text: "#fed7aa" },
    medium: { bg: "#eab308", border: "#ca8a04", text: "#fef08a" },
    low: { bg: "#06b6d4", border: "#0891b2", text: "#a5f3fc" }
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
    <div class="relative flex items-center justify-center ${pulseClass}" style="width: 30px; height: 30px;">
      <div style="
        background: ${isResolved ? '#1e293b' : style.bg};
        border: 2px solid ${isResolved ? '#475569' : '#030712'};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        box-shadow: 0 0 15px ${isResolved ? 'transparent' : style.bg + '80'}, 0 4px 10px rgba(0,0,0,0.8);
        color: white;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${isResolved ? "✓" : categoryEmoji}
      </div>
      <div style="
        position: absolute;
        bottom: -5px;
        font-size: 8px;
        font-weight: 800;
        background: #030712;
        color: ${isResolved ? '#94a3b8' : style.bg};
        border: 1px solid ${isResolved ? '#334155' : style.bg + 'aa'};
        padding: 0px 3px;
        border-radius: 3px;
        text-transform: uppercase;
        font-family: monospace;
        letter-spacing: 0.5px;
      ">
        ${report.severity.substring(0, 4)}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-report-pin",
    html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });
}

// Custom HTML Pin Generator for Resources (Noire Rotated Tactical Diamond)
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
    <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
      <div style="
        background: #090e17;
        border: 2px solid ${statusColor};
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 0 12px ${statusColor + '60'}, 0 6px 14px rgba(0,0,0,0.9);
        transform: rotate(45deg);
        cursor: pointer;
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
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
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

// Recenter Map Helper
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

  // Active connected lines
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
    <div className="relative isolate z-0 w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#020617] flex flex-col">
      
      {/* Top Floating HUD Bar (Zero Wasted Space) */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        
        {/* Left: Active Incidents Status Pill */}
        <div className="pointer-events-auto flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono font-bold text-slate-200">
            {reports.filter(r => r.status !== 'resolved').length} Active Incidents
          </span>
          <span className="text-slate-500 font-mono">|</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            {activeAllocationLines.length} Dispatched Routes
          </span>
        </div>

        {/* Right: Map Controls Pill */}
        <div className="pointer-events-auto flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg">
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-all text-xs flex items-center gap-1 font-mono"
            title="Recenter Grid"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full">
        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Noire Dark Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          <MapClickHandler onMapClick={onMapClick} />
          <MapViewController center={defaultCenter} zoom={defaultZoom} selectedReport={selectedReport} />
          <HeatmapLayer reports={reports} enabled={heatmapEnabled} />

          {/* 1. IMD Hazard Polygons (Noire Red/Orange Shading) */}
          {alertsEnabled && imdAlerts.map(alert => (
            <Polygon
              key={alert.id}
              positions={alert.coordinates}
              pathOptions={{
                color: alert.color,
                fillColor: alert.fillColor,
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: "5, 5"
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
                </div>
              </Tooltip>
            </Polygon>
          ))}

          {/* 2. Glowing Cyan Dispatch Lines */}
          {allocLinesEnabled && activeAllocationLines.map(({ allocation, report, resource, positions }) => (
            <Polyline
              key={allocation.id}
              positions={positions}
              pathOptions={{
                color: "#06b6d4",
                weight: 2.5,
                opacity: 0.9,
                className: "allocation-dash-line"
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1 font-mono text-cyan-200">
                  <div className="text-cyan-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>ACTIVE SORTIE ROUTE</span>
                  </div>
                  <div className="text-white mt-0.5 font-semibold">
                    {resource.name} → Incident #{report.id.slice(-6)}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Distance: <strong className="text-cyan-300">{allocation.distance_km} km</strong> | ETA: <strong className="text-amber-300">{allocation.eta_minutes} min</strong>
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
              <Popup>
                <div className="p-3 min-w-[240px] font-sans text-slate-100 bg-slate-950/95 rounded-xl border border-slate-800">
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
                      <span className="text-slate-400">Deployed Load:</span>
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

          {/* 4. Incident Report Markers */}
          {reports.map(report => (
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

                  {/* Action Buttons */}
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

      {/* Floating Bottom Radar Legend */}
      <div className="absolute bottom-3 left-3 z-[400] px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 hidden sm:flex items-center space-x-4 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Critical SOS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span>High Severity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-slate-900 border border-emerald-400"></span>
          <span>Active Resource</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400"></span>
          <span>Dispatch Vector</span>
        </div>
      </div>
    </div>
  );
}
