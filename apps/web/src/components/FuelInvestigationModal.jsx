import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, ShieldAlert, Fuel, CheckCircle2, Wrench, 
  User, Scale, Clock, DollarSign, FileText, Send, Loader2, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ROOT_CAUSE_OPTIONS = [
  {
    id: 'fuel_theft',
    label: '🛢️ Fuel Theft / Pilferage',
    desc: 'Unauthorized siphoning, fuel station slip mismatch, or fake receipt'
  },
  {
    id: 'excessive_idling',
    label: '⏱️ Excessive Engine Idling',
    desc: 'AC running during loading dock wait or overnight rest idling'
  },
  {
    id: 'vehicle_problem',
    label: '🔧 Vehicle Mechanical Problem',
    desc: 'Clogged fuel injector, choked air filter, brake binding, or turbo loss'
  },
  {
    id: 'driver_behaviour',
    label: '👨‍✈️ Driver Driving Behaviour',
    desc: 'High RPM cruising, aggressive acceleration, or speeding > 65 km/h'
  },
  {
    id: 'overloading',
    label: '⚖️ Overloading / Aerodynamic Drag',
    desc: 'Payload exceeding GVW limit or improper tarpaulin wind resistance'
  }
];

export default function FuelInvestigationModal({ isOpen, onClose, log, onSuccess }) {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState([]);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('Warning Issued');
  const [investigationStatus, setInvestigationStatus] = useState('Under Investigation');
  const [customLossAmount, setCustomLossAmount] = useState('');

  // Calculations
  const expectedMileage = log?.expected_mileage || 5.8;
  const actualMileage = log?.actual_mileage || (log?.distance && log?.liters ? (Number(log.distance) / Number(log.liters)) : 4.7);
  const dropPct = expectedMileage > 0 
    ? Math.max(0, Math.round(((expectedMileage - actualMileage) / expectedMileage) * 100))
    : 0;

  const excessLiters = (log?.distance && expectedMileage > 0)
    ? Math.max(0, Math.round((Number(log.liters || 0) - (Number(log.distance) / expectedMileage)) * 10) / 10)
    : 0;
  
  const estimatedCostLoss = Math.round(excessLiters * (log?.fuel_price || 94.5));

  useEffect(() => {
    if (isOpen && log) {
      // Parse existing root causes if previously investigated
      if (log.root_causes) {
        try {
          const parsed = typeof log.root_causes === 'string' ? JSON.parse(log.root_causes) : log.root_causes;
          setSelectedCauses(Array.isArray(parsed) ? parsed : [log.root_causes]);
        } catch (_) {
          setSelectedCauses(log.root_causes.split(',').map(s => s.trim()));
        }
      } else {
        setSelectedCauses([]);
      }

      setInterviewNotes(log.investigation_notes || log.driver_interview_notes || '');
      setActionTaken(log.action_taken || 'Warning Issued');
      setInvestigationStatus(log.investigation_status || 'Under Investigation');
      setCustomLossAmount(log.financial_loss_inr ? log.financial_loss_inr.toString() : estimatedCostLoss.toString());
    }
  }, [isOpen, log]);

  const toggleCause = (causeId) => {
    setSelectedCauses(prev => 
      prev.includes(causeId) ? prev.filter(id => id !== causeId) : [...prev, causeId]
    );
  };

  const handleSaveInvestigation = async (e) => {
    e?.preventDefault();
    if (!log?.id) return;

    if (selectedCauses.length === 0) {
      toast.error('Please select at least one root cause category.');
      return;
    }

    setSaving(true);
    try {
      const causesStr = JSON.stringify(selectedCauses);
      const lossVal = parseFloat(customLossAmount) || estimatedCostLoss;

      // 1. Update fuel_tracker record
      await pb.collection('fuel_tracker').update(log.id, {
        is_anomaly: true,
        expected_mileage: expectedMileage,
        efficiency_drop_pct: dropPct,
        excess_liters_lost: excessLiters,
        financial_loss_inr: lossVal,
        investigation_status: investigationStatus,
        root_causes: causesStr,
        investigation_notes: interviewNotes,
        action_taken: actionTaken
      }, { $autoCancel: false });

      // 2. Create / log audit record in fuel_investigations collection
      try {
        await pb.collection('fuel_investigations').create({
          fuel_log_id: log.id,
          truck_number: log.truck_number || log.vehicle_name || 'Fleet Truck',
          driver_name: log.driver_name || 'Driver',
          trip_id: log.trip_id || 'Refill Log',
          refill_date: log.date || new Date().toISOString().split('T')[0],
          expected_mileage: expectedMileage,
          actual_mileage: Math.round(actualMileage * 100) / 100,
          efficiency_drop_pct: dropPct,
          excess_liters_lost: excessLiters,
          financial_loss_inr: lossVal,
          root_causes: causesStr,
          driver_interview_notes: interviewNotes,
          action_taken: actionTaken,
          status: investigationStatus,
          investigated_by: currentUser?.name || currentUser?.email || 'Operations Admin',
          resolution_notes: `Efficiency drop of ${dropPct}% investigated. Root causes: ${selectedCauses.join(', ')}.`
        }, { $autoCancel: false });
      } catch (invErr) {
        console.warn('Investigation record save notice:', invErr);
      }

      toast.success('Fuel anomaly investigation logged successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save investigation:', err);
      toast.error(err.message || 'Failed to save investigation record');
    } finally {
      setSaving(false);
    }
  };

  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
        <DialogHeader className="p-5 pb-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  Fuel Fraud & Mileage Loss Investigation
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Investigate efficiency drop for <strong className="text-white">{log.truck_number || log.vehicle_name || 'Truck'}</strong>
                </DialogDescription>
              </div>
            </div>

            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-mono font-bold">
              {dropPct}% EFFICIENCY LOSS
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Main Anomaly Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> ⚠️ Fuel efficiency dropped {dropPct}%.
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Date: {log.date ? log.date.split('T')[0] : 'Recent Refill'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Expected</span>
                <strong className="text-white text-sm">{expectedMileage} km/L</strong>
              </div>
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Actual</span>
                <strong className="text-rose-400 text-sm">{Math.round(actualMileage * 100) / 100} km/L</strong>
              </div>
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Diesel Wasted</span>
                <strong className="text-amber-400 text-sm">~{excessLiters} Liters</strong>
              </div>
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Cost Loss</span>
                <strong className="text-emerald-400 text-sm">{formatCurrency(estimatedCostLoss)}</strong>
              </div>
            </div>
          </div>

          {/* 5-Point Root Cause Diagnostic Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Discovered Root Causes <span className="text-rose-400">*</span>
              </Label>
              <span className="text-[11px] text-slate-500">Multi-select applicable factors</span>
            </div>

            <div className="space-y-2">
              {ROOT_CAUSE_OPTIONS.map(cause => {
                const isSelected = selectedCauses.includes(cause.id);
                return (
                  <div
                    key={cause.id}
                    onClick={() => toggleCause(cause.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCause(cause.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="text-xs font-bold">{cause.label}</div>
                      <div className="text-[11px] text-slate-400">{cause.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Interview / Inspection Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">
              Driver Interview & Fleet Inspection Notes
            </Label>
            <Textarea
              placeholder="e.g. Driver Ramesh interviewed; stated 4-hour traffic jam at Solapur bypass with AC running. Tank cap seal was intact. Workshop inspection scheduled for injector cleaning."
              value={interviewNotes}
              onChange={e => setInterviewNotes(e.target.value)}
              rows={3}
              className="bg-slate-900 border-slate-800 text-xs rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>

          {/* Action Taken & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Action Taken</Label>
              <Select value={actionTaken} onValueChange={setActionTaken}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="Warning Issued" className="text-xs">⚠️ First Warning Issued to Driver</SelectItem>
                  <SelectItem value="Driver Salary Deduction" className="text-xs">💰 Driver Fuel Siphoning Deduction</SelectItem>
                  <SelectItem value="Workshop Job Card Created" className="text-xs">🔧 Maintenance Job Card Created</SelectItem>
                  <SelectItem value="Fuel Station Audited" className="text-xs">🏪 Fuel Station Quantity Audited</SelectItem>
                  <SelectItem value="Dismissed - Valid Traffic/Hill Route" className="text-xs">✅ Dismissed (Valid Ghat/Traffic Route)</SelectItem>
                  <SelectItem value="Under Surveillance" className="text-xs">🔍 Flagged Under Telematics Watch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Investigation Status</Label>
              <Select value={investigationStatus} onValueChange={setInvestigationStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="Under Investigation" className="text-xs text-amber-400">⏳ Under Investigation</SelectItem>
                  <SelectItem value="Recovery Initiated" className="text-xs text-rose-400">💵 Recovery / Deduction Initiated</SelectItem>
                  <SelectItem value="Resolved - Maintenance" className="text-xs text-sky-400">🔧 Resolved (Vehicle Serviced)</SelectItem>
                  <SelectItem value="Closed - No Theft" className="text-xs text-emerald-400">✅ Closed (Legitimate Route Cause)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveInvestigation}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow px-5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
            Save & Resolve Investigation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
