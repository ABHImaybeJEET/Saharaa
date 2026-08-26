# Saharaa (PS-05): Real-Time Disaster Early-Warning & Resource Allocation Mesh

**Saharaa** is a real-time crisis coordination platform built for rapid tactical response during floods, cyclones, and urban emergencies. It bridges citizen SOS reporting with automated spatial allocation, live visual dispatch vectors, offline GSM/SMS fallback parsing, IMD hazard risk overlays, and human dispatcher overrides.

---

## 🌟 Pitch-Winning Differentiators

Most disaster dashboards only display static pins on a map. Saharaa wins on **actionable coordination**:
1. **Visible Live Allocation Vectors**: The moment an incident is logged (via web or SMS), the allocation engine computes straight-line Haversine distances, selects the closest eligible team/shelter with available capacity, and draws glowing animated dispatch routes directly on the map with distance & ETA.
2. **Offline SMS / IVR Fallback Gateway**: Internet and 4G/5G often collapse in severe cyclones. Saharaa features an interactive GSM/SMS parser that accepts plain text (`FLOOD [PINCODE] [SEVERITY] [DETAILS]`), resolves locations, and routes reports into the exact same dispatch pipeline without requiring an app or smartphone.
3. **Human-in-the-Loop Dispatcher Override**: Automation handles the high-volume obvious matches, but human dispatchers can override or re-route any unit with 1 click when situational judgment demands it.
4. **IMD Weather Alert Layer**: Official red/orange weather hazard polygons rendered distinctly from citizen reports for dual-layer situational awareness.
5. **1-Click Live Flood Scenario Replay**: A built-in 3-step demo controller allowing judges to watch a cascading disaster scenario unfold in real-time.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)

### 2. Run the Platform

From the project root:

```bash
# Terminal 1: Backend Server (Port 4000)
cd server
npm install
npm run dev

# Terminal 2: Frontend Dashboard (Port 5173)
cd client
npm install
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🕹️ 60-Second Judge Demo Script

1. **Tour the Command Grid**: Point out the dark tactical map, severity-pulsing incident pins (🔴 Critical, 🟠 High), resource bases (🚤 Rescue Boats, 🏛️ Shelters, 📦 Supply Depots), and the live **IMD Red Alert hazard polygon**.
2. **Demonstrate Web SOS**: Click **"Citizen Report"**, pick **"Critical"** and **"Flood Inundation"**, tap **"Broadcast Emergency SOS"**. Point out the immediate marker spawn, the glowing cyan dispatch line connecting the nearest unit, and the live audit stream update.
3. **Demonstrate Offline SMS Fallback**: Click **"SMS Simulator"**, select the preset `FLOOD 400050 CRITICAL 4 people stranded on rooftop...`, click **"Simulate Incoming SMS"**. Show how the backend decodes the unstructured text, geolocates pincode `400050`, and routes it directly to the dashboard.
4. **Demonstrate Dispatcher Override**: Click on any incident card in the left queue, click **"Override"**, pick an alternate unit, and show that the previous unit's capacity is restored while the new unit is re-routed.
5. **Demonstrate Scenario Step 3 (Capacity Saturation & Escalation)**: Click **"3. Overload/Escalate"** in the top navbar to show what happens when local units are full — the system automatically flags the incident with an amber badge for emergency escalation.

---

## 🏗️ Architecture & Core Entities

```
Saharaa/
├── server/
│   ├── index.js             # Express + Socket.io server
│   ├── allocation.js        # Haversine distance matrix & capability matcher
│   ├── store.js             # Seed state, loads & capacities
│   ├── imdAlerts.js         # IMD Weather Alert GeoJSON polygons
│   └── smsGateway.js        # SMS parser & pincode geocoder
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Layer toggles & scenario controller
│   │   │   ├── MetricCards.jsx          # Tactical indicator stats
│   │   │   ├── DisasterMap.jsx          # Leaflet map, vector lines & heatmaps
│   │   │   ├── TriageQueue.jsx          # Priority-sorted incident feed
│   │   │   ├── ResourcePanel.jsx        # Relief camp & boat capacity bars
│   │   │   ├── CitizenReportModal.jsx   # Zero-login mobile report modal
│   │   │   ├── SmsSimulatorModal.jsx    # Offline SMS gateway console
│   │   │   ├── ManualOverrideModal.jsx  # Dispatcher override modal
│   │   │   ├── DeployResourceModal.jsx  # Dynamic unit registration modal
│   │   │   └── AuditFeed.jsx            # Live transparent decision logs
│   │   ├── utils/api.js                 # Socket.io & REST client
│   │   ├── index.css                    # Tactical animations & glassmorphic tokens
│   │   └── App.jsx                      # Master layout & real-time sync
```
