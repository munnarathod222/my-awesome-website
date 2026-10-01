const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const EVENTS_FILE = path.join(DATA_DIR, 'audit_events_ledger.json');
const ALERTS_FILE = path.join(DATA_DIR, 'audit_alerts_ledger.json');
const CASES_FILE = path.join(DATA_DIR, 'audit_cases_ledger.json');
const HEALTH_FILE = path.join(DATA_DIR, 'audit_health_metrics.json');

const GENESIS_HASH = '00000000000000000000GENESIS_ROOT_JAI_BHAVANI_CARGO_2026_SECURITY_SYSTEM';

// Thread-safe in-memory cache synchronized with disk
let eventsCache = [];
let alertsCache = [];
let casesCache = [];

function loadLedgers() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      eventsCache = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
    } else {
      eventsCache = [];
    }
  } catch (e) {
    eventsCache = [];
  }

  try {
    if (fs.existsSync(ALERTS_FILE)) {
      alertsCache = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    } else {
      alertsCache = [];
    }
  } catch (e) {
    alertsCache = [];
  }

  try {
    if (fs.existsSync(CASES_FILE)) {
      casesCache = JSON.parse(fs.readFileSync(CASES_FILE, 'utf8'));
    } else {
      casesCache = [];
    }
  } catch (e) {
    casesCache = [];
  }
}

// Initial load
loadLedgers();

// Helper to save ledgers
function saveEvents() {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventsCache, null, 2), 'utf8');
}
function saveAlerts() {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alertsCache, null, 2), 'utf8');
}
function saveCases() {
  fs.writeFileSync(CASES_FILE, JSON.stringify(casesCache, null, 2), 'utf8');
}

