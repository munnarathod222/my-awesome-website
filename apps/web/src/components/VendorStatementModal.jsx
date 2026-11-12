import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Building2, Truck, Download, Share2, Receipt, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

export default function VendorStatementModal({ isOpen, onClose, vendor }) {
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({
    totalTrips: 0,
    grossFreight: 0,
    cashAdvances: 0,
    dieselDeductions: 0,
    tollDeductions: 0,
    tdsDeductions: 0,
    netPayable: 0,
    settledAmount: 0,
    pendingBalance: 0
  });

  useEffect(() => {
    if (isOpen && vendor) {
      loadVendorTrips();
    }
  }, [isOpen, vendor]);

  const loadVendorTrips = async () => {
    setLoading(true);
    try {
      // Find all trucks linked to this vendor
      const vendorTrucks = (vendor.truck_numbers || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      const allTrips = await pb.collection('trip_logs').getFullList({
        sort: '-date',
        $autoCancel: false
      }).catch(() => []);

      const matching = allTrips.filter(t => {
        const trkNum = (t.truck_number || '').replace(/\s/g, '').toUpperCase();
        const matchesTruck = vendorTrucks.some(vt => trkNum === vt.replace(/\s/g, '').toUpperCase());
        const matchesVendorName = t.driver_name?.toLowerCase().includes(vendor.owner_name?.toLowerCase() || '') ||
          t.created_by === vendor.id;
        return matchesTruck || matchesVendorName;
      });

      setTrips(matching);

      let gross = 0;
      let cashAdv = 0;
      let dieselAdv = 0;
      let tollDed = 0;
      let tdsTot = 0;
      let settled = 0;

      matching.forEach(t => {
        const p = Number(t.vendor_payout) || 0;
        const c = Number(t.advance_paid_to_driver) || 0;
        const d = Number(t.fuel_advance_deduction) || 0;
        const tl = Number(t.toll_deduction) || 0;
        const tds = (p * 1) / 100; // default 1%

        gross += p;
        cashAdv += c;
        dieselAdv += d;
        tollDed += tl;
        tdsTot += tds;

        if (t.settlement_status === 'Settled') {
          settled += Math.max(0, p - c - d - tl - tds);
        }
      });

      const net = Math.max(0, gross - cashAdv - dieselAdv - tollDed - tdsTot);
      const pending = Math.max(0, net - settled);

      setSummary({
        totalTrips: matching.length,
        grossFreight: gross,
        cashAdvances: cashAdv,
        dieselDeductions: dieselAdv,
        tollDeductions: tollDed,
        tdsDeductions: tdsTot,
        netPayable: net,
        settledAmount: settled,
        pendingBalance: pending
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to compute vendor statement');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFStatement = () => {
    try {
      const doc = new jsPDF();
      const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text('JAI BHAVANI CARGO', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.setFont(undefined, 'normal');
      doc.text('Fleet Owner & Subcontractor Consolidated Statement of Account', 14, 28);
      doc.text(`Statement Period: All Completed Trips • Generated: ${format(new Date(), 'dd MMM yyyy')}`, 14, 35);

      // Vendor Info Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 36, 3, 3, 'F');
      doc.roundedRect(14, 48, 182, 36, 3, 3, 'S');

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('SUBCONTRACTOR VENDOR DETAILS', 20, 56);

      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, 'bold');
      doc.text(`Vendor: ${vendor?.subcontractor_name || 'Fleet Vendor'}`, 20, 64);
      doc.text(`Vendor ID: ${vendor?.issued_jbc_vendor_id || 'JBC-SUB-N/A'}`, 20, 72);
      doc.text(`Owner: ${vendor?.owner_name || 'N/A'} (${vendor?.phone || 'N/A'})`, 20, 80);

      doc.text(`PAN: ${vendor?.pan || 'N/A'}`, 110, 64);
      doc.text(`Bank: ${vendor?.bank_name || 'N/A'}`, 110, 72);
      doc.text(`A/C: ${vendor?.account_number || 'N/A'} • IFSC: ${vendor?.ifsc_code || 'N/A'}`, 110, 80);

      // Financial Summary Metrics
      const tableHead = [['Trip ID', 'Date', 'Vehicle', 'Route', 'Gross Payout', 'Advances', 'TDS', 'Net Payable', 'Status']];
      const tableRows = trips.map(t => {
        const p = Number(t.vendor_payout) || 0;
        const adv = (Number(t.advance_paid_to_driver) || 0) + (Number(t.fuel_advance_deduction) || 0) + (Number(t.toll_deduction) || 0);
        const tds = (p * 1) / 100;
        const net = Math.max(0, p - adv - tds);

        return [
          t.trip_id || t.id.substring(0, 8),
          t.date ? format(new Date(t.date), 'dd/MM/yy') : '—',
          t.truck_number || '—',
          t.route || '—',
          fmt(p),
          fmt(adv),
          fmt(tds),
          fmt(net),
          t.settlement_status || 'Pending'
        ];
      });

      doc.autoTable({
        startY: 90,
        head: tableHead,
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, finalY, 182, 30, 3, 3, 'F');
      doc.roundedRect(14, finalY, 182, 30, 3, 3, 'S');

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Trips Dispatched: ${summary.totalTrips}`, 20, finalY + 10);
      doc.text(`Gross Freight Payable: ${fmt(summary.grossFreight)}`, 20, finalY + 18);
      doc.text(`Total Advances Deducted: ${fmt(summary.cashAdvances + summary.dieselDeductions + summary.tollDeductions)}`, 20, finalY + 25);

      doc.setTextColor(5, 150, 105);
      doc.text(`Total Net Payable: ${fmt(summary.netPayable)}`, 110, finalY + 10);
      doc.text(`Settled Amount: ${fmt(summary.settledAmount)}`, 110, finalY + 18);
      doc.setTextColor(225, 29, 72);
      doc.text(`Outstanding Pending Balance: ${fmt(summary.pendingBalance)}`, 110, finalY + 25);

      doc.save(`JBC_Vendor_Statement_${vendor?.issued_jbc_vendor_id || 'Vendor'}.pdf`);
      toast.success('Vendor statement PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF statement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-950 text-white border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-mono tracking-tight flex items-center gap-2">
                  <span>{vendor?.subcontractor_name}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                    {vendor?.issued_jbc_vendor_id}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Consolidated Statement of Account & Attached Fleet Ledger
                </DialogDescription>
              </div>
            </div>

            <Button size="sm" onClick={generatePDFStatement} className="bg-primary text-white font-bold gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Download Statement PDF
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Computing vendor ledger and trip history...</p>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Trips</span>
                <span className="text-base font-bold font-mono text-slate-200">{summary.totalTrips} Trips</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Gross Freight Earned</span>
                <span className="text-base font-bold font-mono text-blue-400">
                  ₹{summary.grossFreight.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Settled / Disbursed</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ₹{summary.settledAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
                <span className="text-[10px] text-rose-400 uppercase block font-semibold">Pending Outstanding</span>
                <span className="text-base font-bold font-mono text-rose-400">
                  ₹{summary.pendingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trip Logs Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Dispatched Trips for this Vendor's Fleet</span>
                <span className="text-[11px] text-slate-400 font-normal font-mono">
                  Showing {trips.length} records
                </span>
              </div>

              {trips.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No trips logged for this vendor's attached trucks yet.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Trip ID</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Vehicle</th>
                        <th className="p-2.5">Route</th>
                        <th className="p-2.5 text-right">Agreed Payout</th>
                        <th className="p-2.5 text-right">Advances & Fuel</th>
                        <th className="p-2.5 text-right">Net Payable</th>
                        <th className="p-2.5 text-center">Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {trips.map(t => {
                        const p = Number(t.vendor_payout) || 0;
                        const adv = (Number(t.advance_paid_to_driver) || 0) + (Number(t.fuel_advance_deduction) || 0) + (Number(t.toll_deduction) || 0);
                        const net = Math.max(0, p - adv - ((p * 1) / 100));

                        return (
                          <tr key={t.id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-bold text-slate-200">{t.trip_id || t.id.substring(0, 8)}</td>
                            <td className="p-2.5 text-slate-400">{t.date ? format(new Date(t.date), 'dd MMM') : '—'}</td>
                            <td className="p-2.5 text-amber-400 font-bold">{t.truck_number}</td>
                            <td className="p-2.5 text-slate-300 font-sans">{t.route}</td>
                            <td className="p-2.5 text-right text-blue-400 font-bold">₹{p.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-right text-rose-400">-₹{adv.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-right text-emerald-400 font-extrabold">₹{net.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-center font-sans">
                              <Badge className={t.settlement_status === 'Settled' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]' : 'bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]'}>
                                {t.settlement_status || 'Pending POD'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
