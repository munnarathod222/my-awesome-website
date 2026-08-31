import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Wrench, Truck, CheckCircle2, QrCode } from 'lucide-react';
import { getCompanyProfileSync } from '@/lib/companyProfile.js';

export default function PrintableJobCardModal({ isOpen, onClose, jobCard }) {
  const printRef = useRef(null);
  const company = getCompanyProfileSync();

  if (!jobCard) return null;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Workshop Job Card - ${jobCard.job_card_number}</title>
          <style>
            @media print {
              @page { size: A4; margin: 12mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; background: #fff; margin: 0; padding: 0; }
              .no-print { display: none !important; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background: #fff; padding: 20px; font-size: 12px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border-b: 2px solid #0f172a; padding-bottom: 10px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .table-custom { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table-custom th { background: #0f172a; color: #fff; padding: 8px; font-size: 11px; text-align: left; text-transform: uppercase; }
            .table-custom td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .totals-box { margin-top: 15px; text-align: right; font-size: 13px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 10px; }
            .signature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 50px; text-align: center; }
            .sig-line { border-top: 1px dashed #64748b; padding-top: 5px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const items = Array.isArray(jobCard.itemized_items) ? jobCard.itemized_items : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> Official Workshop Job Card Preview
            </span>
            <Button size="sm" onClick={handlePrint} className="rounded-xl font-bold bg-primary text-primary-foreground">
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Document Container */}
        <div ref={printRef} className="p-6 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm text-xs font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <h1 className="text-xl font-black uppercase text-slate-900 tracking-wide">{company?.company_name || 'JAI BHAVANI CARGO'}</h1>
              <p className="text-[11px] text-slate-600 font-semibold">Fleet Logistics &amp; Transport Services</p>
              <p className="text-[10px] text-slate-500 max-w-sm mt-0.5">{company?.company_address}</p>
              <p className="text-[10px] text-slate-500">GSTIN: <strong>{company?.company_gstin}</strong> | Call: {company?.company_phone}</p>
            </div>
            <div className="text-right">
              <span className="bg-slate-900 text-white font-mono font-black text-xs px-3 py-1 rounded-md inline-block mb-1">
                WORKSHOP JOB CARD
              </span>
              <p className="font-mono text-sm font-bold text-blue-700">{jobCard.job_card_number}</p>
              <p className="text-[10px] text-slate-500">Date: {jobCard.entry_date ? new Date(jobCard.entry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
            </div>
          </div>

          {/* Vehicle & Service Meta Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Vehicle Truck No</span>
              <strong className="text-sm font-extrabold font-mono text-slate-900">{jobCard.truck_number}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Driver Name</span>
              <strong className="text-xs font-bold text-slate-800">{jobCard.driver_name || 'Unassigned'}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Odometer Reading</span>
              <strong className="text-xs font-bold font-mono text-slate-800">{jobCard.odometer_reading ? `${Number(jobCard.odometer_reading).toLocaleString()} KM` : '—'}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Service Type</span>
              <strong className="text-xs font-bold text-blue-700">{jobCard.service_type || 'General Workshop Repair'}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Mechanic</span>
              <strong className="text-xs font-bold text-slate-800">{jobCard.assigned_mechanic || 'Staff Mechanic'}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Job Card Status</span>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-200 text-slate-800">
                {jobCard.status || 'Created'}
              </span>
            </div>
          </div>

          {/* Customer / Driver Complaints Reported */}
          {jobCard.complaints_list && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase block mb-1">📋 Reported Complaints &amp; Service Request:</span>
              <p className="text-xs text-amber-900 font-medium whitespace-pre-wrap">{jobCard.complaints_list}</p>
            </div>
          )}

          {/* Itemized Parts & Labour Breakdown */}
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 mb-2">Itemized Spare Parts &amp; Labour Billing</h3>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase">
                <th className="p-2 text-left w-[40px]">#</th>
                <th className="p-2 text-left">Description / Spare Part</th>
                <th className="p-2 text-center w-[80px]">Type</th>
                <th className="p-2 text-center w-[60px]">Qty</th>
                <th className="p-2 text-right w-[100px]">Rate (₹)</th>
                <th className="p-2 text-right w-[110px]">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 italic">No spare parts or labour charges logged yet.</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 text-xs">
                    <td className="p-2 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-800">{item.description || item.part_name || 'Repair Service'}</td>
                    <td className="p-2 text-center text-slate-600 font-semibold capitalize">{item.type || 'part'}</td>
                    <td className="p-2 text-center font-mono font-bold">{item.qty || 1}</td>
                    <td className="p-2 text-right font-mono text-slate-700">₹{Number(item.unit_price || 0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">₹{Number(item.amount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Financial Summary */}
          <div className="flex justify-between items-start pt-2 border-t-2 border-slate-900">
            <div className="text-[10px] text-slate-500 max-w-xs">
              <p className="font-bold text-slate-700 mb-1">Notes / Instructions:</p>
              <p>{jobCard.notes || 'All replaced spare parts tested for quality. Vehicle road-tested prior to release.'}</p>
            </div>
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Spare Parts Total:</span>
                <span className="font-mono font-bold">₹{Number(jobCard.parts_cost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Labour Charges:</span>
                <span className="font-mono font-bold">₹{Number(jobCard.labour_cost || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(jobCard.tax_amount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax Amount:</span>
                  <span className="font-mono font-bold">₹{Number(jobCard.tax_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-900">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-blue-800">₹{Number(jobCard.total_cost || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-10 mt-12 pt-4">
            <div className="text-center border-t border-dashed border-slate-400 pt-1.5 font-bold text-[11px] text-slate-700">
              Workshop Lead Mechanic / Supervisor Sign
            </div>
            <div className="text-center border-t border-dashed border-slate-400 pt-1.5 font-bold text-[11px] text-slate-700">
              Driver / Fleet Manager Release Sign
            </div>
          </div>

        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Close</Button>
          <Button onClick={handlePrint} className="rounded-xl font-bold bg-primary text-primary-foreground">
            <Printer className="w-4 h-4 mr-1.5" /> Print Job Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
