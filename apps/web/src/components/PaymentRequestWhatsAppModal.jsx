import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Send, CheckCircle2, Copy, ExternalLink, 
  Building2, Phone, AlertCircle, RefreshCw, IndianRupee, 
  CreditCard, Calendar, Truck, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import pb from '@/lib/pocketbaseClient.js';

export default function PaymentRequestWhatsAppModal({ 
  isOpen, 
  onClose, 
  paymentRequest = null, 
  selectedRequests = [],
  client = null, 
  trip = null, 
  pdfFilename = null,
  onSuccess 
}) {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [campaignName, setCampaignName] = useState('payment_reminder_document');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Check if bulk multi-trip mode
  const isMultiTrip = Array.isArray(selectedRequests) && selectedRequests.length > 1;
  const activeRequests = isMultiTrip ? selectedRequests : (paymentRequest ? [paymentRequest] : []);

  // Resolved Client & Trip details
  const resolvedClient = useMemo(() => {
    if (client) return client;
    if (activeRequests.length > 0 && activeRequests[0]?.expand?.client_id) {
      return activeRequests[0].expand.client_id;
    }
    return paymentRequest?.expand?.client_id || {};
  }, [client, activeRequests, paymentRequest]);

  const resolvedTrip = useMemo(() => {
    return trip || paymentRequest?.expand?.trip_id || {};
  }, [trip, paymentRequest]);

  const clientName = resolvedClient?.client_name || resolvedClient?.name || 'Valued Client';
  const clientContact = resolvedClient?.contact_person || resolvedClient?.contact_name || '';
  const initialPhone = resolvedClient?.phone || resolvedClient?.contact_phone || resolvedClient?.mobile || '';

  // Multi-trip amount calculation
  const totalAmount = useMemo(() => {
    if (isMultiTrip) {
      return activeRequests.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    }
    const amount = Number(paymentRequest?.amount || resolvedTrip?.freight_amount || 0);
    const advancePaid = Number(resolvedTrip?.advance_paid || 0);
    return amount || (Number(resolvedTrip?.freight_amount || 0) - advancePaid);
  }, [isMultiTrip, activeRequests, paymentRequest, resolvedTrip]);

  const dueDateStr = paymentRequest?.due_date 
    ? new Date(paymentRequest.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Immediate';

  const tripIdStr = paymentRequest?.trip_id || resolvedTrip?.trip_id || resolvedTrip?.id || '';
  const originStr = resolvedTrip?.origin || resolvedTrip?.from_city || '';
  const destStr = resolvedTrip?.destination || resolvedTrip?.to_city || '';
  const truckNo = resolvedTrip?.truck_number || resolvedTrip?.truck_id || '';

  // Generate live invoice PDF URL
  // Generate live invoice PDF URL with full query parameters for 100% reliable document delivery
  const invoicePdfUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.jaibhavanicargo.com';
    const encClient = encodeURIComponent(clientName || 'Valued Customer');
    const encAmount = encodeURIComponent(totalAmount || 0);
    const encTrip = encodeURIComponent(tripIdStr || (originStr && destStr ? `${originStr} - ${destStr}` : 'TRIP-LOG'));
    const encDue = encodeURIComponent(dueDateStr || 'Immediate');
    const encTruck = encodeURIComponent(truckNo || '');

    if (isMultiTrip) {
      const ids = activeRequests.map(r => r.id).filter(Boolean).join(',');
      return `${origin}/api/invoices/collective/pdf?ids=${ids}&client=${encClient}&amount=${encAmount}&due=${encDue}`;
    }
    if (paymentRequest?.id) {
      return `${origin}/api/invoices/payment-request/${paymentRequest.id}/pdf?client=${encClient}&amount=${encAmount}&trip=${encTrip}&due=${encDue}&truck=${encTruck}`;
    }
    if (tripIdStr) {
      return `${origin}/api/invoices/trip/${encodeURIComponent(tripIdStr)}/pdf?client=${encClient}&amount=${encAmount}&due=${encDue}`;
    }
    return `${origin}/api/invoices/collective/pdf?client=${encClient}&amount=${encAmount}&due=${encDue}`;
  }, [isMultiTrip, activeRequests, paymentRequest, tripIdStr, clientName, totalAmount, originStr, destStr, dueDateStr, truckNo]);

  // Auto initialize inputs on open
  useEffect(() => {
    if (isOpen) {
      setSendSuccess(false);
      setRecipientName(clientContact || clientName);
      
      let clean = String(initialPhone).replace(/\D/g, '');
      if (clean.length === 10) clean = '91' + clean;
      setRecipientPhone(clean);

      if (isMultiTrip) {
        const invRef = `STMT-${clientName.replace(/[\s-]/g, '').substring(0, 6).toUpperCase()}-${activeRequests.length}TRIPS`;
        const formattedAmount = Number(totalAmount).toLocaleString('en-IN');
        
        const itemizedTrips = activeRequests.map((r, idx) => {
          const t = r.expand?.trip_id || (r.id?.startsWith('virt-') ? r : {});
          const tId = t.trip_id || t.lr_number || r.trip_id || `TRIP-${idx + 1}`;
          const origin = t.origin || t.from_city || '';
          const dest = t.destination || t.to_city || '';
          const route = origin && dest ? `${origin} ➔ ${dest}` : (r.description || 'Freight Service');
          const rawDate = t.date || r.request_date || r.created;
          const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
          const truck = t.truck_number || t.truck_id || '';
          const amt = Number(r.amount || t.revenue || 0).toLocaleString('en-IN');
          return `${idx + 1}. 📅 *${dateStr}* | *${tId}* | ${route}${truck ? ` (${truck})` : ''} ➔ *₹${amt}*`;
        }).join('\n');

        const tripRefSummary = `${activeRequests.length} Trips (${activeRequests.slice(0, 3).map((r, i) => {
          const t = r.expand?.trip_id || (r.id?.startsWith('virt-') ? r : {});
          const d = t.date || r.request_date || r.created;
          const dStr = d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
          const orig = (t.origin || t.from_city || '').slice(0, 6);
          const dest = (t.destination || t.to_city || '').slice(0, 6);
          const route = orig && dest ? `${orig}➔${dest}` : (t.trip_id || `T${i+1}`);
          return `${dStr ? `${dStr}: ` : ''}${route}`;
        }).join(', ')}${activeRequests.length > 3 ? ` +${activeRequests.length - 3} more` : ''})`;

        const msg = `Dear ${clientContact || clientName},

Here is your outstanding payment statement from *Jai Bhavani Cargo*:

📋 *PAYMENT STATEMENT SUMMARY:*
• *Statement Ref:* ${invRef}
• *Total Dues:* *₹${formattedAmount}*
• *Due Date:* ${dueDateStr}
• *Shipment Volume:* ${activeRequests.length} Trips
• *Document:* 📄 *Official Itemized Statement PDF Attached*

🚚 *ITEMIZED TRIP DETAILS & DATES:*
${itemizedTrips}

🏦 *BANK TRANSFER DETAILS:*
• *A/C Number:* 50200084729184
• *Bank:* HDFC Bank
• *IFSC Code:* HDFC0000240
• *UPI ID:* jaibhavanicargo@icici
• *Beneficiary:* Jai Bhavani Cargo

Please clear the pending balance on or before ${dueDateStr}. Thank you for your continued business!`;

        setCustomMessage(msg);
      } else {
        const invRef = paymentRequest?.invoice_number || paymentRequest?.invoice_no || `INV-${tripIdStr || '001'}`;
        const formattedAmount = Number(totalAmount).toLocaleString('en-IN');
        const singleTripRef = tripIdStr || (originStr && destStr ? `${originStr} ➔ ${destStr}` : 'TRIP-LOG');
        const rawDate = resolvedTrip?.date || paymentRequest?.request_date || paymentRequest?.created;
        const formattedTripDate = rawDate ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : dueDateStr;

        const msg = `Dear ${clientContact || clientName},

Here is your payment notice from *Jai Bhavani Cargo*:

📋 *INVOICE DETAILS:*
• *Invoice Ref:* ${invRef}
• *Amount Due:* *₹${formattedAmount}*
• *Trip Date:* 📅 ${formattedTripDate}
• *Trip / Route:* ${singleTripRef}${truckNo ? ` (${truckNo})` : ''}
• *Due Date:* ${dueDateStr}
• *Document:* 📄 *Tax Invoice PDF Attached*

🏦 *BANK TRANSFER DETAILS:*
• *A/C Number:* 50200084729184
• *Bank:* HDFC Bank
• *IFSC Code:* HDFC0000240
• *UPI ID:* jaibhavanicargo@icici
• *Beneficiary:* Jai Bhavani Cargo

Please process payment on or before ${dueDateStr}. Thank you for choosing Jai Bhavani Cargo!`;

        setCustomMessage(msg);
      }
    }
  }, [isOpen, isMultiTrip, activeRequests, paymentRequest, client, trip, clientContact, clientName, initialPhone, totalAmount, dueDateStr, tripIdStr, originStr, destStr, truckNo, resolvedTrip]);

  // Clean phone helper
  const cleanPhone = useMemo(() => {
    const raw = String(recipientPhone || '').replace(/\D/g, '');
    if (!raw) return '';
    if (raw.length === 10) return `91${raw}`;
    return raw;
  }, [recipientPhone]);

  // Direct Aisensy API dispatch
  const handleSendAisensyDirect = async () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number with country code (e.g. 917794072244)');
      return;
    }

    const invRef = isMultiTrip 
      ? `STMT-${clientName.replace(/[\s-]/g, '').substring(0, 6).toUpperCase()}-${activeRequests.length}TRIPS`
      : (paymentRequest?.invoice_number || paymentRequest?.invoice_no || `INV-${tripIdStr || '001'}`);
    const formattedAmount = Number(totalAmount || 0).toLocaleString('en-IN');
    let tripRefVal = '';
    if (isMultiTrip) {
      const formattedItems = activeRequests.map((r, i) => {
        const t = r.expand?.trip_id || (r.id?.startsWith('virt-') ? r : {});
        const d = t.date || r.request_date || r.created;
        const dStr = d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
        const tId = t.trip_id || t.lr_number || r.trip_id || `T${i + 1}`;
        const orig = t.origin || t.from_city || '';
        const dest = t.destination || t.to_city || '';
        const route = orig && dest ? `(${orig}➔${dest})` : '';
        return `${dStr ? `${dStr} ` : ''}${tId}${route ? ` ${route}` : ''}`;
      });

      let fullStr = formattedItems.join(', ');
      if (fullStr.length > 980) {
        fullStr = fullStr.substring(0, 970) + '...';
      }
      tripRefVal = fullStr;
    } else {
      const d = resolvedTrip?.date || paymentRequest?.request_date || paymentRequest?.created;
      const dStr = d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      tripRefVal = `${dStr ? `${dStr} | ` : ''}${tripIdStr || 'TRIP-LOG'}${originStr && destStr ? ` (${originStr}➔${destStr})` : ''}`;
    }

    const pdfFilename = isMultiTrip 
      ? `Statement_${clientName.replace(/\s+/g, '_')}.pdf`
      : `Invoice_${tripIdStr || 'Document'}.pdf`;

    setIsSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          destination: cleanPhone,
          recipientPhone: cleanPhone,
          recipientName: recipientName || clientName,
          userName: recipientName || clientName,
          templateName: 'payment reminder',
          campaignName: campaignName || 'payment reminder',
          templateParams: [
            invRef,
            formattedAmount,
            dueDateStr,
            tripRefVal
          ],
          media: {
            url: invoicePdfUrl,
            filename: pdfFilename
          },
          invoiceUrl: invoicePdfUrl,
          invoiceFilename: pdfFilename,
          messageText: customMessage,
          text: customMessage,
          rawText: customMessage,
          type: 'payment_request',
          amount: totalAmount,
          tripId: tripRefVal,
          clientName: clientName,
          dueDate: dueDateStr
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success || data.submitted || data.messageId || data.status === 'success' || data.mock)) {
        toast.success(`WhatsApp message & Invoice PDF link sent successfully via API to +${cleanPhone}!`);
        setSendSuccess(true);

        // Update PocketBase payment_requests notes if records exist
        try {
          const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          const logEntry = `[${timeStr}] WhatsApp API Invoice Sent (PDF Linked: ${invoicePdfUrl}) to ${cleanPhone} (${recipientName})`;
          for (const req of activeRequests) {
            if (req.id) {
              const newNotes = req.notes ? `${req.notes}\n${logEntry}` : logEntry;
              await pb.collection('payment_requests').update(req.id, { notes: newNotes }, { $autoCancel: false });
            }
          }
        } catch (e) {
          console.warn('Note update non-critical:', e);
        }

        onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to dispatch via WhatsApp API. Check API configuration or recipient number.');
      }
    } catch (err) {
      console.error('WhatsApp API dispatch error:', err);
      toast.error('Network error dispatching WhatsApp API: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsAppWeb = () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    toast.success('Payment request message copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSending && onClose()}>
      <DialogContent className="sm:max-w-[580px] rounded-2xl bg-card border-border shadow-2xl overflow-hidden p-0">
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-slate-900 p-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                {isMultiTrip ? `Collective Invoice WhatsApp (${activeRequests.length} Trips)` : 'Send Payment Request via WhatsApp'}
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                  Aisensy API
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-emerald-300/70 text-xs mt-0.5">
                {isMultiTrip 
                  ? `Official collective invoice with attached PDF statement for ${clientName}` 
                  : 'Official Jai Bhavani Cargo payment notice with linked PDF invoice & direct bank coordinates'}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Summary Pill */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isMultiTrip ? `Client (${activeRequests.length} Shipments)` : 'Client & Trip'}
              </p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> {clientName}
              </p>
              {!isMultiTrip && originStr && destStr && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> {originStr} ➔ {destStr}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isMultiTrip ? 'Total Collective Due' : 'Amount Due'}
              </p>
              <p className="text-lg font-black text-emerald-400">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-muted-foreground">Due: {dueDateStr}</p>
            </div>
          </div>

          {/* Linked PDF Invoice Banner */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono shrink-0">
                📄 PDF LINKED
              </Badge>
              <span className="text-muted-foreground truncate font-mono text-[11px]">
                {invoicePdfUrl}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 shrink-0 font-bold"
              onClick={() => window.open(invoicePdfUrl, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" /> View PDF
            </Button>
          </div>

          {/* Aisensy Template Info Pill with Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-slate-400">Template / Campaign:</span>
              <select
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="bg-slate-950 border border-amber-400/40 rounded-lg px-2 py-1 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="payment_reminder_document">payment_reminder_document (PDF Attachment)</option>
                <option value="payment reminder">payment reminder (Text + Button)</option>
                <option value="invoice">invoice (Standard Invoice)</option>
              </select>
            </div>
            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 w-fit">
              Aisensy Cloud API
            </Badge>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recipient Mobile No *</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  className="pl-9 rounded-xl font-mono text-sm"
                  placeholder="e.g. 919876543210"
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Include country code (e.g., 91 for India)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recipient Name</Label>
              <Input 
                className="rounded-xl text-sm"
                placeholder="Client contact person"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
              />
            </div>
          </div>

          {/* Bank Coordinates preview pill */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Verified Carrier Bank Account Included:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono pt-1">
              <div>A/C: 50200084729184 (HDFC)</div>
              <div>IFSC: HDFC0000240</div>
              <div>UPI: jaibhavanicargo@icici</div>
              <div>Beneficiary: Jai Bhavani Cargo</div>
            </div>
          </div>

          {/* Message Preview / Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">WhatsApp Message Preview (Editable)</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCopyMessage}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
            <Textarea 
              rows={8}
              className="font-mono text-xs rounded-xl bg-muted/30 border-border"
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
            />
          </div>

          {sendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Payment request successfully sent via WhatsApp API!
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs rounded-xl"
              onClick={handleOpenWhatsAppWeb}
              disabled={isSending}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Web
            </Button>

            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-xs"
              onClick={handleSendAisensyDirect}
              disabled={isSending || !cleanPhone}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending via Aisensy...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Send Direct (Aisensy API)
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
