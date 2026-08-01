import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MessageSquare, Share2, Copy, Send, CheckCircle2, Phone, ExternalLink, Calendar, Truck, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WhatsAppShareModal({ isOpen, onClose, trip, paymentData = null, defaultTemplate = 'payment_confirmation' }) {
  const [templateType, setTemplateType] = useState(defaultTemplate);
  const [phone, setPhone] = useState('');
  const [customText, setCustomText] = useState('');
  const [etaDate, setEtaDate] = useState('');

  // Extract initial phone number from trip / client / driver data
  React.useEffect(() => {
    if (trip) {
      const clientPhone = trip.expand?.client_id?.phone || trip.client_phone || '';
      const driverPhone = trip.driver_phone || trip.expand?.driver_id?.phone || '';
      setPhone(clientPhone || driverPhone || '');

      // Set default ETA date
      if (trip.expected_delivery_date) {
        setEtaDate(trip.expected_delivery_date.split('T')[0]);
      } else {
        // Default ETA: 2 days after trip date
        const tripD = trip.date ? new Date(trip.date) : new Date();
        tripD.setDate(tripD.getDate() + 2);
        setEtaDate(tripD.toISOString().split('T')[0]);
      }
    }
  }, [trip, isOpen]);

  // Sync template type if defaultTemplate changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTemplateType(defaultTemplate);
    }
  }, [isOpen, defaultTemplate]);

  const generatedMessage = useMemo(() => {
    if (!trip) return '';

    const tripId = trip.trip_id || trip.id || 'N/A';
    const clientName = trip.expand?.client_id?.client_name || trip.client_name || 'Valued Client';
    const truckNo = trip.truck_number || 'N/A';
    const driverName = trip.driver_name || 'N/A';
    const route = trip.route || `${trip.origin || 'Origin'} ➔ ${trip.destination || 'Destination'}`;
    const status = trip.trip_status || 'In Transit';
    const revenue = (trip.revenue || 0).toLocaleString('en-IN');
    const advReceived = (trip.advance_received_from_client || 0).toLocaleString('en-IN');
    
    // Formatting date
    let formattedDate = 'Today';
    try {
      if (trip.date) formattedDate = format(new Date(trip.date), 'dd MMM yyyy');
    } catch (e) {}

    // Formatted ETA
    let formattedEta = 'As per schedule';
    if (etaDate) {
      try {
        formattedEta = format(new Date(etaDate), 'dd MMM yyyy (E)');
      } catch (e) {}
    }

    const trackingLink = `https://www.jaibhavanicargo.com/track/${encodeURIComponent(tripId)}`;

    if (templateType === 'payment_confirmation') {
      const amountReceived = paymentData?.amount ? (Number(paymentData.amount)).toLocaleString('en-IN') : advReceived;
      const paymentMode = paymentData?.payment_method || trip.client_payment_status || 'Bank Transfer / Online';
      const balancePending = Math.max(0, (trip.revenue || 0) - (trip.advance_received_from_client || 0)).toLocaleString('en-IN');

      return `✅ *JAI BHAVANI CARGO - PAYMENT RECEIVED CONFIRMATION*

Dear *${clientName}*,

We have successfully received payment for your freight shipment. Here are the transaction details:

📌 *Payment Details:*
• Trip / LR No: *${tripId}*
• Amount Received: *₹${amountReceived}*
• Payment Date: *${formattedDate}*
• Payment Mode: *${paymentMode}*
• Vehicle No: *${truckNo}*
• Route: *${route}*
• Outstanding Balance: *₹${balancePending}*

Thank you for your business!
*Jai Bhavani Cargo & Logistics*
📞 Support: +91 9876543210`;
    } 
    
    if (templateType === 'eta_delivery') {
      return `🚚 *JAI BHAVANI CARGO - LIVE SHIPMENT & DELIVERY ETA*

Dear *${clientName}*,

Your shipment is currently active and en-route! Here is the latest dispatch & ETA status:

📌 *Shipment Info:*
• Trip / LR No: *${tripId}*
• Vehicle No: *${truckNo}*
• Driver: *${driverName}*
• Route: *${route}*
• Current Status: *${status}*
• Expected Delivery (ETA): *${formattedEta}*

📍 *Live GPS Tracking:*
${trackingLink}

Thank you for shipping with Jai Bhavani Cargo!
📞 Support: +91 9876543210`;
    }

    if (templateType === 'payment_reminder') {
      const balance = Math.max(0, (trip.revenue || 0) - (trip.advance_received_from_client || 0)).toLocaleString('en-IN');
      return `💰 *JAI BHAVANI CARGO - FREIGHT PAYMENT REMINDER*

Dear *${clientName}*,

This is a friendly reminder regarding the outstanding balance for Trip / LR No: *${tripId}*.

📌 *Invoice Summary:*
• LR / Trip No: *${tripId}*
• Vehicle No: *${truckNo}*
• Total Freight: ₹${revenue}
• Outstanding Balance: *₹${balance}*

Kindly arrange for payment processing at your earliest convenience.

Thank you,
*Jai Bhavani Cargo Accounts Desk*
📞 Support: +91 9876543210`;
    }

    if (templateType === 'trip_dispatch') {
      return `📋 *JAI BHAVANI CARGO - TRIP DISPATCH SHEET*

📌 *Dispatch Details:*
• LR / Trip No: *${tripId}*
• Client: *${clientName}*
• Vehicle No: *${truckNo}*
• Driver Name: *${driverName}*
• Route: *${route}*
• Dispatch Date: *${formattedDate}*
• Status: *${status}*

📍 *Live Tracking:*
${trackingLink}

*Jai Bhavani Cargo Operations Team*`;
    }

    return customText || `Hello *${clientName}*, update regarding Trip *${tripId}* from Jai Bhavani Cargo.`;
  }, [trip, templateType, paymentData, customText, etaDate]);

  const cleanPhone = useMemo(() => {
    const raw = phone.replace(/[^0-9]/g, '');
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip ${trip?.trip_id || ''} Update`,
          text: generatedMessage
        });
        toast.success('Shared successfully!');
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopyText();
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Share WhatsApp Updates (Trip {trip.trip_id || trip.id})
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Instantly send Payment Received Confirmations or Live Delivery ETAs to clients & consignees via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Message Type / Template</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-emerald-400">
                <SelectValue placeholder="Choose Template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="payment_confirmation">✅ Payment Received Confirmation</SelectItem>
                <SelectItem value="eta_delivery">🚚 Live Delivery ETA & GPS Tracking</SelectItem>
                <SelectItem value="payment_reminder">💰 Outstanding Payment Reminder</SelectItem>
                <SelectItem value="trip_dispatch">📋 Trip Dispatch Advice Sheet</SelectItem>
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

            {templateType === 'eta_delivery' && (
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
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Live Message Preview
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {cleanPhone ? `Target: +${cleanPhone}` : 'No phone entered'}
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
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Text
          </Button>
          <Button onClick={handleSendWhatsApp} className="rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Send className="w-3.5 h-3.5 mr-1.5" /> Share on WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
