import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Receipt, CheckCircle2, Clock, DollarSign, Download, Share2, 
  Building2, Truck, User, ArrowRight, ShieldCheck, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { format } from 'date-fns';

export default function VendorSettlementModal({ isOpen, onClose, trip, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);

  const [settlementUtr, setSettlementUtr] = useState('');
  const [settlementDate, setSettlementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tdsRate, setTdsRate] = useState(1); // 1% for individual, 2% for company
  const [fuelDeduction, setFuelDeduction] = useState('');
  const [detentionCharges, setDetentionCharges] = useState('');
  const [penalties, setPenalties] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && trip) {
      loadSettlement();
    }
  }, [isOpen, trip]);

  const loadSettlement = async () => {
    setLoading(true);
    try {
      const tripId = trip.id || trip.trip_id;
      let settlementData = null;

      try {
        const res = await apiServerClient.fetch(`/api/trips/${tripId}/vendor-settlement`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) settlementData = json;
        }
      } catch (e) {
        console.warn('API settlement fetch notice, calculating locally:', e.message);
      }

      if (!settlementData) {
        const rev = Number(trip.revenue) || 0;
        const payout = Number(trip.vendor_payout) || (trip.ownership_type === 'AttachedFamily' ? rev : Math.max(0, rev - 500));
        const cashAdv = Number(trip.advance_paid_to_driver) || 0;
        const tollDed = Number(trip.toll_deduction) || 0;
        const fuelDed = Number(trip.fuel_advance_deduction) || 0;
        const defaultTds = trip.vendor_tds_rate !== undefined ? Number(trip.vendor_tds_rate) : 1;
        const tdsAmt = (payout * defaultTds) / 100;
        const det = Number(trip.detention_charges) || 0;
        const pen = Number(trip.penalties) || 0;

        settlementData = {
          trip_id: trip.trip_id || trip.id,
          date: trip.date,
          route: trip.route,
          truck_number: trip.truck_number,
          driver_name: trip.driver_name,
          ownership_type: trip.ownership_type || 'Attached',
          payment_model: trip.payment_model || 'Model2',
          gross_customer_revenue: rev,
          gross_vendor_payout: payout,
          jbc_margin: rev - payout,
          jbc_margin_percent: rev > 0 ? Number((((rev - payout) / rev) * 100).toFixed(1)) : 0,
          deductions: {
            cash_advance: cashAdv,
            fuel_advance: fuelDed,
            toll_deduction: tollDed,
            tds_rate: defaultTds,
            tds_amount: tdsAmt,
            penalties: pen,
            detention_addition: det
          },
          net_vendor_payable: Math.max(0, payout - cashAdv - tollDed - fuelDed - tdsAmt - pen + det),
          pod_status: trip.pod_status || 'Pending',
          settlement_status: trip.settlement_status || (trip.pod_status === 'Verified' ? 'Ready for Settlement' : 'Pending POD'),
          settlement_utr: trip.settlement_utr || '',
          settlement_date: trip.settlement_date || format(new Date(), 'yyyy-MM-dd')
        };
      }

      setData(settlementData);
      setSettlementUtr(settlementData.settlement_utr || '');
      setSettlementDate(settlementData.settlement_date || format(new Date(), 'yyyy-MM-dd'));
      setTdsRate(settlementData.deductions?.tds_rate ?? 1);
      setFuelDeduction(settlementData.deductions?.fuel_advance?.toString() || '');
      setDetentionCharges(settlementData.deductions?.detention_addition?.toString() || '');
      setPenalties(settlementData.deductions?.penalties?.toString() || '');
      setNotes(trip.settlement_notes || '');
    } catch (err) {
      console.error('Failed to load settlement:', err);
      toast.error('Failed to calculate vendor settlement');
    } finally {
      setLoading(false);
    }
  };

  // Recompute live amounts based on input changes
  const grossPayout = Number(data?.gross_vendor_payout) || 0;
  const cashAdv = Number(data?.deductions?.cash_advance) || 0;
  const tollDed = Number(data?.deductions?.toll_deduction) || 0;
  const fuelDed = parseFloat(fuelDeduction) || 0;
  const pen = parseFloat(penalties) || 0;
  const det = parseFloat(detentionCharges) || 0;
  const tdsAmt = (grossPayout * (Number(tdsRate) || 0)) / 100;
  const computedNetPayable = Math.max(0, grossPayout - cashAdv - tollDed - fuelDed - tdsAmt - pen + det);

  const handleConfirmSettlement = async () => {
    if (!settlementUtr) {
      toast.error('Please enter the Bank UTR / Payment Reference number.');
      return;
    }

    setSaving(true);
    try {
      const tripId = trip.id || trip.trip_id;
      const payload = {
        settlement_status: 'Settled',
        settlement_utr: settlementUtr.trim().toUpperCase(),
        settlement_date: settlementDate,
        fuel_advance_deduction: fuelDed,
        detention_charges: det,
        penalties: pen,
        vendor_tds_rate: Number(tdsRate) || 0,
        settlement_notes: notes.trim()
      };

      try {
        await apiServerClient.fetch(`/api/trips/${tripId}/vendor-settlement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (apiErr) {
        await pb.collection('trip_logs').update(trip.id, payload, { $autoCancel: false });
      }

      toast.success(`Settlement confirmed! UTR: ${payload.settlement_utr}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Settlement confirmation error:', err);
      toast.error('Failed to record settlement: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const generatePDFVoucher = () => {
    try {
      const doc = new jsPDF();
      const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');

      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text('JAI BHAVANI CARGO', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont(undefined, 'normal');
      doc.text('Fleet Owner & Subcontractor Trip Settlement Voucher', 14, 28);
      doc.text(`Voucher Date: ${format(new Date(), 'dd MMM yyyy')}`, 14, 34);

      // Status pill
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(150, 14, 46, 12, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text(data?.settlement_status === 'Settled' ? 'SETTLED' : 'PROVISIONAL', 158, 22);

      // Trip Information Card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 38, 3, 3, 'F');
      doc.roundedRect(14, 48, 182, 38, 3, 3, 'S');

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('TRIP DETAILS', 20, 56);

      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Trip ID: ${data?.trip_id || 'N/A'}`, 20, 64);
      doc.text(`Vehicle No: ${data?.truck_number || 'N/A'}`, 20, 72);
      doc.text(`Route: ${data?.route || 'N/A'}`, 20, 80);

      doc.text(`Date: ${data?.date ? format(new Date(data.date), 'dd MMM yyyy') : 'N/A'}`, 110, 64);
      doc.text(`Driver: ${data?.driver_name || 'N/A'}`, 110, 72);
      doc.text(`POD Status: ${data?.pod_status || 'Verified'}`, 110, 80);

      // Financial Itemized Breakdown Table
      const tableRows = [
        ['1', 'Agreed Gross Freight Payable', fmt(grossPayout)],
        ['2', 'Less: Loading Cash Advance Paid', `-${fmt(cashAdv)}`],
        ['3', 'Less: Diesel / Fuel Slips Issued', `-${fmt(fuelDed)}`],
        ['4', 'Less: Fastag Toll Recharges / Deductions', `-${fmt(tollDed)}`],
        ['5', `Less: TDS Deducted (Sec 194C @ ${tdsRate}%)`, `-${fmt(tdsAmt)}`],
        ['6', 'Less: Penalties / Cargo Shortage (if any)', `-${fmt(pen)}`],
        ['7', 'Plus: Approved Detention Allowance', `+${fmt(det)}`],
        ['', 'NET VENDOR PAYOUT AMOUNT', fmt(computedNetPayable)]
      ];

      doc.autoTable({
        startY: 94,
        head: [['#', 'Financial Description', 'Amount (INR)']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 125 },
          2: { cellWidth: 42, halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (dataCell) => {
          if (dataCell.row.index === 7) {
            dataCell.cell.styles.fillColor = [220, 252, 231];
            dataCell.cell.styles.textColor = [5, 150, 105];
            dataCell.cell.styles.fontStyle = 'bold';
            dataCell.cell.styles.fontSize = 11;
          }
        }
      });

      // Settlement Payment Info
      const finalY = doc.lastAutoTable.finalY + 12;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, finalY, 182, 32, 3, 3, 'F');
      doc.roundedRect(14, finalY, 182, 32, 3, 3, 'S');

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('BANK SETTLEMENT DETAILS', 20, finalY + 8);

      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, 'bold');
      doc.text(`Bank UTR / Ref: ${settlementUtr || 'PENDING DISBURSAL'}`, 20, finalY + 16);
      doc.text(`Settlement Date: ${settlementDate}`, 20, finalY + 24);

      doc.text(`Carrier: JAI BHAVANI CARGO`, 110, finalY + 16);
      doc.text(`Status: ${data?.settlement_status === 'Settled' ? 'PAID & CLOSED' : 'AWAITING UTR'}`, 110, finalY + 24);

      // Signatures
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Prepared by JBC Accounts Desk', 20, finalY + 48);
      doc.text('Authorized Signatory (Jai Bhavani Cargo)', 120, finalY + 48);

      doc.save(`JBC_Settlement_Voucher_${data?.trip_id || 'Trip'}.pdf`);
      toast.success('Settlement voucher PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF voucher');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*JAI BHAVANI CARGO - TRIP SETTLEMENT VOUCHER*\n\n` +
      `*Trip ID:* ${data?.trip_id}\n` +
      `*Truck No:* ${data?.truck_number}\n` +
      `*Route:* ${data?.route}\n` +
      `*Loading Date:* ${data?.date}\n\n` +
      `*FINANCIAL BREAKDOWN:*\n` +
      `• Gross Freight: Rs. ${grossPayout.toLocaleString('en-IN')}\n` +
      `• Cash Advance: -Rs. ${cashAdv.toLocaleString('en-IN')}\n` +
      `• Diesel Deducted: -Rs. ${fuelDed.toLocaleString('en-IN')}\n` +
      `• Toll / Fastag: -Rs. ${tollDed.toLocaleString('en-IN')}\n` +
      `• TDS (${tdsRate}%): -Rs. ${tdsAmt.toLocaleString('en-IN')}\n` +
      (pen > 0 ? `• Penalties: -Rs. ${pen.toLocaleString('en-IN')}\n` : '') +
      (det > 0 ? `• Detention Added: +Rs. ${det.toLocaleString('en-IN')}\n` : '') +
      `---------------------------------\n` +
      `*NET PAYABLE TO OWNER:* *Rs. ${computedNetPayable.toLocaleString('en-IN')}*\n` +
      `---------------------------------\n` +
      (settlementUtr ? `*Bank UTR:* ${settlementUtr}\n*Settlement Date:* ${settlementDate}\n` : `*Status:* Ready for bank settlement\n`) +
      `\nFor any queries, contact Jai Bhavani Logistics Desk: +91 7794072244`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 text-white border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-mono tracking-tight flex items-center gap-2">
                  <span>Vendor Trip Settlement</span>
                  <Badge className={data?.settlement_status === 'Settled' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}>
                    {data?.settlement_status || 'Pending POD'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  {trip?.trip_id} • {trip?.truck_number} • {trip?.route}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={generatePDFVoucher} className="h-8 border-slate-700 bg-slate-900 text-xs gap-1.5 text-slate-200">
                <Download className="w-3.5 h-3.5" /> PDF
              </Button>
              <Button size="sm" variant="outline" onClick={handleShareWhatsApp} className="h-8 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Computing itemized settlement breakdown...</p>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {/* Top Stat Cards: Customer Freight vs Vendor Freight vs JBC Margin */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Customer Revenue</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  ₹{(Number(data?.gross_customer_revenue) || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Agreed Vendor Payout</span>
                <span className="text-sm font-bold font-mono text-blue-400">
                  ₹{grossPayout.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
                <span className="text-[10px] text-emerald-400 uppercase block font-semibold">JBC Net Margin</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ₹{(Number(data?.jbc_margin) || 0).toLocaleString('en-IN')} ({data?.jbc_margin_percent || 0}%)
                </span>
              </div>
            </div>

            {/* Deductions & Additions Form Table */}
            <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Itemized Settlement Waterfall
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">1. Agreed Gross Freight:</span>
                  <span className="text-slate-100 font-bold">₹{grossPayout.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <span>2. Less: Cash Advance to Driver:</span>
                  </span>
                  <span>-₹{cashAdv.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <span>3. Less: Fastag Toll Deduction:</span>
                  </span>
                  <span>-₹{tollDed.toLocaleString('en-IN')}</span>
                </div>

                {/* Editable Fuel Advance */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-rose-400">4. Less: Diesel Slips / Fuel Advance:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-rose-400">-₹</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={fuelDeduction}
                      onChange={e => setFuelDeduction(e.target.value)}
                      className="h-7 w-28 bg-slate-950 border-slate-800 text-xs font-mono text-right text-rose-400"
                    />
                  </div>
                </div>

                {/* Editable TDS */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-rose-400">5. Less: TDS Deduction (Sec 194C):</span>
                  <div className="flex items-center gap-2">
                    <Select value={tdsRate.toString()} onValueChange={v => setTdsRate(Number(v))}>
                      <SelectTrigger className="h-7 w-24 bg-slate-950 border-slate-800 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-xs text-white">
                        <SelectItem value="1">1% (Indiv)</SelectItem>
                        <SelectItem value="2">2% (Firm)</SelectItem>
                        <SelectItem value="0">0% (15G/H)</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-rose-400 font-bold">-₹{tdsAmt.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Editable Penalties & Detention */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-[10px] text-slate-400 uppercase">Penalties / Shortage (-₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={penalties}
                      onChange={e => setPenalties(e.target.value)}
                      className="h-7 bg-slate-950 border-slate-800 text-xs font-mono text-rose-400 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-400 uppercase">Approved Detention (+₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={detentionCharges}
                      onChange={e => setDetentionCharges(e.target.value)}
                      className="h-7 bg-slate-950 border-slate-800 text-xs font-mono text-emerald-400 mt-1"
                    />
                  </div>
                </div>

                {/* Final Net Payable Banner */}
                <div className="p-3 mt-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-emerald-400 block font-sans">
                      Net Amount Payable to Fleet Owner
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Final disbursement amount after all operating deductions
                    </span>
                  </div>
                  <span className="text-xl font-extrabold font-mono text-emerald-400">
                    ₹{computedNetPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Payment Confirmation Form */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Disbursement & Bank UTR Confirmation
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Bank UTR / IMPS Reference <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. AXISN20261112001"
                    value={settlementUtr}
                    onChange={e => setSettlementUtr(e.target.value.toUpperCase())}
                    className="h-8 bg-slate-950 border-slate-800 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Settlement Date</Label>
                  <Input
                    type="date"
                    value={settlementDate}
                    onChange={e => setSettlementDate(e.target.value)}
                    className="h-8 bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Notes / Bank Remarks</Label>
                <Input
                  placeholder="e.g. Transferred to SBI Account via NEFT"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="h-8 bg-slate-950 border-slate-800 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-slate-800 gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleConfirmSettlement} 
            disabled={saving || loading || !settlementUtr} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirm Settlement & Mark Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
