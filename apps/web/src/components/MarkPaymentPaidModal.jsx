import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Receipt, 
  Calculator,
  Send,
  Truck,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';

const DEDUCTION_CATEGORIES = [
  { value: 'Penalty - Late Delivery', label: '🚨 Penalty (Late Delivery / Transit Delay)' },
  { value: 'Shortage / Loss', label: '📦 Goods Shortage / Missing Material' },
  { value: 'Transit Damage', label: '💥 Goods Damage in Transit' },
  { value: 'TDS (194C)', label: '📑 TDS Deduction (Sec 194C - 1% / 2%)' },
  { value: 'Detention / Unloading Charge', label: '⏱️ Detention / Unloading Deduction' },
  { value: 'Diesel / Toll Adjustment', label: '⛽ Fuel / Toll Adjustment' },
  { value: 'Debit Note / Rebate', label: '🏷️ Debit Note / Rate Difference' },
  { value: 'Other Deduction', label: '✏️ Other Custom Deduction' }
];

const MarkPaymentPaidModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // Base Payment Fields
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Financial calculation fields
  const [grossAmount, setGrossAmount] = useState(0);
  const [advanceDeducted, setAdvanceDeducted] = useState(0);
  const [deductions, setDeductions] = useState([]);
  const [amountReceived, setAmountReceived] = useState('');
  const [isManualAmount, setIsManualAmount] = useState(false);

  // Sync state when request prop changes
  useEffect(() => {
    if (request) {
      const gross = Number(request.amount || request.revenue || 0);
      const adv = Number(request.expand?.trip_id?.advance_received_from_client || request.linkedTrip?.advance_received_from_client || 0);
      
      setGrossAmount(gross);
      setAdvanceDeducted(adv);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
      setReferenceNumber('');
      setNotes('');
      setDeductions([]);
      setIsManualAmount(false);
      
      // Default amount received to gross amount
      setAmountReceived(gross > 0 ? String(gross) : '');
    }
  }, [request, isOpen]);

  // Calculate total deductions
  const totalDeductions = deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const netExpectedAmount = Math.max(0, grossAmount - totalDeductions);

  // Auto-calculate amount received unless user manually edited it
  useEffect(() => {
    if (!isManualAmount) {
      setAmountReceived(netExpectedAmount > 0 ? String(netExpectedAmount) : '0');
    }
  }, [netExpectedAmount, isManualAmount]);

  // Add a new deduction line item
  const handleAddDeduction = () => {
    setDeductions(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'Penalty - Late Delivery',
        amount: '',
        reason: ''
      }
    ]);
  };

  // Remove a deduction line item
  const handleRemoveDeduction = (id) => {
    setDeductions(prev => prev.filter(d => d.id !== id));
  };

  // Update a deduction line item
  const handleUpdateDeduction = (id, field, value) => {
    setDeductions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  // Check settlement status
  const parsedReceived = parseFloat(amountReceived) || 0;
  const isFullSettlement = (parsedReceived + totalDeductions) >= grossAmount && grossAmount > 0;
  const balanceRemaining = Math.max(0, grossAmount - totalDeductions - parsedReceived);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (parsedReceived < 0) {
      toast.error('Amount received cannot be negative');
      return;
    }

    setLoading(true);
    try {
      // Build an itemized deduction audit log
      let deductionAuditLines = [];
      let totalTdsAmount = 0;
      
      if (deductions.length > 0) {
        deductionAuditLines.push(`• Deductions & Penalties Applied: -₹${totalDeductions.toLocaleString('en-IN')}`);
        deductions.forEach(d => {
          const amt = parseFloat(d.amount) || 0;
          if (amt > 0) {
            deductionAuditLines.push(`  ↳ [${d.type}] ₹${amt.toLocaleString('en-IN')}${d.reason ? ` - ${d.reason}` : ''}`);
            if (d.type.includes('TDS')) {
              totalTdsAmount += amt;
            }
          }
        });
      }

      const settlementNote = [
        `[SETTLEMENT RECORDED ${paymentDate}]`,
        `• Gross Bill: ₹${grossAmount.toLocaleString('en-IN')}`,
        ...deductionAuditLines,
        `• Net Amount Received: ₹${parsedReceived.toLocaleString('en-IN')} via ${paymentMethod}`,
        referenceNumber ? `• Reference / UTR: ${referenceNumber}` : null,
        `• Status: ${isFullSettlement ? 'Fully Settled' : `Partially Paid (₹${balanceRemaining.toLocaleString('en-IN')} balance)`}`,
        notes ? `• Remarks: ${notes}` : null
      ].filter(Boolean).join('\n');

      const existingNotes = request.notes || '';
      const combinedNotes = existingNotes ? `${existingNotes}\n\n${settlementNote}` : settlementNote;

      // 1. Update Payment Request
      await pb.collection('payment_requests').update(request.id, {
        status: isFullSettlement ? 'Paid' : 'Pending',
        payment_method: paymentMethod,
        payment_date: paymentDate + ' 12:00:00.000Z',
        notes: combinedNotes
      }, { $autoCancel: false });

      // 2. Update Trip Log client_payment_status & TDS if linked
      const tripId = request.trip_id || request.linkedTrip?.id;
      if (tripId) {
        const tripUpdates = {
          client_payment_status: isFullSettlement ? 'received' : 'pending'
        };
        if (totalTdsAmount > 0) {
          tripUpdates.tds_deducted_receivable = totalTdsAmount;
        }
        await pb.collection('trip_logs').update(tripId, tripUpdates, { $autoCancel: false });
      }

      // 3. Record income in Cashbook (safe fallback if collection rules permit)
      try {
        const tripCode = request.expand?.trip_id?.trip_id || request.trip_id || request.id;
        await pb.collection('cashbook').create({
          date: paymentDate + ' 12:00:00.000Z',
          description: `Payment Received - Trip ${tripCode} (Net ₹${parsedReceived.toLocaleString('en-IN')}${totalDeductions > 0 ? ` after ₹${totalDeductions.toLocaleString('en-IN')} deductions` : ''})`,
          amount: parsedReceived,
          transaction_type: 'Income',
          category: 'Trip Revenue',
          added_by: pb.authStore.model?.id || '',
          reference_id: tripId || request.id,
          reference_type: 'trip_payment',
          status: 'Completed'
        }, { $autoCancel: false });
      } catch (cashbookErr) {
        // Cashbook logging is supplementary, don't fail transaction
        console.warn('Optional cashbook recording skipped:', cashbookErr?.message);
      }

      // Format WhatsApp receipt share link
      const clientName = request?.expand?.client_id?.client_name || request?.client_name || 'Valued Client';
      const rawPhone = request?.expand?.client_id?.phone || request?.phone || '';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const tripDisplay = request?.expand?.trip_id?.trip_id || request?.trip_id || request?.id || 'N/A';
      const routeDisplay = request?.expand?.trip_id?.origin && request?.expand?.trip_id?.destination
        ? `${request.expand.trip_id.origin} ➔ ${request.expand.trip_id.destination}`
        : '';

      let deductionsSummaryText = '';
      if (deductions.length > 0) {
        deductionsSummaryText = `\n• *Deductions & Penalties:* -₹${totalDeductions.toLocaleString('en-IN')}\n` +
          deductions.filter(d => (parseFloat(d.amount) || 0) > 0)
            .map(d => `   ↳ ${d.type}: ₹${Number(d.amount).toLocaleString('en-IN')}${d.reason ? ` (${d.reason})` : ''}`)
            .join('\n');
      }

      const waMsg = `✅ *JAI BHAVANI CARGO - PAYMENT RECEIPT & SETTLEMENT*\n\n` +
        `Dear *${clientName}*,\n` +
        `We have received and recorded payment for your shipment.\n\n` +
        `📌 *Shipment & Payment Summary:*\n` +
        `• Trip / LR: *${tripDisplay}*\n` +
        (routeDisplay ? `• Route: *${routeDisplay}*\n` : '') +
        `• Gross Freight: *₹${grossAmount.toLocaleString('en-IN')}*` +
        deductionsSummaryText + '\n' +
        `• *Net Amount Received: ₹${parsedReceived.toLocaleString('en-IN')}*\n` +
        `• Payment Mode: *${paymentMethod}*\n` +
        (referenceNumber ? `• Reference / UTR: *${referenceNumber}*\n` : '') +
        `• Payment Date: *${paymentDate}*\n` +
        `• Status: *${isFullSettlement ? 'Fully Settled' : `Partially Settled (Pending: ₹${balanceRemaining.toLocaleString('en-IN')})`}*\n\n` +
        `Thank you for your business!\n*Jai Bhavani Cargo & Logistics*\n📞 Support: +91 9876543210`;

      toast.success(
        isFullSettlement ? 'Payment marked as Fully Settled!' : 'Partial payment recorded successfully!',
        {
          action: targetPhone ? {
            label: '💬 Share Receipt',
            onClick: () => {
              window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
            }
          } : undefined
        }
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      toast.error('Failed to update payment status: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clientName = request?.expand?.client_id?.client_name || request?.client_name || 'Client';
  const tripCode = request?.expand?.trip_id?.trip_id || request?.trip_id || '-';
  const tripRoute = request?.expand?.trip_id?.origin && request?.expand?.trip_id?.destination
    ? `${request.expand.trip_id.origin} ➔ ${request.expand.trip_id.destination}`
    : (request?.description || '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
                Receive Payment & Settlement
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record client payment, adjust deductions/penalties, and update the ledger.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Trip & Client Context Card */}
        <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Client Name</p>
              <p className="text-sm font-bold text-foreground">{clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Gross Freight Due</p>
              <p className="text-base font-extrabold text-primary">{formatCurrency(grossAmount)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <span className="font-mono">Trip: {tripCode}</span>
            {tripRoute && <span>Route: <strong className="text-foreground">{tripRoute}</strong></span>}
          </div>
        </div>

        <form id="mark-paid-form" onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="payment_date" className="text-xs font-semibold">Payment Date</Label>
              <Input 
                id="payment_date" 
                type="date" 
                required
                className="h-10 text-xs sm:text-sm font-medium bg-background"
                value={paymentDate} 
                onChange={e => setPaymentDate(e.target.value)} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Method</Label>
              <Select required value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-10 text-xs sm:text-sm bg-background">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</SelectItem>
                  <SelectItem value="UPI">UPI / QR Payment</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Credit / Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference / UTR Number */}
          <div className="space-y-1.5">
            <Label htmlFor="ref_num" className="text-xs font-semibold">
              Transaction Reference / UTR / Cheque No. <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input 
              id="ref_num" 
              placeholder="e.g. UTR-9821873214 or Cheque #004521" 
              className="h-10 text-xs sm:text-sm bg-background font-mono"
              value={referenceNumber} 
              onChange={e => setReferenceNumber(e.target.value)} 
            />
          </div>

          {/* DEDUCTIONS & PENALTIES SECTION */}
          <div className="border border-border/80 rounded-xl p-3 sm:p-4 bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <Label className="text-xs sm:text-sm font-bold text-foreground">
                  Deductions & Penalties
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDeduction}
                className="h-7 text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 rounded-lg px-2.5 gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Deduction / Penalty
              </Button>
            </div>

            {deductions.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-dashed border-border/60">
                No deductions added. If the client applied a penalty, late fee, TDS, or damage deduction, click <strong className="text-foreground">"+ Add Deduction / Penalty"</strong> above to record it.
              </p>
            ) : (
              <div className="space-y-2.5">
                {deductions.map((item, index) => (
                  <div key={item.id} className="p-2.5 bg-muted/30 border border-border/60 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        Deduction #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDeduction(item.id)}
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 rounded-md"
                        title="Remove deduction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select 
                        value={item.type} 
                        onValueChange={val => handleUpdateDeduction(item.id, 'type', val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Deduction Type" />
                        </SelectTrigger>
                        <SelectContent className="z-50 max-h-56">
                          {DEDUCTION_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-muted-foreground">₹</span>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          className="h-8 pl-6 text-xs font-bold text-rose-600 dark:text-rose-400 bg-background"
                          value={item.amount}
                          onChange={e => handleUpdateDeduction(item.id, 'amount', e.target.value)}
                        />
                      </div>
                    </div>

                    <Input 
                      placeholder="Reason / documentation remarks (e.g. 4hr late delivery dock fine)"
                      className="h-8 text-xs bg-background"
                      value={item.reason}
                      onChange={e => handleUpdateDeduction(item.id, 'reason', e.target.value)}
                    />
                  </div>
                ))}

                {deductions.length > 0 && (
                  <div className="flex justify-between items-center pt-1 text-xs font-semibold px-1">
                    <span className="text-muted-foreground">Total Deductions:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                      -₹{totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* REAL-TIME SETTLEMENT SUMMARY */}
          <div className="bg-slate-900 text-white dark:bg-slate-950 p-3.5 rounded-xl space-y-2.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Gross Freight Due:</span>
              <span className="font-bold text-slate-200">₹{grossAmount.toLocaleString('en-IN')}</span>
            </div>
            
            {totalDeductions > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400">Deductions Applied:</span>
                <span className="font-bold text-rose-400">-₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="font-semibold text-slate-300">Net Expected Payable:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                ₹{netExpectedAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* AMOUNT ACTUALLY RECEIVED INPUT */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="amount_received" className="text-xs font-bold text-white">
                  Amount Actually Received (₹)
                </Label>
                {isManualAmount && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualAmount(false);
                      setAmountReceived(String(netExpectedAmount));
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Reset to Net Expected
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <Input 
                  id="amount_received" 
                  type="number" 
                  step="0.01" 
                  required
                  className="h-10 pl-7 text-sm sm:text-base font-extrabold bg-slate-800 border-slate-700 text-white focus:ring-emerald-500"
                  value={amountReceived} 
                  onChange={e => {
                    setIsManualAmount(true);
                    setAmountReceived(e.target.value);
                  }} 
                />
              </div>

              {/* Settlement Status Banner */}
              <div className="mt-2 flex items-center justify-between text-xs">
                {isFullSettlement ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Full Settlement (₹0 balance)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1 text-[11px] font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> Partial Payment (₹{balanceRemaining.toLocaleString('en-IN')} remains pending)
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">General Remarks / Settlement Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="e.g. Approved by Mr. Sharma, final settlement voucher issued..." 
              className="text-xs sm:text-sm bg-background min-h-[60px]"
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>
        </form>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full sm:w-auto text-xs font-semibold rounded-xl">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="mark-paid-form" 
            disabled={loading || !paymentMethod || !amountReceived}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
            Confirm Payment {parsedReceived > 0 ? `(₹${parsedReceived.toLocaleString('en-IN')})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkPaymentPaidModal;
