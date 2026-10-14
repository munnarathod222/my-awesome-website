import { downloadMobileDocument } from '../services/mobileDocumentDownload.js';
import { createMobileDriverData, MobileDataError, pageNumber } from '../services/mobileDriverData.js';

// Mounted on the existing authenticated mobile router, without changing office APIs.
export function mountMobileDriverData(router, requireDriverAuth, pb) {
  const data = createMobileDriverData(pb);
  const auth = requireDriverAuth({ allowMustChange: false });
  const wrap = fn => async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    try { await fn(req, res); } catch (err) {
      const known = err instanceof MobileDataError;
      res.status(known ? err.status : 503).json({ success: false,
        code: known ? err.code : 'DATA_UNAVAILABLE',
        error: known ? err.message : 'Website data is temporarily unavailable. Please retry.' });
    }
  };
  router.get('/data/capabilities', auth, wrap(async (req, res) => res.json({ success: true,
    apiVersion: 1, mode: 'interactive', sections: ['trips', 'expenses', 'attendance', 'advances', 'my-documents', 'truck-documents', 'truck', 'performance'],
    tripActions: true, expenseSubmission: false, attendanceCheckIn: false, pushNotifications: false,
  })));
  router.get('/data/truck', auth, wrap(async (req, res) => res.json({ success: true,
    truck: await data.truck(req.driverAuth.employeeId) })));
  router.get('/data/performance', auth, wrap(async (req, res) => res.json({ success: true,
    performance: await data.performance(req.driverAuth.employeeId, req.driverAuth.employeeCode) })));

  // Trip state transitions
  const handleTransition = wrap(async (req, res) => {
    const targetStatus = req.body.targetStatus || req.body.status;
    const meta = {
      deviceId: req.headers['x-device-id'] || req.body.deviceId,
      location: req.body.location || (req.body.latitude ? { lat: req.body.latitude, lng: req.body.longitude } : null)
    };
    const result = await data.transition(req.params.id, targetStatus, meta, req.driverAuth.employeeId, req.driverAuth.employeeCode);
    res.json(result);
  });
  router.post('/trips/:id/transition', auth, handleTransition);
  router.post('/data/trips/:id/transition', auth, handleTransition);

  // Delivery proof (POD) upload
  const handlePodUpload = wrap(async (req, res) => {
    let buf = null;
    if (req.body && req.body.base64) {
      buf = Buffer.from(req.body.base64.replace(/^data:[^;]+;base64,/, ''), 'base64');
    } else if (req.body && req.body.buffer) {
      buf = Buffer.from(req.body.buffer, 'base64');
    } else if (req.file && req.file.buffer) {
      buf = req.file.buffer;
    } else if (Buffer.isBuffer(req.body)) {
      buf = req.body;
    }
    if (!buf || buf.length === 0) {
      return res.status(400).json({ success: false, code: 'FILE_REQUIRED', error: 'POD image or document is required' });
    }
    const filename = req.body?.filename || req.file?.originalname || 'pod_delivery_proof.jpg';
    const meta = {
      deviceId: req.headers['x-device-id'] || req.body?.deviceId,
      location: req.body?.location || (req.body?.latitude ? { lat: req.body?.latitude, lng: req.body?.longitude } : null)
    };
    const result = await data.uploadPod(req.params.id, { buffer: buf, filename }, meta, req.driverAuth.employeeId, req.driverAuth.employeeCode);
    res.json(result);
  });
  router.post('/trips/:id/pod', auth, handlePodUpload);
  router.post('/data/trips/:id/pod', auth, handlePodUpload);

  router.get('/data/:section', auth, wrap(async (req, res) => res.json({ success: true,
    ...await data.list(req.params.section, req.driverAuth.employeeId, pageNumber(req.query.page), req.driverAuth.employeeCode) })));
  router.get('/data/:section/:id/files/:index', auth, wrap(async (req, res) => {
    const { row, name } = await data.file(req.params.section, req.params.id, req.params.index, req.driverAuth.employeeId, req.driverAuth.employeeCode);
    const { bytes, type } = await downloadMobileDocument(row, name);
    res.set('Content-Type', type).set('X-Content-Type-Options', 'nosniff')
      .set('Content-Disposition', 'attachment').send(bytes);
  }));
}
