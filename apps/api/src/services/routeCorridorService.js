import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const CORRIDORS_FILE = path.join(DATA_DIR, 'route_corridors_ledger.json');

const DEFAULT_CORRIDORS = [
  {
    id: 'corr_hyd_blr',
    corridorCode: 'HYD-BLR',
    corridorName: 'Hyderabad ➔ Bengaluru',
    originCity: 'Hyderabad',
    destinationCity: 'Bengaluru',
    typicalDistanceKm: 570,
    typicalDurationHours: 10.5,
    typicalToll: 1450,
    typicalFuelLitres: 140,
    typicalFuelRate: 92.5,
    typicalFuelCost: 12950,
    driverBata: 1200,
    maintenanceReserve: 800,
    typicalCost: 16400,
    recommendedQuote: 20800,
    floorQuote: 17800,
    premiumQuote: 23500,
    historicalAvgRevenue: 21000,
    historicalMarginPct: 21.9,
    customerDemand: 'High',
    returnLoadAvailability: 'High (88%)',
    returnLoadProbability: 88,
    delayHistory: 'Smooth 4-lane NH44. Minor congestion at Devanahalli toll during peak evening (6-9 PM).',
    notes: 'Top profitable corridor for automotive & e-commerce. High backhaul availability from Peenya/Hosur.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_hyd_maa',
    corridorCode: 'HYD-MAA',
    corridorName: 'Hyderabad ➔ Chennai',
    originCity: 'Hyderabad',
    destinationCity: 'Chennai',
    typicalDistanceKm: 630,
    typicalDurationHours: 12.0,
    typicalToll: 1680,
    typicalFuelLitres: 155,
    typicalFuelRate: 92.5,
    typicalFuelCost: 14338,
    driverBata: 1400,
    maintenanceReserve: 900,
    typicalCost: 18318,
    recommendedQuote: 23500,
    floorQuote: 19900,
    premiumQuote: 26500,
    historicalAvgRevenue: 23800,
    historicalMarginPct: 23.0,
    customerDemand: 'High',
    returnLoadAvailability: 'Very High (94%)',
    returnLoadProbability: 94,
    delayHistory: 'NH16 4-lane good condition. Morning harbor gate entry queue near Ennore / Madhavaram.',
    notes: 'Port container and auto parts priority lane. Very fast turnaround at Sri City & Ambattur.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_hyd_bom',
    corridorCode: 'HYD-BOM',
    corridorName: 'Hyderabad ➔ Mumbai (Bhiwandi)',
    originCity: 'Hyderabad',
    destinationCity: 'Mumbai',
    typicalDistanceKm: 710,
    typicalDurationHours: 14.5,
    typicalToll: 1980,
    typicalFuelLitres: 175,
    typicalFuelRate: 92.5,
    typicalFuelCost: 16188,
    driverBata: 1600,
    maintenanceReserve: 1000,
    typicalCost: 20768,
    recommendedQuote: 26800,
    floorQuote: 22600,
    premiumQuote: 30500,
    historicalAvgRevenue: 27200,
    historicalMarginPct: 23.6,
    customerDemand: 'Very High',
    returnLoadAvailability: 'High (85%)',
    returnLoadProbability: 85,
    delayHistory: 'Solapur bypass smooth; slow heavy traffic on Pune-Mumbai Expressway ghats and Thane bypass.',
    notes: 'High volume FMCG, industrial machinery, and courier hub link. Strong Bhiwandi return freight.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_blr_maa',
    corridorCode: 'BLR-MAA',
    corridorName: 'Bengaluru ➔ Chennai',
    originCity: 'Bengaluru',
    destinationCity: 'Chennai',
    typicalDistanceKm: 350,
    typicalDurationHours: 6.5,
    typicalToll: 850,
    typicalFuelLitres: 85,
    typicalFuelRate: 92.5,
    typicalFuelCost: 7863,
    driverBata: 800,
    maintenanceReserve: 500,
    typicalCost: 10013,
    recommendedQuote: 13500,
    floorQuote: 11200,
    premiumQuote: 15500,
    historicalAvgRevenue: 13800,
    historicalMarginPct: 27.4,
    customerDemand: 'Very High',
    returnLoadAvailability: 'Ultra High (96%)',
    returnLoadProbability: 96,
    delayHistory: 'Ranipet-Walajapet 6-lane expressway open. Quick transit with zero toll bottlenecks.',
    notes: 'Daily shuttling lane for electronics, automotive, and fresh freight with instant round-trip loads.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_hyd_vga',
    corridorCode: 'HYD-VGA',
    corridorName: 'Hyderabad ➔ Vijayawada',
    originCity: 'Hyderabad',
    destinationCity: 'Vijayawada',
    typicalDistanceKm: 275,
    typicalDurationHours: 5.5,
    typicalToll: 620,
    typicalFuelLitres: 68,
    typicalFuelRate: 92.5,
    typicalFuelCost: 6290,
    driverBata: 700,
    maintenanceReserve: 400,
    typicalCost: 8010,
    recommendedQuote: 10800,
    floorQuote: 8900,
    premiumQuote: 12500,
    historicalAvgRevenue: 11000,
    historicalMarginPct: 27.2,
    customerDemand: 'High',
    returnLoadAvailability: 'Medium (68%)',
    returnLoadProbability: 68,
    delayHistory: 'NH65 4-lane highway in excellent shape. Moderate crossing time at Keesara toll.',
    notes: 'Fast feeder route connecting Telangana capital to coastal Andhra trade corridors.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_blr_hyd',
    corridorCode: 'BLR-HYD',
    corridorName: 'Bengaluru ➔ Hyderabad',
    originCity: 'Bengaluru',
    destinationCity: 'Hyderabad',
    typicalDistanceKm: 570,
    typicalDurationHours: 10.5,
    typicalToll: 1450,
    typicalFuelLitres: 140,
    typicalFuelRate: 92.5,
    typicalFuelCost: 12950,
    driverBata: 1200,
    maintenanceReserve: 800,
    typicalCost: 16400,
    recommendedQuote: 20800,
    floorQuote: 17800,
    premiumQuote: 23500,
    historicalAvgRevenue: 21000,
    historicalMarginPct: 21.9,
    customerDemand: 'High',
    returnLoadAvailability: 'Very High (92%)',
    returnLoadProbability: 92,
    delayHistory: 'Anantapur and Kurnool bypasses are free-flowing. Gaganpahad entry bottleneck after 9 PM.',
    notes: 'Heavy return load volume for retail, e-commerce, and electronics back to Hyderabad distribution centers.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_hyd_pun',
    corridorCode: 'HYD-PUN',
    corridorName: 'Hyderabad ➔ Pune (Chakan / Bhosari)',
    originCity: 'Hyderabad',
    destinationCity: 'Pune',
    typicalDistanceKm: 565,
    typicalDurationHours: 11.5,
    typicalToll: 1320,
    typicalFuelLitres: 138,
    typicalFuelRate: 92.5,
    typicalFuelCost: 12765,
    driverBata: 1200,
    maintenanceReserve: 750,
    typicalCost: 16035,
    recommendedQuote: 20900,
    floorQuote: 17600,
    premiumQuote: 23800,
    historicalAvgRevenue: 21200,
    historicalMarginPct: 24.4,
    customerDemand: 'High',
    returnLoadAvailability: 'High (84%)',
    returnLoadProbability: 84,
    delayHistory: 'NH65 Solapur-Pune stretch has intermittent traffic near Hadapsar industrial fringe.',
    notes: 'Major industrial lane serving Chakan automobile plants and Bhosari MIDC manufacturers.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corr_maa_hyd',
    corridorCode: 'MAA-HYD',
    corridorName: 'Chennai ➔ Hyderabad',
    originCity: 'Chennai',
    destinationCity: 'Hyderabad',
    typicalDistanceKm: 630,
    typicalDurationHours: 12.0,
    typicalToll: 1680,
    typicalFuelLitres: 155,
    typicalFuelRate: 92.5,
    typicalFuelCost: 14338,
    driverBata: 1400,
    maintenanceReserve: 900,
    typicalCost: 18318,
    recommendedQuote: 23500,
    floorQuote: 19900,
    premiumQuote: 26500,
    historicalAvgRevenue: 23800,
    historicalMarginPct: 23.0,
    customerDemand: 'High',
    returnLoadAvailability: 'High (86%)',
    returnLoadProbability: 86,
    delayHistory: 'Nellore bypass smooth. Evening traffic near LB Nagar entry into Hyderabad city.',
    notes: 'Inbound raw materials, port freight, and hardware supplies to Hyderabad markets.',
    updatedAt: new Date().toISOString()
  }
];

