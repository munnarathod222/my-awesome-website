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
    apiVersion: 1, mode: 'read-only', sections: ['trips', 'expenses', 'attendance', 'my-documents', 'truck-documents', 'truck'],
    tripActions: false, expenseSubmission: false, attendanceCheckIn: false, pushNotifications: false,
  })));
  router.get('/data/truck', auth, wrap(async (req, res) => res.json({ success: true,
    truck: await data.truck(req.driverAuth.employeeId) })));
  router.get('/data/:section', auth, wrap(async (req, res) => res.json({ success: true,
    ...await data.list(req.params.section, req.driverAuth.employeeId, pageNumber(req.query.page)) })));
  router.get('/data/:section/:id/files/:index', auth, wrap(async (req, res) => {
    const { row, name } = await data.file(req.params.section, req.params.id, req.params.index, req.driverAuth.employeeId);
    // A protected file token is used only server-side and is never sent to Android.
    const token = await pb.files.getToken({ $autoCancel: false });
    const url = new URL(pb.files.getURL(row, name, { token }));
    const base = new URL(pb.baseURL);
    if (url.origin !== base.origin || !url.pathname.startsWith('/api/files/'))
      throw new MobileDataError(503, 'FILE_UNAVAILABLE', 'Document storage is unavailable.');
    const reply = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
    if (!reply.ok || !reply.body) throw new MobileDataError(503, 'FILE_UNAVAILABLE', 'Document is unavailable.');
    const type = (reply.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      await reply.body.cancel();
      throw new MobileDataError(415, 'FILE_TYPE_UNSUPPORTED', 'Only PDF and image documents can be opened in the driver app.');
    }
    const chunks = []; let size = 0;
    for await (const chunk of reply.body) {
      size += chunk.length;
      if (size > 20 * 1024 * 1024) throw new MobileDataError(413, 'FILE_TOO_LARGE', 'Document exceeds 20 MB.');
      chunks.push(chunk);
    }
    res.set('Content-Type', type).set('X-Content-Type-Options', 'nosniff')
      .set('Content-Disposition', 'attachment').send(Buffer.concat(chunks));
  }));
}
