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
      if (defaultTemplate === 'driver_dispatch') {
        const driverPhone = trip.driver_phone || trip.expand?.driver_id?.phone || '';
        setPhone(driverPhone || '');
      } else {
        const clientPhone = trip.expand?.client_id?.phone || trip.client_phone || '';
        const driverPhone = trip.driver_phone || trip.expand?.driver_id?.phone || '';
        setPhone(clientPhone || driverPhone || '');
      }
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


  // Helper to extract document download URL for attachments
  const activeDocumentUrl = useMemo(() => {
    if (templateType === 'invoice') {
      return invoice?.file_url || invoice?.pdf_url || (invoice?.id ? `https://www.jaibhavanicargo.com/api/invoices/${invoice.id}/pdf` : (trip?.id ? `https://www.jaibhavanicargo.com/api/invoices/trip/${trip.id}/pdf` : ''));
    }
    if (templateType === 'quote') {
      return quote?.file_url || quote?.pdf_url || (quote?.id ? `https://www.jaibhavanicargo.com/api/quotes/${quote.id}/pdf` : '');
    }
    if (templateType === 'pod_proof') {
      return pod?.file_url || pod?.image_url || trip?.pod_file_url || trip?.pod_image_url || trip?.pod_image || (trip?.trip_id ? `https://www.jaibhavanicargo.com/track/${encodeURIComponent(trip.trip_id)}` : '');
    }
    if (templateType === 'booking_confirmation') {
      return trip?.lr_copy_url || trip?.document_url || (trip?.trip_id ? `https://www.jaibhavanicargo.com/track/${encodeURIComponent(trip.trip_id)}` : '');
    }
    return trip?.document_url || trip?.pod_file_url || '';
  }, [templateType, invoice, quote, pod, trip]);

  const handleDownloadAttachment = () => {
    if (!activeDocumentUrl) {
      toast.error('No attached document file found for this record.');
      return;
    }
    window.open(activeDocumentUrl, '_blank');
    toast.success('Downloading document attachment...');
  };

  const generatedMessage = useMemo(() => {
    const trackingBase = 'https://www.jaibhavanicargo.com';
    const officialPhone = '+91 7799072244';
    const officialEmail = 'operations@jaibhavanicargo.com';
    const officialBank = `🏦 *Official Bank Account for Remittance:*
• Bank: HDFC BANK
• Account No: 50200086884846
• IFSC Code: HDFC0000456
• Branch: Ghatkesar Branch
• Beneficiary: Jai Bhavani Cargo & Logistics
• GSTIN: 36DPXPR9171A1Z8`;

    // 0. DRIVER DISPATCH & GPS NAVIGATION TO UNLOADING POINT
    if (templateType === 'driver_dispatch') {
      const tripId = trip?.lr_number || trip?.trip_id || trip?.id || 'TRIP';
      const truckNo = trip?.truck_number || 'N/A';
      const driverName = trip?.driver_name || trip?.expand?.driver_id?.name || 'Driver';
      const routeStr = trip?.route || (trip?.origin && trip?.destination ? `${trip.origin} to ${trip.destination}` : 'Corridor Highway');
      const routeParts = routeStr.split(/➔|->|to|TO/i);
      const origCity = (trip?.origin || trip?.start_location || routeParts[0] || 'Origin Hub').trim();
      const destCity = (trip?.destination || trip?.end_location || routeParts[1] || 'Destination Hub').trim();

      const origGps = trip?.start_location_map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(origCity)}`;
      const destGps = trip?.end_location_map_link || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destCity)}`;
      const driverNavUrl = `${trackingBase}/driver-nav/${encodeURIComponent(tripId)}`;

      return `📍 *JAI BHAVANI CARGO - DRIVER GPS NAVIGATION & TRIP ROUTE*

Dear *${driverName}*,

Here are your dock directions & Google Maps GPS navigation for Truck *${truckNo}* (Trip/LR: *${tripId}*):

🛣️ *Assigned Highway Route:*
• Corridor: *${origCity} ➔ ${destCity}*

🏢 *Loading Hub Point:*
• Location: *${origCity}*
• Map Link: ${origGps}

🎯 *Final Unloading / Delivery Point:*
• Location: *${destCity}*
• Direct GPS Navigation: ${destGps}

📱 *Driver 1-Tap Navigation Dashboard:*
${driverNavUrl}

Drive safe, adhere to highway lane rules, and inform control room upon arrival!
📞 Operations Support: ${officialPhone}`;
    }

    // 1. BOOKING CONFIRMATION WITH DRIVER & VEHICLE DETAILS
    if (templateType === 'booking_confirmation') {
      const tripId = trip?.lr_number || trip?.trip_id || trip?.id || quote?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || quote?.client_name || 'Valued Partner';
      const truckNo = trip?.truck_number || 'To Be Assigned';
      const truckSize = trip?.truck_size || trip?.truck_type || 'Container Truck';
      const driverName = trip?.driver_name || trip?.expand?.driver_id?.name || 'Assigned Highway Driver';
      const rawDriverPhone = trip?.driver_phone || trip?.expand?.driver_id?.phone;
      const driverPhone = rawDriverPhone ? String(rawDriverPhone) : `${officialPhone} (Central Dispatch)`;
      const route = trip?.route || (trip?.origin && trip?.destination ? `${trip.origin} ➔ ${trip.destination}` : 'Origin ➔ Destination');
      let loadingDate = 'Today';
      try {
        if (trip?.date) loadingDate = format(new Date(trip.date), 'dd MMM yyyy');
      } catch(e) {}

      const sealSnippet = (trip?.is_sealed || trip?.seal_number) ? `\n• 🔒 Security Seal(s): *${trip.seal_number || 'Applied & Verified'}*` : '';

      return `🚛 *JAI BHAVANI CARGO - TRIP BOOKING & VEHICLE CONFIRMATION*

Dear *${clientName}*,

Your freight booking has been confirmed! Here are the allocated vehicle & driver details:

📌 *Consignment & Vehicle Info:*
• Booking / LR Ref: *${tripId}*
• Vehicle No: *${truckNo}* (${truckSize})
• Freight Route: *${route}*
• Scheduled Loading: *${loadingDate}*${sealSnippet}

👤 *Assigned Driver Details:*
• Driver Name: *${driverName}*
• Contact No: *${driverPhone}*

📍 *Live GPS Consignment Tracking:*
${trackingBase}/track/${encodeURIComponent(trip?.trip_id || trip?.id || tripId)}

Thank you for choosing Jai Bhavani Cargo & Logistics!
📞 Central Operations: ${officialPhone}
✉️ ${officialEmail}`;
    }

    // 2. RATE QUOTE / FREIGHT ESTIMATION
    if (templateType === 'quote') {
      const quoteNo = quote?.quote_no || quote?.quote_number || (trip?.lr_number ? `QT-${trip.lr_number}` : (trip?.trip_id ? `QT-${trip.trip_id}` : 'QT-2026-8812'));
      const clientName = quote?.client_name || quote?.customer_name || trip?.client_name || trip?.expand?.client_id?.client_name || 'Valued Customer';
      const rawAmount = quote?.amount || quote?.total_price || quote?.quoted_rate || trip?.revenue || 0;
      const rate = Number(rawAmount).toLocaleString('en-IN');
      const route = quote?.route || trip?.route || (trip?.origin && trip?.destination ? `${trip.origin} to ${trip.destination}` : (quote?.origin && quote?.destination ? `${quote.origin} ➔ ${quote.destination}` : 'Corridor Route'));
      const vehicleType = quote?.truck_type || trip?.truck_size || trip?.truck_type || '24 FT / 32 FT Container';
      const validTill = quote?.valid_till ? format(new Date(quote.valid_till), 'dd MMM yyyy') : '7 Days from quotation date';

      return `🏷️ *JAI BHAVANI CARGO - OFFICIAL FREIGHT RATE QUOTATION*

Dear *${clientName}*,

We are pleased to provide our official freight rate quotation for your corridor requirements:

📌 *Quotation Summary (${quoteNo}):*
• Corridor / Route: *${route}*
• Vehicle Required: *${vehicleType}*
• Quoted Freight Rate: *₹${rate}* (Excl. GST)
• Rate Validity: *7 Days from quotation date*

✅ *Key Inclusions:*
• Dedicated verified container vehicle & experienced highway driver
• Real-time GPS Tracking link with arrival alerts
• 24x7 Central Operations & Control Room monitoring

📄 *Official Quotation PDF & Portal:*
${activeDocumentUrl || 'https://www.jaibhavanicargo.com'}

To confirm vehicle dispatch or discuss schedule, please respond to this message.

*Jai Bhavani Cargo & Logistics*
📞 Booking Desk: ${officialPhone}
✉️ ${officialEmail}`;
    }

    // 3. INVOICE / BILL SUMMARY
    if (templateType === 'invoice') {
      const invNo = invoice?.invoice_no || invoice?.id || trip?.invoice_no || trip?.trip_id || 'INV-001';
      const clientName = invoice?.client_name || trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Customer';
      const amount = (invoice?.total_amount || invoice?.amount || trip?.revenue || 0).toLocaleString('en-IN');
      const dueDate = invoice?.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : 'Upon Receipt / Immediate';

      return `🧾 *JAI BHAVANI CARGO - FREIGHT INVOICE SUMMARY*

Dear *${clientName}*,

Please find the details for Freight Invoice *#${invNo}*:

📌 *Invoice Summary:*
• Invoice No: *${invNo}*
• Total Amount Payable: *₹${amount}*
• Payment Due Date: *${dueDate}*

${officialBank}

📄 *Download Digital Invoice PDF:*
${activeDocumentUrl || `${trackingBase}/api/invoices/trip/${encodeURIComponent(trip?.trip_id || trip?.id || invNo)}/pdf`}

Thank you for your prompt settlement!
*Jai Bhavani Cargo Billing Desk*
📞 Accounts Support: ${officialPhone}`;
    }

    // 4. LIVE TRIP STATUS UPDATE
    if (templateType === 'trip_status' || templateType === 'eta_delivery') {
      const tripId = trip?.lr_number || trip?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Client';
      const truckNo = trip?.truck_number || 'N/A';
      const driverName = trip?.driver_name || 'Assigned Highway Driver';
      const route = trip?.route || (trip?.origin && trip?.destination ? `${trip.origin} ➔ ${trip.destination}` : 'Origin ➔ Destination');
      const rawStatus = trip?.trip_status || 'In Transit';
      const isDelivered = rawStatus.toLowerCase().includes('deliver') || rawStatus.toLowerCase().includes('complete') || rawStatus.toLowerCase().includes('settle');
      
      let statusLine = '';
      let timeLine = '';
      if (isDelivered) {
        statusLine = '✅ DELIVERED & ACKNOWLEDGED';
        const delDate = trip?.delivery_date ? format(new Date(trip.delivery_date), 'dd MMM yyyy (hh:mm a)') : (trip?.date ? format(new Date(trip.date), 'dd MMM yyyy') : 'Delivered & Received');
        timeLine = `• Delivery Timestamp: *${delDate}*`;
      } else {
        statusLine = `🚚 ${rawStatus.toUpperCase()} (On Schedule)`;
        let formattedEta = 'En-route as per schedule';
        if (etaDate) {
          try { formattedEta = format(new Date(etaDate), 'dd MMM yyyy (E)'); } catch (e) {}
        }
        timeLine = `• Expected Delivery (ETA): *${formattedEta}*`;
      }

      const delayLine = trip?.late_delivery_reason ? `\n🚨 *Transit Notice:* ${trip.late_delivery_reason}` : '';
      const sealLine = (trip?.is_sealed || trip?.seal_number) ? `\n• 🔒 Security Seal(s): *${trip.seal_number || 'Applied & Intact'}*` : '';

      return `🚚 *JAI BHAVANI CARGO - LIVE TRIP STATUS & ETA UPDATE*

Dear *${clientName}*,

Here is the real-time consignment status for Trip / LR No: *${tripId}*:

📌 *Current Progress:*
• Trip / LR No: *${tripId}*
• Status: *${statusLine}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Driver: *${driverName}*${sealLine}
${timeLine}${delayLine}

📍 *Live GPS Consignment Tracking Link:*
${trackingBase}/track/${encodeURIComponent(trip?.trip_id || trip?.id || tripId)}

*Jai Bhavani Cargo Central Control Room*
📞 Hotline: ${officialPhone}`;
    }

    // 5. POD (PROOF OF DELIVERY) ACKNOWLEDGEMENT
    if (templateType === 'pod_proof') {
      const tripId = trip?.lr_number || trip?.trip_id || pod?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Customer';
      const truckNo = trip?.truck_number || 'N/A';
      const route = trip?.route || (trip?.origin && trip?.destination ? `${trip.origin} ➔ ${trip.destination}` : 'Origin ➔ Destination');
      const delDate = pod?.delivery_date || trip?.delivery_date ? format(new Date(pod?.delivery_date || trip?.delivery_date), 'dd MMM yyyy (hh:mm a)') : (trip?.date ? format(new Date(trip.date), 'dd MMM yyyy') : 'Delivered & Received');

      const rawPodFile = trip?.pod_file || trip?.pod_document || pod?.file || pod?.image;
      const podFileStr = typeof rawPodFile === 'string' ? rawPodFile.trim() : (Array.isArray(rawPodFile) && typeof rawPodFile[0] === 'string' ? rawPodFile[0].trim() : '');
      const signedPodUrl = (typeof trip?.pod_link === 'string' && trip.pod_link.trim())
        ? trip.pod_link.trim()
        : (podFileStr ? (podFileStr.startsWith('http') ? podFileStr : `${trackingBase}/api/files/${trip?.collectionName || 'trip_logs'}/${trip?.id || pod?.id}/${podFileStr}`) : '')
        || activeDocumentUrl 
        || `${trackingBase}/track/${encodeURIComponent(trip?.trip_id || trip?.id || tripId)}`;
      const invoicePdfUrl = `${trackingBase}/api/invoices/trip/${encodeURIComponent(trip?.trip_id || trip?.id || tripId)}/pdf`;

      return `📑 *JAI BHAVANI CARGO - PROOF OF DELIVERY (POD) ACKNOWLEDGEMENT*

Dear *${clientName}*,

We are pleased to inform you that your shipment under Trip / LR No: *${tripId}* has been successfully DELIVERED!

📌 *Delivery Summary:*
• Trip / LR No: *${tripId}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Delivery Status: *DELIVERED & ACKNOWLEDGED*
• Delivery Timestamp: *${delDate}*

📄 *View Signed POD Copy & Live Verification:*
${signedPodUrl}

🧾 *Download Official Consignment Invoice PDF:*
${invoicePdfUrl}

Thank you for choosing Jai Bhavani Cargo & Logistics!
📞 Accounts & POD Desk: ${officialPhone}`;
    }

    // 6. PAYMENT CONFIRMATION / REMINDER
    if (templateType === 'payment_confirmation') {
      const tripId = trip?.lr_number || trip?.trip_id || trip?.id || 'N/A';
      const clientName = trip?.expand?.client_id?.client_name || trip?.client_name || 'Valued Client';
      const truckNo = trip?.truck_number || 'N/A';
      const route = trip?.route || 'Corridor Transit';
      const rev = Number(trip?.revenue || paymentData?.total_amount || 0);
      const adv = Number(paymentData?.amount || trip?.advance_received_from_client || 0);
      const bal = Math.max(0, rev - adv);
      const isFullyPaid = bal <= 0 || trip?.client_payment_status === 'received' || trip?.client_payment_status === 'Paid';
      const payMode = paymentData?.payment_method || (trip?.client_payment_status && trip.client_payment_status !== 'pending' ? trip.client_payment_status : 'Bank Transfer / NEFT');

      if (isFullyPaid) {
        return `✅ *JAI BHAVANI CARGO - FULL PAYMENT SETTLEMENT CONFIRMATION*

Dear *${clientName}*,

We confirm receipt of the full payment settlement for your freight shipment:

📌 *Settlement Details:*
• Trip / LR Ref: *${tripId}*
• Total Freight: *₹${rev.toLocaleString('en-IN')}*
• Amount Received: *₹${(rev || adv).toLocaleString('en-IN')}*
• Payment Mode: *${payMode}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Balance Outstanding: *₹0 (Fully Cleared)*

Your account for this shipment is completely settled. Thank you for your business!
📞 Accounts Desk: ${officialPhone}`;
      }

      if (adv > 0 && bal > 0) {
        return `💵 *JAI BHAVANI CARGO - ADVANCE PAYMENT RECEIVED & BALANCE NOTICE*

Dear *${clientName}*,

We have received the advance freight payment for Trip / LR No: *${tripId}*. Here is your payment summary:

📌 *Payment Summary:*
• Trip / LR Ref: *${tripId}*
• Total Freight Agreed: *₹${rev.toLocaleString('en-IN')}*
• Advance Received: *₹${adv.toLocaleString('en-IN')}*
• Balance Pending Due: *₹${bal.toLocaleString('en-IN')}*
• Vehicle No: *${truckNo}*
• Route: *${route}*

${officialBank}

Thank you for your cooperation!
📞 Accounts Desk: ${officialPhone}`;
      }

      return `⚠️ *JAI BHAVANI CARGO - FREIGHT PAYMENT REMINDER*

Dear *${clientName}*,

This is a gentle payment reminder for freight shipment under Trip / LR No: *${tripId}*.

📌 *Consignment Summary:*
• Trip / LR Ref: *${tripId}*
• Total Freight Due: *₹${rev.toLocaleString('en-IN')}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Settlement Status: *Pending Payment*

${officialBank}

Please share the transaction reference once transferred.
📞 Billing Desk: ${officialPhone}`;
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
                <SelectItem value="driver_dispatch">📍 Send Location to Driver (GPS Navigation)</SelectItem>
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
          
          {activeDocumentUrl && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDownloadAttachment} 
              className="rounded-xl text-xs font-bold border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Attached File
            </Button>
          )}
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
