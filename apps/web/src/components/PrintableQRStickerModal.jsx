import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer, QrCode, ShieldCheck, Download, ExternalLink, Phone, Truck, Building2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function PrintableQRStickerModal({ isOpen, onClose, truck, qrToken }) {
  const [allowDownload, setAllowDownload] = useState(false);

  if (!truck) return null;

  const originUrl = window.location.origin;
  const verificationUrl = `${originUrl}/v/${qrToken || truck.truck_number}${allowDownload ? '?dl=1' : ''}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Please allow popups to print the QR Sticker');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicle QR Security Sticker - ${truck.truck_number}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { 
              font-family: system-ui, -apple-system, blinkmacsystemfont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              background: #fff; 
              color: #000;
            }
            .sticker-card {
              width: 380px;
              border: 4px solid #000;
              border-radius: 24px;
              padding: 24px;
              text-align: center;
              background: #fff;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              box-sizing: border-box;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 12px; 
              margin-bottom: 16px; 
            }
            .logo-badge { 
              background: #000; 
              color: #fff; 
              font-weight: 900; 
              padding: 6px 12px; 
              border-radius: 10px; 
              font-size: 14px; 
              display: inline-block;
            }
            .title { 
              font-weight: 900; 
              font-size: 14px; 
              letter-spacing: 1px; 
              text-transform: uppercase; 
              margin-top: 4px;
            }
            .sub { 
              font-size: 10px; 
              font-weight: 800; 
              color: #16a34a; 
              letter-spacing: 1px; 
            }
            .truck-num { 
              font-size: 32px; 
              font-weight: 900; 
              font-family: monospace; 
              letter-spacing: 2px; 
              margin: 12px 0 4px 0; 
            }
            .truck-model { 
              font-size: 12px; 
              font-weight: 600; 
              color: #374151; 
              margin-bottom: 16px; 
            }
            .qr-box { 
              border: 2px solid #000; 
              padding: 12px; 
              border-radius: 16px; 
              display: inline-block; 
              background: #fff; 
              margin-bottom: 12px; 
            }
            .qr-img { 
              width: 180px; 
              height: 180px; 
              display: block; 
            }
            .verify-badge { 
              font-size: 11px; 
              font-weight: 800; 
              font-family: monospace; 
              color: #16a34a; 
              margin-bottom: 16px; 
            }
            .inspection-box { 
              background: #f3f4f6; 
              border: 1px solid #d1d5db; 
              border-radius: 12px; 
              padding: 10px; 
              font-size: 11px; 
              margin-bottom: 16px; 
              line-height: 1.4;
            }
            .inspection-box strong { 
              display: block; 
              color: #d97706; 
              margin-bottom: 2px; 
            }
            .footer { 
              border-top: 2px solid #000; 
              padding-top: 10px; 
              display: flex; 
              justify-content: space-between; 
              font-size: 10px; 
              font-family: monospace; 
              font-weight: 700; 
            }
          </style>
        </head>
        <body>
          <div class="sticker-card">
            <div class="header">
              <div style="text-align:left;">
                <div class="logo-badge">JBC</div>
                <div class="title">JAI BHAVANI CARGO</div>
                <div class="sub">VERIFIED FLEET VEHICLE</div>
              </div>
              <div style="background:#16a34a; color:#fff; font-weight:800; padding:4px 8px; border-radius:6px; font-size:11px;">
                SECURITY PASS
              </div>
            </div>

            <div class="truck-num">${truck.truck_number}</div>
            <div class="truck-model">${truck.manufacturer || 'Ashoke Leyland'} • ${truck.truck_size || '32 FT Goods Carrier'}</div>

            <div class="qr-box">
              <img src="${qrImageUrl}" class="qr-img" />
            </div>
            <div class="verify-badge">✓ VERIFIED BY RTO & HIGHWAY PATROL</div>

            <div class="inspection-box">
              <strong>FOR RTO / TRAFFIC POLICE / TOLL INSPECTION</strong>
              Scan with smartphone camera to view Digital RC, Insurance, Fitness, Permit & Emergency Helpline
            </div>

            <div class="footer">
              <span>Pass ID: ${qrToken || truck.truck_number}</span>
              <span>24x7 Helpline: +91 7794072244</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto bg-card border-border shadow-2xl rounded-2xl p-6 font-sans">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Official Windshield & Cabin QR Sticker
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Print and paste this tamper-resistant QR sticker on the truck's front windshield and side cabin doors.
          </p>
        </DialogHeader>

        {/* Admin Downloadable Privilege Toggle */}
        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox 
              id="dl-permission-check" 
              checked={allowDownload} 
              onCheckedChange={(val) => setAllowDownload(Boolean(val))} 
            />
            <Label htmlFor="dl-permission-check" className="text-xs font-extrabold cursor-pointer text-foreground">
              Enable Document Downloads for End-Users
            </Label>
          </div>
          <Badge variant="outline" className={`text-[10px] font-mono ${allowDownload ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
            {allowDownload ? '📥 Download Enabled' : '🔒 View Only (Protected)'}
          </Badge>
        </div>

        {/* Preview Pass Container */}
        <div className="py-4">
          <div className="border-4 border-primary/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 bg-primary text-white rounded-xl font-black text-sm">JBC</div>
                <div>
                  <div className="text-sm font-extrabold tracking-wider uppercase">JAI BHAVANI CARGO</div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">VERIFIED FLEET VEHICLE</div>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white font-mono font-bold text-xs px-2.5 py-1">
                SECURITY PASS
              </Badge>
            </div>

            {/* Truck Number Display */}
            <div className="py-1">
              <div className="text-3xl font-black font-mono tracking-wider text-amber-400">
                {truck.truck_number}
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                {truck.truck_name || 'Ashoke Leyland'} • {truck.truck_size || '32 FT Goods Carrier'}
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
              <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED BY RTO & HIGHWAY PATROL
              </div>
            </div>

            {/* Roadside Inspection Banner */}
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 text-[11px] space-y-0.5">
              <div className="font-bold text-amber-300">FOR RTO / TRAFFIC POLICE / TOLL INSPECTION</div>
              <div className="text-[10px] text-slate-300">
                Scan with smartphone camera to view Digital RC, Insurance, Fitness, Permit & Emergency Helpline
              </div>
            </div>

            {/* Footer Helplines */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Pass ID: {qrToken || truck.truck_number}</span>
              <span className="font-bold text-white">24x7 Helpline: +91 7794072244</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
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
