import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, FileText, Camera, Eye, Plus, History } from 'lucide-react';
import { dbtabeses } from '../db/store';
import { TripLog, PodRecord, LorryReceipt } from '../types';
import { PodViewModal } from '../components/documents/PodViewModal';
import { DriverPodCaptureModal } from '../components/documents/DriverPodCaptureModal';
import { DocumentAuditModal } from '../components/documents/DocumentAuditModal';

export const PodManagementPage: React.FC = () => {
  const [trips, setTrips] = useState<TripLog[]>(dbtabeses.getTrips());
  const [pods, setPods] = useState<PodRecord[]>(dbtabeses.getPodRecords());
  const [lrs, setLrs] = useState<LorryReceipt[]>(dbtabeses.getLorryReceipts());

  const [selectedTripForCapture, setSelectedTripForCapture] = useState<TripLog | null>(null);
  const [viewingPod, setViewingPod] = useState<PodRecord | null>(null);
  const [auditTarget, setAuditTarget] = useState<{ id: string; number: string } | null>(null);

  const reloadData = () => {
    setTrips(dbtabeses.getTrips());
    setPods(dbtabeses.getPodRecords());
    setLrs(dbtabeses.getLorryReceipts());
  };

  useEffect(() => {
    window.addEventListener('jc-store-update', reloadData);
    return () => window.removeEventListener('jc-store-update', reloadData);
  }, []);

  const podRequiredTrips = trips.filter(t => t.requires_pod);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FileCheck className="w-7 h-7 text-orange-400" /> Proof of Delivery (POD) Manager
          </h1>
          <p className="text-sm text-slate-400">
            Destination delivery verification, touchscreen receiver signatures &amp; delivery documents
          </p>
        </div>

        <button
          onClick={() => setSelectedTripForCapture(trips[0] || null)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Capture New POD</span>
        </button>
      </div>

      {/* Trips Requiring POD Verification */}
      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Trip Consignment Delivery Ledger ({podRequiredTrips.length})
          </span>
          <span className="text-[11px] text-slate-500">Auto-synced with Fleet Dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Trip Number</th>
                <th className="p-3.5">Client &amp; Route</th>
                <th className="p-3.5">Driver &amp; Truck</th>
                <th className="p-3.5">Linked LR</th>
                <th className="p-3.5">POD Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {podRequiredTrips.map(t => {
                const linkedLr = lrs.find(l => l.trip_id === t.id || l.trip_number === t.trip_number);
                const linkedPod = linkedLr?.pod_id
                  ? pods.find(p => p.id === linkedLr.pod_id || p.pod_number === linkedLr.pod_number)
                  : pods.find(p => p.trip_id === t.id || p.trip_number === t.trip_number);

                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{t.trip_number}</p>
                      <p className="text-xs text-slate-400">{t.start_date}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-orange-400 font-semibold">{t.client_name}</p>
                      <p className="text-xs text-slate-400">{t.origin} ➔ {t.destination}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <p className="font-medium text-white">{t.driver_name}</p>
                      <p className="text-xs font-mono text-slate-400">{t.truck_number}</p>
                    </td>
                    <td className="p-3.5">
                      {linkedLr ? (
                        <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
                          {linkedLr.lr_number}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No LR Yet</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {linkedPod ? (
                        <div>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            linkedPod.delivery_status === 'Delivered in Full'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {linkedPod.delivery_status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {linkedPod.pod_number}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Pending Handover
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {linkedPod ? (
                          <>
                            <button
                              onClick={() => setViewingPod(linkedPod)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl inline-flex items-center gap-1.5 text-xs transition"
                              title="View / Print A4 Proof of Delivery"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View POD</span>
                            </button>
                            <button
                              onClick={() => setAuditTarget({ id: linkedPod.id, number: linkedPod.pod_number })}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                              title="Audit Trail"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedTripForCapture(t)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl inline-flex items-center gap-1.5 text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Capture POD</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW POD MODAL */}
      {viewingPod && (
        <PodViewModal
          pod={viewingPod}
          isOpen={!!viewingPod}
          onClose={() => setViewingPod(null)}
          onViewAudit={(p) => setAuditTarget({ id: p.id, number: p.pod_number })}
        />
      )}

      {/* DRIVER POD CAPTURE MODAL */}
      {selectedTripForCapture && (
        <DriverPodCaptureModal
          isOpen={!!selectedTripForCapture}
          onClose={() => setSelectedTripForCapture(null)}
          trip={selectedTripForCapture}
          lr={lrs.find(l => l.trip_id === selectedTripForCapture.id || l.trip_number === selectedTripForCapture.trip_number) || null}
          onSuccess={(newPod) => {
            reloadData();
            setViewingPod(newPod);
          }}
        />
      )}

      {/* DOCUMENT AUDIT MODAL */}
      {auditTarget && (
        <DocumentAuditModal
          isOpen={!!auditTarget}
          onClose={() => setAuditTarget(null)}
          documentId={auditTarget.id}
          documentNumber={auditTarget.number}
          documentType="POD"
        />
      )}
    </div>
  );
};