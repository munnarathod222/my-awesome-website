import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Building2, Phone, Mail, MapPin, FileText, Camera, CheckCircle2, User, Globe, ShieldCheck, Sparkles, RefreshCw, Save } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import BusinessCardExtractor from '@/components/BusinessCardExtractor.jsx';

const CONTACT_TYPES = [
  'Client', 'Corporate', 'Vendor', 'Driver', 'Employee',
  'Mechanic', 'Electrician', 'Puncture Shop', 'Showroom', 
  'Spare Parts', 'Bodywork / Welding', 'Crane / Tow Truck',
  'Hydraulics', 'Plastics', 'Washing Centre', 'RTO Agent', 
  'Banking', 'Loan Agent', 'Warehouse', 'Other'
];

export default function BusinessCardUploadModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('upload'); // 'upload' | 'form'
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    designation: '',
    contact_type: 'Client',
    phone_number: '',
    alternate_phone: '',
    email: '',
    website: '',
    gstin: '',
    physical_address: '',
    notes: '',
    card_file: null,
    preview_url: ''
  });

  const handleExtractionComplete = (data, fileObj, previewUrl) => {
    setFormData({
      company_name: data.company_name || data.contact_person || '',
      contact_person: data.contact_person || '',
      designation: data.designation || '',
      contact_type: CONTACT_TYPES.includes(data.contact_type) ? data.contact_type : 'Client',
      phone_number: data.phone_number || '',
      alternate_phone: data.alternate_phone || '',
      email: data.email || '',
      website: data.website || '',
      gstin: data.gstin || '',
      physical_address: data.physical_address || '',
      notes: data.notes || '',
      card_file: fileObj,
      preview_url: previewUrl || ''
    });
    setStep('form');
    toast.success('Visiting card extracted accurately! Please review & save.');
  };

  const handleExtractionError = (errorMsg) => {
    toast.error(errorMsg);
    setStep('upload');
  };

  const handleReset = () => {
    setStep('upload');
    setFormData({
      company_name: '', contact_person: '', designation: '', contact_type: 'Client',
      phone_number: '', alternate_phone: '', email: '', website: '', gstin: '',
      physical_address: '', notes: '', card_file: null, preview_url: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim() && !formData.contact_person.trim()) {
      toast.error('Company Name or Contact Person is required');
      return;
    }

    setLoading(true);
    try {
      let cardImageUrl = '';

      // Upload visiting card image file to PocketBase truck_documents storage if present
      if (formData.card_file) {
        try {
          const fileData = new FormData();
          fileData.append('file', formData.card_file);
          fileData.append('truck_id', 'VISITING_CARD');
          fileData.append('document_type', 'Other');
          fileData.append('document_name', `Visiting Card - ${formData.company_name || formData.contact_person}`);
          fileData.append('notes', `Visiting card image for ${formData.company_name}`);

          const uploadedRec = await pb.collection('truck_documents').create(fileData, { $autoCancel: false });
          cardImageUrl = pb.files.getUrl(uploadedRec, uploadedRec.file);
        } catch (uploadErr) {
          console.warn('Card image upload warning:', uploadErr);
        }
      }

      const payload = {
        contact_type: formData.contact_type,
        company_name: formData.company_name.trim(),
        contact_person: formData.contact_person.trim(),
        designation: formData.designation.trim(),
        phone_number: formData.phone_number.trim(),
        alternate_phone: formData.alternate_phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        gstin: formData.gstin.trim(),
        physical_address: formData.physical_address.trim(),
        notes: formData.notes.trim(),
        card_image_url: cardImageUrl || formData.preview_url || '',
        created_by: currentUser?.id || ''
      };

      await pb.collection('contacts').create(payload, { $autoCancel: false });
      toast.success(`Contact "${payload.company_name || payload.contact_person}" saved from Visiting Card!`);
      
      if (onSuccess) onSuccess();
      handleReset();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !loading) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {step === 'upload' ? 'Scan Visiting / Business Card' : 'Extracted Contact Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="py-4">
            <BusinessCardExtractor
              onExtractionComplete={handleExtractionComplete}
              onError={handleExtractionError}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            {/* Split layout: Image Preview on top/side + Extracted Fields */}
            {formData.preview_url && (
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="w-24 h-16 rounded-lg overflow-hidden border border-border bg-black/40 flex-shrink-0">
                  <img src={formData.preview_url} alt="Card preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold mb-1">
                    ✨ AI Extraction Verified
                  </Badge>
                  <p className="text-xs text-muted-foreground">Review and edit any field before saving into your Contacts database.</p>
                </div>
              </div>
            )}

            {/* Company Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Company / Firm Name *
                </Label>
                <Input 
                  value={formData.company_name}
                  onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))}
                  placeholder="e.g. Jai Bhavani Logistics Pvt Ltd"
                  className="bg-background font-bold text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground">Contact Category</Label>
                <Select value={formData.contact_type} onValueChange={(val) => setFormData(p => ({ ...p, contact_type: val }))}>
                  <SelectTrigger className="bg-background font-semibold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map(ct => (
                      <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Person & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" /> Contact Person Name
                </Label>
                <Input 
                  value={formData.contact_person}
                  onChange={(e) => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                  placeholder="e.g. Rajesh Sharma"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground">Designation / Title</Label>
                <Input 
                  value={formData.designation}
                  onChange={(e) => setFormData(p => ({ ...p, designation: e.target.value }))}
                  placeholder="e.g. Managing Director / Partner"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Mobile Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Primary Mobile / Phone *
                </Label>
                <Input 
                  value={formData.phone_number}
                  onChange={(e) => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="bg-background font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> Alternate / WhatsApp No.
                </Label>
                <Input 
                  value={formData.alternate_phone}
                  onChange={(e) => setFormData(p => ({ ...p, alternate_phone: e.target.value }))}
                  placeholder="Secondary mobile or WhatsApp..."
                  className="bg-background font-mono"
                />
              </div>
            </div>

            {/* Email, Website, GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
                </Label>
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="info@company.com"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Website URL
                </Label>
                <Input 
                  value={formData.website}
                  onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  placeholder="www.company.com"
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> GSTIN No.
                </Label>
                <Input 
                  value={formData.gstin}
                  onChange={(e) => setFormData(p => ({ ...p, gstin: e.target.value }))}
                  placeholder="36AAAAA0000A1Z5"
                  className="bg-background font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Office / Factory Address
              </Label>
              <Input 
                value={formData.physical_address}
                onChange={(e) => setFormData(p => ({ ...p, physical_address: e.target.value }))}
                placeholder="Street address, landmark, city, state, pincode..."
                className="bg-background text-xs"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-foreground">Notes & Extra Card Information</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Services offered, branch locations, bank details listed on card..."
                className="bg-background min-h-[60px] text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button type="button" variant="outline" onClick={handleReset} className="rounded-xl text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Rescan Card
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl shadow-md font-bold text-xs">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save to Contacts
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}