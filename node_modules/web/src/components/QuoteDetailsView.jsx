import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { User, MapPin, Package, FileText, Send, Download, Printer, CheckCircle, FileText as FileTextIcon, Table as TableIcon, Loader2 } from 'lucide-react';
import QuoteCalculationBreakdown from './QuoteCalculationBreakdown.jsx';
import { cn } from '@/lib/utils.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';

const statusColors = {
  'Draft': 'bg-muted text-muted-foreground',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Accepted': 'bg-success/20 text-success border-success/30',
  'Rejected': 'bg-destructive/20 text-destructive border-destructive/30'
};

const QuoteDetailsView = ({ isOpen, onClose, quote, onUpdate, onEdit, onConvertToInvoice }) => {
  const [isSending, setIsSending] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!quote) return null;

  const mockCalculations = {
    volumetricWeight: quote.volumetric_weight,
    chargeableWeight: quote.chargeable_weight,
    usedWeightType: quote.chargeable_weight === quote.actual_weight ? 'Actual' : 'Volumetric',
    weightCharge: quote.weight_charge,
    totalPrice: quote.total_price
  };

  const sendQuoteEmail = async () => {
    setIsSending(true);
    try {
      const res = await apiServerClient.fetch('/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          recipientEmail: quote.customer_email
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send email');
      }
      toast.success('Quote sent to customer successfully');
      if (onUpdate) onUpdate({ ...quote, status: 'Sent' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const prepareQuoteData = () => {
    return [
      { Item: 'Origin', Value: quote.origin },
      { Item: 'Destination', Value: quote.destination },
      { Item: 'Container Type', Value: quote.container_type },
      { Item: 'Dimensions (cm)', Value: `${quote.length}x${quote.width}x${quote.height}` },
      { Item: 'Actual Weight (kg)', Value: quote.actual_weight },
      { Item: 'Chargeable Weight (kg)', Value: quote.chargeable_weight },
      { Item: 'Base Rate/kg (₹)', Value: quote.base_rate_per_kg },
      { Item: 'Fuel Surcharge (₹)', Value: quote.fuel_surcharge },
      { Item: 'Handling Fees (₹)', Value: quote.handling_fees },
      { Item: 'Total Price (₹)', Value: quote.total_price }
    ];
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
        quoteObj: quote,
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

  const downloadQuoteExcel = async () => {
    setIsDownloadingExcel(true);
    try {
      const data = prepareQuoteData();
      const blob = generateExcel(data, `Quote_${quote.quote_number}`, 'Quote Details');
      downloadFile(blob, `Quote_${quote.quote_number}.xlsx`);
      toast.success('Excel downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download Excel');
    } finally {
      setIsDownloadingExcel(false);
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
        quoteObj: quote,
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {quote.quote_number}
                <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-semibold", statusColors[quote.status])}>
                  {quote.status}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {format(new Date(quote.created), 'MMM dd, yyyy')}
              </p>
            </div>
            {onEdit && quote.status !== 'Accepted' && (
              <button 
                onClick={() => { onClose(); onEdit(quote); }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit Quote
              </button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-8">
            
            {/* Action Bar */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
              <div className="flex flex-wrap items-center gap-2">
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
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadQuoteExcel} 
                  disabled={isDownloadingExcel}
                  className="bg-background"
                >
                  {isDownloadingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TableIcon className="w-4 h-4 mr-2 text-success" />}
                  Excel
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={sendQuoteEmail} 
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>
                {onConvertToInvoice && (
                  <Button 
                    className="bg-success text-success-foreground hover:bg-success/90" 
                    size="sm" 
                    onClick={() => { onClose(); onConvertToInvoice(quote); }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Convert to Invoice
                  </Button>
                )}
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-2">
                  <User className="w-5 h-5 text-muted-foreground" /> Customer Info
                </h4>
                <div className="grid grid-cols-3 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="col-span-2 font-medium">{quote.customer_name}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="col-span-2 font-medium">{quote.customer_email}</span>
                  <span className="text-muted-foreground">Phone</span>
                  <span className="col-span-2 font-medium">{quote.customer_phone || '-'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" /> Route Details
                </h4>
                <div className="grid grid-cols-3 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="col-span-2 font-medium">{quote.origin}</span>
                  <span className="text-muted-foreground">Destination</span>
                  <span className="col-span-2 font-medium">{quote.destination}</span>
                  <span className="text-muted-foreground">Zone</span>
                  <span className="col-span-2 font-medium">{quote.destination_zone}</span>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h4 className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-2">
                  <Package className="w-5 h-5 text-muted-foreground" /> Cargo Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-muted/30 p-3 rounded border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Container Type</span>
                    <span className="font-semibold">{quote.container_type}</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Dimensions (L×W×H)</span>
                    <span className="font-semibold">{quote.length} × {quote.width} × {quote.height} cm</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Actual Weight</span>
                    <span className="font-semibold">{quote.actual_weight} kg</span>
                  </div>
                  <div className="bg-primary/5 p-3 rounded border border-primary/20">
                    <span className="block text-xs text-primary mb-1">Chargeable Weight</span>
                    <span className="font-bold text-primary">{quote.chargeable_weight} kg</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Calculations Breakdown */}
            <QuoteCalculationBreakdown 
              calculations={mockCalculations}
              actualWeight={quote.actual_weight}
              baseRatePerKg={quote.base_rate_per_kg}
              zoneMultiplier={quote.zone_distance_multiplier}
              fuelSurcharge={quote.fuel_surcharge}
              handlingFees={quote.handling_fees}
            />

            {/* Notes */}
            {quote.notes && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-semibold text-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" /> Notes
                </h4>
                <p className="text-sm bg-muted/30 p-4 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
                  {quote.notes}
                </p>
              </div>
            )}
            
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsView;