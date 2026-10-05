import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileDriverData, summarizePerformance } from '../src/services/mobileDriverData.js';
import { downloadMobileDocument, documentMime } from '../src/services/mobileDocumentDownload.js';

function fake({ expenseFields = [], tripFields = [{ name: 'driver_employee_code', type: 'text' }], tripCode = 'D001' } = {}) {
  const calls = [];
  const pb = {
    filter: (filter, args) => { calls.push({ filter, args }); return filter; },
    collections: { getOne: async name => name === 'employees' ? { id: 'empcol' } : { fields: name === 'expenses' ? expenseFields : tripFields } },
    collection: name => ({
      getOne: async () => name === 'employees' ? { id: 'employee1', assigned_truck: 'truck1' } :
        { id: 'truck1', manufacturer: 'Test Manufacturer', engine_number: 'ENG', owner_account_number: 'private' },
      getList: async () => ({ page: 1, totalPages: 1, totalItems: 1, items: name === 'expenses' ?
        [{ id: 'e1', submitted_by_employee_id: 'employee1', amount: 10 }] :
        [{ id: 't1', driver_employee_code: tripCode, trip_status: 'Delivered', kms: 100 }] }),
    }),
  };
  return { pb, calls, api: createMobileDriverData(pb) };
}
test('missing expense submitter schema is explicit and makes no expense query', async () => {
  const { api, calls } = fake();
  const r = await api.list('expenses', 'employee1');
  assert.equal(r.reason, 'SUBMITTER_LINK_NOT_CONFIGURED'); assert.deepEqual(r.items, []); assert.equal(calls.length, 0);
});
test('beneficiary employee_id is never treated as proof of submission', async () => {
  const { api } = fake({ expenseFields: [{ name: 'employee_id', type: 'text' }] });
  assert.equal((await api.list('expenses', 'employee1')).reason, 'SUBMITTER_LINK_NOT_CONFIGURED');
});
test('submitter query uses employee identity and date fallback for legacy schemas', async () => {
  const { api, calls } = fake({ expenseFields: [{ name: 'submitted_by_employee_id', type: 'text' }] });
  assert.equal((await api.list('expenses', 'employee1')).items.length, 1);
  assert.equal(calls[0].filter, 'submitted_by_employee_id = {:owner}');
  assert.equal(calls[0].args.owner, 'employee1');
});
test('trip access uses authenticated permanent code and never a driver name', async () => {
  const { api, calls } = fake(); const r = await api.list('trips', 'employee1', 1, 'D001');
  assert.equal(r.items[0].id, 't1'); assert.equal(calls[0].args.owner, 'D001');
  assert.equal(calls[0].filter, 'driver_employee_code = {:owner}');
});
test('another driver code in upstream results is rejected', async () => {
  await assert.rejects(fake({ tripCode: 'D002' }).api.list('trips', 'employee1', 1, 'D001'), { code: 'ACCESS_DENIED' });
});
test('legacy name-only schema cannot grant access', async () => {
  await assert.rejects(fake({ tripFields: [{name:'driver_name',type:'text'}] }).api.list('trips', 'employee1', 1, 'D001'), { code: 'ASSIGNMENT_MAPPING_REQUIRED' });
});
test('missing authenticated code cannot use a code-only assignment', async () => {
  await assert.rejects(fake().api.list('trips', 'employee1'), { code: 'ASSIGNMENT_MAPPING_REQUIRED' });
});
test('performance counts only completed distance and reports missing punctuality honestly', () => {
  const r = summarizePerformance([{ trip_status: 'Delivered', kms: 100 }, { trip_status: 'In Transit', kms: 900 },
    { trip_status: 'Completed', kms: -1 }], '2026-07-08');
  assert.equal(r.completedTrips, 2); assert.equal(r.completedKm, 100); assert.equal(r.onTimePercent, null);
});
test('performance punctuality excludes records without both timestamps', () => {
  const r = summarizePerformance([
    { trip_status: 'Delivered', delivery_eta: '2026-10-01T12:00:00Z', delivered_time: '2026-10-01T11:00:00Z' },
    { trip_status: 'Delivered', delivery_eta: '2026-10-01T12:00:00Z', delivered_time: '2026-10-01T13:00:00Z' },
    { trip_status: 'Delivered' },
  ], '2026-07-08');
  assert.equal(r.onTimeMeasuredTrips, 2); assert.equal(r.onTimePercent, 50);
});
test('performance is scoped to the authenticated driver code and recent period', async () => {
  const { api, calls } = fake(); const r = await api.performance('employee1', 'D001');
  assert.equal(r.completedTrips, 1); assert.equal(r.periodDays, 90);
  assert.ok(calls[0].filter.includes('date >= {:since}')); assert.equal(calls[0].args.owner, 'D001');
});
test('expanded truck details never include owner bank information', async () => {
  const truck = await fake().api.truck('employee1');
  assert.equal(truck.engine_number, 'ENG'); assert.equal(truck.manufacturer, 'Test Manufacturer');
  assert.equal(truck.owner_account_number, undefined);
});
test('download goes to Express storage recovery with no PocketBase file-token request', async () => {
  let address, options;
  const r = await downloadMobileDocument({ collectionId: 'doccol', id: 'doc1' }, 'a b.pdf', { port: '10000',
    fetcher: async (url, opts) => { address = url; options = opts; return new Response('%PDF-1.7 test', { headers: { 'Content-Type': 'application/octet-stream' } }); } });
  assert.equal(address, 'http://127.0.0.1:10000/api/files/doccol/doc1/a%20b.pdf');
  assert.equal(options.redirect, 'error'); assert.equal(options.headers, undefined); assert.equal(r.type, 'application/pdf');
});
test('download rejects path injection and invalid ports before fetching', async () => {
  const fetcher = async () => { throw Error('must not fetch'); };
  for (const [row, name, port] of [[{ collectionId: '../x', id: 'd' }, 'x.pdf', '10000'],
    [{ collectionId: 'c', id: 'd' }, '../x.pdf', '10000'], [{ collectionId: 'c', id: 'd' }, 'x.pdf', '99999']])
    await assert.rejects(downloadMobileDocument(row, name, { port, fetcher }), { code: 'FILE_UNAVAILABLE' });
});
test('HTML error fallback is not returned as a PDF', async () => {
  await assert.rejects(downloadMobileDocument({ collectionId: 'c', id: 'd' }, 'x.pdf', {
    fetcher: async () => new Response('<html>missing</html>', { headers: { 'Content-Type': 'application/pdf' } }),
  }), { code: 'FILE_TYPE_UNSUPPORTED' });
});
test('oversized downloads are rejected before buffering', async () => {
  await assert.rejects(downloadMobileDocument({ collectionId: 'c', id: 'd' }, 'x.pdf', {
    fetcher: async () => new Response('%PDF-', { headers: { 'Content-Length': String(21 * 1024 * 1024) } }),
  }), { code: 'FILE_TOO_LARGE' });
});
test('missing file has a specific unavailable error', async () => {
  await assert.rejects(downloadMobileDocument({ collectionId: 'c', id: 'd' }, 'x.pdf', {
    fetcher: async () => new Response('missing', { status: 404 }),
  }), { status: 404, code: 'FILE_UNAVAILABLE' });
});
test('image signature detection supports PNG, JPEG and WebP', () => {
  assert.equal(documentMime(Buffer.from([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(documentMime(Buffer.from([255,216,255,0])), 'image/jpeg');
  assert.equal(documentMime(Buffer.from('RIFFxxxxWEBP')), 'image/webp');
});
