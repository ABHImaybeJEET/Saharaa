// server/index.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { store, DEFAULT_REGION } from "./store.js";
import { matchReportToResource, calculateHaversineDistanceKm } from "./allocation.js";
import { parseIncomingSms } from "./smsGateway.js";
import { IMD_WEATHER_ALERTS } from "./imdAlerts.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Process and execute allocation for a report
function processReportAllocation(report, assignedBy = "AUTO_SYSTEM") {
  const result = matchReportToResource(report, store.resources);

  if (result.matched) {
    // 1. Update Resource Load & Status
    const matchedRes = result.resource;
    const newLoad = matchedRes.current_load + 1;
    const newStatus = newLoad >= matchedRes.capacity ? "full" : "available";
    store.updateResource(matchedRes.id, { current_load: newLoad, status: newStatus });

    // 2. Update Report Status
    store.updateReport(report.id, { status: "resource_assigned" });

    // 3. Create Allocation Record
    const allocation = {
      id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      report_id: report.id,
      resource_id: matchedRes.id,
      distance_km: result.distanceKm,
      eta_minutes: result.etaMinutes,
      assigned_at: new Date().toISOString(),
      status: "active",
      assigned_by: assignedBy
    };
    store.addAllocation(allocation);

    // 4. Audit Log
    store.addAuditLog(
      `[MATCHED] ${assignedBy}: Dispatched "${matchedRes.name}" (${matchedRes.type}) to ${report.severity.toUpperCase()} incident at ${report.location_name || 'incident site'} (${result.distanceKm} km, ETA ${result.etaMinutes} min)`,
      "allocation"
    );

    return { success: true, allocation, report: store.reports.find(r => r.id === report.id), resource: matchedRes };
  } else {
    // Escalate to manual queue
    store.updateReport(report.id, { status: "escalated" });
    store.addAuditLog(
      `[ESCALATION] Report #${report.id.slice(-6)} (${report.severity.toUpperCase()} ${report.category}) could not be auto-assigned: ${result.reason}. Flagged for manual dispatcher review.`,
      "warning"
    );
    return { success: false, reason: result.reason, report: store.reports.find(r => r.id === report.id) };
  }
}

// ---------------- REST API ROUTES ----------------

// Get Full State
app.get("/api/state", (req, res) => {
  res.json({
    region: DEFAULT_REGION,
    ...store.getState(),
    imdAlerts: IMD_WEATHER_ALERTS
  });
});

// Create Citizen Report (from Web Form)
app.post("/api/reports", (req, res) => {
  const { category, severity, lat, lng, description, photo_url, phone, location_name } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude coordinates are required." });
  }

  const newReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    category: category || "flood",
    severity: severity || "medium",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    description: description || "Disaster assistance requested",
    photo_url: photo_url || null,
    timestamp: new Date().toISOString(),
    status: "new",
    phone: phone || "+91 99000 00000",
    source: "web",
    location_name: location_name || `Coordinate (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`
  };

  store.addReport(newReport);
  store.addAuditLog(`[NEW REPORT] Citizen reported ${newReport.severity.toUpperCase()} ${newReport.category} incident via Web Portal at ${newReport.location_name}`, "report");

  // Run Allocation
  const allocResult = processReportAllocation(newReport, "AUTO_SYSTEM");

  // Broadcast to all connected clients
  io.emit("state_update", {
    type: "report_created",
    data: store.getState(),
    latestReport: newReport,
    allocationResult: allocResult
  });

  res.status(201).json({
    report: newReport,
    allocationResult: allocResult
  });
});

// Incoming SMS Fallback Endpoint
app.post("/api/sms/incoming", (req, res) => {
  const { text, Body, From, phone } = req.body;
  const rawContent = text || Body || "";
  const senderNumber = From || phone || "+91 98200 99887";

  if (!rawContent.trim()) {
    return res.status(400).json({ error: "SMS text body cannot be empty" });
  }

  const parsedReport = parseIncomingSms(rawContent, senderNumber);
  store.addReport(parsedReport);
  store.addAuditLog(`[SMS RECEIVED] Parsed SMS from ${senderNumber}: "${rawContent}" -> Classified as ${parsedReport.severity.toUpperCase()} ${parsedReport.category}`, "sms");

  // Run Allocation
  const allocResult = processReportAllocation(parsedReport, "AUTO_SYSTEM");

  // Broadcast
  io.emit("state_update", {
    type: "sms_report_created",
    data: store.getState(),
    latestReport: parsedReport,
    allocationResult: allocResult
  });

  res.status(201).json({
    status: "success",
    parsedReport,
    allocationResult: allocResult
  });
});

