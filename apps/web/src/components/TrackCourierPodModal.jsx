import React, { useState } from 'react';
import { 
  Package, ExternalLink, Copy, Check, Clock, Calendar, 
  Building2, MapPin, Phone, Truck, ShieldCheck, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getCourierTrackingUrl, formatCourierName } from '@/lib/courierTracker.js';

export default function TrackCourierPodModal({
  isOpen,
  onClose,
  trip = {}
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const courierName = trip.pod_courier_partner || trip.pod_courier_name || 'Courier Partner';
  const trackingNo = trip.pod_courier_awb || trip.pod_courier_tracking_no || trip.courier_docket_no || '—';
  const rawDate = trip.pod_courier_date || trip.pod_courier_dispatch_date;
  const dispatchDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently Dispatched';
  const billingDesk = trip.pod_courier_recipient || trip.pod_courier_billing_desk || `${trip.client_name || 'Client'} Central Accounts Desk`;
  const isReceived = Boolean(trip.pod_courier_received) || trip.pod_hardcopy_status === 'Delivered to Client';

  const trackingUrl = getCourierTrackingUrl(courierName, trackingNo);

  const handleCopyDocket = () => {
    if (trackingNo && trackingNo !== '—') {
      navigator.clipboard.writeText(trackingNo);
      setCopied(true);
      toast.success(`AWB Docket ${trackingNo} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  Track POD Courier
                  {isReceived ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                      Delivered & Acknowledged
                    </Badge>
                  ) : (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] animate-pulse">
                      In Transit to Client Desk
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-xs text-slate-400 font-mono">
                  {trip.trip_id || `TRIP-${trip.id?.slice(-4)}`} • {trip.truck_number || ''}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Courier Summary Card ──────────────────────────────────── */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Courier Partner</span>
            <span className="text-sm font-bold text-indigo-300">
              {formatCourierName(courierName)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Docket / AWB Tracking #</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-mono font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {trackingNo}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyDocket}
                className="w-7 h-7 text-slate-400 hover:text-white"
                title="Copy Docket #"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Dispatch Date</span>
            <span className="text-xs text-slate-200 font-medium">
              {dispatchDate}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Recipient Desk</span>
            <span className="text-xs text-slate-300 text-right max-w-[200px] truncate" title={billingDesk}>
              {billingDesk}
            </span>
          </div>
        </div>

        {/* ── Status Timeline Indicator ─────────────────────────────── */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-xs text-slate-300">
            Original hard-copy consignment notes and physical invoices were dispatched. Tracking details are synchronized.
          </p>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────── */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {trackingUrl ? (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Track on {courierName} Portal
            </a>
          ) : (
            <Button
              disabled
              className="flex-1 rounded-xl text-xs bg-slate-800 text-slate-500"
            >
              No Live Tracking URL
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 text-xs px-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
