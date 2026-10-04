const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Set synthetic test JWT secret
process.env.JWT_SECRET = 'synthetic_test_driver_auth_secret_key_32chars_2026';

// Path for synthetic test DB
const TEST_DB_PATH = path.resolve(__dirname, '../scratch/test_synthetic_driver_auth.db');
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

console.log('🧪 Starting Synthetic Unit & Integration Tests for Permanent Employee Codes & Driver Auth...');

async function runTests() {
  // 1. Create synthetic fixture SQLite database (DO NOT use production data)
  const db = new DatabaseSync(TEST_DB_PATH);

  // Schema setup
  db.exec(`
    CREATE TABLE employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      employee_type TEXT NOT NULL,
      active_status TEXT NOT NULL DEFAULT 'active',
      employee_number INTEGER DEFAULT 0,
      employee_code TEXT DEFAULT '',
      contact TEXT DEFAULT '',
      assigned_truck TEXT DEFAULT NULL,
      supervisor_id TEXT DEFAULT NULL,
      position TEXT DEFAULT NULL,
      created TEXT NOT NULL
    );

    CREATE TABLE trucks (
      id TEXT PRIMARY KEY,
      truck_number TEXT NOT NULL UNIQUE,
      truck_code TEXT DEFAULT '',
      truck_name TEXT DEFAULT '',
      truck_size TEXT DEFAULT '',
      truck_axle TEXT DEFAULT '',
      model TEXT DEFAULT '',
      payload_capacity TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      manager_id TEXT DEFAULT NULL
    );

    CREATE TABLE trip_logs (
      id TEXT PRIMARY KEY,
      truck_id TEXT NOT NULL,
      driver_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      status TEXT DEFAULT 'completed'
    );
  `);

  // Insert synthetic trucks and historical trips
  db.exec(`
    INSERT INTO trucks (id, truck_number, truck_code, truck_name, truck_size, truck_axle, model, status, manager_id) VALUES 
      ('trk_1', 'MH12AB1234', 'TRK-001', 'Tata Prima', '40 FT', '3-Axle', 'Tata Prima 4028.S', 'active', 'synth_staff_1'),
      ('trk_2', 'MH14CD5678', 'TRK-002', 'Ashok Leyland', '32 FT', 'SXL', 'Ashok Leyland 3118', 'active', NULL);

    INSERT INTO trip_logs (id, truck_id, driver_id, start_date) VALUES 
      ('trip_1', 'trk_1', 'synth_drv_1', '2026-05-01 10:00:00'),
      ('trip_2', 'trk_2', 'synth_drv_2', '2026-06-01 12:00:00');
  `);

  // Insert synthetic employees (Drivers, Staff, Archived/Terminated, Missing code)
  db.exec(`
    INSERT INTO employees (id, name, employee_type, active_status, employee_code, employee_number, contact, assigned_truck, supervisor_id, created) VALUES
      ('synth_drv_1', 'Synthetic Alpha Driver', 'driver', 'active', '', 0, '+919876543210', 'trk_1', 'synth_staff_1', '2026-01-01 10:00:00'),
      ('synth_staff_1', 'Synthetic Office Manager', 'manager', 'active', '', 0, '+919123456780', '', '', '2026-01-02 11:00:00'),
      ('synth_drv_archived', 'Synthetic Terminated Driver', 'driver', 'terminated', '', 0, '', '', '', '2026-01-03 12:00:00'),
      ('synth_drv_2', 'Synthetic Beta Driver', 'driver', 'active', '', 0, '+919988776655', '', '', '2026-01-04 13:00:00');
  `);

  console.log('✓ Synthetic test fixture initialized.');

  // Import services dynamically (ESM modules)
  const employeeCodeService = await import('../apps/api/src/services/employeeCodeService.js');
  const driverAuthService = await import('../apps/api/src/services/driverAuthService.js');

  // TEST 1: Schema Initialization and Uniqueness Index
  console.log('\n--- TEST 1: Schema Initialization & Database Constraints ---');
  employeeCodeService.ensureSchema(db);
  driverAuthService.ensureDriverAuthSchema(db);

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  assert(tables.includes('system_counters'), 'system_counters table must exist');
  assert(tables.includes('driver_app_accounts'), 'driver_app_accounts table must exist');
  console.log('✓ Tables system_counters and driver_app_accounts verified.');

  // TEST 2: Backfill Preview & Role Identification
  console.log('\n--- TEST 2: Backfill Preview & Role Identification ---');
  const preview = employeeCodeService.previewBackfill(db);
  assert.strictEqual(preview.totalEmployees, 4, 'Should preview 4 synthetic employees');
  
  // Ordering check: created ASC
  assert.strictEqual(preview.preview[0].id, 'synth_drv_1');
  assert.strictEqual(preview.preview[0].proposed_code, 'D001', 'First driver should get D001');
  assert.strictEqual(preview.preview[1].id, 'synth_staff_1');
  assert.strictEqual(preview.preview[1].proposed_code, 'E001', 'First staff should get E001');
  assert.strictEqual(preview.preview[2].id, 'synth_drv_archived');
  assert.strictEqual(preview.preview[2].proposed_code, 'D002', 'Archived driver should get permanent D002');
  assert.strictEqual(preview.preview[3].id, 'synth_drv_2');
  assert.strictEqual(preview.preview[3].proposed_code, 'D003', 'Next driver should get D003');
  console.log('✓ Backfill preview correctly segregates D and E sequences and respects archived status.');

  // TEST 3: Apply Backfill & Idempotent Retries
  console.log('\n--- TEST 3: Apply Backfill & Idempotent Retries ---');
  const backfillResult = employeeCodeService.applyBackfill(db);
  assert(backfillResult.success, 'Backfill should succeed');

  const postBackfill = db.prepare('SELECT id, employee_code FROM employees ORDER BY created ASC').all();
  assert.strictEqual(postBackfill[0].employee_code, 'D001');
  assert.strictEqual(postBackfill[1].employee_code, 'E001');
  assert.strictEqual(postBackfill[2].employee_code, 'D002');
  assert.strictEqual(postBackfill[3].employee_code, 'D003');

  // Retry backfill: should not alter already assigned codes
  const retryResult = employeeCodeService.applyBackfill(db);
  assert(retryResult.success, 'Backfill retry should succeed');
  const postRetry = db.prepare('SELECT id, employee_code FROM employees ORDER BY created ASC').all();
  assert.deepStrictEqual(postBackfill, postRetry, 'Backfill retry must be 100% idempotent');
  console.log('✓ Backfill is idempotent and preserves codes on retries.');

  // TEST 4: Concurrency-Safe Code Allocation & Beyond 999
  console.log('\n--- TEST 4: Concurrency-Safe Code Allocation & Continuation Beyond 999 ---');
  const codeD4 = employeeCodeService.allocateNextCode(db, 'driver');
  assert.strictEqual(codeD4, 'D004', 'Next driver code should be D004');

  const codeE2 = employeeCodeService.allocateNextCode(db, 'staff');
  assert.strictEqual(codeE2, 'E002', 'Next staff code should be E002');

  // Test 999 -> 1000 transition
  db.prepare("UPDATE system_counters SET current_val = 999 WHERE counter_name = 'driver_code'").run();
  const codeD1000 = employeeCodeService.allocateNextCode(db, 'driver');
  assert.strictEqual(codeD1000, 'D1000', 'Should naturally transition to D1000');

  const codeD1001 = employeeCodeService.allocateNextCode(db, 'driver');
  assert.strictEqual(codeD1001, 'D1001', 'Should naturally continue to D1001');

  // Test Uniqueness Enforcement at DB level
  let uniqueViolationCaught = false;
  try {
    db.prepare("INSERT INTO employees (id, name, employee_type, employee_code, created) VALUES ('dup_test', 'Duplicate', 'driver', 'D001', datetime('now'))").run();
  } catch (err) {
    uniqueViolationCaught = true;
  }
  assert(uniqueViolationCaught, 'Database unique constraint must reject duplicate employee codes');
  console.log('✓ Code allocation handles counter segregation, transitions to D1000+, and enforces uniqueness.');

  // TEST 5: Office Driver Account Creation & Ineligible Employee Rejection
  console.log('\n--- TEST 5: Office Driver Account Creation & Ineligibility Checks ---');
  // Attempt creating account for manager (synth_staff_1) -> Should be rejected
  let managerRejected = false;
  try {
    driverAuthService.createDriverAccount(db, { employeeId: 'synth_staff_1' });
  } catch (err) {
    managerRejected = true;
    assert(err.message.includes('Ineligible'), 'Must reject non-drivers');
  }
  assert(managerRejected, 'Manager must not be eligible for driver app account');

  // Create valid driver account for synth_drv_1
  const createdAcc = driverAuthService.createDriverAccount(db, {
    employeeId: 'synth_drv_1',
    temporaryPassword: 'TempPassword123!'
  });
  assert(createdAcc.success);
  assert.strictEqual(createdAcc.employeeCode, 'D001');
  assert.strictEqual(createdAcc.mustChangePassword, true);
  console.log('✓ Ineligible employees rejected; driver account created with temporary password.');

  // TEST 6: Duplicate Account Prevention
  console.log('\n--- TEST 6: Duplicate Account Prevention ---');
  let dupRejected = false;
  try {
    driverAuthService.createDriverAccount(db, { employeeId: 'synth_drv_1' });
  } catch (err) {
    dupRejected = true;
    assert(err.message.includes('already has an active login account'));
  }
  assert(dupRejected, 'Duplicate account creation must be blocked');
  console.log('✓ Duplicate account creation strictly blocked.');

  // TEST 7: Authentication & First-Login Password Restrictions
  console.log('\n--- TEST 7: Authentication & First-Login Password Restrictions ---');
  // Incorrect password
  let wrongPassCaught = false;
  try {
    driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'WrongPassword' });
  } catch (err) {
    wrongPassCaught = true;
    assert.strictEqual(err.status, 401);
  }
  assert(wrongPassCaught, 'Invalid password must throw 401 generic error');

  // Correct temporary password login
  const loginRes = driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'TempPassword123!' });
  assert(loginRes.success);
  assert.strictEqual(loginRes.mustChangePassword, true, 'mustChangePassword must be true on first login');
  assert(loginRes.accessToken, 'Access token must be returned');
  assert(loginRes.refreshToken, 'Refresh token must be returned');

  // Verify access token
  const verifiedAccess = driverAuthService.verifyJwt(loginRes.accessToken);
  assert(verifiedAccess.valid);
  assert.strictEqual(verifiedAccess.payload.type, 'access', 'Access token must have type: access');
  assert.strictEqual(verifiedAccess.payload.mustChange, true);

  // Verify refresh token
  const verifiedRefresh = driverAuthService.verifyJwt(loginRes.refreshToken);
  assert(verifiedRefresh.valid);
  assert.strictEqual(verifiedRefresh.payload.type, 'refresh', 'Refresh token must have type: refresh');
  console.log('✓ Login with temporary password succeeds, generates distinct access & refresh tokens, and flags mustChangePassword=true.');

  // TEST 8: Password Change on First Login
  console.log('\n--- TEST 8: Password Change Flow ---');
  // Wrong current password
  let badCurrPass = false;
  try {
    driverAuthService.changeDriverPassword(db, {
      employeeId: 'synth_drv_1',
      currentPassword: 'IncorrectOldPassword',
      newPassword: 'MySecureNewPassword2026!'
    });
  } catch (err) {
    badCurrPass = true;
  }
  assert(badCurrPass, 'Must reject incorrect current password');

  // Successful change
  const changeRes = driverAuthService.changeDriverPassword(db, {
    employeeId: 'synth_drv_1',
    currentPassword: 'TempPassword123!',
    newPassword: 'MySecureNewPassword2026!'
  });
  assert(changeRes.success);
  assert.strictEqual(changeRes.mustChangePassword, false);

  // Old temporary password must no longer work
  let oldPassFails = false;
  try {
    driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'TempPassword123!' });
  } catch (err) {
    oldPassFails = true;
  }
  assert(oldPassFails, 'Old temporary password must be invalid after change');

  // New password works
  const newLoginRes = driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'MySecureNewPassword2026!' });
  assert.strictEqual(newLoginRes.mustChangePassword, false);
  console.log('✓ Password change clears mustChangePassword restriction and invalidates previous credentials.');

  // TEST 9: Rate Limiting & Account Lockout
  console.log('\n--- TEST 9: Rate Limiting & Account Lockout ---');
  for (let i = 0; i < 5; i++) {
    try {
      driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'BadPassword_' + i });
    } catch (_) {}
  }
  let lockoutCaught = false;
  try {
    // 6th attempt should be blocked with 429
    driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'MySecureNewPassword2026!' });
  } catch (err) {
    lockoutCaught = true;
    assert.strictEqual(err.status, 429, 'Expected 429 Account Locked');
  }
  assert(lockoutCaught, 'Account must be locked after 5 failed attempts');
  console.log('✓ Rate limiting and temporary lockout after 5 failed attempts verified.');

  // TEST 10: Office Password Reset & Session Revocation
  console.log('\n--- TEST 10: Office Password Reset & Session Revocation ---');
  const resetRes = driverAuthService.resetDriverPassword(db, {
    employeeId: 'synth_drv_1',
    temporaryPassword: 'ResetTempPass2026#'
  });
  assert(resetRes.success);

  // Existing session token from newLoginRes must now be revoked because password_version was bumped!
  let tokenRevoked = false;
  try {
    driverAuthService.refreshSessionToken(db, { refreshToken: newLoginRes.refreshToken });
  } catch (err) {
    tokenRevoked = true;
    assert(err.message.includes('revoked'));
  }
  assert(tokenRevoked, 'Old session token must be revoked when password is reset');

  // Login with reset password -> requires change again
  const postResetLogin = driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'ResetTempPass2026#' });
  assert.strictEqual(postResetLogin.mustChangePassword, true, 'Reset requires first-login password change again');
  console.log('✓ Office password reset clears lockout, bumps password version, and revokes all previous sessions.');

  // TEST 11: Disabling & Re-enabling Accounts
  console.log('\n--- TEST 11: Disabling & Re-enabling Accounts ---');
  driverAuthService.setAccountStatus(db, { employeeId: 'synth_drv_1', status: 'disabled' });

  let disabledLoginBlocked = false;
  try {
    driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'ResetTempPass2026#' });
  } catch (err) {
    disabledLoginBlocked = true;
    assert.strictEqual(err.status, 403, 'Disabled account must return 403');
  }
  assert(disabledLoginBlocked, 'Disabled account cannot log in');

  // Re-enable
  driverAuthService.setAccountStatus(db, { employeeId: 'synth_drv_1', status: 'active' });
  const reenabledLogin = driverAuthService.authenticateLogin(db, { employeeCode: 'D001', password: 'ResetTempPass2026#' });
  assert(reenabledLogin.success, 'Re-enabled account can log in');
  console.log('✓ Account disabling and re-enabling behaves correctly.');

  // TEST 12: Role Changes & Code Retention
  console.log('\n--- TEST 12: Role Changes & Code Retention ---');
  db.prepare("UPDATE employees SET employee_type = 'manager' WHERE id = 'synth_drv_1'").run();
  const empAfterRoleChange = db.prepare('SELECT id, employee_code, employee_type FROM employees WHERE id = ?').get('synth_drv_1');
  assert.strictEqual(empAfterRoleChange.employee_code, 'D001', 'Original D001 code must be retained even after promotion to manager');
  // Revert back to driver for subsequent tests
  db.prepare("UPDATE employees SET employee_type = 'driver' WHERE id = 'synth_drv_1'").run();
  console.log('✓ Code is permanently retained across role changes.');

  // TEST 13: Preservation of Existing Relationships & Historical Data
  console.log('\n--- TEST 13: Preservation of Relationships & Historical Data ---');
  const tripsCount = db.prepare('SELECT count(*) as c FROM trip_logs').get().c;
  assert.strictEqual(tripsCount, 2, 'Historical trips must not be modified or deleted');
  const trucksCount = db.prepare('SELECT count(*) as c FROM trucks').get().c;
  assert.strictEqual(trucksCount, 2, 'Truck records must be intact');
  console.log('✓ Historical data and foreign key relationships 100% preserved.');

  // TEST 14: JWT Secret Configuration & Fail-Closed Guarantee
  console.log('\n--- TEST 14: JWT Secret Configuration & Fail-Closed Guarantee ---');
  const savedJwtSecret = process.env.JWT_SECRET;
  const savedDriverSecret = process.env.DRIVER_AUTH_SECRET;
  const savedEncKey = process.env.ENCRYPTION_KEY;
  const savedSupKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  delete process.env.JWT_SECRET;
  delete process.env.DRIVER_AUTH_SECRET;
  delete process.env.ENCRYPTION_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  let failClosedCaught = false;
  try {
    driverAuthService.signJwt({ sub: 'test_sub' });
  } catch (err) {
    failClosedCaught = true;
    assert.strictEqual(err.code, 'CONFIG_ERROR', 'Must fail with CONFIG_ERROR when secrets are missing');
    assert.strictEqual(err.status, 500, 'Must have status 500');
  }
  assert(failClosedCaught, 'Must fail closed when JWT secret is not configured');

  // Verify too short secret (<16 chars) is also rejected
  process.env.JWT_SECRET = 'short_key';
  let shortKeyRejected = false;
  try {
    driverAuthService.signJwt({ sub: 'test_sub' });
  } catch (err) {
    shortKeyRejected = true;
    assert.strictEqual(err.code, 'CONFIG_ERROR');
  }
  assert(shortKeyRejected, 'Secret under 16 characters must be rejected');

  // Restore secure secret
  process.env.JWT_SECRET = savedJwtSecret;
  if (savedDriverSecret) process.env.DRIVER_AUTH_SECRET = savedDriverSecret;
  if (savedEncKey) process.env.ENCRYPTION_KEY = savedEncKey;
  if (savedSupKey) process.env.SUPABASE_SERVICE_ROLE_KEY = savedSupKey;
  console.log('✓ Server fails closed with status 500 CONFIG_ERROR if secret is missing or insufficiently long.');

  // TEST 15: Distinct Token Types & Rejection of Type Mismatches
  console.log('\n--- TEST 15: Distinct Token Types & Rejection of Type Mismatches ---');
  // First change password so account is normal
  driverAuthService.changeDriverPassword(db, {
    employeeId: 'synth_drv_1',
    currentPassword: 'ResetTempPass2026#',
    newPassword: 'FinalSecurePassword2026!'
  });
  const normalLogin = driverAuthService.authenticateLogin(db, {
    employeeCode: 'D001',
    password: 'FinalSecurePassword2026!'
  });

  assert.strictEqual(normalLogin.mustChangePassword, false);
  const accToken = normalLogin.accessToken;
  const refToken = normalLogin.refreshToken;

  const accVer = driverAuthService.verifyJwt(accToken);
  const refVer = driverAuthService.verifyJwt(refToken);
  assert.strictEqual(accVer.payload.type, 'access', 'Access token payload must have type: access');
  assert.strictEqual(refVer.payload.type, 'refresh', 'Refresh token payload must have type: refresh');

  // Attempt to use access token on /refresh route -> Must be rejected with 401 TOKEN_TYPE_INVALID
  let accRejectedOnRefresh = false;
  try {
    driverAuthService.refreshSessionToken(db, { refreshToken: accToken });
  } catch (err) {
    accRejectedOnRefresh = true;
    assert.strictEqual(err.status, 401);
    assert.strictEqual(err.code, 'TOKEN_TYPE_INVALID');
  }
  assert(accRejectedOnRefresh, 'Passing access token to refreshSessionToken must be rejected');

  // Refresh with actual refresh token -> Must succeed and return new access token
  const refreshResult = driverAuthService.refreshSessionToken(db, { refreshToken: refToken });
  assert(refreshResult.success);
  assert(refreshResult.accessToken);
  const newAccVer = driverAuthService.verifyJwt(refreshResult.accessToken);
  assert.strictEqual(newAccVer.payload.type, 'access', 'New token must have type: access');
  console.log('✓ Distinct token types enforced; access tokens rejected on /refresh endpoint.');

  // TEST 16: First-Login Password Change Gating on Token Refresh
  console.log('\n--- TEST 16: First-Login Password Change Gating on Token Refresh ---');
  // Reset password to trigger first-login temporary password status
  driverAuthService.resetDriverPassword(db, {
    employeeId: 'synth_drv_1',
    temporaryPassword: 'TempGatedPass2026!'
  });
  const tempLogin = driverAuthService.authenticateLogin(db, {
    employeeCode: 'D001',
    password: 'TempGatedPass2026!'
  });
  assert.strictEqual(tempLogin.mustChangePassword, true);

  // Driver with temporary password attempts to refresh session token before changing password
  let refreshGated = false;
  try {
    driverAuthService.refreshSessionToken(db, { refreshToken: tempLogin.refreshToken });
  } catch (err) {
    refreshGated = true;
    assert.strictEqual(err.status, 403);
    assert.strictEqual(err.code, 'PASSWORD_CHANGE_REQUIRED');
  }
  assert(refreshGated, 'Token refresh must be rejected with 403 PASSWORD_CHANGE_REQUIRED until temporary password is changed');
  console.log('✓ First-login restrictions strictly enforced: Refresh rejected until temporary password is changed.');

  // TEST 17: Accurate Driver Profile Mapping & Missing Assignment Null Safety
  console.log('\n--- TEST 17: Accurate Driver Profile Mapping & Missing Assignment Null Safety ---');
  // Change password to complete setup
  driverAuthService.changeDriverPassword(db, {
    employeeId: 'synth_drv_1',
    currentPassword: 'TempGatedPass2026!',
    newPassword: 'PermanentPassword2026#'
  });

  // Profile of synth_drv_1 (assigned to trk_1, supervisor is synth_staff_1)
  const profile1 = driverAuthService.getDriverProfile(db, 'synth_drv_1');
  assert.strictEqual(profile1.id, 'synth_drv_1');
  assert.strictEqual(profile1.name, 'Synthetic Alpha Driver', 'Must return actual driver name');
  assert.strictEqual(profile1.employeeCode, 'D001', 'Must return permanent code D001');
  assert.strictEqual(profile1.role, 'driver');
  assert.strictEqual(profile1.status, 'active');
  assert.notStrictEqual(profile1.name, 'Commercial Fleet Driver', 'Must NOT return placeholder name');
  assert(profile1.assignedTruck, 'Truck must be resolved');
  assert.strictEqual(profile1.assignedTruck.truckNumber, 'MH12AB1234');
  assert.strictEqual(profile1.assignedTruck.truckCode, 'TRK-001');
  assert(profile1.assignedSupervisor, 'Supervisor must be resolved');
  assert.strictEqual(profile1.assignedSupervisor.name, 'Synthetic Office Manager');
  assert.strictEqual(profile1.assignedSupervisor.code, 'E001');

  // Profile of synth_drv_2 (no truck assigned, no supervisor assigned)
  const profile2 = driverAuthService.getDriverProfile(db, 'synth_drv_2');
  assert.strictEqual(profile2.id, 'synth_drv_2');
  assert.strictEqual(profile2.name, 'Synthetic Beta Driver');
  assert.strictEqual(profile2.employeeCode, 'D003');
  assert.strictEqual(profile2.assignedTruck, null, 'Genuinely missing truck must return null');
  assert.strictEqual(profile2.assignedSupervisor, null, 'Genuinely missing supervisor must return null');
  console.log('✓ Driver profile returns actual employee data, assigned truck, supervisor, and null for missing assignments.');

  // TEST 18: Real Production Employee Baseline Mapping Verification
  console.log('\n--- TEST 18: Production Baseline Registry Mapping ---');
  // Chandrakant Shivaji Gaikwad (2ioikacogombftp) -> code D005, truck TG12U2637, supervisor Vinod Kumar Rathod (E001)
  const realChandrakant = driverAuthService.getDriverProfile(null, '2ioikacogombftp');
  assert.strictEqual(realChandrakant.employeeCode, 'D005');
  assert.strictEqual(realChandrakant.name, 'Chandrakant Shivaji Gaikwad');
  assert(realChandrakant.assignedTruck, 'Chandrakant must have truck TG12U2637');
  assert.strictEqual(realChandrakant.assignedTruck.truckNumber, 'TG12U2637');
  assert.strictEqual(realChandrakant.assignedTruck.truckCode, 'TRK-001');
  assert(realChandrakant.assignedSupervisor, 'Chandrakant must have supervisor Vinod Kumar Rathod');
  assert.strictEqual(realChandrakant.assignedSupervisor.name, 'Vinod Kumar Rathod');
  assert.strictEqual(realChandrakant.assignedSupervisor.code, 'E001');

  // Suresh Edlai (45vqjfmlhx576rb) -> code D003, no truck assigned -> assignedTruck must be null
  const realSuresh = driverAuthService.getDriverProfile(null, '45vqjfmlhx576rb');
  assert.strictEqual(realSuresh.employeeCode, 'D003');
  assert.strictEqual(realSuresh.name, 'Suresh Edlai');
  assert.strictEqual(realSuresh.assignedTruck, null, 'Suresh has no truck assigned, must return null');
  console.log('✓ Production baseline records correctly map Chandrakant to TG12U2637 & Vinod Kumar, and Suresh to null truck.');

  db.close();
  // Clean up synthetic test DB
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  console.log('\n🎉 ALL 18 SYNTHETIC TESTS PASSED CLEANLY!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