// Broadcast Emergency Alert from Authority to All Citizens
app.post("/api/alerts/broadcast", (req, res) => {
  const { title, message, level, area } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Alert title and message are required." });
  }

  const newAlert = {
    id: `alert-${Date.now()}`,
    level: level || "red",
    title,
    message,
    area: area || "Coastal Metro Region",
    timestamp: new Date().toISOString(),
    issued_by: "Disaster Management Authority (Authority Broadcast)"
  };

  store.addBroadcastAlert(newAlert);
  store.addAuditLog(`[AUTHORITY BROADCAST] ${newAlert.level.toUpperCase()} ALERT: "${newAlert.title}" broadcasted across all channels`, "warning");

  io.emit("state_update", {
    type: "alert_broadcasted",
    data: store.getState(),
    alert: newAlert
  });

  res.status(201).json({ success: true, alert: newAlert, data: store.getState() });
});

// Manual Dispatcher Override / Reassignment / 1-Click Direct Dispatch
app.post("/api/allocations/override", (req, res) => {
  const { report_id, resource_id, notes } = req.body;

  const report = store.reports.find(r => r.id === report_id);
  const newResource = store.resources.find(r => r.id === resource_id);

  if (!report || !newResource) {
    return res.status(404).json({ error: "Report or Resource not found" });
  }

  // 1. Check if there was an existing active allocation for this report
  const existingAllocIdx = store.allocations.findIndex(a => a.report_id === report_id && a.status === "active");
  if (existingAllocIdx !== -1) {
    const prevAlloc = store.allocations[existingAllocIdx];
    store.updateAllocation(prevAlloc.id, { status: "overridden" });
    
    // Decrement previous resource load
    const prevRes = store.resources.find(r => r.id === prevAlloc.resource_id);
    if (prevRes && prevRes.current_load > 0) {
      const updatedLoad = prevRes.current_load - 1;
      store.updateResource(prevRes.id, {
        current_load: updatedLoad,
        status: updatedLoad >= prevRes.capacity ? "full" : "available"
      });
    }
  }

  // 2. Increment new resource load
  const newLoad = newResource.current_load + 1;
  store.updateResource(newResource.id, {
    current_load: newLoad,
    status: newLoad >= newResource.capacity ? "full" : "available"
  });

  // 3. Compute distance
  const distanceKm = calculateHaversineDistanceKm(report.lat, report.lng, newResource.lat, newResource.lng);
  const etaMinutes = Math.max(3, Math.round(distanceKm * 4 + 3));

  // 4. Create new allocation
  const newAlloc = {
    id: `alloc-${Date.now()}-override`,
    report_id: report.id,
    resource_id: newResource.id,
    distance_km: distanceKm,
    eta_minutes: etaMinutes,
    assigned_at: new Date().toISOString(),
    status: "active",
    assigned_by: "DISPATCHER_DISPATCH",
    notes: notes || "Dispatcher resource allocation"
  };
  store.addAllocation(newAlloc);

  // 5. Update Report Status
  store.updateReport(report.id, { status: "resource_assigned" });

  store.addAuditLog(
    `[DISPATCHED] Authority assigned ${newResource.name} to Incident #${report.id.slice(-6)} (${distanceKm} km away, ETA ${etaMinutes}m). Notes: ${notes || 'Priority dispatch'}`,
    "override"
  );

  // Broadcast
  io.emit("state_update", {
    type: "allocation_overridden",
    data: store.getState(),
    allocation: newAlloc
  });

  res.json({
    success: true,
    allocation: newAlloc,
    data: store.getState()
  });
});

// Resolve an incident
app.post("/api/reports/:id/resolve", (req, res) => {
  const { id } = req.params;
  const report = store.reports.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  store.updateReport(id, { status: "resolved", resolved_at: new Date().toISOString() });

  // Free up allocated resource if any
  const alloc = store.allocations.find(a => a.report_id === id && a.status === "active");
  if (alloc) {
    store.updateAllocation(alloc.id, { status: "completed" });
    const resUnit = store.resources.find(r => r.id === alloc.resource_id);
    if (resUnit && resUnit.current_load > 0) {
      const updatedLoad = resUnit.current_load - 1;
      store.updateResource(resUnit.id, {
        current_load: updatedLoad,
        status: updatedLoad >= resUnit.capacity ? "full" : "available"
      });
    }
  }

  store.addAuditLog(`[RESOLVED] Incident #${id.slice(-6)} marked as resolved. Resource freed for next mission.`, "success");

  io.emit("state_update", {
    type: "report_resolved",
    data: store.getState(),
    resolvedReportId: id
  });

  res.json({ success: true, data: store.getState() });
});

// Add New Resource dynamically
app.post("/api/resources", (req, res) => {
  const { name, type, lat, lng, capacity, contact_info, equipment } = req.body;
  if (!name || !lat || !lng || !capacity) {
    return res.status(400).json({ error: "Name, lat, lng, and capacity are required" });
  }

  const newResource = {
    id: `res-${Date.now()}`,
    name,
    type: type || "rescue_team",
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    capacity: parseInt(capacity, 10),
    current_load: 0,
    status: "available",
    contact_info: contact_info || "HQ Command",
    equipment: equipment || "Standard Emergency Deployment Kit"
  };

  store.addResource(newResource);
  store.addAuditLog(`[NEW RESOURCE DEPLOYED] Unit "${newResource.name}" deployed at (${newResource.lat.toFixed(3)}, ${newResource.lng.toFixed(3)}) with capacity ${newResource.capacity}`, "info");

  io.emit("state_update", {
    type: "resource_added",
    data: store.getState(),
    resource: newResource
  });

  res.status(201).json(newResource);
});

// Reset Demo State
app.post("/api/demo/reset", (req, res) => {
  store.reset();
  store.addAuditLog("[SYSTEM RESET] Restored default disaster simulation state", "info");

  io.emit("state_update", {
    type: "state_reset",
    data: store.getState()
  });

  res.json({ success: true, data: store.getState() });
});

// 5-Step Progressive Disaster Simulation for Demonstrations
const SCENARIO_STEPS = [
  {
    step: 1,
    title: "1. Cyclone Gusts & High Tide Waterlogging",
    description: "Citizen reports emergency flood condition near Kurla Station via web form.",
    report: {
      category: "flood",
      severity: "high",
      lat: 19.0660,
      lng: 72.8790,
      description: "Mithi river swelling rapidly. 6 commuters stranded at Kurla West bus stand with rising tide.",
      location_name: "Kurla West Station Hub",
      phone: "+91 98200 44556"
    }
  },
  {
    step: 2,
    title: "2. Offline GSM / SMS: Critical Inundation",
    description: "Offline citizen in mobile data blackout sends plain text SMS from Bandra Reclamation.",
    sms: {
      text: "FLOOD 400050 CRITICAL 4 people stranded on rooftop ground floor submerged need boat +919833445566",
      phone: "+91 98334 45566"
    }
  },
  {
    step: 3,
    title: "3. Rooftop Medical Emergency (Oxygen Patient)",
    description: "Urgent medical SOS received for elderly patient needing immediate mobile ICU evacuation.",
    report: {
      category: "medical",
      severity: "critical",
      lat: 19.0550,
      lng: 72.8320,
      description: "Diabetic oxygen-dependent patient on 1st floor balcony. Floodwater rising to 4.5ft.",
      location_name: "Bandra West, 16th Road",
      phone: "+91 98199 22334"
    }
  },
  {
    step: 4,
    title: "4. Slum Shelter Collapse & Mass Displacement",
    description: "Cyclone gale winds rip off tin roofs in Andheri MIDC, displacing 35 families.",
    report: {
      category: "shelterless",
      severity: "high",
      lat: 19.1150,
      lng: 72.8700,
      description: "Severe roof destruction across 30 chawl houses. 35 families with infants need immediate dry shelter & food.",
      location_name: "Andheri East MIDC Settlement",
      phone: "+91 98222 33445"
    }
  },
  {
    step: 5,
    title: "5. Capacity Saturation & Inter-Agency Escalation",
    description: "Mass evacuation call in Andheri basement collapse. Triggers saturation and flags unassigned report for human dispatcher review.",
    report: {
      category: "trapped",
      severity: "critical",
      lat: 19.1250,
      lng: 72.8350,
      description: "Severe building basement collapse risk. 45 residents stranded on 2nd floor balcony.",
      location_name: "Andheri West, Lokhandwala Complex",
      phone: "+91 98199 88776"
    }
  }
];

app.post("/api/demo/scenario-step", (req, res) => {
  const { stepNumber } = req.body;
  const targetStep = SCENARIO_STEPS.find(s => s.step === parseInt(stepNumber, 10));

  if (!targetStep) {
    return res.status(400).json({ error: "Invalid scenario step number (1 to 5)" });
  }

  let result;
  if (targetStep.sms) {
    const parsed = parseIncomingSms(targetStep.sms.text, targetStep.sms.phone);
    store.addReport(parsed);
    const alloc = processReportAllocation(parsed, "AUTO_SYSTEM");
    result = { type: "sms", report: parsed, allocationResult: alloc };
  } else if (targetStep.report) {
    const newReport = {
      id: `demo-rep-${Date.now()}`,
      ...targetStep.report,
      photo_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80",
      timestamp: new Date().toISOString(),
      status: "new",
      source: "demo_scenario"
    };
    store.addReport(newReport);
    const alloc = processReportAllocation(newReport, "AUTO_SYSTEM");
    result = { type: "web", report: newReport, allocationResult: alloc };
  }

  io.emit("state_update", {
    type: "scenario_step_executed",
    step: targetStep,
    data: store.getState(),
    result
  });

  res.json({
    success: true,
    step: targetStep,
    result,
    data: store.getState()
  });
});

// Socket.io Connection Handlers
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.emit("initial_state", {
    region: DEFAULT_REGION,
    ...store.getState(),
    imdAlerts: IMD_WEATHER_ALERTS
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Saharaa Backend Server] Running on http://localhost:${PORT}`);
});
