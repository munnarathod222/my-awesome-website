import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, Truck, ShieldAlert, CheckCircle2, 
  MapPin, Navigation, FileText, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

export const DELAY_REASONS = [
  { id: 'Traffic Congestion / Highway Blockage', label: 'Traffic / Highway Jam', emoji: '🚦', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'Vehicle Breakdown / Tyre Puncture', label: 'Breakdown / Tyre Puncture', emoji: '🔧', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { id: 'Loading / Unloading Dock Delay', label: 'Warehouse / Dock Hold', emoji: '⏳', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'Severe Weather / Heavy Rain', label: 'Severe Rain / Fog', emoji: '🌧️', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'Border Checkpost / RTO Inspection', label: 'RTO / Checkpost Inspection', emoji: '🚨', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { id: 'Fuel / Toll Queue Delay', label: 'Fuel / Toll Queue', emoji: '⛽', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'Driver Rest / Health Issue', label: 'Driver Rest / Health', emoji: '😴', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  { id: 'Route Detour / Road Repair', label: 'Route Detour / Repair', emoji: '🗺️', color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
  { id: 'Other Custom Reason', label: 'Other Custom Reason', emoji: '✍️', color: 'text-slate-300 border-slate-700 bg-slate-800/50' }
];

export default function LateDeliveryReasonModal({ isOpen, onClose, trip, onSaved }) {
  const [selectedReason, setSelectedReason] = useState('Traffic Congestion / Highway Blockage');
  const [customNote, setCustomNote] = useState('');
  const [actualTime, setActualTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trip) {
      setSelectedReason(trip.late_delivery_reason?.split(' - ')[0] || 'Traffic Congestion / Highway Blockage');
      setCustomNote(trip.late_delivery_reason?.includes(' - ') ? trip.late_delivery_reason.split(' - ').slice(1).join(' - ') : '');
      const now = new Date();
      setActualTime(format(now, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullReason = customNote.trim() ? `${selectedReason} - ${customNote.trim()}` : selectedReason;
      const actualIso = actualTime ? new Date(actualTime).toISOString() : new Date().toISOString();

      const payload = {
        late_delivery_reason: fullReason,
        delivery_actual_time: actualIso,
        is_late_delivery: true,
        trip_status: 'Delivered',
        delivered_at: actualIso
      };

      await pb.collection('trip_logs').update(trip.id, payload, { $autoCancel: false });
      toast.success(`Late delivery reason logged for ${trip.truck_number || 'Vehicle'}`);
      if (onSaved) onSaved({ ...trip, ...payload });
      onClose();
    } catch (err) {
      console.error('Error saving late delivery reason:', err);
      toast.error('Failed to save late delivery reason');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-lg font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            Vehicle Late Delivery Reason
          </DialogTitle>
          <div className="text-xs text-slate-400 space-y-0.5 mt-1">
            <p><span className="font-bold text-white">{trip.truck_number || 'Vehicle'}</span> • Driver: {trip.driver_name || trip.driver || 'N/A'}</p>
            <p className="font-mono text-[11px]">Route: {trip.route || 'N/A'} {trip.trip_id ? `(${trip.trip_id})` : ''}</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-3 flex-1 overflow-y-auto pr-1">
          {/* Reason Selection Grid */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Select Primary Delay Reason *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DELAY_REASONS.map(r => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all ${
                      isSelected 
                        ? `${r.color} ring-2 ring-rose-500/50 shadow-md` 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-base shrink-0">{r.emoji}</span>
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actual Delivery Time */}
          <div className="space-y-1.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Actual Delivery Date &amp; Time
            </Label>
            <Input 
              type="datetime-local"
              value={actualTime}
              onChange={e => setActualTime(e.target.value)}
              className="bg-slate-900 border-slate-800 text-xs font-mono text-white h-9"
              required
            />
          </div>

          {/* Additional Notes / Remark */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Additional Delay Notes / Driver Comment (Optional)
            </Label>
            <Textarea 
              placeholder="e.g. Stuck in 4-hour traffic jam near Pune toll plaza due to accident."
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs resize-none text-slate-200"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20">
              {saving ? 'Logging...' : 'Confirm & Save Delay Reason'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
