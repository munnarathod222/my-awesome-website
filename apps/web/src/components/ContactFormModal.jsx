import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function ContactFormModal({ isOpen, onClose, contact, onSuccess }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mainCategory, setMainCategory] = useState('Client');
  const [subCategory, setSubCategory] = useState('');
  const [formData, setFormData] = useState({
    contact_type: 'Client',
    company_name: '',
    phone_number: '',
    physical_address: '',
    gstin: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      const type = contact?.contact_type || 'Client';
      let mainCat = 'Client';
      let subCat = '';

      if (type === 'Driver' || type === 'Employee') {
        mainCat = 'Employee';
        subCat = type;
      } else if (type === 'Mechanic' || type === 'Showroom' || type === 'Spare Parts') {
        mainCat = 'Maintenance';
        subCat = type;
      } else if (type === 'Vendor') {
        mainCat = 'Vendor';
      }

      setMainCategory(mainCat);
      setSubCategory(subCat);

      if (contact) {
        setFormData({
          contact_type: type,
          company_name: contact.company_name || '',
          phone_number: contact.phone_number || '',
          physical_address: contact.physical_address || '',
          gstin: contact.gstin || '',
          email: contact.email || '',
          notes: contact.notes || ''
        });
      } else {
        setFormData({
          contact_type: 'Client',
          company_name: '',
          phone_number: '',
          physical_address: '',
          gstin: '',
          email: '',
          notes: ''
        });
      }
    }
  }, [isOpen, contact]);

  const handleMainCategoryChange = (val) => {
    setMainCategory(val);
    if (val === 'Client') {
      setSubCategory('');
      setFormData(prev => ({ ...prev, contact_type: 'Client' }));
    } else if (val === 'Vendor') {
      setSubCategory('');
      setFormData(prev => ({ ...prev, contact_type: 'Vendor' }));
    } else if (val === 'Employee') {
      setSubCategory('Driver');
      setFormData(prev => ({ ...prev, contact_type: 'Driver' }));
    } else if (val === 'Maintenance') {
      setSubCategory('Mechanic');
      setFormData(prev => ({ ...prev, contact_type: 'Mechanic' }));
    }
  };

  const handleSubCategoryChange = (val) => {
    setSubCategory(val);
    setFormData(prev => ({ ...prev, contact_type: val }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) return 'Company/Full name is required';
    if (!formData.phone_number.trim()) return 'Phone number is required';
    if (!formData.physical_address.trim()) return 'Physical address is required';
    
    // GSTIN is only required for Clients and Vendors
    const isGstinRequired = formData.contact_type === 'Client' || formData.contact_type === 'Vendor';
    if (isGstinRequired && !formData.gstin.trim()) {
      return 'GSTIN is required for clients and vendors';
    }
    
    if (formData.gstin.trim()) {
      const gstinRegex = /^[0-9A-Z]{15}$/;
      if (!gstinRegex.test(formData.gstin.toUpperCase())) {
        return 'GSTIN must be 15 alphanumeric characters';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email format';
    }

    return null;
  };

  const checkDuplicates = async () => {
    try {
      let filter = `phone_number="${formData.phone_number}"`;
      if (formData.gstin.trim()) {
        filter = `(phone_number="${formData.phone_number}" || gstin="${formData.gstin.toUpperCase()}")`;
      }
      const existing = await pb.collection('contacts').getFirstListItem(filter, { $autoCancel: false });
      
      if (existing && (!contact || existing.id !== contact.id)) {
        if (existing.phone_number === formData.phone_number) return 'A contact with this phone number already exists.';
        if (formData.gstin.trim() && existing.gstin === formData.gstin.toUpperCase()) return 'A contact with this GSTIN already exists.';
      }
      return null;
    } catch (err) {
      // 404 means no duplicate found, which is good
      if (err.status === 404) return null;
      console.error('Duplicate check error:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    
    const duplicateError = await checkDuplicates();
    if (duplicateError) {
      toast.error(duplicateError);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        gstin: formData.gstin.toUpperCase(),
        created_by: currentUser.id
      };

      if (contact) {
        await pb.collection('contacts').update(contact.id, payload, { $autoCancel: false });
        toast.success('Contact updated successfully');
      } else {
        await pb.collection('contacts').create(payload, { $autoCancel: false });
        toast.success('Contact created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save contact:', err);
      toast.error(err.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Category *</Label>
              <Select value={mainCategory} onValueChange={handleMainCategoryChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Employee">Drivers & Employees</SelectItem>
                  <SelectItem value="Maintenance">Maintenance Network</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditionally show Sub-category */}
            {(mainCategory === 'Employee' || mainCategory === 'Maintenance') && (
              <div className="space-y-2 col-span-2 sm:col-span-1 animate-in fade-in duration-200">
                <Label>Sub-Category *</Label>
                <Select value={subCategory} onValueChange={handleSubCategoryChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategory === 'Employee' ? (
                      <>
                        <SelectItem value="Driver">Driver</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Mechanic">Mechanic</SelectItem>
                        <SelectItem value="Showroom">Showroom / Service Centre</SelectItem>
                        <SelectItem value="Spare Parts">Spare Parts Shop</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>GSTIN {(mainCategory === 'Client' || mainCategory === 'Vendor') ? '*' : '(Optional)'}</Label>
              <Input 
                value={formData.gstin} 
                onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})} 
                placeholder="15 chars alphanumeric"
                className="bg-background uppercase"
                maxLength={15}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Company / Full Name *</Label>
              <Input 
                value={formData.company_name} 
                onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                placeholder="Enter name"
                className="bg-background"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Phone Number *</Label>
              <Input 
                value={formData.phone_number} 
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                placeholder="e.g. 9876543210"
                className="bg-background"
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="Optional"
                className="bg-background"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Physical Address *</Label>
              <Textarea 
                value={formData.physical_address} 
                onChange={(e) => setFormData({...formData, physical_address: e.target.value})} 
                placeholder="Full address"
                className="bg-background resize-none h-20"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Input 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                placeholder="Optional notes"
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {contact ? 'Update Contact' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}