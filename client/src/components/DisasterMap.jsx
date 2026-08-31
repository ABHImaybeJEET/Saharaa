// client/src/components/DisasterMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Polyline, 
  Circle,
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
  CheckCircle, 
  Crosshair, 
  Radio, 
  Zap, 
  Navigation
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 100% Free, Keyless, Watermark-Free Open Tile Layer Presets
const TILE_LAYERS = {
  street: {
    name: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution: '&copy; OpenStreetMap contributors'
  },
  light: {
    name: "Clean Light",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    attribution: '&copy; OpenStreetMap &bull; &copy; CARTO'
  },
  dark: {
    name: "Dark Tactical",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    attribution: '&copy; OpenStreetMap &bull; &copy; CARTO'
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: [],
    attribution: '&copy; Esri World Imagery'
  }
};

// High-Risk Flood Inundation Zones (Mithi River & Coastal Buffer Polygons)
const FLOOD_INUNDATION_ZONES = [
  {
    id: "mithi-basin-zone",
    name: "Mithi River Lowland Basin (5ft+ Inundation Risk)",
    color: "#0284c7",
    fillColor: "#0284c7",
    fillOpacity: 0.25,
    coordinates: [
      [19.0620, 72.8650],
      [19.0750, 72.8750],
      [19.0880, 72.8900],
      [19.0950, 72.8800],
      [19.0780, 72.8600],
      [19.0650, 72.8550]
    ]
  },
  {
    id: "coastal-surge-zone",
    name: "Bandra-Mahim Tidal Surge Zone",
    color: "#2563eb",
    fillColor: "#2563eb",
    fillOpacity: 0.20,
    coordinates: [
      [19.0350, 72.8300],
      [19.0550, 72.8250],
      [19.0650, 72.8400],
      [19.0450, 72.8500]
    ]
  }
];

// Highly Legible Incident Pin with Location Label
function createReportIcon(report) {
  const severityConfig = {
    critical: { bg: "#dc2626", text: "#ffffff", label: "CRITICAL" },
    high: { bg: "#ea580c", text: "#ffffff", label: "HIGH" },
    medium: { bg: "#ca8a04", text: "#ffffff", label: "MEDIUM" },
    low: { bg: "#0284c7", text: "#ffffff", label: "LOW" }
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
      <!-- Permanent Floating Label with high contrast -->
      <div style="
        background: #0f172a;
        color: #ffffff;
        border: 1.5px solid ${isResolved ? '#475569' : cfg.bg};
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: Inter, system-ui, sans-serif;
      ">
        <span style="color: ${cfg.bg}; font-size: 9px;">●</span>
        <span>${shortName}</span>
        ${isAssigned ? '<span style="color: #38bdf8; font-size: 10px;">⚡</span>' : ''}
      </div>

      <!-- Icon Body -->
      <div class="${isResolved ? '' : report.severity === 'critical' ? 'pulse-pin-critical' : ''}" style="
        background: ${isResolved ? '#475569' : cfg.bg};
        border: 2px solid #ffffff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${isResolved ? '✓' : categoryEmoji}
      </div>

      <!-- Triangle Pointer -->
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${isResolved ? '#475569' : cfg.bg};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-report-marker",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -44]
  });
}

