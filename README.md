# SAHARAA (सहारा) — PS-05: Real-Time Disaster Early-Warning & Resource Coordination Platform

> **Problem Statement (PS-05)**: A real-time, zero-friction disaster coordination and early-warning mesh connecting citizens, authorities, and field rescue teams during extreme flood & cyclone emergencies.

---

## 🎯 Core Problem & Streamlined Architecture

The platform directly answers the five critical emergency questions:
1. **What is happening?** — Real-time categorized citizen SOS reports and IMD/DDMA disaster early warnings.
2. **Where?** — Centerpiece interactive geospatial map with high-risk flood inundation polygons.
3. **How severe?** — Clear color-coded triage indicators (Critical, High, Medium, Low).
4. **What resources are available?** — Live tracking of rescue teams (NDRF/SDRF boats) and relief shelters with real-time capacity and headroom.
5. **What action should I take?** — **1-Click Smart Dispatch**: The system calculates straight-line distances and recommends the closest, suitable, available unit for immediate authority dispatch.

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

## 🎬 30-Second PS-05 Judge Demo Script

Click the **`⚡ 1-Click Demo Tour`** button in the top navbar to run the end-to-end workflow:

1. **Step 1 — Citizen Reports Disaster**: Citizen sends a critical flood SOS at Milan Subway.
2. **Step 2 — Incident Appears on Authority Map**: Real-time marker appears with live distance calculation.
3. **Step 3 — Authority Dispatches Recommended Unit**: System recommends nearest NDRF boat (1.5 km); commander clicks Dispatch with 1 tap.
4. **Step 4 — Authority Broadcasts Disaster Alert**: Commander broadcasts an IMD Red Alert flash flood warning.
5. **Step 5 — Citizen Receives Alert & Finds Shelter**: Citizen portal live updates with the alert and directs user to the nearest open relief camp.

---

## 🛠️ Tech Stack & Implementation Details

- **Frontend**: React 18, Vite, Tailwind CSS (with clean Dark/Light theme tokens), Leaflet & React-Leaflet, Lucide Icons, Socket.io Client, Web Audio API Sound Synthesizer.
- **Backend**: Node.js, Express, Socket.io Server, Haversine Spatial Matching Engine, Regex NLP SMS Ingestion Parser.
- **Localization**: 100% complete multi-language support across English (`EN`), Hindi (`हि`), and Marathi (`म`).
- **Themes**: High-contrast Dark Tactical and Light Operations Center themes.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run backend & frontend concurrently
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
