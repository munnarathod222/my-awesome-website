/**
 * Bidding Intelligence Storage & PocketBase Synchronization Layer
 * 
 * Handles real-time persistence, schema fallbacks, cross-device synchronization,
 * CSV bulk importing with validation, and CSV export for Jai Bhavani Cargo.
 */

import pb from './pocketbaseClient.js';

const STORAGE_KEYS = {
  BIDS: 'jbc_bidding_intelligence_bids',
  CONTRACTS: 'jbc_bidding_intelligence_contracts',
  SETTINGS: 'jbc_bidding_settings',
  DIESEL_HISTORY: 'jbc_diesel_history'
};

export const DEFAULT_BIDDING_SETTINGS = {
  currentDieselPrice: 103.85,
  minAcceptableMarginPct: 12,
  minAcceptableProfitTrip: 2500,
  defaultTollPerKm: 3.2,
  defaultDriverDaily: 1400,
  defaultMaintenancePerKm: 3.5,
  defaultTyrePerKm: 1.5,
  defaultFixedAllocationPerKm: 6.0
};

export const parseImageList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
    if (raw.trim().startsWith('[')) return [];
    return [raw];
  }
  return [];
};

/**
 * Normalizes bid record schema between Spreadsheet Grid and Wizard formats
 */
export const normalizeBid = (r = {}) => {
  const client = (r.client_name || r.counterparty || 'Delhivery').trim();
  const type = (r.bidding_type || r.bid_type || 'Contract').trim();
  const vType = (r.vehicle_type || r.truck_type || '32FTSXL').trim();
  const start = (r.starting_point || r.origin || '').trim();
  const end = (r.ending_point || r.destination || '').trim();
  
  const amount = r.bidding_amount !== undefined && r.bidding_amount !== null && r.bidding_amount !== ''
    ? Number(r.bidding_amount)
    : (r.quoted_amount !== undefined && r.quoted_amount !== null && r.quoted_amount !== '' ? Number(r.quoted_amount) : '');

  const lostAt = r.bidding_lost_at !== undefined && r.bidding_lost_at !== null && r.bidding_lost_at !== ''
    ? Number(r.bidding_lost_at)
    : (r.actual_winning_rate !== undefined && r.actual_winning_rate !== null && r.actual_winning_rate !== '' ? Number(r.actual_winning_rate) : '');

  const dateVal = r.date || r.bid_date || (r.created ? r.created.split('T')[0] : new Date().toISOString().split('T')[0]);
  const attachments = parseImageList(r.attachments || r.image_urls || r.images || []);

  return {
    ...r,
    id: r.id,
    date: dateVal,
    bid_date: dateVal,
    client_name: client,
    counterparty: client,
    role: r.role || 'Broker',
    underlying_client: r.underlying_client || '',
    bidding_type: type,
    bid_type: type,
    vehicle_type: vType,
    truck_type: vType,
    trip_detail: r.trip_detail || '1 Way',
    starting_point: start,
    origin: start,
    ending_point: end,
    destination: end,
    no_of_stops: Number(r.no_of_stops || 1),
    route_map: r.route_map || '',
    bidding_amount: amount,
    quoted_amount: amount !== '' ? Number(amount) : 0,
    quoted_rate: amount !== '' ? Number(amount) : 0,
    bidding_lost_at: lostAt,
    actual_winning_rate: lostAt !== '' ? Number(lostAt) : (r.status === 'Won' && amount !== '' ? Number(amount) : 0),
    status: r.status || (r.result === 'Won' ? 'Won' : r.result === 'Lost' ? 'Lost' : 'Not bidded'),
    result: r.result || (r.status === 'Won' ? 'Won' : r.status === 'Lost' ? 'Lost' : 'Pending'),
    distance_km: Number(r.distance_km || 0),
    payload_tons: Number(r.payload_tons || 6),
    trips_count: Number(r.trips_count || 1),
    monthly_trips: Number(r.monthly_trips || 15),
    contract_ref: r.contract_ref || '',
    contract_date: r.contract_date || '',
    attachments: attachments,
    notes: r.notes || ''
  };
};

/**
 * Prepares payload for PocketBase persistence
 */
