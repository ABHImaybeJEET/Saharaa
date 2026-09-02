// server/allocation.js

/**
 * Calculates Haversine distance between two lat/lng points in kilometers.
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const pLat1 = Number(lat1);
  const pLon1 = Number(lon1);
  const pLat2 = Number(lat2);
  const pLon2 = Number(lon2);

  if (isNaN(pLat1) || isNaN(pLon1) || isNaN(pLat2) || isNaN(pLon2)) {
    return 9999;
  }

  const R = 6371; // Radius of the Earth in km
  const dLat = (pLat2 - pLat1) * (Math.PI / 180);
  const dLon = (pLon2 - pLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pLat1 * (Math.PI / 180)) *
    Math.cos(pLat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Maps citizen report categories to preferred resource types in order of priority.
 */
export const CATEGORY_RESOURCE_PRIORITY = {
  flood: ["rescue_team", "shelter"],
  trapped: ["rescue_team"],
  medical: ["rescue_team", "shelter"],
  shelterless: ["shelter", "rescue_team"],
  food_water: ["supply_stock", "shelter"],
  landslide: ["rescue_team", "shelter"],
  other: ["rescue_team", "shelter", "supply_stock"]
};

/**
 * Matches an incoming citizen report to the most optimal resource.
 * Criteria:
 * 1. Resource type priority based on incident category.
 * 2. Status 'available' (or 'en_route' if capacity > current_load).
 * 3. Available capacity (> 0).
 * 4. Shortest Haversine distance.
 * 5. Maximum operational radius constraint (default 25 km).
 */
export function matchReportToResource(report, resources, maxRadiusKm = 25) {
  if (!report || isNaN(Number(report.lat)) || isNaN(Number(report.lng))) {
    return {
      matched: false,
      reason: "Invalid coordinates provided for incident report",
      escalate: true
    };
  }

  if (!Array.isArray(resources) || resources.length === 0) {
    return {
      matched: false,
      reason: "No disaster response resources registered in the grid",
      escalate: true
    };
  }

  const preferredTypes = CATEGORY_RESOURCE_PRIORITY[report.category] || ["rescue_team", "shelter", "supply_stock"];

  // Filter candidates: has capacity and status is available/en_route
  const eligibleResources = resources.filter(res => {
    const hasCapacity = (Number(res.current_load) || 0) < (Number(res.capacity) || 1);
    const isReady = res.status === "available" || res.status === "en_route";
    const matchesType = preferredTypes.includes(res.type);
    return hasCapacity && isReady && matchesType;
  });

  if (eligibleResources.length === 0) {
    return {
      matched: false,
      reason: "No available resources matching required capability or capacity fully exhausted",
      escalate: true
    };
  }

  // Calculate distance for each eligible resource
  const scored = eligibleResources.map(res => {
    const distanceKm = calculateHaversineDistanceKm(report.lat, report.lng, res.lat, res.lng);
    const typePriorityIndex = preferredTypes.indexOf(res.type);
    return {
      resource: res,
      distanceKm,
      typePriorityIndex,
      etaMinutes: Math.max(3, Math.round(distanceKm * 4 + 3)) // approx 15 km/h urban flood transit + prep
    };
  });

  // Filter by maximum radius
  const withinRadius = scored.filter(item => item.distanceKm <= maxRadiusKm);

  if (withinRadius.length === 0) {
    const minDistance = Math.min(...scored.map(s => s.distanceKm));
    return {
      matched: false,
      reason: `Closest available resource is beyond operational threshold (${minDistance} km > ${maxRadiusKm} km)`,
      escalate: true
    };
  }

  // Sort: primary by type priority, secondary by distance
  withinRadius.sort((a, b) => {
    if (a.typePriorityIndex !== b.typePriorityIndex) {
      return a.typePriorityIndex - b.typePriorityIndex;
    }
    return a.distanceKm - b.distanceKm;
  });

  const bestMatch = withinRadius[0];

  return {
    matched: true,
    resource: bestMatch.resource,
    distanceKm: bestMatch.distanceKm,
    etaMinutes: bestMatch.etaMinutes,
    assignedAt: new Date().toISOString()
  };
}

