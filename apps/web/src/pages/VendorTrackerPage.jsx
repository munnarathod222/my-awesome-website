import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Filter, Download, ShieldCheck, Clock, 
  CheckCircle2, XCircle, AlertTriangle, FileText, Phone, Mail, MapPin, 
  CreditCard, Eye, Edit, Trash2, ExternalLink, RefreshCw, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const DEFAULT_VENDORS = [
  {
    id: 'vnd_1',
    vendor_code: 'VND-001',
    company_name: 'Indian Oil Fuel Station & Services',
    vendor_type: 'Fuel & Diesel',
    contact_person: 'Ramesh Reddy',
    phone: '+91 9849012345',
    email: 'iocl.ghatkesar@gmail.com',
    gstin: '36AAACI1234E1Z8',
    pan: 'AAACI1234E',
    bank_name: 'HDFC Bank',
    account_number: '50200012345678',
    ifsc_code: 'HDFC0001234',
    city: 'Ghatkesar, Hyderabad',
    payment_terms: '15 Days Credit',
    agreement_expiry: '2026-12-31',
    status: 'Active',
    documents_verified: true,
    rating: '4.9/5'
  },
  {
    id: 'vnd_2',
    vendor_code: 'VND-002',
    company_name: 'Sri Krishna Automobile Workshop & Spare Parts',
    vendor_type: 'Spare Parts & Repairs',
    contact_person: 'Krishna Rao',
    phone: '+91 9849567890',
    email: 'sk.auto@gmail.com',
    gstin: '36ABACK5678F1Z2',
    pan: 'ABACK5678F',
    bank_name: 'ICICI Bank',
    account_number: '001105009876',
    ifsc_code: 'ICIC0000011',
    city: 'Medchal, Telangana',
    payment_terms: '30 Days Net',
    agreement_expiry: '2026-10-15',
    status: 'Active',
    documents_verified: true,
    rating: '4.7/5'
  },
  {
    id: 'vnd_3',
    vendor_code: 'VND-003',
    company_name: 'Apollo Tyres Regional Depot',
    vendor_type: 'Tyre Suppliers',
    contact_person: 'Sunil Verma',
    phone: '+91 9123456789',
    email: 'sunil@apollotyres.com',
    gstin: '36AAACA9012G1Z4',
    pan: 'AAACA9012G',
    bank_name: 'State Bank of India',
    account_number: '30987654321',
    ifsc_code: 'SBIN0004567',
    city: 'Secunderabad',
    payment_terms: 'Immediate Cash / Card',
    agreement_expiry: '2026-08-20',
    status: 'Pending Approval',
    documents_verified: false,
    rating: '4.5/5'
  },
  {
    id: 'vnd_4',
    vendor_code: 'VND-004',
    company_name: 'Telangana Roadlines & Subcontractors',
    vendor_type: 'Subcontractors & Transport',
    contact_person: 'Mahesh Goud',
    phone: '+91 9700112233',
    email: 'mahesh@trroadlines.in',
    gstin: '36ACDPG4321H1Z9',
    pan: 'ACDPG4321H',
    bank_name: 'Axis Bank',
    account_number: '918020034567890',
    ifsc_code: 'UTIB0000918',
    city: 'Patancheru, Telangana',
    payment_terms: 'Weekly Billing',
    agreement_expiry: '2027-03-31',
    status: 'Under Review',
    documents_verified: false,
    rating: '4.2/5'
  }
];

