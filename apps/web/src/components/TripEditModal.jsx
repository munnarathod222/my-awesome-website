import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, Clock, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { filterActiveDrivers } from '@/lib/driverUtils.js';
import DispatchComplianceSection from '@/components/DispatchComplianceSection.jsx';
import { TRIP_STATUS_OPTIONS, calculateTripDetention, isAtDeliveryDock } from '@/lib/tripStatusUtils.js';

const TripEditModal = ({ isOpen, onClose, tripId, onSuccess, employees = [], trucks = [] }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    trip_id: '',
    client_id: '',
    date: '',
    driver_employee_id: '',
    driver_employee_code: '',
    driver_name: '',
    truck_number: '',
    route: '',
    cycle: '',
    kms: '',
    revenue: '',
    advance_received_from_client: '',
    advance_paid_to_driver: '',
    client_payment_status: 'pending',
    trip_status: 'Upcoming',
    mileage: '',
    assigned_managers: '',
    vendor_payout: '',
    payment_model: 'Model2',
    toll_deduction: '',
    loading_charges: '',
    loading_paid_by: 'client',
    unloading_charges: '',
    unloading_paid_by: 'client',
    broker_commission: '',
    munsiyana: '',
    lr_number: '',
    lr_file_url: '',
    invoice_number: '',
    invoice_value: '',
    invoice_file_url: '',
    eway_bill_number: '',
    eway_expiry_date: '',
    eway_bill_file_url: '',
    delivery_deadline: '',
    client_trip_id: '',
    late_delivery_reason: '',
    is_sealed: false,
    seal_numbers: [''],
    seal_number: '',
    seal_photo_url: '',
    gps_tracking_link: '',
    gps_validity_days: 2,
    gps_link_expiry: '',
    delivery_dock_arrival_time: '',
    free_detention_hours: 4,
    detention_rate_per_hour: 500,
    detention_hours: 0,
    detention_amount: 0,
    detention_status: 'none'
  });

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!isOpen || !tripId) return;
      
      setIsFetching(true);
      try {
        const [trip, clientList] = await Promise.all([
          pb.collection('trip_logs').getOne(tripId, { $autoCancel: false, expand: 'client_id' }),
          pb.collection('clients').getFullList({ sort: 'client_name', filter: 'status != "Inactive" && status != "Suspended"', $autoCancel: false }).catch(() => [])
        ]);
        setClients(clientList || []);
        setFormData({
          trip_id: trip.trip_id || '',
          client_id: trip.client_id || '',
          date: trip.date ? format(new Date(trip.date), 'yyyy-MM-dd') : '',
          driver_employee_id: trip.driver_employee_id || '',
          driver_employee_code: trip.driver_employee_code || '',
          driver_name: trip.driver_name || '',
          truck_number: trip.truck_number || '',
          route: trip.route || '',
          cycle: trip.cycle || '',
          kms: trip.kms !== undefined && trip.kms !== null ? trip.kms.toString() : '',
          revenue: trip.revenue !== undefined && trip.revenue !== null ? trip.revenue.toString() : '',
          advance_received_from_client: trip.advance_received_from_client !== undefined && trip.advance_received_from_client !== null ? trip.advance_received_from_client.toString() : '',
          advance_paid_to_driver: trip.advance_paid_to_driver !== undefined && trip.advance_paid_to_driver !== null ? trip.advance_paid_to_driver.toString() : '',
          client_payment_status: trip.client_payment_status || 'pending',
          trip_status: trip.trip_status || 'Upcoming',
          mileage: trip.mileage !== undefined && trip.mileage !== null ? trip.mileage.toString() : '',
          assigned_managers: trip.assigned_managers || '',
          vendor_payout: trip.vendor_payout !== undefined && trip.vendor_payout !== null ? trip.vendor_payout.toString() : '',
          payment_model: trip.payment_model || 'Model2',
          toll_deduction: trip.toll_deduction !== undefined && trip.toll_deduction !== null ? trip.toll_deduction.toString() : '',
          loading_charges: trip.loading_charges !== undefined && trip.loading_charges !== null ? trip.loading_charges.toString() : '',
          loading_paid_by: trip.loading_paid_by || 'client',
          unloading_charges: trip.unloading_charges !== undefined && trip.unloading_charges !== null ? trip.unloading_charges.toString() : '',
          unloading_paid_by: trip.unloading_paid_by || 'client',
          broker_commission: trip.broker_commission !== undefined && trip.broker_commission !== null ? trip.broker_commission.toString() : '',
          munsiyana: trip.munsiyana !== undefined && trip.munsiyana !== null ? trip.munsiyana.toString() : '',
          lr_number: trip.lr_number || '',
          lr_file_url: trip.lr_file_url || '',
          invoice_number: trip.invoice_number || '',
          invoice_value: trip.invoice_value !== undefined && trip.invoice_value !== null ? trip.invoice_value.toString() : '',
          invoice_file_url: trip.invoice_file_url || '',
          eway_bill_number: trip.eway_bill_number || '',
          eway_expiry_date: trip.eway_expiry_date || '',
          eway_bill_file_url: trip.eway_bill_file_url || '',
          delivery_deadline: trip.delivery_deadline || '',
          client_trip_id: trip.client_trip_id || '',
          late_delivery_reason: trip.late_delivery_reason || '',
          is_sealed: Boolean(trip.is_sealed),
          seal_numbers: Array.isArray(trip.seal_numbers) && trip.seal_numbers.length > 0 ? trip.seal_numbers : (trip.seal_number ? trip.seal_number.split(',').map(s => s.trim()).filter(Boolean) : ['']),
          seal_number: trip.seal_number || '',
          seal_photo_url: trip.seal_photo_url || '',
          gps_tracking_link: trip.gps_tracking_link || '',
          gps_validity_days: trip.gps_validity_days || 2,
          gps_link_expiry: trip.gps_link_expiry || '',
          delivery_dock_arrival_time: trip.delivery_dock_arrival_time || '',
          free_detention_hours: trip.free_detention_hours !== undefined && trip.free_detention_hours !== null && trip.free_detention_hours !== '' ? trip.free_detention_hours : 4,
          detention_rate_per_hour: trip.detention_rate_per_hour !== undefined && trip.detention_rate_per_hour !== null && trip.detention_rate_per_hour !== '' ? trip.detention_rate_per_hour : 500,
          detention_hours: trip.detention_hours || 0,
          detention_amount: trip.detention_amount || 0,
          detention_status: trip.detention_status || 'none'
        });
      } catch (error) {
        console.error('Error fetching trip details:', error);
        toast.error('Failed to load trip details');
        onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchTripDetails();
  }, [isOpen, tripId, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const dataToSave = {
        client_id: formData.client_id || null,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        driver_employee_id: formData.driver_employee_id || null,
        driver_employee_code: formData.driver_employee_code || null,
        driver_name: formData.driver_name,
        truck_number: formData.truck_number,
        route: formData.route,
        cycle: formData.cycle,
        kms: parseFloat(formData.kms) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        advance_received_from_client: parseFloat(formData.advance_received_from_client) || 0,
        advance_paid_to_driver: parseFloat(formData.advance_paid_to_driver) || 0,
        client_trip_id: formData.client_trip_id?.trim() || '',
        lr_number: formData.lr_number?.trim() || '',
        client_payment_status: formData.client_payment_status,
        trip_status: formData.trip_status,
        mileage: parseFloat(formData.mileage) || 0,
        assigned_managers: formData.assigned_managers,
        vendor_payout: isAttached ? (formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.revenue) || 0) - 500) : (parseFloat(formData.vendor_payout) || 0)) : 0,
        payment_model: isAttached ? formData.payment_model : 'Model1',
        toll_deduction: parseFloat(formData.toll_deduction) || 0,
        loading_charges: parseFloat(formData.loading_charges) || 0,
        loading_paid_by: formData.loading_paid_by || 'client',
        unloading_charges: parseFloat(formData.unloading_charges) || 0,
        unloading_paid_by: formData.unloading_paid_by || 'client',
        broker_commission: parseFloat(formData.broker_commission) || 0,
        munsiyana: parseFloat(formData.munsiyana) || 0,
        lr_file_url: formData.lr_file_url || '',
        invoice_number: formData.invoice_number || '',
        invoice_value: parseFloat(formData.invoice_value) || 0,
        invoice_file_url: formData.invoice_file_url || '',
        eway_bill_number: formData.eway_bill_number || '',
        eway_expiry_date: formData.eway_expiry_date || '',
        eway_bill_file_url: formData.eway_bill_file_url || '',
        delivery_deadline: formData.delivery_deadline || '',
        late_delivery_reason: formData.late_delivery_reason || '',
        is_sealed: Boolean(formData.is_sealed),
        seal_number: Array.isArray(formData.seal_numbers) ? formData.seal_numbers.filter(Boolean).map(s => s.trim()).join(', ') : (formData.seal_number || ''),
        seal_numbers: Array.isArray(formData.seal_numbers) ? formData.seal_numbers.filter(Boolean).map(s => s.trim()) : (formData.seal_number ? [formData.seal_number.trim()] : []),
        seal_photo_url: formData.seal_photo_url || '',
        gps_tracking_link: formData.gps_tracking_link || '',
        gps_validity_days: parseInt(formData.gps_validity_days) || 2,
        gps_link_expiry: formData.gps_link_expiry || '',
        delivery_dock_arrival_time: (() => {
          if ((formData.trip_status === 'Reached Delivery Docket' || formData.trip_status === 'Unloading in Progress') && !formData.delivery_dock_arrival_time) {
            return new Date().toISOString();
          }
          return formData.delivery_dock_arrival_time || '';
        })(),
        free_detention_hours: parseFloat(formData.free_detention_hours) || 4,
        detention_rate_per_hour: parseFloat(formData.detention_rate_per_hour) || 500,
        detention_hours: (() => {
          if (formData.delivery_dock_arrival_time || formData.trip_status === 'Reached Delivery Docket' || formData.trip_status === 'Unloading in Progress') {
            const det = calculateTripDetention({
              ...formData,
              delivery_dock_arrival_time: formData.delivery_dock_arrival_time || new Date().toISOString()
            });
            return det ? det.billableHours : 0;
          }
          return parseFloat(formData.detention_hours) || 0;
        })(),
        detention_amount: (() => {
          if (formData.delivery_dock_arrival_time || formData.trip_status === 'Reached Delivery Docket' || formData.trip_status === 'Unloading in Progress') {
            const det = calculateTripDetention({
              ...formData,
              delivery_dock_arrival_time: formData.delivery_dock_arrival_time || new Date().toISOString()
            });
            return det ? det.billableAmount : 0;
          }
          return parseFloat(formData.detention_amount) || 0;
        })(),
        detention_status: (() => {
          if (formData.delivery_dock_arrival_time || formData.trip_status === 'Reached Delivery Docket' || formData.trip_status === 'Unloading in Progress') {
            const det = calculateTripDetention({
              ...formData,
              delivery_dock_arrival_time: formData.delivery_dock_arrival_time || new Date().toISOString()
            });
            return det ? (det.isOverdue ? 'billable' : 'grace_period') : 'none';
          }
          return formData.detention_status || 'none';
        })()
      };

      await pb.collection('trip_logs').update(tripId, dataToSave, { $autoCancel: false });
      toast.success('Trip log updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip log');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTruckObj = trucks.find(t => t.truck_number === formData.truck_number);
  const ownershipType = selectedTruckObj?.ownership_type || formData.ownership_type || 'Owned';
  const isAttached = ownershipType === 'Attached';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-5xl h-[92vh] max-h-[92vh] p-0 flex flex-col overflow-hidden bg-background text-foreground rounded-3xl shadow-2xl border border-border/60">
        <DialogHeader className="p-5 pb-4 border-b border-border/50 shrink-0 bg-card/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Edit Trip Log</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update trip parameters, client assignments, financials, dispatch SLA, and telematics.
              </DialogDescription>
            </div>
            {formData.trip_id && (
              <div className="bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/60 shadow-sm text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Trip ID</p>
                <p className="text-sm font-mono font-bold text-foreground">{formData.trip_id}</p>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Loading trip details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
              
              {/* CARD 1: 📋 Shipment & Route Assignment */}
              <div className="bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span>📋</span> Shipment & Route Assignment
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Client assignment, truck, driver & route details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Client / Company Select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-client" className="text-xs font-semibold">
                      Client / Company <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select value={formData.client_id || ''} onValueChange={(val) => setFormData({ ...formData, client_id: val })}>
                      <SelectTrigger id="edit-client" className="bg-background h-9 text-xs">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.client_name || c.company_name || c.name} {c.company_name && c.company_name !== c.client_name ? `(${c.company_name})` : ''} {c.client_type?.includes('Broker') ? ' [🤝 Broker]' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trip Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-date" className="text-xs font-semibold">
                      Trip Date <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="bg-background h-9 text-xs"
                    />
                  </div>

                  {/* Driver */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-driver" className="text-xs font-semibold">Driver</Label>
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
                      <SelectTrigger id="edit-driver" className="bg-background h-9 text-xs">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEMPORARY" className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
                          ⚡ Temporary Driver (No mobile access)
                        </SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.employee_code || emp.id} className="text-xs">
                            {emp.employee_code ? `${emp.employee_code} — ${emp.name}` : `${emp.name} (Code not assigned)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.driver_name?.startsWith('Temporary Driver') && (
                      <Input
                        placeholder="Custom Temp Name (Optional)"
                        value={formData.driver_name === 'Temporary Driver' ? '' : formData.driver_name}
                        onChange={e => setFormData({ ...formData, driver_name: e.target.value ? e.target.value : 'Temporary Driver' })}
                        className="text-xs h-8 mt-1 bg-amber-500/5 border-amber-500/30"
                      />
                    )}
                  </div>

                  {/* Truck Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-truck" className="text-xs font-semibold">Truck Number</Label>
                    <Select value={formData.truck_number} onValueChange={(value) => setFormData({ ...formData, truck_number: value })}>
                      <SelectTrigger id="edit-truck" className="bg-background h-9 text-xs">
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks.map(truck => (
                          <SelectItem key={truck.id} value={truck.truck_number} className="text-xs">{truck.truck_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-route" className="text-xs font-semibold">Route</Label>
                    <Input
                      id="edit-route"
                      type="text"
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      required
                      placeholder="Origin -> Destination"
                      className="bg-background h-9 text-xs"
                    />
                  </div>

                  {/* Kilometers */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-kms" className="text-xs font-semibold">Kilometers</Label>
                    <Input
                      id="edit-kms"
                      type="number"
                      step="0.1"
                      value={formData.kms}
                      onChange={(e) => setFormData({ ...formData, kms: e.target.value })}
                      placeholder="0"
                      required
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Client / Partner Trip ID */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-client-trip-id" className="text-xs font-semibold">Client / Partner Trip ID</Label>
                    <Input
                      id="edit-client-trip-id"
                      type="text"
                      placeholder="e.g. DLV-TRP-88210, FK-BLR"
                      value={formData.client_trip_id || ''}
                      onChange={(e) => setFormData({ ...formData, client_trip_id: e.target.value })}
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* LR / Consignment Note # */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-lr-num" className="text-xs font-semibold">LR / Consignment Note #</Label>
                    <Input
                      id="edit-lr-num"
                      type="text"
                      placeholder="e.g. 400676524"
                      value={formData.lr_number || ''}
                      onChange={(e) => setFormData({ ...formData, lr_number: e.target.value })}
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Cycle */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-cycle" className="text-xs font-semibold">Cycle</Label>
                    <Input
                      id="edit-cycle"
                      type="text"
                      value={formData.cycle}
                      onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                      placeholder="e.g. 14-day cycle"
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: 💰 Financials, Revenue & Assigned Advances */}
              <div className="bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span>💰</span> Financials, Revenue & Assigned Advances
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Freight rates, advances, deductions & payment settlement</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-revenue" className="text-xs font-semibold">Revenue (Rs. )</Label>
                    <Input
                      id="edit-revenue"
                      type="number"
                      step="0.01"
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      placeholder="0"
                      required
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Advance from Client */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-adv-client" className="text-xs font-semibold">Advance from Client (₹)</Label>
                    <Input
                      id="edit-adv-client"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.advance_received_from_client || ''}
                      onChange={(e) => setFormData({ ...formData, advance_received_from_client: e.target.value })}
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Driver Advance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-adv-driver" className="text-xs font-semibold">Driver Advance (Paid by Co.) (₹)</Label>
                    <Input
                      id="edit-adv-driver"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.advance_paid_to_driver || ''}
                      onChange={(e) => setFormData({ ...formData, advance_paid_to_driver: e.target.value })}
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Toll Deduction */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-toll" className="text-xs font-semibold">Toll Deduction (₹)</Label>
                    <Input
                      id="edit-toll"
                      type="number"
                      step="0.01"
                      value={formData.toll_deduction}
                      onChange={(e) => setFormData({ ...formData, toll_deduction: e.target.value })}
                      placeholder="0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Trip Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-status" className="text-xs font-semibold">Trip Status</Label>
                    <Select value={formData.trip_status} onValueChange={(value) => setFormData({ ...formData, trip_status: value })}>
                      <SelectTrigger id="edit-status" className="bg-background h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIP_STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client Payment Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-payment-status" className="text-xs font-semibold">Client Payment Status</Label>
                    <Select value={formData.client_payment_status} onValueChange={(value) => setFormData({ ...formData, client_payment_status: value })}>
                      <SelectTrigger id="edit-payment-status" className="bg-background h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                        <SelectItem value="partial" className="text-xs">Advance Received</SelectItem>
                        <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                        <SelectItem value="overdue" className="text-xs">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loading Charges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-loading_charges" className="text-xs font-semibold">Loading Charges (₹)</Label>
                      <div className="inline-flex rounded-md border border-border p-0.5 text-[10px] bg-muted/40">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, loading_paid_by: 'client' })}
                          className={`px-1.5 py-0.5 rounded transition-colors ${formData.loading_paid_by !== 'company' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, loading_paid_by: 'company' })}
                          className={`px-1.5 py-0.5 rounded transition-colors ${formData.loading_paid_by === 'company' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Company
                        </button>
                      </div>
                    </div>
                    <Input
                      id="edit-loading_charges"
                      type="number"
                      step="0.01"
                      value={formData.loading_charges}
                      onChange={(e) => setFormData({ ...formData, loading_charges: e.target.value })}
                      placeholder="0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Unloading Charges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-unloading_charges" className="text-xs font-semibold">Unloading Charges (₹)</Label>
                      <div className="inline-flex rounded-md border border-border p-0.5 text-[10px] bg-muted/40">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, unloading_paid_by: 'client' })}
                          className={`px-1.5 py-0.5 rounded transition-colors ${formData.unloading_paid_by !== 'company' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, unloading_paid_by: 'company' })}
                          className={`px-1.5 py-0.5 rounded transition-colors ${formData.unloading_paid_by === 'company' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Company
                        </button>
                      </div>
                    </div>
                    <Input
                      id="edit-unloading_charges"
                      type="number"
                      step="0.01"
                      value={formData.unloading_charges}
                      onChange={(e) => setFormData({ ...formData, unloading_charges: e.target.value })}
                      placeholder="0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Broker Commission */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-broker_commission" className="text-xs font-semibold">Broker Commission (₹)</Label>
                    <Input
                      id="edit-broker_commission"
                      type="number"
                      step="0.01"
                      value={formData.broker_commission}
                      onChange={(e) => setFormData({ ...formData, broker_commission: e.target.value })}
                      placeholder="0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Munsiyana */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-munsiyana" className="text-xs font-semibold">Munsiyana Deducted (₹)</Label>
                    <Input
                      id="edit-munsiyana"
                      type="number"
                      step="0.01"
                      value={formData.munsiyana}
                      onChange={(e) => setFormData({ ...formData, munsiyana: e.target.value })}
                      placeholder="0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Assigned Managers */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-managers" className="text-xs font-semibold">Assigned Managers</Label>
                    <Input
                      id="edit-managers"
                      type="text"
                      value={formData.assigned_managers}
                      onChange={(e) => setFormData({ ...formData, assigned_managers: e.target.value })}
                      placeholder="e.g. John Doe, Jane Smith"
                      className="bg-background h-9 text-xs"
                    />
                  </div>

                  {/* Late Delivery Reason */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-late-reason" className="text-xs font-semibold text-rose-400">Late Delivery Reason (If Delayed)</Label>
                    <Input
                      id="edit-late-reason"
                      type="text"
                      value={formData.late_delivery_reason || ''}
                      onChange={(e) => setFormData({ ...formData, late_delivery_reason: e.target.value })}
                      placeholder="e.g. Traffic Congestion, Vehicle Breakdown"
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                </div>

                {isAttached && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-blue-900/35 bg-blue-950/10 animate-in fade-in duration-300 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-payment_model" className="text-xs font-semibold">Brokerage Payment Model</Label>
                      <Select
                        value={formData.payment_model}
                        onValueChange={(val) => setFormData(prev => ({
                          ...prev,
                          payment_model: val,
                          vendor_payout: val === 'Model3' ? Math.max(0, (parseFloat(prev.revenue) || 0) - 500).toString() : prev.vendor_payout
                        }))}
                      >
                        <SelectTrigger id="edit-payment_model" className="bg-background h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Model2" className="text-xs">Margin Based (Model 2)</SelectItem>
                          <SelectItem value="Model3" className="text-xs">Flat Fee Rs. 500 (Model 3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-vendor_payout" className="text-xs font-semibold">Agreed Vendor Payout (Rs. )</Label>
                      <Input
                        id="edit-vendor_payout"
                        type="number"
                        step="0.01"
                        disabled={formData.payment_model === 'Model3'}
                        value={formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.revenue) || 0) - 500).toString() : formData.vendor_payout}
                        onChange={(e) => setFormData({ ...formData, vendor_payout: e.target.value })}
                        placeholder="0"
                        className="bg-background h-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: 🛡️ Dispatch Compliance, Live GPS & SLA Tracker */}
              <div className="bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span>🛡️</span> Dispatch Compliance, Live GPS & SLA Tracker
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Mandatory transit documentation, live GPS link & security seals</span>
                </div>
                <DispatchComplianceSection formData={formData} setFormData={setFormData} />
              </div>

              {/* CARD 4: ⏱️ Delivery Docket Arrival & Unloading Detention SLA */}
              <div className="bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span>⏱️</span> Delivery Docket Arrival & Unloading Detention SLA
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Consignee dock reporting, detention clock & demurrage penalties</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Delivery Docket Arrival Time */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-dock-arrival" className="text-xs font-semibold">Docket Arrival Time</Label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_dock_arrival_time: new Date().toISOString() })}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Set Current Time
                      </button>
                    </div>
                    <Input
                      id="edit-dock-arrival"
                      type="datetime-local"
                      value={formData.delivery_dock_arrival_time ? (() => {
                        const d = new Date(formData.delivery_dock_arrival_time);
                        if (isNaN(d.getTime())) return '';
                        const pad = (n) => n.toString().padStart(2, '0');
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      })() : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          delivery_dock_arrival_time: val ? new Date(val).toISOString() : ''
                        });
                      }}
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Free Detention Hours */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-free-detention" className="text-xs font-semibold">Free Grace SLA (Hours)</Label>
                    <Input
                      id="edit-free-detention"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.free_detention_hours !== undefined ? formData.free_detention_hours : 4}
                      onChange={(e) => setFormData({ ...formData, free_detention_hours: e.target.value })}
                      placeholder="4.0"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>

                  {/* Detention Rate Per Hour */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-detention-rate" className="text-xs font-semibold">Detention Rate (₹ / Hour)</Label>
                    <Input
                      id="edit-detention-rate"
                      type="number"
                      step="50"
                      min="0"
                      value={formData.detention_rate_per_hour !== undefined ? formData.detention_rate_per_hour : 500}
                      onChange={(e) => setFormData({ ...formData, detention_rate_per_hour: e.target.value })}
                      placeholder="500"
                      className="bg-background h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Detention Summary Preview Card */}
                {(() => {
                  const det = calculateTripDetention(formData);
                  if (!det) {
                    return (
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>Detention clock is inactive. Once the vehicle arrives at the consignee docket, set the arrival timestamp or update trip status to <strong>"Reached Delivery Docket"</strong> to begin tracking.</span>
                      </div>
                    );
                  }
                  return (
                    <div className={cn(
                      "p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs",
                      det.isOverdue
                        ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                        : "bg-purple-950/30 border-purple-500/40 text-purple-200"
                    )}>
                      <div className="flex items-center gap-2.5">
                        <Timer className={cn("w-5 h-5 shrink-0", det.isOverdue ? "text-rose-400 animate-pulse" : "text-purple-400")} />
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>Total Dock Duration: {det.totalDurationFormatted}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold",
                              det.isOverdue ? "bg-rose-500 text-white" : "bg-purple-600 text-white"
                            )}>
                              {det.isOverdue ? "Billable Detention" : "Within Free SLA"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {det.isOverdue
                              ? `Exceeded free window by ${det.billableHours} hrs. Rate: ₹${det.hourlyRate}/hr.`
                              : `Free Unloading Grace: ${det.remainingGraceFormatted} remaining of ${det.freeHours} hrs.`}
                          </div>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-[11px] text-muted-foreground uppercase font-semibold">Billable Demurrage</div>
                        <div className="text-base font-black font-mono text-foreground">
                          ₹{det.billableAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <DialogFooter className="p-4 px-6 border-t border-border/50 bg-card/95 backdrop-blur-sm shrink-0 flex items-center justify-end gap-3 z-10">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="rounded-xl px-5 h-10 text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl px-6 h-10 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
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
