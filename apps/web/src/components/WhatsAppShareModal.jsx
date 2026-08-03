import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MessageSquare, Share2, Copy, Send, CheckCircle2, Phone, ExternalLink, Calendar, Truck, Check, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WhatsAppShareModal({ 
  isOpen, 
  onClose, 
  trip = null, 
  quote = null,
  invoice = null,
  pod = null,
  paymentData = null, 
  defaultTemplate = 'booking_confirmation',
  overridePhone = ''
}) {
  const [templateType, setTemplateType] = useState(defaultTemplate);
  const [phone, setPhone] = useState(overridePhone);
  const [customText, setCustomText] = useState('');
  const [etaDate, setEtaDate] = useState('');

  // Extract initial phone number from trip / client / driver data
  React.useEffect(() => {
    if (overridePhone) {
      setPhone(overridePhone);
    } else if (trip) {
      const clientPhone = trip.expand?.client_id?.phone || trip.client_phone || '';
      const driverPhone = trip.driver_phone || trip.expand?.driver_id?.phone || '';
      setPhone(clientPhone || driverPhone || '');
    } else if (quote) {
      setPhone(quote.client_phone || quote.expand?.client_id?.phone || '');
    } else if (invoice) {
      setPhone(invoice.client_phone || invoice.expand?.client_id?.phone || '');
    }

    if (trip) {
      if (trip.expected_delivery_date) {
        setEtaDate(trip.expected_delivery_date.split('T')[0]);
      } else {
        const tripD = trip.date ? new Date(trip.date) : new Date();
        tripD.setDate(tripD.getDate() + 2);
        setEtaDate(tripD.toISOString().split('T')[0]);
      }
    }
  }, [trip, quote, invoice, overridePhone, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      setTemplateType(defaultTemplate);
    }
  }, [isOpen, defaultTemplate]);

  const generatedMessage = useMemo(() => {
    const trackingBase = 'https://www.jaibhavanicargo.com';

    // 1. BOOKING CONFIRMATION WITH DRIVER & VEHICLE DETAILS
    if (templateType === 'booking_confirmation') {
      const tripId = trip?.trip_id || trip?.id || quote?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || quote?.client_name || 'Valued Partner';
      const truckNo = trip?.truck_number || 'To Be Assigned';
      const truckSize = trip?.truck_size || trip?.truck_type || '24 FT Container';
      const driverName = trip?.driver_name || trip?.expand?.driver_id?.name || 'Assigned Driver';
      const driverPhone = trip?.driver_phone || trip?.expand?.driver_id?.phone || 'Contact Dispatch';
      const route = trip?.route || `${trip?.origin || 'Origin'} ➔ ${trip?.destination || 'Destination'}`;
      let loadingDate = 'Today';
      try {
        if (trip?.date) loadingDate = format(new Date(trip.date), 'dd MMM yyyy');
      } catch(e) {}

      return `🚛 *JAI BHAVANI CARGO - TRIP BOOKING & DISPATCH CONFIRMATION*

Dear *${clientName}*,

Your freight trip booking has been confirmed! Here are the vehicle & driver details:

📌 *Booking & Vehicle Info:*
• Booking / LR Ref: *${tripId}*
• Vehicle No: *${truckNo}* (${truckSize})
• Route: *${route}*
• Loading Date: *${loadingDate}*

👤 *Assigned Driver Details:*
• Driver Name: *${driverName}*
• Contact No: *${driverPhone}*

📍 *Live GPS Shipment Tracking:*
${trackingBase}/track/${encodeURIComponent(tripId)}

Thank you for choosing Jai Bhavani Cargo & Logistics!
📞 Operations Support: +91 9876543210`;
    }

    // 2. RATE QUOTE / FREIGHT ESTIMATION
    if (templateType === 'quote') {
      const quoteNo = quote?.quote_no || quote?.id || trip?.trip_id || 'QT-8821';
      const clientName = quote?.client_name || trip?.expand?.client_id?.client_name || 'Valued Customer';
      const route = quote?.route || `${quote?.origin || 'Origin'} ➔ ${quote?.destination || 'Destination'}` || trip?.route || 'Origin ➔ Destination';
      const vehicleType = quote?.truck_type || trip?.truck_size || '32 FT MX / 24 FT HQ';
      const rate = (quote?.amount || quote?.quoted_rate || trip?.revenue || 0).toLocaleString('en-IN');
      const validTill = quote?.valid_till ? format(new Date(quote.valid_till), 'dd MMM yyyy') : '7 Days';

      return `🏷️ *JAI BHAVANI CARGO - OFFICIAL FREIGHT RATE QUOTATION*

Dear *${clientName}*,

Please find below our official logistics rate quote for your route requirements:

📌 *Quotation Details (${quoteNo}):*
• Route: *${route}*
• Vehicle Required: *${vehicleType}*
• Quoted Freight Rate: *₹${rate}* (Excl. GST)
• Rate Validity: *${validTill}*

✅ *Service Inclusions:*
• Dedicated GPS Tracking Link
• Experienced Highway Driver & Verified Vehicle
• 24x7 Control Room Support

To confirm booking or request modifications, please respond to this message.

*Jai Bhavani Cargo & Logistics*
📞 Booking Desk: +91 9876543210`;
    }

    // 3. INVOICE / BILL SUMMARY
    if (templateType === 'invoice') {
      const invNo = invoice?.invoice_no || invoice?.id || trip?.trip_id || 'INV-001';
      const clientName = invoice?.client_name || trip?.expand?.client_id?.client_name || 'Valued Customer';
      const amount = (invoice?.total_amount || invoice?.amount || trip?.revenue || 0).toLocaleString('en-IN');
      const dueDate = invoice?.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : 'Immediate';

      return `🧾 *JAI BHAVANI CARGO - FREIGHT INVOICE SUMMARY*

Dear *${clientName}*,

Please find the details for Invoice *#${invNo}*:

📌 *Invoice Breakdown:*
• Invoice No: *${invNo}*
• Total Amount Payable: *₹${amount}*
• Due Date: *${dueDate}*

🏦 *Bank Account Details for Payment:*
• Account Name: Jai Bhavani Cargo & Logistics
• Bank Name: HDFC Bank
• Account No: 50200098765432
• IFSC Code: HDFC0001234
• GSTIN: 36DPXPR9171A1Z8

Thank you for your prompt settlement!
*Jai Bhavani Cargo Billing Desk*
📞 Support: +91 9876543210`;
    }

    // 4. LIVE TRIP STATUS UPDATE
    if (templateType === 'trip_status' || templateType === 'eta_delivery') {
      const tripId = trip?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Client';
      const truckNo = trip?.truck_number || 'N/A';
      const driverName = trip?.driver_name || 'N/A';
      const route = trip?.route || 'Origin ➔ Destination';
      const status = trip?.trip_status || 'In Transit';
      
      let formattedEta = 'En-route as per schedule';
      if (etaDate) {
        try { formattedEta = format(new Date(etaDate), 'dd MMM yyyy (E)'); } catch (e) {}
      }

      return `🚚 *JAI BHAVANI CARGO - LIVE TRIP STATUS & ETA UPDATE*

Dear *${clientName}*,

Here is the real-time status update for Trip / LR No: *${tripId}*:

📌 *Current Progress:*
• Trip / LR No: *${tripId}*
• Status: *${status}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Driver: *${driverName}*
• Expected Delivery (ETA): *${formattedEta}*

📍 *Live GPS Location & Route Tracking:*
${trackingBase}/track/${encodeURIComponent(tripId)}

*Jai Bhavani Cargo Control Room*
📞 Hotline: +91 9876543210`;
    }

    // 5. POD (PROOF OF DELIVERY) ACKNOWLEDGEMENT
    if (templateType === 'pod_proof') {
      const tripId = trip?.trip_id || pod?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Customer';
      const truckNo = trip?.truck_number || 'N/A';
      const deliveredDate = pod?.delivery_date || trip?.delivery_date ? format(new Date(pod?.delivery_date || trip?.delivery_date), 'dd MMM yyyy (hh:mm a)') : 'Today';

      return `📑 *JAI BHAVANI CARGO - PROOF OF DELIVERY (POD) ACKNOWLEDGEMENT*

Dear *${clientName}*,

We are pleased to inform you that your shipment under Trip / LR No: *${tripId}* has been successfully DELIVERED!

📌 *Delivery Summary:*
• Trip / LR No: *${tripId}*
• Vehicle No: *${truckNo}*
• Status: *DELIVERED & ACKNOWLEDGED*
• Delivery Timestamp: *${deliveredDate}*

📄 *View Clean Signed POD Copy:*
${trackingBase}/track/${encodeURIComponent(tripId)}

Thank you for partnering with Jai Bhavani Cargo & Logistics!
📞 Customer Care: +91 9876543210`;
    }

    // 6. PAYMENT CONFIRMATION
    if (templateType === 'payment_confirmation') {
      const tripId = trip?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Client';
      const amountReceived = paymentData?.amount ? (Number(paymentData.amount)).toLocaleString('en-IN') : (trip?.advance_received_from_client || 0).toLocaleString('en-IN');
      const paymentMode = paymentData?.payment_method || trip?.client_payment_status || 'Bank Transfer / Online';
      const balancePending = Math.max(0, (trip?.revenue || 0) - (trip?.advance_received_from_client || 0)).toLocaleString('en-IN');

      return `✅ *JAI BHAVANI CARGO - PAYMENT RECEIVED CONFIRMATION*

Dear *${clientName}*,

We have successfully received payment for your freight shipment. Here are the transaction details:

📌 *Payment Receipt Details:*
• Trip / LR No: *${tripId}*
• Amount Received: *₹${amountReceived}*
• Payment Mode: *${paymentMode}*
• Vehicle No: *${trip?.truck_number || 'N/A'}*
• Route: *${trip?.route || 'N/A'}*
• Balance Pending: *₹${balancePending}*

Thank you for your business!
*Jai Bhavani Cargo & Logistics*
📞 Accounts Support: +91 9876543210`;
    }

    return customText || `Hello, update from Jai Bhavani Cargo.`;
  }, [trip, quote, invoice, pod, templateType, paymentData, customText, etaDate]);

  const cleanPhone = useMemo(() => {
    const raw = (phone || '').replace(/[^0-9]/g, '');
    if (!raw) return '';
    if (raw.length === 10) return `91${raw}`;
    return raw;
  }, [phone]);

  const handleSendWhatsApp = () => {
    if (!cleanPhone) {
      toast.error('Please enter a valid phone number');
      return;
    }
    const text = encodeURIComponent(generatedMessage);
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success('Message text copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            WhatsApp Share Desk
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Share Quotes, Invoices, Booking Confirmations with Driver/Vehicle details, Trip Status, or PODs via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Select Document / Update Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-emerald-400">
                <SelectValue placeholder="Choose Template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="booking_confirmation">🚛 Booking Confirmation (Driver & Vehicle Details)</SelectItem>
                <SelectItem value="quote">🏷️ Rate Quote / Freight Estimation</SelectItem>
                <SelectItem value="invoice">🧾 Freight Invoice / Bill Summary</SelectItem>
                <SelectItem value="trip_status">🚚 Live Trip Status Update & ETA</SelectItem>
                <SelectItem value="pod_proof">📑 POD (Proof of Delivery) Copy Link</SelectItem>
                <SelectItem value="payment_confirmation">✅ Payment Received Confirmation</SelectItem>
                <SelectItem value="custom">✏️ Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Phone Input & ETA Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number (WhatsApp)
              </Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="bg-slate-900 border-slate-800 text-xs font-mono rounded-xl text-white"
              />
            </div>

            {templateType === 'trip_status' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Delivery ETA Date
                </Label>
                <Input
                  type="date"
                  value={etaDate}
                  onChange={e => setEtaDate(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            )}
          </div>

          {templateType === 'custom' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Custom Text</Label>
              <Textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Write custom message..."
                className="bg-slate-900 border-slate-800 text-xs rounded-xl text-white h-20"
              />
            </div>
          )}

          {/* Live Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> WhatsApp Message Preview
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {cleanPhone ? `Sending to +${cleanPhone}` : 'Enter recipient phone'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed shadow-inner">
              {generatedMessage}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="pt-3 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs border-slate-800 text-slate-300">
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCopyText} className="rounded-xl text-xs font-bold border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Message Text
          </Button>
          <Button onClick={handleSendWhatsApp} className="rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Send className="w-3.5 h-3.5 mr-1.5" /> Share on WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