// Highly Legible Resource Marker with Unit Name & Capacity
function createResourceIcon(resource) {
  const typeIcons = {
    rescue_team: { icon: "🚤", color: "#0284c7" },
    shelter: { icon: "🏛️", color: "#16a34a" },
    supply_stock: { icon: "📦", color: "#d97706" }
  };

  const info = typeIcons[resource.type] || { icon: "📍", color: "#0284c7" };
  const isFull = resource.current_load >= resource.capacity;
  const statusColor = isFull ? "#dc2626" : resource.current_load / resource.capacity > 0.75 ? "#d97706" : info.color;
  const shortName = resource.name.split("-")[0].replace("Battalion", "Bn").substring(0, 16);

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
      <!-- Permanent Label with Capacity -->
      <div style="
        background: #0f172a;
        color: #ffffff;
        border: 1.5px solid ${statusColor};
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: Inter, system-ui, sans-serif;
      ">
        <span>${info.icon}</span>
        <span>${shortName}</span>
        <span style="
          background: rgba(255,255,255,0.15);
          color: #ffffff;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 10px;
          font-weight: 800;
        ">${resource.current_load}/${resource.capacity}</span>
      </div>

      <!-- Tactical Diamond -->
      <div style="
        background: #0f172a;
        border: 2px solid ${statusColor};
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        transform: rotate(45deg);
      ">
        <span style="transform: rotate(-45deg); display: block;">${info.icon}</span>
      </div>

      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${statusColor};
        margin-top: 1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-resource-marker",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -44]
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
    if (map) {
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [map]);

  useEffect(() => {
    if (selectedReport && map) {
      map.flyTo([selectedReport.lat, selectedReport.lng], 14, { duration: 1.0 });
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
  onOpenOverrideModal,
  onOpenAiCopilot,
  theme = "dark",
  lang = "en",
  translations
}) {
  const defaultCenter = region?.center || [19.0760, 72.8777];
  const defaultZoom = region?.zoom || 12;
  const mapRef = useRef(null);

  const t = translations ? (translations[lang] || translations.en) : {};

  const [filterMode, setFilterMode] = useState("all");
  const [tileLayerKey, setTileLayerKey] = useState(theme === "light" ? "street" : "dark");
  const [showRadiusCircles, setShowRadiusCircles] = useState(true);
  const [showInundationZones, setShowInundationZones] = useState(true);

  // Sync default tile layer when theme changes
  useEffect(() => {
    setTileLayerKey(theme === "light" ? "street" : "dark");
  }, [theme]);

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
    soundEngine.playUiClick();
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
    }
  };

  const activeTileConfig = TILE_LAYERS[tileLayerKey] || TILE_LAYERS.street;

  return (
    <div className="relative isolate z-0 w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-950 flex flex-col shrink-0 font-sans">
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Quick View Filter Chips */}
        <div className="pointer-events-auto flex items-center space-x-1 p-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs shadow-md max-w-full overflow-x-auto">
          {[
            { id: "all", label: "All Grid" },
            { id: "incidents", label: "🚨 Incidents" },
            { id: "rescue", label: "🚤 Boats" },
            { id: "shelters", label: "🏛️ Shelters" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playUiClick();
                setFilterMode(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterMode === tab.id
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Map Base Switcher & Recenter Controls */}
        <div className="pointer-events-auto flex items-center space-x-1.5 p-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          
          {/* Tile Layer Selector */}
          <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {[
              { key: "street", label: "Street" },
              { key: "satellite", label: "Satellite" },
              { key: "dark", label: "Dark" }
            ].map(l => (
              <button
                key={l.key}
                onClick={() => {
                  soundEngine.playUiClick();
                  setTileLayerKey(l.key);
                }}
                className={`px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                  tileLayerKey === l.key
                    ? "bg-cyan-600 text-white font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all text-xs flex items-center gap-1.5 font-semibold border border-slate-200 dark:border-slate-700"
            title="Recenter Grid Coordinates"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map with touch mobile friendliness */}
      <div className="flex-1 w-full h-full touch-pan-x touch-pan-y">
        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            key={tileLayerKey}
            attribution={activeTileConfig.attribution}
            url={activeTileConfig.url}
            subdomains={activeTileConfig.subdomains || ["a", "b", "c", "d"]}
            maxZoom={19}
          />

          <MapClickHandler onMapClick={onMapClick} />
          <MapViewController center={defaultCenter} zoom={defaultZoom} selectedReport={selectedReport} />
          <HeatmapLayer reports={reports} enabled={heatmapEnabled} />

          {/* 1. Mithi River & Coastal High-Risk Inundation Zones */}
          {showInundationZones && FLOOD_INUNDATION_ZONES.map(zone => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zone.color,
                fillColor: zone.fillColor,
                fillOpacity: zone.fillOpacity,
                weight: 2,
                dashArray: "4, 4"
              }}
            >
              <Tooltip sticky>
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold flex items-center gap-1 text-cyan-800 dark:text-cyan-200">
                    <span>🌊 {zone.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    High water level ingress risk • Priority rescue sector
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

          {/* 2. IMD Hazard Polygons */}
          {alertsEnabled && imdAlerts.map(alert => (
            <Polygon
              key={alert.id}
              positions={alert.coordinates}
              pathOptions={{
                color: alert.color,
                fillColor: alert.fillColor,
                fillOpacity: alert.fillOpacity || 0.20,
                weight: 2,
                dashArray: "5, 5"
              }}
            >
              <Tooltip sticky>
                <div className="p-1 font-sans text-xs">
                  <div className="flex items-center space-x-1 font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                    <span>{alert.title}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-[220px]">
                    {alert.description}
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

          {/* 3. Unit 4km Operational Radius Circles */}
          {showRadiusCircles && displayedResources.map(res => (
            <Circle
              key={`radius-${res.id}`}
              center={[res.lat, res.lng]}
              radius={4000}
              pathOptions={{
                color: res.type === "rescue_team" ? "#0284c7" : "#16a34a",
                fillColor: res.type === "rescue_team" ? "#0284c7" : "#16a34a",
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: "3, 6"
              }}
            />
          ))}

          {/* 4. Dispatch Vector Lines */}
          {allocLinesEnabled && activeAllocationLines.map(({ allocation, report, resource, positions }) => (
            <Polyline
              key={allocation.id}
              positions={positions}
              pathOptions={{
                color: "#0284c7",
                weight: 3,
                opacity: 0.95,
                className: "allocation-dash-line"
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1">
                  <div className="text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>DISPATCH: {allocation.distance_km} KM (~{allocation.eta_minutes}m)</span>
                  </div>
                  <div className="text-slate-900 dark:text-white mt-0.5 font-semibold text-xs">
                    {resource.name} → {report.location_name || 'Site'}
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          ))}

          {/* 5. Resource Markers */}
          {displayedResources.map(resource => (
            <Marker
              key={resource.id}
              position={[resource.lat, resource.lng]}
              icon={createResourceIcon(resource)}
            >
              <Popup>
                <div className="p-3.5 min-w-[240px] font-sans text-slate-900 dark:text-slate-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400">
                      {resource.type.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      resource.current_load >= resource.capacity
                        ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {resource.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold mt-2">
                    {resource.name}
                  </h3>

                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Current Occupancy:</span>
                      <span className="font-bold">
                        {resource.current_load} / {resource.capacity} units
                      </span>
                    </div>

                    {resource.contact_info && (
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        <span>{resource.contact_info}</span>
                      </div>
                    )}

                    {/* Google Maps Directions Action */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-1.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions in Google Maps</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 6. Incident Markers */}
          {displayedReports.map(report => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={createReportIcon(report)}
              eventHandlers={{
                click: () => {
                  soundEngine.playRadarPing();
                  if (onSelectReport) onSelectReport(report);
                }
              }}
            >
              <Popup>
                <div className="p-3.5 min-w-[260px] font-sans text-slate-900 dark:text-slate-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        report.severity === "critical" ? "bg-red-600 text-white" :
                        report.severity === "high" ? "bg-orange-600 text-white" :
                        report.severity === "medium" ? "bg-yellow-600 text-white" :
                        "bg-cyan-600 text-white"
                      }`}>
                        {report.severity}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        #{report.id.slice(-6)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {report.source === "sms" ? "📱 SMS" : "🌐 Web SOS"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold">
                    {report.location_name || "Incident Location"}
                  </div>

                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-800/70 p-2 rounded-lg">
                    {report.description}
                  </p>

                  <div className="mt-3 flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenOverrideModal) onOpenOverrideModal(report);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Dispatch Unit</span>
                      </button>

                      {report.status !== "resolved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveReport(report.id);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>

                    {/* Google Maps Route Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>View Route on Google Maps &rarr;</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Floating Bottom Legend */}
      <div className="px-3 py-2 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-3 overflow-x-auto">
          <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Critical</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-orange-600"></span> High</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2 h-2 rounded-sm bg-cyan-600"></span> Unit</span>
          <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap"><span className="w-3 h-1 border-b-2 border-cyan-600"></span> Inundation Zone</span>
        </div>
        <span className="text-cyan-700 dark:text-cyan-400 font-medium hidden md:inline">Tap any marker to view details & dispatch</span>
      </div>
    </div>
  );
}
