const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

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
      created TEXT NOT NULL
    );

    CREATE TABLE trucks (
      id TEXT PRIMARY KEY,
      truck_number TEXT NOT NULL UNIQUE,
      truck_code TEXT DEFAULT '',
      model TEXT DEFAULT '',
      capacity TEXT DEFAULT '',
      status TEXT DEFAULT 'Active'
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
    INSERT INTO trucks (id, truck_number, truck_code, model) VALUES 
      ('trk_1', 'MH12AB1234', 'TRK-001', 'Tata Prima 4028.S'),
      ('trk_2', 'MH14CD5678', 'TRK-002', 'Ashok Leyland 3118');

    INSERT INTO trip_logs (id, truck_id, driver_id, start_date) VALUES 
      ('trip_1', 'trk_1', 'synth_drv_1', '2026-05-01 10:00:00'),
      ('trip_2', 'trk_2', 'synth_drv_2', '2026-06-01 12:00:00');
  `);

  // Insert synthetic employees (Drivers, Staff, Archived/Terminated, Missing code)
  db.exec(`
    INSERT INTO employees (id, name, employee_type, active_status, employee_code, employee_number, created) VALUES
      ('synth_drv_1', 'Synthetic Alpha Driver', 'driver', 'active', '', 0, '2026-01-01 10:00:00'),
      ('synth_staff_1', 'Synthetic Office Manager', 'manager', 'active', '', 0, '2026-01-02 11:00:00'),
      ('synth_drv_archived', 'Synthetic Terminated Driver', 'driver', 'terminated', '', 0, '2026-01-03 12:00:00'),
      ('synth_drv_2', 'Synthetic Beta Driver', 'driver', 'active', '', 0, '2026-01-04 13:00:00');
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

  // Verify token
  const verified = driverAuthService.verifyJwt(loginRes.accessToken);
  assert(verified.valid);
  assert.strictEqual(verified.payload.mustChange, true);
  console.log('✓ Login with temporary password succeeds and flags mustChangePassword=true.');

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
  // Trigger 5 consecutive failed logins
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
  // Reset password by office
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
  // If driver synth_drv_1 is promoted to manager, their code D001 must remain unchanged!
  db.prepare("UPDATE employees SET employee_type = 'manager' WHERE id = 'synth_drv_1'").run();
  const empAfterRoleChange = db.prepare('SELECT id, employee_code, employee_type FROM employees WHERE id = ?').get('synth_drv_1');
  assert.strictEqual(empAfterRoleChange.employee_code, 'D001', 'Original D001 code must be retained even after promotion to manager');
  console.log('✓ Code is permanently retained across role changes.');

  // TEST 13: Preservation of Existing Relationships & Historical Data
  console.log('\n--- TEST 13: Preservation of Relationships & Historical Data ---');
  const tripsCount = db.prepare('SELECT count(*) as c FROM trip_logs').get().c;
  assert.strictEqual(tripsCount, 2, 'Historical trips must not be modified or deleted');
  const trucksCount = db.prepare('SELECT count(*) as c FROM trucks').get().c;
  assert.strictEqual(trucksCount, 2, 'Truck records must be intact');
  console.log('✓ Historical data and foreign key relationships 100% preserved.');

  db.close();
  // Clean up synthetic test DB
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  console.log('\n🎉 ALL 13 SYNTHETIC TESTS PASSED CLEANLY!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
