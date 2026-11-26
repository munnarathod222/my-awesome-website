import { Router } from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const require = createRequire(import.meta.url);
const router = Router();

let _cachedDb = null;
function getDb() {
  if (_cachedDb) return _cachedDb;
  try {
    const { DatabaseSync } = require('node:sqlite');
    const candidates = [
      global.dbFilePath,
      process.env.PB_DATA_DIR ? path.join(process.env.PB_DATA_DIR, 'data.db') : null,
      path.resolve(process.cwd(), '../pocketbase/pb_data/data.db'),
      path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
      path.resolve(process.cwd(), 'pb_data/data.db'),
      '/data/data.db',
      '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
    ].filter(p => p && fs.existsSync(p));

    if (candidates.length > 0) {
      const db = new DatabaseSync(candidates[0]);
      db.exec(`
        CREATE TABLE IF NOT EXISTS marketplace_loads (
          id TEXT PRIMARY KEY,
          load_code TEXT,
          client_id TEXT,
          client_name TEXT,
          origin TEXT,
          destination TEXT,
          pickup_date TEXT,
          vehicle_type TEXT,
          weight_mt REAL DEFAULT 0,
          material TEXT,
          distance_km REAL DEFAULT 0,
          client_rate REAL DEFAULT 0,
          commission_type TEXT DEFAULT 'percent',
          commission_value REAL DEFAULT 10,
          max_transporter_budget REAL DEFAULT 0,
          assigned_rate REAL DEFAULT 0,
          jbc_margin REAL DEFAULT 0,
          fulfilment_mode TEXT DEFAULT 'open_bidding',
          visibility TEXT DEFAULT 'public_transporters',
          assigned_truck_id TEXT,
          assigned_truck_number TEXT,
          assigned_driver_id TEXT,
          assigned_driver_name TEXT,
          assigned_driver_phone TEXT,
          assigned_transporter_id TEXT,
          assigned_transporter_name TEXT,
          assigned_transporter_phone TEXT,
          winning_bid_id TEXT,
          trip_log_id TEXT,
          status TEXT DEFAULT 'Bidding Open',
          notes TEXT,
          created TEXT,
          updated TEXT
        );
        CREATE TABLE IF NOT EXISTS marketplace_bids (
          id TEXT PRIMARY KEY,
          load_id TEXT,
          transporter_id TEXT,
          transporter_name TEXT,
          transporter_phone TEXT,
          bid_amount REAL DEFAULT 0,
          counter_offer_amount REAL DEFAULT 0,
          truck_number TEXT,
          driver_name TEXT,
          driver_phone TEXT,
          eta_hours REAL DEFAULT 0,
          notes TEXT,
          status TEXT DEFAULT 'Pending',
          created TEXT,
          updated TEXT
        );
      `);
      _cachedDb = db;
      return db;
    }
  } catch (err) {
    logger.warn('[Marketplace] SQLite init warning:', err.message);
  }
  return null;
}

function calcBudget(clientRate, commType, commVal) {
  const rate = Number(clientRate) || 0;
  const val = Number(commVal) || 0;
  if (rate <= 0) return 0;
  if (commType === 'flat') return Math.max(0, Math.round(rate - val));
  return Math.max(0, Math.round(rate * (1 - val / 100)));
}

async function createTripForLoad(load, opts = {}) {
  try {
    const tripPayload = {
      trip_id: load.load_code || ('MKT-' + Date.now().toString().slice(-4)),
      client_id: load.client_id || '',
      client_name: load.client_name || 'Marketplace Client',
      origin: load.origin || '',
      destination: load.destination || '',
      route: `${load.origin || ''} -> ${load.destination || ''}`,
      date: load.pickup_date || new Date().toISOString().split('T')[0],
      kms: Number(load.distance_km) || 0,
      revenue: Number(load.client_rate) || 0,
      vendor_freight: Number(opts.transporterRate || 0),
      truck_number: opts.truckNumber || '',
      driver_name: opts.driverName || '',
      driver_phone: opts.driverPhone || '',
      goods_description: load.material || 'Commercial Freight Cargo',
      trip_status: 'In-Transit',
      status: 'In-Transit',
      client_payment_status: 'Pending',
      notes: opts.isOwnFleet
        ? `Marketplace Own-Fleet Load (${load.load_code})`
        : `Marketplace Brokered Load (${load.load_code}) | Transporter: ${opts.transporterName || ''} | Margin: ₹${opts.margin || 0}`
    };
    const created = await pb.collection('trip_logs').create(tripPayload, { $autoCancel: false });
    return created?.id || '';
  } catch (err) {
    logger.warn('[Marketplace] Could not auto-create trip_logs:', err.message);
    return '';
  }
}

