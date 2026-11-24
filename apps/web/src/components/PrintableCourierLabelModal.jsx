import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Printer, X, Copy, Check, Truck, Building2, MapPin, Phone, ShieldCheck, QrCode, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function PrintableCourierLabelModal({
  isOpen,
  onClose,
  toAddress = {},
  fromAddress = null,
  shipmentRef = {}
}) {
  const [printFormat, setPrintFormat] = useState('slip'); // 'slip' | 'thermal' | 'compact'
  const [showQr, setShowQr] = useState(true);
  const [showUrgentBadge, setShowUrgentBadge] = useState(true);
  const [copies, setCopies] = useState(1);

  if (!isOpen) return null;

  // Default JBC FROM address
  const sender = fromAddress || {
    company_name: 'JAI BHAVANI CARGO',
    tagline: 'Goods Transport Operators & Fleet Contractors',
    attention_to: 'Dispatch & Operations Desk',
    contact_person: 'Vinod Kumar Rathod (MD)',
    phone: '+91 7794072244 / 9440072244',
    address_line1: 'Plot No. 12, Behind HP Petrol Pump, Autonagar',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500070',
    gstin: '36AARFJ1402H1ZZ'
  };

  const recipient = {
    company_name: toAddress.company_name || toAddress.title || 'Client Billing Desk',
    attention_to: toAddress.attention_to || 'Central Inward / Billing Clearance Desk',
    contact_person: toAddress.contact_person || '',
    phone: toAddress.phone || toAddress.contact_phone || '',
    address_line1: toAddress.address_line1 || toAddress.address || 'Industrial Area',
    address_line2: toAddress.address_line2 || '',
    city: toAddress.city || 'Hyderabad',
    state: toAddress.state || 'Telangana',
    pincode: toAddress.pincode || '',
    notes: toAddress.notes || ''
  };

  const ref = {
    trip_id: shipmentRef.trip_id || '',
    truck_number: shipmentRef.truck_number || '',
    lr_number: shipmentRef.lr_number || '',
    courier_partner: shipmentRef.courier_partner || 'DTDC',
    awb: shipmentRef.awb || '',
    date: shipmentRef.date || new Date().toISOString().split('T')[0],
    contents: shipmentRef.contents || 'ORIGINAL PROOF OF DELIVERY (POD) & BILLING INVOICE'
  };

  const qrData = encodeURIComponent(
    `JAI BHAVANI CARGO | COURIER DISPATCH\nTO: ${recipient.company_name} (${recipient.city})\nTRIP: ${ref.trip_id}\nTRUCK: ${ref.truck_number}\nLR: ${ref.lr_number}\nAWB: ${ref.awb}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      toast.error('Please allow popups to open the print dialog');
      return;
    }

    const isThermal = printFormat === 'thermal';
    const isCompact = printFormat === 'compact';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Courier Label - ${recipient.company_name} - ${ref.trip_id || ref.awb || 'Dispatch'}</title>
          <style>
            @page {
              size: ${isThermal ? '100mm 150mm' : (isCompact ? 'A5 landscape' : 'A5 portrait')};
              margin: ${isThermal ? '3mm' : '8mm'};
            }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              margin: 0;
              padding: ${isThermal ? '4px' : '12px'};
              color: #0f172a;
              background: #fff;
            }
            .label-card {
              border: 2px solid #000;
              border-radius: ${isThermal ? '0' : '8px'};
              padding: ${isThermal ? '10px' : '16px'};
              display: flex;
              flex-direction: column;
              height: 100%;
              page-break-after: always;
            }
            .header-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .brand-title {
              font-size: ${isThermal ? '15px' : '18px'};
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #000;
              margin: 0;
            }
            .brand-sub {
              font-size: ${isThermal ? '8px' : '10px'};
              color: #475569;
              margin: 2px 0 0 0;
              font-weight: 600;
            }
            .courier-badge {
              border: 1.5px solid #000;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: ${isThermal ? '9px' : '11px'};
              font-weight: 800;
              text-align: right;
              background: #f1f5f9;
            }
            .ref-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 4px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              border-radius: 4px;
              margin-bottom: 10px;
              font-size: ${isThermal ? '9px' : '11px'};
            }
            .ref-item strong {
              display: block;
              color: #64748b;
              font-size: ${isThermal ? '7px' : '9px'};
              text-transform: uppercase;
            }
            .ref-item span {
              font-weight: 800;
              color: #0f172a;
              font-family: monospace;
            }
            .to-section {
              background: #fff;
              border: 2px solid #000;
              border-radius: 6px;
              padding: ${isThermal ? '8px 10px' : '12px 14px'};
              margin-bottom: 10px;
              flex: 1;
            }
            .to-tag {
              display: inline-block;
              background: #000;
              color: #fff;
              font-size: ${isThermal ? '9px' : '11px'};
              font-weight: 900;
              padding: 2px 6px;
              border-radius: 3px;
              margin-bottom: 4px;
              letter-spacing: 1px;
            }
            .to-name {
              font-size: ${isThermal ? '14px' : '17px'};
              font-weight: 900;
              color: #000;
              margin: 4px 0;
            }
            .to-attention {
              font-size: ${isThermal ? '10px' : '12px'};
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 4px;
            }
            .to-address {
              font-size: ${isThermal ? '10px' : '12px'};
              color: #334155;
              line-height: 1.35;
              margin: 4px 0;
            }
            .to-phone {
              font-size: ${isThermal ? '11px' : '13px'};
              font-weight: 800;
              color: #000;
              margin-top: 4px;
              font-family: monospace;
            }
            .from-section {
              border-top: 1.5px dashed #64748b;
              padding-top: 8px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              font-size: ${isThermal ? '8.5px' : '10.5px'};
            }
            .from-tag {
              font-weight: 900;
              color: #475569;
              font-size: ${isThermal ? '8px' : '9px'};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .from-name {
              font-weight: 800;
              color: #0f172a;
              font-size: ${isThermal ? '10px' : '12px'};
            }
            .from-address {
              color: #475569;
              margin-top: 1px;
            }
            .urgent-banner {
              border: 1px solid #000;
              background: #f8fafc;
              text-align: center;
              font-weight: 900;
              font-size: ${isThermal ? '8px' : '10px'};
              padding: 4px;
              border-radius: 4px;
              letter-spacing: 0.5px;
              margin-top: auto;
            }
            .qr-box {
              text-align: center;
              margin-left: 8px;
            }
            .qr-box img {
              width: ${isThermal ? '55px' : '75px'};
              height: ${isThermal ? '55px' : '75px'};
              border: 1px solid #000;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .label-card { border: 2px solid #000 !important; }
            }
          </style>
        </head>
        <body>
          ${Array.from({ length: copies }).map(() => `
            <div class="label-card">
              <div class="header-bar">
                <div>
                  <h1 class="brand-title">JAI BHAVANI CARGO</h1>
                  <p class="brand-sub">Express Logistics & Fleet Contractors</p>
                </div>
                <div class="courier-badge">
                  <div>${ref.courier_partner.toUpperCase()} COURIER</div>
                  ${ref.awb ? `<div style="font-family: monospace; font-size: 11px;">AWB: ${ref.awb}</div>` : ''}
                </div>
              </div>

              <div class="ref-grid">
                <div class="ref-item">
                  <strong>Date:</strong>
                  <span>${ref.date}</span>
                </div>
                <div class="ref-item">
                  <strong>Trip ID:</strong>
                  <span>${ref.trip_id || 'DIRECT'}</span>
                </div>
                <div class="ref-item">
                  <strong>Truck #:</strong>
                  <span>${ref.truck_number || 'FLEET'}</span>
                </div>
                <div class="ref-item">
                  <strong>LR Consignment:</strong>
                  <span>${ref.lr_number || 'N/A'}</span>
                </div>
              </div>

              <div class="to-section">
                <span class="to-tag">DELIVER TO:</span>
                <div class="to-name">${recipient.company_name}</div>
                ${recipient.attention_to ? `<div class="to-attention">Attn: ${recipient.attention_to}</div>` : ''}
                <div class="to-address">
                  ${recipient.address_line1}
                  ${recipient.address_line2 ? `<br/>${recipient.address_line2}` : ''}
                  <br/>${recipient.city}, ${recipient.state} ${recipient.pincode ? `– PIN: ${recipient.pincode}` : ''}
                </div>
                ${recipient.phone ? `<div class="to-phone">📞 Contact: ${recipient.phone}</div>` : ''}
              </div>

              <div class="from-section">
                <div>
                  <div class="from-tag">FROM (SENDER):</div>
                  <div class="from-name">${sender.company_name}</div>
                  <div class="from-address">${sender.address_line1}, ${sender.city}, ${sender.state} - ${sender.pincode}</div>
                  <div class="from-address">Desk In-charge: ${sender.contact_person} • Ph: ${sender.phone}</div>
                </div>
                ${showQr ? `
                  <div class="qr-box">
                    <img src="${qrUrl}" alt="QR" />
                    <div style="font-size: 7px; color: #64748b; font-weight: 700; margin-top: 1px;">SCAN REF</div>
                  </div>
                ` : ''}
              </div>

              ${showUrgentBadge ? `
                <div class="urgent-banner">
                  ⚠️ CONTENTS: ${ref.contents} — HANDLE WITH CARE ⚠️
                </div>
              ` : ''}
            </div>
          `).join('')}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  Print Courier Address Label
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px]">
                    {ref.courier_partner}
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ready-to-print shipping label & slip. No manual writing required.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Format Selector & Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 border-b border-slate-800/60">
          <div>
            <Label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">Print Layout</Label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPrintFormat('slip')}
                className={`px-2 py-1 text-xs rounded-lg font-semibold transition ${printFormat === 'slip' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Pouch Slip (A5)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-2 py-1 text-xs rounded-lg font-semibold transition ${printFormat === 'thermal' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                4"×6" Sticker
              </button>
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">Copies</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCopies(n)}
                  className={`flex-1 py-1 text-xs rounded-lg font-semibold border ${copies === n ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {n} {n === 1 ? 'Copy' : 'Copies'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">Options</Label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={e => setShowQr(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                QR Ref
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUrgentBadge}
                  onChange={e => setShowUrgentBadge(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                Urgent Badge
              </label>
            </div>
          </div>
        </div>

        {/* Live Visual Print Preview */}
        <div className="p-4 bg-white text-slate-950 rounded-2xl border-2 border-slate-300 shadow-inner font-sans space-y-3">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div>
              <span className="text-xs font-black text-slate-900 tracking-wider">JAI BHAVANI CARGO</span>
              <p className="text-[9px] font-semibold text-slate-600">Goods Transport Operators & Fleet Contractors</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 border border-slate-900 rounded">
                {ref.courier_partner} COURIER
              </span>
              {ref.awb && <p className="text-[10px] font-mono font-bold text-slate-900 mt-0.5">AWB: {ref.awb}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-2 rounded border border-slate-300 text-[10px]">
            <div>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">Date:</span>
              <span className="font-bold text-slate-900">{ref.date}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">Trip Ref:</span>
              <span className="font-mono font-bold text-slate-900">{ref.trip_id || 'DIRECT'}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">Vehicle:</span>
              <span className="font-mono font-bold text-slate-900">{ref.truck_number || 'FLEET'}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-bold uppercase block">LR Consignment:</span>
              <span className="font-mono font-bold text-slate-900">{ref.lr_number || 'N/A'}</span>
            </div>
          </div>

          {/* TO Section */}
          <div className="border-2 border-slate-900 rounded-xl p-3 bg-white space-y-1">
            <span className="px-2 py-0.5 bg-slate-950 text-white text-[9px] font-black rounded uppercase tracking-wider">
              DELIVER TO (RECIPIENT):
            </span>
            <div className="text-sm font-black text-slate-950 pt-1">{recipient.company_name}</div>
            {recipient.attention_to && (
              <div className="text-xs font-bold text-slate-800">Attn: {recipient.attention_to}</div>
            )}
            <div className="text-xs text-slate-700 leading-relaxed">
              {recipient.address_line1}
              {recipient.address_line2 && <div>{recipient.address_line2}</div>}
              <div>{recipient.city}, {recipient.state} {recipient.pincode ? `– ${recipient.pincode}` : ''}</div>
            </div>
            {recipient.phone && (
              <div className="text-xs font-mono font-black text-slate-950 pt-0.5">
                📞 Contact: {recipient.phone}
              </div>
            )}
          </div>

          {/* FROM Section */}
          <div className="border-t border-dashed border-slate-400 pt-2 flex items-end justify-between text-[10px]">
            <div>
              <span className="text-[8px] text-slate-500 font-black uppercase">FROM (SENDER):</span>
              <div className="font-black text-slate-900 text-xs">{sender.company_name}</div>
              <div className="text-slate-600 text-[10px]">{sender.address_line1}, {sender.city}, {sender.state} - {sender.pincode}</div>
              <div className="text-slate-600 text-[10px]">Desk: {sender.contact_person} • Ph: {sender.phone}</div>
            </div>
            {showQr && (
              <div className="text-center">
                <img src={qrUrl} alt="QR Code" className="w-14 h-14 border border-slate-900 p-0.5 rounded" />
                <span className="text-[7px] text-slate-500 font-bold block mt-0.5">SCAN REF</span>
              </div>
            )}
          </div>

          {showUrgentBadge && (
            <div className="border border-slate-900 bg-slate-100 text-center text-[9px] font-black p-1 rounded uppercase tracking-wider text-slate-900">
              ⚠️ CONTENTS: {ref.contents} — HANDLE WITH CARE ⚠️
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-slate-800/80 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-800 text-slate-300 hover:bg-slate-900"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-lg shadow-blue-600/30 gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Courier Label Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
