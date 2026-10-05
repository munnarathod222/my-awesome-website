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
    apiVersion: 1, mode: 'read-only', sections: ['trips', 'expenses', 'attendance', 'my-documents', 'truck-documents', 'truck', 'performance'],
    tripActions: false, expenseSubmission: false, attendanceCheckIn: false, pushNotifications: false,
  })));
  router.get('/data/truck', auth, wrap(async (req, res) => res.json({ success: true,
    truck: await data.truck(req.driverAuth.employeeId) })));
  router.get('/data/performance', auth, wrap(async (req, res) => res.json({ success: true,
    performance: await data.performance(req.driverAuth.employeeId, req.driverAuth.employeeCode) })));
  router.get('/data/:section', auth, wrap(async (req, res) => res.json({ success: true,
    ...await data.list(req.params.section, req.driverAuth.employeeId, pageNumber(req.query.page), req.driverAuth.employeeCode) })));
  router.get('/data/:section/:id/files/:index', auth, wrap(async (req, res) => {
    const { row, name } = await data.file(req.params.section, req.params.id, req.params.index, req.driverAuth.employeeId);
    const { bytes, type } = await downloadMobileDocument(row, name);
    res.set('Content-Type', type).set('X-Content-Type-Options', 'nosniff')
      .set('Content-Disposition', 'attachment').send(bytes);
  }));
}
