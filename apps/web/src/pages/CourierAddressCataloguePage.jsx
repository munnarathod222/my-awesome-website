import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Building2, MapPin, Plus, Printer, Search, RefreshCw, 
  Trash2, Edit2, Copy, Check, ExternalLink, Download, 
  ShieldCheck, ArrowLeft, Tag, Phone, Mail, FileText, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import PrintableCourierLabelModal from '@/components/PrintableCourierLabelModal.jsx';

export default function CourierAddressCataloguePage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [activePrintAddress, setActivePrintAddress] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    attention_to: '',
    contact_person: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    category: 'Client POD Desk',
    notes: ''
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('courier_addresses').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setAddresses(records);
    } catch (err) {
      console.error('Error fetching courier addresses:', err);
      toast.error('Failed to load courier addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      title: '',
      company_name: '',
      attention_to: 'Central Accounts & Billing Clearance Desk',
      contact_person: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '',
      category: 'Client POD Desk',
      notes: ''
    });
    setEditModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      title: addr.title || '',
      company_name: addr.company_name || '',
      attention_to: addr.attention_to || '',
      contact_person: addr.contact_person || '',
      phone: addr.phone || '',
      email: addr.email || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      category: addr.category || 'Client POD Desk',
      notes: addr.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return toast.error('Company Name is required');
    if (!formData.address_line1.trim()) return toast.error('Address Line 1 is required');
    if (!formData.city.trim()) return toast.error('City is required');

    setSavingAddress(true);
    try {
      const payload = {
        title: formData.title.trim() || `${formData.company_name.trim()} (${formData.city.trim()})`,
        company_name: formData.company_name.trim(),
        attention_to: formData.attention_to.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        category: formData.category,
        notes: formData.notes.trim()
      };

      if (editingAddress) {
        await pb.collection('courier_addresses').update(editingAddress.id, payload);
        toast.success('Courier address updated successfully');
      } else {
        await pb.collection('courier_addresses').create(payload);
        toast.success('New courier address saved');
      }

      setEditModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Failed to save address: ' + err.message);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete address for "${name}"?`)) return;
    try {
      await pb.collection('courier_addresses').delete(id);
      toast.success('Address removed from catalogue');
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete address: ' + err.message);
    }
  };

  const handleCopyAddress = (addr) => {
    const text = [
      addr.company_name,
      addr.attention_to ? `Attn: ${addr.attention_to}` : '',
      addr.address_line1,
      addr.address_line2,
      `${addr.city}, ${addr.state} ${addr.pincode ? `– ${addr.pincode}` : ''}`,
      addr.phone ? `Contact: ${addr.phone}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(addr.id);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImportClients = async () => {
    setIsImporting(true);
    try {
      const clients = await pb.collection('clients').getFullList({ $autoCancel: false });
      let added = 0;

      for (const c of clients) {
        const cName = c.client_name || c.company_name;
        if (!cName) continue;
        
        // Check if exists
        const exists = addresses.some(a => a.company_name?.toLowerCase() === cName.toLowerCase());
        if (exists) continue;

        const addr = c.address || 'Industrial Area';
        const isHubli = addr.toLowerCase().includes('hubli');
        const isPune = addr.toLowerCase().includes('pune');

        await pb.collection('courier_addresses').create({
          title: `${cName} - Central Billing Desk`,
          company_name: c.company_name || cName,
          attention_to: c.contact_person ? `${c.contact_person} (Billing Desk)` : 'Central Accounts & Billing Clearance Desk',
          contact_person: c.contact_person || 'Billing Desk Officer',
          phone: c.phone || '040-27801234',
          email: c.email || '',
          address_line1: addr.slice(0, 100),
          address_line2: c.gst_number ? `GSTIN: ${c.gst_number}` : '',
          city: isHubli ? 'Hubli' : (isPune ? 'Pune' : 'Hyderabad'),
          state: isHubli ? 'Karnataka' : (isPune ? 'Maharashtra' : 'Telangana'),
          pincode: isHubli ? '580024' : (isPune ? '411001' : '500070'),
          category: 'Client POD Desk',
          client_id: c.id,
          client_name: cName,
          is_default: true,
          notes: 'Auto-imported from Clients Master directory.'
        });
        added++;
      }

      toast.success(`Successfully imported ${added} client addresses!`);
      fetchAddresses();
    } catch (err) {
      console.error('Error importing clients:', err);
      toast.error('Failed to import client addresses: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredAddresses = useMemo(() => {
    return addresses.filter(addr => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        addr.title?.toLowerCase().includes(q) ||
        addr.company_name?.toLowerCase().includes(q) ||
        addr.attention_to?.toLowerCase().includes(q) ||
        addr.city?.toLowerCase().includes(q) ||
        addr.phone?.toLowerCase().includes(q) ||
        addr.pincode?.includes(q);

      const matchCategory = categoryFilter === 'all' || addr.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [addresses, search, categoryFilter]);

  const categories = ['all', 'Client POD Desk', 'Corporate', 'Warehouse', 'Vendor'];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Helmet>
        <title>Courier Address Catalogue | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Courier Address Catalogue
                <Badge variant="outline" className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs">
                  {addresses.length} Saved
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Saved delivery destinations & billing desks for direct envelope slips and 4"×6" thermal printing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleImportClients}
            disabled={isImporting}
            className="rounded-xl border-slate-700 hover:bg-slate-800 text-xs text-slate-200 gap-1.5 flex-1 sm:flex-initial"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isImporting ? 'Importing...' : 'Sync From Clients'}
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-blue-600/30 flex-1 sm:flex-initial cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by company name, attention person, city, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-950 border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Address Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span>Loading address catalogue...</span>
        </div>
      ) : filteredAddresses.length === 0 ? (
        <Card className="border border-slate-800 bg-slate-950/60 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-base font-bold text-white">No addresses found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {search ? 'Try clearing your search query' : 'Import your client billing desks or add your first courier destination.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleImportClients} variant="outline" className="rounded-xl border-slate-700 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Auto-Import Clients
            </Button>
            <Button onClick={handleOpenAdd} className="rounded-xl bg-blue-600 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Address
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAddresses.map(addr => (
            <Card 
              key={addr.id} 
              className="border border-slate-800 hover:border-slate-700 bg-[#0b141a] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition shadow-soft group hover:shadow-xl hover:shadow-blue-950/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-white text-base leading-tight group-hover:text-blue-400 transition">
                      {addr.company_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {addr.attention_to || 'Billing & Accounts Desk'}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-bold shrink-0 ${
                      addr.category === 'Client POD Desk' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : addr.category === 'Corporate' 
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {addr.category || 'General'}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1 text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p>{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-slate-400 text-[11px]">{addr.address_line2}</p>}
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {addr.city}, {addr.state} {addr.pincode ? `– PIN: ${addr.pincode}` : ''}
                      </p>
                    </div>
                  </div>

                  {addr.phone && (
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{addr.phone}</span>
                    </div>
                  )}
                </div>

                {addr.notes && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    💡 {addr.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyAddress(addr)}
                    className="h-8 px-2 text-xs text-slate-400 hover:text-white rounded-lg"
                    title="Copy Formatted Address"
                  >
                    {copiedId === addr.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(addr)}
                    className="h-8 px-2 text-xs text-slate-400 hover:text-white rounded-lg"
                    title="Edit Address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAddress(addr.id, addr.company_name)}
                    className="h-8 px-2 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={() => setActivePrintAddress(addr)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Label
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Address Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {editingAddress ? 'Edit Courier Address' : 'Add Courier Address'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Company / Entity Name *</Label>
                <Input
                  required
                  placeholder="e.g. ITC Limited"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Category</Label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="Client POD Desk">Client POD Desk</option>
                  <option value="Corporate">Corporate Office</option>
                  <option value="Warehouse">Warehouse / Plant</option>
                  <option value="Vendor">Vendor Hub</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Attention / Department</Label>
                <Input
                  placeholder="e.g. Inward Billing Clearance Desk"
                  value={formData.attention_to}
                  onChange={e => setFormData({ ...formData, attention_to: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Contact Person</Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.contact_person}
                  onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Phone Number</Label>
                <Input
                  placeholder="e.g. +91 98480 12345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="e.g. billing@client.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-300">Street Address *</Label>
              <Input
                required
                placeholder="Plot / Sy No., Building, Street Name"
                value={formData.address_line1}
                onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-300">Address Line 2 (Optional / Landmark / GST)</Label>
              <Input
                placeholder="Near Industrial Estate Gate, GSTIN: 36AA..."
                value={formData.address_line2}
                onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
                className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">City *</Label>
                <Input
                  required
                  placeholder="e.g. Hubli"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">State *</Label>
                <Input
                  required
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">PIN Code</Label>
                <Input
                  placeholder="e.g. 580024"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  className="bg-slate-900 border-slate-800 h-9 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-300">Handling Notes</Label>
              <Input
                placeholder="e.g. Inward clearance only between 10am - 4pm"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-900 border-slate-800 h-9 text-xs text-white"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingAddress}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                {savingAddress ? 'Saving...' : editingAddress ? 'Update Address' : 'Save to Catalogue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print Label Modal */}
      {activePrintAddress && (
        <PrintableCourierLabelModal
          isOpen={true}
          onClose={() => setActivePrintAddress(null)}
          toAddress={activePrintAddress}
          shipmentRef={{
            trip_id: 'CATALOGUE',
            truck_number: 'FLEET',
            lr_number: 'DIRECT',
            courier_partner: 'DTDC',
            date: new Date().toISOString().split('T')[0]
          }}
        />
      )}
    </div>
  );
}
