// server/store.js

export const DEFAULT_REGION = {
  name: "Coastal Metro Zone (Mumbai - Thane Basin)",
  center: [19.0760, 72.8777],
  zoom: 12
};

// Initial Seed Resources
export const SEED_RESOURCES = [
  {
    id: "res-01",
    name: "NDRF Urban Rescue Battalion 05",
    type: "rescue_team",
    lat: 19.0728,
    lng: 72.8826,
    capacity: 40,
    current_load: 18,
    status: "available",
    contact_info: "+91 98201 11223 (Capt. Verma)",
    equipment: "3x Inflatable Zodiac Boats, High-water wading gear, Paramedics"
  },
  {
    id: "res-02",
    name: "SDRF Water Evacuation Unit Alpha",
    type: "rescue_team",
    lat: 19.0435,
    lng: 72.8450,
    capacity: 25,
    current_load: 10,
    status: "available",
    contact_info: "+91 98202 33445 (Cmd. Nair)",
    equipment: "2x Rigid Hull Inflatable Boats, Drone Recon, Life Jackets"
  },
  {
    id: "res-03",
    name: "St. Jude Central Relief Shelter",
    type: "shelter",
    lat: 19.0880,
    lng: 72.8950,
    capacity: 350,
    current_load: 190,
    status: "available",
    contact_info: "+91 98203 55667 (Shelter Incharge Anita)",
    equipment: "Dry bedding, Medical triage station, Clean RO water plant, Generator"
  },
  {
    id: "res-04",
    name: "North High Ground Stadium Camp",
    type: "shelter",
    lat: 19.1197,
    lng: 72.8468,
    capacity: 500,
    current_load: 480,
    status: "available",
    contact_info: "+91 98204 77889 (Dr. Shah)",
    equipment: "Large covered hall, Pediatric emergency wing, Community kitchen"
  },
  {
    id: "res-05",
    name: "BMC Central Emergency Food & Supply Hub",
    type: "supply_stock",
    lat: 19.0178,
    lng: 72.8300,
    capacity: 2000,
    current_load: 650,
    status: "available",
    contact_info: "+91 98205 99001 (Logistics Officer Rao)",
    equipment: "5,000 MRE ration packs, 10,000L bottled water, Medical kits"
  },
  {
    id: "res-06",
    name: "Mobile Trauma & Medical Aid Ambulance 09",
    type: "rescue_team",
    lat: 19.1360,
    lng: 72.8250,
    capacity: 15,
    current_load: 14,
    status: "available",
    contact_info: "+91 98206 12345 (Dr. Mukherjee)",
    equipment: "Critical care mobile ICU, Oxygen concentrators, Defibrillator"
  }
];

// Initial Seed Reports
export const SEED_REPORTS = [
  {
    id: "rep-01",
    category: "flood",
    severity: "critical",
    lat: 19.0680,
    lng: 72.8690,
    description: "Water level crossed 5ft near Milan Subway. 8 people including 2 elders stranded on car roofs.",
    photo_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80",
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: "resource_assigned",
    phone: "+91 98765 43210",
    source: "web",
    location_name: "Milan Subway / Santacruz"
  },
  {
    id: "rep-02",
    category: "medical",
    severity: "high",
    lat: 19.0550,
    lng: 72.8320,
    description: "Elderly patient having severe shortness of breath, ground floor inundated, power cut.",
    photo_url: null,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: "resource_assigned",
    phone: "+91 98111 22334",
    source: "sms",
    location_name: "Bandra West, 16th Road"
  },
  {
    id: "rep-03",
    category: "shelterless",
    severity: "medium",
    lat: 19.1120,
    lng: 72.8620,
    description: "Slum settlement tin roofs damaged by gusty cyclone winds. 25 families need dry shelter and food.",
    photo_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "new",
    phone: "+91 98222 33445",
    source: "web",
    location_name: "Andheri East, MIDC Area"
  }
];

// Initial Seed Allocations
export const SEED_ALLOCATIONS = [
  {
    id: "alloc-01",
    report_id: "rep-01",
    resource_id: "res-01",
    distance_km: 1.54,
    assigned_at: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    status: "active",
    eta_minutes: 8,
    assigned_by: "AUTO_SYSTEM"
  },
  {
    id: "alloc-02",
    report_id: "rep-02",
    resource_id: "res-02",
    distance_km: 1.82,
    assigned_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "active",
    eta_minutes: 11,
    assigned_by: "AUTO_SYSTEM"
  }
];

class Store {
  constructor() {
    this.reset();
  }

  reset() {
    this.reports = JSON.parse(JSON.stringify(SEED_REPORTS));
    this.resources = JSON.parse(JSON.stringify(SEED_RESOURCES));
    this.allocations = JSON.parse(JSON.stringify(SEED_ALLOCATIONS));
    this.auditLogs = [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
        message: "AUTO-MATCH: Assigned NDRF Urban Rescue Battalion 05 to Critical Flood incident rep-01 (1.54 km away)",
        type: "allocation"
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        message: "AUTO-MATCH: Assigned SDRF Water Evacuation Unit Alpha to High Medical incident rep-02 (1.82 km away)",
        type: "allocation"
      }
    ];
  }

  getState() {
    return {
      reports: this.reports,
      resources: this.resources,
      allocations: this.allocations,
      auditLogs: this.auditLogs,
      metrics: this.computeMetrics()
    };
  }

  computeMetrics() {
    const totalReports = this.reports.length;
    const criticalReports = this.reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
    const activeAllocations = this.allocations.filter(a => a.status === 'active').length;
    const escalatedReports = this.reports.filter(r => r.status === 'escalated').length;
    const totalCapacity = this.resources.reduce((sum, r) => sum + r.capacity, 0);
    const totalLoad = this.resources.reduce((sum, r) => sum + r.current_load, 0);
    const availableCapacityPct = totalCapacity > 0 ? Math.round(((totalCapacity - totalLoad) / totalCapacity) * 100) : 0;

    return {
      totalReports,
      criticalReports,
      activeAllocations,
      escalatedReports,
      availableCapacityPct,
      totalResources: this.resources.length
    };
  }

  addReport(report) {
    this.reports.unshift(report);
    return report;
  }

  updateReport(reportId, updates) {
    const idx = this.reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      this.reports[idx] = { ...this.reports[idx], ...updates };
      return this.reports[idx];
    }
    return null;
  }

  addResource(resource) {
    this.resources.push(resource);
    return resource;
  }

  updateResource(resourceId, updates) {
    const idx = this.resources.findIndex(r => r.id === resourceId);
    if (idx !== -1) {
      this.resources[idx] = { ...this.resources[idx], ...updates };
      return this.resources[idx];
    }
    return null;
  }

  addAllocation(allocation) {
    this.allocations.unshift(allocation);
    return allocation;
  }

  updateAllocation(allocationId, updates) {
    const idx = this.allocations.findIndex(a => a.id === allocationId);
    if (idx !== -1) {
      this.allocations[idx] = { ...this.allocations[idx], ...updates };
      return this.allocations[idx];
    }
    return null;
  }

  addAuditLog(message, type = "info") {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      message,
      type
    });
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }
}

export const store = new Store();
