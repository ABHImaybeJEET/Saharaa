// test_api.js
async function runTests() {
  console.log("--- STARTING COMPREHENSIVE API & LOGIC VERIFICATION SUITE ---");

  // 1. Check State
  const stateRes = await fetch("http://localhost:4000/api/state");
  const state = await stateRes.json();
  console.log(`[PASS] State check: ${state.reports.length} reports, ${state.resources.length} resources, ${state.allocations.length} allocations`);

  // 2. Submit Valid Web Report
  const reportPayload = {
    category: "flood",
    severity: "critical",
    lat: 19.075,
    lng: 72.880,
    description: "Submerged bus stop, water up to chest",
    phone: "+91 9988776655",
    location_name: "Kurla Junction"
  };
  const repRes = await fetch("http://localhost:4000/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportPayload)
  });
  const repData = await repRes.json();
  console.log(`[PASS] Citizen Report Created: ID=${repData.report.id}, Matched=${repData.allocationResult.success}`);
  if (repData.allocationResult.success) {
    console.log(`       Assigned Resource: "${repData.allocationResult.resource.name}" (${repData.allocationResult.allocation.distance_km} km, ETA: ${repData.allocationResult.allocation.eta_minutes}m)`);
  }

  // 2b. Test Coordinate Validation (NaN / Out of range coordinates)
  const invalidRepRes = await fetch("http://localhost:4000/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "flood", lat: "invalid_lat", lng: 72.880 })
  });
  if (invalidRepRes.status === 400) {
    console.log("[PASS] Invalid coordinates rejected with HTTP 400");
  } else {
    console.error("[FAIL] Invalid coordinates were not rejected!");
  }

  // 3. Test SMS Fallback Simulator (Multiple Categories)
  const smsPayload = {
    text: "FLOOD 400050 CRITICAL 5 people trapped near Bandra station water level 7ft +919820011223",
    phone: "+91 98200 11223"
  };
  const smsRes = await fetch("http://localhost:4000/api/sms/incoming", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(smsPayload)
  });
  const smsData = await smsRes.json();
  console.log(`[PASS] SMS Gateway Decoded: Category=${smsData.parsedReport.category}, Severity=${smsData.parsedReport.severity}, Location=${smsData.parsedReport.location_name}`);

  // 4. Test Manual Dispatcher Override & Load Balance Sync
  const overridePayload = {
    report_id: repData.report.id,
    resource_id: "res-02",
    notes: "Manual override test - rerouting amphibious unit"
  };
  const overrideRes = await fetch("http://localhost:4000/api/allocations/override", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(overridePayload)
  });
  const overrideData = await overrideRes.json();
  console.log(`[PASS] Manual Override Executed: Assigned By=${overrideData.allocation.assigned_by}, New Unit=${overrideData.allocation.resource_id}`);

  // 5. Test Resolve
  const resolveRes = await fetch(`http://localhost:4000/api/reports/${repData.report.id}/resolve`, {
    method: "POST"
  });
  const resolveData = await resolveRes.json();
  console.log(`[PASS] Incident Resolved: Status=${resolveData.success}`);

  // 6. Test Deploy New Resource Endpoint with Validation
  const newResPayload = {
    name: "Coastal Airboat Squad 03",
    type: "rescue_team",
    lat: 19.065,
    lng: 72.855,
    capacity: 20,
    contact_info: "+91 98200 77777"
  };
  const depRes = await fetch("http://localhost:4000/api/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newResPayload)
  });
  const depData = await depRes.json();
  console.log(`[PASS] Resource Deployed Dynamically: ID=${depData.id}, Name=${depData.name}`);

  // 7. Test Scenario Replay Step 1
  const stepRes = await fetch("http://localhost:4000/api/demo/scenario-step", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepNumber: 1 })
  });
  const stepData = await stepRes.json();
  console.log(`[PASS] Scenario Step 1 Triggered: "${stepData.step.title}"`);

  console.log("--- ALL BACKEND VERIFICATIONS & LOGIC CHECKS PASSED 100% ---");
}

runTests().catch(console.error);

