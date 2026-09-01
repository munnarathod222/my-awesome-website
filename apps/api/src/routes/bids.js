import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import path from 'node:path';
import fs from 'node:fs';

const router = express.Router();

function getSqliteDb() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const possiblePaths = [
      global.dbFilePath,
      '/data/data.db',
      path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
      path.resolve(process.cwd(), 'pb_data/data.db'),
      path.resolve(__dirname, '../../../pocketbase/pb_data/data.db'),
      '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
    ].filter(p => p && fs.existsSync(p));

    if (possiblePaths.length > 0) {
      return { db: new DatabaseSync(possiblePaths[0]), path: possiblePaths[0] };
    }
  } catch (e) {
    logger.warn('SQLite connection notice in bids.js:', e.message);
  }
  return null;
}

/**
 * GET /api/bidding/bids
 * Fetch all bids across PocketBase and SQLite
 */
router.get('/bids', async (req, res) => {
  try {
    const bidsMap = new Map();

    // 1. Fetch from PocketBase
    try {
      const records = await pb.collection('bids').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      (records || []).forEach(r => {
        if (r.id) bidsMap.set(r.id, r);
      });
    } catch (pbErr) {
      logger.warn(`Could not load bids via PB SDK: ${pbErr.message}`);
    }

    // 2. Fetch from direct SQLite
    try {
      const sqlite = getSqliteDb();
      if (sqlite) {
        const rows = sqlite.db.prepare('SELECT * FROM bids ORDER BY created DESC').all();
        (rows || []).forEach(row => {
          if (row.id && !bidsMap.has(row.id)) {
            bidsMap.set(row.id, row);
          }
        });
        sqlite.db.close();
      }
    } catch (sqErr) {
      logger.warn(`SQLite bids fetch error: ${sqErr.message}`);
    }

    const allBids = Array.from(bidsMap.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.bid_date || a.created || 0).getTime();
      const dateB = new Date(b.date || b.bid_date || b.created || 0).getTime();
      return dateB - dateA;
    });

    return res.json({
      success: true,
      count: allBids.length,
      bids: allBids
    });
  } catch (err) {
    logger.error('Error fetching bids:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch bids' });
  }
});

/**
 * POST /api/bidding/bids
 * Create or update a bid in both PocketBase and SQLite
 */
