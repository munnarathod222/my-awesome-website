import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveCrmCustomer } from '@/lib/transportCrmClient.js';

export default function TransportCrmNewCustomerModal({ isOpen, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    customer_code: '',
    industry: 'Manufacturing & Industrial',
    gstin: '',
    pan: '',
    primary_contact: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    credit_limit: '25000000',
    risk_level: 'Excellent',
    status: 'Active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      toast.error('Company Name is required');
      return;
    }

    setLoading(true);
    try {
      await saveCrmCustomer(formData);
      toast.success(`Customer ${formData.company_name} registered successfully!`);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl rounded-3xl p-6 font-sans">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Onboard Enterprise Logistics Client
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Add a new enterprise shipper account for freight operations, billing, and credit management.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Company / Shipper Name *</Label>
            <Input 
              value={formData.company_name}
              onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
              placeholder="e.g. Tata Steel Supply Chain Ltd"
              className="rounded-xl h-9"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Industry Sector</Label>
              <Select value={formData.industry} onValueChange={v => setFormData(p => ({ ...p, industry: v }))}>
                <SelectTrigger className="rounded-xl h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manufacturing & Industrial">Manufacturing & Industrial</SelectItem>
                  <SelectItem value="Chemicals & Polymers">Chemicals & Polymers</SelectItem>
                  <SelectItem value="Metals & Mining">Metals & Mining</SelectItem>
                  <SelectItem value="FMCG & Cold Chain">FMCG & Cold Chain</SelectItem>
                  <SelectItem value="E-Commerce & Retail">E-Commerce & Retail</SelectItem>
                  <SelectItem value="Automotive & Spare Parts">Automotive & Spare Parts</SelectItem>
                  <SelectItem value="Pharmaceuticals">Pharmaceuticals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">GSTIN Number</Label>
              <Input 
                value={formData.gstin}
                onChange={e => setFormData(p => ({ ...p, gstin: e.target.value }))}
                placeholder="27AABCR6158R1Z2"
                className="rounded-xl h-9 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Primary Contact Person</Label>
              <Input 
                value={formData.primary_contact}
                onChange={e => setFormData(p => ({ ...p, primary_contact: e.target.value }))}
                placeholder="Name"
                className="rounded-xl h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Contact Mobile Phone</Label>
              <Input 
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98490 12345"
                className="rounded-xl h-9 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Credit Limit (₹)</Label>
              <Input 
                type="number"
                value={formData.credit_limit}
                onChange={e => setFormData(p => ({ ...p, credit_limit: e.target.value }))}
                className="rounded-xl h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Initial Risk Level</Label>
              <Select value={formData.risk_level} onValueChange={v => setFormData(p => ({ ...p, risk_level: v }))}>
                <SelectTrigger className="rounded-xl h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">🟢 Excellent (30 Days)</SelectItem>
                  <SelectItem value="Average">🟡 Average (Medium Risk)</SelectItem>
                  <SelectItem value="High Risk">🔴 High Risk Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
              {loading ? 'Saving...' : 'Register Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
