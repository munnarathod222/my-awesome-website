import React from 'react';
import { X, History, User, Clock, ShieldCheck, FileText } from 'lucide-react';
import { DocumentAuditLog } from '../../types';
import { auditLogService } from '../../services/auditLogService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentNumber?: string;
  documentType?: 'LR' | 'POD';
}

export const DocumentAuditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentId,
  documentNumber,
  documentType
}) => {
  if (!isOpen) return null;

  const logs: DocumentAuditLog[] = auditLogService.getLogs(documentId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Document Audit Trail</span>
                {documentNumber && (
                  <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
                    {documentNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Chronological history of creation, edits, downloads, and changes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Log Content */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p>No recorded modifications for this document yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'Created' || log.action === 'Generated' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      log.action === 'Edited' || log.action === 'Modified' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      log.action === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.action.toUpperCase()}
                    </span>
                    <span className="font-mono text-slate-300 font-bold">{log.document_number}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-slate-300 font-medium">{log.details}</p>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>By: <b className="text-slate-300">{log.user_name}</b> ({log.user_role})</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
