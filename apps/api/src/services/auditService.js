import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const EVENTS_FILE = path.join(DATA_DIR, 'audit_events_ledger.json');
const ALERTS_FILE = path.join(DATA_DIR, 'audit_alerts_ledger.json');
const CASES_FILE = path.join(DATA_DIR, 'audit_cases_ledger.json');

const GENESIS_HASH = '00000000000000000000GENESIS_ROOT_JAI_BHAVANI_CARGO_2026_SECURITY_SYSTEM';

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

loadLedgers();

function saveEvents() {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventsCache, null, 2), 'utf8');
}
function saveAlerts() {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alertsCache, null, 2), 'utf8');
}
function saveCases() {
  fs.writeFileSync(CASES_FILE, JSON.stringify(casesCache, null, 2), 'utf8');
}

export function sanitizeData(obj) {
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

export function computeEventHash(prevHash, seq, id, timestamp, actorId, action, entityId, newValues) {
  const valuesDigest = crypto.createHash('md5').update(JSON.stringify(newValues || {})).digest('hex');
  const payload = `${prevHash}|${seq}|${id}|${timestamp}|${actorId}|${action}|${entityId}|${valuesDigest}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function ingestEvent(eventPayload, reqMeta = {}) {
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

  evaluateFraudRules(eventRecord);

  return eventRecord;
}

function evaluateFraudRules(event) {
  const newVals = event.new_values || {};
  const prevVals = event.previous_values || {};
  let alertTriggered = null;

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

    const isDup = alertsCache.some(a => 
      a.rule_id === fullAlert.rule_id && 
      a.entity_id === fullAlert.entity_id && 
      (new Date(event.recorded_at) - new Date(a.timestamp)) < 60000
    );

    if (!isDup) {
      alertsCache.unshift(fullAlert);
      saveAlerts();

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

export function verifyIntegrity() {
  loadLedgers();
  const issues = [];
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < eventsCache.length; i++) {
    const evt = eventsCache[i];
    const expectedSeq = i + 1;

    if (evt.sequence_number !== expectedSeq) {
      issues.push({
        type: 'SEQUENCE_GAP',
        event_id: evt.id,
        expected_sequence: expectedSeq,
        actual_sequence: evt.sequence_number,
        message: `Sequence gap detected at index ${i}. Expected ${expectedSeq}, got ${evt.sequence_number}.`
      });
    }

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

  return {
    valid: issues.length === 0,
    total_events: eventsCache.length,
    verified_at: new Date().toISOString(),
    genesis_root: GENESIS_HASH,
    latest_event_hash: eventsCache.length > 0 ? eventsCache[eventsCache.length - 1].current_event_hash : GENESIS_HASH,
    issues: issues
  };
}

export function getHealthMetrics() {
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

export function getEvents(filters = {}) {
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
}

export function getAlerts() {
  loadLedgers();
  return [...alertsCache];
}

export function reviewAlert(alertId, reviewAction, notes, reviewer) {
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
}

export function getCases() {
  loadLedgers();
  return [...casesCache];
}

export function updateCase(caseId, updateData) {
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
}
