import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, DollarSign, Handshake, ArrowRight, 
  AlertCircle, FileText, Download, Wallet, CreditCard, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { calculateSubcontractorTripFinancials, syncSubcontractorCashbookTransactions } from '@/lib/subcontractorTallyUtils.js';
import { format } from 'date-fns';

export default function SubcontractorSettlementModal({ isOpen, onClose, trip, onSuccess }) {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);

  // Settlement Form State
  const [subDeductions, setSubDeductions] = useState('0');
  const [deductionNotes, setDeductionNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [settlementUtr, setSettlementUtr] = useState('');
  const [settlementDate, setSettlementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [clientBalanceStatus, setClientBalanceStatus] = useState('Received on POD');
  const [settlementStatus, setSettlementStatus] = useState('Settled');

  const clientFreight = Number(trip?.amount || 0);
  const subFreight = Number(trip?.subcontractor_freight || trip?.vendor_payout || 0);
  const clientAdv = Number(trip?.client_advance_amount || (clientFreight * 0.8));
  const subAdv = Number(trip?.subcontractor_advance_amount || (subFreight * 0.8));

  // Dynamic Tally Calculation
  const financials = calculateSubcontractorTripFinancials({
    clientFreight,
    subcontractorFreight: subFreight,
    clientAdvanceAmt: clientAdv,
    subAdvanceAmt: subAdv,
    subDeductions: parseFloat(subDeductions) || 0
  });

  useEffect(() => {
    if (isOpen && trip) {
      setSubDeductions((trip.subcontractor_deductions || 0).toString());
      setDeductionNotes(trip.subcontractor_deduction_notes || '');
      setSettlementUtr(trip.subcontractor_balance_utr || '');
      setSettlementDate(trip.subcontractor_balance_settled_date || format(new Date(), 'yyyy-MM-dd'));
      setClientBalanceStatus(trip.client_balance_status || (trip.client_payment_status === 'paid' ? 'Received on POD' : 'Pending'));
      setSettlementStatus(trip.subcontractor_settlement_status || 'Settled');
    }
  }, [isOpen, trip]);

  const handleConfirmSettlement = async (e) => {
    e?.preventDefault();
    if (!trip?.id) return;

    setSaving(true);
    try {
      const netSubBalance = financials.subcontractorBalance;
      const clientBal = financials.clientBalance;
      const margin = financials.tripMargin;
      const marginPct = financials.tripMarginPct;

      const payload = {
        is_subcontractor_trip: true,
        subcontractor_freight: subFreight,
        trip_margin_amount: margin,
        trip_margin_pct: marginPct,
        client_advance_amount: clientAdv,
        client_balance_amount: clientBal,
        client_balance_status: clientBalanceStatus,
        subcontractor_advance_amount: subAdv,
        subcontractor_balance_amount: netSubBalance,
        subcontractor_deductions: parseFloat(subDeductions) || 0,
        subcontractor_deduction_notes: deductionNotes,
        subcontractor_balance_utr: settlementUtr,
        subcontractor_balance_settled_date: settlementDate,
        subcontractor_settlement_status: settlementStatus
      };

      if (clientBalanceStatus === 'Received on POD') {
        payload.client_payment_status = 'paid';
      }

      // 1. Update trip_logs record
      const updatedTrip = await pb.collection('trip_logs').update(trip.id, payload, { $autoCancel: false });

      // 2. Auto-Sync all 4 entries to Cashbook
      await syncSubcontractorCashbookTransactions(updatedTrip, currentUser);

      toast.success(`Subcontractor settlement of ${formatCurrency(netSubBalance)} saved & tallied to Cashbook!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to settle subcontractor:', err);
      toast.error(err.message || 'Failed to save settlement');
    } finally {
      setSaving(false);
    }
  };

  if (!trip) return null;

  const tripIdStr = trip.trip_id || trip.id;
  const clientName = trip?.expand?.client_id?.client_name || trip?.expand?.client_id?.company_name || trip.client_name || 'Client';
  const subName = trip.subcontractor_name || 'Subcontractor / Sub-Vendor';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
        <DialogHeader className="p-5 pb-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  Subcontractor Settlement &amp; Cashbook Tally
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Reconcile incoming client payments vs. outgoing subcontractor freight for <strong className="text-white">Trip #{tripIdStr}</strong>
                </DialogDescription>
              </div>
            </div>

            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono font-bold">
              {formatCurrency(financials.tripMargin)} MARGIN ({financials.tripMarginPct}%)
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Trip Parties Card */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Company / Client (Billed)</span>
              <h4 className="font-bold text-white text-sm">{clientName}</h4>
              <p className="text-emerald-400 font-mono font-bold text-xs">{formatCurrency(clientFreight)} Billed</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Subcontractor (Sub-Vendor)</span>
              <h4 className="font-bold text-white text-sm">{subName}</h4>
              <p className="text-amber-400 font-mono font-bold text-xs">{formatCurrency(subFreight)} Agreed Hire</p>
            </div>
          </div>

          {/* 4-Point Full Tally Matrix Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" /> 4-Point Cash Flow &amp; Margin Reconciliation
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                100% TALLIED &amp; BALANCED
              </Badge>
            </div>

            {/* Stage 1: Loading Advance Flow */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Stage 1: Loading &amp; Dispatch (Advance Flow)</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">[IN] Client Advance</span>
                  <strong className="text-emerald-400 text-xs">{formatCurrency(financials.clientAdvance)}</strong>
                </div>
                <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">[OUT] Subcontractor Adv</span>
                  <strong className="text-rose-400 text-xs">{formatCurrency(financials.subcontractorAdvance)}</strong>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-[9px] text-emerald-400 uppercase block font-bold">Loading Cash Kept</span>
                  <strong className="text-emerald-300 text-xs">+{formatCurrency(financials.loadingRetainedCash)}</strong>
                </div>
              </div>
            </div>

            {/* Stage 2: POD Settlement Flow */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Stage 2: POD Submission &amp; Balance Settlement</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">[IN] Client Balance (POD)</span>
                  <strong className="text-emerald-400 text-xs">{formatCurrency(financials.clientBalance)}</strong>
                </div>
                <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">[OUT] Subcontractor Bal</span>
                  <strong className="text-amber-400 text-xs">{formatCurrency(financials.subcontractorBalance)}</strong>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-[9px] text-emerald-400 uppercase block font-bold">POD Margin Realized</span>
                  <strong className="text-emerald-300 text-xs">+{formatCurrency(financials.podRemainingMargin)}</strong>
                </div>
              </div>
            </div>

            {/* Total Reconciled Profit Summary Bar */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Tallied Trip Net Profit:</span>
              <strong className="text-emerald-400 text-sm font-bold">
                {formatCurrency(financials.loadingRetainedCash)} + {formatCurrency(financials.podRemainingMargin)} = {formatCurrency(financials.totalTalliedMargin)}
              </strong>
            </div>
          </div>

          {/* Subcontractor Deductions Adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Subcontractor Deductions (Diesel slip / TDS / Penalty)
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={subDeductions}
                onChange={e => setSubDeductions(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Deduction Reason / Notes</Label>
              <Input
                placeholder="e.g. ₹1,200 Diesel Slip at HPCL Solapur"
                value={deductionNotes}
                onChange={e => setDeductionNotes(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Settlement Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                  <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                  <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                  <SelectItem value="Cash">Cash Voucher</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Bank UTR / Ref #</Label>
              <Input
                placeholder="e.g. UTR-99882211"
                value={settlementUtr}
                onChange={e => setSettlementUtr(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Settlement Date</Label>
              <Input
                type="date"
                value={settlementDate}
                onChange={e => setSettlementDate(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Client Balance Status & Settlement Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Client Balance Status</Label>
              <Select value={clientBalanceStatus} onValueChange={setClientBalanceStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                  <SelectItem value="Received on POD">🟢 Received on POD ({formatCurrency(financials.clientBalance)})</SelectItem>
                  <SelectItem value="Pending">⏳ Pending Client POD Clearance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Subcontractor Settlement</Label>
              <Select value={settlementStatus} onValueChange={setSettlementStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                  <SelectItem value="Settled">✅ Settled &amp; Paid ({formatCurrency(financials.subcontractorBalance)})</SelectItem>
                  <SelectItem value="Awaiting POD">⏳ Awaiting Physical POD Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmSettlement}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow px-5 gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Confirm Settlement &amp; Auto-Tally Cashbook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
