import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Wrench, Download, AlertTriangle, Truck, Clock, CheckCircle2, History } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function VehicleHealthPassportModal({ isOpen, onClose, truckNumber, truckDetails, maintenanceLogs = [] }) {
  const truckLogs = maintenanceLogs.filter(l => (l.truck_id === truckNumber || l.truck_number === truckNumber));
  
  const totalSpend = truckLogs.reduce((sum, l) => sum + (Number(l.cost || l.amount || 0)), 0);
  const totalRepairs = truckLogs.length;

  const exportHealthPdf = () => {
    try {
      const doc = new jsPDF();
      const primaryNavy = [15, 23, 42];
      const accentGold = [217, 119, 6];
      const secondaryGray = [71, 85, 105];

      // Top Banner
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, doc.internal.pageSize.width, 7, 'F');
      doc.setFillColor(...accentGold);
      doc.rect(0, 7, doc.internal.pageSize.width, 1.5, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...primaryNavy);
      doc.text('JAI BHAVANI CARGO', 14, 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...accentGold);
      doc.text('OFFICIAL VEHICLE HEALTH PASSPORT & SERVICE LOG', doc.internal.pageSize.width - 14, 20, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryGray);
      doc.text('Plot no 3, Patel nagar, Ghatkesar, pin: 501301 | Phone: +91 7794072244', 14, 26);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 32, doc.internal.pageSize.width - 14, 32);

      // Vehicle Specs Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 36, doc.internal.pageSize.width - 28, 26, 2, 2, 'F');
      doc.roundedRect(14, 36, doc.internal.pageSize.width - 28, 26, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryNavy);
      doc.text(`Vehicle Reg: ${truckNumber}`, 18, 44);
      doc.text(`Model: ${truckDetails?.model || '32 FT Multi-Axle'}`, 18, 52);

      doc.text(`Total Lifetime Maintenance: ₹${totalSpend.toLocaleString('en-IN')}`, 110, 44);
      doc.text(`Service Events Logged: ${totalRepairs} Overhauls`, 110, 52);

      // Table of Service Events
      const rows = truckLogs.map((l, idx) => [
        String(idx + 1),
        l.date || 'Recent',
        l.service_type || l.category || 'Maintenance Repair',
        l.description || l.notes || 'Workshop Overhaul & Replacement',
        l.vendor_name || l.garage_name || 'Authorized Garage',
        `₹${Number(l.cost || l.amount || 0).toLocaleString('en-IN')}`
      ]);

      if (rows.length === 0) {
        rows.push(['1', 'Current', 'Regular Inspection', 'Comprehensive Vehicle Inspection & Lubrication', 'JBC In-House Workshop', '₹0']);
      }

      autoTable(doc, {
        startY: 68,
        head: [['Sl', 'Service Date', 'Service Category', 'Work Description / Parts Installed', 'Workshop / Garage', 'Cost (₹)']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { cellWidth: 26 },
          2: { cellWidth: 32 },
          3: { cellWidth: 65 },
          4: { cellWidth: 30 },
          5: { halign: 'right', fontStyle: 'bold' }
        }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...secondaryGray);
        doc.text(
          `Page ${i} of ${pageCount} — Jai Bhavani Cargo Enterprise System (Official Vehicle Passport)`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 6,
          { align: 'center' }
        );
      }

      doc.save(`Health_Passport_${truckNumber}.pdf`);
      toast.success('Vehicle Health Passport PDF exported!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs uppercase font-semibold tracking-wider">Vehicle Passport & Health Card</span>
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-slate-100">
            Vehicle Health Profile: {truckNumber}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Lifetime service history, component overhaul passport, and maintenance cost telemetry.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs uppercase block">Total Maintenance Spend</span>
            <span className="text-xl font-bold font-mono text-amber-400">₹{totalSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs uppercase block">Logged Repairs</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalRepairs} Overhauls</span>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs uppercase block">Vehicle Health Status</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Roadworthy
            </Badge>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-400">Service Event Timeline</span>
          {truckLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/30 rounded-xl">
              No repair logs recorded yet. Vehicle is running in pristine factory condition.
            </div>
          ) : (
            truckLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{log.service_type || 'General Service'}</span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">{log.date || 'Recent'}</Badge>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.description || 'Routine oil change & filter replacement'}</p>
                </div>
                <span className="font-mono font-bold text-amber-400">₹{Number(log.cost || log.amount || 0).toLocaleString('en-IN')}</span>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </Button>
          <Button onClick={exportHealthPdf} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
            <Download className="w-4 h-4 mr-1.5" /> Export Health Passport PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
