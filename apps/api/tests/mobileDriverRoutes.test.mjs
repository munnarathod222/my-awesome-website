import test from 'node:test';
import assert from 'node:assert/strict';
import { mountMobileDriverData } from '../src/routes/mobileDriverData.js';

function harness(pb = {}) {
  pb.collections ??= { getOne: async () => ({ fields: [{name:'submitted_by_employee_id',type:'text'}, {name:'date'}] }) };
  const routes = [];
  const router = { get: (path, ...handlers) => routes.push({ path, handlers }) };
  const requireAuth = options => {
    assert.equal(options.allowMustChange, false);
    return (req, res, next) => {
      if (!req.driverAuth) return res.status(401).json({ success: false });
      if (req.driverAuth.mustChange) return res.status(403).json({ success: false, code: 'PASSWORD_CHANGE_REQUIRED' });
      return next();
    };
  };
  mountMobileDriverData(router, requireAuth, pb);
  async function call(path, req = {}) {
    const response = { statusCode: 200, headers: {}, body: null,
      set(k, v) { this.headers[k] = v; return this; },
      status(v) { this.statusCode = v; return this; },
      json(v) { this.body = v; return this; }, send(v) { this.body = v; return this; } };
    const route = routes.find(r => r.path === path); assert.ok(route);
    const request = { params: {}, query: {}, ...req };
    let index = 0;
    await route.handlers[index++](request, response, () => route.handlers[index++](request, response));
    return response;
  }
  return { routes, call };
}
test('all business and download routes require an authenticated driver', async () => {
  const h = harness();
  for (const r of h.routes) assert.equal((await h.call(r.path)).statusCode, 401);
});
test('temporary password restriction applies to every business route', async () => {
  const h = harness();
  for (const r of h.routes) assert.equal((await h.call(r.path, { driverAuth: { mustChange: true } })).statusCode, 403);
});
test('capabilities never advertise missing write or push support', async () => {
  const r = await harness().call('/data/capabilities', { driverAuth: { employeeId: 'a' } });
  assert.equal(r.body.mode, 'read-only');
  for (const key of ['tripActions', 'expenseSubmission', 'attendanceCheckIn', 'pushNotifications']) assert.equal(r.body[key], false);
  assert.equal(r.headers['Cache-Control'], 'private, no-store');
});
test('an upstream failure does not leak raw errors or become empty success', async () => {
  const pb = { filter: () => '', collection: () => ({ getList: async () => { throw Error('private storage details'); } }) };
  const r = await harness(pb).call('/data/:section', { driverAuth: { employeeId: 'a' }, params: { section: 'expenses' } });
  assert.equal(r.statusCode, 503); assert.equal(r.body.code, 'DATA_UNAVAILABLE');
  assert.ok(!JSON.stringify(r.body).includes('private storage'));
});
test('query-string employee ID cannot override the authenticated driver', async () => {
  let owner;
  const pb = { filter: (_, args) => { owner = args.owner; return ''; }, collection: () => ({
    getList: async () => ({ items: [], page: 1, totalPages: 0, totalItems: 0 }),
  }) };
  await harness(pb).call('/data/:section', { driverAuth: { employeeId: 'driver-a' },
    params: { section: 'expenses' }, query: { employeeId: 'driver-b' } });
  assert.equal(owner, 'driver-a');
});
test('unknown sections fail explicitly', async () => {
  const r = await harness().call('/data/:section', { driverAuth: { employeeId: 'a' }, params: { section: 'payroll-admin' } });
  assert.equal(r.statusCode, 404);
});
test('invalid pagination returns 400', async () => {
  const r = await harness().call('/data/:section', { driverAuth: { employeeId: 'a' }, params: { section: 'expenses' }, query: { page: '-1' } });
  assert.equal(r.statusCode, 400);
});
test('download rejects a record without trusted storage identifiers', async () => {
  const pb = { baseURL: 'http://127.0.0.1:8090', collection: () => ({ getOne: async () => ({ employee_id: 'a', file: 'a.pdf' }) }),
    files: { getToken: async () => 'private-token', getURL: () => 'https://external.invalid/api/files/a' } };
  const r = await harness(pb).call('/data/:section/:id/files/:index', { driverAuth: { employeeId: 'a' },
    params: { section: 'my-documents', id: 'doc1', index: '0' } });
  assert.equal(r.statusCode, 503); assert.equal(r.body.code, 'FILE_UNAVAILABLE');
  assert.ok(!JSON.stringify(r.body).includes('private-token'));
});
