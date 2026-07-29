import React, { useState, useEffect } from 'react';
import { Wrench, Fuel, Shield, AlertTriangle, Phone, MapPin, CheckCircle2, Search, Truck, Zap, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function VendorServicesMarketplace() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit Vendor State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    notes: ''
  });

  const fetchRealVendors = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('contacts').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(c => ({
        id: c.id,
        category: c.category || c.type || 'On-Highway Service',
        name: c.name || c.contact_person || 'Service Provider',
        location: c.city ? `${c.city}, ${c.state || ''}` : 'Hyderabad / Pan India',
        phone: c.phone || c.mobile || '+91 7794072244',
        rating: 4.9,
        service_range: c.address || '24/7 Mobile Service Truck Available',
        specialization: c.notes || c.company || 'Heavy Vehicle Service'
      }));

      setVendors(mapped);
    } catch (err) {
      console.error('Error fetching real vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealVendors();
  }, []);

  const handleOpenEdit = (v) => {
    setSelectedVendor(v);
    setEditForm({
      name: v.name,
      category: v.category,
      location: v.location,
      phone: v.phone,
      notes: v.specialization
    });
    setEditModalOpen(true);
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    if (!selectedVendor) return;
    try {
      await pb.collection('contacts').update(selectedVendor.id, {
        name: editForm.name,
        category: editForm.category,
        phone: editForm.phone,
        notes: editForm.notes
      }, { $autoCancel: false });

      toast.success(`Vendor ${editForm.name} updated!`);
      setEditModalOpen(false);
      fetchRealVendors();
    } catch (err) {
      console.error('Failed to update vendor:', err);
      toast.error('Failed to update vendor record');
    }
  };

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-rose-400" /> Vendor Network & Highway Services
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, edit, and manage registered on-highway service vendors from your database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={fetchRealVendors} variant="outline" className="border-slate-800 rounded-xl h-10 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs font-bold px-3 py-1">
            {vendors.length} Vendors Registered
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search vendor name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl text-white h-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-8 w-full bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-800 p-8 text-center text-slate-400 text-xs rounded-2xl space-y-3">
          <Wrench className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-bold text-white text-sm">No registered vendors found in database.</p>
          <p className="text-slate-400">Add vendor entries in Contacts page to display them here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <Card key={v.id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-md">
              <CardContent className="p-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[9px] text-rose-400 border-rose-500/30 uppercase font-mono">
                        {v.category}
                      </Badge>
                      <h3 className="text-sm font-bold text-white mt-0.5">{v.name}</h3>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenEdit(v)}
                    className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    title="Edit Vendor Details"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {v.location}
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-300 font-semibold">{v.service_range}</div>
                  <div className="text-[11px] text-slate-400">Notes: {v.specialization}</div>
                </div>

                <Button 
                  onClick={() => toast.success(`Calling ${v.name} (${v.phone})`)}
                  className="w-full h-8 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs rounded-lg shadow-md"
                >
                  <Phone className="w-3.5 h-3.5 mr-1" /> Call Vendor ({v.phone})
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Vendor Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Edit className="w-5 h-5 text-amber-400" /> Edit Vendor ({selectedVendor?.name})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update vendor contact details and services.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateVendor} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Vendor / Business Name</Label>
              <Input 
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input 
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone Number</Label>
                <Input 
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Service Notes / Specialization</Label>
              <Input 
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
                Save & Update Vendor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
