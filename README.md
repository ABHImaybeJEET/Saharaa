# SAHARAA (सहारा) — Real-Time Disaster Early-Warning & Resource Coordination Platform

> **Emergency Coordination Grid**: A real-time, zero-friction disaster coordination and early-warning mesh connecting citizens, authorities, and field rescue teams during extreme flood & cyclone emergencies.

---

## 📚 Complete Technical Documentation

For the deep-dive system architecture, mathematical formulas, data schemas, API specifications, and workflow sequence diagrams, please refer to:
👉 **[TECHNICAL_DOCUMENTATION.md](file:///c:/Users/abhij/Saharaa/TECHNICAL_DOCUMENTATION.md)**

---

## 🎯 Core Capabilities & System Overview

The platform directly answers the five critical emergency questions:
1. **What is happening?** — Real-time categorized citizen SOS reports and IMD/DDMA disaster early warnings.
2. **Where?** — Centerpiece interactive geospatial map with high-risk flood inundation polygons.
3. **How severe?** — Clear color-coded triage indicators (Critical, High, Medium, Low).
4. **What resources are available?** — Live tracking of rescue teams (NDRF/SDRF boats) and relief shelters with real-time capacity and headroom.
5. **What action should I take?** — **1-Click Smart Dispatch**: Automated Haversine spatial matching calculates straight-line distances and recommends the closest available rescue unit for instant commander deployment.

---

## 🚀 Key User Flows

### 1. 🛡️ Authority Command Dashboard (Centerpiece)
- **Live Centerpiece Map**: Displays all active citizen emergencies, relief shelters, rescue boats, operational radius circles, and flood ingress zones.
- **Incident Triage Queue**: Quick search and filter chips (`All`, `🔥 Critical`, `🌊 Flood`, `🚑 Medical`, `🏕️ Shelter`).
- **Interactive Slide-Over Dispatch Drawer**:
  - Selecting any incident opens a slide-over with location, reported time, callback phone, and photo.
  - **Core Innovation**: Automated Haversine recommendation ranks nearby available teams by proximity and gear suitability.
  - **1-Click Dispatch**: Commander clicks `⚡ DISPATCH [UNIT] NOW` to assign, draw the animated route, and update resource load in real-time.
- **Early-Warning Broadcaster**: 1-click dialog to broadcast Red Alerts & evacuation directives directly to citizens.

### 2. 📱 Citizen Emergency Portal (Mobile-First)
- **3-Step SOS Report**:
  1. *Category & Urgency* (Flood, Medical, Trapped, Shelterless)
  2. *Location* (1-tap GPS auto-detect or landmark)
  3. *Details & Phone* $\to$ 1-Click `BROADCAST SOS` with live ticket & dispatch feedback.
- **Active Early-Warning Alerts**: Real-time official DDMA/IMD alerts with evacuation routes.
- **Find Nearest Shelter**: Live directory of verified relief camps showing distance in km, occupancy bars (e.g. `160 / 350 beds free`), available facilities (RO water, power backup, medical triage), and Google Maps directions.
- **Emergency Helplines**: 1-tap call access to National Emergency (`112`), Ambulance (`108`), Disaster Room (`1077`), and Monsoon Control Desk (`1916`).
- **Offline GSM / SMS SOS**: Works during complete cellular data blackout using plain text SMS (`FLOOD [PINCODE] [DETAILS]`).

---

## 🧭 Step-by-Step Interactive Guide

Click the **`🧭 Interactive Guide`** button in the top navbar to run through the guided end-to-end crisis lifecycle:

1. **Step 1 — Ingestion**: Citizen sends a critical flood SOS at Milan Subway.
2. **Step 2 — Spatial Match**: Real-time marker appears with live Haversine distance calculation to nearest available boat.
3. **Step 3 — 1-Click Dispatch**: Commander clicks Dispatch to assign unit; live animated route is drawn.
4. **Step 4 — Broadcast Warning**: Commander broadcasts an IMD Red Alert flash flood warning.
5. **Step 5 — Citizen Evacuation**: Citizen portal updates with the alert and directs user to the nearest open relief camp.

---

## 🛠️ Tech Stack & Implementation Details

- **Frontend**: React 18, Vite, Tailwind CSS (with CSS variable design tokens), Leaflet & React-Leaflet, Lucide Icons, Socket.io Client, Web Audio API Sound Synthesizer.
- **Backend**: Node.js, Express, Socket.io Server, Haversine Spatial Matching Engine, Regex NLP SMS Ingestion Parser.
- **Geospatial Tiles**: 100% Free, Keyless Esri Canvas Dark Gray, Esri World Imagery Satellite, and OpenStreetMap Standard.
- **Localization**: 100% complete multi-language support across English (`EN`), Hindi (`हि`), and Marathi (`म`).
- **Themes**: High-contrast Dark Tactical and Light Operations Center themes.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install
npm install --prefix client
npm install --prefix server

# 2. Run backend & frontend concurrently
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`

### Production Build
```bash
npm run build --prefix client
node server/index.js
```
