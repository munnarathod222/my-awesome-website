import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

function mapRouteToCorridor(r) {
  let meta = {};
  try {
    if (r.description && String(r.description).trim().startsWith('{')) {
      meta = JSON.parse(r.description);
    }
  } catch (_) {}
  return {
    id: r.id,
    corridorCode: r.route_code || meta.corridorCode || 'CORR',
    corridorName: r.route_name || meta.corridorName || `${r.start_location || ''} - ${r.end_location || ''}`,
    originCity: r.start_location || meta.originCity || '',
    destinationCity: r.end_location || meta.destinationCity || '',
    typicalDistanceKm: Number(r.distance_km || meta.typicalDistanceKm || 0),
    typicalDurationHours: Number(meta.typicalDurationHours || 8),
    typicalToll: Number(r.fastag_charge || meta.typicalToll || 0),
    typicalFuelLitres: Number(meta.typicalFuelLitres || 30),
    typicalFuelRate: Number(meta.typicalFuelRate || 92.5),
    driverBata: Number(meta.driverBata || 1000),
    maintenanceReserve: Number(meta.maintenanceReserve || 600),
    recommendedQuote: Number(r.amount_per_trip || meta.recommendedQuote || 0),
    customerDemand: meta.customerDemand || 'Medium',
    returnLoadAvailability: meta.returnLoadAvailability || 'Good',
    returnLoadProbability: Number(meta.returnLoadProbability || 75),
    delayHistory: meta.delayHistory || 'Standard highway transit.',
    notes: meta.notes || (typeof r.description === 'string' && !r.description.trim().startsWith('{') ? r.description : '')
  };
}

router.get('/', async (req, res) => {
  try {
    const records = await pb.collection('routes').getFullList({ sort: '-created', $autoCancel: false }).catch(() => []);
    const data = records.map(mapRouteToCorridor);
    return res.json({ success: true, data });
  } catch (err) {
    logger.error('GET /corridors error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const meta = {
      corridorCode: b.corridorCode || '',
      corridorName: b.corridorName || `${b.originCity || ''} - ${b.destinationCity || ''}`,
      originCity: b.originCity || '',
      destinationCity: b.destinationCity || '',
      typicalDistanceKm: Number(b.typicalDistanceKm) || 0,
      typicalDurationHours: Number(b.typicalDurationHours) || 8,
      typicalToll: Number(b.typicalToll) || 0,
      typicalFuelLitres: Number(b.typicalFuelLitres) || 30,
      typicalFuelRate: Number(b.typicalFuelRate) || 92.5,
      driverBata: Number(b.driverBata) || 1000,
      maintenanceReserve: Number(b.maintenanceReserve) || 600,
      recommendedQuote: Number(b.recommendedQuote) || 0,
      customerDemand: b.customerDemand || 'Medium',
      returnLoadAvailability: b.returnLoadAvailability || 'Good',
      returnLoadProbability: Number(b.returnLoadProbability) || 75,
      delayHistory: b.delayHistory || 'Standard highway transit.',
      notes: b.notes || ''
    };
    const pbPayload = {
      route_code: meta.corridorCode,
      route_name: meta.corridorName,
      start_location: meta.originCity,
      end_location: meta.destinationCity,
      distance_km: meta.typicalDistanceKm,
      fastag_charge: meta.typicalToll,
      amount_per_trip: meta.recommendedQuote,
      description: JSON.stringify(meta)
    };

    let saved;
    if (b.id && !String(b.id).startsWith('corr_')) {
      saved = await pb.collection('routes').update(b.id, pbPayload, { $autoCancel: false }).catch(() => null);
    }
    if (!saved) {
      saved = await pb.collection('routes').create(pbPayload, { $autoCancel: false });
    }
    return res.status(201).json({ success: true, data: mapRouteToCorridor(saved) });
  } catch (err) {
    logger.error('POST /corridors error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id && !String(id).startsWith('corr_')) {
      await pb.collection('routes').delete(id, { $autoCancel: false });
    }
    return res.json({ success: true, deletedId: id });
  } catch (err) {
    logger.error('DELETE /corridors error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
