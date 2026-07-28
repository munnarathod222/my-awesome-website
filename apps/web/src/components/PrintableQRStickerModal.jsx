import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, QrCode, ShieldCheck, Download, ExternalLink, Phone, Truck, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PrintableQRStickerModal({ isOpen, onClose, truck, qrToken }) {
  if (!truck) return null;

  const originUrl = window.location.origin;
  const verificationUrl = `${originUrl}/v/${qrToken || truck.truck_number}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl rounded-2xl p-6 print:p-0 print:border-none print:shadow-none font-sans">
        <DialogHeader className="pb-3 border-b border-border/40 print:hidden">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Official Windshield & Cabin QR Sticker
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Print and paste this tamper-resistant QR sticker on the truck's front windshield and side cabin doors.
          </p>
        </DialogHeader>

        {/* Printable Pass Container */}
        <div className="py-4 print:py-0">
          <div className="border-4 border-primary/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4 print:border-4 print:border-black print:text-black print:bg-white">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 print:border-black/20">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 bg-primary text-white rounded-xl font-black text-sm">JBC</div>
                <div>
                  <div className="text-sm font-extrabold tracking-wider uppercase">JAI BHAVANI CARGO</div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest print:text-black">VERIFIED FLEET VEHICLE</div>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white font-mono font-bold text-xs px-2.5 py-1">
                SECURITY PASS
              </Badge>
            </div>

            {/* Truck Number Display */}
            <div className="py-1">
              <div className="text-3xl font-black font-mono tracking-wider text-amber-400 print:text-black">
                {truck.truck_number}
              </div>
              <div className="text-xs text-slate-300 print:text-black font-semibold mt-0.5">
                {truck.manufacturer || 'Tata / Leyland'} • {truck.model || 'Heavy Goods Commercial Vehicle'}
              </div>
            </div>

            {/* QR Code Canvas */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-primary/30 inline-block">
                <img 
                  src={qrImageUrl} 
                  alt={`QR Verification Pass for ${truck.truck_number}`}
                  className="w-44 h-44 object-contain"
                />
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-center gap-1 print:text-black">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED BY RTO & HIGHWAY PATROL
              </div>
            </div>

            {/* Roadside Inspection Banner */}
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 text-[11px] space-y-0.5 print:bg-slate-100 print:text-black print:border-black/20">
              <div className="font-bold text-amber-300 print:text-black">FOR RTO / TRAFFIC POLICE / TOLL INSPECTION</div>
              <div className="text-[10px] text-slate-300 print:text-black">
                Scan with smartphone camera to view Digital RC, Insurance, Fitness, Permit & Emergency Helpline
              </div>
            </div>

            {/* Footer Helplines */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 print:border-black/20 print:text-black">
              <span>Token: {qrToken || truck.truck_number}</span>
              <span className="font-mono font-bold text-white print:text-black">24x7 Helpline: +91 98490 12345</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
          <div className="flex items-center gap-2">
            <a 
              href={verificationUrl} 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-2 border border-border/60 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-muted/30"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Test Live Link
            </a>
            <Button onClick={handlePrint} className="rounded-xl shadow-md font-bold text-xs">
              <Printer className="w-4 h-4 mr-1.5" /> Print QR Sticker Pass
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
