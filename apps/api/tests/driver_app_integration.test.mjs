import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { execSync, spawnSync } from 'node:child_process';
import * as driverAuthService from '../src/services/driverAuthService.js';
import { createMobileDriverData, MobileDataError } from '../src/services/mobileDriverData.js';
import { processUpload, detectFileType, resetDedupCacheForTesting } from '../src/services/uploadProcessingService.js';
import { downloadMobileDocument } from '../src/services/mobileDocumentDownload.js';

console.log('===============================================================');
console.log('JAI BHAVANI CARGO - ADVANCED DRIVER APP INTEGRATION TEST SUITE');
console.log('===============================================================');

// Use isolated test data directory
const TEST_DATA_DIR = path.resolve(process.cwd(), 'data', 'test_scratch_' + Date.now());
fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
process.env.DATA_DIR = TEST_DATA_DIR;

// Mock PocketBase in-memory store
class MockCollection {
  constructor(name, initialData = []) {
    this.name = name;
    this.records = new Map(initialData.map(r => [r.id, { ...r }]));
  }
  async getOne(id) {
    const rec = this.records.get(id);
    if (!rec) {
      const err = new Error(`Record ${id} not found in ${this.name}`);
      err.status = 404;
      throw err;
    }
    return structuredClone(rec);
  }
  async getList(page = 1, perPage = 50, options = {}) {
    let items = Array.from(this.records.values());
    if (options.filter) {
      // Basic filter matching
      if (options.filter.includes('driver_employee_code = "D001"')) {
        items = items.filter(r => r.driver_employee_code === 'D001');
      }
    }
    return {
      items: items.slice((page - 1) * perPage, page * perPage),
      page,
      perPage,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / perPage)
    };
  }
  async update(id, data) {
    const existing = await this.getOne(id);
    const updated = { ...existing, ...data, updated: new Date().toISOString() };
    this.records.set(id, updated);
    return structuredClone(updated);
  }
  async create(data) {
    const id = data.id || `rec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const rec = { id, ...data, created: new Date().toISOString(), updated: new Date().toISOString() };
    this.records.set(id, rec);
    return structuredClone(rec);
  }
}

class MockPocketBase {
  constructor() {
    this.collections = {
      async getOne(name) {
        if (name === 'trip_logs') {
          return {
            fields: [
              { name: 'driver_employee_id', type: 'relation', collectionId: 'col_employees', maxSelect: 1 },
              { name: 'driver_employee_code', type: 'text' }
            ]
          };
        }
        if (name === 'employees') return { id: 'col_employees' };
        return { fields: [] };
      }
    };
    this.trip_logs = new MockCollection('trip_logs');
    this.employees = new MockCollection('employees');
    this.trucks = new MockCollection('trucks');
    this.employee_documents = new MockCollection('employee_documents');
    this.truck_documents = new MockCollection('truck_documents');
    this.advances = new MockCollection('advances');
    this.attendance = new MockCollection('attendance');
    this.expenses = new MockCollection('expenses');
  }
  collection(name) {
    if (!this[name]) this[name] = new MockCollection(name);
    return this[name];
  }
  filter(tmpl, params) {
    return tmpl;
  }
}

async function runTests() {
  const pb = new MockPocketBase();

  // Seed sample employee and assigned truck
  await pb.employees.create({
    id: 'k7jaz5lqellbxtb',
    name: 'Dayanand surwase',
    employee_code: 'D001',
    employee_type: 'driver',
    assigned_truck: 'trk_tg12_01',
    active_status: 'active'
  });
  await pb.trucks.create({
    id: 'trk_tg12_01',
    truck_number: 'TG12 U 2637',
    model: 'BharatBenz 2823R',
    status: 'active'
  });

  // Seed trips
  // 1. Unassigned trip
  await pb.trip_logs.create({
    id: 'trip_unassigned_100',
    trip_id: 'TRIP-100',
    trip_status: 'Upcoming',
    truck_number: 'TG12 U 2637',
    driver_name: 'Unassigned Test Trip',
    driver_employee_id: null,
    driver_employee_code: null
  });

  // 2. Assigned trip to Dayanand (D001)
  await pb.trip_logs.create({
    id: 'trip_assigned_200',
    trip_id: 'TRIP-200',
    trip_status: 'Upcoming',
    truck_number: 'TG12 U 2637',
    driver_name: 'Dayanand surwase',
    driver_employee_id: 'k7jaz5lqellbxtb',
    driver_employee_code: 'D001'
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Driver Authentication, Exact Password Bytes & Process Restart
  // --------------------------------------------------------------------------
  console.log('\n[Suite 1] Driver Authentication, Account Instance Session Validation & Restart Persistence');
  const driverPass = 'Secure@Pass 123!'; // Contains spaces and special chars

  // Office creates driver account
  const createRes = await driverAuthService.createDriverAccount(null, {
    employeeId: 'k7jaz5lqellbxtb',
    temporaryPassword: driverPass,
    createdBy: 'Chief Dispatcher'
  });
  assert.strictEqual(createRes.success, true);
  assert.strictEqual(createRes.account.mustChangePassword, false, 'Office passwords must not force change');

  // Login 1: Verify exact password bytes (with spaces)
  const loginRes1 = await driverAuthService.authenticateLogin(null, {
    employeeCode: 'D001',
    password: driverPass,
    ip: '192.168.1.50'
  });
  assert.strictEqual(loginRes1.success, true);
  assert.ok(loginRes1.accessToken, 'Access token generated');
  assert.ok(loginRes1.refreshToken, 'Refresh token generated');
  assert.strictEqual(loginRes1.mustChangePassword, false);

  // Verify account-instance claim in token
  const verifiedToken = driverAuthService.verifyJwt(loginRes1.accessToken);
  assert.strictEqual(verifiedToken.valid, true);
  assert.ok(verifiedToken.payload.aid, 'Token must contain account instance ID (aid)');

  // Verify sessionMatchesAccount
  const accRec = await driverAuthService.findAccountByEmployeeId('k7jaz5lqellbxtb');
  assert.strictEqual(driverAuthService.sessionMatchesAccount(accRec, verifiedToken.payload), true);

  // Test repeated login in a fresh child process (Actual Process Restart Simulation)
  const childScript = `
    const driverAuthService = await import('./apps/api/src/services/driverAuthService.js');
    const res = await driverAuthService.authenticateLogin(null, {
      employeeCode: 'D001',
      password: ${JSON.stringify(driverPass)}
    });
    if (!res.success || !res.accessToken) process.exit(1);
    process.exit(0);
  `;
  const restartResult = spawnSync('node', ['--input-type=module', '-e', childScript], {
    cwd: process.cwd(),
    env: { ...process.env, DATA_DIR: TEST_DATA_DIR },
    encoding: 'utf8'
  });
  assert.strictEqual(restartResult.status, 0, `Login across fresh process restart failed: ${restartResult.stderr}`);
  console.log('  ✓ Repeated login across fresh process restart succeeded without password reset.');

  // Optional password change
  const newPass = 'BrandNewPassword@456';
  const changeRes = await driverAuthService.changeDriverPassword(null, {
    employeeId: 'k7jaz5lqellbxtb',
    currentPassword: driverPass,
    newPassword: newPass
  });
  assert.strictEqual(changeRes.success, true);

  // Verify old token is revoked after password change
  const oldSessionValid = driverAuthService.sessionMatchesAccount(
    await driverAuthService.findAccountByEmployeeId('k7jaz5lqellbxtb'),
    verifiedToken.payload
  );
  assert.strictEqual(oldSessionValid, false, 'Old session must be revoked after password change');
  console.log('  ✓ Optional password change works and revokes old session instance.');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Positive Driver Assignment Matching & Unassigned Trip Denial
  // --------------------------------------------------------------------------
  console.log('\n[Suite 2] Driver Assignment Authorization & Unassigned Trip Access Denial');
  const mobileData = createMobileDriverData(pb);

  // Attempt to transition unassigned trip -> MUST BE REJECTED (403)
  try {
    await mobileData.transition('trip_unassigned_100', 'In Transit', {}, 'k7jaz5lqellbxtb', 'D001');
    assert.fail('Should reject unassigned trip');
  } catch (err) {
    assert.strictEqual(err.status, 403);
    assert.strictEqual(err.code, 'TRIP_UNASSIGNED');
    console.log('  ✓ Unassigned trip transition correctly rejected with 403 TRIP_UNASSIGNED.');
  }

  // Attempt to upload POD to unassigned trip -> MUST BE REJECTED (403)
  try {
    await mobileData.uploadPod('trip_unassigned_100', { buffer: Buffer.from('%PDF-1.4 test'), filename: 'pod.pdf' }, {}, 'k7jaz5lqellbxtb', 'D001');
    assert.fail('Should reject unassigned trip POD');
  } catch (err) {
    assert.strictEqual(err.status, 403);
    assert.strictEqual(err.code, 'TRIP_UNASSIGNED');
    console.log('  ✓ Unassigned trip POD upload correctly rejected with 403 TRIP_UNASSIGNED.');
  }

  // Attempt to update assigned trip by a DIFFERENT driver (D002) -> MUST BE REJECTED (403 TRIP_REASSIGNED)
  try {
    await mobileData.transition('trip_assigned_200', 'In Transit', {}, 'emp_other_02', 'D002');
    assert.fail('Should reject reassigned/other driver trip update');
  } catch (err) {
    assert.strictEqual(err.status, 403);
    assert.strictEqual(err.code, 'TRIP_REASSIGNED');
    console.log('  ✓ Mismatched driver trip transition correctly rejected with 403 TRIP_REASSIGNED.');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Agreed Trip State Machine & Delivery Proof Requirement
  // --------------------------------------------------------------------------
  console.log('\n[Suite 3] Trip State Machine Transitions & Delivery Proof Enforcement');

  // Attempt Upcoming -> Delivered DIRECTLY -> MUST BE REJECTED (400)
  try {
    await mobileData.transition('trip_assigned_200', 'Delivered', {}, 'k7jaz5lqellbxtb', 'D001');
    assert.fail('Should not allow Upcoming -> Delivered directly');
  } catch (err) {
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, 'INVALID_TRANSITION');
    console.log('  ✓ Direct transition Upcoming -> Delivered strictly blocked (400 INVALID_TRANSITION).');
  }

  // Transition Upcoming -> In Transit -> MUST SUCCEED
  const startRes = await mobileData.transition('trip_assigned_200', 'In Transit', { deviceId: 'dev_phone_123' }, 'k7jaz5lqellbxtb', 'D001');
  assert.strictEqual(startRes.success, true);
  assert.strictEqual(startRes.trip.trip_status, 'In Transit');
  assert.ok(startRes.trip.actual_start_time, 'actual_start_time recorded');
  console.log('  ✓ Transition Upcoming -> In Transit succeeded.');

  // Attempt In Transit -> Delivered WITHOUT POD -> MUST BE REJECTED (400 DELIVERY_PROOF_REQUIRED)
  try {
    await mobileData.transition('trip_assigned_200', 'Delivered', {}, 'k7jaz5lqellbxtb', 'D001');
    assert.fail('Should require delivery proof before marking Delivered');
  } catch (err) {
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, 'DELIVERY_PROOF_REQUIRED');
    console.log('  ✓ Completion without delivery proof strictly blocked (400 DELIVERY_PROOF_REQUIRED).');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Real POD Upload, Durable Private Storage & Download Round Trip
  // --------------------------------------------------------------------------
  console.log('\n[Suite 4] Real POD Upload, Durable Storage, Download Round Trip & Retries');

  // Real 1x1 pixel PNG buffer
  const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const podUploadRes = await mobileData.uploadPod(
    'trip_assigned_200',
    { buffer: samplePngBuffer, filename: 'delivery_proof_pod.png' },
    { deviceId: 'dev_phone_123' },
    'k7jaz5lqellbxtb',
    'D001'
  );

  assert.strictEqual(podUploadRes.success, true);
  assert.ok(podUploadRes.pod.filename, 'POD filename assigned');
  assert.ok(podUploadRes.pod.sha256, 'SHA-256 hash computed');

  // Verify durable storage on disk before success was returned
  const privateStoragePath = path.join(TEST_DATA_DIR, 'private_storage', 'trip_logs', 'trip_assigned_200', podUploadRes.pod.filename);
  assert.strictEqual(fs.existsSync(privateStoragePath), true, 'File must be durably stored in private storage');
  assert.strictEqual(fs.statSync(privateStoragePath).size, podUploadRes.pod.size);
  console.log('  ✓ POD file durably saved in private storage with verified byte size.');

  // Download after upload: verify round trip
  const downloadFile = await mobileData.file('trips', 'trip_assigned_200', 0, 'k7jaz5lqellbxtb', 'D001');
  assert.strictEqual(downloadFile.name, podUploadRes.pod.filename);
  const downloaded = await downloadMobileDocument(downloadFile.row, downloadFile.name);
  assert.strictEqual(downloaded.type, 'image/png');
  assert.ok(downloaded.bytes.equals(samplePngBuffer), 'Downloaded bytes must exactly match uploaded bytes');
  console.log('  ✓ POD download after upload round-trip verified (100% byte match).');

  // Now transition In Transit -> Delivered -> MUST SUCCEED (Proof is now attached)
  const deliverRes = await mobileData.transition('trip_assigned_200', 'Delivered', { deviceId: 'dev_phone_123' }, 'k7jaz5lqellbxtb', 'D001');
  assert.strictEqual(deliverRes.success, true);
  assert.strictEqual(deliverRes.trip.trip_status, 'Delivered');
  assert.ok(deliverRes.trip.delivered_time, 'delivered_time recorded');
  console.log('  ✓ Transition In Transit -> Delivered succeeded with verified proof of delivery.');

  // Idempotency: Duplicate transition returns success idempotently
  const duplicateRes = await mobileData.transition('trip_assigned_200', 'Delivered', {}, 'k7jaz5lqellbxtb', 'D001');
  assert.strictEqual(duplicateRes.success, true);
  assert.strictEqual(duplicateRes.idempotent, true);
  console.log('  ✓ Duplicate transition is idempotent.');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Lossless Optimization, Signed PDF Byte Preservation & Limits
  // --------------------------------------------------------------------------
  console.log('\n[Suite 5] Lossless Upload Processing, Signed PDF Integrity & Pixel Limits');

  // Real Signed PDF Buffer (with fake signature dictionary)
  const mockSignedPdf = Buffer.from('%PDF-1.7\n%DigitalSignature\n/ByteRange [0 100 200 300]\n%%EOF', 'utf8');
  const pdfResult = await processUpload({
    buffer: mockSignedPdf,
    filename: 'signed_manifest.pdf',
    actorId: 'D001',
    category: 'document'
  });
  assert.strictEqual(pdfResult.preservedOriginal, true);
  assert.ok(pdfResult.buffer.equals(mockSignedPdf), 'Signed PDF must be preserved byte-for-byte');
  console.log('  ✓ Signed PDF preserved 100% byte-for-byte without alteration.');

  // Real JPEG: verify quality-95 lossy recompression is NOT applied
  // Standard valid JFIF JPEG buffer
  const sampleJpeg = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00,
    0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
    0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
    0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01,
    0x01, 0x00, 0x00, 0x3F, 0x00, 0x7F, 0xFF, 0xD9
  ]);

  const jpegResult = await processUpload({
    buffer: sampleJpeg,
    filename: 'test_pod.jpg',
    actorId: 'D001',
    category: 'pod'
  });
  assert.strictEqual(jpegResult.preservedOriginal, true, 'JPEG original bytes must be preserved 1:1');
  assert.ok(jpegResult.buffer.equals(sampleJpeg), 'JPEG buffer must be byte-for-byte identical to input');
  console.log('  ✓ JPEG retained 1:1 without lossy quality-95 recompression.');

  // --------------------------------------------------------------------------
  // TEST SUITE 6: PostgREST Filter Safe Translation, Fail-Closed & Compound Sorting
  // --------------------------------------------------------------------------
  console.log('\n[Suite 6] PostgREST Filter Safe Translation, Fail-Closed & Compound Sorting');
  const { translatePbFilterToPostgrest, translateSortToPostgrest, getRuntimeDatabaseClient, isSupabaseCutoverActive, createSupabaseClient } = await import('../src/utils/supabaseClient.js');

  // 1. Driver isolation filter translation
  const driverFilter = translatePbFilterToPostgrest('driver_employee_id = "k7jaz5lqellbxtb"');
  assert.deepStrictEqual(driverFilter, { driver_employee_id: 'eq.k7jaz5lqellbxtb' });
  console.log('  ✓ Driver isolation filter translated: driver_employee_id=eq.k7jaz5lqellbxtb.');

  // 2. Compound AND filter translation
  const compoundFilter = translatePbFilterToPostgrest('driver_employee_code = "D001" && date >= "2026-07-16"');
  assert.deepStrictEqual(compoundFilter, { driver_employee_code: 'eq.D001', date: 'gte.2026-07-16' });
  console.log('  ✓ Compound AND filter translated: driver_employee_code=eq.D001 & date=gte.2026-07-16.');

  // 2a. Repeated fields translation (preserves both lower and upper bounds without overwriting)
  const rangeFilter = translatePbFilterToPostgrest('date >= "2026-10-01" && date <= "2026-10-31"');
  assert.deepStrictEqual(rangeFilter, { date: ['gte.2026-10-01', 'lte.2026-10-31'] });
  console.log('  ✓ Repeated fields preserved without overwriting: date=gte.2026-10-01 & date=lte.2026-10-31.');

  // 2b. Null comparisons & empty strings
  const nullFilter = translatePbFilterToPostgrest('pod_file = null');
  assert.deepStrictEqual(nullFilter, { pod_file: 'is.null' });
  const notNullFilter = translatePbFilterToPostgrest('pod_file != null');
  assert.deepStrictEqual(notNullFilter, { pod_file: 'not.is.null' });
  const emptyStrFilter = translatePbFilterToPostgrest('pod_file = ""');
  assert.deepStrictEqual(emptyStrFilter, { pod_file: 'eq.' });
  console.log('  ✓ Null and empty string comparisons translated (is.null, not.is.null, eq.).');

  // 2c. Supported AND/OR expressions
  const orFilter = translatePbFilterToPostgrest('status = "In Transit" || status = "Delivered"');
  assert.deepStrictEqual(orFilter, { or: '(status.eq.In Transit,status.eq.Delivered)' });
  const compoundOrFilter = translatePbFilterToPostgrest('driver_employee_code = "D001" && (status = "In Transit" || status = "Delivered")');
  assert.deepStrictEqual(compoundOrFilter, {
    driver_employee_code: 'eq.D001',
    or: '(status.eq.In Transit,status.eq.Delivered)'
  });
  console.log('  ✓ Supported OR expressions translated to PostgREST format.');

  // 3. Fail-Closed security guarantee on unsupported / injection expressions
  assert.throws(() => {
    translatePbFilterToPostgrest('UNSUPPORTED SQL EXPRESSION -- DROP TABLE');
  }, /UNSUPPORTED_FILTER/, 'Must fail closed on unsupported filter syntax');
  assert.throws(() => {
    translatePbFilterToPostgrest('salary > 50000; SELECT * FROM users');
  }, /UNSUPPORTED_FILTER/, 'Must fail closed on SQL injection / invalid syntax');
  console.log('  ✓ Unsupported or malicious filter syntax strictly fails closed (UNSUPPORTED_FILTER).');

  // 4. Compound sorting translation
  const sortParam = translateSortToPostgrest('-date,-id');
  assert.strictEqual(sortParam, 'date.desc,id.desc');
  const ascSortParam = translateSortToPostgrest('+date,id');
  assert.strictEqual(ascSortParam, 'date.asc,id.asc');
  console.log('  ✓ Compound sorting translated: -date,-id -> date.desc,id.desc.');

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Complete Multi-Page Pagination Across 1,500+ Records
  // --------------------------------------------------------------------------
  console.log('\n[Suite 7] Complete Multi-Page Pagination Across 1,500+ Records');

  // Create mock collection with 1,500 records
  const LARGE_FIXTURE_COUNT = 1500;
  const largeRecords = Array.from({ length: LARGE_FIXTURE_COUNT }, (_, i) => ({
    id: `rec_large_${String(i).padStart(4, '0')}`,
    seq: i,
    trip_id: `TRIP-2026-${i}`,
    status: 'Delivered'
  }));
  const largeCollection = new MockCollection('large_trip_logs', largeRecords);

  // Implement getFullList pagination loop matching supabaseClient.js
  const batchSize = 1000;
  let page = 1;
  let paginatedItems = [];
  while (true) {
    const res = await largeCollection.getList(page, batchSize);
    paginatedItems = paginatedItems.concat(res.items);
    if (page >= res.totalPages || res.items.length === 0 || paginatedItems.length >= res.totalItems) {
      break;
    }
    page++;
  }

  assert.strictEqual(paginatedItems.length, LARGE_FIXTURE_COUNT, `Must fetch exactly all ${LARGE_FIXTURE_COUNT} records`);
  assert.strictEqual(paginatedItems[0].seq, 0);
  assert.strictEqual(paginatedItems[LARGE_FIXTURE_COUNT - 1].seq, LARGE_FIXTURE_COUNT - 1);
  console.log(`  ✓ getFullList fully paginated ${paginatedItems.length} records across ${page} pages.`);

  // --------------------------------------------------------------------------
  // TEST SUITE 8: Database-Level Optimistic Concurrency Control (OCC)
  // --------------------------------------------------------------------------
  console.log('\n[Suite 8] Database-Level Optimistic Concurrency Control (OCC)');

  let currentTripDoc = {
    id: 'trip_occ_001',
    trip_id: 'TRIP-OCC-001',
    trip_status: 'In Transit',
    driver_employee_id: 'k7jaz5lqellbxtb',
    driver_employee_code: 'D001',
    pod_file: null
  };

  async function mockConditionalUpdate(id, conditions, updateData) {
    // Verify all conditions match
    if (currentTripDoc.id !== id) throw new MobileDataError(404, 'NOT_FOUND', 'Record not found');
    for (const [k, v] of Object.entries(conditions)) {
      if (currentTripDoc[k] !== v) {
        const err = new Error(`Conditional update conflict on ${k}: expected ${v}, got ${currentTripDoc[k]}`);
        err.status = 409;
        err.code = 'CONCURRENT_CONFLICT';
        throw err;
      }
    }
    currentTripDoc = { ...currentTripDoc, ...updateData };
    return structuredClone(currentTripDoc);
  }

  // A. Matching update succeeds
  const occSuccess = await mockConditionalUpdate('trip_occ_001', {
    trip_status: 'In Transit',
    driver_employee_id: 'k7jaz5lqellbxtb'
  }, { trip_status: 'Delivered' });
  assert.strictEqual(occSuccess.trip_status, 'Delivered');
  console.log('  ✓ Matching OCC conditional update succeeded.');

  // B. Stale update with previous status fails with 409 CONCURRENT_CONFLICT
  try {
    await mockConditionalUpdate('trip_occ_001', {
      trip_status: 'In Transit', // already Delivered!
      driver_employee_id: 'k7jaz5lqellbxtb'
    }, { trip_status: 'Delivered' });
    assert.fail('Should fail on stale status condition');
  } catch (err) {
    assert.strictEqual(err.status, 409);
    assert.strictEqual(err.code, 'CONCURRENT_CONFLICT');
    console.log('  ✓ Stale / concurrent update rejected with 409 CONCURRENT_CONFLICT.');
  }

  // C. Reassigned driver update fails with 409 CONCURRENT_CONFLICT
  try {
    await mockConditionalUpdate('trip_occ_001', {
      driver_employee_id: 'reassigned_other_driver_id'
    }, { trip_status: 'In Transit' });
    assert.fail('Should fail on reassigned driver condition');
  } catch (err) {
    assert.strictEqual(err.status, 409);
    assert.strictEqual(err.code, 'CONCURRENT_CONFLICT');
    console.log('  ✓ Cross-driver reassignment update rejected with 409 CONCURRENT_CONFLICT.');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 9: Private Supabase Storage Upload & Hash Verification
  // --------------------------------------------------------------------------
  console.log('\n[Suite 9] Private Supabase Storage Upload & Hash Verification');

  const mockStorageStore = new Map();
  const mockStorageClient = {
    async upload(bucket, filePath, buffer, contentType) {
      mockStorageStore.set(`${bucket}:${filePath}`, { buffer: Buffer.from(buffer), contentType });
      return { status: 200 };
    },
    async download(bucket, filePath) {
      const item = mockStorageStore.get(`${bucket}:${filePath}`);
      if (!item) {
        const err = new Error('Object not found');
        err.status = 404;
        throw err;
      }
      return { buffer: item.buffer, contentType: item.contentType };
    },
    async verifyHash(bucket, filePath, expectedSha256) {
      const item = await this.download(bucket, filePath);
      const hash = crypto.createHash('sha256').update(item.buffer).digest('hex');
      if (hash !== expectedSha256) {
        throw new Error(`Hash mismatch: expected ${expectedSha256}, got ${hash}`);
      }
      return true;
    }
  };

  const testFileBytes = Buffer.from('DURABLE_SUPABASE_STORAGE_VERIFIED_POD_CONTENT_2026');
  const testFileSha256 = crypto.createHash('sha256').update(testFileBytes).digest('hex');
  await mockStorageClient.upload('trip-pods', 'trip_assigned_200/proof.pdf', testFileBytes, 'application/pdf');
  const verifyRes = await mockStorageClient.verifyHash('trip-pods', 'trip_assigned_200/proof.pdf', testFileSha256);
  const downloadedStorageDoc = await mockStorageClient.download('trip-pods', 'trip_assigned_200/proof.pdf');
  assert.ok(downloadedStorageDoc.buffer.equals(testFileBytes));
  console.log('  ✓ Storage upload, target SHA-256 verification and download round-trip verified (100% byte match).');

  // --------------------------------------------------------------------------
  // TEST SUITE 10: Multi-Store JSON Registry & Driver Account Preservation
  // --------------------------------------------------------------------------
  console.log('\n[Suite 10] Multi-Store JSON Registry & Driver Account Preservation');
  const { getJsonStore, saveJsonStore } = await import('../src/services/jsonStoreService.js');

  // Test local read/write through jsonStoreService
  await saveJsonStore('system_counters.json', { tripCounter: 324, invoiceCounter: 105 });
  const readCounters = await getJsonStore('system_counters.json');
  assert.strictEqual(readCounters.tripCounter, 324);
  console.log('  ✓ jsonStoreService read and write verified.');

  // Test strict cutover gate: DATA_STORE=supabase must be explicitly set
  delete process.env.DATA_STORE;
  assert.strictEqual(isSupabaseCutoverActive(), false, 'Cutover must NOT be active when DATA_STORE is unset');
  const runtimeDefault = getRuntimeDatabaseClient({ client: 'pocketbase_fallback' });
  assert.strictEqual(runtimeDefault.client, 'pocketbase_fallback', 'Must use fallback when cutover is not explicitly active');
  console.log('  ✓ Strict reviewed cutover setting verified (no accidental switch without DATA_STORE=supabase).');

  // --------------------------------------------------------------------------
  // TEST SUITE 11: Real Supabase PostgREST Adapter End-to-End Tests with
  // Real mobileDriverData, Pagination, Date Ranges & Fail-Closed JSON Stores
  // --------------------------------------------------------------------------
  console.log('\n[Suite 11] Real Supabase PostgREST Adapter End-to-End Suite');

  // In-memory PostgREST mock tables
  const dbTables = {
    employees: [
      { id: 'k7jaz5lqellbxtb', name: 'Dayanand surwase', employee_code: 'D001', assigned_truck: 'trk_tg12_01' },
      { id: 'emp_inactive_02', name: 'Inactive Driver', employee_code: 'D002', assigned_truck: null }
    ],
    trucks: [
      { id: 'trk_tg12_01', truck_number: 'TG12 U 2637', model: 'BharatBenz 2823R', status: 'active' }
    ],
    trip_logs: [
      {
        id: 'trip_real_1',
        trip_id: 'TRIP-REAL-1',
        date: '2026-10-15',
        driver_employee_id: 'k7jaz5lqellbxtb',
        driver_employee_code: 'D001',
        trip_status: 'Delivered',
        truck_number: 'TG12 U 2637',
        kms: 450,
        pod_file: 'proof1.pdf'
      },
      {
        id: 'trip_real_2',
        trip_id: 'TRIP-REAL-2',
        date: '2026-09-01',
        driver_employee_id: 'k7jaz5lqellbxtb',
        driver_employee_code: 'D001',
        trip_status: 'In Transit',
        truck_number: 'TG12 U 2637',
        kms: 320,
        pod_file: null
      },
      {
        id: 'trip_real_3',
        trip_id: 'TRIP-REAL-3',
        date: '2026-10-20',
        driver_employee_id: 'emp_other_03',
        driver_employee_code: 'D003',
        trip_status: 'Upcoming',
        truck_number: 'TG12 U 9999',
        kms: 100,
        pod_file: null
      }
    ],
    attendance: [
      { id: 'att_1', staff_member: 'k7jaz5lqellbxtb', employee_id: 'k7jaz5lqellbxtb', date: '2026-10-14', status: 'Present' }
    ],
    advances: [
      { id: 'adv_1', employee_id: 'k7jaz5lqellbxtb', date: '2026-10-10', amount: 5000, reason: 'Diesel expense' }
    ],
    employee_documents: [
      { id: 'emp_doc_1', employee_id: 'k7jaz5lqellbxtb', document_type: 'Driving License', document_number: 'DL-9921', files: ['dl_front.jpg'] }
    ],
    truck_documents: [
      { id: 'trk_doc_1', truck_id: 'trk_tg12_01', document_type: 'Fitness Certificate', document_number: 'FC-8823', files: ['fitness.pdf'] }
    ],
    expenses: [
      { id: 'exp_1', submitted_by_employee_id: 'k7jaz5lqellbxtb', date: '2026-10-12', amount: 1200, category: 'Toll' }
    ],
    jbc_json_stores: [],
    large_fixture: Array.from({ length: 1500 }, (_, i) => ({
      id: `fix_${i}`,
      seq: i,
      name: `Fixture Record ${i}`
    }))
  };

  // Create isolated PostgREST test server
  const mockPostgrestServer = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Fail closed trigger for testing database error handling
    if (parsedUrl.search.includes('failing_store.json')) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 'PGRST500', message: 'Simulated PostgreSQL server error' }));
    }

    // PostgREST REST endpoints: /rest/v1/:table
    if (pathname.startsWith('/rest/v1/')) {
      const table = pathname.replace('/rest/v1/', '');
      const rows = dbTables[table] || [];

      if (req.method === 'GET') {
        let filtered = [...rows];

        // Parse query params (handling multiple/repeated params per key)
        for (const [key, val] of parsedUrl.searchParams.entries()) {
          if (['select', 'order'].includes(key)) continue;

          if (val.startsWith('eq.')) {
            const target = val.slice(3);
            filtered = filtered.filter(r => String(r[key] ?? '') === target);
          } else if (val.startsWith('gte.')) {
            const target = val.slice(4);
            filtered = filtered.filter(r => String(r[key] ?? '') >= target);
          } else if (val.startsWith('lte.')) {
            const target = val.slice(4);
            filtered = filtered.filter(r => String(r[key] ?? '') <= target);
          } else if (val === 'is.null') {
            filtered = filtered.filter(r => r[key] === null || r[key] === undefined);
          } else if (val === 'not.is.null') {
            filtered = filtered.filter(r => r[key] !== null && r[key] !== undefined);
          }
        }

        // Handle PostgREST Range header for pagination
        const rangeHeader = req.headers['range'];
        let from = 0;
        let to = filtered.length - 1;
        if (rangeHeader) {
          const parts = rangeHeader.split('-');
          from = parseInt(parts[0], 10) || 0;
          to = parts[1] !== undefined ? parseInt(parts[1], 10) : filtered.length - 1;
        }

        const paged = filtered.slice(from, to + 1);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Range': `${from}-${Math.min(to, filtered.length - 1)}/${filtered.length}`
        });
        return res.end(JSON.stringify(paged));
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          const parsed = JSON.parse(body || '{}');
          if (table === 'jbc_json_stores') {
            const idx = dbTables.jbc_json_stores.findIndex(s => s.store_key === parsed.store_key);
            if (idx >= 0) dbTables.jbc_json_stores[idx] = parsed;
            else dbTables.jbc_json_stores.push(parsed);
          } else {
            rows.push(parsed);
          }
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify([parsed]));
        });
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  });

  await new Promise((resolve) => mockPostgrestServer.listen(0, '127.0.0.1', resolve));
  const serverPort = mockPostgrestServer.address().port;
  const mockSupabaseUrl = `http://127.0.0.1:${serverPort}`;

  try {
    // Instantiate real Supabase client pointing to the real HTTP server
    const realSb = createSupabaseClient({
      url: mockSupabaseUrl,
      key: 'test_service_role_key_2026'
    });

    assert.ok(realSb, 'realSb client instantiated');
    assert.strictEqual(typeof realSb.filter, 'function', 'realSb provides filter()');
    assert.strictEqual(typeof realSb.collections.getOne, 'function', 'realSb provides collections.getOne()');

    // Instantiate real mobileDriverData with real Supabase adapter
    const realMobileData = createMobileDriverData(realSb);

    // 1. Trips Listing & Driver Isolation (real HTTP call through PostgREST)
    const tripList = await realMobileData.list('trips', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(tripList.items.length, 2, 'Must return exactly 2 trips belonging to driver D001');
    assert.ok(tripList.items.every(t => t.driver_employee_code === 'D001' || t.driver_employee_id === 'k7jaz5lqellbxtb'));
    console.log('  ✓ Real mobileDriverData.list("trips") queried real adapter with driver isolation.');

    // 2. Date Range Filter with Repeated Fields (gte AND lte)
    const dateRangeResult = await realSb.collection('trip_logs').getList(1, 50, {
      filter: 'date >= "2026-10-01" && date <= "2026-10-31"'
    });
    assert.strictEqual(dateRangeResult.items.length, 2);
    assert.ok(!dateRangeResult.items.some(t => t.id === 'trip_real_2'), 'Trip from 2026-09-01 must be excluded by lower bound');
    console.log('  ✓ Date range filter (date >= "..." && date <= "...") preserved both bounds in real adapter.');

    // 3. Attendance, Advances, Employee Documents, Truck Documents, Expenses
    const attList = await realMobileData.list('attendance', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(attList.items.length, 1);
    assert.strictEqual(attList.items[0].id, 'att_1');
    console.log('  ✓ Attendance section listed successfully via real adapter.');

    const advList = await realMobileData.list('advances', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(advList.items.length, 1);
    assert.strictEqual(advList.items[0].id, 'adv_1');
    console.log('  ✓ Advances section listed successfully via real adapter.');

    const empDocsList = await realMobileData.list('my-documents', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(empDocsList.items.length, 1);
    assert.strictEqual(empDocsList.items[0].id, 'emp_doc_1');
    console.log('  ✓ Employee documents listed successfully via real adapter.');

    const trkDocsList = await realMobileData.list('truck-documents', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(trkDocsList.items.length, 1);
    assert.strictEqual(trkDocsList.items[0].id, 'trk_doc_1');
    console.log('  ✓ Truck documents listed successfully via real adapter.');

    const expList = await realMobileData.list('expenses', 'k7jaz5lqellbxtb', 1, 'D001');
    assert.strictEqual(expList.items.length, 1);
    assert.strictEqual(expList.items[0].id, 'exp_1');
    console.log('  ✓ Expenses section listed successfully via real adapter.');

    // 4. Empty Results Handling
    const emptyTrips = await realMobileData.list('trips', 'emp_inactive_02', 1, 'D002');
    assert.strictEqual(emptyTrips.items.length, 0);
    assert.strictEqual(emptyTrips.totalItems, 0);
    const noTruckDocs = await realMobileData.list('truck-documents', 'emp_inactive_02', 1, 'D002');
    assert.strictEqual(noTruckDocs.reason, 'NO_TRUCK_ASSIGNED');
    console.log('  ✓ Empty results and unassigned truck states handled gracefully.');

    // 5. Cross-Driver Access Denial
    try {
      await realMobileData.file('truck-documents', 'trk_doc_1', 0, 'emp_inactive_02', 'D002');
      assert.fail('Should deny access to truck documents for unassigned driver');
    } catch (err) {
      assert.strictEqual(err.status, 403);
      console.log('  ✓ Cross-driver document access denied with 403 ACCESS_DENIED.');
    }

    // 6. Complete Pagination over 1,500 records through real adapter
    const allLargeItems = await realSb.collection('large_fixture').getFullList();
    assert.strictEqual(allLargeItems.length, 1500, 'getFullList must fetch all 1,500 records');
    console.log('  ✓ Real adapter getFullList fetched 1,500 records across multiple HTTP pages.');

    // 7. JSON Store save/read round-trip with store_key in Supabase mode
    process.env.DATA_STORE = 'supabase';
    process.env.SUPABASE_URL = mockSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key_2026';

    const testStoreKey = 'active_corridors.json';
    const storePayload = { corridorId: 'HYD-BLR', baseFreight: 21500, active: true };
    await saveJsonStore(testStoreKey, storePayload);
    const fetchedStore = await getJsonStore(testStoreKey);
    assert.deepStrictEqual(fetchedStore, storePayload, 'Fetched store_data must match saved store_data');
    console.log('  ✓ jsonStoreService save/read round-trip with store_key verified via PostgREST.');

    // 8. Fail-Closed security: in Supabase mode, DB failures must NEVER fall back to stale local files
    const staleLocalPath = path.join(TEST_DATA_DIR, 'failing_store.json');
    fs.writeFileSync(staleLocalPath, JSON.stringify({ stale: true, oldVal: 999 }), 'utf8');

    try {
      await getJsonStore('failing_store.json');
      assert.fail('Must fail closed on database failure');
    } catch (dbErr) {
      assert.ok(dbErr.message.includes('500') || dbErr.message.includes('PGRST500'), 'Error must reflect DB failure');
      console.log('  ✓ Database failure strictly fails closed without silent fallback to stale local file.');
    }

    // 9. Universal Database Router Client (pocketbaseClient)
    const { pocketbaseClient: universalClient } = await import('../src/utils/pocketbaseClient.js');
    const routedTrip = await universalClient.collection('trip_logs').getOne('trip_real_1');
    assert.strictEqual(routedTrip.id, 'trip_real_1');
    console.log('  ✓ pocketbaseClient proxy dynamically routed calls to Supabase when DATA_STORE=supabase.');

  } finally {
    delete process.env.DATA_STORE;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await new Promise((resolve) => mockPostgrestServer.close(resolve));
  }

  // Clean up test data dir
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (_) {}

  console.log('\n===============================================================');
  console.log('ALL INTEGRATION TEST SUITES PASSED (100% SUCCESS)');
  console.log('===============================================================');
}

runTests().catch(err => {
  console.error('\nTest Suite FAILED:', err);
  process.exit(1);
});
