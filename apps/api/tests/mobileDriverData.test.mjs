import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileDriverData, pageNumber, documentFiles, assertOwner } from '../src/services/mobileDriverData.js';

function fixture(overrides = {}) {
  const calls = [];
  const rows = { employees: { id: 'driver1', assigned_truck: 'truck1' }, trucks: { id: 'truck1', truck_number: 'TG-01' },
    employee_documents: { id: 'doc1', employee_id: 'driver1', file: 'license.pdf', salary: 999 } };
  const pb = { filter: (s, args) => { calls.push({ s, args }); return s; },
    collections: { getOne: async name => name === 'employees' ? { id: 'employees-col' } : { fields: [] } },
    collection: name => ({ getOne: async () => rows[name], getList: async () => ({
      page: 1, totalPages: 1, totalItems: 1, items: [rows[name]],
    }) }), ...overrides };
  return { api: createMobileDriverData(pb), calls, rows, pb };
}
test('pagination rejects injection and unbounded values', () => {
  for (const x of ['0', '-1', '1 OR 1', '1.1', '100000', []]) assert.throws(() => pageNumber(x));
  assert.equal(pageNumber(undefined), 1); assert.equal(pageNumber('2'), 2);
});
test('ownership is strict and never accepts another driver', () => {
  assert.throws(() => assertOwner({ employee_id: 'other' }, 'employee_id', 'driver1'));
  assert.throws(() => assertOwner({}, 'employee_id', ''));
});
test('list scopes by authenticated ID and excludes private unrelated fields', async () => {
  const { api, calls } = fixture(); const r = await api.list('my-documents', 'driver1');
  assert.deepEqual(calls[0].args, { owner: 'driver1' });
  assert.equal(r.items[0].salary, undefined); assert.equal(r.items[0].employee_id, undefined);
  assert.equal(r.items[0].files[0].path, 'data/my-documents/doc1/files/0');
});
test('upstream ownership mismatch fails closed', async () => {
  const { api, rows } = fixture(); rows.employee_documents.employee_id = 'other';
  await assert.rejects(api.list('my-documents', 'driver1'), { code: 'ACCESS_DENIED' });
});
test('document download checks owner independently', async () => {
  const { api, rows } = fixture(); rows.employee_documents.employee_id = 'other';
  await assert.rejects(api.file('my-documents', 'doc1', 0, 'driver1'), { code: 'ACCESS_DENIED' });
});
test('file list strips traversal and duplicates', () => {
  assert.deepEqual(documentFiles({ file: 'a.pdf', files: ['a.pdf', '../private', 'b.png', 'bad\\file'] }), ['a.pdf', 'b.png']);
});
test('legacy name-only trips are not granted to a driver', async () => {
  await assert.rejects(fixture().api.list('trips', 'driver1'), { code: 'ASSIGNMENT_MAPPING_REQUIRED' });
});
test('trip relation must point to employees, not a different table', async () => {
  const { pb } = fixture(); pb.collections.getOne = async name => name === 'employees' ? { id: 'employees-col' } :
    { fields: [{ name: 'driver_id', type: 'relation', collectionId: 'other-table', maxSelect: 1 }] };
  await assert.rejects(createMobileDriverData(pb).list('trips', 'driver1'), { code: 'ASSIGNMENT_MAPPING_REQUIRED' });
});
test('linked trip uses immutable employee relation', async () => {
  const { pb, rows, calls } = fixture(); pb.collections.getOne = async name => name === 'employees' ? { id: 'employees-col' } :
    { fields: [{ name: 'driver_employee_id', type: 'relation', collectionId: 'employees-col', maxSelect: 1 }] };
  rows.trip_logs = { id: 'trip1', driver_employee_id: 'driver1', revenue: 1000, route: 'A to B' };
  const r = await createMobileDriverData(pb).list('trips', 'driver1');
  assert.equal(r.items[0].revenue, undefined); assert.equal(calls[0].s, 'driver_employee_id = {:owner}');
});
test('missing assigned truck returns explicit empty result', async () => {
  const { api, rows } = fixture(); rows.employees.assigned_truck = '';
  assert.equal((await api.list('truck-documents', 'driver1')).reason, 'NO_TRUCK_ASSIGNED');
  assert.equal(await api.truck('driver1'), null);
});
test('truck access follows current assignment', async () => {
  const { api } = fixture(); assert.equal((await api.truck('driver1')).truck_number, 'TG-01');
});
test('unavailable storage is not reported as empty records', async () => {
  const { pb } = fixture(); pb.collection = () => ({ getList: async () => { throw Error('offline'); } });
  await assert.rejects(createMobileDriverData(pb).list('expenses', 'driver1'), /offline/);
});
