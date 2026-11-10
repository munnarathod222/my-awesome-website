import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRightLeft, CheckCircle2, Gauge, Fuel, ShieldCheck, MapPin, Phone, Truck, User, Send, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { logAuditEvent } from '@/lib/auditLogger.js';

export default function TripReassignmentModal({
  isOpen,
  onClose,
  trip,
  trucks = [],
  employees = [],
  preselectedDriverId = null,
  onSuccess
}) {
  const [swapType, setSwapType] = useState('driver_swap'); // 'driver_swap' | 'vehicle_swap' | 'full_crew_swap'
  const [reason, setReason] = useState('Breakdown / Mechanical Failure');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedTruckNumber, setSelectedTruckNumber] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState('50% Tank');
  const [cargoSealStatus, setCargoSealStatus] = useState('Intact & Verified');
  const [newSealNumber, setNewSealNumber] = useState('');
  const [advanceHandoverAmount, setAdvanceHandoverAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill when opening
  useEffect(() => {
    if (isOpen && trip) {
      setSelectedDriverId(preselectedDriverId || '');
      setSelectedTruckNumber(trip.truck_number || '');
      setHandoverLocation(trip.end_location || trip.route || '');
      setOdometerReading('');
      setFuelLevel('50% Tank');
      setCargoSealStatus('Intact & Verified');
      setNewSealNumber('');
      setAdvanceHandoverAmount('');
      setNotes('');
    }
  }, [isOpen, trip, preselectedDriverId]);

  const selectedDriver = useMemo(() => {
    return employees.find(e => e.id === selectedDriverId || e.name === selectedDriverId);
  }, [employees, selectedDriverId]);

  const selectedTruck = useMemo(() => {
    return trucks.find(t => t.truck_number === selectedTruckNumber);
  }, [trucks, selectedTruckNumber]);

  const handleExecuteReassignment = async () => {
    if (!trip) return;

    if (swapType === 'driver_swap' || swapType === 'full_crew_swap') {
      if (!selectedDriverId) {
        toast.error('Please select the replacement standby driver.');
        return;
      }
    }

    if (swapType === 'vehicle_swap' || swapType === 'full_crew_swap') {
      if (!selectedTruckNumber || selectedTruckNumber === trip.truck_number) {
        toast.error('Please select a different replacement vehicle.');
        return;
      }
    }

    if (!handoverLocation.trim()) {
      toast.error('Please enter the handover location / highway milestone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDriverName = selectedDriver ? selectedDriver.name : (trip.driver_name || 'Driver');
      const newDriverPhone = selectedDriver ? (selectedDriver.phone || selectedDriver.mobile || '') : (trip.driver_phone || '');
      const newTruckNum = (swapType === 'vehicle_swap' || swapType === 'full_crew_swap') ? selectedTruckNumber : trip.truck_number;
      const newTruckSize = selectedTruck?.truck_size || selectedTruck?.truck_type || trip.truck_size || 'Container Truck';

      const handoverAudit = {
        timestamp: new Date().toISOString(),
        swapType,
        reason,
        handoverLocation,
        odometer: odometerReading || 'Not Recorded',
        fuelLevel,
        cargoSealStatus: cargoSealStatus === 'Broken / Resealed' ? `Resealed (${newSealNumber || 'No Seal Ref'})` : cargoSealStatus,
        advanceTransferred: advanceHandoverAmount ? `₹${Number(advanceHandoverAmount).toLocaleString('en-IN')}` : 'Nil',
        previousDriver: trip.driver_name || 'Original Driver',
        replacementDriver: newDriverName,
        previousTruck: trip.truck_number,
        replacementTruck: newTruckNum,
        operatorNotes: notes
      };

      // Existing reassignment history array
      let history = [];
      try {
        if (trip.reassignment_history) {
          history = typeof trip.reassignment_history === 'string' ? JSON.parse(trip.reassignment_history) : trip.reassignment_history;
        }
      } catch (e) {
        history = [];
      }
      history.push(handoverAudit);

      const updatePayload = {
        driver_name: newDriverName,
        driver_phone: newDriverPhone,
        truck_number: newTruckNum,
        truck_size: newTruckSize,
        reassignment_history: JSON.stringify(history),
        notes: trip.notes ? `${trip.notes}\n[Emergency Reassign ${new Date().toLocaleDateString('en-IN')}]: ${reason} at ${handoverLocation}. Replacement: ${newTruckNum} / ${newDriverName}.` : `[Emergency Reassign ${new Date().toLocaleDateString('en-IN')}]: ${reason} at ${handoverLocation}. Replacement: ${newTruckNum} / ${newDriverName}.`
      };

      await pb.collection('trip_logs').update(trip.id, updatePayload, { $autoCancel: false });

      logAuditEvent({
        action: 'EMERGENCY_REASSIGNMENT',
        module: 'Trip Logs',
        recordId: trip.trip_id || trip.id,
        details: `Reassigned ${swapType} due to "${reason}" at "${handoverLocation}". New Vehicle: ${newTruckNum}, New Driver: ${newDriverName}`
      });

      toast.success(`Trip ${trip.trip_id || trip.id} successfully reassigned to ${newDriverName}!`);
      
      if (onSuccess) onSuccess(updatePayload, handoverAudit);
      onClose();
    } catch (err) {
      console.error('Failed to execute reassignment:', err);
      toast.error('Failed to execute trip reassignment: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppAlertClient = () => {
    if (!trip) return;
    const clientPhone = trip.client_phone || trip.expand?.client_id?.phone || '';
    const clientName = trip.client_name || trip.expand?.client_id?.client_name || 'Valued Partner';
    const tripRef = trip.lr_number || trip.trip_id || 'TRIP';
    const newDriverName = selectedDriver ? selectedDriver.name : trip.driver_name;
    const newTruck = (swapType === 'vehicle_swap' || swapType === 'full_crew_swap') ? selectedTruckNumber : trip.truck_number;

    const msg = `⚠️ *JAI BHAVANI CARGO - EN-ROUTE TRIP DISPATCH UPDATE*

Dear *${clientName}*,

Please note an operational update regarding your shipment under Trip / LR No: *${tripRef}*:

📌 *Updated Dispatch Details:*
• Trip Ref: *${tripRef}*
• Handover Reason: *${reason}*
• Transit Handover Point: *${handoverLocation || 'En-Route Highway'}*
• Assigned Vehicle: *${newTruck}*
• Assigned Driver: *${newDriverName}*
• Cargo Seal Status: *${cargoSealStatus}*

📍 *Live GPS Consignment Tracking:*
https://www.jaibhavanicargo.com/track/${encodeURIComponent(trip.trip_id || trip.id || tripRef)}

Our 24x7 control room is monitoring transit to ensure seamless on-time arrival.
📞 Central Operations Desk: +91 7799072244`;

    const clean = clientPhone.replace(/[^0-9]/g, '');
    const waUrl = clean ? `https://wa.me/${clean.length === 10 ? '91' + clean : clean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleWhatsAppDispatchDriver = () => {
    if (!trip || !selectedDriver) return;
    const driverPhone = selectedDriver.phone || selectedDriver.mobile || '';
    const tripRef = trip.lr_number || trip.trip_id || 'TRIP';
    const dest = trip.destination || trip.end_location || trip.route || 'Destination';
    const handoverGps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(handoverLocation)}`;

    const msg = `🚨 *JAI BHAVANI CARGO - EMERGENCY DRIVER TAKEOVER DISPATCH*

Dear *${selectedDriver.name}*,

You have been dispatched as the standby driver for Trip Ref: *${tripRef}*:

📌 *Assignment Instructions:*
• Proceed to Handover Point: *${handoverLocation}*
• Google Maps Location: ${handoverGps}
• Vehicle to Take Over: *${(swapType === 'vehicle_swap' || swapType === 'full_crew_swap') ? selectedTruckNumber : trip.truck_number}*
• Final Destination: *${dest}*
• Cargo Seal: *${cargoSealStatus}*

📱 *Driver 1-Tap Dashboard:*
https://www.jaibhavanicargo.com/driver-nav/${encodeURIComponent(trip.trip_id || trip.id || tripRef)}

Drive safe, verify cargo seal with the outgoing driver, and inform control room upon takeover!
📞 Control Room: +91 7799072244`;

    const clean = driverPhone.replace(/[^0-9]/g, '');
    const waUrl = clean ? `https://wa.me/${clean.length === 10 ? '91' + clean : clean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  if (!isOpen || !trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Emergency Trip Reassignment Workflow
            </DialogTitle>
            <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-400 bg-amber-500/10">
              {trip.lr_number || trip.trip_id || trip.id}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Reassign driver or vehicle during highway emergencies, log cargo handover metrics, and dispatch automatic WhatsApp alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none text-xs">
          {/* Current Crew Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Vehicle</span>
              <span className="font-mono font-bold text-white flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-400" /> {trip.truck_number || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Driver</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <User className="w-3 h-3 text-sky-400" /> {trip.driver_name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Corridor</span>
              <span className="font-medium text-slate-200 truncate block">
                {trip.route || `${trip.origin || 'Origin'} ➔ ${trip.destination || 'Destination'}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Status</span>
              <span className="font-bold text-amber-400">{trip.trip_status || 'In Transit'}</span>
            </div>
          </div>

          {/* Swap Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Reassignment Swap Type</Label>
              <Select value={swapType} onValueChange={setSwapType}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="driver_swap">👤 Driver Swap Only (Standby Driver)</SelectItem>
                  <SelectItem value="vehicle_swap">🚛 Vehicle Swap Only (Transshipment)</SelectItem>
                  <SelectItem value="full_crew_swap">🔄 Full Crew & Vehicle Swap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Emergency / Swap Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-amber-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="Breakdown / Mechanical Failure">⚙️ Breakdown / Mechanical Failure</SelectItem>
                  <SelectItem value="Driver Medical / Fatigue Emergency">🩺 Driver Medical / Fatigue Emergency</SelectItem>
                  <SelectItem value="Highway Accident / Fender Bender">🚨 Highway Accident / Incident</SelectItem>
                  <SelectItem value="Severe Corridor Jam / Road Blockage">🚧 Highway Road Blockage / Jam</SelectItem>
                  <SelectItem value="Client Express Transshipment Reroute">📦 Client Emergency Reroute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Replacement Driver / Vehicle Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            {(swapType === 'driver_swap' || swapType === 'full_crew_swap') && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-sky-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Select Replacement Standby Driver *
                </Label>
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-white">
                    <SelectValue placeholder="Choose Standby Driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id} className="py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">{e.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{e.phone || e.mobile || 'No Phone'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(swapType === 'vehicle_swap' || swapType === 'full_crew_swap') && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Select Replacement Truck *
                </Label>
                <Select value={selectedTruckNumber} onValueChange={setSelectedTruckNumber}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold font-mono text-white">
                    <SelectValue placeholder="Choose Replacement Truck" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    {trucks.filter(t => t.truck_number !== trip.truck_number).map(t => (
                      <SelectItem key={t.id || t.truck_number} value={t.truck_number} className="py-2">
                        <div className="flex items-center justify-between gap-2 font-mono">
                          <span className="font-bold">{t.truck_number}</span>
                          <span className="text-[10px] text-slate-400">{t.truck_size || t.truck_type || 'Container'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Handover Checklist Section */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              📋 Handover & Compliance Checklist
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Swap Handover Location *
                </Label>
                <Input
                  value={handoverLocation}
                  onChange={e => setHandoverLocation(e.target.value)}
                  placeholder="e.g. NH-44 Toll Kurnool / Depot"
                  className="bg-slate-900 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-sky-400" /> Odometer at Swap (KM)
                </Label>
                <Input
                  type="number"
                  value={odometerReading}
                  onChange={e => setOdometerReading(e.target.value)}
                  placeholder="e.g. 142580"
                  className="bg-slate-900 border-slate-800 text-xs rounded-xl font-mono text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-400" /> Fuel Gauge Level
                </Label>
                <Select value={fuelLevel} onValueChange={setFuelLevel}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="Reserve / Low">⚠️ Reserve / Low Tank</SelectItem>
                    <SelectItem value="25% Tank">¼ Tank (25%)</SelectItem>
                    <SelectItem value="50% Tank">½ Tank (50%)</SelectItem>
                    <SelectItem value="75% Tank">¾ Tank (75%)</SelectItem>
                    <SelectItem value="100% Full Tank">⛽ Full Tank (100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Cargo Container Seal Status
                </Label>
                <Select value={cargoSealStatus} onValueChange={setCargoSealStatus}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="Intact & Verified">🔒 Intact & Verified Official Seal</SelectItem>
                    <SelectItem value="Broken / Resealed">🔄 Transshipped / Resealed with New Seal</SelectItem>
                    <SelectItem value="Damaged / Inspected">⚠️ Damaged / Emergency Customs Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cargoSealStatus === 'Broken / Resealed' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-amber-400">New Cargo Seal Number *</Label>
                  <Input
                    value={newSealNumber}
                    onChange={e => setNewSealNumber(e.target.value)}
                    placeholder="e.g. SL-2026-9912"
                    className="bg-slate-900 border-slate-800 text-xs rounded-xl font-mono text-white"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Driver Cash Advance Transferred (₹)</Label>
                <Input
                  type="number"
                  value={advanceHandoverAmount}
                  onChange={e => setAdvanceHandoverAmount(e.target.value)}
                  placeholder="Cash passed to Leg 2 driver"
                  className="bg-slate-900 border-slate-800 text-xs rounded-xl font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Operator Incident Notes / Handover Log</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Details of transshipment, mechanical assistance, roadside workshop name..."
                className="bg-slate-900 border-slate-800 text-xs rounded-xl text-white h-16"
              />
            </div>
          </div>

          {/* Quick WhatsApp Notification Triggers */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" /> One-Tap WhatsApp Broadcasts:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleWhatsAppAlertClient}
                className="h-8 text-xs font-bold rounded-xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex-1 sm:flex-none"
              >
                🏢 WhatsApp Client Alert
              </Button>
              {selectedDriver && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppDispatchDriver}
                  className="h-8 text-xs font-bold rounded-xl border-sky-500/30 text-sky-400 hover:bg-sky-500/10 flex-1 sm:flex-none"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" /> GPS to Replacement Driver
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl text-xs border-slate-800 text-slate-300">
            Cancel
          </Button>
          <Button
            onClick={handleExecuteReassignment}
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? 'Executing Reassignment...' : 'Confirm & Execute Reassignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
