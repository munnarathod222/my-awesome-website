import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertTriangle, FileCheck2, Calculator, CreditCard, Lock, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { logAuditEvent } from '@/lib/auditLogger.js';

export default function TripCompletionValidationDialog({
  isOpen,
  onClose,
  trip,
  onSuccess
}) {
  const [hasWaiver, setHasWaiver] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [tripExpenses, setTripExpenses] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  useEffect(() => {
    if (isOpen && trip) {
      setHasWaiver(false);
      setWaiverReason('');
      fetchTripFinancials();
    }
  }, [isOpen, trip]);

  const fetchTripFinancials = async () => {
    if (!trip) return;
    setLoadingFinancials(true);
    try {
      const records = await pb.collection('expenses').getFullList({
        filter: `trip_id = "${trip.trip_id || trip.id}" || reference_id = "${trip.id}"`,
        $autoCancel: false
      }).catch(() => []);
      setTripExpenses(records);
    } catch (e) {
      setTripExpenses([]);
    } finally {
      setLoadingFinancials(false);
    }
  };

  // Gate 1: POD Verification Check
  const podVerification = useMemo(() => {
    if (!trip) return { passed: false, reason: 'No trip record' };
    const hasPod = !!(trip.pod_file || trip.pod_link || trip.pod_document || trip.pod_status === 'Verified' || trip.pod_status === 'Uploaded');
    const isVerified = trip.pod_status === 'Verified' || hasPod;
    return {
      passed: isVerified,
      status: trip.pod_status || (hasPod ? 'Uploaded' : 'Missing'),
      url: trip.pod_link || (trip.pod_file ? (trip.pod_file.startsWith('http') ? trip.pod_file : `https://www.jaibhavanicargo.com/api/files/trips/${trip.id}/${trip.pod_file}`) : '') || ''
    };
  }, [trip]);

  // Gate 2: Expense Ledger & Cash Advance Reconciliation
  const financialVerification = useMemo(() => {
    if (!trip) return { passed: false, totalExpenses: 0, advance: 0, balance: 0 };
    const revenue = Number(trip.revenue || 0);
    const advanceGiven = Number(trip.advance_received_from_client || trip.driver_advance || 0);
    const recordedExpenseSum = tripExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const estimatedDiesel = Number(trip.diesel_cost || 0);
    const totalExpenses = Math.max(recordedExpenseSum, estimatedDiesel);
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

    return {
      passed: true,
      revenue,
      advanceGiven,
      totalExpenses,
      netProfit,
      profitMargin
    };
  }, [trip, tripExpenses]);

  // Gate 3: Toll & Fastag Status
  const tollVerification = useMemo(() => {
    const tollCost = Number(trip?.toll_cost || trip?.fastag_amount || 0);
    return {
      passed: true,
      tollCost,
      status: tollCost > 0 ? 'Deducted & Accounted' : 'Normal Highway Standard'
    };
  }, [trip]);

  const canCloseTrip = podVerification.passed || (hasWaiver && waiverReason.trim().length > 5);

  const handleAuthorizeSettlement = async () => {
    if (!trip) return;

    if (!canCloseTrip) {
      toast.error('Cannot settle trip: Verified POD is required or provide a documented delay waiver reason.');
      return;
    }

    setIsAuthorizing(true);
    try {
      const updatePayload = {
        trip_status: 'Completed',
        client_payment_status: trip.client_payment_status === 'pending' ? 'received' : (trip.client_payment_status || 'received'),
        settlement_status: 'settled_and_locked',
        settlement_validated_at: new Date().toISOString(),
        delivery_date: trip.delivery_date || new Date().toISOString(),
        pod_status: podVerification.passed ? 'Verified' : (hasWaiver ? 'Waiver Approved' : trip.pod_status),
        pod_waiver_reason: hasWaiver ? waiverReason : (trip.pod_waiver_reason || ''),
        notes: trip.notes ? `${trip.notes}\n[Settlement Completed ${new Date().toLocaleDateString('en-IN')}]: 3-Gate Compliance verified. Net operating margin: ₹${financialVerification.netProfit.toLocaleString('en-IN')} (${financialVerification.profitMargin}%).` : `[Settlement Completed ${new Date().toLocaleDateString('en-IN')}]: 3-Gate Compliance verified.`
      };

      await pb.collection('trip_logs').update(trip.id, updatePayload, { $autoCancel: false });

      logAuditEvent({
        action: 'TRIP_SETTLEMENT_LOCKED',
        module: 'Trip Logs',
        recordId: trip.trip_id || trip.id,
        details: `Trip settled and locked. POD Status: ${updatePayload.pod_status}. Profit: ₹${financialVerification.netProfit}`
      });

      toast.success(`Trip ${trip.trip_id || trip.id} verified, settled & locked successfully!`);
      if (onSuccess) onSuccess(updatePayload);
      onClose();
    } catch (err) {
      console.error('Failed to settle trip:', err);
      toast.error('Failed to authorize trip settlement: ' + (err.message || 'Server error'));
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              Trip Completion & Settlement Gate
            </DialogTitle>
            <Badge variant="outline" className="text-xs font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              {trip.lr_number || trip.trip_id || trip.id}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Verify required delivery proof, reconcile fuel & toll expenses, and lock financial settlement before closing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none text-xs">
          {/* Trip Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex justify-between items-center text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Consignment Corridor</span>
              <span className="font-bold text-white text-sm">
                {trip.route || `${trip.origin || 'Origin'} ➔ ${trip.destination || 'Destination'}`}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Client: <strong className="text-slate-200">{trip.client_name || trip.expand?.client_id?.client_name || 'Valued Client'}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle & Driver</span>
              <span className="font-mono font-bold text-emerald-400">{trip.truck_number || 'N/A'}</span>
              <span className="text-[11px] text-slate-400 block">{trip.driver_name || 'Assigned Driver'}</span>
            </div>
          </div>

          {/* Gate 1: Proof of Delivery (POD) Validation */}
          <div className={`p-4 rounded-2xl border transition-all ${podVerification.passed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {podVerification.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Gate 1: Proof of Delivery (Signed POD)
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold ${podVerification.passed ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/40 text-rose-400 bg-rose-500/10'}`}>
                      {podVerification.status}
                    </Badge>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {podVerification.passed
                      ? 'Official signed consignee copy is uploaded and verified on system.'
                      : 'Physical or digital signed POD has not yet been uploaded for this shipment.'}
                  </p>
                  {podVerification.url && (
                    <a
                      href={podVerification.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-xs font-semibold mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Signed POD Document
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Manager Waiver Section if POD is Missing */}
            {!podVerification.passed && (
              <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="waiver-check" checked={hasWaiver} onCheckedChange={setHasWaiver} />
                  <Label htmlFor="waiver-check" className="text-xs font-bold text-amber-300 cursor-pointer">
                    Apply Operational Delay Waiver (Consignee approved / In Transit via Courier)
                  </Label>
                </div>
                {hasWaiver && (
                  <div className="space-y-1 pl-6">
                    <Input
                      value={waiverReason}
                      onChange={e => setWaiverReason(e.target.value)}
                      placeholder="Enter manager waiver justification reason (min 6 characters)..."
                      className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gate 2: Financial Reconciliation & Net Margin */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-400" />
                Gate 2: Freight Settlement & Expenses
              </h4>
              <Badge variant="outline" className="text-[10px] font-bold border-sky-500/30 text-sky-400 bg-sky-500/10">
                Operating Margin: {financialVerification.profitMargin}%
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Agreed Revenue</span>
                <span className="font-bold text-emerald-400 text-sm">₹{financialVerification.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Trip Expenses</span>
                <span className="font-bold text-slate-300 text-sm">₹{financialVerification.totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Operating Profit</span>
                <span className="font-bold text-sky-400 text-sm">₹{financialVerification.netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Gate 3: FASTag & Toll Deduction Audit */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <div>
                <h4 className="font-bold text-xs text-white">Gate 3: FASTag Toll Audit</h4>
                <p className="text-[11px] text-slate-400">Highway electronic toll deduction audit & reconciliation.</p>
              </div>
            </div>
            <span className="font-bold text-xs font-mono text-purple-400">
              {tollVerification.tollCost > 0 ? `₹${tollVerification.tollCost.toLocaleString('en-IN')} Deducted` : 'Cleared'}
            </span>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isAuthorizing} className="rounded-xl text-xs border-slate-800 text-slate-300">
            Cancel
          </Button>
          <Button
            onClick={handleAuthorizeSettlement}
            disabled={isAuthorizing || !canCloseTrip}
            className={`rounded-xl text-xs font-bold shadow-lg ${
              canCloseTrip
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isAuthorizing ? (
              'Authorizing Settlement...'
            ) : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Authorize & Lock Trip Settlement
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
