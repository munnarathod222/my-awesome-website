import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, 
  UploadCloud, Image, Trash2, Camera, ShieldAlert, Sparkles, Truck, DollarSign, Calendar
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { TYRE_SLOTS } from './TyreFormModal.jsx';

const REPLACEMENT_REASONS = [
  'Torn / Burst on Highway',
  'Severe Sidewall Cut / Damage',
  'Tread Worn Out (< 2mm)',
  'Uneven Wear / Alignment Issue',
  'Multiple Punctures / Bead Failure',
  'Retreading Required',
  'Scheduled Fleet Upgrade',
  'Manufacturing Defect / Bulge'
];

const TYRE_BRANDS = [
  'MRF',
  'Apollo',
  'JK Tyre',
  'CEAT',
  'Bridgestone',
  'Michelin',
  'Goodyear',
  'Continental',
  'Other'
];

export default function ReplaceTyreModal({
  isOpen,
  onClose,
  oldTyre,
  truck,
  onSuccess
}) {
  const [step, setStep] = useState(1); // 1: Old Tyre Retirement & Damage Audit, 2: New Tyre Installation
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Old Tyre State
  const [oldTyreForm, setOldTyreForm] = useState({
    replacementDate: format(new Date(), 'yyyy-MM-dd'),
    replacementReason: 'Torn / Burst on Highway',
    removalOdometer: '',
    finalTreadDepth: '',
    mechanicNotes: ''
  });
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [damagePhotoPreviews, setDamagePhotoPreviews] = useState([]);

  // Step 2: New Tyre State
  const [newTyreForm, setNewTyreForm] = useState({
    tyre_brand: 'MRF',
    model_no: 'Steel Muscle',
    serial_number: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    tyre_depth_mm: '14',
    purchase_cost: '',
    vendor_name: ''
  });
  const [newTyrePhoto, setNewTyrePhoto] = useState(null);
  const [newTyrePhotoPreview, setNewTyrePhotoPreview] = useState(null);
  const [newTyreInvoice, setNewTyreInvoice] = useState(null);

  useEffect(() => {
    if (isOpen && oldTyre) {
      setStep(1);
      setOldTyreForm({
        replacementDate: format(new Date(), 'yyyy-MM-dd'),
        replacementReason: 'Torn / Burst on Highway',
        removalOdometer: '',
        finalTreadDepth: oldTyre.tyre_depth_mm ? String(oldTyre.tyre_depth_mm) : '',
        mechanicNotes: ''
      });
      setDamagePhotos([]);
      setDamagePhotoPreviews([]);
      setNewTyreForm({
        tyre_brand: 'MRF',
        model_no: 'Steel Muscle',
        serial_number: '',
        purchase_date: format(new Date(), 'yyyy-MM-dd'),
        tyre_depth_mm: '14',
        purchase_cost: '',
        vendor_name: ''
      });
      setNewTyrePhoto(null);
      setNewTyrePhotoPreview(null);
      setNewTyreInvoice(null);
    }
  }, [isOpen, oldTyre]);

  if (!oldTyre) return null;

  const slotDef = TYRE_SLOTS.find(s => s.id === oldTyre.tyre_position);
  const positionLabel = slotDef ? slotDef.label : (oldTyre.tyre_position || 'Truck Axle');

  const handleDamagePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setDamagePhotos(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDamagePhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDamagePhoto = (index) => {
    setDamagePhotos(prev => prev.filter((_, i) => i !== index));
    setDamagePhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewTyrePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTyrePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReplacement = async () => {
    if (!newTyreForm.serial_number) {
      toast.error('Please enter the new tyre serial number');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Archive Old Tyre Record
      const oldTyreUpdatePayload = new FormData();
      oldTyreUpdatePayload.append('status', 'replaced');
      oldTyreUpdatePayload.append('tyre_position', ''); // Free up the truck slot
      oldTyreUpdatePayload.append('notes', `REPLACED on ${oldTyreForm.replacementDate}: Reason - ${oldTyreForm.replacementReason}. ${oldTyreForm.mechanicNotes || ''}`);
      
      // Append damage photos to old tyre record if any
      damagePhotos.forEach(file => {
        oldTyreUpdatePayload.append('tyre_image', file);
      });

      await pb.collection('tyres').update(oldTyre.id, oldTyreUpdatePayload, { $autoCancel: false });

      // 2. Create New Active Tyre Record for this slot
      const newTyrePayload = new FormData();
      newTyrePayload.append('truck_id', oldTyre.truck_id);
      newTyrePayload.append('tyre_position', oldTyre.tyre_position);
      newTyrePayload.append('tyre_brand', newTyreForm.tyre_brand);
      newTyrePayload.append('model_no', newTyreForm.model_no);
      newTyrePayload.append('serial_number', newTyreForm.serial_number);
      newTyrePayload.append('purchase_date', newTyreForm.purchase_date + ' 00:00:00.000Z');
      newTyrePayload.append('tyre_depth_mm', Number(newTyreForm.tyre_depth_mm || 14));
      newTyrePayload.append('status', 'active');
      newTyrePayload.append('current_lifecycle_kms', 0);
      newTyrePayload.append('assignment_start_kms', oldTyreForm.removalOdometer ? Number(oldTyreForm.removalOdometer) : 0);

      if (newTyrePhoto) {
        newTyrePayload.append('tyre_image', newTyrePhoto);
      }
      if (newTyreInvoice) {
        newTyrePayload.append('bill_invoice', newTyreInvoice);
      }

      await pb.collection('tyres').create(newTyrePayload, { $autoCancel: false });

      toast.success(`✅ Successfully replaced tyre at ${positionLabel}! Old tyre archived.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Tyre replacement error:', err);
      toast.error('Failed to replace tyre: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl shadow-2xl">
        {/* Header Strip */}
        <div className="bg-slate-900 border-b border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                  Replace Tyre: <span className="text-cyan-400 font-mono">{positionLabel}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Truck: <strong className="text-slate-200">{truck?.truck_number}</strong> • Archive damaged/worn tyre specs &amp; install new tyre
                </DialogDescription>
              </div>
            </div>

            {/* Step Pill */}
            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs px-3 py-1 font-mono">
              Step {step} of 2: {step === 1 ? 'Old Tyre Audit' : 'New Tyre Specs'}
            </Badge>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Step 1: Old Tyre Retirement & Damage Audit */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Old Tyre Current Specs Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Current Old Tyre Details
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Brand &amp; Model</span>
                    <strong className="text-slate-200 font-bold">{oldTyre.tyre_brand} {oldTyre.model_no || ''}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Serial Number</span>
                    <strong className="text-cyan-400 font-bold">{oldTyre.serial_number || 'N/A'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Total Lifespan Run</span>
                    <strong className="text-purple-400 font-bold">{(oldTyre.current_lifecycle_kms || 0).toLocaleString('en-IN')} KM</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Installed On</span>
                    <strong className="text-slate-300">{oldTyre.purchase_date ? oldTyre.purchase_date.split('T')[0] : 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Reason for Replacement & Removal Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">
                    Reason for Replacement <span className="text-rose-400">*</span>
                  </Label>
                  <Select 
                    value={oldTyreForm.replacementReason} 
                    onValueChange={(val) => setOldTyreForm(p => ({ ...p, replacementReason: val }))}
                  >
                    <SelectTrigger className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      {REPLACEMENT_REASONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Removal Date</Label>
                  <Input 
                    type="date"
                    value={oldTyreForm.replacementDate}
                    onChange={(e) => setOldTyreForm(p => ({ ...p, replacementDate: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Removal Odometer & Final Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">
                    Current Truck Odometer (KM)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 145000"
                    value={oldTyreForm.removalOdometer}
                    onChange={(e) => setOldTyreForm(p => ({ ...p, removalOdometer: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Final Tread Depth (mm)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 1.5"
                    value={oldTyreForm.finalTreadDepth}
                    onChange={(e) => setOldTyreForm(p => ({ ...p, finalTreadDepth: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Upload Old Tyre Damage Photos */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" /> Upload Damaged / Torn Tyre Photos
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Saved permanently in history</span>
                </Label>

                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-4 bg-slate-900/50 text-center transition-colors">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    id="damage-photos"
                    onChange={handleDamagePhotoChange}
                    className="hidden" 
                  />
                  <label htmlFor="damage-photos" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <span className="text-xs font-bold text-cyan-400">Click to upload damage photos</span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG (burst tread, sidewall crack, etc.)</span>
                  </label>
                </div>

                {/* Previews */}
                {damagePhotoPreviews.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-2">
                    {damagePhotoPreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 group">
                        <img src={src} alt="Damage Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeDamagePhoto(i)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mechanic Notes */}
              <div>
                <Label className="text-xs font-bold text-slate-300">Condition &amp; Mechanic Notes</Label>
                <Textarea 
                  placeholder="e.g. Torn near right shoulder on NH44 route due to sharp object. Inspected by mechanic."
                  value={oldTyreForm.mechanicNotes}
                  onChange={(e) => setOldTyreForm(p => ({ ...p, mechanicNotes: e.target.value }))}
                  className="mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* Step 2: New Replacement Tyre Installation */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Assigning new tyre into slot: <strong className="text-white font-mono">{positionLabel}</strong></span>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">
                    New Tyre Brand <span className="text-cyan-400">*</span>
                  </Label>
                  <Select 
                    value={newTyreForm.tyre_brand} 
                    onValueChange={(val) => setNewTyreForm(p => ({ ...p, tyre_brand: val }))}
                  >
                    <SelectTrigger className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      {TYRE_BRANDS.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Model / Pattern</Label>
                  <Input 
                    placeholder="e.g. Steel Muscle / EnduRace RD"
                    value={newTyreForm.model_no}
                    onChange={(e) => setNewTyreForm(p => ({ ...p, model_no: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Serial Number & Purchase Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">
                    Serial Number (Unique) <span className="text-cyan-400">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. MRF-8924019"
                    value={newTyreForm.serial_number}
                    onChange={(e) => setNewTyreForm(p => ({ ...p, serial_number: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-cyan-400 font-bold font-mono text-xs rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Installation Date</Label>
                  <Input 
                    type="date"
                    value={newTyreForm.purchase_date}
                    onChange={(e) => setNewTyreForm(p => ({ ...p, purchase_date: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Initial Tread Depth & Purchase Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">
                    Initial Tread Depth (mm)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 14"
                    value={newTyreForm.tyre_depth_mm}
                    onChange={(e) => setNewTyreForm(p => ({ ...p, tyre_depth_mm: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-emerald-400 font-bold font-mono text-xs rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Purchase Cost (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 24500"
                    value={newTyreForm.purchase_cost}
                    onChange={(e) => setNewTyreForm(p => ({ ...p, purchase_cost: e.target.value }))}
                    className="h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* New Tyre Photo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-300">New Tyre Photo</Label>
                  <div className="border border-dashed border-slate-800 rounded-xl p-3 bg-slate-900/40 text-center mt-1.5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="new-tyre-photo" 
                      onChange={handleNewPhotoChange}
                      className="hidden" 
                    />
                    <label htmlFor="new-tyre-photo" className="cursor-pointer flex items-center justify-center gap-2 text-xs text-cyan-400 font-bold">
                      <Camera className="w-4 h-4" /> {newTyrePhoto ? newTyrePhoto.name : 'Upload New Tyre Image'}
                    </label>
                  </div>
                  {newTyrePhotoPreview && (
                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                      <img src={newTyrePhotoPreview} alt="New Tyre" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-300">Bill / Purchase Invoice</Label>
                  <div className="border border-dashed border-slate-800 rounded-xl p-3 bg-slate-900/40 text-center mt-1.5">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      id="new-tyre-invoice" 
                      onChange={(e) => setNewTyreInvoice(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                    <label htmlFor="new-tyre-invoice" className="cursor-pointer flex items-center justify-center gap-2 text-xs text-purple-400 font-bold">
                      <UploadCloud className="w-4 h-4" /> {newTyreInvoice ? newTyreInvoice.name : 'Upload Bill / PDF'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="h-10 text-xs rounded-xl text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="h-10 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-600/20"
              >
                Proceed to New Tyre <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10 text-xs rounded-xl border-slate-700 bg-slate-950 text-slate-300"
                >
                  Back to Step 1
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitReplacement}
                  disabled={isSubmitting}
                  className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                  {isSubmitting ? 'Installing...' : 'Confirm Replacement'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