export function getAllCorridors() {
  try {
    if (fs.existsSync(CORRIDORS_FILE)) {
      const raw = fs.readFileSync(CORRIDORS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.error('[RouteCorridorService] Read error:', err.message);
  }
  // Initialize with defaults if missing
  saveAllCorridors(DEFAULT_CORRIDORS);
  return DEFAULT_CORRIDORS;
}

export function saveAllCorridors(list) {
  try {
    fs.writeFileSync(CORRIDORS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[RouteCorridorService] Save error:', err.message);
    return false;
  }
}

export function saveCorridor(corridorData) {
  const list = getAllCorridors();
  const id = corridorData.id || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Calculate costs & recommendations if not provided
  const fuelRate = Number(corridorData.typicalFuelRate) || 92.5;
  const fuelLitres = Number(corridorData.typicalFuelLitres) || Math.round((Number(corridorData.typicalDistanceKm) || 100) / 4);
  const fuelCost = Number(corridorData.typicalFuelCost) || Math.round(fuelLitres * fuelRate);
  const toll = Number(corridorData.typicalToll) || 0;
  const bata = Number(corridorData.driverBata) || 1000;
  const maint = Number(corridorData.maintenanceReserve) || 600;
  const totalCost = fuelCost + toll + bata + maint;
  
  const recQuote = Number(corridorData.recommendedQuote) || Math.round(totalCost * 1.25 / 100) * 100;
  const floorQuote = Number(corridorData.floorQuote) || Math.round(totalCost * 1.09 / 100) * 100;
  const premiumQuote = Number(corridorData.premiumQuote) || Math.round(totalCost * 1.40 / 100) * 100;
  const marginPct = recQuote > 0 ? Number((((recQuote - totalCost) / recQuote) * 100).toFixed(1)) : 20.0;

  const newRecord = {
    ...corridorData,
    id,
    typicalFuelRate: fuelRate,
    typicalFuelLitres: fuelLitres,
    typicalFuelCost: fuelCost,
    typicalToll: toll,
    driverBata: bata,
    maintenanceReserve: maint,
    typicalCost: totalCost,
    recommendedQuote: recQuote,
    floorQuote,
    premiumQuote,
    historicalMarginPct: marginPct,
    updatedAt: new Date().toISOString()
  };

  const existingIdx = list.findIndex(c => c.id === id || (c.corridorCode && c.corridorCode.toLowerCase() === (corridorData.corridorCode || '').toLowerCase()));
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...newRecord };
  } else {
    list.unshift(newRecord);
  }

  saveAllCorridors(list);
  return newRecord;
}

export function deleteCorridor(id) {
  const list = getAllCorridors();
  const filtered = list.filter(c => c.id !== id && c.corridorCode !== id);
  if (filtered.length !== list.length) {
    saveAllCorridors(filtered);
    return true;
  }
  return false;
}
