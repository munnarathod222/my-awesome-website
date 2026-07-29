import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, Download, ExternalLink, IndianRupee, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_TXNS = [
  {
    id: 'TXN-9901',
    load_id: 'LOAD-8801',
    description: 'Freight Escrow Deposit for Load LOAD-8801 (HYD → MUM)',
    amount: 48000,
    type: 'Escrow Locked',
    status: 'Escrow Active',
    date: '2026-07-29',
    invoice_no: 'INV-2026-0718'
  },
  {
    id: 'TXN-9902',
    load_id: 'LOAD-8790',
    description: 'Transporter Payout Released upon POD Upload (HYD → BLR)',
    amount: 52000,
    type: 'Payout Released',
    status: 'Completed',
    date: '2026-07-28',
    invoice_no: 'INV-2026-0715'
  },
  {
    id: 'TXN-9903',
    load_id: 'LOAD-8785',
    description: 'Marketplace Platform Commission (3.5%)',
    amount: 1820,
    type: 'Commission Fee',
    status: 'Completed',
    date: '2026-07-28',
    invoice_no: 'INV-COMM-4412'
  }
];

export default function PaymentsEscrowHub() {
  const [txns] = useState(SAMPLE_TXNS);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" /> Digital Wallet, Payments & Smart Escrow Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Escrow protection holds freight payments safely until Proof of Delivery (POD) is verified.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => toast.success('Recharge wallet modal initiated')} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md">
            + Add Funds to Wallet
          </Button>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">AVAILABLE WALLET BALANCE</div>
          <div className="text-3xl font-black text-white font-mono mt-1">₹1,45,800</div>
          <div className="text-xs text-emerald-400 mt-1">Ready for Instant Freight Booking</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">LOCKED IN SMART ESCROW</div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">₹48,000</div>
          <div className="text-xs text-amber-400 mt-1">1 Active Shipment Pending POD</div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-3xl">
          <div className="text-[10px] text-slate-400 font-mono">TOTAL COMPLETED PAYOUTS</div>
          <div className="text-3xl font-black text-teal-400 font-mono mt-1">₹14,82,000</div>
          <div className="text-xs text-slate-400 mt-1">July 2026 Settled Transactions</div>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Transaction Audit History & GST Invoices
          </h3>
          <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
            Auto GST Generated
          </Badge>
        </div>

        <div className="space-y-2.5">
          {txns.map((t) => (
            <div key={t.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">{t.id}</span>
                  <Badge variant="outline" className="text-[9px] text-slate-300 border-slate-700">
                    {t.type}
                  </Badge>
                </div>
                <div className="text-slate-300 font-semibold mt-0.5">{t.description}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Date: {t.date} • GST Inv: {t.invoice_no}</div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right font-mono font-black text-sm text-white">
                  ₹{t.amount.toLocaleString('en-IN')}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toast.success(`Downloading GST Invoice PDF for ${t.invoice_no}`)}
                  className="h-8 px-2.5 text-[11px] rounded-xl border-slate-700 text-slate-300 hover:text-white"
                >
                  <Download className="w-3 h-3 mr-1" /> GST Invoice
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
