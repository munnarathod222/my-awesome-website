import pb from './pocketbaseClient.js';

const STORAGE_KEY = 'jbc_corridor_lanes_v1';

export const DEFAULT_LANES = [
  {
    id: 'lane-hyd-hubli',
    origin: 'Hyderabad',
    destination: 'Hubli',
    vehicle_type: '32FT Container (SXL/MXL)',
    min_rate: 26000,
    max_rate: 29000,
    transit_hours: '18 - 22 Hrs',
    distance_km: 580,
    notes: 'Primary industrial lane via Raichur NH50; high return load potential from Hubli',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hyd-pune',
    origin: 'Hyderabad',
    destination: 'Pune',
    vehicle_type: '32FT MXL Container (18.5T)',
    min_rate: 34000,
    max_rate: 38000,
    transit_hours: '16 - 20 Hrs',
    distance_km: 560,
    notes: 'NH65 Solapur Expressway; automotive and pharma freight corridor',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hyd-blr',
    origin: 'Hyderabad',
    destination: 'Bangalore',
    vehicle_type: '32FT SXL Container (14.5T)',
    min_rate: 28000,
    max_rate: 32000,
    transit_hours: '14 - 18 Hrs',
    distance_km: 570,
    notes: 'NH44 4-lane expressway; electronics and FMCG high turnaround corridor',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hubli-hyd',
    origin: 'Hubli',
    destination: 'Hyderabad',
    vehicle_type: '32FT Container (SXL/MXL)',
    min_rate: 24000,
    max_rate: 27000,
    transit_hours: '18 - 22 Hrs',
    distance_km: 580,
    notes: 'Backhaul return load rate; agricultural & manufacturing transit',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hyd-ngp',
    origin: 'Hyderabad',
    destination: 'Nagpur',
    vehicle_type: '32FT SXL Container',
    min_rate: 30000,
    max_rate: 33000,
    transit_hours: '14 - 16 Hrs',
    distance_km: 500,
    notes: 'North corridor NH44; central hub connectivity',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hyd-chennai',
    origin: 'Hyderabad',
    destination: 'Chennai',
    vehicle_type: '32FT MXL Container (18.5T)',
    min_rate: 36000,
    max_rate: 40000,
    transit_hours: '18 - 22 Hrs',
    distance_km: 630,
    notes: 'Port and manufacturing express corridor via Ongole / Nellore',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-hyd-vja',
    origin: 'Hyderabad',
    destination: 'Vijayawada',
    vehicle_type: '24FT / 32FT SXL',
    min_rate: 18000,
    max_rate: 21000,
    transit_hours: '7 - 9 Hrs',
    distance_km: 275,
    notes: 'Same-day intercity cargo dispatch via NH65',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-pune-hyd',
    origin: 'Pune',
    destination: 'Hyderabad',
    vehicle_type: '32FT MXL Container',
    min_rate: 30000,
    max_rate: 34000,
    transit_hours: '16 - 20 Hrs',
    distance_km: 560,
    notes: 'Return load from Chakan / Bhosari auto hub',
    is_active: true,
    updated_at: new Date().toISOString()
  },
  {
    id: 'lane-blr-hyd',
    origin: 'Bangalore',
    destination: 'Hyderabad',
    vehicle_type: '32FT SXL Container',
    min_rate: 25000,
    max_rate: 28000,
    transit_hours: '14 - 18 Hrs',
    distance_km: 570,
    notes: 'Return load from Peenya / Bommasandra industrial zones',
    is_active: true,
    updated_at: new Date().toISOString()
  }
];

export const parseRateInput = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  // If user entered shorthand like 26 for 26,000
  if (num > 0 && num < 1000) {
    return Math.round(num * 1000);
  }
  return Math.round(num);
};

