import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Building2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import BusinessCardExtractor from '@/components/BusinessCardExtractor.jsx';

export default function BusinessCardUploadModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('upload'); // 'upload' | 'form'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    phone_number: '',
    email: '',
    physical_address: '',
    notes: ''
  });

  const handleExtractionComplete = (data) => {
    // Map extracted fields to the simplified contact form fields
    const mappedNotes = [
      data.name ? `Contact: ${data.name}` : '',
      data.job_title ? `Title: ${data.job_title}` : '',
      data.website ? `Website: ${data.website}` : ''
    ].filter(Boolean).join('\n');

    setFormData({
      company_name: data.company || data.name || '',
      phone_number: data.phone || '',
      email: data.email || '',
      physical_address: data.address || '',
      notes: mappedNotes
    });
    setStep('form');
    toast.success('Extraction complete! Please verify the details.');
  };

  const handleExtractionError = (errorMsg) => {
    toast.error(errorMsg);
    setStep('upload');
  };

  const handleReset = () => {
    setStep('upload');
    setFormData({
      company_name: '', phone_number: '', email: '', physical_address: '', notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      toast.error('Company Name / Contact Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        contact_type: 'Client', // Default mapping
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        physical_address: formData.physical_address,
        email: formData.email,
        notes: formData.notes,
        created_by: currentUser.id
      };

      await pb.collection('contacts').create(payload, { $autoCancel: false });
      toast.success('Contact created successfully from business card');
      if (onSuccess) onSuccess();
      
      // Reset and close
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
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'upload' ? 'Upload Business Card' : 'Verify Contact Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' 
              ? 'Our AI will automatically extract the contact information from the image.'
              : 'Review and edit the extracted details before saving to your contacts.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="py-4">
            <BusinessCardExtractor 
              onExtractionComplete={handleExtractionComplete}
              onError={handleExtractionError}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4 animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company / Contact Name *</Label>
                <Input 
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</Label>
                <Input 
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Physical Address</Label>
                <Textarea 
                  value={formData.physical_address}
                  onChange={(e) => setFormData({...formData, physical_address: e.target.value})}
                  className="bg-background resize-none"
                  rows={2}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Notes</Label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-background resize-none"
                  rows={3}
                  placeholder="Additional details, website, job title, etc."
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Retry Upload
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Contact
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}