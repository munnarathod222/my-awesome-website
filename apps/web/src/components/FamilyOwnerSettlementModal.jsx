import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, Wallet, Fuel, Receipt, User, Phone, Landmark, 
  Calendar, CheckCircle2, Clock, Share2, Download, Copy, AlertCircle
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FamilyOwnerSettlementModal({ isOpen, onClose, truck, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelTracker, setFuelTracker] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [settlementForm, setSettlementForm] = useState({
    payment_mode: 'Bank Transfer (NEFT/IMPS)',
    utr_number: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize truck identifiers
  const normalize = (v) => (v || '').replace(/\s+/g, '').toUpperCase();
  const truckNumNorm = normalize(truck?.truck_number);
  const truckId = truck?.id;

  // Fetch all trips and expenses for this vehicle
  const fetchData = async () => {
    if (!truck) return;
    try {
      setLoading(true);
      const [tripsRes, expRes, fuelRes] = await Promise.all([
        pb.collection('trip_logs').getFullList({
          sort: '-date',
          $autoCancel: false
        }),
        pb.collection('expenses').getFullList({
          sort: '-date',
          $autoCancel: false
        }),
        pb.collection('fuel_tracker').getFullList({
          sort: '-date',
          $autoCancel: false
        }).catch(() => [])
      ]);

      // Filter to this truck
      const matchedTrips = tripsRes.filter(t => {
        return t.truck_number === truckId || normalize(t.truck_number) === truckNumNorm;
      });

      const matchedExp = expRes.filter(e => {
        return e.truck_id === truckId || normalize(e.truck_id) === truckNumNorm;
      });

      const matchedFuel = fuelRes.filter(f => {
        return f.truck_id === truckId || normalize(f.truck_number) === truckNumNorm;
      });

      setTrips(matchedTrips);
      setExpenses(matchedExp);
      setFuelTracker(matchedFuel);
    } catch (err) {
      console.error('Failed to load owner settlement data:', err);
      toast.error('Failed to load vehicle settlement statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && truck) {
      fetchData();
    }
  }, [isOpen, truck]);

  // Available months filter
  const availableMonths = useMemo(() => {
    const months = new Set();
    trips.forEach(t => { if (t.date) months.add(format(parseISO(t.date), 'yyyy-MM')); });
    expenses.forEach(e => { if (e.date) months.add(format(parseISO(e.date), 'yyyy-MM')); });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [trips, expenses]);

  // Filtered by selected month
  const filteredTrips = useMemo(() => {
    if (selectedMonth === 'all') return trips;
    return trips.filter(t => t.date && format(parseISO(t.date), 'yyyy-MM') === selectedMonth);
  }, [trips, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    return expenses.filter(e => e.date && format(parseISO(e.date), 'yyyy-MM') === selectedMonth);
  }, [expenses, selectedMonth]);

  // Financial calculations
  const totalGrossFreight = filteredTrips.reduce((s, t) => s + (Number(t.revenue) || 0), 0);
  const totalTripDriverAdv = filteredTrips.reduce((s, t) => s + (Number(t.advance_paid_to_driver) || 0), 0);
  const totalTolls = filteredTrips.reduce((s, t) => s + (Number(t.toll_deduction) || 0), 0);

  // Grouped expenses
  let totalFuel = 0, totalMaintenance = 0, totalOtherExp = 0;
  filteredExpenses.forEach(exp => {
    const cat = (exp.category || '').toLowerCase();
    const sub = (exp.subcategory || '').toLowerCase();
    const amt = Number(exp.amount) || 0;
    if (cat.includes('fuel') || sub.includes('fuel')) {
      totalFuel += amt;
    } else if (cat.includes('maintenance') || sub.includes('maintenance') || cat.includes('repair')) {
      totalMaintenance += amt;
    } else if (!cat.includes('driver advance')) {
      totalOtherExp += amt;
    }
  });

  const totalOperatingDeductions = totalFuel + totalTolls + totalTripDriverAdv + totalMaintenance + totalOtherExp;
  const companyCommission = 0; // default 0% pure pass-through
  const netPayableToOwner = Math.max(0, totalGrossFreight - totalOperatingDeductions - companyCommission);

  // Check settlement status of included trips
  const settledTripsCount = filteredTrips.filter(t => t.subcontractor_settlement_status === 'Settled').length;
  const pendingTripsCount = filteredTrips.length - settledTripsCount;

  // Handle Mark as Settled
  const handleExecuteSettlement = async (e) => {
    e.preventDefault();
    if (!settlementForm.utr_number.trim()) {
      toast.error('Please enter the Bank UTR / Reference number for audit proof');
      return;
    }

    try {
      setIsSubmitting(true);
      // Update all pending trips in this period as Settled
      const updatePromises = filteredTrips
        .filter(t => t.subcontractor_settlement_status !== 'Settled')
        .map(t => pb.collection('trip_logs').update(t.id, {
          subcontractor_settlement_status: 'Settled',
          subcontractor_balance_settled_date: settlementForm.payment_date,
          subcontractor_balance_utr: settlementForm.utr_number.trim()
        }, { $autoCancel: false }));

      await Promise.all(updatePromises);

      // Create a Cashbook disbursement record so financial books stay balanced
      try {
        await pb.collection('cashbook').create({
          date: `${settlementForm.payment_date} 12:00:00.000Z`,
          type: 'Cash Out',
          category: 'Owner Settlement Payout',
          amount: netPayableToOwner,
          description: `Family Vehicle Settlement: ${truck.truck_number} (${truck.owner_name || 'Owner'}) - Ref #${settlementForm.utr_number} (${selectedMonth})`,
          payment_mode: settlementForm.payment_mode,
          reference_id: truck.id,
          notes: settlementForm.notes || 'Settlement disbursed after deducting company-paid operational expenses'
        }, { $autoCancel: false });
      } catch (cbErr) {
        console.warn('Cashbook entry notice (optional table):', cbErr.message);
      }

      toast.success(`Owner Settlement of ₹${netPayableToOwner.toLocaleString('en-IN')} marked as Settled!`);
      await fetchData();
      onSuccess?.();
    } catch (err) {
      console.error('Settlement error:', err);
      toast.error(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp summary generator
  const handleCopyWhatsApp = () => {
    const periodLabel = selectedMonth === 'all' ? 'All Time' : selectedMonth;
    const text = `*JAI BHAVANI CARGO - VEHICLE OWNER SETTLEMENT STATEMENT*
------------------------------------------------
🚛 *Vehicle:* ${truck?.truck_number} (${truck?.truck_name || 'Fleet Truck'})
👤 *Owner:* ${truck?.owner_name || 'Partner Owner'}
📅 *Period:* ${periodLabel}
🏦 *Bank:* ${truck?.owner_bank_name || 'N/A'} | A/C: ${truck?.owner_account_number || 'N/A'}
------------------------------------------------
📈 *Total Gross Client Freight:* ₹${totalGrossFreight.toLocaleString('en-IN')} (${filteredTrips.length} Trips)

*EXPENSES PAID UPFRONT BY JAI BHAVANI CARGO:*
⛽ Diesel / Fuel: -₹${totalFuel.toLocaleString('en-IN')}
🛣️ FASTag / Tolls: -₹${totalTolls.toLocaleString('en-IN')}
💵 Driver Advances Paid: -₹${totalTripDriverAdv.toLocaleString('en-IN')}
🔧 Workshop / Maintenance: -₹${totalMaintenance.toLocaleString('en-IN')}
${totalOtherExp > 0 ? `📦 Other Deductions: -₹${totalOtherExp.toLocaleString('en-IN')}\n` : ''}🏢 Company Commission: -₹0.00 (0% Pass-Through)
------------------------------------------------
👉 *NET BALANCE PAYABLE TO OWNER:* *₹${netPayableToOwner.toLocaleString('en-IN')}*
------------------------------------------------
*Note:* Generated via Jai Bhavani Cargo Fleet ERP.`;

    navigator.clipboard.writeText(text);
    toast.success('WhatsApp Statement copied to clipboard!');
  };

  // Download PDF Statement
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const periodLabel = selectedMonth === 'all' ? 'All Time' : selectedMonth;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('JAI BHAVANI CARGO', 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('Vehicle Owner Settlement & Pass-Through Statement', 14, 27);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 33);

      // Box: Truck & Owner details
      autoTable(doc, {
        startY: 38,
        head: [['Vehicle Details', 'Owner Banking Details']],
        body: [
          [
            `Truck Number: ${truck.truck_number}\nVehicle Type: ${truck.truck_size || 'N/A'}\nStatement Period: ${periodLabel}`,
            `Owner Name: ${truck.owner_name || 'N/A'}\nPhone: ${truck.owner_phone || 'N/A'}\nBank: ${truck.owner_bank_name || 'N/A'} (A/C: ${truck.owner_account_number || 'N/A'})\nIFSC: ${truck.owner_ifsc || 'N/A'}`
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [40, 50, 75] }
      });

      // Table 1: Delivered Trips
      const tripRows = filteredTrips.map(t => [
        t.date ? format(parseISO(t.date), 'dd/MM/yyyy') : '-',
        t.trip_id || t.id?.slice(0, 8),
        t.route || 'Local',
        `Rs. ${(Number(t.revenue) || 0).toLocaleString('en-IN')}`,
        `Rs. ${(Number(t.advance_paid_to_driver) || 0).toLocaleString('en-IN')}`,
        `Rs. ${(Number(t.toll_deduction) || 0).toLocaleString('en-IN')}`,
        t.subcontractor_settlement_status || 'Pending'
      ]);

      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('1. Delivered Client Trips (Gross Freight)', 14, doc.lastAutoTable.finalY + 10);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 13,
        head: [['Date', 'Trip ID', 'Route', 'Gross Revenue', 'Driver Adv', 'Toll Ded', 'Status']],
        body: tripRows.length > 0 ? tripRows : [['-', '-', 'No trips found in period', 'Rs. 0', 'Rs. 0', 'Rs. 0', '-']],
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85] }
      });

      // Table 2: Financial Reconciliation Summary
      doc.setFontSize(12);
      doc.text('2. Expense Deductions & Net Payout Summary', 14, doc.lastAutoTable.finalY + 10);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 13,
        head: [['Item Description', 'Accounting Flow', 'Amount (INR)']],
        body: [
          ['Total Gross Client Freight Billed', 'Credit (+)', `Rs. ${totalGrossFreight.toLocaleString('en-IN')}`],
          ['Diesel / Fuel Paid by Company', 'Debit (-)', `Rs. ${totalFuel.toLocaleString('en-IN')}`],
          ['FASTag / Toll Deductions Paid by Company', 'Debit (-)', `Rs. ${totalTolls.toLocaleString('en-IN')}`],
          ['Driver Advances Paid from Company Cash', 'Debit (-)', `Rs. ${totalTripDriverAdv.toLocaleString('en-IN')}`],
          ['Workshop Maintenance & Repairs Paid by Company', 'Debit (-)', `Rs. ${totalMaintenance.toLocaleString('en-IN')}`],
          ['Company Service Fee / Commission', 'Debit (-)', 'Rs. 0.00 (0% Pass-Through)'],
          ['NET BALANCE PAYABLE TO VEHICLE OWNER', 'FINAL SETTLEMENT', `Rs. ${netPayableToOwner.toLocaleString('en-IN')}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }
      });

      // Footer notice
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('* This settlement represents net pass-through disbursement and is isolated from company operating profit.', 14, doc.lastAutoTable.finalY + 12);

      doc.save(`JaiBhavani_Owner_Settlement_${truck.truck_number}_${periodLabel}.pdf`);
      toast.success('Settlement Statement PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export PDF statement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-y-auto rounded-2xl bg-card border-border/80">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {truck?.truck_number}
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]">
                      Family Attached Vehicle
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {truck?.truck_name || 'Fleet Profile'} • Owner Settlement & Expense Pass-Through Ledger
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Actions: WhatsApp & PDF */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyWhatsApp} className="h-8 text-xs rounded-xl gap-1.5 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="h-8 text-xs rounded-xl gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                <Download className="w-3.5 h-3.5" /> PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Owner Info & Period Selector Bar */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Owner Name</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" /> {truck?.owner_name || 'Not Specified'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Bank & Account</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-500" /> {truck?.owner_bank_name || 'Bank'} {truck?.owner_account_number ? `(${truck.owner_account_number.slice(-4)})` : ''}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">IFSC / UPI</span>
              <span className="font-mono text-[11px] text-foreground mt-0.5 block">
                {truck?.owner_ifsc || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Available Trips</SelectItem>
                {availableMonths.map(m => (
                  <SelectItem key={m} value={m}>
                    {new Date(m.split('-')[0], m.split('-')[1] - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Big Net Settlement Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-background to-emerald-500/10 border border-purple-500/30 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-border/50">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Gross Client Freight</span>
              <span className="text-lg font-bold text-foreground block mt-0.5">
                ₹{totalGrossFreight.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground">{filteredTrips.length} Delivered Trips</span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Expenses Deducted</span>
              <span className="text-lg font-bold text-rose-500 block mt-0.5">
                -₹{totalOperatingDeductions.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground">Fuel, Tolls, Adv, Workshop</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Company Margin</span>
              <span className="text-lg font-bold text-muted-foreground block mt-0.5">
                ₹0.00
              </span>
              <span className="text-[10px] text-emerald-500">0% Pass-Through</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Net Payable to Owner</span>
              <span className="text-xl font-extrabold text-emerald-500 block mt-0.5">
                ₹{netPayableToOwner.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">Excluded from Co. Profit</span>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Settlement Status: <strong>{settledTripsCount} Settled</strong> · <strong>{pendingTripsCount} Pending</strong></span>
            <span className="text-[11px] italic text-muted-foreground/80">
              * Upfront operational expenses are reimbursed directly from freight billing.
            </span>
          </div>
        </div>

        {/* Detailed Tabs: Breakdown vs Settle */}
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid grid-cols-3 h-9">
            <TabsTrigger value="breakdown" className="text-xs font-semibold">Financial Breakdown</TabsTrigger>
            <TabsTrigger value="trips" className="text-xs font-semibold">Delivered Trips ({filteredTrips.length})</TabsTrigger>
            <TabsTrigger value="settle" className="text-xs font-semibold text-emerald-500 font-bold">Execute Settlement</TabsTrigger>
          </TabsList>

          {/* Tab 1: Financial Breakdown */}
          <TabsContent value="breakdown" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gross Inward */}
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40 font-bold text-xs text-foreground">
                  <Receipt className="w-4 h-4 text-primary" /> Billed Freight (Inward Revenue)
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-muted-foreground">Completed Trips Freight:</span>
                  <span className="font-semibold text-foreground">₹{totalGrossFreight.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-border/40 flex justify-between font-bold text-xs">
                  <span>Total Inward:</span>
                  <span className="text-primary font-bold">₹{totalGrossFreight.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Company-Paid Deductions */}
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40 font-bold text-xs text-rose-500">
                  <Fuel className="w-4 h-4 text-rose-500" /> Upfront Company-Paid Deductions
                </div>
                <div className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">Diesel / Fuel Bills:</span>
                  <span className="font-semibold text-rose-500">-₹{totalFuel.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">FASTag & Toll Deductions:</span>
                  <span className="font-semibold text-rose-500">-₹{totalTolls.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">Driver Cash Advances:</span>
                  <span className="font-semibold text-rose-500">-₹{totalTripDriverAdv.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">Workshop & Maintenance Repairs:</span>
                  <span className="font-semibold text-rose-500">-₹{totalMaintenance.toLocaleString('en-IN')}</span>
                </div>
                {totalOtherExp > 0 && (
                  <div className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">Other Trip Charges:</span>
                    <span className="font-semibold text-rose-500">-₹{totalOtherExp.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/40 flex justify-between font-bold text-xs">
                  <span>Total Deductions:</span>
                  <span className="text-rose-500 font-bold">-₹{totalOperatingDeductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Trips List */}
          <TabsContent value="trips" className="space-y-3 pt-3">
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Trip ID</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5 text-right">Gross Freight</th>
                    <th className="p-2.5 text-right">Advances</th>
                    <th className="p-2.5 text-right">Tolls</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        No trips found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map(trip => (
                      <tr key={trip.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono">{trip.date ? format(parseISO(trip.date), 'dd/MM/yyyy') : '-'}</td>
                        <td className="p-2.5 font-mono font-bold text-primary">{trip.trip_id || trip.id.slice(0, 8)}</td>
                        <td className="p-2.5">{trip.route || 'Local trip'}</td>
                        <td className="p-2.5 text-right font-bold">₹{(Number(trip.revenue) || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right text-rose-500">₹{(Number(trip.advance_paid_to_driver) || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right text-rose-500">₹{(Number(trip.toll_deduction) || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-center">
                          <Badge variant="outline" className={trip.subcontractor_settlement_status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[9px]' : 'bg-amber-500/10 text-amber-500 border-amber-500/30 text-[9px]'}>
                            {trip.subcontractor_settlement_status || 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Tab 3: Execute Settlement */}
          <TabsContent value="settle" className="space-y-4 pt-3">
            <form onSubmit={handleExecuteSettlement} className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Disburse Owner Settlement Payment
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the payment reference details to mark this period as settled and log the disbursement into your Cashbook ledger.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Date</Label>
                  <Input 
                    type="date"
                    required
                    value={settlementForm.payment_date} 
                    onChange={e => setSettlementForm({...settlementForm, payment_date: e.target.value})} 
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Mode</Label>
                  <Select 
                    value={settlementForm.payment_mode} 
                    onValueChange={v => setSettlementForm({...settlementForm, payment_mode: v})}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</SelectItem>
                      <SelectItem value="UPI Transfer">UPI Transfer</SelectItem>
                      <SelectItem value="Cheque Payment">Cheque Payment</SelectItem>
                      <SelectItem value="Cash">Cash Handover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bank UTR / Ref Number <span className="text-destructive">*</span></Label>
                  <Input 
                    required
                    placeholder="e.g. UTR1234567890" 
                    value={settlementForm.utr_number} 
                    onChange={e => setSettlementForm({...settlementForm, utr_number: e.target.value})} 
                    className="h-8 text-xs font-mono uppercase bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Notes / Voucher Details (Optional)</Label>
                <Input 
                  placeholder="e.g. Cleared against client invoice settlement for September" 
                  value={settlementForm.notes} 
                  onChange={e => setSettlementForm({...settlementForm, notes: e.target.value})} 
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-muted-foreground">Disbursement Amount: </span>
                  <span className="font-extrabold text-emerald-500 text-sm">₹{netPayableToOwner.toLocaleString('en-IN')}</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || netPayableToOwner <= 0}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  {isSubmitting ? 'Recording Settlement...' : 'Confirm & Record Settlement'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
