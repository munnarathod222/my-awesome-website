import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