const prepareBidPayload = (bid) => {
  const norm = normalizeBid(bid);
  return {
    date: norm.date,
    bid_date: norm.bid_date,
    client_name: norm.client_name,
    counterparty: norm.counterparty,
    role: norm.role,
    underlying_client: norm.underlying_client,
    bidding_type: norm.bidding_type,
    bid_type: norm.bid_type,
    vehicle_type: norm.vehicle_type,
    truck_type: norm.truck_type,
    bidding_amount: norm.bidding_amount !== '' ? Number(norm.bidding_amount) : null,
    quoted_amount: norm.quoted_amount !== '' ? Number(norm.quoted_amount) : null,
    quoted_rate: norm.quoted_rate !== '' ? Number(norm.quoted_rate) : null,
    bidding_lost_at: norm.bidding_lost_at !== '' ? Number(norm.bidding_lost_at) : null,
    actual_winning_rate: norm.actual_winning_rate !== '' ? Number(norm.actual_winning_rate) : null,
    trip_detail: norm.trip_detail,
    starting_point: norm.starting_point,
    origin: norm.origin,
    ending_point: norm.ending_point,
    destination: norm.destination,
    no_of_stops: Number(norm.no_of_stops || 1),
    route_map: norm.route_map,
    status: norm.status,
    result: norm.result,
    distance_km: Number(norm.distance_km || 0),
    payload_tons: Number(norm.payload_tons || 6),
    trips_count: Number(norm.trips_count || 1),
    monthly_trips: Number(norm.monthly_trips || 15),
    contract_ref: norm.contract_ref,
    contract_date: norm.contract_date,
    attachments: JSON.stringify(norm.attachments || []),
    notes: norm.notes
  };
};

/**
 * Load all stored bids across PocketBase and sync local cache
 */
export const loadBids = async () => {
  let pbBids = [];
  let pbSuccess = false;

  try {
    const records = await pb.collection('bids').getFullList({
      sort: '-created',
      $autoCancel: false
    });
    pbBids = records.map(normalizeBid);
    pbSuccess = true;
  } catch (e) {
    console.warn('PocketBase bids fetch notice:', e.message);
  }

  // Cross-Device Sync: If user created bids on this device before backend sync, upload them to PocketBase
  try {
    const localRaw = localStorage.getItem(STORAGE_KEYS.BIDS);
    const localBids = localRaw ? JSON.parse(localRaw) : [];

    if (Array.isArray(localBids) && localBids.length > 0) {
      if (pbSuccess) {
        const pbIdSet = new Set(pbBids.map(b => b.id));
        const unsynced = localBids.filter(b => !pbIdSet.has(b.id));

        if (unsynced.length > 0) {
          console.log(`Auto-syncing ${unsynced.length} local bids to centralized database...`);
          for (const localBid of unsynced) {
            try {
              const payload = prepareBidPayload(localBid);
              const created = await pb.collection('bids').create(payload);
              pbBids.unshift(normalizeBid(created));
            } catch (err) {
              console.warn('Could not sync local bid to PB:', err.message);
              pbBids.unshift(normalizeBid(localBid));
            }
          }
        }
      } else {
        // PB offline, merge local bids
        const mergedMap = {};
        pbBids.forEach(b => { mergedMap[b.id] = b; });
        localBids.forEach(b => { if (!mergedMap[b.id]) mergedMap[b.id] = normalizeBid(b); });
        pbBids = Object.values(mergedMap);
      }
    }

    // Sort newest to oldest
    pbBids.sort((a, b) => {
      const dateA = new Date(a.date || a.bid_date || a.created || 0);
      const dateB = new Date(b.date || b.bid_date || b.created || 0);
      return dateB - dateA;
    });

    // Keep localStorage cache up-to-date with central list
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(pbBids));
    return pbBids;
  } catch (e) {
    console.error('Failed to load/sync bids:', e);
    return pbBids;
  }
};

/**
 * Save / Create / Update a bid
 */
