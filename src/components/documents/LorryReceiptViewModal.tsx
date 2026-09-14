import React, { useRef } from 'react';
import { X, Printer, Download, Share2, Edit, FileCheck, Shield, AlertTriangle, Building, Truck, History } from 'lucide-react';
import { LorryReceipt } from '../../types';
import { dbtabeses } from '../../db/store';
import { generateQrSvg } from '../../services/qrCodeService';
import { documentPrintService } from '../../services/documentPrintService';
import { auditLogService } from '../../services/auditLogService';

interface Props {
  lr: LorryReceipt;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (lr: LorryReceipt) => void;
  onGeneratePod?: (lr: LorryReceipt) => void;
  onViewAudit?: (lr: LorryReceipt) => void;
  onStatusChange?: (updated: LorryReceipt) => void;
}

export const LorryReceiptViewModal: React.FC<Props> = ({
  lr,
  isOpen,
  onClose,
  onEdit,
  onGeneratePod,
  onViewAudit,
  onStatusChange
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const company = dbtabeses.getCompanySettings();

  if (!isOpen) return null;

  // Origin URL for verification link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.jaibhavanicargo.com';
  const verificationUrl = `${origin}/verify/lr/${lr.secure_token}`;
  const qrSvg = generateQrSvg(verificationUrl, 115, '#0f172a', '#ffffff');

  const handlePrint = () => {
    if (!printableRef.current) return;
    documentPrintService.printDocument(`LR_${lr.lr_number.replace(/\//g, '_')}`, printableRef.current.innerHTML);
    auditLogService.logAction({
      document_type: 'LR',
      document_id: lr.id,
      document_number: lr.lr_number,
      action: 'Downloaded',
      details: 'Printed / exported Lorry Receipt A4 copy'
    });
  };

  const handleWhatsAppShare = () => {
    const routeStr = `${lr.route_details.origin} to ${lr.route_details.destination}`;
    const targetPhone = lr.consignee?.phone || lr.consignor?.phone || '';
    const shareUrl = documentPrintService.getWhatsAppShareUrl({
      recipientPhone: targetPhone,
      documentType: 'LR',
      documentNumber: lr.lr_number,
      tripNumber: lr.trip_number,
      clientName: lr.client_name,
      vehicleNumber: lr.vehicle_details.vehicle_number,
      route: routeStr,
      status: lr.status,
      verificationUrl
    });
    window.open(shareUrl, '_blank');
    auditLogService.logAction({
      document_type: 'LR',
      document_id: lr.id,
      document_number: lr.lr_number,
      action: 'Shared',
      details: `Shared Lorry Receipt via WhatsApp with verification link`
    });
  };

  const handleCancelLr = () => {
    if (!window.confirm(`Are you sure you want to cancel LR ${lr.lr_number}? This action will be audited.`)) return;
    const lrs = dbtabeses.getLorryReceipts();
    const idx = lrs.findIndex(l => l.id === lr.id);
    if (idx !== -1) {
      const updated: LorryReceipt = { ...lrs[idx], status: 'Cancelled', updated_at: new Date().toISOString() };
      lrs[idx] = updated;
      dbtabeses.setLorryReceipts(lrs);
      auditLogService.logAction({
        document_type: 'LR',
        document_id: lr.id,
        document_number: lr.lr_number,
        action: 'Cancelled',
        details: 'Cancelled Lorry Receipt by admin'
      });
      onStatusChange?.(updated);
    }
  };

  const totalPackages = (lr.goods_items || []).reduce((sum, g) => sum + (Number(g.package_count) || 0), 0);
  const totalActualWeight = (lr.goods_items || []).reduce((sum, g) => sum + (Number(g.actual_weight_kg) || 0), 0);
  const totalChargedWeight = (lr.goods_items || []).reduce((sum, g) => sum + (Number(g.charged_weight_kg) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg">
              {lr.lr_number}
            </span>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
              lr.status === 'Generated' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              lr.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {lr.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-950/30 transition cursor-pointer"
              title="Print A4 Lorry Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {onEdit && lr.status !== 'Cancelled' && (
              <button
                onClick={() => onEdit(lr)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onGeneratePod && !lr.pod_id && lr.status === 'Generated' && (
              <button
                onClick={() => onGeneratePod(lr)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Capture POD</span>
              </button>
            )}

            {onViewAudit && (
              <button
                onClick={() => onViewAudit(lr)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title="View Audit Trail"
              >
                <History className="w-4 h-4" />
              </button>
            )}

            {lr.status !== 'Cancelled' && (
              <button
                onClick={handleCancelLr}
                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-semibold rounded-xl text-xs transition"
                title="Cancel this Lorry Receipt"
              >
                Cancel
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

        {/* Scrollable Printable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-950 flex justify-center">
          <div
            ref={printableRef}
            className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl p-6 sm:p-8 rounded-lg text-xs leading-tight font-sans"
            style={{ minHeight: '270mm', color: '#0f172a' }}
          >
            {/* Header: Company & Logo */}
            <div className="border-2 border-slate-900 rounded-lg p-3 mb-2">
              <div className="flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={company.logo_url || '/logo.png'}
                    alt="Jai Bhavani Cargo Logo"
                    className="w-16 h-16 object-contain rounded border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
                      {company.company_name || 'JAI BHAVANI CARGO'}
                    </h1>
                    <p className="text-[10px] sm:text-xs font-semibold text-orange-700 uppercase tracking-widest">
                      {company.tagline || 'Goods Transport Operators & Fleet Contractors'}
                    </p>
                    <p className="text-[10px] text-slate-700 mt-0.5 max-w-md leading-relaxed">
                      {company.company_address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="bg-slate-950 text-white font-mono px-3 py-1 rounded text-right font-black text-sm uppercase tracking-wider">
                    LORRY RECEIPT
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">CONSIGNMENT NOTE</p>
                  <p className="text-[10px] font-mono font-bold text-slate-900 mt-0.5">
                    GSTIN: <span className="font-extrabold">{company.company_gstin}</span>
                  </p>
                  <p className="text-[9px] text-slate-600">Ph: {company.company_phone}</p>
                  <p className="text-[9px] text-slate-600">{company.company_website}</p>
                </div>
              </div>

              {/* Identification Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px]">
                <div>
                  <span className="text-slate-500 font-bold block">LR NUMBER:</span>
                  <span className="font-mono font-black text-sm text-orange-700">{lr.lr_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">LR / BOOKING DATE:</span>
                  <span className="font-semibold text-slate-900">{lr.lr_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">E-WAY BILL NO:</span>
                  <span className="font-mono font-bold text-slate-900">{lr.eway_bill_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">TRIP REFERENCE:</span>
                  <span className="font-mono font-bold text-slate-900">{lr.trip_number}</span>
                </div>
              </div>
            </div>

            {/* Vehicle, Driver & Route Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              {/* Vehicle Box */}
              <div className="border border-slate-400 rounded p-2 bg-slate-50">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  VEHICLE DETAILS
                </p>
                <p className="text-xs font-mono font-black text-slate-900">{lr.vehicle_details.vehicle_number}</p>
                <p className="text-[10px] text-slate-700 mt-0.5">{lr.vehicle_details.vehicle_type}</p>
                {lr.vehicle_details.vehicle_model && (
                  <p className="text-[9px] text-slate-500">Model: {lr.vehicle_details.vehicle_model}</p>
                )}
                <div className="mt-1.5 pt-1 border-t border-slate-200">
                  <span className="text-[9px] text-slate-500 block">DRIVER:</span>
                  <span className="font-bold text-[10px] text-slate-900">{lr.vehicle_details.driver_name}</span>
                  <span className="text-[9px] text-slate-600 font-mono block">{lr.vehicle_details.driver_phone}</span>
                </div>
              </div>

              {/* Consignor Box */}
              <div className="border border-slate-400 rounded p-2">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  CONSIGNOR (FROM)
                </p>
                <p className="font-bold text-[11px] text-slate-900">{lr.consignor.name}</p>
                <p className="text-[10px] text-slate-700 leading-tight mt-0.5">{lr.consignor.address}</p>
                <p className="text-[9px] font-mono text-slate-600 mt-1">
                  GSTIN: <b>{lr.consignor.gstin || 'Unregistered'}</b>
                </p>
                <p className="text-[9px] text-slate-600">Ph: {lr.consignor.phone}</p>
              </div>

              {/* Consignee Box */}
              <div className="border border-slate-400 rounded p-2">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  CONSIGNEE (TO)
                </p>
                <p className="font-bold text-[11px] text-slate-900">{lr.consignee.name}</p>
                <p className="text-[10px] text-slate-700 leading-tight mt-0.5">{lr.consignee.delivery_address}</p>
                <p className="text-[9px] font-mono text-slate-600 mt-1">
                  GSTIN: <b>{lr.consignee.gstin || 'Unregistered'}</b>
                </p>
                <p className="text-[9px] text-slate-600">Ph: {lr.consignee.phone}</p>
              </div>
            </div>

            {/* Route Strip */}
            <div className="bg-slate-100 border border-slate-300 rounded p-2 mb-2 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-slate-500 font-bold block">ORIGIN & PICKUP:</span>
                <span className="font-bold text-slate-900">{lr.route_details.origin}</span>
                <span className="text-slate-600 block text-[9px]">{lr.route_details.pickup_location}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-orange-700 font-black text-base">➔</span>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">DIRECT TRANSIT</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-bold block">DESTINATION & DELIVERY:</span>
                <span className="font-bold text-slate-900">{lr.route_details.destination}</span>
                <span className="text-slate-600 block text-[9px]">{lr.route_details.delivery_location}</span>
              </div>
            </div>

            {/* Goods Details Table */}
            <div className="mb-2 border border-slate-400 rounded overflow-hidden">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[9px]">
                    <th className="p-1.5 border-b border-r border-slate-300 w-10 text-center">#</th>
                    <th className="p-1.5 border-b border-r border-slate-300 w-16 text-center">Pkgs</th>
                    <th className="p-1.5 border-b border-r border-slate-300 w-24">Pkg Type</th>
                    <th className="p-1.5 border-b border-r border-slate-300">Description of Goods</th>
                    <th className="p-1.5 border-b border-r border-slate-300 w-20 text-right">Actual Wt (Kg)</th>
                    <th className="p-1.5 border-b border-r border-slate-300 w-20 text-right">Charged Wt</th>
                    <th className="p-1.5 border-b border-slate-300 w-28">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(lr.goods_items || []).map((item, i) => (
                    <tr key={item.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-1.5 border-b border-r border-slate-200 text-center font-mono">{i + 1}</td>
                      <td className="p-1.5 border-b border-r border-slate-200 text-center font-bold">{item.package_count}</td>
                      <td className="p-1.5 border-b border-r border-slate-200">{item.package_type}</td>
                      <td className="p-1.5 border-b border-r border-slate-200 font-medium">{item.description}</td>
                      <td className="p-1.5 border-b border-r border-slate-200 text-right font-mono">{item.actual_weight_kg}</td>
                      <td className="p-1.5 border-b border-r border-slate-200 text-right font-mono font-bold">{item.charged_weight_kg}</td>
                      <td className="p-1.5 border-b border-slate-200 text-[9px] text-slate-600">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="p-1.5 border-t border-r border-slate-400 text-center" colSpan={1}>TOTAL</td>
                    <td className="p-1.5 border-t border-r border-slate-400 text-center">{totalPackages}</td>
                    <td className="p-1.5 border-t border-r border-slate-400" colSpan={2}>Goods Received in Sound Condition</td>
                    <td className="p-1.5 border-t border-r border-slate-400 text-right font-mono">{totalActualWeight} Kg</td>
                    <td className="p-1.5 border-t border-r border-slate-400 text-right font-mono text-orange-800">{totalChargedWeight} Kg</td>
                    <td className="p-1.5 border-t border-slate-400 text-[9px]">O.R. (Owner's Risk)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Freight Breakup & QR Code Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              {/* QR Verification Box */}
              <div className="border border-slate-400 rounded p-2 flex flex-col items-center justify-center text-center bg-slate-50">
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">SCAN FOR SECURE TRACKING</p>
                <div
                  className="p-1 bg-white border border-slate-300 rounded shadow-sm"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="text-[8px] font-mono text-slate-500 mt-1 break-all">Token: {lr.secure_token.slice(0, 16)}...</p>
                <p className="text-[8px] text-emerald-700 font-bold mt-0.5">● Official Authenticity Verified</p>
              </div>

              {/* Payment Basis Box */}
              <div className="border border-slate-400 rounded p-2 text-[10px] space-y-1.5">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1">
                  PAYMENT &amp; BILLING TERMS
                </p>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">FREIGHT BASIS:</span>
                  <span className="px-2 py-0.5 rounded font-black text-xs inline-block bg-orange-100 text-orange-800 border border-orange-300">
                    {lr.freight_details.payment_basis}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">PAYMENT TERMS:</span>
                  <span className="font-semibold text-slate-800">{lr.freight_details.payment_terms || 'Standard Contract'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold">INVOICE / CLIENT REF:</span>
                  <span className="font-mono text-slate-800">{lr.invoice_number || lr.customer_ref_number || 'TRIP-' + lr.trip_number}</span>
                </div>
                <div className="pt-1 text-[8px] text-slate-500">
                  Bank: {company.bank_name} | A/C: {company.account_number} | IFSC: {company.ifsc_code}
                </div>
              </div>

              {/* Freight Calculation Box */}
              <div className="border border-slate-400 rounded p-2 text-[10px] bg-slate-50">
                <p className="font-black text-[10px] uppercase text-slate-600 border-b border-slate-300 pb-1 mb-1">
                  FREIGHT CHARGES BREAKUP
                </p>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Freight:</span>
                    <span className="font-mono font-medium">₹{Number(lr.freight_details.freight_amount || 0).toFixed(2)}</span>
                  </div>
                  {Number(lr.freight_details.loading_charges || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Loading Charges:</span>
                      <span className="font-mono">₹{Number(lr.freight_details.loading_charges).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(lr.freight_details.unloading_charges || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Unloading Charges:</span>
                      <span className="font-mono">₹{Number(lr.freight_details.unloading_charges).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(lr.freight_details.detention_charges || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Detention / Halting:</span>
                      <span className="font-mono">₹{Number(lr.freight_details.detention_charges).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(lr.freight_details.other_charges || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Other Surcharges:</span>
                      <span className="font-mono">₹{Number(lr.freight_details.other_charges).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(lr.freight_details.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{Number(lr.freight_details.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t border-slate-300 pt-0.5">
                    <span>Taxable Amount:</span>
                    <span className="font-mono">₹{Number(lr.freight_details.taxable_amount || 0).toFixed(2)}</span>
                  </div>
                  {(Number(lr.freight_details.cgst) > 0 || Number(lr.freight_details.sgst) > 0) && (
                    <>
                      <div className="flex justify-between text-[9px] text-slate-600">
                        <span>CGST (2.5%):</span>
                        <span className="font-mono">₹{Number(lr.freight_details.cgst || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-600">
                        <span>SGST (2.5%):</span>
                        <span className="font-mono">₹{Number(lr.freight_details.sgst || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {Number(lr.freight_details.igst) > 0 && (
                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>IGST (5.0%):</span>
                      <span className="font-mono">₹{Number(lr.freight_details.igst || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs border-t-2 border-slate-900 pt-1 text-slate-950">
                    <span>TOTAL FREIGHT:</span>
                    <span className="font-mono text-orange-800">₹{Number(lr.freight_details.total_freight || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration & Terms Box */}
            <div className="border border-slate-400 rounded p-2 mb-2 bg-slate-50 text-[8.5px] leading-tight text-slate-700">
              <p className="font-bold uppercase text-[9px] text-slate-900 mb-0.5">
                DECLARATION BY CONSIGNOR &amp; TERMS OF CARRIAGE:
              </p>
              <p className="whitespace-pre-line text-justify">
                {lr.declaration_terms || company.lr_default_terms}
              </p>
            </div>

            {/* Three Signature Boxes */}
            <div className="grid grid-cols-3 gap-2 border-2 border-slate-900 rounded p-2">
              <div className="flex flex-col justify-between h-20 border-r border-slate-300 pr-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Consignor Signature &amp; Stamp</p>
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="text-[9px] font-semibold text-slate-700">Authorised Signatory of Consignor</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-20 border-r border-slate-300 pr-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Driver Signature</p>
                <div className="border-t border-dashed border-slate-400 pt-1 text-center">
                  <p className="text-[9px] font-semibold text-slate-800">{lr.vehicle_details.driver_name}</p>
                  <p className="text-[8px] text-slate-500">I have received the cargo in sound condition</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-20 pl-1 text-right">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">For Jai Bhavani Cargo</p>
                  <p className="text-[8px] text-slate-400 font-mono">Date: {lr.lr_date}</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-right">
                  <p className="text-[10px] font-black text-slate-950">Jai Bhavani Cargo</p>
                  <p className="text-[8px] font-bold text-orange-700 uppercase">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-2 text-center text-[8px] text-slate-500 border-t border-slate-200 pt-1">
              This Lorry Receipt is generated electronically by Jai Bhavani Cargo ERP. Scan the QR code or verify at {company.company_website}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
