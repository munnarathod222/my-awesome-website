import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Building2, User, Send, Download, Printer, CheckCircle, Trash2, Receipt, FileText, Table as TableIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';

const statusColors = {
  'Draft': 'bg-muted text-muted-foreground',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Paid': 'bg-success/20 text-success border-success/30',
  'Overdue': 'bg-destructive/20 text-destructive border-destructive/30'
};

const InvoiceDetailsView = ({ isOpen, onClose, invoice, onUpdate }) => {
  const [isSending, setIsSending] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!invoice) return null;

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const res = await apiServerClient.fetch('/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          recipientEmail: invoice.customer_email
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send invoice');
      }
      toast.success('Invoice sent successfully!');
      if (onUpdate && invoice.status === 'Draft') {
        const updated = await pb.collection('invoices').update(invoice.id, { status: 'Sent' }, { $autoCancel: false });
        onUpdate(updated);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const prepareInvoiceData = () => {
    return invoice.line_items?.map(item => ({
      Description: item.description,
      Quantity: item.quantity,
      'Unit Price (₹)': item.unit_price,
      'Amount (₹)': item.amount
    })) || [];
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const data = prepareInvoiceData();
      const columns = [
        { header: 'Description', key: 'Description' },
        { header: 'Quantity', key: 'Quantity' },
        { header: 'Unit Price (₹)', key: 'Unit Price (₹)' },
        { header: 'Amount (₹)', key: 'Amount (₹)' }
      ];

      const totals = {
        Description: 'TOTAL DUE',
        Quantity: '',
        'Unit Price (₹)': '',
        'Amount (₹)': invoice.total_amount
      };

      const blob = generatePDF(data, `Invoice_${invoice.invoice_number}`, {
        type: 'invoice',
        invoiceObj: invoice,
        title: `Invoice: ${invoice.invoice_number}`,
        columns,
        totals,
        companyInfo: `${invoice.company_name}\nBill To: ${invoice.customer_name}`
      });
      
      downloadFile(blob, `Invoice_${invoice.invoice_number}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloadingExcel(true);
    try {
      const data = prepareInvoiceData();
      data.push({
        Description: 'TOTAL DUE',
        Quantity: '',
        'Unit Price (₹)': '',
        'Amount (₹)': invoice.total_amount
      });

      const blob = generateExcel(data, `Invoice_${invoice.invoice_number}`, 'Invoice Items');
      downloadFile(blob, `Invoice_${invoice.invoice_number}.xlsx`);
      toast.success('Excel downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download Excel');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const data = prepareInvoiceData();
      const columns = [
        { header: 'Description', key: 'Description' },
        { header: 'Quantity', key: 'Quantity' },
        { header: 'Unit Price (₹)', key: 'Unit Price (₹)' },
        { header: 'Amount (₹)', key: 'Amount (₹)' }
      ];

      const totals = {
        Description: 'TOTAL DUE',
        Quantity: '',
        'Unit Price (₹)': '',
        'Amount (₹)': invoice.total_amount
      };

      const blob = generatePDF(data, `Invoice_${invoice.invoice_number}`, {
        type: 'invoice',
        invoiceObj: invoice,
        title: `Invoice: ${invoice.invoice_number}`,
        columns,
        totals,
        companyInfo: `${invoice.company_name}\nBill To: ${invoice.customer_name}`
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

  const markAsPaid = async () => {
    setIsUpdating(true);
    try {
      const updated = await pb.collection('invoices').update(invoice.id, { status: 'Paid' }, { $autoCancel: false });
      toast.success('Invoice marked as Paid');
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {invoice.invoice_number}
                <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-semibold", statusColors[invoice.status])}>
                  {invoice.status}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Issued: {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')} • Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-8">
            
            {/* Action Bar */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">Actions:</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
                  {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
                  {isDownloadingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2 text-destructive" />}
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel} disabled={isDownloadingExcel}>
                  {isDownloadingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TableIcon className="w-4 h-4 mr-2 text-success" />}
                  Excel
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSendEmail} disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send via Email
                </Button>
                {invoice.status !== 'Paid' && (
                  <Button className="bg-success text-success-foreground hover:bg-success/90" size="sm" onClick={markAsPaid} disabled={isUpdating}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                  </Button>
                )}
              </div>
            </div>

            {/* Entity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-lg text-muted-foreground border-b border-border pb-2">
                  <Building2 className="w-5 h-5" /> From
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-base">{invoice.company_name}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{invoice.company_address}</p>
                  {invoice.company_email && <p className="text-muted-foreground">{invoice.company_email}</p>}
                  {invoice.company_phone && <p className="text-muted-foreground">{invoice.company_phone}</p>}
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-lg text-muted-foreground border-b border-border pb-2">
                  <User className="w-5 h-5" /> Bill To
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-base">{invoice.customer_name}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{invoice.customer_address}</p>
                  <p className="text-muted-foreground">{invoice.customer_email}</p>
                  {invoice.customer_phone && <p className="text-muted-foreground">{invoice.customer_phone}</p>}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-semibold text-lg">
                <Receipt className="w-5 h-5 text-primary" /> Invoice Items
              </h4>
              <div className="border border-border rounded-xl overflow-hidden text-sm">
                <div className="bg-muted grid grid-cols-12 gap-4 p-3 font-medium text-muted-foreground">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                <div className="divide-y divide-border">
                  {invoice.line_items?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/10">
                      <div className="col-span-6">{item.description}</div>
                      <div className="col-span-2 text-right">{item.quantity}</div>
                      <div className="col-span-2 text-right">₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-2 text-right font-medium">₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm text-muted-foreground">Payment Terms</h5>
                  <p className="text-sm bg-muted/30 p-3 rounded border border-border">{invoice.payment_terms || 'None specified'}</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm text-muted-foreground">Bank Details</h5>
                  <p className="text-sm bg-muted/30 p-3 rounded border border-border whitespace-pre-line font-mono">{invoice.bank_details || 'None provided'}</p>
                </div>
                {invoice.notes && (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-muted-foreground">Notes</h5>
                    <p className="text-sm bg-muted/30 p-3 rounded border border-border whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-card p-6 rounded-xl border border-border h-fit shadow-sm space-y-3">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">₹{invoice.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Tax ({invoice.tax_percentage}%)</span>
                    <span className="font-medium text-foreground">₹{invoice.tax_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Discount ({invoice.discount_percentage}%)</span>
                    <span className="font-medium text-destructive">- ₹{invoice.discount_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                  <span className="font-bold text-lg">Total Due</span>
                  <span className="font-bold text-2xl text-primary">₹{invoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsView;