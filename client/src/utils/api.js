// client/src/utils/api.js
import { io } from "socket.io-client";

const API_BASE = window.location.port === "5173" ? "http://localhost:4000" : "";

export const socket = io(API_BASE || undefined, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export async function fetchState() {
  const res = await fetch(`${API_BASE}/api/state`);
  if (!res.ok) throw new Error("Failed to fetch state");
  return res.json();
}

export async function submitCitizenReport(reportData) {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit report");
  }
  return res.json();
}

export async function submitSmsSimulation(smsData) {
  const res = await fetch(`${API_BASE}/api/sms/incoming`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(smsData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to send simulated SMS");
  }
  return res.json();
}

export async function executeManualOverride(overrideData) {
  const res = await fetch(`${API_BASE}/api/allocations/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(overrideData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Manual override failed");
  }
  return res.json();
}

export async function resolveReport(reportId) {
  const res = await fetch(`${API_BASE}/api/reports/${reportId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to resolve report");
  return res.json();
}

export async function deployNewResource(resourceData) {
  const res = await fetch(`${API_BASE}/api/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resourceData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to deploy resource");
  }
  return res.json();
}

export async function resetDemoState() {
  const res = await fetch(`${API_BASE}/api/demo/reset`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to reset state");
  return res.json();
}

export async function triggerScenarioStep(stepNumber) {
  const res = await fetch(`${API_BASE}/api/demo/scenario-step`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepNumber })
  });
  if (!res.ok) throw new Error("Failed to execute scenario step");
  return res.json();
}