router.post('/bids', async (req, res) => {
  try {
    const bidData = req.body;
    if (!bidData) {
      return res.status(400).json({ success: false, error: 'Bid data is required.' });
    }

    let saved = null;
    const bidId = bidData.id || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    // 1. Save to PocketBase
    try {
      const isPbId = bidData.id && !bidData.id.startsWith('bid_') && bidData.id.length === 15;
      const pbPayload = {
        date: bidData.date || bidData.bid_date || nowIso.split('T')[0],
        bid_date: bidData.bid_date || bidData.date || nowIso.split('T')[0],
        client_name: bidData.client_name || bidData.counterparty || 'Delhivery',
        counterparty: bidData.counterparty || bidData.client_name || 'Delhivery',
        role: bidData.role || 'Broker',
        underlying_client: bidData.underlying_client || '',
        bidding_type: bidData.bidding_type || bidData.bid_type || 'Contract',
        bid_type: bidData.bid_type || bidData.bidding_type || 'Contract',
        vehicle_type: bidData.vehicle_type || bidData.truck_type || '32FTSXL',
        truck_type: bidData.truck_type || bidData.vehicle_type || '32FTSXL',
        bidding_amount: Number(bidData.bidding_amount || bidData.quoted_amount || 0) || null,
        quoted_amount: Number(bidData.quoted_amount || bidData.bidding_amount || 0) || null,
        quoted_rate: Number(bidData.quoted_rate || bidData.bidding_amount || 0) || null,
        bidding_lost_at: Number(bidData.bidding_lost_at || 0) || null,
        actual_winning_rate: Number(bidData.actual_winning_rate || 0) || null,
        trip_detail: bidData.trip_detail || '1 Way',
        starting_point: bidData.starting_point || bidData.origin || '',
        origin: bidData.origin || bidData.starting_point || '',
        ending_point: bidData.ending_point || bidData.destination || '',
        destination: bidData.destination || bidData.ending_point || '',
        no_of_stops: Number(bidData.no_of_stops || 1),
        route_map: bidData.route_map || '',
        status: bidData.status || 'Not bidded',
        result: bidData.result || (bidData.status === 'Won' ? 'Won' : bidData.status === 'Lost' ? 'Lost' : 'Pending'),
        distance_km: Number(bidData.distance_km || 0),
        payload_tons: Number(bidData.payload_tons || 6),
        trips_count: Number(bidData.trips_count || 1),
        monthly_trips: Number(bidData.monthly_trips || 15),
        contract_ref: bidData.contract_ref || '',
        contract_date: bidData.contract_date || '',
        attachments: typeof bidData.attachments === 'string' ? bidData.attachments : JSON.stringify(bidData.attachments || []),
        notes: bidData.notes || ''
      };

      if (isPbId) {
        saved = await pb.collection('bids').update(bidData.id, pbPayload, { $autoCancel: false });
      } else {
        saved = await pb.collection('bids').create(pbPayload, { $autoCancel: false });
      }
    } catch (pbErr) {
      logger.warn(`PocketBase save bid error: ${pbErr.message}`);
    }

    // 2. Direct SQLite insertion & update
    try {
      const sqlite = getSqliteDb();
      if (sqlite) {
        try { sqlite.db.exec("ALTER TABLE bids ADD COLUMN attachments TEXT DEFAULT '[]';"); } catch (_) {}
        try { sqlite.db.exec("ALTER TABLE bids ADD COLUMN images TEXT DEFAULT '[]';"); } catch (_) {}

        sqlite.db.prepare(`
          INSERT OR REPLACE INTO bids (
            id, date, bid_date, client_name, counterparty, role, underlying_client,
            bidding_type, bid_type, vehicle_type, truck_type, bidding_amount,
            quoted_amount, quoted_rate, bidding_lost_at, actual_winning_rate,
            trip_detail, starting_point, origin, ending_point, destination,
            no_of_stops, route_map, status, result, distance_km, payload_tons,
            trips_count, monthly_trips, contract_ref, contract_date, attachments, notes,
            created, updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          saved?.id || bidId,
          bidData.date || bidData.bid_date || nowIso.split('T')[0],
          bidData.bid_date || bidData.date || nowIso.split('T')[0],
          bidData.client_name || bidData.counterparty || 'Delhivery',
          bidData.counterparty || bidData.client_name || 'Delhivery',
          bidData.role || 'Broker',
          bidData.underlying_client || '',
          bidData.bidding_type || bidData.bid_type || 'Contract',
          bidData.bid_type || bidData.bidding_type || 'Contract',
          bidData.vehicle_type || bidData.truck_type || '32FTSXL',
          bidData.truck_type || bidData.vehicle_type || '32FTSXL',
          Number(bidData.bidding_amount || bidData.quoted_amount || 0) || 0,
          Number(bidData.quoted_amount || bidData.bidding_amount || 0) || 0,
          Number(bidData.quoted_rate || bidData.bidding_amount || 0) || 0,
          Number(bidData.bidding_lost_at || 0) || 0,
          Number(bidData.actual_winning_rate || 0) || 0,
          bidData.trip_detail || '1 Way',
          bidData.starting_point || bidData.origin || '',
          bidData.origin || bidData.starting_point || '',
          bidData.ending_point || bidData.destination || '',
          bidData.destination || bidData.ending_point || '',
          Number(bidData.no_of_stops || 1),
          bidData.route_map || '',
          bidData.status || 'Not bidded',
          bidData.result || (bidData.status === 'Won' ? 'Won' : bidData.status === 'Lost' ? 'Lost' : 'Pending'),
          Number(bidData.distance_km || 0),
          Number(bidData.payload_tons || 6),
          Number(bidData.trips_count || 1),
          Number(bidData.monthly_trips || 15),
          bidData.contract_ref || '',
          bidData.contract_date || '',
          typeof bidData.attachments === 'string' ? bidData.attachments : JSON.stringify(bidData.attachments || []),
          bidData.notes || '',
          nowIso,
          nowIso
        );
        try { sqlite.db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run(); } catch (_) {}
        sqlite.db.close();
      }
    } catch (sqErr) {
      logger.warn(`SQLite save bid error: ${sqErr.message}`);
    }

    // 3. Trigger Supabase backup
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    return res.json({
      success: true,
      bid: saved || { id: bidId, ...bidData }
    });
  } catch (err) {
    logger.error('Error saving bid:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save bid' });
  }
});

/**
 * POST /api/bidding/sync
 * Bulk cross-device synchronizer: merges local bids from iPad/laptop into the server and returns unified list
 */
router.post('/sync', async (req, res) => {
  try {
    const { localBids } = req.body || {};
    const bidsMap = new Map();

    // 1. Load existing server bids
    try {
      const records = await pb.collection('bids').getFullList({ $autoCancel: false });
      (records || []).forEach(r => {
        if (r.id) bidsMap.set(r.id, r);
      });
    } catch (e) {}

    const sqlite = getSqliteDb();
    if (sqlite) {
      try {
        const rows = sqlite.db.prepare('SELECT * FROM bids').all();
        (rows || []).forEach(r => {
          if (r.id && !bidsMap.has(r.id)) bidsMap.set(r.id, r);
        });
      } catch (e) {}
    }

    // 2. Merge incoming local bids that aren't yet on server
    if (Array.isArray(localBids) && localBids.length > 0) {
      for (const lb of localBids) {
        if (!lb.id) continue;
        const exists = bidsMap.has(lb.id) || Array.from(bidsMap.values()).some(
          eb => eb.date === lb.date && eb.starting_point === lb.starting_point && eb.ending_point === lb.ending_point && eb.client_name === lb.client_name
        );

        if (!exists) {
          const nowIso = new Date().toISOString();
          let createdPb = null;
          try {
            createdPb = await pb.collection('bids').create({
              date: lb.date || nowIso.split('T')[0],
              bid_date: lb.bid_date || lb.date || nowIso.split('T')[0],
              client_name: lb.client_name || lb.counterparty || 'Delhivery',
              counterparty: lb.counterparty || lb.client_name || 'Delhivery',
              role: lb.role || 'Broker',
              underlying_client: lb.underlying_client || '',
              bidding_type: lb.bidding_type || lb.bid_type || 'Contract',
              bid_type: lb.bid_type || lb.bidding_type || 'Contract',
              vehicle_type: lb.vehicle_type || lb.truck_type || '32FTSXL',
              truck_type: lb.truck_type || lb.vehicle_type || '32FTSXL',
              bidding_amount: Number(lb.bidding_amount || lb.quoted_amount || 0) || null,
              quoted_amount: Number(lb.quoted_amount || lb.bidding_amount || 0) || null,
              quoted_rate: Number(lb.quoted_rate || lb.bidding_amount || 0) || null,
              bidding_lost_at: Number(lb.bidding_lost_at || 0) || null,
              actual_winning_rate: Number(lb.actual_winning_rate || 0) || null,
              trip_detail: lb.trip_detail || '1 Way',
              starting_point: lb.starting_point || lb.origin || '',
              origin: lb.origin || lb.starting_point || '',
              ending_point: lb.ending_point || lb.destination || '',
              destination: lb.destination || lb.ending_point || '',
              no_of_stops: Number(lb.no_of_stops || 1),
              route_map: lb.route_map || '',
              status: lb.status || 'Not bidded',
              result: lb.result || 'Pending',
              distance_km: Number(lb.distance_km || 0),
              payload_tons: Number(lb.payload_tons || 6),
              trips_count: Number(lb.trips_count || 1),
              monthly_trips: Number(lb.monthly_trips || 15),
              contract_ref: lb.contract_ref || '',
              contract_date: lb.contract_date || '',
              attachments: typeof lb.attachments === 'string' ? lb.attachments : JSON.stringify(lb.attachments || []),
              notes: lb.notes || ''
            }, { $autoCancel: false });
          } catch (e) {}

          if (sqlite) {
            try {
              sqlite.db.prepare(`
                INSERT OR REPLACE INTO bids (
                  id, date, bid_date, client_name, counterparty, role, underlying_client,
                  bidding_type, bid_type, vehicle_type, truck_type, bidding_amount,
                  quoted_amount, quoted_rate, bidding_lost_at, actual_winning_rate,
                  trip_detail, starting_point, origin, ending_point, destination,
                  no_of_stops, route_map, status, result, distance_km, payload_tons,
                  trips_count, monthly_trips, contract_ref, contract_date, attachments, notes,
                  created, updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                createdPb?.id || lb.id,
                lb.date || nowIso.split('T')[0],
                lb.bid_date || lb.date || nowIso.split('T')[0],
                lb.client_name || lb.counterparty || 'Delhivery',
                lb.counterparty || lb.client_name || 'Delhivery',
                lb.role || 'Broker',
                lb.underlying_client || '',
                lb.bidding_type || lb.bid_type || 'Contract',
                lb.bid_type || lb.bidding_type || 'Contract',
                lb.vehicle_type || lb.truck_type || '32FTSXL',
                lb.truck_type || lb.vehicle_type || '32FTSXL',
                Number(lb.bidding_amount || lb.quoted_amount || 0) || 0,
                Number(lb.quoted_amount || lb.bidding_amount || 0) || 0,
                Number(lb.quoted_rate || lb.bidding_amount || 0) || 0,
                Number(lb.bidding_lost_at || 0) || 0,
                Number(lb.actual_winning_rate || 0) || 0,
                lb.trip_detail || '1 Way',
                lb.starting_point || lb.origin || '',
                lb.origin || lb.starting_point || '',
                lb.ending_point || lb.destination || '',
                lb.destination || lb.ending_point || '',
                Number(lb.no_of_stops || 1),
                lb.route_map || '',
                lb.status || 'Not bidded',
                lb.result || 'Pending',
                Number(lb.distance_km || 0),
                Number(lb.payload_tons || 6),
                Number(lb.trips_count || 1),
                Number(lb.monthly_trips || 15),
                lb.contract_ref || '',
                lb.contract_date || '',
                typeof lb.attachments === 'string' ? lb.attachments : JSON.stringify(lb.attachments || []),
                lb.notes || '',
                nowIso,
                nowIso
              );
            } catch (e) {}
          }

          bidsMap.set(createdPb?.id || lb.id, createdPb || lb);
        }
      }
    }

    if (sqlite) {
      try { sqlite.db.close(); } catch (e) {}
    }

    const unifiedList = Array.from(bidsMap.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.bid_date || a.created || 0).getTime();
      const dateB = new Date(b.date || b.bid_date || b.created || 0).getTime();
      return dateB - dateA;
    });

    return res.json({
      success: true,
      count: unifiedList.length,
      bids: unifiedList
    });
  } catch (err) {
    logger.error('Error syncing bids:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to sync bids' });
  }
});

/**
 * DELETE /api/bidding/bids/:id
 */
router.delete('/bids/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'ID required' });

    try {
      await pb.collection('bids').delete(id, { $autoCancel: false });
    } catch (e) {}

    try {
      const sqlite = getSqliteDb();
      if (sqlite) {
        sqlite.db.prepare('DELETE FROM bids WHERE id = ?').run(id);
        sqlite.db.close();
      }
    } catch (e) {}

    return res.json({ success: true, message: 'Bid deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