export const saveBid = async (bidData) => {
  const norm = normalizeBid(bidData);
  const payload = prepareBidPayload(norm);
  let savedRecord = norm;

  // 1. Save to PocketBase
  try {
    const isPbId = norm.id && !norm.id.startsWith('bid_') && norm.id.length === 15;
    if (isPbId) {
      const res = await pb.collection('bids').update(norm.id, payload);
      savedRecord = normalizeBid(res);
    } else {
      const res = await pb.collection('bids').create(payload);
      savedRecord = normalizeBid(res);
    }
  } catch (e) {
    console.warn('PocketBase bids write notice (caching locally):', e.message);
    if (!savedRecord.id) {
      savedRecord.id = `bid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
  }

  // 2. Update local storage cache
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BIDS);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(b => b.id === savedRecord.id || (bidData.id && b.id === bidData.id));
    if (idx >= 0) {
      list[idx] = savedRecord;
    } else {
      list.unshift(savedRecord);
    }
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(list));
  } catch (e) {
    console.error('Local cache error on save:', e);
  }

  return savedRecord;
};

/**
 * Delete a bid
 */
export const deleteBid = async (id) => {
  try {
    if (id && !id.startsWith('bid_')) {
      await pb.collection('bids').delete(id);
    }
  } catch (e) {
    console.warn('PocketBase bid delete notice:', e.message);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BIDS);
    if (raw) {
      const list = JSON.parse(raw).filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Local delete error:', e);
  }
};

/**
 * Real-time Subscription for Bids across all devices
 */
export const subscribeBids = (callback) => {
  try {
    return pb.collection('bids').subscribe('*', (e) => {
      callback?.(e);
    });
  } catch (err) {
    console.warn('Realtime subscription not available:', err);
    return () => {};
  }
};

export const unsubscribeBids = () => {
  try {
    pb.collection('bids').unsubscribe('*');
  } catch (err) {}
};

/**
 * Load Active Contracts
 */
export const loadContracts = async () => {
  let pbContracts = [];
  try {
    const records = await pb.collection('contracts').getFullList({
      sort: '-created',
      $autoCancel: false
    });
    pbContracts = records;
  } catch (e) {
    console.warn('PocketBase contracts notice:', e.message);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    const localContracts = raw ? JSON.parse(raw) : [];
    const mergedMap = {};
    pbContracts.forEach(c => { mergedMap[c.id] = c; });
    localContracts.forEach(c => { if (!mergedMap[c.id]) mergedMap[c.id] = c; });
    const all = Object.values(mergedMap);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(all));
    return all;
  } catch (e) {
    return pbContracts;
  }
};

/**
 * Save / Create Contract
 */
export const saveContract = async (contractData) => {
  const payload = {
    contract_ref: contractData.contract_ref || `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
    counterparty: contractData.counterparty || contractData.client_name || 'Delhivery',
    client_name: contractData.client_name || contractData.counterparty || 'Delhivery',
    role: contractData.role || 'Broker',
    underlying_client: contractData.underlying_client || '',
    origin: contractData.origin || '',
    destination: contractData.destination || '',
    truck_type: contractData.truck_type || '32FTSXL',
    rate: Number(contractData.rate || 0),
    monthly_trips: Number(contractData.monthly_trips || 15),
    dedicated_trucks: Number(contractData.dedicated_trucks || 1),
    contract_start: contractData.contract_start || new Date().toISOString().split('T')[0],
    contract_end: contractData.contract_end || '',
    status: contractData.status || 'Active',
    notes: contractData.notes || ''
  };

  let savedRecord = { ...payload, id: contractData.id };

  try {
    const isPbId = contractData.id && !contractData.id.startsWith('contract_') && contractData.id.length === 15;
    if (isPbId) {
      const res = await pb.collection('contracts').update(contractData.id, payload);
      savedRecord = res;
    } else {
      const res = await pb.collection('contracts').create(payload);
      savedRecord = res;
    }
  } catch (e) {
    console.warn('PocketBase contract save notice:', e.message);
    if (!savedRecord.id) {
      savedRecord.id = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(c => c.id === savedRecord.id || (contractData.id && c.id === contractData.id));
    if (idx >= 0) list[idx] = savedRecord;
    else list.unshift(savedRecord);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(list));
  } catch (e) {
    console.error('Local cache contract error:', e);
  }

  return savedRecord;
};

/**
 * Load Settings
 */
export const loadBiddingSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_BIDDING_SETTINGS, ...JSON.parse(raw) } : DEFAULT_BIDDING_SETTINGS;
  } catch (e) {
    return DEFAULT_BIDDING_SETTINGS;
  }
};

/**
 * Save Settings
 */
export const saveBiddingSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Settings save error:', e);
  }
};

/**
 * Generate CSV template for bulk historical bids import
 */
