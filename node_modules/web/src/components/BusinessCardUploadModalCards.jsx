import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CreditCard, Landmark, Hash, Calendar } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import BusinessCardExtractor from '@/components/BusinessCardExtractor.jsx';

export default function BusinessCardUploadModalCards({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('upload'); // 'upload' | 'form'
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    card_name: '',
    bank_name: '',
    card_number_last4: '',
    card_type: 'Credit',
    billing_cycle_start: '1',
    billing_cycle_end: '30',
    credit_limit: '',
    status: 'Active'
  });

  const handleExtractionComplete = (data) => {
    // Map business card fields to credit card fields creatively as requested
    setFormData({
      card_name: data.name || '',
      bank_name: data.company || '',
      card_number_last4: '', // Leave blank, AI can't reliably guess this from standard biz cards
      card_type: 'Credit',
      billing_cycle_start: '1',
      billing_cycle_end: '30',
      credit_limit: '',
      status: 'Active'
    });
    setStep('form');
    toast.success('Extraction complete! Please verify and fill remaining card details.');
  };

  const handleExtractionError = (errorMsg) => {
    toast.error(errorMsg);
    setStep('upload');
  };

  const handleReset = () => {
    setStep('upload');
    setFormData({
      card_name: '', bank_name: '', card_number_last4: '', card_type: 'Credit',
      billing_cycle_start: '1', billing_cycle_end: '30', credit_limit: '', status: 'Active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.card_number_last4 || formData.card_number_last4.length !== 4) {
      toast.error('Please enter exactly 4 digits for the card number');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        billing_cycle_start: parseInt(formData.billing_cycle_start) || 1,
        billing_cycle_end: parseInt(formData.billing_cycle_end) || 30,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        user_id: currentUser.id
      };

      await pb.collection('credit_cards').create(payload, { $autoCancel: false });
      toast.success('Credit Card created successfully');
      if (onSuccess) onSuccess();
      
      handleReset();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save card');
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
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'upload' ? 'Upload Bank/Card Details' : 'Verify Card Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' 
              ? 'Upload a bank representative card or document to extract bank and name details.'
              : 'Review extracted details and provide the required card numbers.'}
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
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Card Name / Alias *</Label>
                <Input 
                  required
                  value={formData.card_name}
                  onChange={(e) => setFormData({...formData, card_name: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Bank Name *</Label>
                <Input 
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Last 4 Digits *</Label>
                <Input 
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  value={formData.card_number_last4}
                  onChange={(e) => setFormData({...formData, card_number_last4: e.target.value.replace(/\D/g, '')})}
                  className="bg-background font-mono"
                  placeholder="1234"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Card Type *</Label>
                <Select value={formData.card_type} onValueChange={(val) => setFormData({...formData, card_type: val})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">Credit Card</SelectItem>
                    <SelectItem value="Debit">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Billing Start Day</Label>
                <Input 
                  type="number" required min="1" max="31"
                  value={formData.billing_cycle_start}
                  onChange={(e) => setFormData({...formData, billing_cycle_start: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Billing End Day</Label>
                <Input 
                  type="number" required min="1" max="31"
                  value={formData.billing_cycle_end}
                  onChange={(e) => setFormData({...formData, billing_cycle_end: e.target.value})}
                  className="bg-background"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Retry Upload
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Card
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}