// Deep sanitize sensitive data (passwords, tokens, pins, cards)
function sanitizeData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  
  const sanitized = {};
  const sensitivePattern = /password|token|secret|pin|authorization|credit_card_number|cvv|account_key/i;
  
  for (const [key, value] of Object.entries(obj)) {
    if (sensitivePattern.test(key)) {
      sanitized[key] = '[REDACTED_CONFIDENTIAL]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Compute SHA-256 hash chaining
function computeEventHash(prevHash, seq, id, timestamp, actorId, action, entityId, newValues) {
  const valuesDigest = crypto.createHash('md5').update(JSON.stringify(newValues || {})).digest('hex');
  const payload = `${prevHash}|${seq}|${id}|${timestamp}|${actorId}|${action}|${entityId}|${valuesDigest}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// Ingest an audit event with server verification and hash chaining
function ingestEvent(eventPayload, reqMeta = {}) {
  loadLedgers();

  const prevEvent = eventsCache[eventsCache.length - 1];
  const prevHash = prevEvent ? prevEvent.current_event_hash : GENESIS_HASH;
  const sequenceNumber = (prevEvent ? prevEvent.sequence_number : 0) + 1;
  const eventId = eventPayload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const recordedAt = new Date().toISOString();
  const timestamp = eventPayload.timestamp || recordedAt;

  const actor = {
    id: eventPayload.actor?.id || reqMeta.actorId || 'usr_sys_001',
    name: eventPayload.actor?.name || reqMeta.actorName || 'System Operator',
    email: eventPayload.actor?.email || reqMeta.actorEmail || 'system@jaibhavanicargo.com',
    role: eventPayload.actor?.role || reqMeta.actorRole || 'operator',
    tenant_id: eventPayload.actor?.tenant_id || 'JBC_MAIN'
  };

  const cleanPrevValues = sanitizeData(eventPayload.previous_values || null);
  const cleanNewValues = sanitizeData(eventPayload.new_values || null);

  // Derive changed fields if not provided
  let changedFields = eventPayload.changed_fields || [];
  if (changedFields.length === 0 && cleanPrevValues && cleanNewValues && typeof cleanPrevValues === 'object' && typeof cleanNewValues === 'object') {
    const allKeys = new Set([...Object.keys(cleanPrevValues), ...Object.keys(cleanNewValues)]);
    allKeys.forEach(k => {
      if (JSON.stringify(cleanPrevValues[k]) !== JSON.stringify(cleanNewValues[k])) {
        changedFields.push(k);
      }
    });
  }

  const currentHash = computeEventHash(
    prevHash,
    sequenceNumber,
    eventId,
    timestamp,
    actor.id,
    eventPayload.action || 'UPDATE',
    eventPayload.entity_id || 'N/A',
    cleanNewValues
  );

  const eventRecord = {
    id: eventId,
    sequence_number: sequenceNumber,
    schema_version: '1.0',
    timestamp: timestamp,
    recorded_at: recordedAt,
    actor: actor,
    module: eventPayload.module || 'LOGISTICS',
    entity_type: eventPayload.entity_type || 'GENERAL',
    entity_id: String(eventPayload.entity_id || 'N/A'),
    action: String(eventPayload.action || 'UPDATE').toUpperCase(),
    outcome: String(eventPayload.outcome || 'SUCCESS').toUpperCase(),
    severity: String(eventPayload.severity || 'INFO').toUpperCase(),
    details: eventPayload.details || `${eventPayload.action} on ${eventPayload.entity_type} ${eventPayload.entity_id}`,
    previous_values: cleanPrevValues,
    new_values: cleanNewValues,
    changed_fields: changedFields,
    reason: eventPayload.reason || null,
    request_id: reqMeta.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    correlation_id: eventPayload.correlation_id || reqMeta.correlationId || `corr_${Date.now()}`,
    session_ref_hash: crypto.createHash('sha256').update(reqMeta.sessionId || 'session_default').digest('hex').substring(0, 16),
    source_ip: reqMeta.ip || '127.0.0.1',
    user_agent: reqMeta.userAgent || 'JBC-Client-Web',
    previous_event_hash: prevHash,
    current_event_hash: currentHash
  };

  eventsCache.push(eventRecord);
  saveEvents();

  // Run Fraud & Security Detection Rules
  evaluateFraudRules(eventRecord);

  return eventRecord;
}

// 13 Automated Business-Integrity & Fraud Detection Rules
function evaluateFraudRules(event) {
  const newVals = event.new_values || {};
  const prevVals = event.previous_values || {};
  let alertTriggered = null;

  // Rule 1: Duplicate Payment References
  if (event.action === 'PAYMENT' && newVals.transaction_id) {
    const duplicate = eventsCache.find(e => 
      e.id !== event.id && 
      e.action === 'PAYMENT' && 
      e.new_values?.transaction_id === newVals.transaction_id
    );
    if (duplicate) {
      alertTriggered = {
        rule_id: 'RULE_01_DUPLICATE_PAYMENT_REF',
        title: 'Duplicate Payment Reference Detected',
        severity: 'CRITICAL',
        description: `Payment transaction ID "${newVals.transaction_id}" was previously logged under event ${duplicate.id} (${duplicate.entity_id}).`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 2: Repeated Invoice Modifications (>2 modifications)
  if (event.entity_type === 'INVOICE' && (event.action === 'UPDATE' || event.action === 'MODIFIED')) {
    const edits = eventsCache.filter(e => e.entity_id === event.entity_id && (e.action === 'UPDATE' || e.action === 'MODIFIED'));
    if (edits.length >= 3) {
      alertTriggered = {
        rule_id: 'RULE_02_REPEATED_INVOICE_MODIFICATIONS',
        title: 'Excessive Invoice Revisions',
        severity: 'HIGH',
        description: `Invoice ${event.entity_id} has undergone ${edits.length} revisions. Review for potential billing manipulation.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 3: Financial Modification After Closure / Delivery
  if ((event.module === 'FINANCIAL' || event.entity_type === 'TRIP') && event.action === 'UPDATE') {
    const isCompleted = prevVals.status === 'Completed' || prevVals.status === 'Delivered' || prevVals.clientPaymentStatus === 'Paid';
    const changedFinancial = event.changed_fields.some(f => /rate|freight|cost|amount|revenue|diesel/i.test(f));
    if (isCompleted && changedFinancial) {
      alertTriggered = {
        rule_id: 'RULE_03_POST_CLOSURE_FINANCIAL_MODIFICATION',
        title: 'Post-Closure Financial Modification',
        severity: 'CRITICAL',
        description: `Financial fields (${event.changed_fields.join(', ')}) were altered on closed/delivered record ${event.entity_id}.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 4: Backdated Financial Entries (>7 days in past)
  if (event.action === 'CREATE' && (event.module === 'FINANCIAL' || event.entity_type === 'EXPENSE' || event.entity_type === 'PAYMENT')) {
    const entryDate = newVals.date || newVals.payment_date || newVals.timestamp;
    if (entryDate) {
      const diffDays = (new Date(event.recorded_at) - new Date(entryDate)) / (1000 * 60 * 60 * 24);
      if (diffDays > 7 && !event.reason) {
        alertTriggered = {
          rule_id: 'RULE_04_BACKDATED_FINANCIAL_ENTRY',
          title: 'Unjustified Backdated Financial Record',
          severity: 'HIGH',
          description: `Transaction backdated by ${Math.floor(diffDays)} days without verified administrative justification.`,
          entity_id: event.entity_id,
          related_user: event.actor.email
        };
      }
    }
  }

  // Rule 5: Unusual Trip Rate Adjustment (>30% variance)
  if (event.entity_type === 'TRIP' && event.action === 'UPDATE' && prevVals.freight_amount && newVals.freight_amount) {
    const oldRate = parseFloat(prevVals.freight_amount);
    const newRate = parseFloat(newVals.freight_amount);
    if (oldRate > 0 && Math.abs(newRate - oldRate) / oldRate > 0.30) {
      alertTriggered = {
        rule_id: 'RULE_05_UNUSUAL_RATE_ADJUSTMENT',
        title: 'Abnormal Trip Rate Variance (>30%)',
        severity: 'HIGH',
        description: `Freight rate on trip ${event.entity_id} changed from ₹${oldRate.toLocaleString()} to ₹${newRate.toLocaleString()} (${((newRate-oldRate)/oldRate * 100).toFixed(1)}%).`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 6: Fuel Quantity Exceeding Tank Limits (>400 Litres)
  if (event.entity_type === 'FUEL_LOG' || event.entity_type === 'FUEL' || /fuel/i.test(event.entity_id)) {
    const litres = parseFloat(newVals.litres || newVals.quantity || newVals.liters || 0);
    if (litres > 400) {
      alertTriggered = {
        rule_id: 'RULE_06_EXCESS_FUEL_QUANTITY',
        title: 'Fuel Volume Exceeds Standard Tank Capacity',
        severity: 'HIGH',
        description: `Fuel entry of ${litres} L exceeds physical tank capacity threshold of 400 L for vehicle ${newVals.truck_number || event.entity_id}.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 7: Odometer Reading Rollback / Inconsistent
  if (event.entity_type === 'TRUCK' || event.entity_type === 'TRIP' || event.entity_type === 'ODOMETER') {
    const oldOdo = parseFloat(prevVals.current_odometer || prevVals.end_kms || 0);
    const newOdo = parseFloat(newVals.current_odometer || newVals.start_kms || 0);
    if (oldOdo > 0 && newOdo > 0 && newOdo < oldOdo) {
      alertTriggered = {
        rule_id: 'RULE_07_ODOMETER_ROLLBACK',
        title: 'Odometer Rollback Detected',
        severity: 'CRITICAL',
        description: `Odometer reading was updated from ${oldOdo} KM down to ${newOdo} KM (negative delta of ${oldOdo - newOdo} KM).`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 8: Bulk Deletion Detection (>3 deletions in 5 minutes)
  if (event.action === 'DELETE') {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentDeletions = eventsCache.filter(e => e.action === 'DELETE' && e.actor.id === event.actor.id && e.recorded_at > fiveMinAgo);
    if (recentDeletions.length >= 3) {
      alertTriggered = {
        rule_id: 'RULE_08_BULK_DELETION_BURST',
        title: 'Unusual Bulk Deletion Activity',
        severity: 'CRITICAL',
        description: `User ${event.actor.name} (${event.actor.email}) performed ${recentDeletions.length} record deletions within 5 minutes.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 9: Repeated Driver Swaps on Active Transit (>2 changes)
  if (event.entity_type === 'TRIP' && event.action === 'UPDATE' && event.changed_fields.includes('driver_name')) {
    const swaps = eventsCache.filter(e => e.entity_id === event.entity_id && e.changed_fields.includes('driver_name'));
    if (swaps.length >= 3) {
      alertTriggered = {
        rule_id: 'RULE_09_FREQUENT_DRIVER_REASSIGNMENT',
        title: 'Repeated Driver Reassignment on Route',
        severity: 'MEDIUM',
        description: `Trip ${event.entity_id} has undergone ${swaps.length} driver reassignments. Verify chain of custody.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 10: Privilege Escalation
  if (event.action === 'PERMISSION_CHANGE' || event.changed_fields.includes('role')) {
    const newRole = newVals.role;
    if (newRole === 'superuser' || newRole === 'super_admin') {
      alertTriggered = {
        rule_id: 'RULE_10_PRIVILEGE_ESCALATION',
        title: 'Privilege Escalation to Super Administrator',
        severity: 'CRITICAL',
        description: `Role elevated to ${newRole} for user ${event.entity_id} by ${event.actor.email}.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 11: Repeated Failed Logins (>3 in 5 minutes)
  if (event.action === 'LOGIN_FAILED') {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const failures = eventsCache.filter(e => e.action === 'LOGIN_FAILED' && (e.actor.email === event.actor.email || e.source_ip === event.source_ip) && e.recorded_at > fiveMinAgo);
    if (failures.length >= 3) {
      alertTriggered = {
        rule_id: 'RULE_11_BRUTE_FORCE_AUTH_ATTEMPT',
        title: 'Repeated Failed Authentication Attempts',
        severity: 'HIGH',
        description: `${failures.length} failed login attempts for account ${event.actor.email} from IP ${event.source_ip}.`,
        entity_id: event.actor.email,
        related_user: event.actor.email
      };
    }
  }

  // Rule 12: Large or Suspicious Data Export
  if (event.action === 'EXPORT') {
    const recordCount = parseInt(newVals.record_count || 0, 10);
    if (recordCount > 300) {
      alertTriggered = {
        rule_id: 'RULE_12_MASS_DATA_EXPORT',
        title: 'High-Volume Data Export',
        severity: 'MEDIUM',
        description: `Operator ${event.actor.name} exported ${recordCount} records from ${event.module}. Verify business necessity.`,
        entity_id: event.entity_id,
        related_user: event.actor.email
      };
    }
  }

  // Rule 13: Suspicious Configuration Changes
  if (event.action === 'CONFIGURATION_CHANGE' || event.module === 'SETTINGS') {
    alertTriggered = {
      rule_id: 'RULE_13_SYSTEM_CONFIGURATION_CHANGE',
      title: 'Core System Configuration Alteration',
      severity: 'LOW',
      description: `System settings or operational parameters modified by ${event.actor.email}.`,
      entity_id: event.entity_id,
      related_user: event.actor.email
    };
  }

  // If alert triggered, deduplicate and record
  if (alertTriggered) {
    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullAlert = {
      id: alertId,
      ...alertTriggered,
      event_id: event.id,
      timestamp: event.recorded_at,
      status: 'OPEN',
      reviewed_by: null,
      reviewed_at: null,
      review_action: null
    };

    // Deduplicate identical alerts triggered within last 60 seconds
    const isDup = alertsCache.some(a => 
      a.rule_id === fullAlert.rule_id && 
      a.entity_id === fullAlert.entity_id && 
      (new Date(event.recorded_at) - new Date(a.timestamp)) < 60000
    );

    if (!isDup) {
      alertsCache.unshift(fullAlert);
      saveAlerts();

      // Automatically create investigation case for CRITICAL alerts
      if (fullAlert.severity === 'CRITICAL') {
        const caseNumber = `CASE-${new Date().getFullYear()}-${String(casesCache.length + 1).padStart(4, '0')}`;
        const newCase = {
          id: `case_${Date.now()}`,
          case_number: caseNumber,
          detection_rule: fullAlert.rule_id,
          title: fullAlert.title,
          severity: fullAlert.severity,
          related_user: fullAlert.related_user,
          related_record: fullAlert.entity_id,
          supporting_event_ids: [event.id],
          assigned_reviewer: 'Compliance Officer',
          status: 'OPEN',
          investigation_notes: [
            {
              timestamp: new Date().toISOString(),
              author: 'Automated Fraud Engine',
              note: `Case automatically generated due to CRITICAL rule breach: ${fullAlert.description}`
            }
          ],
          findings: null,
          resolution: null,
          created_at: new Date().toISOString(),
          closed_at: null
        };
        casesCache.unshift(newCase);
        saveCases();
      }
    }
  }
}

// Cryptographic hash chain verification
function verifyIntegrity() {
  loadLedgers();
  const issues = [];
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < eventsCache.length; i++) {
    const evt = eventsCache[i];
    const expectedSeq = i + 1;

    // Check sequence continuity
    if (evt.sequence_number !== expectedSeq) {
      issues.push({
        type: 'SEQUENCE_GAP',
        event_id: evt.id,
        expected_sequence: expectedSeq,
        actual_sequence: evt.sequence_number,
        message: `Sequence gap detected at index ${i}. Expected ${expectedSeq}, got ${evt.sequence_number}.`
      });
    }

    // Check previous hash link
    if (evt.previous_event_hash !== expectedPrevHash) {
      issues.push({
        type: 'BROKEN_HASH_LINK',
        event_id: evt.id,
        sequence_number: evt.sequence_number,
        expected_prev_hash: expectedPrevHash,
        actual_prev_hash: evt.previous_event_hash,
        message: `Broken hash link at event ${evt.id} (sequence ${evt.sequence_number}). Chain has been severed.`
      });
    }

    // Recompute current hash
    const recomputedHash = computeEventHash(
      evt.previous_event_hash,
      evt.sequence_number,
      evt.id,
      evt.timestamp,
      evt.actor.id,
      evt.action,
      evt.entity_id,
      evt.new_values
    );

    if (recomputedHash !== evt.current_event_hash) {
      issues.push({
        type: 'CORRUPTED_EVENT_DATA',
        event_id: evt.id,
        sequence_number: evt.sequence_number,
        stored_hash: evt.current_event_hash,
        recomputed_hash: recomputedHash,
        message: `Payload tampering detected for event ${evt.id}! Current hash does not match recomputed SHA-256.`
      });
    }

    expectedPrevHash = evt.current_event_hash;
  }

  const result = {
    valid: issues.length === 0,
    total_events: eventsCache.length,
    verified_at: new Date().toISOString(),
    genesis_root: GENESIS_HASH,
    latest_event_hash: eventsCache.length > 0 ? eventsCache[eventsCache.length - 1].current_event_hash : GENESIS_HASH,
    issues: issues
  };

  return result;
}

// System Health Monitor Metrics
function getHealthMetrics() {
  loadLedgers();
  const integrity = verifyIntegrity();
  const latestEvent = eventsCache[eventsCache.length - 1];

  return {
    status: integrity.valid ? 'HEALTHY' : 'DEGRADED_INTEGRITY_BREACH',
    total_events: eventsCache.length,
    latest_event_at: latestEvent ? latestEvent.recorded_at : null,
    latest_event_id: latestEvent ? latestEvent.id : null,
    total_alerts: alertsCache.length,
    open_alerts: alertsCache.filter(a => a.status === 'OPEN').length,
    total_cases: casesCache.length,
    open_cases: casesCache.filter(c => c.status === 'OPEN' || c.status === 'UNDER_REVIEW').length,
    hash_chain_valid: integrity.valid,
    sequence_continuity_valid: !integrity.issues.some(i => i.type === 'SEQUENCE_GAP'),
    storage_size_bytes: fs.existsSync(EVENTS_FILE) ? fs.statSync(EVENTS_FILE).size : 0,
    server_time: new Date().toISOString()
  };
}

module.exports = {
  ingestEvent,
  verifyIntegrity,
  getHealthMetrics,
  getEvents: (filters = {}) => {
    loadLedgers();
    let res = [...eventsCache].reverse();
    if (filters.module && filters.module !== 'all') {
      res = res.filter(e => e.module?.toLowerCase() === filters.module.toLowerCase());
    }
    if (filters.action && filters.action !== 'all') {
      res = res.filter(e => e.action?.toUpperCase() === filters.action.toUpperCase());
    }
    if (filters.severity && filters.severity !== 'all') {
      res = res.filter(e => e.severity?.toUpperCase() === filters.severity.toUpperCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      res = res.filter(e => 
        (e.details || '').toLowerCase().includes(q) ||
        (e.entity_id || '').toLowerCase().includes(q) ||
        (e.actor?.name || '').toLowerCase().includes(q) ||
        (e.actor?.email || '').toLowerCase().includes(q)
      );
    }
    return res;
  },
  getAlerts: () => {
    loadLedgers();
    return [...alertsCache];
  },
  reviewAlert: (alertId, reviewAction, notes, reviewer) => {
    loadLedgers();
    const alert = alertsCache.find(a => a.id === alertId);
    if (alert) {
      alert.status = reviewAction === 'DISMISS' ? 'CLOSED' : 'UNDER_REVIEW';
      alert.reviewed_by = reviewer || 'Admin';
      alert.reviewed_at = new Date().toISOString();
      alert.review_action = reviewAction;
      saveAlerts();
    }
    return alert;
  },
  getCases: () => {
    loadLedgers();
    return [...casesCache];
  },
  updateCase: (caseId, updateData) => {
    loadLedgers();
    const caseItem = casesCache.find(c => c.id === caseId || c.case_number === caseId);
    if (caseItem) {
      if (updateData.status) caseItem.status = updateData.status;
      if (updateData.findings) caseItem.findings = updateData.findings;
      if (updateData.resolution) caseItem.resolution = updateData.resolution;
      if (updateData.assigned_reviewer) caseItem.assigned_reviewer = updateData.assigned_reviewer;
      if (updateData.note) {
        caseItem.investigation_notes.push({
          timestamp: new Date().toISOString(),
          author: updateData.author || 'Investigator',
          note: updateData.note
        });
      }
      if (caseItem.status === 'RESOLVED' || caseItem.status === 'CLOSED') {
        caseItem.closed_at = new Date().toISOString();
      }
      saveCases();
    }
    return caseItem;
  },
  clearAll: () => {
    eventsCache = [];
    alertsCache = [];
    casesCache = [];
    saveEvents();
    saveAlerts();
    saveCases();
    return { success: true, message: 'All audit events, alerts, and cases cleared successfully.' };
  },
  seedAuthenticBaseline: () => {
    eventsCache = [];
    alertsCache = [];
    casesCache = [];
    saveEvents();
    saveAlerts();
    saveCases();
    const actorAdmin = {
      id: 'usr_vinod_admin',
      name: 'Vinod Kumar Rathod',
      email: 'munnarathod222@gmail.com',
      role: 'superuser',
      tenant_id: 'JBC_MAIN'
    };
    const actorDriver = {
      id: 'drv_dayanand',
      name: 'Dayanand Surwase',
      email: 'dayanand@jaibhavanicargo.com',
      role: 'driver',
      tenant_id: 'JBC_MAIN'
    };

    const baselineEvents = [
      {
        module: 'AUTH',
        entity_type: 'USER',
        entity_id: 'usr_vinod_admin',
        action: 'LOGIN',
        severity: 'INFO',
        details: 'Super Admin Vinod Kumar Rathod authenticated to Executive Operations Hub',
        actor: actorAdmin,
        new_values: { session_id: 'sess_prod_exec_01', auth_method: 'biometric_credentials', ip: '103.211.54.12', status: 'AUTHENTICATED' }
      },
      {
        module: 'FLEET',
        entity_type: 'TRUCK',
        entity_id: 'TG12U2637',
        action: 'INSPECT',
        severity: 'INFO',
        details: 'Pre-dispatch compliance & tyre tread inspection verified for vehicle TG12U2637',
        actor: actorAdmin,
        new_values: { truck_number: 'TG12U2637', truck_type: '32ft Multi-Axle', fitness_valid_until: '2027-04-15', tax_status: 'PAID_CURRENT', status: 'READY_FOR_DISPATCH' }
      },
      {
        module: 'LOGISTICS',
        entity_type: 'TRIP',
        entity_id: 'TRIP-286',
        action: 'CREATE',
        severity: 'INFO',
        details: 'Consignment TRIP-286 dispatched: Hyderabad to JNPT Nhava Sheva (Client: Amazon Logistics)',
        actor: actorAdmin,
        new_values: { trip_number: 'TRIP-286', client_name: 'Amazon Logistics', truck_number: 'TG12U2637', driver_name: 'Dayanand Surwase', origin: 'Hyderabad ORR Hub', destination: 'JNPT Nhava Sheva, Navi Mumbai', freight_amount: 52000, advance_paid: 15000, status: 'IN_TRANSIT' }
      },
      {
        module: 'FINANCE',
        entity_type: 'EXPENSE',
        entity_id: 'EXP-2026-904',
        action: 'CREATE',
        severity: 'INFO',
        details: 'Diesel refuel authorized at BPCL Highway Oasis (₹14,500, 162.9 L, Vehicle: TG12U2637)',
        actor: actorAdmin,
        new_values: { expense_id: 'EXP-2026-904', category: 'Fuel', vendor: 'BPCL Ghatkesar Highway Oasis', litres: 162.9, rate_per_litre: 89.01, total_amount: 14500, payment_mode: 'HDFC Corporate Card', truck_number: 'TG12U2637', status: 'APPROVED' }
      },
      {
        module: 'FINANCE',
        entity_type: 'EXPENSE',
        entity_id: 'TOLL-ORR-2026',
        action: 'CREATE',
        severity: 'INFO',
        details: 'Automated FASTag toll deduction reconciled at Shamshabad ORR Toll Plaza (₹385)',
        actor: actorAdmin,
        new_values: { toll_plaza: 'Shamshabad ORR Interchange', tag_id: '34161FA82032049182', truck_number: 'TG12U2637', amount: 385, direction: 'OUTWARD', reconciled: true }
      },
      {
        module: 'LOGISTICS',
        entity_type: 'DOCUMENT',
        entity_id: 'POD-TRIP-285',
        action: 'UPLOAD',
        severity: 'INFO',
        details: 'Proof of Delivery (POD) physical receipt scanned and verified for consignment TRIP-285',
        actor: actorDriver,
        new_values: { trip_number: 'TRIP-285', consignee_signature: 'Verified - Receiving Officer Stamp', delivery_timestamp: '2026-10-01T14:20:00.000Z', file_name: 'pod_trip_285_stamped.pdf', status: 'VERIFIED' }
      },
      {
        module: 'FLEET',
        entity_type: 'MAINTENANCE',
        entity_id: 'JC-JOB-441',
        action: 'UPDATE',
        severity: 'INFO',
        details: 'Scheduled mechanical service completed: Engine oil flush, brake pads replaced for TS09UB8844',
        actor: actorAdmin,
        new_values: { job_card_id: 'JC-JOB-441', truck_number: 'TS09UB8844', service_type: 'Preventative Maintenance', mechanic: 'Master Garage Hyderabad', total_cost: 8400, status: 'COMPLETED' }
      },
      {
        module: 'DOCUMENTS',
        entity_type: 'DOCUMENT',
        entity_id: 'DOC-NP-2026',
        action: 'VERIFY',
        severity: 'INFO',
        details: 'National Goods Permit Category A compliance verified and synced into Company Vault',
        actor: actorAdmin,
        new_values: { document_type: 'National Permit A', issuing_authority: 'Ministry of Road Transport & Highways', valid_upto: '2027-09-30', status: 'ACTIVE_COMPLIANT' }
      },
      {
        module: 'FINANCE',
        entity_type: 'PAYROLL',
        entity_id: 'ADV-DRV-089',
        action: 'PAYMENT',
        severity: 'INFO',
        details: 'Trip advance allowance of ₹8,000 disbursed via IMPS to Dayanand Surwase',
        actor: actorAdmin,
        new_values: { voucher_id: 'ADV-DRV-089', recipient: 'Dayanand Surwase', amount: 8000, purpose: 'Trip Advance En-route Expenses', disbursement_mode: 'IMPS Bank Transfer', status: 'DISBURSED' }
      },
      {
        module: 'LOGISTICS',
        entity_type: 'RATE_SLAB',
        entity_id: 'SLAB-2026-CORRIDOR',
        action: 'UPDATE',
        severity: 'LOW',
        details: 'Freight rate matrix calibrated for ORR & Industrial Corridors (Base ₹42/km)',
        actor: actorAdmin,
        new_values: { slab_profile: 'Standard Industrial Fleet', base_rate_per_km: 42, fuel_surcharge_factor: 1.05, updated_by: 'Vinod Kumar Rathod', status: 'ACTIVE' }
      }
    ];

    baselineEvents.forEach(evt => ingestEvent(evt));
    return { success: true, count: eventsCache.length, events: eventsCache };
  }
};