export const getBiddingCsvTemplate = () => {
  const headers = [
    'bid_date',
    'counterparty',
    'role',
    'underlying_client',
    'origin',
    'destination',
    'distance_km',
    'truck_type',
    'payload_tons',
    'load_type',
    'quoted_rate',
    'result',
    'actual_winning_rate',
    'contract_date',
    'trips',
    'notes'
  ];

  const sampleRows = [
    '2026-07-15,Delhivery,Broker,Amazon,Hyderabad,Bengaluru,590,20FT SXL,6.0,E-Commerce,21200,Won,21200,2026-07-20,15,Weekly linehaul run',
    '2026-06-10,Flipkart,Client,,Hyderabad,Chennai,630,32FT SXL,9.0,Retail Goods,28500,Lost,27800,,,Quoted slightly above market winner',
    '2026-05-22,Rivigo,Aggregator,Reliance,Bengaluru,Hyderabad,590,20FT SXL,6.0,FMCG,20800,Won,20800,2026-05-25,10,Return backhaul corridor'
  ];

  return `${headers.join(',')}\n${sampleRows.join('\n')}`;
};

/**
 * Parse and Validate CSV string
 */
export const parseAndValidateBiddingCsv = (csvString) => {
  const lines = csvString.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { valid: [], invalid: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  const validRecords = [];
  const invalidRecords = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });

    const origin = row.origin || '';
    const destination = row.destination || '';
    const counterparty = row.counterparty || '';
    const quotedRate = Number(row.quoted_rate || row.quoted_amount || 0);

    if (!origin || !destination || !counterparty) {
      invalidRecords.push({ row: i + 1, data: row, reason: 'Missing Origin, Destination, or Counterparty' });
      continue;
    }

    if (quotedRate <= 0) {
      invalidRecords.push({ row: i + 1, data: row, reason: 'Invalid or zero quoted rate' });
      continue;
    }

    validRecords.push(normalizeBid({
      date: row.bid_date || new Date().toISOString().split('T')[0],
      counterparty,
      client_name: counterparty,
      role: row.role || 'Broker',
      underlying_client: row.underlying_client || '',
      origin,
      starting_point: origin,
      destination,
      ending_point: destination,
      distance_km: Number(row.distance_km || 590),
      truck_type: row.truck_type || '20FT SXL',
      vehicle_type: row.truck_type || '20FT SXL',
      payload_tons: Number(row.payload_tons || 6),
      load_type: row.load_type || 'Commercial Cargo',
      bidding_amount: quotedRate,
      quoted_amount: quotedRate,
      result: row.result || 'Won',
      actual_winning_rate: Number(row.actual_winning_rate || (row.result === 'Won' ? quotedRate : 0)),
      contract_date: row.contract_date || '',
      trips_count: Number(row.trips || 1),
      notes: row.notes || 'Imported via CSV',
      status: row.result === 'Won' ? 'Won' : row.result === 'Lost' ? 'Lost' : 'Not bidded'
    }));
  }

  return { valid: validRecords, invalid: invalidRecords, errors };
};

/**
 * Export Bids to CSV
 */
export const exportBidsToCsv = (bids = []) => {
  const headers = [
    'Bid ID',
    'Date',
    'Counterparty',
    'Role',
    'Underlying Client',
    'Origin',
    'Destination',
    'Distance (KM)',
    'Truck Type',
    'Payload (T)',
    'Quoted Rate (INR)',
    'Result',
    'Actual Winning Rate (INR)',
    'Trips Count',
    'Notes'
  ];

  const rows = bids.map(b => [
    `"${b.id || ''}"`,
    `"${b.date || b.bid_date || b.created?.split('T')[0] || ''}"`,
    `"${(b.client_name || b.counterparty || '').replace(/"/g, '""')}"`,
    `"${b.role || 'Broker'}"`,
    `"${(b.underlying_client || '').replace(/"/g, '""')}"`,
    `"${(b.starting_point || b.origin || '').replace(/"/g, '""')}"`,
    `"${(b.ending_point || b.destination || '').replace(/"/g, '""')}"`,
    b.distance_km || 0,
    `"${b.vehicle_type || b.truck_type || '20FT SXL'}"`,
    b.payload_tons || 0,
    b.bidding_amount || b.quoted_amount || 0,
    `"${b.status || b.result || ''}"`,
    b.bidding_lost_at || b.actual_winning_rate || 0,
    b.trips_count || 1,
    `"${(b.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `JaiBhavaniCargo_Bids_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
