import pb from './pocketbaseClient.js';

/**
 * Universal Audit Logging Utility
 * Records all creations, edits, status updates, and deletions across all system modules.
 */
export async function logAuditEvent({ action, module, recordId, details, performedBy }) {
  try {
    // 1. Detect active user context
    const authModel = pb.authStore?.model || {};
    const currentUser = performedBy || {
      id: authModel.id || 'usr_system',
      name: authModel.name || authModel.full_name || 'System User',
      email: authModel.email || 'system@jaibhavanicargo.com',
      role: authModel.role || 'operator'
    };

    const timestamp = new Date().toISOString();
    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: action || 'UPDATE', // CREATE, UPDATE, DELETE, STATUS_CHANGE, PAYMENT_MARKED
      module: module || 'System', // Trip Logs, Payment Requests, Cashbook, Users, etc.
      record_id: recordId || '-',
      details: typeof details === 'object' ? JSON.stringify(details) : (details || 'System operation executed'),
      performed_by_id: currentUser.id || 'usr_unknown',
      performed_by_name: currentUser.name || currentUser.full_name || currentUser.email || 'Unknown User',
      performed_by_email: currentUser.email || '',
      performed_by_role: currentUser.role || 'Operator',
      timestamp: timestamp,
      created: timestamp
    };

    // 2. Write to local storage audit trail cache (Guarantee audit trail persistence)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('jbc_audit_logs') || '[]');
      const updatedLogs = [logEntry, ...existingLogs].slice(0, 2000); // Keep latest 2000 events
      localStorage.setItem('jbc_audit_logs', JSON.stringify(updatedLogs));
      window.dispatchEvent(new Event('audit_logged'));
    } catch (localErr) {
      console.warn('[AuditLogger] Local cache write warning:', localErr);
    }

    // 3. Attempt async PocketBase write if collection exists
    pb.collection('audit_logs').create({
      action: logEntry.action,
      module: logEntry.module,
      record_id: logEntry.record_id,
      details: logEntry.details,
      performed_by_name: logEntry.performed_by_name,
      performed_by_email: logEntry.performed_by_email,
      performed_by_role: logEntry.performed_by_role,
      timestamp: timestamp
    }, { $autoCancel: false }).catch(() => {
      // Quietly handle if audit_logs PocketBase collection is not yet configured
    });

    console.log(`[Audit Trail] 🛡️ [${logEntry.action}] ${logEntry.module} by ${logEntry.performed_by_name}:`, logEntry.details);
    return logEntry;
  } catch (err) {
    console.error('[AuditLogger] Exception logging audit event:', err);
  }
}

/**
 * Fetch all local audit logs
 */
export function getLocalAuditLogs() {
  try {
    const raw = localStorage.getItem('jbc_audit_logs');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}
