import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Fuel, MapPin, Phone, User, Building2, Loader2, IndianRupee } from 'lucide-react';
import { saveFuelStation } from '@/lib/fuelStationUtils.js';

export default function FuelStationModal({ isOpen, onClose, station, onSuccess }) {
  const isEdit = !!station;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    station_name: '',
    station_code: '',
    brand: 'BPCL',
    contact_person: '',
    phone_number: '',
    location: '',
    google_maps_url: '',
    credit_balance: '0',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      if (station) {
        setFormData({
          id: station.id,
          station_name: station.station_name || '',
          station_code: station.station_code || '',
          brand: station.brand || 'BPCL',
          contact_person: station.contact_person || '',
          phone_number: station.phone_number || '',
          location: station.location || '',
          google_maps_url: station.google_maps_url || '',
          credit_balance: (station.credit_balance || 0).toString(),
          status: station.status || 'Active'
        });
      } else {
        setFormData({
          station_name: '',
          station_code: '',
          brand: 'BPCL',
          contact_person: '',
          phone_number: '',
          location: '',
          google_maps_url: '',
          credit_balance: '0',
          status: 'Active'
        });
      }
    }
  }, [isOpen, station]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.station_name.trim()) {
      toast.error('Fuel Station Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        credit_balance: parseFloat(formData.credit_balance) || 0
      };

      await saveFuelStation(payload);
      toast.success(isEdit ? 'Fuel station updated successfully!' : 'Fuel station added successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save fuel station:', err);
      toast.error('Failed to save fuel station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-heading">
            <Fuel className="w-5 h-5 text-primary" />
            {isEdit ? 'Edit Fuel Station' : 'Add New Fuel Station'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-semibold">Station Name *</Label>
            <Input 
              placeholder="e.g. BPCL Ghatkesar Bunk"
              value={formData.station_name}
              onChange={(e) => handleChange('station_name', e.target.value)}
              className="bg-background"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Fuel Brand</Label>
              <Select value={formData.brand} onValueChange={(v) => handleChange('brand', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPCL">Bharat Petroleum (BPCL)</SelectItem>
                  <SelectItem value="IOCL">Indian Oil (IOCL)</SelectItem>
                  <SelectItem value="HPCL">Hindustan Petroleum (HPCL)</SelectItem>
                  <SelectItem value="Reliance">Reliance Petroleum</SelectItem>
                  <SelectItem value="Nayara">Nayara Energy</SelectItem>
                  <SelectItem value="Shell">Shell</SelectItem>
                  <SelectItem value="Other">Other / Independent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Short Code / Ref ID</Label>
              <Input 
                placeholder="e.g. BP-GHAT"
                value={formData.station_code}
                onChange={(e) => handleChange('station_code', e.target.value.toUpperCase())}
                className="bg-background font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Contact Person</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Manager / Owner Name"
                  value={formData.contact_person}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Mobile Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="10-digit Phone"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Address / Location</Label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="e.g. NH-65 Ghatkesar, Hyderabad"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Google Maps Link / GPS Location</Label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
              <Input 
                placeholder="https://maps.app.goo.gl/... or location name"
                value={formData.google_maps_url}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label className="font-semibold text-amber-400 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" />
              Initial Outstanding Credit Balance (Udhar ₹)
            </Label>
            <Input 
              type="number"
              min="0"
              placeholder="0"
              value={formData.credit_balance}
              onChange={(e) => handleChange('credit_balance', e.target.value)}
              className="bg-background font-mono font-bold text-amber-400"
            />
            <p className="text-[11px] text-muted-foreground">
              Enter any existing unpaid credit balance owed to this fuel station.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl shadow-md">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Update Fuel Station' : 'Save Fuel Station'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
