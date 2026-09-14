import { dbtabeses } from '../db/store';
import { DocumentAuditLog } from '../types';

export const auditLogService = {
  getLogs(documentId?: string): DocumentAuditLog[] {
    const allLogs: DocumentAuditLog[] = dbtabeses.getAuditLogs();
    if (!documentId) return allLogs;
    return allLogs.filter(log => log.document_id === documentId);
  },

  logAction(params: {
    document_type: 'LR' | 'POD';
    document_id: string;
    document_number: string;
    action: 'Created' | 'Edited' | 'Generated' | 'Cancelled' | 'Submitted' | 'Completed' | 'Modified' | 'Downloaded' | 'Shared';
    user_name?: string;
    user_role?: string;
    details: string;
    metadata?: Record<string, any>;
  }): DocumentAuditLog {
    const logs = dbtabeses.getAuditLogs();
    const newLog: DocumentAuditLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      document_type: params.document_type,
      document_id: params.document_id,
      document_number: params.document_number,
      action: params.action,
      user_name: params.user_name || 'Admin',
      user_role: params.user_role || 'Operations Lead',
      timestamp: new Date().toISOString(),
      details: params.details,
      metadata: params.metadata || {}
    };

    logs.unshift(newLog);
    // Keep max 500 logs to prevent memory clutter
    if (logs.length > 500) {
      logs.splice(500);
    }
    dbtabeses.setAuditLogs(logs);
    return newLog;
  }
};
