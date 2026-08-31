import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ShieldAlert, Upload, Image as ImageIcon, Trash2, Plus, Loader2, Save, FileText } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const INSURERS = [
  'ICICI Lombard', 'HDFC ERGO', 'Tata AIG', 'National Insurance', 
  'New India Assurance', 'Bajaj Allianz', 'United India Insurance', 
  'Reliance General Insurance', 'Go Digit Insurance', 'Other'
];

const CLAIM_TYPES = [
  'Accident / Collision',
  'Windshield / Glass Damage',
  'Theft / Hijack',
  'Fire & Explosion',
  'Third Party Liability',
  'Flood / Natural Disaster',
  'Body & Bumper Repairs',
  'Engine & Mechanical Damage'
];

export default function LogInsuranceClaimModal({ isOpen, onClose, claimToEdit, trucks = [], onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    truck_number: '',
    truck_id: '',
    claim_number: '',
    insurance_company: 'ICICI Lombard',
    claim_type: 'Accident / Collision',
    claim_date: new Date().toISOString().split('T')[0],
    incident_date: new Date().toISOString().split('T')[0],
    claimed_amount: '',
    approved_amount: '',
    amount_received: '',
    status: 'Pending',
    driver_name: '',
    incident_location: '',
    notes: '',
    images: [] // Array of image URLs
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (claimToEdit) {
        let existingImages = [];
        try {
          existingImages = typeof claimToEdit.images_json === 'string' ? JSON.parse(claimToEdit.images_json || '[]') : (claimToEdit.images_json || []);
        } catch (e) {
          existingImages = [];
        }

        setFormData({
          truck_number: claimToEdit.truck_number || '',
          truck_id: claimToEdit.truck_id || '',
          claim_number: claimToEdit.claim_number || '',
          insurance_company: claimToEdit.insurance_company || 'ICICI Lombard',
          claim_type: claimToEdit.claim_type || 'Accident / Collision',
          claim_date: claimToEdit.claim_date || new Date().toISOString().split('T')[0],
          incident_date: claimToEdit.incident_date || new Date().toISOString().split('T')[0],
          claimed_amount: claimToEdit.claimed_amount || '',
          approved_amount: claimToEdit.approved_amount || '',
          amount_received: claimToEdit.amount_received || '',
          status: claimToEdit.status || 'Pending',
          driver_name: claimToEdit.driver_name || '',
          incident_location: claimToEdit.incident_location || '',
          notes: claimToEdit.notes || '',
          images: existingImages
        });
      } else {
        // Default new claim values
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormData({
          truck_number: trucks[0]?.truck_number || '',
          truck_id: trucks[0]?.id || '',
          claim_number: `CLM-${new Date().getFullYear()}-${randomNum}`,
          insurance_company: 'ICICI Lombard',
          claim_type: 'Accident / Collision',
          claim_date: new Date().toISOString().split('T')[0],
          incident_date: new Date().toISOString().split('T')[0],
          claimed_amount: '',
          approved_amount: '',
          amount_received: '',
          status: 'Pending',
          driver_name: '',
          incident_location: '',
          notes: '',
          images: []
        });
      }
    }
  }, [isOpen, claimToEdit, trucks]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTruckChange = (truckNumber) => {
    const foundTruck = trucks.find(t => t.truck_number === truckNumber);
    setFormData(prev => ({
      ...prev,
      truck_number: truckNumber,
      truck_id: foundTruck?.id || ''
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('truck_id', formData.truck_id || 'INSURANCE_CLAIM');
      fileData.append('document_type', 'Other');
      fileData.append('document_name', `Claim Photo - ${file.name}`);
      fileData.append('notes', `Insurance claim evidence photo for ${formData.claim_number}`);

      const uploadedRec = await pb.collection('truck_documents').create(fileData, { $autoCancel: false });
      const publicUrl = pb.files.getUrl(uploadedRec, uploadedRec.file);

      setFormData(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
      toast.success('Accident photo uploaded successfully!');
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput('');
    toast.success('Image link added!');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.truck_number) {
      toast.error('Please select a vehicle number');
      return;
    }
    if (!formData.claim_number.trim()) {
      toast.error('Please enter a claim reference number');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        truck_number: formData.truck_number,
        truck_id: formData.truck_id,
        claim_number: formData.claim_number.trim(),
        insurance_company: formData.insurance_company,
        claim_type: formData.claim_type,
        claim_date: formData.claim_date,
        incident_date: formData.incident_date,
        claimed_amount: parseFloat(formData.claimed_amount) || 0,
        approved_amount: parseFloat(formData.approved_amount) || 0,
        amount_received: parseFloat(formData.amount_received) || 0,
        status: formData.status,
        driver_name: formData.driver_name.trim(),
        incident_location: formData.incident_location.trim(),
        images_json: JSON.stringify(formData.images),
        notes: formData.notes.trim()
      };

      if (claimToEdit?.id) {
        await pb.collection('insurance_claims').update(claimToEdit.id, payload, { $autoCancel: false });
        toast.success(`Insurance Claim "${payload.claim_number}" updated successfully!`);
      } else {
        await pb.collection('insurance_claims').create(payload, { $autoCancel: false });
        toast.success(`Insurance Claim "${payload.claim_number}" logged successfully!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save insurance claim:', err);
      toast.error(`Failed to save claim: ${err.message || 'Error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            {claimToEdit ? 'Edit Insurance Claim' : 'Log New Insurance Claim'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Truck & Claim Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Select Vehicle *</Label>
              <Select value={formData.truck_number} onValueChange={handleTruckChange}>
                <SelectTrigger className="bg-background font-bold">
                  <SelectValue placeholder="Select Truck..." />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id || t.truck_number} value={t.truck_number}>
                      {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Claim Reference No. *</Label>
              <Input 
                value={formData.claim_number}
                onChange={(e) => handleChange('claim_number', e.target.value)}
                placeholder="e.g. CLM-2026-8841"
                className="bg-background font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Insurer & Claim Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Insurance Provider</Label>
              <Select value={formData.insurance_company} onValueChange={(val) => handleChange('insurance_company', val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSURERS.map(ins => (
                    <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Claim Category</Label>
              <Select value={formData.claim_type} onValueChange={(val) => handleChange('claim_type', val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_TYPES.map(ct => (
                    <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Incident Date & Claim Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Incident Date</Label>
              <Input 
                type="date"
                value={formData.incident_date}
                onChange={(e) => handleChange('incident_date', e.target.value)}
                className="bg-background font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Claim Filing Date</Label>
              <Input 
                type="date"
                value={formData.claim_date}
                onChange={(e) => handleChange('claim_date', e.target.value)}
                className="bg-background font-mono"
                required
              />
            </div>
          </div>

          {/* Driver & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Driver Name</Label>
              <Input 
                value={formData.driver_name}
                onChange={(e) => handleChange('driver_name', e.target.value)}
                placeholder="Driver driving during incident..."
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs text-foreground">Incident Location</Label>
              <Input 
                value={formData.incident_location}
                onChange={(e) => handleChange('incident_location', e.target.value)}
                placeholder="e.g. NH-44 Toll Plaza, Nagpur Highway"
                className="bg-background"
              />
            </div>
          </div>

          {/* Status & Financial Breakdown */}
          <div className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-extrabold text-sm text-primary">Claim Status & Settlement Amounts</Label>
              <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                <SelectTrigger className="w-[180px] bg-background font-bold text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">🟡 Pending Review</SelectItem>
                  <SelectItem value="Approved">🔵 Approved by Insurer</SelectItem>
                  <SelectItem value="Settled">🟢 Settled & Received</SelectItem>
                  <SelectItem value="Rejected">🔴 Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Claimed Amount (₹) *</Label>
                <Input 
                  type="number"
                  min="0"
                  step="100"
                  value={formData.claimed_amount}
                  onChange={(e) => handleChange('claimed_amount', e.target.value)}
                  placeholder="₹ Total Claimed"
                  className="bg-background font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-blue-400">Approved Amount (₹)</Label>
                <Input 
                  type="number"
                  min="0"
                  step="100"
                  value={formData.approved_amount}
                  onChange={(e) => handleChange('approved_amount', e.target.value)}
                  placeholder="₹ Approved"
                  className="bg-background font-mono font-bold text-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-emerald-400">Amount Received (₹)</Label>
                <Input 
                  type="number"
                  min="0"
                  step="100"
                  value={formData.amount_received}
                  onChange={(e) => handleChange('amount_received', e.target.value)}
                  placeholder="₹ Settled in Bank"
                  className="bg-background font-mono font-bold text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Accident Photos & Image Uploads */}
          <div className="space-y-3 p-4 bg-muted/15 rounded-xl border border-border/40">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" /> Accident Photos & Claim Documents ({formData.images.length})
              </Label>
              <label className="cursor-pointer">
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs rounded-lg border-primary/40 text-primary" disabled={uploadingImage}>
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                  Upload File/Photo
                </Button>
              </label>
            </div>

            {/* Uploaded Thumbnails */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-border/60 aspect-video bg-black/40">
                    <img src={imgUrl} alt={`Claim evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Or add Image URL manually */}
            <div className="flex items-center gap-2 pt-1">
              <Input 
                placeholder="Or paste direct image/document URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="bg-background text-xs"
              />
              <Button type="button" variant="ghost" size="sm" onClick={handleAddImageUrl} className="h-9 px-3 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="font-semibold text-xs text-foreground">Notes & Claim Details</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Describe damage, surveyor name, FIR number, repair garage details..."
              className="bg-background min-h-[70px] text-xs"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl shadow-md font-bold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {claimToEdit ? 'Save Changes' : 'Submit Claim'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
