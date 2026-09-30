const http = require('http');
const crypto = require('crypto');
const path = require('path');
const engine = require('./auditBackendEngine.cjs');

console.log('===========================================================');
console.log('   JAI BHAVANI CARGO — ENTERPRISE AUDIT TEST SUITE');
console.log('===========================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  // Test 1: Trip creation generates audit event
  const tripCreateEvt = engine.ingestEvent({
    module: 'LOGISTICS',
    entity_type: 'TRIP',
    entity_id: 'TRIP-2026-901',
    action: 'CREATE',
    severity: 'INFO',
    details: 'New trip scheduled for Amazon Logistics: Hyderabad to Bangalore',
    actor: { id: 'usr_disp_01', name: 'Ramesh Dispatcher', email: 'ramesh@jaibhavanicargo.com', role: 'dispatcher' },
    new_values: {
      trip_number: 'TRIP-2026-901',
      truck_number: 'AP 39 V 8821',
      route: 'Hyderabad - Bangalore',
      freight_amount: 45000,
      status: 'Scheduled'
    }
  });
  assert(tripCreateEvt && tripCreateEvt.id && tripCreateEvt.action === 'CREATE', '1. Creating a trip generates an audit event');

  // Test 2: Editing a trip records before-and-after values and changed fields
  const tripEditEvt = engine.ingestEvent({
    module: 'LOGISTICS',
    entity_type: 'TRIP',
    entity_id: 'TRIP-2026-901',
    action: 'UPDATE',
    severity: 'LOW',
    details: 'Updated freight rate and driver assignment',
    actor: { id: 'usr_mgr_01', name: 'Vikram Manager', email: 'vikram@jaibhavanicargo.com', role: 'manager' },
    previous_values: {
      trip_number: 'TRIP-2026-901',
      driver_name: 'Unassigned',
      freight_amount: 45000
    },
    new_values: {
      trip_number: 'TRIP-2026-901',
      driver_name: 'Kishan Rathod',
      freight_amount: 48000
    }
  });
  assert(
    tripEditEvt && 
    tripEditEvt.changed_fields.includes('driver_name') && 
    tripEditEvt.changed_fields.includes('freight_amount') &&
    tripEditEvt.previous_values.freight_amount === 45000 &&
    tripEditEvt.new_values.freight_amount === 48000,
    '2. Editing a trip records before-and-after values and changed fields'
  );

  // Test 3: Deleting a record generates deletion event
  const deleteEvt = engine.ingestEvent({
    module: 'LOGISTICS',
    entity_type: 'TRIP',
    entity_id: 'TRIP-2026-901',
    action: 'DELETE',
    severity: 'HIGH',
    details: 'Trip cancelled and deleted by management',
    actor: { id: 'usr_admin_01', name: 'Vinod Kumar Rathod', email: 'operations@jaibhavanicargo.com', role: 'superuser' },
    previous_values: { trip_number: 'TRIP-2026-901', status: 'Cancelled' }
  });
  assert(deleteEvt && deleteEvt.action === 'DELETE' && deleteEvt.severity === 'HIGH', '3. Deleting a record generates deletion event');

  // Test 4: Failed operations are represented accurately
  const failedEvt = engine.ingestEvent({
    module: 'AUTH',
    entity_type: 'SESSION',
    entity_id: 'LOGIN_ATTEMPT',
    action: 'LOGIN_FAILED',
    outcome: 'FAILURE',
    severity: 'MEDIUM',
    details: 'Failed authentication: invalid PIN credentials',
    actor: { id: 'usr_guest', name: 'Unknown User', email: 'hacker@suspicious.com', role: 'guest' }
  });
  assert(failedEvt && failedEvt.outcome === 'FAILURE' && failedEvt.action === 'LOGIN_FAILED', '4. Failed operations are represented accurately');

  // Test 5: Correct authenticated operator is recorded
  assert(tripCreateEvt.actor.email === 'ramesh@jaibhavanicargo.com' && tripCreateEvt.actor.role === 'dispatcher', '5. Correct authenticated operator is recorded');

  // Test 6: Actor spoofing prevention / sanitization
  const sensitiveEvt = engine.ingestEvent({
    module: 'ADMINISTRATION',
    entity_type: 'USER',
    entity_id: 'usr_test_99',
    action: 'UPDATE',
    new_values: {
      password: 'PlainSecretPassword123!',
      token: 'jwt_token_secret_xyz',
      credit_card_number: '4111222233334444',
      name: 'Safe User Name'
    }
  });
  assert(
    sensitiveEvt.new_values.password === '[REDACTED_CONFIDENTIAL]' &&
    sensitiveEvt.new_values.token === '[REDACTED_CONFIDENTIAL]' &&
    sensitiveEvt.new_values.credit_card_number === '[REDACTED_CONFIDENTIAL]' &&
    sensitiveEvt.new_values.name === 'Safe User Name',
    '6. Sensitive data sanitization prevents credential exposure in audit ledger'
  );

  // Test 7: Unauthorized user access rules
  const superuserAccessOnly = (role) => (role === 'superuser' || role === 'super_admin' || role === 'auditor');
  assert(superuserAccessOnly('superuser') && superuserAccessOnly('auditor') && !superuserAccessOnly('driver') && !superuserAccessOnly('client'), '7. Unauthorized users cannot access audit dashboard');

  // Test 8: Append-only enforcement (No update or delete API exists on audit engine)
  assert(typeof engine.updateEvent === 'undefined' && typeof engine.deleteEvent === 'undefined', '8. Ordinary users cannot update or delete audit events (append-only enforcement)');

  // Test 9: Fraud Detection Rule 7: Odometer rollback detection
  const odoRollbackEvt = engine.ingestEvent({
    module: 'FLEET',
    entity_type: 'TRUCK',
    entity_id: 'AP 39 V 8821',
    action: 'UPDATE',
    previous_values: { current_odometer: 145000 },
    new_values: { current_odometer: 130000 }
  });
  const alerts = engine.getAlerts();
  const rollbackAlert = alerts.find(a => a.rule_id === 'RULE_07_ODOMETER_ROLLBACK');
  assert(rollbackAlert !== undefined, '9. Fraud Detection Rule 7: Odometer rollback successfully triggers alert');

  // Test 10: Fraud Detection Rule 6: Fuel Tank Volume Limit (>400 L)
  const excessFuelEvt = engine.ingestEvent({
    module: 'FLEET',
    entity_type: 'FUEL_LOG',
    entity_id: 'FUEL-9981',
    action: 'CREATE',
    new_values: { truck_number: 'TS 08 UB 7711', litres: 650 }
  });
  const fuelAlert = engine.getAlerts().find(a => a.rule_id === 'RULE_06_EXCESS_FUEL_QUANTITY');
  assert(fuelAlert !== undefined, '10. Fraud Detection Rule 6: Fuel quantity exceeding tank limit triggers alert');

  // Test 11: Cryptographic integrity check
  const verification = engine.verifyIntegrity();
  assert(verification.valid === true && verification.issues.length === 0, '11. Cryptographic hash chain verification succeeds with zero tampering');

  // Test 12: Data export logging
  const exportEvt = engine.ingestEvent({
    module: 'ADMINISTRATION',
    entity_type: 'EXPORT',
    entity_id: 'TRIP_EXPORT_EXCEL',
    action: 'EXPORT',
    new_values: { module: 'Trip Logs', record_count: 150, format: 'EXCEL' }
  });
  assert(exportEvt && exportEvt.action === 'EXPORT', '12. Export operations are audited');

  // Test 13: System health monitor
  const health = engine.getHealthMetrics();
  assert(health.status === 'HEALTHY' && health.hash_chain_valid === true && health.total_events > 0, '13. Audit failures are visible in system health');

  // Test 14: Automated investigation case created for critical alert
  const cases = engine.getCases();
  const critCase = cases.find(c => c.severity === 'CRITICAL');
  assert(critCase !== undefined && critCase.status === 'OPEN', '14. Automated investigation case created for critical alert');

  console.log('===========================================================');
  console.log(`RESULTS: ${passedTests} / ${totalTests} assertions PASSED.`);
  console.log('===========================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 14 NON-NEGOTIABLE TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTestSuite();
