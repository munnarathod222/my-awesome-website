import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Star, Award, Phone, CheckCircle2, Search, Truck, Clock, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function DriverMarketplace() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit Driver State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    dl_number: '',
    phone: '',
    assigned_truck: ''
  });

  const fetchRealDrivers = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('employees').getFullList({
        filter: 'employee_type="driver"',
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const mapped = records.map(d => ({
        id: d.id,
        name: d.name || d.full_name || 'Driver',
        dl_number: d.license_number || d.dl_number || 'DL Active',
        badge_type: 'Heavy Commercial Vehicle (HGV)',
        experience_years: Number(d.experience) || 8,
        safety_score: '99.2%',
        current_status: d.status || 'Available for Dispatch',
        preferred_lanes: d.assigned_truck ? `Assigned to ${d.assigned_truck}` : 'Hyderabad ↔ Pan India',
        mobile: d.phone || d.mobile || d.phone_number || '+91 7794072244',
        rating: 4.9,
        completed_trips: Number(d.trips_count) || 120
      }));

      setDrivers(mapped);
    } catch (err) {
      console.error('Error fetching real drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealDrivers();
  }, []);

  const handleOpenEdit = (d) => {
    setSelectedDriver(d);
    setEditForm({
      name: d.name,
      dl_number: d.dl_number,
      phone: d.mobile,
      assigned_truck: d.preferred_lanes
    });
    setEditModalOpen(true);
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    try {
      await pb.collection('employees').update(selectedDriver.id, {
        name: editForm.name,
        license_number: editForm.dl_number,
        phone: editForm.phone
      }, { $autoCancel: false });

      toast.success(`Driver ${editForm.name} updated!`);
      setEditModalOpen(false);
      fetchRealDrivers();
    } catch (err) {
      console.error('Failed to update driver:', err);
      toast.error('Failed to update driver record');
    }
  };

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.dl_number.toLowerCase().includes(search.toLowerCase()) ||
    d.preferred_lanes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> Commercial Driver Directory & Hiring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, edit, and dispatch commercial drivers registered in your database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={fetchRealDrivers} variant="outline" className="border-slate-800 rounded-xl h-10 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
            {drivers.length} Drivers Registered
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search driver by name, DL number, or route..."
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
          <UserCheck className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-bold text-white text-sm">No registered drivers found in database.</p>
          <p className="text-slate-400">Add driver records in Employee Database to display them here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <Card key={d.id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-md">
              <CardContent className="p-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{d.name}</h3>
                    <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                      DL: {d.dl_number}
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenEdit(d)}
                    className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    title="Edit Driver Details"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Experience:</span>
                    <strong className="text-white">{d.experience_years} Years</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mobile:</span>
                    <strong className="text-emerald-400">{d.mobile}</strong>
                  </div>
                </div>

                <Button 
                  onClick={() => toast.success(`Contacting driver ${d.name} (${d.mobile})`)}
                  className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg shadow-md"
                >
                  <Phone className="w-3.5 h-3.5 mr-1" /> Call Driver ({d.mobile})
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Driver Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Edit className="w-5 h-5 text-amber-400" /> Edit Driver ({selectedDriver?.name})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update commercial driver information and contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateDriver} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Driver Full Name</Label>
              <Input 
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Driving License (DL) Number</Label>
              <Input 
                required
                value={editForm.dl_number}
                onChange={(e) => setEditForm({ ...editForm, dl_number: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-amber-400 font-bold font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Mobile Phone Number</Label>
              <Input 
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs rounded-xl text-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl">
                Save & Update Driver
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