router.get('/loads', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, loads: [] });
    const role = String(req.query.role || 'admin').toLowerCase();
    const loads = db.prepare('SELECT * FROM marketplace_loads ORDER BY created DESC').all();
    const bids = db.prepare('SELECT * FROM marketplace_bids ORDER BY bid_amount ASC').all();

    const bidsByLoad = {};
    for (const b of bids) {
      if (!bidsByLoad[b.load_id]) bidsByLoad[b.load_id] = [];
      bidsByLoad[b.load_id].push(b);
    }

    const enriched = loads.map(l => {
      const loadBids = bidsByLoad[l.id] || [];
      const pendingBids = loadBids.filter(b => b.status !== 'Rejected');
      const lowestBid = pendingBids.length > 0 ? Math.min(...pendingBids.map(b => Number(b.bid_amount) || 0)) : null;

      if (role === 'transporter') {
        return {
          id: l.id,
          load_code: l.load_code,
          origin: l.origin,
          destination: l.destination,
          pickup_date: l.pickup_date,
          vehicle_type: l.vehicle_type,
          weight_mt: l.weight_mt,
          material: l.material,
          distance_km: l.distance_km,
          max_transporter_budget: l.max_transporter_budget,
          fulfilment_mode: l.fulfilment_mode,
          visibility: l.visibility,
          assigned_transporter_id: l.assigned_transporter_id,
          assigned_transporter_name: l.assigned_transporter_name,
          status: l.status,
          notes: l.notes,
          bid_count: loadBids.length,
          lowest_bid: lowestBid,
          created: l.created
        };
      }

      if (role === 'client') {
        return {
          id: l.id,
          load_code: l.load_code,
          client_id: l.client_id,
          client_name: l.client_name,
          origin: l.origin,
          destination: l.destination,
          pickup_date: l.pickup_date,
          vehicle_type: l.vehicle_type,
          weight_mt: l.weight_mt,
          material: l.material,
          distance_km: l.distance_km,
          client_rate: l.client_rate,
          assigned_truck_number: l.assigned_truck_number,
          assigned_driver_name: l.assigned_driver_name,
          assigned_driver_phone: l.assigned_driver_phone,
          trip_log_id: l.trip_log_id,
          status: l.status,
          notes: l.notes,
          created: l.created
        };
      }

      return {
        ...l,
        bid_count: loadBids.length,
        lowest_bid: lowestBid,
        bids: loadBids
      };
    });

    return res.json({ success: true, loads: enriched });
  } catch (err) {
    logger.error('[Marketplace] GET /loads error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/loads', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ success: false, error: 'Database unavailable' });
    const d = req.body || {};
    if (!d.origin || !d.destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required' });
    }
    const id = 'mkt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const loadCode = d.load_code || ('JBC-LD-' + String(Date.now()).slice(-4));
    const now = new Date().toISOString();
    const clientRate = Number(d.client_rate) || 0;
    const commType = d.commission_type === 'flat' ? 'flat' : 'percent';
    const commVal = Number(d.commission_value ?? 10);
    const maxBudget = Number(d.max_transporter_budget) || calcBudget(clientRate, commType, commVal);
    const mode = d.fulfilment_mode || 'open_bidding';
    const status = d.status || (mode === 'open_bidding' ? 'Bidding Open' : 'Posted');

    db.prepare(`
      INSERT INTO marketplace_loads (
        id, load_code, client_id, client_name, origin, destination, pickup_date,
        vehicle_type, weight_mt, material, distance_km, client_rate, commission_type,
        commission_value, max_transporter_budget, fulfilment_mode, visibility, status, notes, created, updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, loadCode, d.client_id || '', d.client_name || 'Direct Client', d.origin.trim(), d.destination.trim(),
      d.pickup_date || now.split('T')[0], d.vehicle_type || '32FT SXL', Number(d.weight_mt) || 0,
      d.material || 'Commercial Freight', Number(d.distance_km) || 0, clientRate, commType, commVal,
      maxBudget, mode, d.visibility || 'public_transporters', status, d.notes || '', now, now
    );

    const created = db.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(id);
    return res.json({ success: true, load: created });
  } catch (err) {
    logger.error('[Marketplace] POST /loads error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/loads/:id/assign-own', async (req, res) => {
  try {
    const db = getDb();
    const load = db?.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(req.params.id);
    if (!load) return res.status(404).json({ success: false, error: 'Load not found' });

    const { truck_id, truck_number, driver_id, driver_name, driver_phone } = req.body || {};
    if (!truck_number) return res.status(400).json({ success: false, error: 'Truck number is required' });

    const tripId = await createTripForLoad(load, {
      isOwnFleet: true,
      truckNumber: truck_number,
      driverName: driver_name || 'Assigned Driver',
      driverPhone: driver_phone || ''
    });

    const now = new Date().toISOString();
    const margin = Number(load.client_rate) || 0;
    db.prepare(`
      UPDATE marketplace_loads SET
        fulfilment_mode = 'own_fleet',
        assigned_truck_id = ?, assigned_truck_number = ?,
        assigned_driver_id = ?, assigned_driver_name = ?, assigned_driver_phone = ?,
        assigned_rate = 0, jbc_margin = ?, trip_log_id = ?, status = 'Assigned', updated = ?
      WHERE id = ?
    `).run(truck_id || '', truck_number, driver_id || '', driver_name || '', driver_phone || '', margin, tripId, now, load.id);

    const updated = db.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(load.id);
    return res.json({ success: true, load: updated, trip_log_id: tripId });
  } catch (err) {
    logger.error('[Marketplace] assign-own error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/loads/:id/assign-transporter', async (req, res) => {
  try {
    const db = getDb();
    const load = db?.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(req.params.id);
    if (!load) return res.status(404).json({ success: false, error: 'Load not found' });

    const { transporter_id, transporter_name, transporter_phone, transporter_rate, truck_number, driver_name, driver_phone } = req.body || {};
    if (!transporter_name) return res.status(400).json({ success: false, error: 'Transporter name is required' });

    const tRate = Number(transporter_rate) || 0;
    const margin = Math.max(0, (Number(load.client_rate) || 0) - tRate);
    const tripId = await createTripForLoad(load, {
      isOwnFleet: false,
      transporterName: transporter_name,
      transporterRate: tRate,
      margin,
      truckNumber: truck_number || '',
      driverName: driver_name || '',
      driverPhone: driver_phone || ''
    });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE marketplace_loads SET
        fulfilment_mode = 'direct_transporter',
        assigned_transporter_id = ?, assigned_transporter_name = ?, assigned_transporter_phone = ?,
        assigned_truck_number = ?, assigned_driver_name = ?, assigned_driver_phone = ?,
        assigned_rate = ?, jbc_margin = ?, trip_log_id = ?, status = 'Assigned', updated = ?
      WHERE id = ?
    `).run(
      transporter_id || '', transporter_name, transporter_phone || '',
      truck_number || '', driver_name || '', driver_phone || '',
      tRate, margin, tripId, now, load.id
    );

    const updated = db.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(load.id);
    return res.json({ success: true, load: updated, trip_log_id: tripId });
  } catch (err) {
    logger.error('[Marketplace] assign-transporter error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/loads/:id/open-bidding', async (req, res) => {
  try {
    const db = getDb();
    const load = db?.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(req.params.id);
    if (!load) return res.status(404).json({ success: false, error: 'Load not found' });

    const { max_transporter_budget, commission_type, commission_value } = req.body || {};
    const cType = commission_type || load.commission_type || 'percent';
    const cVal = Number(commission_value ?? load.commission_value ?? 10);
    const budget = Number(max_transporter_budget) || calcBudget(load.client_rate, cType, cVal);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE marketplace_loads SET
        fulfilment_mode = 'open_bidding', visibility = 'public_transporters',
        commission_type = ?, commission_value = ?, max_transporter_budget = ?,
        status = 'Bidding Open', updated = ?
      WHERE id = ?
    `).run(cType, cVal, budget, now, load.id);

    const updated = db.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(load.id);
    return res.json({ success: true, load: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/loads/:id/bids', async (req, res) => {
  try {
    const db = getDb();
    const load = db?.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(req.params.id);
    if (!load) return res.status(404).json({ success: false, error: 'Load not found' });

    const d = req.body || {};
    if (!d.transporter_name || !d.bid_amount) {
      return res.status(400).json({ success: false, error: 'Transporter name and bid amount are required' });
    }
    const id = 'bid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO marketplace_bids (
        id, load_id, transporter_id, transporter_name, transporter_phone, bid_amount,
        truck_number, driver_name, driver_phone, eta_hours, notes, status, created, updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `).run(
      id, load.id, d.transporter_id || '', d.transporter_name.trim(), d.transporter_phone || '',
      Number(d.bid_amount), d.truck_number || '', d.driver_name || '', d.driver_phone || '',
      Number(d.eta_hours) || 4, d.notes || '', now, now
    );

    const created = db.prepare('SELECT * FROM marketplace_bids WHERE id = ?').get(id);
    return res.json({ success: true, bid: created });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bids/:bidId/counter', async (req, res) => {
  try {
    const db = getDb();
    const bid = db?.prepare('SELECT * FROM marketplace_bids WHERE id = ?').get(req.params.bidId);
    if (!bid) return res.status(404).json({ success: false, error: 'Bid not found' });

    const counterAmt = Number(req.body?.counter_offer_amount) || 0;
    const now = new Date().toISOString();
    db.prepare('UPDATE marketplace_bids SET counter_offer_amount = ?, status = ?, updated = ? WHERE id = ?')
      .run(counterAmt, 'Countered', now, bid.id);
    const updated = db.prepare('SELECT * FROM marketplace_bids WHERE id = ?').get(bid.id);
    return res.json({ success: true, bid: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bids/:bidId/award', async (req, res) => {
  try {
    const db = getDb();
    const bid = db?.prepare('SELECT * FROM marketplace_bids WHERE id = ?').get(req.params.bidId);
    if (!bid) return res.status(404).json({ success: false, error: 'Bid not found' });
    const load = db?.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(bid.load_id);
    if (!load) return res.status(404).json({ success: false, error: 'Load not found' });

    const awardedRate = Number(req.body?.final_rate || bid.bid_amount) || 0;
    const margin = Math.max(0, (Number(load.client_rate) || 0) - awardedRate);
    const now = new Date().toISOString();

    const tripId = await createTripForLoad(load, {
      isOwnFleet: false,
      transporterName: bid.transporter_name,
      transporterRate: awardedRate,
      margin,
      truckNumber: bid.truck_number || '',
      driverName: bid.driver_name || '',
      driverPhone: bid.driver_phone || ''
    });

    db.prepare('UPDATE marketplace_bids SET status = ?, updated = ? WHERE id = ?').run('Awarded', now, bid.id);
    db.prepare('UPDATE marketplace_bids SET status = ?, updated = ? WHERE load_id = ? AND id != ?').run('Rejected', now, load.id, bid.id);
    db.prepare(`
      UPDATE marketplace_loads SET
        fulfilment_mode = 'open_bidding',
        assigned_transporter_id = ?, assigned_transporter_name = ?, assigned_transporter_phone = ?,
        assigned_truck_number = ?, assigned_driver_name = ?, assigned_driver_phone = ?,
        assigned_rate = ?, jbc_margin = ?, winning_bid_id = ?, trip_log_id = ?, status = 'Assigned', updated = ?
      WHERE id = ?
    `).run(
      bid.transporter_id || '', bid.transporter_name, bid.transporter_phone || '',
      bid.truck_number || '', bid.driver_name || '', bid.driver_phone || '',
      awardedRate, margin, bid.id, tripId, now, load.id
    );

    const updatedLoad = db.prepare('SELECT * FROM marketplace_loads WHERE id = ?').get(load.id);
    return res.json({ success: true, load: updatedLoad, trip_log_id: tripId });
  } catch (err) {
    logger.error('[Marketplace] award bid error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/loads/:id', async (req, res) => {
  try {
    const db = getDb();
    db?.prepare('DELETE FROM marketplace_bids WHERE load_id = ?').run(req.params.id);
    db?.prepare('DELETE FROM marketplace_loads WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