export const formatRateDisplay = (minRate, maxRate) => {
  const min = Number(minRate) || 0;
  const max = Number(maxRate) || 0;

  if (min <= 0 && max <= 0) return 'Price On Request';

  const formatK = (val) => {
    if (val >= 1000) {
      const k = val / 1000;
      return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return String(val);
  };

  if (min > 0 && max > 0 && min !== max) {
    return `₹${formatK(min)} - ₹${formatK(max)} (₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')})`;
  }
  const single = max || min;
  return `₹${formatK(single)} (₹${single.toLocaleString('en-IN')})`;
};

export const formatRateBadge = (minRate, maxRate) => {
  const min = Number(minRate) || 0;
  const max = Number(maxRate) || 0;

  if (min <= 0 && max <= 0) return 'POR';

  const formatK = (val) => {
    if (val >= 1000) {
      const k = val / 1000;
      return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return String(val);
  };

  if (min > 0 && max > 0 && min !== max) {
    return `₹${formatK(min)} - ₹${formatK(max)}`;
  }
  return `₹${formatK(max || min)}`;
};

export const laneRateClient = {
  getLanes() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}

    // Initialize defaults
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LANES));
    } catch (_) {}
    return DEFAULT_LANES;
  },

  saveLane(laneData) {
    const lanes = this.getLanes();
    const id = laneData.id || `lane-${Date.now()}`;
    const minRate = parseRateInput(laneData.min_rate);
    const maxRate = parseRateInput(laneData.max_rate || laneData.min_rate);

    const record = {
      ...laneData,
      id,
      min_rate: minRate,
      max_rate: Math.max(minRate, maxRate),
      is_active: laneData.is_active !== false,
      updated_at: new Date().toISOString()
    };

    const existingIdx = lanes.findIndex(l => l.id === id);
    let updated;
    if (existingIdx !== -1) {
      updated = lanes.map((l, idx) => idx === existingIdx ? { ...l, ...record } : l);
    } else {
      updated = [record, ...lanes];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}

    return { success: true, lane: record, allLanes: updated };
  },

  deleteLane(id) {
    const lanes = this.getLanes();
    const filtered = lanes.filter(l => l.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (_) {}
    return { success: true, allLanes: filtered };
  },

  resetDefaults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LANES));
    } catch (_) {}
    return DEFAULT_LANES;
  },

  findQuote(query) {
    if (!query) return null;
    const q = query.trim().toLowerCase();
    const lanes = this.getLanes();

    // Check direct origin/destination match
    const matched = lanes.find(l => {
      const full = `${l.origin} to ${l.destination}`.toLowerCase();
      const rev = `${l.destination} to ${l.origin}`.toLowerCase();
      return (
        full.includes(q) ||
        rev.includes(q) ||
        l.destination.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q)
      );
    });

    return matched || null;
  },

  generateWhatsAppQuote(lane, customNotes = '') {
    if (!lane) return '';
    const minStr = (lane.min_rate || 0).toLocaleString('en-IN');
    const maxStr = (lane.max_rate || 0).toLocaleString('en-IN');
    const rateLine = lane.min_rate === lane.max_rate 
      ? `₹${minStr}` 
      : `₹${minStr} - ₹${maxStr}`;

    const text = [
      `*JAI BHAVANI CARGO - SPOT FREIGHT QUOTE* 🚛`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Route Corridor:* ${lane.origin} ➔ ${lane.destination}`,
      `🚚 *Vehicle Category:* ${lane.vehicle_type || '32FT Container'}`,
      `💰 *Estimated Spot Freight:* ${rateLine}`,
      lane.transit_hours ? `⏱️ *Typical Transit Time:* ${lane.transit_hours}` : null,
      lane.distance_km ? `🛣️ *Highway Distance:* ~${lane.distance_km} KM` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ *Quote Inclusions:*`,
      `• Dedicated High-Speed Fleet Tracking`,
      `• Includes Tolls & FASTag Clearances`,
      `• Experienced Highway Drivers & Digital POD`,
      customNotes ? `📝 *Remarks:* ${customNotes}` : null,
      lane.notes ? `ℹ️ *Corridor Note:* ${lane.notes}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Jai Bhavani Cargo Dispatch & Operations*`,
      `📞 Contact: 98490-XXXXX / support@jaibhavanicargo.com`
    ].filter(Boolean).join('\n');

    return text;
  }
};
