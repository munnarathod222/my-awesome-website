import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { TRIP_STATUS_OPTIONS } from '@/lib/tripStatusUtils.js';

const TripEditModal = ({ isOpen, onClose, tripId, onSuccess, employees = [], trucks = [] }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    trip_id: '',
    date: '',
    driver_name: '',
    truck_number: '',
    route: '',
    cycle: '',
    kms: '',
    revenue: '',
    client_payment_status: 'pending',
    trip_status: 'Upcoming',
    mileage: '',
    assigned_managers: '',
    vendor_payout: '',
    payment_model: 'Model2'
  });

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!isOpen || !tripId) return;
      
      setIsFetching(true);
      try {
        const trip = await pb.collection('trip_logs').getOne(tripId, { $autoCancel: false });
        setFormData({
          trip_id: trip.trip_id || '',
          date: trip.date ? format(new Date(trip.date), 'yyyy-MM-dd') : '',
          driver_name: trip.driver_name || '',
          truck_number: trip.truck_number || '',
          route: trip.route || '',
          cycle: trip.cycle || '',
          kms: trip.kms || '',
          revenue: trip.revenue || '',
          client_payment_status: trip.client_payment_status || 'pending',
          trip_status: trip.trip_status || 'Upcoming',
          mileage: trip.mileage || '',
          assigned_managers: trip.assigned_managers || '',
          vendor_payout: trip.vendor_payout || '',
          payment_model: trip.payment_model || 'Model2'
        });
      } catch (error) {
        console.error('[TripEditModal] Failed to fetch trip details:', error);
        toast.error('Could not load trip details. The record might have been deleted or you lack permissions.');
        onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchTripDetails();
  }, [isOpen, tripId, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tripId) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        date: formData.date,
        driver_name: formData.driver_name,
        truck_number: formData.truck_number,
        route: formData.route,
        cycle: formData.cycle,
        kms: parseFloat(formData.kms) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        client_payment_status: formData.client_payment_status,
        trip_status: formData.trip_status,
        mileage: parseFloat(formData.mileage) || 0,
        assigned_managers: formData.assigned_managers,
        
        ownership_type: isAttached ? 'Attached' : 'Owned',
        payment_model: isAttached ? formData.payment_model : 'Model1',
        vendor_payout: isAttached 
          ? (formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.revenue) || 0) - 500) : (parseFloat(formData.vendor_payout) || 0))
          : 0,
        brokerage_margin: isAttached
          ? (formData.payment_model === 'Model3' ? 500 : (parseFloat(formData.revenue) || 0) - (parseFloat(formData.vendor_payout) || 0))
          : 0
      };

      await pb.collection('trip_logs').update(tripId, updateData, { $autoCancel: false });
      toast.success('Trip log updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('[TripEditModal] Update error:', error);
      toast.error(error.message || 'Failed to update the trip log. Please verify your inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTruckObj = trucks.find(t => t.truck_number === formData.truck_number);
  const ownershipType = selectedTruckObj?.ownership_type || 'Owned';
  const isAttached = ownershipType === 'Attached';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-card text-card-foreground">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Edit Trip Log</DialogTitle>
              <DialogDescription>Update the details and current status of this shipment.</DialogDescription>
            </div>
            {formData.trip_id && (
              <div className="bg-muted px-3 py-1.5 rounded-lg border border-border shadow-sm text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Trip ID</p>
                <p className="text-sm font-mono font-bold text-foreground">{formData.trip_id}</p>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading trip details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-driver">Driver</Label>
                <Select value={formData.driver_name} onValueChange={(value) => setFormData({ ...formData, driver_name: value })}>
                  <SelectTrigger id="edit-driver" className="bg-background">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-truck">Truck Number</Label>
                <Select value={formData.truck_number} onValueChange={(value) => setFormData({ ...formData, truck_number: value })}>
                  <SelectTrigger id="edit-truck" className="bg-background">
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {trucks.map(truck => (
                      <SelectItem key={truck.id} value={truck.truck_number}>{truck.truck_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-route">Route</Label>
                <Input
                  id="edit-route"
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="e.g. Mumbai - Delhi"
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-cycle">Cycle</Label>
                <Input
                  id="edit-cycle"
                  type="text"
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                  placeholder="e.g. 14-day cycle"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-kms">Kilometers</Label>
                <Input
                  id="edit-kms"
                  type="number"
                  step="0.01"
                  value={formData.kms}
                  onChange={(e) => setFormData({ ...formData, kms: e.target.value })}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-revenue">Revenue (₹)</Label>
                <Input
                  id="edit-revenue"
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="0"
                  required
                  className="bg-background"
                />
              </div>

              {ownershipType === 'Attached' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-blue-900/35 bg-blue-950/10 md:col-span-2 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="edit-payment_model">Brokerage Payment Model</Label>
                    <Select 
                      value={formData.payment_model} 
                      onValueChange={v => setFormData(prev => ({ 
                        ...prev, 
                        payment_model: v,
                        vendor_payout: v === 'Model3' ? Math.max(0, (parseFloat(prev.revenue) || 0) - 500).toString() : prev.vendor_payout
                      }))}
                    >
                      <SelectTrigger id="edit-payment_model" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Model2">Margin Based (Model 2)</SelectItem>
                        <SelectItem value="Model3">Flat Fee ₹500 (Model 3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vendor_payout">Agreed Vendor Payout (₹)</Label>
                    <Input 
                      id="edit-vendor_payout"
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.revenue) || 0) - 500).toString() : formData.vendor_payout} 
                      onChange={e => setFormData({...formData, vendor_payout: e.target.value})} 
                      readOnly={formData.payment_model === 'Model3'}
                      className={formData.payment_model === 'Model3' ? "bg-muted" : "bg-background"}
                    />
                    {formData.revenue && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Est. Brokerage Margin: <span className="font-bold text-emerald-400">
                          ₹{formData.payment_model === 'Model3' ? '500' : (parseFloat(formData.revenue) || 0) - (parseFloat(formData.vendor_payout) || 0)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-mileage">Mileage (km/l)</Label>
                <Input
                  id="edit-mileage"
                  type="number"
                  step="0.01"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="0.0"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-trip_status">Trip Status</Label>
                <Select value={formData.trip_status} onValueChange={(value) => setFormData({ ...formData, trip_status: value })}>
                  <SelectTrigger id="edit-trip_status" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-payment_status">Client Payment Status</Label>
                <Select value={formData.client_payment_status} onValueChange={(value) => setFormData({ ...formData, client_payment_status: value })}>
                  <SelectTrigger id="edit-payment_status" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received / Paid</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="blank">Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-managers">Assigned Managers</Label>
                <Input
                  id="edit-managers"
                  type="text"
                  value={formData.assigned_managers}
                  onChange={(e) => setFormData({ ...formData, assigned_managers: e.target.value })}
                  placeholder="e.g. John Doe, Jane Smith"
                  className="bg-background"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl shadow-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripEditModal;