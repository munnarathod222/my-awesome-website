import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, CheckCircle2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MonthlyExecutiveReportModal({ isOpen, onClose, summaryData }) {
  const [phoneNumber, setPhoneNumber] = useState('+917794072244');
  const [sending, setSending] = useState(false);

  const data = summaryData || {
    month: 'August 2026',
    completedTrips: 28,
    grossRevenue: 198800,
    fuelCost: 68450,
    netProfit: 130350,
    outstandingDue: 198800
  };

  const handleSendReport = async () => {
    setSending(true);
    try {
      const message = `📊 *JAI BHAVANI CARGO - MONTHLY EXECUTIVE REPORT*\nPeriod: ${data.month}\n\n🚛 *Operations:*\n• Completed Trips: ${data.completedTrips}\n• Gross Revenue: ₹${Number(data.grossRevenue).toLocaleString('en-IN')}\n\n⛽ *Fleet Costs:*\n• Diesel Expense: ₹${Number(data.fuelCost).toLocaleString('en-IN')}\n• Net Operating Margin: ₹${Number(data.netProfit).toLocaleString('en-IN')}\n\n⚠️ *Receivables:*\n• Pending Balance: ₹${Number(data.outstandingDue).toLocaleString('en-IN')}\n\n_Jai Bhavani Cargo Enterprise System_`;
      
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const encoded = encodeURIComponent(message);
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
      
      toast.success('Executive report dispatched to WhatsApp!');
      onClose();
    } catch (err) {
      toast.error('Failed to send report');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs uppercase font-semibold tracking-wider">Executive WhatsApp Snapshot</span>
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-slate-100">
            Monthly P&L Snapshot: {data.month}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Dispatches a private executive performance and collection report to Management on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 my-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/90 p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Completed Trips</span>
              <span className="text-slate-200 font-bold text-base">{data.completedTrips} Trips</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Gross Revenue</span>
              <span className="text-emerald-400 font-bold text-base">₹{Number(data.grossRevenue).toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Diesel Fuel Cost</span>
              <span className="text-rose-400 font-bold text-base">₹{Number(data.fuelCost).toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Net Profit Margin</span>
              <span className="text-amber-400 font-bold text-base">₹{Number(data.netProfit).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300">Recipient WhatsApp Number</span>
          <Input 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="+917794072244" 
            className="bg-slate-950 border-slate-700 text-white text-sm rounded-xl"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button 
            disabled={sending} 
            onClick={handleSendReport} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
          >
            {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
            Send Report to WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
