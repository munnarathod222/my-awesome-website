import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function QuickAddContact({ onSuccess, triggerVariant = "outline", triggerClassName = "" }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_type: 'Client',
    company_name: '',
    phone_number: '',
    gstin: 'URD', // Default for quick add
    physical_address: 'TBD' // Default for quick add
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.phone_number) {
      toast.error('Name and Phone are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        created_by: currentUser.id
      };
      
      const record = await pb.collection('contacts').create(payload, { $autoCancel: false });
      toast.success('Contact added quickly');
      setIsOpen(false);
      setFormData({ contact_type: 'Client', company_name: '', phone_number: '', gstin: 'URD', physical_address: 'TBD' });
      if (onSuccess) onSuccess(record);
    } catch (err) {
      console.error('Quick add failed:', err);
      toast.error('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" className={triggerClassName}>
          <UserPlus className="w-4 h-4 mr-2" /> Quick Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Quick Add Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.contact_type} onValueChange={(v) => setFormData({...formData, contact_type: v})}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name / Company *</Label>
            <Input 
              value={formData.company_name} 
              onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
              placeholder="Enter name"
              className="bg-background"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input 
              value={formData.phone_number} 
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
              placeholder="Phone number"
              className="bg-background"
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Contact
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}