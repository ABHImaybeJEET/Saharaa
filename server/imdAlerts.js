// server/imdAlerts.js

export const IMD_WEATHER_ALERTS = [
  {
    id: "imd-alert-red-01",
    title: "IMD RED ALERT: Flash Flood & Coastal Surge Warning",
    level: "RED",
    issuedBy: "India Meteorological Department (IMD) - Regional Cyclone Warning Centre",
    bulletinNo: "IMD/MUM/WARN/2026/08-04",
    issuedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    description: "Extremely heavy rainfall (>204.4 mm in 24h) and high tide surge expected across coastal lowlands. Inundation danger in low-lying subways and basins.",
    affectedDistricts: ["Mumbai Suburban", "Mumbai City", "Thane"],
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.22,
    coordinates: [
      [19.1450, 72.8200],
      [19.1550, 72.8700],
      [19.0950, 72.9200],
      [19.0350, 72.8800],
      [19.0100, 72.8150],
      [19.0750, 72.8250]
    ]
  },
  {
    id: "imd-alert-orange-02",
    title: "IMD ORANGE ALERT: Gusty Gale Winds & Creek Overflow",
    level: "ORANGE",
    issuedBy: "State Disaster Management Authority (SDMA)",
    bulletinNo: "SDMA/HAZARD/2026/11",
    issuedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    description: "Squally winds 65-80 kmph gusting to 90 kmph. Structural risk to temporary sheds, uprooted trees, and localized waterlogging.",
    affectedDistricts: ["Thane Creek Basin", "Navi Mumbai"],
    color: "#f97316",
    fillColor: "#f97316",
    fillOpacity: 0.15,
    coordinates: [
      [19.2200, 72.9400],
      [19.2000, 73.0100],
      [19.0900, 73.0300],
      [19.0500, 72.9600],
      [19.1200, 72.9300]
    ]
  }
];