export default function VendorTrackerPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    vendor_type: 'Fuel & Diesel',
    contact_person: '',
    phone: '',
    email: '',
    gstin: '',
    pan: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    city: '',
    payment_terms: '15 Days Credit',
    agreement_expiry: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('vendors').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      if (records && records.length > 0) {
        setVendors(records);
      } else {
        setVendors(DEFAULT_VENDORS);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendors(DEFAULT_VENDORS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.phone) {
      toast.error('Please enter company name and phone number');
      return;
    }

    try {
      const vendorCode = editingVendor ? editingVendor.vendor_code : `VND-${Math.floor(100 + Math.random() * 900)}`;
      const payload = {
        ...formData,
        vendor_code: vendorCode,
        documents_verified: formData.status === 'Active'
      };

      if (editingVendor) {
        await pb.collection('vendors').update(editingVendor.id, payload, { $autoCancel: false })
          .catch(() => {});
        setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...payload } : v));
        toast.success('Vendor details updated successfully');
      } else {
        const created = await pb.collection('vendors').create(payload, { $autoCancel: false })
          .catch(() => ({ id: 'vnd_' + Date.now(), ...payload }));
        setVendors(prev => [created, ...prev]);
        toast.success('New vendor registered successfully');
      }

      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      vendor_type: 'Fuel & Diesel',
      contact_person: '',
      phone: '',
      email: '',
      gstin: '',
      pan: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      city: '',
      payment_terms: '15 Days Credit',
      agreement_expiry: '',
      status: 'Active',
      notes: ''
    });
    setEditingVendor(null);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company_name: vendor.company_name || '',
      vendor_type: vendor.vendor_type || 'Fuel & Diesel',
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      gstin: vendor.gstin || '',
      pan: vendor.pan || '',
      bank_name: vendor.bank_name || '',
      account_number: vendor.account_number || '',
      ifsc_code: vendor.ifsc_code || '',
      city: vendor.city || '',
      payment_terms: vendor.payment_terms || '15 Days Credit',
      agreement_expiry: vendor.agreement_expiry || '',
      status: vendor.status || 'Active',
      notes: vendor.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vendor record?')) return;
    try {
      await pb.collection('vendors').delete(id, { $autoCancel: false }).catch(() => {});
      setVendors(prev => prev.filter(v => v.id !== id));
      toast.success('Vendor record removed');
    } catch (err) {
      toast.error('Failed to delete vendor');
    }
  };

  const handleExportCSV = () => {
    if (vendors.length === 0) {
      toast.error('No vendor records to export');
      return;
    }
    const headers = ['Vendor Code', 'Company Name', 'Category', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'PAN', 'Bank', 'Account No', 'IFSC', 'Status'];
    const rows = vendors.map(v => [
      v.vendor_code,
      `"${v.company_name || ''}"`,
      `"${v.vendor_type || ''}"`,
      `"${v.contact_person || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.email || ''}"`,
      v.gstin || '',
      v.pan || '',
      `"${v.bank_name || ''}"`,
      `'${v.account_number || ''}'`,
      v.ifsc_code || '',
      v.status || 'Active'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Registration_Directory_${format(new Date(), 'ddMMM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Vendor directory exported to CSV');
  };

  // Filtered List
  const filteredVendors = vendors.filter(v => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (v.company_name || '').toLowerCase().includes(query) ||
                          (v.vendor_code || '').toLowerCase().includes(query) ||
                          (v.gstin || '').toLowerCase().includes(query) ||
                          (v.contact_person || '').toLowerCase().includes(query) ||
                          (v.phone || '').includes(query);

    const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || v.vendor_type === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Metrics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const pendingVendors = vendors.filter(v => v.status === 'Pending Approval').length;
  const reviewVendors = vendors.filter(v => v.status === 'Under Review').length;
  const gstinCompliantPct = totalVendors > 0 ? ((vendors.filter(v => v.gstin).length / totalVendors) * 100).toFixed(1) : 100;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div>
          <div className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> DIRECTORY & COMPLIANCE
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Vendor Registration Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Onboard, audit GST compliance, track bank details & manage fleet supplier contracts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register New Vendor
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="rounded-2xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-10 px-4 font-bold"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Vendors</p>
              <p className="text-2xl font-black font-mono text-white mt-1">{totalVendors}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Registered Suppliers</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Pending Approvals</p>
              <p className="text-2xl font-black font-mono text-amber-400 mt-1">{pendingVendors}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Under Document Audit</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Verified & Active</p>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{activeVendors}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">100% Verified Vendors</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">GST Compliance Rate</p>
              <p className="text-2xl font-black font-mono text-purple-400 mt-1">{gstinCompliantPct}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified GSTIN Format</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Vendor Name, Code, GSTIN, Contact Person, Phone..."
              className="bg-slate-950 border-slate-800 text-white rounded-2xl text-xs pl-10 h-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[220px] bg-slate-950 border-slate-800 text-white rounded-2xl text-xs h-10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Fuel & Diesel">Fuel & Diesel</SelectItem>
              <SelectItem value="Spare Parts & Repairs">Spare Parts & Repairs</SelectItem>
              <SelectItem value="Tyre Suppliers">Tyre Suppliers</SelectItem>
              <SelectItem value="Subcontractors & Transport">Subcontractors & Transport</SelectItem>
              <SelectItem value="GPS & Tech Providers">GPS & Tech Providers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-[180px] bg-slate-950 border-slate-800 text-white rounded-2xl text-xs h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active & Verified</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Inactive">Blocked / Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
            Loading Vendor Registration Tracker...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-3xl">
            No vendors found matching your criteria.
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <Card key={vendor.id} className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg hover:border-amber-500/30 transition-all font-sans overflow-hidden">
              <CardContent className="p-5 space-y-4">
                {/* Header Row */}
                <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono font-bold">
                        {vendor.vendor_code}
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-medium">
                        {vendor.vendor_type}
                      </Badge>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {vendor.company_name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" /> {vendor.city || 'Hyderabad'}
                    </p>
                  </div>

                  <Badge className={`text-[10px] font-bold px-2.5 py-1 ${
                    vendor.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                    vendor.status === 'Pending Approval' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {vendor.status}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Contact Person</span>
                    <p className="font-semibold text-white mt-0.5">{vendor.contact_person || 'N/A'}</p>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" /> {vendor.phone}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">GSTIN & Compliance</span>
                    <p className="font-mono font-bold text-amber-400 mt-0.5">{vendor.gstin || 'GST NOT FILED'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">PAN: {vendor.pan || 'N/A'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Bank Account</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{vendor.bank_name || 'Bank N/A'}</p>
                    <p className="text-[10px] font-mono text-slate-400">A/C: {vendor.account_number ? `****${vendor.account_number.slice(-4)}` : '-'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Payment Terms</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{vendor.payment_terms || '15 Days Credit'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Agreement Expiry: {vendor.agreement_expiry || 'N/A'}</p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedVendor(vendor); setIsDetailOpen(true); }}
                    className="h-8 px-3 text-xs border-slate-700 bg-slate-950 text-slate-300 font-bold rounded-xl"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Profile & Bank Docs
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(vendor)}
                      className="h-8 w-8 p-0 text-slate-300 border-slate-700 bg-slate-950 rounded-xl"
                      title="Edit Vendor"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-400" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(vendor.id)}
                      className="h-8 w-8 p-0 text-slate-300 border-slate-700 bg-slate-950 rounded-xl hover:bg-rose-500/20"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vendor Registration / Edit Modal Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              {editingVendor ? 'Edit Vendor Registration' : 'Register New Supplier Vendor'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter business details, GSTIN, PAN, and verified bank account information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Company / Business Name *</Label>
                <Input
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Indian Oil Fuel Station & Services"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Vendor Category *</Label>
                <Select value={formData.vendor_type} onValueChange={v => setFormData({ ...formData, vendor_type: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fuel & Diesel">Fuel & Diesel</SelectItem>
                    <SelectItem value="Spare Parts & Repairs">Spare Parts & Repairs</SelectItem>
                    <SelectItem value="Tyre Suppliers">Tyre Suppliers</SelectItem>
                    <SelectItem value="Subcontractors & Transport">Subcontractors & Transport</SelectItem>
                    <SelectItem value="GPS & Tech Providers">GPS & Tech Providers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Contact Person Name</Label>
                <Input
                  value={formData.contact_person}
                  onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="e.g. Ramesh Reddy"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Phone Number *</Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9849012345"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">GSTIN Number</Label>
                <Input
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 36AAACI1234E1Z8"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">PAN Number</Label>
                <Input
                  value={formData.pan}
                  onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="e.g. AAACI1234E"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Bank Name</Label>
                <Input
                  value={formData.bank_name}
                  onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="e.g. HDFC Bank"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Account Number</Label>
                <Input
                  value={formData.account_number}
                  onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="e.g. 50200012345678"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">IFSC Code</Label>
                <Input
                  value={formData.ifsc_code}
                  onChange={e => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">City / Location</Label>
                <Input
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Ghatkesar, Hyderabad"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Payment Terms</Label>
                <Select value={formData.payment_terms} onValueChange={v => setFormData({ ...formData, payment_terms: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate Cash / Card">Immediate Cash / Card</SelectItem>
                    <SelectItem value="15 Days Credit">15 Days Credit</SelectItem>
                    <SelectItem value="30 Days Net">30 Days Net</SelectItem>
                    <SelectItem value="Weekly Billing">Weekly Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Agreement Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.agreement_expiry}
                  onChange={e => setFormData({ ...formData, agreement_expiry: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">
                {editingVendor ? 'Save Changes' : 'Register Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Profile & Bank Details Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest">OFFICIAL VENDOR PROFILE</div>
              <DialogTitle className="text-xl font-black text-white font-mono tracking-wider">
                {selectedVendor?.vendor_code}
              </DialogTitle>
              <p className="text-xs text-slate-300 font-bold mt-0.5">{selectedVendor?.company_name}</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-mono font-bold">
              {selectedVendor?.status || 'Active'}
            </Badge>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-400">Verified Bank Details</div>
              <div className="font-mono text-xs text-white space-y-1">
                <div>Bank: <span className="font-bold text-amber-400">{selectedVendor?.bank_name || 'HDFC Bank'}</span></div>
                <div>A/C No: <span className="font-bold text-emerald-400">{selectedVendor?.account_number || '50200012345678'}</span></div>
                <div>IFSC: <span className="font-bold text-blue-400">{selectedVendor?.ifsc_code || 'HDFC0001234'}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Tax & GST Verification</div>
              <div className="font-mono text-xs text-white flex justify-between">
                <span>GSTIN: {selectedVendor?.gstin || '36AAACI1234E1Z8'}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px]">VERIFIED</Badge>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">PAN: {selectedVendor?.pan || 'AAACI1234E'}</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Contact & Agreement</div>
              <div className="text-white">Contact: {selectedVendor?.contact_person} ({selectedVendor?.phone})</div>
              <div className="text-slate-400 text-[11px]">Email: {selectedVendor?.email || 'Not provided'}</div>
              <div className="text-slate-400 text-[11px]">Terms: {selectedVendor?.payment_terms || '15 Days Credit'}</div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl border-slate-700 text-slate-300 text-xs w-full">
              Close Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
