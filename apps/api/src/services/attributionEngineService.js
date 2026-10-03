import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory resolution (supports local dev & deployed Render layout)
const candidateDirs = [
  path.resolve(__dirname, '../../../../data'),
  path.resolve(__dirname, '../../../data'),
  path.resolve(process.cwd(), 'data')
];

let DATA_DIR = candidateDirs[0];
for (const cand of candidateDirs) {
  if (fs.existsSync(cand)) {
    DATA_DIR = cand;
    break;
  }
}
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const PERF_FILE = path.join(DATA_DIR, 'driver_truck_performance_ledger.json');
const DRV_BASELINES_FILE = path.join(DATA_DIR, 'driver_baselines_ledger.json');
const TRK_BASELINES_FILE = path.join(DATA_DIR, 'truck_baselines_ledger.json');
const SWAPS_FILE = path.join(DATA_DIR, 'truck_driver_swaps_ledger.json');

function readJsonFile(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[AttributionEngine] Error reading ${filePath}:`, err.message);
  }
  return defaultVal;
}

function writeJsonFile(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[AttributionEngine] Error writing ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Get comprehensive attribution matrix across fleet
 */
export function getAttributionMatrix() {
  const perfTrips = readJsonFile(PERF_FILE, []);
  const driverBaselines = readJsonFile(DRV_BASELINES_FILE, []);
  const truckBaselines = readJsonFile(TRK_BASELINES_FILE, []);
  const swapExperiments = readJsonFile(SWAPS_FILE, []);

  // Compute 4 Quadrants
  const driverFaults = [];
  const truckFaults = [];
  const brandMismatches = [];
  const optimalSynergies = [];

  // 1. Truck Faults
  truckBaselines.forEach(trk => {
    if (trk.diagnosed_root_cause === 'TRUCK_MECHANICAL_FAULT' || trk.mileage_deficit_pct <= -15) {
      truckFaults.push({
        type: 'TRUCK_FAULT',
        id: trk.truck_id,
        label: trk.truck_number,
        brand: trk.brand,
        model: trk.model,
        actualAvgKmpl: trk.actual_avg_kmpl,
        targetKmpl: trk.fleet_target_kmpl,
        deficitPct: trk.mileage_deficit_pct,
        maintCostPerKm: trk.maint_cost_per_km,
        faultComponent: trk.fault_component,
        evidence: trk.evidence_drivers,
        summary: trk.diagnostic_summary
      });
    } else if (trk.diagnosed_root_cause === 'OPTIMAL_SYNERGY' || trk.mileage_deficit_pct >= 0) {
      optimalSynergies.push({
        type: 'OPTIMAL_TRUCK',
        id: trk.truck_id,
        label: trk.truck_number,
        brand: trk.brand,
        actualAvgKmpl: trk.actual_avg_kmpl,
        targetKmpl: trk.fleet_target_kmpl,
        summary: trk.diagnostic_summary
      });
    }
  });

  // 2. Driver Faults & Brand Mismatches
  driverBaselines.forEach(drv => {
    if (drv.classification === 'DRIVER_DEFICIT_CONFIRMED' || (drv.overall_mileage_kmpl < drv.peer_group_avg_kmpl * 0.88)) {
      driverFaults.push({
        type: 'DRIVER_FAULT',
        id: drv.driver_id,
        label: drv.driver_name,
        overallKmpl: drv.overall_mileage_kmpl,
        peerAvgKmpl: drv.peer_group_avg_kmpl,
        fuelEfficiencyScore: drv.driver_fuel_efficiency_score,
        maintAbusePerKm: drv.maintenance_abuse_cost_per_km,
        trucksDriven: drv.trucks_driven_count,
        summary: drv.verdict_summary
      });
    } else if (drv.classification === 'BRAND_MISMATCH_SENSITIVE') {
      brandMismatches.push({
        type: 'BRAND_MISMATCH',
        id: drv.driver_id,
        label: drv.driver_name,
        overallKmpl: drv.overall_mileage_kmpl,
        brandBreakdown: drv.brand_breakdown,
        summary: drv.verdict_summary
      });
    } else if (drv.classification === 'MASTER_DRIVER_BENCHMARK' || drv.classification === 'OPTIMAL_EFFICIENCY') {
      optimalSynergies.push({
        type: 'OPTIMAL_DRIVER',
        id: drv.driver_id,
        label: drv.driver_name,
        overallKmpl: drv.overall_mileage_kmpl,
        peerAvgKmpl: drv.peer_group_avg_kmpl,
        score: drv.driver_fuel_efficiency_score,
        summary: drv.verdict_summary
      });
    }
  });

  // Calculate fleet high-level KPIs
  const totalTrips = perfTrips.length;
  const avgMileage = totalTrips > 0 
    ? (perfTrips.reduce((acc, t) => acc + (t.actual_mileage_kmpl || 0), 0) / totalTrips).toFixed(2)
    : 3.85;
  const totalFuelCost = perfTrips.reduce((acc, t) => acc + (t.fuel_cost_incurred || 0), 0);
  const totalMaintCost = perfTrips.reduce((acc, t) => acc + (t.maintenance_cost_incurred || 0), 0);
  const activeExperiments = swapExperiments.filter(s => s.status === 'ACTIVE_TESTING').length;
  const resolvedExperiments = swapExperiments.filter(s => s.status === 'COMPLETED').length;

  return {
    kpis: {
      totalTripsMonitored: totalTrips,
      fleetAvgMileageKmpl: Number(avgMileage),
      benchmarkMileageKmpl: 4.10,
      totalFuelCostIncurred: totalFuelCost,
      totalMaintCostIncurred: totalMaintCost,
      activeSwapExperiments: activeExperiments,
      completedSwapExperiments: resolvedExperiments,
      trucksTrackedCount: truckBaselines.length,
      driversTrackedCount: driverBaselines.length
    },
    quadrants: {
      driverFaults,
      truckFaults,
      brandMismatches,
      optimalSynergies
    },
    recentExperiments: swapExperiments.slice(0, 6),
    recentTripAudits: perfTrips.slice(0, 10),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get driver baseline metrics
 */
export function getDriverBaselines(driverId = null) {
  const drivers = readJsonFile(DRV_BASELINES_FILE, []);
  if (driverId) {
    return drivers.find(d => d.driver_id === driverId || d.driver_name?.toLowerCase() === driverId.toLowerCase());
  }
  return drivers;
}

/**
 * Get truck baseline metrics
 */
export function getTruckBaselines(truckId = null) {
  const trucks = readJsonFile(TRK_BASELINES_FILE, []);
  if (truckId) {
    const cleanId = truckId.replace(/\s+/g, '').toUpperCase();
    return trucks.find(t => t.truck_id === truckId || t.truck_number.replace(/\s+/g, '').toUpperCase() === cleanId);
  }
  return trucks;
}

/**
 * Get swap experiments
 */
export function getSwapExperiments(status = null) {
  const swaps = readJsonFile(SWAPS_FILE, []);
  if (status) {
    return swaps.filter(s => s.status.toUpperCase() === status.toUpperCase());
  }
  return swaps;
}

/**
 * Initiate a new truck-driver A/B rotation experiment
 */
export function initiateSwap(payload) {
  const swaps = readJsonFile(SWAPS_FILE, []);
  const newId = `rot_exp_${Date.now().toString().slice(-4)}`;
  
  const swapRecord = {
    id: newId,
    experiment_code: payload.experiment_code || `EXP-${Date.now().toString().slice(-4)}`,
    status: 'ACTIVE_TESTING',
    date_initiated: new Date().toISOString().split('T')[0],
    date_concluded: null,
    title: payload.title || `Swap Diagnosis: ${payload.driver_name} on ${payload.swap_truck_no}`,
    trigger_reason: payload.trigger_reason || 'Diagnostic swap to isolate driver vs vehicle deficit.',
    driver_id: payload.driver_id,
    driver_name: payload.driver_name,
    original_truck_id: payload.original_truck_id,
    original_truck_no: payload.original_truck_no,
    swap_truck_id: payload.swap_truck_id,
    swap_truck_no: payload.swap_truck_no,
    control_driver_id: payload.control_driver_id || 'DRV_SURESH_03',
    control_driver_name: payload.control_driver_name || 'Suresh Yadav (Master Driver)',
    test_duration_trips: payload.test_duration_trips || 3,
    metrics_before: payload.metrics_before || {
      driver_mileage_kmpl: payload.driver_mileage_kmpl || 3.2,
      truck_avg_kmpl: payload.truck_avg_kmpl || 3.2,
      maint_cost_per_km: payload.maint_cost_per_km || 1.1
    },
    metrics_after_swap: {
      driver_on_benchmark_truck_kmpl: null,
      control_driver_on_suspect_truck_kmpl: null,
      driver_efficiency_delta_pct: null,
      truck_performance_delta_pct: null
    },
    confirmed_attribution: 'IN_PROGRESS',
    attribution_badge: 'Testing Active',
    attribution_color: 'purple',
    verdict: 'Rotation live in transit. Waiting for test trip fuel receipts and telematics audit.',
    resolution_action: payload.resolution_action || 'Monitoring trips on corridor.',
    whatsapp_dispatch_note: `🚛 *JAI BHAVANI CARGO - ROTATION ASSIGNMENT*\n• Driver: ${payload.driver_name}\n• Test Vehicle: ${payload.swap_truck_no}\n• Purpose: Performance Diagnostic Test (${payload.test_duration_trips} trips)\n• Guidelines: Maintain 55-65 km/h economy band, zero unauthorized idling.`
  };

  swaps.unshift(swapRecord);
  writeJsonFile(SWAPS_FILE, swaps);
  return swapRecord;
}

/**
 * Conclude / evaluate swap experiment with test findings
 */
export function evaluateSwap(swapId, testMetrics) {
  const swaps = readJsonFile(SWAPS_FILE, []);
  const idx = swaps.findIndex(s => s.id === swapId);
  if (idx === -1) {
    throw new Error(`Swap experiment ${swapId} not found`);
  }

  const exp = swaps[idx];
  const driverKmpl = Number(testMetrics.driver_on_benchmark_truck_kmpl);
  const controlKmpl = Number(testMetrics.control_driver_on_suspect_truck_kmpl);
  const benchmarkBaseline = 4.10;

  let confirmedAttribution = 'OPTIMAL_SYNERGY';
  let badge = 'Synergy Confirmed';
  let color = 'green';
  let verdict = '';
  let resolution = '';

  const driverImproved = driverKmpl >= (benchmarkBaseline * 0.95);
  const suspectTruckStillPoor = controlKmpl <= (benchmarkBaseline * 0.88);

  if (driverImproved && suspectTruckStillPoor) {
    confirmedAttribution = 'TRUCK_MECHANICAL_FAULT';
    badge = 'Truck Defect Confirmed';
    color = 'blue';
    verdict = `Driver ${exp.driver_name} achieved ${driverKmpl} km/l on benchmark truck, while Control Driver achieved only ${controlKmpl} km/l on ${exp.original_truck_no}. Defect isolated to vehicle mechanical system.`;
    resolution = `Route ${exp.original_truck_no} to workshop for injection/turbo overhaul. Clear driver record.`;
  } else if (!driverImproved && !suspectTruckStillPoor) {
    confirmedAttribution = 'DRIVER_FAULT';
    badge = 'Driver Behavior Fault';
    color = 'red';
    verdict = `Control Driver recovered mileage to ${controlKmpl} km/l on ${exp.original_truck_no}, but Driver ${exp.driver_name} remained deficient at ${driverKmpl} km/l on the benchmark truck.`;
    resolution = `Assign driver to Eco-Driving training and apply incentive gate until metrics normalize.`;
  } else if (driverImproved && !suspectTruckStillPoor) {
    confirmedAttribution = 'BRAND_POWERTRAIN_MISMATCH';
    badge = 'Brand/Powertrain Mismatch';
    color = 'amber';
    verdict = `Both driver and truck performed normally when separated into different configurations. Indicates transmission gearing or torque band mismatch.`;
    resolution = `Reassign driver permanently to optimal vehicle brand/transmission class.`;
  }

  exp.status = 'COMPLETED';
  exp.date_concluded = new Date().toISOString().split('T')[0];
  exp.metrics_after_swap = {
    driver_on_benchmark_truck_kmpl: driverKmpl,
    control_driver_on_suspect_truck_kmpl: controlKmpl,
    driver_efficiency_delta_pct: Number((((driverKmpl - exp.metrics_before.driver_mileage_kmpl) / exp.metrics_before.driver_mileage_kmpl) * 100).toFixed(2)),
    truck_performance_delta_pct: Number((((controlKmpl - exp.metrics_before.truck_avg_kmpl) / exp.metrics_before.truck_avg_kmpl) * 100).toFixed(2))
  };
  exp.confirmed_attribution = confirmedAttribution;
  exp.attribution_badge = badge;
  exp.attribution_color = color;
  exp.verdict = verdict;
  exp.resolution_action = resolution;

  swaps[idx] = exp;
  writeJsonFile(SWAPS_FILE, swaps);
  return exp;
}

/**
 * AI / Rule-based diagnostic recommendation helper
 */
export function recommendSwap(truckNumber, driverName) {
  const trucks = readJsonFile(TRK_BASELINES_FILE, []);
  const drivers = readJsonFile(DRV_BASELINES_FILE, []);

  // Find a healthy benchmark truck (different brand if possible, or high performer)
  const benchmarkTruck = trucks.find(t => t.diagnosed_root_cause === 'BENCHMARK_HEALTHY' && t.truck_number !== truckNumber) 
    || trucks[0];

  // Find a calibrated master driver
  const controlDriver = drivers.find(d => d.classification === 'MASTER_DRIVER_BENCHMARK' && d.driver_name !== driverName)
    || drivers[0];

  return {
    recommended_experiment: {
      title: `Diagnostic Swap: Verify ${driverName} vs ${truckNumber}`,
      original_truck_no: truckNumber,
      candidate_swap_truck_no: benchmarkTruck.truck_number,
      candidate_swap_truck_model: `${benchmarkTruck.brand} ${benchmarkTruck.model}`,
      control_driver_name: controlDriver.driver_name,
      test_duration_trips: 3,
      hypothesis: `Rotate ${driverName} to benchmark ${benchmarkTruck.truck_number} and put ${controlDriver.driver_name} onto ${truckNumber} for 3 trips to isolate mechanical vs behavioral variance.`
    }
  };
}
