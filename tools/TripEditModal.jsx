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
import { filterActiveDrivers } from '@/lib/driverUtils.js';

const TRIP_STATUS_OPTIONS = ['Upcoming', 'In Transit', 'Completed', 'Cancelled'];

const TripEditModal = ({ isOpen, onClose, tripId, onSuccess, employees = [], trucks = [] }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    trip_id: '',
    date: '',
    driver_employee_id: '',
    driver_employee_code: '',
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
    payment_model: 'Model2',
    toll_deduction: ''
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
          driver_employee_id: trip.driver_employee_id || '',
          driver_employee_code: trip.driver_employee_code || '',
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
          payment_model: trip.payment_model || 'Model2',
          toll_deduction: trip.toll_deduction !== undefined && trip.toll_deduction !== null ? trip.toll_deduction.toString() : ''
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
        driver_employee_id: formData.driver_employee_id || null,
        driver_employee_code: formData.driver_employee_code || null,
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
        toll_deduction: parseFloat(formData.toll_deduction) || 0,
        
        ownership_type: isAttachedFamily ? 'AttachedFamily' : (isAttached ? 'Attached' : 'Owned'),
        payment_model: isAttachedFamily ? 'ModelFamilySettlement' : (isAttached ? formData.payment_model : 'Model1'),
        vendor_payout: isAttachedFamily 
          ? Math.max(0, (parseFloat(formData.revenue) || 0) - (parseFloat(formData.toll_deduction) || 0) - (parseFloat(formData.advance_paid_to_driver) || 0))
          : (isAttached 
              ? (formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.revenue) || 0) - 500) : (parseFloat(formData.vendor_payout) || 0))
              : 0),
        brokerage_margin: isAttachedFamily
          ? 0
          : (isAttached
              ? (formData.payment_model === 'Model3' ? 500 : (parseFloat(formData.revenue) || 0) - (parseFloat(formData.vendor_payout) || 0))
              : 0)
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
  const ownershipType = selectedTruckObj?.ownership_type || formData.ownership_type || 'Owned';
  const isAttachedFamily = ownershipType === 'AttachedFamily';
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
                <Select 
                  value={formData.driver_employee_code || (formData.driver_name?.startsWith('Temporary Driver') ? 'TEMPORARY' : '')} 
                  onValueChange={(value) => {
                    if (value === 'TEMPORARY') {
                      setFormData({ ...formData, driver_employee_code: '', driver_employee_id: '', driver_name: 'Temporary Driver' });
                    } else {
                      const emp = employees.find(e => (e.employee_code && e.employee_code === value) || e.id === value);
                      if (emp) {
                        setFormData({
                          ...formData,
                          driver_employee_code: emp.employee_code || '',
                          driver_employee_id: emp.id,
                          driver_name: emp.name
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger id="edit-driver" className="bg-background">
                    <SelectValue placeholder="Select driver by permanent code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEMPORARY" className="font-semibold text-amber-600 dark:text-amber-400">
                      ⚡ Temporary Driver (No mobile access)
                    </SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.employee_code || emp.id}>
                        {emp.employee_code ? `${emp.employee_code} — ${emp.name}` : `${emp.name} (Code not assigned)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.driver_name?.startsWith('Temporary Driver') && (
                  <Input
                    placeholder="Custom Temp Name (Optional, e.g. Temporary - Ramesh)"
                    value={formData.driver_name === 'Temporary Driver' ? '' : formData.driver_name}
                    onChange={e => setFormData({ ...formData, driver_name: e.target.value ? e.target.value : 'Temporary Driver' })}
                    className="text-xs h-8 mt-1 bg-amber-500/5 border-amber-500/30"
                  />
                )}
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

              {ownershipType === 'AttachedFamily' ? (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 md:col-span-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤝</span>
                      <span className="text-xs font-bold text-foreground">
                        Family Attached Net Settlement ({selectedTruckObj?.owner_name || 'Family Owner'})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold border border-emerald-500/30 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      0% Pass-Through (Not Company Profit)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-background/80 border border-border/60 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Gross Freight Billed:</span>
                      <span className="text-foreground font-semibold">₹{(parseFloat(formData.revenue) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-500/90 text-[11px]">
                      <span>Less Toll Deduction:</span>
                      <span>-₹{(parseFloat(formData.toll_deduction) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-1 border-t border-border flex justify-between font-bold text-xs">
                      <span className="text-foreground">Est. Trip Owner Net Payout:</span>
                      <span className="text-emerald-500 font-extrabold text-sm">
                        ₹{Math.max(0, (parseFloat(formData.revenue) || 0) - (parseFloat(formData.toll_deduction) || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    * Company pays fuel, tolls, and advances upfront. Net balance is disbursed to owner and excluded from company retained profit.
                  </p>
                </div>
              ) : ownershipType === 'Attached' ? (
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
              ) : null}
              
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
                <Label htmlFor="edit-toll_deduction">Toll Deduction (₹)</Label>
                <Input
                  id="edit-toll_deduction"
                  type="number"
                  step="0.01"
                  value={formData.toll_deduction}
                  onChange={(e) => setFormData({ ...formData, toll_deduction: e.target.value })}
                  placeholder="0.00"
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