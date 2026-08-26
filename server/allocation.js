// server/allocation.js

/**
 * Calculates Haversine distance between two lat/lng points in kilometers.
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
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
  const preferredTypes = CATEGORY_RESOURCE_PRIORITY[report.category] || ["rescue_team", "shelter", "supply_stock"];

  // Filter candidates: has capacity and status is available/en_route
  const eligibleResources = resources.filter(res => {
    const hasCapacity = res.current_load < res.capacity;
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
    // Prefer higher priority type; if tied, sort by distance
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
    return {
      matched: false,
      reason: `Closest available resource is beyond operational threshold (${scored[0]?.distanceKm} km > ${maxRadiusKm} km)`,
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
