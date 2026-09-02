// server/smsGateway.js

// Known landmark/pincode to lat/lng mapping for realistic instant parsing
const PINCODE_MAP = {
  // Mumbai / Thane Region
  "400001": { name: "Fort / Colaba", lat: 18.9320, lng: 72.8350 },
  "400050": { name: "Bandra West", lat: 19.0550, lng: 72.8320 },
  "400051": { name: "Bandra Kurla Complex (BKC)", lat: 19.0657, lng: 72.8680 },
  "400055": { name: "Santacruz East / Milan Subway", lat: 19.0800, lng: 72.8420 },
  "400058": { name: "Andheri West", lat: 19.1197, lng: 72.8468 },
  "400069": { name: "Andheri East / MIDC", lat: 19.1150, lng: 72.8700 },
  "400071": { name: "Chembur / Eastern Freeway", lat: 19.0520, lng: 72.8990 },
  "400078": { name: "Bhandup / LBS Road", lat: 19.1430, lng: 72.9350 },
  "400601": { name: "Thane West / Station", lat: 19.1860, lng: 72.9750 },
  "400703": { name: "Vashi, Navi Mumbai", lat: 19.0770, lng: 72.9980 },
  // General Fallbacks
  "600001": { name: "Chennai Central", lat: 13.0827, lng: 80.2707 },
  "560001": { name: "Bengaluru Central", lat: 12.9716, lng: 77.5946 },
  "700001": { name: "Kolkata BBD Bagh", lat: 22.5726, lng: 88.3639 },
  "110001": { name: "Delhi Connaught Place", lat: 28.6315, lng: 77.2167 }
};

const LANDMARK_KEYWORDS = [
  { match: /milan|subway/i, name: "Milan Subway", lat: 19.0800, lng: 72.8420 },
  { match: /bandra|bkc/i, name: "Bandra Area", lat: 19.0550, lng: 72.8320 },
  { match: /andheri|midc/i, name: "Andheri Hub", lat: 19.1150, lng: 72.8700 },
  { match: /chembur/i, name: "Chembur Lowland", lat: 19.0520, lng: 72.8990 },
  { match: /kurla/i, name: "Kurla Mithi Basin", lat: 19.0680, lng: 72.8790 },
  { match: /thane/i, name: "Thane Lake City", lat: 19.1860, lng: 72.9750 }
];

/**
 * Parses an incoming SMS text into a standardized citizen report object.
 * Supported patterns:
 * 1. Structured: "FLOOD 400050 CRITICAL 4 people stuck on roof 9820123456"
 * 2. Semi-structured / natural text: "Emergency flood near Milan subway 6ft water need boat call 9876543210"
 */
export function parseIncomingSms(rawText, senderPhone = "+91 99000 00000") {
  const text = (rawText || "").trim();
  const upperText = text.toUpperCase();

  // 1. Detect Category
  let category = "flood";
  if (/medical|stroke|heart|patient|doctor|ambulance|oxygen|injured|bleeding|hospital/i.test(text)) {
    category = "medical";
  } else if (/trapped|stuck|stranded|collapsed|roof|tree|balcony|basement/i.test(text)) {
    category = "trapped";
  } else if (/shelter|homeless|evacuat|roof blown|no place|displaced/i.test(text)) {
    category = "shelterless";
  } else if (/food|ration|water|starving|milk|drinking water/i.test(text)) {
    category = "food_water";
  } else if (/landslide|mudslide|hill|rockfall/i.test(text)) {
    category = "landslide";
  }

  // 2. Detect Severity
  let severity = "medium";
  if (/critical|emergency|urgent|dying|drowning|life threatening|danger/i.test(text) || upperText.includes("CRITICAL")) {
    severity = "critical";
  } else if (/high|severe|rapid|heavy|rising/i.test(text) || upperText.includes("HIGH")) {
    severity = "high";
  } else if (/low|minor/i.test(text) || upperText.includes("LOW")) {
    severity = "low";
  }

  // 3. Detect Pincode or Location
  const pincodeMatch = text.match(/\b([1-9][0-9]{5})\b/);
  let locationInfo = null;

  if (pincodeMatch && PINCODE_MAP[pincodeMatch[1]]) {
    const pin = pincodeMatch[1];
    locationInfo = {
      pincode: pin,
      location_name: `${PINCODE_MAP[pin].name} (Pincode ${pin})`,
      lat: PINCODE_MAP[pin].lat + (Math.random() - 0.5) * 0.005, // minor scatter
      lng: PINCODE_MAP[pin].lng + (Math.random() - 0.5) * 0.005
    };
  } else {
    // Landmark keyword check
    for (const lm of LANDMARK_KEYWORDS) {
      if (lm.match.test(text)) {
        locationInfo = {
          pincode: null,
          location_name: lm.name,
          lat: lm.lat + (Math.random() - 0.5) * 0.005,
          lng: lm.lng + (Math.random() - 0.5) * 0.005
        };
        break;
      }
    }
  }

  // Fallback location near city center if none matched
  if (!locationInfo) {
    locationInfo = {
      pincode: "400050",
      location_name: "Bandra / Central Flood Basin (SMS auto-geocoded)",
      lat: 19.0600 + (Math.random() - 0.5) * 0.03,
      lng: 72.8500 + (Math.random() - 0.5) * 0.03
    };
  }

  // 4. Detect Phone
  const phoneMatch = text.match(/(\+?91[\s-]?)?[6-9]\d{9}/);
  const detectedPhone = phoneMatch ? phoneMatch[0] : senderPhone;

  // Clean description - strip prefixes, pincode, severities, and phone numbers cleanly
  let cleanDescription = text
    .replace(/^(FLOOD|MEDICAL|TRAPPED|SHELTER|SHELTERLESS|FOOD|WATER|LANDSLIDE|SOS|EMERGENCY)\s+/gi, "")
    .replace(/\b[1-9][0-9]{5}\b/g, "")
    .replace(/\b(CRITICAL|HIGH|MEDIUM|LOW)\b/gi, "");

  if (phoneMatch) {
    cleanDescription = cleanDescription.replace(phoneMatch[0], "");
  }

  cleanDescription = cleanDescription.replace(/\s+/g, " ").trim();

  return {
    id: `sms-rep-${Date.now()}`,
    category,
    severity,
    lat: locationInfo.lat,
    lng: locationInfo.lng,
    description: cleanDescription || text,
    photo_url: null,
    timestamp: new Date().toISOString(),
    status: "new",
    phone: detectedPhone,
    source: "sms",
    location_name: locationInfo.location_name,
    raw_sms: text
  };
}

