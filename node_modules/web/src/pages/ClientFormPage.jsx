import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';

export default function ClientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    client_name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    client_type: 'Company',
    industry: '',
    contact_person: '',
    gst_number: '',
    pan_number: '',
    bank_account: '',
    ifsc_code: '',
    credit_limit: '',
    payment_terms: '',
    billing_type: 'Spot',
    status: 'Active',
    notes: '',
    requires_pod: false,
    isTdsApplicable: false,
    tdsRate: '2.00'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchClient = async () => {
        try {
          const client = await pb.collection('clients').getOne(id, { $autoCancel: false });
          setFormData({
            client_name: client.client_name || '',
            email: client.email || '',
            phone: client.phone || '',
            company_name: client.company_name || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            postal_code: client.postal_code || '',
            country: client.country || 'India',
            client_type: client.client_type || 'Company',
            industry: client.industry || '',
            contact_person: client.contact_person || '',
            gst_number: client.gst_number || '',
            pan_number: client.pan_number || '',
            bank_account: client.bank_account || '',
            ifsc_code: client.ifsc_code || '',
            credit_limit: client.credit_limit?.toString() || '',
            payment_terms: client.payment_terms || '',
            billing_type: client.billing_type || 'Spot',
            status: client.status || 'Active',
            notes: client.notes || '',
            requires_pod: client.requires_pod || false,
            isTdsApplicable: client.isTdsApplicable || false,
            tdsRate: client.tdsRate?.toString() || '2.00'
          });
        } catch (err) {
          console.error("Failed to load client", err);
          toast.error("Could not load client details");
          navigate('/clients');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchClient();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name) return toast.error('Client Name is required');
    if (!formData.email) return toast.error('Email is required');
    if (!formData.phone) return toast.error('Phone is required');

    setLoading(true);
    try {
      // Data preparation
      const dataToSave = {
        ...formData,
        credit_limit: Number(formData.credit_limit) || 0,
        tdsRate: formData.isTdsApplicable ? (Number(formData.tdsRate) || 0) : 0,
      };

      if (isEdit) {
        await pb.collection('clients').update(id, dataToSave, { $autoCancel: false });
        toast.success('Client updated successfully');
        navigate(`/client/${id}`);
      } else {
        const res = await pb.collection('clients').create(dataToSave, { $autoCancel: false });
        toast.success('Client created successfully');
        navigate(`/client/${res.id}`);
      }
    } catch (err) {
      console.error('Error saving client:', err);
      // Clean up common PB error formats
      const errObj = err.response?.data;
      if (errObj?.email?.code === 'validation_not_unique') {
        toast.error('Email already exists for another client.');
      } else if (errObj?.client_name?.code === 'validation_not_unique') {
        toast.error('Client name already exists.');
      } else {
        toast.error(err.message || 'Failed to save client');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 w-full py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading client data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Helmet>
        <title>{isEdit ? 'Edit Client' : 'Add New Client'} | Dashboard</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{isEdit ? 'Edit Client Profile' : 'Add New Client'}</h1>
            <p className="text-muted-foreground text-sm">Fill in the necessary details to manage this client account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name <span className="text-destructive">*</span></Label>
                  <Input id="client_name" name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Full name or display name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company / Legal Name</Label>
                  <Input id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Registered company name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="billing@client.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_type">Client Type</Label>
                  <Select value={formData.client_type} onValueChange={(val) => handleSelectChange('client_type', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="Retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Retail, Manufacturing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-lg">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Street, Building, Area" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">PIN/Postal Code</Label>
                  <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-lg">Financial & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input id="gst_number" name="gst_number" value={formData.gst_number} onChange={handleChange} maxLength={15} className="uppercase" placeholder="15-digit GSTIN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input id="pan_number" name="pan_number" value={formData.pan_number} onChange={handleChange} maxLength={10} className="uppercase" placeholder="10-digit PAN" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_account">Bank Account Number</Label>
                  <Input id="bank_account" name="bank_account" value={formData.bank_account} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc_code">IFSC Code</Label>
                  <Input id="ifsc_code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                  <Input type="number" id="credit_limit" name="credit_limit" value={formData.credit_limit} onChange={handleChange} min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Input id="payment_terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} placeholder="e.g. Net 30, Advance" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_type">Billing Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.billing_type} onValueChange={(val) => handleSelectChange('billing_type', val)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spot">Spot</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="requires_pod"
                  name="requires_pod"
                  checked={formData.requires_pod}
                  onChange={(e) => setFormData(prev => ({ ...prev, requires_pod: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="requires_pod" className="text-sm font-medium leading-none cursor-pointer">
                  Requires Proof of Delivery (POD)
                </Label>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTdsApplicable"
                    name="isTdsApplicable"
                    checked={formData.isTdsApplicable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isTdsApplicable: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isTdsApplicable" className="text-sm font-medium leading-none cursor-pointer">
                    Applies TDS Deduction
                  </Label>
                </div>
                {formData.isTdsApplicable && (
                  <div className="space-y-2 w-full md:w-[200px]">
                    <Label htmlFor="tdsRate">TDS Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      id="tdsRate"
                      name="tdsRate"
                      value={formData.tdsRate}
                      onChange={handleChange}
                      placeholder="2.00"
                      required={formData.isTdsApplicable}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} placeholder="Internal notes, specific client requirements..." />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shadow-md z-10">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-client-primary text-client-primary-foreground hover:bg-client-primary/90">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}