import React, { useRef } from 'react';
import { X, Printer, Download, Share2, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck, History, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { PodRecord } from '../../types';
import { dbtabeses } from '../../db/store';
import { documentPrintService } from '../../services/documentPrintService';
import { auditLogService } from '../../services/auditLogService';

interface Props {
  pod: PodRecord;
  isOpen: boolean;
  onClose: () => void;
  onViewAudit?: (pod: PodRecord) => void;
}

export const PodViewModal: React.FC<Props> = ({
  pod,
  isOpen,
  onClose,
  onViewAudit
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const company = dbtabeses.getCompanySettings();

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!printableRef.current) return;
    documentPrintService.printDocument(
      `POD_${pod.pod_number.replace(/\//g, '_')}`,
      printableRef.current.innerHTML
    );
    auditLogService.logAction({
      document_type: 'POD',
      document_id: pod.id,
      document_number: pod.pod_number,
      action: 'Downloaded',
      details: 'Printed / exported Proof of Delivery (POD) A4 document'
    });
  };

  const handleWhatsAppShare = () => {
    const routeStr = `${pod.origin} to ${pod.destination}`;
    const shareUrl = documentPrintService.getWhatsAppShareUrl({
      recipientPhone: pod.receiver_phone,
      documentType: 'POD',
      documentNumber: pod.pod_number,
      tripNumber: pod.trip_number,
      clientName: pod.client_name,
      vehicleNumber: pod.vehicle_number,
      route: routeStr,
      status: pod.delivery_status,
      verificationUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/pod/${pod.id}`
    });
    window.open(shareUrl, '_blank');
    auditLogService.logAction({
      document_type: 'POD',
      document_id: pod.id,
      document_number: pod.pod_number,
      action: 'Shared',
      details: `Shared POD via WhatsApp with receiver`
    });
  };

  const isDeliveredInFull = pod.delivery_status === 'Delivered in Full';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              {pod.pod_number}
            </span>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
              isDeliveredInFull
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {pod.delivery_status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-950/30 transition cursor-pointer"
              title="Print POD Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print POD</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {onViewAudit && (
              <button
                onClick={() => onViewAudit(pod)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title="View Audit Trail"
              >
                <History className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-950 flex justify-center">
          <div
            ref={printableRef}
            className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl p-6 sm:p-8 rounded-lg text-xs leading-tight font-sans"
            style={{ minHeight: '260mm', color: '#0f172a' }}
          >
            {/* Header: Company Information */}
            <div className="border-2 border-slate-900 rounded-lg p-3 mb-2">
              <div className="flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={company.logo_url || '/logo.png'}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain rounded border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
                      {company.company_name || 'JAI BHAVANI CARGO'}
                    </h1>
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-widest">
                      PROOF OF DELIVERY &bull; ACKNOWLEDGEMENT SLIP
                    </p>
                    <p className="text-[10px] text-slate-700 mt-0.5 max-w-md leading-relaxed">
                      {company.company_address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="bg-emerald-950 text-emerald-200 font-mono px-3 py-1 rounded text-right font-black text-sm uppercase tracking-wider">
                    PROOF OF DELIVERY
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">DELIVERY RECEIPT</p>
                  <p className="text-[10px] font-mono font-bold text-slate-900 mt-0.5">
                    GSTIN: <span>{company.company_gstin}</span>
                  </p>
                  <p className="text-[9px] text-slate-600">Ph: {company.company_phone}</p>
                  <p className="text-[9px] text-slate-600">{company.company_website}</p>
                </div>
              </div>

              {/* POD Identification Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px]">
                <div>
                  <span className="text-slate-500 font-bold block">POD NUMBER:</span>
                  <span className="font-mono font-black text-sm text-emerald-800">{pod.pod_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">LORRY RECEIPT (LR):</span>
                  <span className="font-mono font-bold text-slate-900">{pod.lr_number}</span>
                  <span className="text-[9px] text-slate-500 block">LR Date: {pod.lr_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">TRIP REFERENCE:</span>
                  <span className="font-mono font-bold text-slate-900">{pod.trip_number}</span>
                  <span className="text-[9px] text-slate-500 block">E-Way: {pod.eway_bill_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">DELIVERY COMPLETED:</span>
                  <span className="font-bold text-slate-900">{pod.delivery_date} at {pod.delivery_time}</span>
                  <span className="text-[9px] text-emerald-700 block font-semibold">● Handover Confirmed</span>
                </div>
              </div>
            </div>

            {/* Vehicle, Driver, Consignor & Consignee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              {/* Transport Crew */}
              <div className="border border-slate-400 rounded p-2 bg-slate-50 text-[10px]">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  DISPATCH &amp; VEHICLE
                </p>
                <p className="font-mono font-black text-xs text-slate-900">{pod.vehicle_number}</p>
                <div className="mt-1">
                  <span className="text-slate-500 block text-[9px]">DRIVER IN CHARGE:</span>
                  <span className="font-bold text-slate-800">{pod.driver_name}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-500 block text-[9px]">CONTRACT CLIENT:</span>
                  <span className="font-semibold text-slate-900">{pod.client_name}</span>
                </div>
              </div>

              {/* Consignor */}
              <div className="border border-slate-400 rounded p-2 text-[10px]">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  CONSIGNOR (DISPATCH FROM)
                </p>
                <p className="font-bold text-slate-900">{pod.consignor_name}</p>
                <p className="text-slate-600 text-[9px] leading-tight mt-0.5">{pod.consignor_address}</p>
                {pod.consignor_gstin && (
                  <p className="text-[9px] font-mono text-slate-600 mt-1">GSTIN: {pod.consignor_gstin}</p>
                )}
              </div>

              {/* Consignee */}
              <div className="border border-slate-400 rounded p-2 text-[10px]">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  CONSIGNEE (DELIVERED TO)
                </p>
                <p className="font-bold text-slate-900">{pod.consignee_name}</p>
                <p className="text-slate-600 text-[9px] leading-tight mt-0.5">{pod.consignee_delivery_address}</p>
                {pod.consignee_gstin && (
                  <p className="text-[9px] font-mono text-slate-600 mt-1">GSTIN: {pod.consignee_gstin}</p>
                )}
              </div>
            </div>

            {/* Shipment Summary Box */}
            <div className="border border-slate-400 rounded p-2.5 mb-2 bg-slate-50">
              <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1.5">
                SHIPMENT &amp; CARGO PARTICULARS
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">ROUTE:</span>
                  <span className="font-bold text-slate-900">{pod.origin} ➔ {pod.destination}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">PACKAGES COUNT:</span>
                  <span className="font-bold text-slate-900">{pod.number_of_packages} Packages</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">TOTAL WEIGHT:</span>
                  <span className="font-bold text-slate-900">{pod.weight_kg} Kg</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">GOODS NATURE:</span>
                  <span className="font-medium text-slate-800">{pod.description_of_goods}</span>
                </div>
              </div>
            </div>

            {/* Delivery Status & Inspection Findings */}
            <div className={`border-2 rounded-lg p-3 mb-2 ${
              isDeliveredInFull
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-amber-600 bg-amber-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block">
                    DESTINATION RECEIVING STATUS:
                  </span>
                  <span className={`text-sm font-black uppercase ${
                    isDeliveredInFull ? 'text-emerald-900' : 'text-amber-900'
                  }`}>
                    {pod.delivery_status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold text-[10px] text-slate-900 shadow-sm inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Goods Received Checked
                  </span>
                </div>
              </div>

              {/* Exception Remarks Details if present */}
              {pod.exception_details && (
                <div className="mt-2 pt-2 border-t border-amber-300 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                  {Number(pod.exception_details.shortage_qty) > 0 && (
                    <div>
                      <span className="text-slate-500 font-bold block">Shortage Count:</span>
                      <span className="font-bold text-red-700">{pod.exception_details.shortage_qty} Units</span>
                    </div>
                  )}
                  {Number(pod.exception_details.damaged_qty) > 0 && (
                    <div>
                      <span className="text-slate-500 font-bold block">Damaged Count:</span>
                      <span className="font-bold text-red-700">{pod.exception_details.damaged_qty} Units</span>
                    </div>
                  )}
                  <div className="sm:col-span-3">
                    <span className="text-slate-500 font-bold block">Exception / Remarks:</span>
                    <p className="text-slate-900 font-medium">{pod.exception_details.remarks || pod.exception_details.damage_description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Receiver Acknowledgement & Signature Matrix */}
            <div className="border-2 border-slate-900 rounded p-3 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Receiver Particulars */}
              <div className="space-y-1 text-[10px]">
                <p className="font-black uppercase text-slate-600 text-[10px] border-b border-slate-200 pb-1 mb-1">
                  RECEIVING REPRESENTATIVE PARTICULARS
                </p>
                <div>
                  <span className="text-slate-500 block text-[9px]">NAME OF RECEIVER:</span>
                  <span className="font-black text-xs text-slate-950">{pod.receiver_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">DESIGNATION / ROLE:</span>
                  <span className="font-bold text-slate-800">{pod.receiver_designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">COMPANY / FACILITY:</span>
                  <span className="font-semibold text-slate-800">{pod.receiver_company_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">CONTACT MOBILE:</span>
                  <span className="font-mono font-bold text-slate-900">{pod.receiver_phone}</span>
                </div>
                <div className="pt-1 text-[8px] text-slate-500">
                  Acknowledgement verified via Jai Bhavani Cargo Driver Delivery Portal
                </div>
              </div>

              {/* Receiver Touchscreen Signature Box */}
              <div className="flex flex-col justify-between border-l border-slate-200 pl-3">
                <div>
                  <p className="font-black uppercase text-slate-600 text-[10px] border-b border-slate-200 pb-1 mb-1">
                    DIGITAL SIGNATURE &amp; STAMP
                  </p>
                  <p className="text-[8px] text-slate-500">Captured on delivery device</p>
                </div>

                <div className="h-24 bg-slate-50 border border-slate-300 rounded flex items-center justify-center p-1 my-1">
                  {pod.receiver_signature_url ? (
                    <img
                      src={pod.receiver_signature_url}
                      alt="Receiver Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[9px]">Physical Sign on Delivery Copy</span>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-400 pt-0.5 text-center">
                  <p className="text-[9px] font-bold text-slate-900">{pod.receiver_name}</p>
                  <p className="text-[8px] text-slate-500">Authorized Consignee Signature</p>
                </div>
              </div>
            </div>

            {/* Attached Delivery Documents / Photographs */}
            {pod.attachments && pod.attachments.length > 0 && (
              <div className="border border-slate-300 rounded p-2 mb-2">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-200 pb-1 mb-2">
                  UPLOADED DELIVERY DOCUMENT PROOF ({pod.attachments.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {pod.attachments.map((att) => (
                    <div key={att.id} className="border border-slate-200 rounded p-1 bg-slate-50">
                      {att.file_type.startsWith('image/') ? (
                        <img
                          src={att.data_url}
                          alt={att.name}
                          className="w-full h-24 object-cover rounded mb-1 border border-slate-200"
                        />
                      ) : (
                        <div className="w-full h-24 bg-slate-200 rounded flex items-center justify-center mb-1">
                          <span className="font-mono text-[9px] font-bold text-slate-700">PDF DOCUMENT</span>
                        </div>
                      )}
                      <p className="text-[8px] font-mono text-slate-700 truncate">{att.name}</p>
                      <a
                        href={att.data_url}
                        download={att.name}
                        className="text-[8px] text-orange-700 font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <Download className="w-2.5 h-2.5" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="text-center text-[8px] text-slate-500 border-t border-slate-200 pt-1.5 mt-2">
              Official Proof of Delivery (POD) archived in Jai Bhavani Cargo ERP. Verified for client billing cycle &amp; settlement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
