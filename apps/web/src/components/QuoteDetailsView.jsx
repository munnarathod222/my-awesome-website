import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { 
  User, MapPin, Package, FileText, Send, Download, Printer, CheckCircle, 
  FileText as FileTextIcon, Loader2, MessageSquare, PhoneCall, Save, Sparkles, RefreshCw, Mail
} from 'lucide-react';
import QuoteCalculationBreakdown from './QuoteCalculationBreakdown.jsx';
import WhatsAppShareModal from './WhatsAppShareModal.jsx';
import { cn } from '@/lib/utils.js';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';

const statusColors = {
  'Pending': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Draft': 'bg-muted text-muted-foreground border-border',
  'Quoted': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Accepted': 'bg-success/20 text-success border-success/30',
  'Negotiating': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Rejected': 'bg-destructive/20 text-destructive border-destructive/30'
};

const QuoteDetailsView = ({ isOpen, onClose, quote, onUpdate, onEdit, onConvertToInvoice, onTriggerEmail }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Response Form State
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quoteStatus, setQuoteStatus] = useState('Quoted');
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    if (quote) {
      setQuotedPrice(quote.total_price || '');
      setQuoteStatus(quote.status || 'Pending');
      setResponseNotes(quote.notes || '');
    }
  }, [quote]);

  if (!quote) return null;

  const mockCalculations = {
    volumetricWeight: quote.volumetric_weight || 0,
    chargeableWeight: quote.chargeable_weight || quote.actual_weight || 0,
    usedWeightType: quote.chargeable_weight === quote.actual_weight ? 'Actual' : 'Volumetric',
    weightCharge: quote.weight_charge || quote.total_price || 0,
    totalPrice: Number(quotedPrice) || quote.total_price || 0
  };

  const handleSaveResponse = async () => {
    setIsSaving(true);
    const updatedPrice = Number(quotedPrice) || quote.total_price || 0;
    const updatedStatus = quoteStatus;
    const updatedNotes = responseNotes;

    const payload = {
      quoteId: quote.id,
      status: updatedStatus,
      quotedAmount: updatedPrice,
      notes: updatedNotes
    };

    let saved = false;

    // 1. Try Backend Superuser Endpoint
    try {
      const res = await window.fetch('/hcgi/api/driver/respond-to-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        saved = true;
      }
    } catch (e) {}

    if (!saved) {
      try {
        const res = await window.fetch('/api/driver/respond-to-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          saved = true;
        }
      } catch (e) {}
    }

    // 2. Try PocketBase SDK directly
    if (quote.id && !quote.id.startsWith('qt_')) {
      try {
        await pb.collection('quotes').update(quote.id, {
          status: updatedStatus,
          total_price: updatedPrice,
          notes: updatedNotes
        }, { $autoCancel: false });
        saved = true;
      } catch (pbErr) {}
    }

    // 3. Update localStorage cache
    try {
      const local = JSON.parse(localStorage.getItem('jbc_public_quotes') || '[]');
      const updatedLocal = local.map(q => {
        if (q.id === quote.id || q.quote_number === quote.quote_number) {
          return { ...q, status: updatedStatus, total_price: updatedPrice, notes: updatedNotes };
        }
        return q;
      });
      localStorage.setItem('jbc_public_quotes', JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    setIsSaving(false);
    toast.success(`Quote #${quote.quote_number} updated to "${updatedStatus}" (₹${updatedPrice.toLocaleString('en-IN')})`);
    
    if (onUpdate) {
      onUpdate({ ...quote, status: updatedStatus, total_price: updatedPrice, notes: updatedNotes });
    }
  };

  const getDirectWhatsAppUrl = () => {
    const phoneClean = (quote.customer_phone || '').replace(/\D/g, '');
    const priceFormatted = Number(quotedPrice || quote.total_price || 0).toLocaleString('en-IN');
    const vehicleText = quote.truck_size === 'Other / Not Sure' && quote.custom_vehicle_requirement
      ? `Other / Not Sure (${quote.custom_vehicle_requirement})`
      : (quote.truck_size || quote.container_type || '32 FT SXL');
    const msg = `🚚 *JAI BHAVANI CARGO - FREIGHT QUOTE ESTIMATE*\n\n📄 *Quote Reference:* ${quote.quote_number}\n👤 *Customer:* ${quote.customer_name}\n📍 *Route:* ${quote.origin} ➡️ ${quote.destination}\n🚛 *Truck Size:* ${vehicleText}\n📦 *Shipment:* ${quote.actual_weight || 1000} kg\n\n💰 *Quoted Rate:* ₹${priceFormatted} (All inclusive)\n\nPlease reply with *ACCEPT* to confirm vehicle placement.`;
    
    if (phoneClean && (phoneClean.length === 10 || phoneClean.length === 12)) {
      const targetPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
      return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const prepareQuoteData = () => {
    const data = [
      { Item: 'Origin', Value: quote.origin },
      { Item: 'Destination', Value: quote.destination },
      { Item: 'Truck Size / Vehicle', Value: quote.truck_size || quote.container_type || '32 FT SXL' }
    ];
    if (quote.custom_vehicle_requirement) {
      data.push({ Item: 'Vehicle Requirement', Value: quote.custom_vehicle_requirement });
    }
    data.push(
      { Item: 'Actual Weight (kg)', Value: quote.actual_weight },
      { Item: 'Chargeable Weight (kg)', Value: quote.chargeable_weight },
      { Item: 'Total Price (₹)', Value: quotedPrice || quote.total_price }
    );
    return data;
  };

  const downloadQuotePDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const data = prepareQuoteData();
      const columns = [
        { header: 'Description', key: 'Item' },
        { header: 'Details / Amount', key: 'Value' }
      ];

      const blob = generatePDF(data, `Quote_${quote.quote_number}`, {
        type: 'quote',
        quoteObj: { ...quote, total_price: Number(quotedPrice) || quote.total_price },
        title: `Freight Quote: ${quote.quote_number}`,
        columns,
        companyInfo: 'Jai Bhavani Cargo\nCustomer: ' + quote.customer_name
      });
      
      downloadFile(blob, `Quote_${quote.quote_number}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const printQuote = async () => {
    setIsPrinting(true);
    try {
      const data = prepareQuoteData();
      const columns = [
        { header: 'Description', key: 'Item' },
        { header: 'Details / Amount', key: 'Value' }
      ];

      const blob = generatePDF(data, `Quote_${quote.quote_number}`, {
        type: 'quote',
        quoteObj: { ...quote, total_price: Number(quotedPrice) || quote.total_price },
        title: `Freight Quote: ${quote.quote_number}`,
        columns,
        companyInfo: 'Jai Bhavani Cargo\nCustomer: ' + quote.customer_name
      });
      
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate PDF for printing');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {quote.quote_number}
                <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-semibold", statusColors[quoteStatus] || statusColors['Pending'])}>
                  {quoteStatus}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Requested on {quote.created ? format(new Date(quote.created), 'MMM dd, yyyy') : 'Recent'}
              </p>
            </div>
            {onEdit && (
              <button 
                onClick={() => { onClose(); onEdit(quote); }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit Form
              </button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            
            {/* Quick Respond / Pricing Control Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-slate-100 text-sm">Dispatch Response & Rate Negotiation</h4>
                </div>
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold">
                  Quick Respond
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Quoted Freight Price (₹)</label>
                  <Input 
                    type="number"
                    value={quotedPrice}
                    onChange={e => setQuotedPrice(e.target.value)}
                    placeholder="e.g. 28000"
                    className="bg-slate-950 text-emerald-400 font-mono font-bold text-base border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Update Status</label>
                  <Select value={quoteStatus} onValueChange={setQuoteStatus}>
                    <SelectTrigger className="bg-slate-950 text-slate-200 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending (Inquiry)</SelectItem>
                      <SelectItem value="Quoted">Quoted (Sent to Client)</SelectItem>
                      <SelectItem value="Negotiating">Negotiating</SelectItem>
                      <SelectItem value="Accepted">Accepted (Confirmed)</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSaveResponse} 
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary/90 font-bold rounded-xl h-10"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Save Quote Updates
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-400">Dispatch Notes / Negotiation Details</label>
                <Textarea 
                  value={responseNotes}
                  onChange={e => setResponseNotes(e.target.value)}
                  placeholder="Enter remarks, toll inclusion, driver details, or special terms..."
                  className="bg-slate-950 text-slate-200 text-xs border-slate-700 min-h-[60px]"
                />
              </div>

              {/* Direct 1-Click Communications */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <a
                  href={getDirectWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp Quote
                </a>

                {quote.customer_phone && (
                  <a
                    href={`tel:${quote.customer_phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all hover:scale-105"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-primary" /> Call Customer ({quote.customer_phone})
                  </a>
                )}

                {onTriggerEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onTriggerEmail({ ...quote, total_price: Number(quotedPrice) || quote.total_price, notes: responseNotes });
                    }}
                    className="h-8 px-3 rounded-xl border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-bold text-xs gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Quote
                  </Button>
                )}

                {onConvertToInvoice && (
                  <Button 
                    className="h-8 px-3 rounded-xl bg-success text-success-foreground hover:bg-success/90 font-bold text-xs ml-auto" 
                    size="sm" 
                    onClick={() => { onClose(); onConvertToInvoice(quote); }}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Convert to Invoice
                  </Button>
                )}
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-base border-b border-border pb-2">
                  <User className="w-4 h-4 text-primary" /> Customer Info
                </h4>
                <div className="grid grid-cols-3 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-semibold">{quote.customer_name}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="col-span-2 font-medium">{quote.customer_email || '-'}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="col-span-2 font-medium">{quote.customer_phone || '-'}</span>
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-base border-b border-border pb-2">
                  <MapPin className="w-4 h-4 text-primary" /> Route Details
                </h4>
                <div className="grid grid-cols-3 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="col-span-2 font-semibold">{quote.origin}</span>
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="col-span-2 font-semibold">{quote.destination}</span>
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="col-span-2 font-medium">{quote.destination_zone || 'Standard'}</span>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2 bg-muted/20 p-4 rounded-xl border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-base border-b border-border pb-2">
                  <Package className="w-4 h-4 text-primary" /> Cargo & Vehicle Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Truck Size</span>
                    <span className="font-bold text-foreground">{quote.truck_size || quote.container_type || '32 FT SXL'}</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Actual Weight</span>
                    <span className="font-bold">{quote.actual_weight || 1000} kg</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Chargeable Wt.</span>
                    <span className="font-bold">{quote.chargeable_weight || quote.actual_weight || 1000} kg</span>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/30">
                    <span className="block text-xs text-primary font-bold mb-1">Total Estimated</span>
                    <span className="font-extrabold text-primary text-base">₹{(Number(quotedPrice) || quote.total_price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {quote.custom_vehicle_requirement && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold">Custom Vehicle Requirement:</span>
                    <span className="text-slate-100 font-semibold">{quote.custom_vehicle_requirement}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Print & PDF Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={printQuote} 
                disabled={isPrinting}
                className="bg-background"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                Print
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadQuotePDF} 
                disabled={isDownloadingPDF}
                className="bg-background"
              >
                {isDownloadingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileTextIcon className="w-4 h-4 mr-2 text-destructive" />}
                Download PDF
              </Button>
            </div>
            
          </div>
        </ScrollArea>

        {/* WhatsApp Share Modal with Approved Quote Template */}
        <WhatsAppShareModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          quote={{ ...quote, total_price: Number(quotedPrice) || quote.total_price, notes: responseNotes }}
          defaultTemplate="quote"
          overridePhone={quote?.customer_phone || quote?.phone || ''}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsView;