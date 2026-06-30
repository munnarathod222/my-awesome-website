import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, Trash2, Printer, Download } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QuoteActions = ({ quote, onUpdate, onClose, allowEdit = true }) => {
  const [isSending, setIsSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const res = await apiServerClient.fetch('/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          customerEmail: quote.customer_email
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send quote');
      }
      
      toast.success('Quote sent to customer successfully!');
      
      // Update local state without full reload
      if (onUpdate) {
        onUpdate({ ...quote, status: 'Sent' });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleConvertToBooking = async () => {
    if (!window.confirm('Convert this quote to an accepted booking?')) return;
    setIsConverting(true);
    try {
      // For now, we just update the status to Accepted. 
      // In a real flow, you might create a booking record in another collection.
      await pb.collection('quotes').update(quote.id, { status: 'Accepted' }, { $autoCancel: false });
      toast.success('Quote successfully converted to Booking (Accepted)');
      if (onUpdate) {
        onUpdate({ ...quote, status: 'Accepted' });
      }
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert quote');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this quote?')) return;
    try {
      await pb.collection('quotes').delete(quote.id, { $autoCancel: false });
      toast.success('Quote deleted successfully');
      if (onUpdate) onUpdate(null); // Signal deletion
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete quote');
    }
  };

  const generatePDF = (action = 'download') => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('FREIGHT QUOTE', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Quote #: ${quote.quote_number}`, 14, 30);
      doc.text(`Date: ${new Date(quote.created).toLocaleDateString()}`, 14, 35);
      doc.text(`Status: ${quote.status}`, 14, 40);

      // Customer Info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Customer Details', 14, 50);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Name: ${quote.customer_name}`, 14, 56);
      doc.text(`Email: ${quote.customer_email}`, 14, 61);
      if (quote.customer_phone) doc.text(`Phone: ${quote.customer_phone}`, 14, 66);

      // Route Info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Route Details', 120, 50);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Origin: ${quote.origin}`, 120, 56);
      doc.text(`Destination: ${quote.destination}`, 120, 61);
      doc.text(`Zone: ${quote.destination_zone}`, 120, 66);

      // Cargo Table
      doc.autoTable({
        startY: 75,
        head: [['Container Type', 'Dimensions (L×W×H cm)', 'Actual Wt (kg)', 'Chargeable Wt (kg)']],
        body: [
          [
            quote.container_type,
            `${quote.length} × ${quote.width} × ${quote.height}`,
            quote.actual_weight,
            quote.chargeable_weight
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] }
      });

      const finalY = doc.lastAutoTable.finalY + 10;

      // Financials
      doc.autoTable({
        startY: finalY,
        head: [['Description', 'Amount (INR)']],
        body: [
          ['Freight Charge', `Rs. ${quote.weight_charge?.toLocaleString('en-IN')}`],
          ['Fuel Surcharge', `Rs. ${quote.fuel_surcharge?.toLocaleString('en-IN')}`],
          ['Handling Fees', `Rs. ${quote.handling_fees?.toLocaleString('en-IN')}`],
          ['TOTAL', `Rs. ${quote.total_price?.toLocaleString('en-IN')}`]
        ],
        theme: 'plain',
        styles: { cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        willDrawCell: function(data) {
          if (data.row.index === 3) { // Total Row
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
          }
        }
      });

      if (quote.notes) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Notes:', 14, doc.lastAutoTable.finalY + 15);
        doc.setFont(undefined, 'normal');
        const splitNotes = doc.splitTextToSize(quote.notes, 180);
        doc.text(splitNotes, 14, doc.lastAutoTable.finalY + 20);
      }

      if (action === 'open') {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`${quote.quote_number}.pdf`);
      }
    } catch (error) {
      console.error("PDF Generation error:", error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => generatePDF('open')}>
        <Printer className="w-4 h-4 mr-2" /> Print PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => generatePDF('download')}>
        <Download className="w-4 h-4 mr-2" /> Download PDF
      </Button>
      
      {quote.status !== 'Accepted' && quote.status !== 'Rejected' && (
        <Button variant="secondary" size="sm" onClick={handleSendEmail} disabled={isSending}>
          <Send className="w-4 h-4 mr-2" /> {isSending ? 'Sending...' : 'Send to Customer'}
        </Button>
      )}

      {quote.status !== 'Accepted' && (
        <Button className="bg-success text-success-foreground hover:bg-success/90" size="sm" onClick={handleConvertToBooking} disabled={isConverting}>
          <CheckCircle className="w-4 h-4 mr-2" /> Convert to Booking
        </Button>
      )}

      {allowEdit && (
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default QuoteActions;