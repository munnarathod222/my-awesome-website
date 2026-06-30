import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar, MapPin, Route as RouteIcon, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format, addDays, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';


const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Monday', value: 1 },
  { id: 'tue', label: 'Tuesday', value: 2 },
  { id: 'wed', label: 'Wednesday', value: 3 },
  { id: 'thu', label: 'Thursday', value: 4 },
  { id: 'fri', label: 'Friday', value: 5 },
  { id: 'sat', label: 'Saturday', value: 6 },
  { id: 'sun', label: 'Sunday', value: 0 },
];

export default function AddRecurringTripModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    selected_route_id: '',
    is_round_trip: false,
    selected_second_route_id: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    driver_name: '',
    truck_number: '',
    amount: '',
    kms: '',
    second_amount: '',
    second_kms: '',
    advance_received_from_client: '',
    advance_paid_to_driver: '',
    client_payment_status: 'pending',
    trip_status: 'Pending',
    selectedDays: [1, 2, 3, 4, 5, 6, 0] // Default all days selected
  });

  const selectedRoute = routes.find(r => r.id === formData.selected_route_id);
  const selectedSecondRoute = formData.selected_second_route_id && formData.selected_second_route_id !== 'default'
    ? routes.find(r => r.id === formData.selected_second_route_id)
    : null;

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      resetForm();
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    setDataLoading(true);
    try {
      const [clientsRes, empsRes, trucksRes, routesRes] = await Promise.all([
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('employees').getFullList({ filter: 'employee_type="driver"', $autoCancel: false }),
        pb.collection('trucks').getFullList({ $autoCancel: false }),
        pb.collection('routes').getFullList({ sort: 'route_name', $autoCancel: false })
      ]);
      setClients(clientsRes);
      setEmployees(empsRes);
      setTrucks(trucksRes);
      setRoutes(routesRes);
    } catch (err) {
      console.error('Failed to load dependencies', err);
      toast.error('Failed to load form dependencies');
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      selected_route_id: '',
      is_round_trip: false,
      selected_second_route_id: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      driver_name: '',
      truck_number: '',
      amount: '',
      kms: '',
      second_amount: '',
      second_kms: '',
      advance_received_from_client: '',
      advance_paid_to_driver: '',
      client_payment_status: 'pending',
      trip_status: 'Pending',
      selectedDays: [1, 2, 3, 4, 5, 6, 0]
    });
  };

  const handleRouteSelection = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const isRoundTrip = route.is_round_trip || false;
      setFormData(prev => ({
        ...prev,
        selected_route_id: routeId,
        is_round_trip: isRoundTrip,
        amount: route.amount_per_trip?.toString() || '',
        kms: route.distance_km?.toString() || '',
        selected_second_route_id: isRoundTrip ? (prev.selected_second_route_id || 'default') : '',
        second_amount: isRoundTrip ? (prev.second_amount || route.amount_per_trip?.toString() || '') : '',
        second_kms: isRoundTrip ? (prev.second_kms || route.distance_km?.toString() || '') : ''
      }));
    }
  };

  const handleSecondRouteSelection = (routeId) => {
    if (routeId === 'default') {
      setFormData(prev => ({
        ...prev,
        selected_second_route_id: 'default',
        second_amount: '',
        second_kms: ''
      }));
      return;
    }
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setFormData(prev => ({
        ...prev,
        selected_second_route_id: routeId,
        second_amount: route.amount_per_trip?.toString() || '',
        second_kms: route.distance_km?.toString() || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selected_second_route_id: '',
        second_amount: '',
        second_kms: ''
      }));
    }
  };

  const handleDayToggle = (dayVal) => {
    setFormData(prev => {
      const isSelected = prev.selectedDays.includes(dayVal);
      const newDays = isSelected
        ? prev.selectedDays.filter(d => d !== dayVal)
        : [...prev.selectedDays, dayVal];
      return { ...prev, selectedDays: newDays };
    });
  };

  const isValid = 
    formData.client_id &&
    formData.selected_route_id &&
    formData.startDate &&
    formData.endDate &&
    formData.driver_name &&
    formData.truck_number &&
    formData.amount &&
    formData.kms &&
    (!formData.is_round_trip || (formData.second_amount && formData.second_kms)) &&
    formData.selectedDays.length > 0 &&
    new Date(formData.startDate) <= new Date(formData.endDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const daysCount = differenceInDays(end, start) + 1;
      
      const datesToGenerate = [];
      for (let i = 0; i < daysCount; i++) {
        const currentDate = addDays(start, i);
        if (formData.selectedDays.includes(currentDate.getDay())) {
          datesToGenerate.push(currentDate);
        }
      }

      if (datesToGenerate.length === 0) {
        toast.error('No valid dates fall within the selected parameters.');
        setLoading(false);
        return;
      }

      // Generate sequential trip IDs by scanning recent records for the maximum numerical ID
      const sortedByCreated = await pb.collection('trip_logs').getList(1, 100, { sort: '-created', $autoCancel: false });
      let maxNum = 0;
      for (const item of sortedByCreated.items) {
        if (item.trip_id) {
          const match = item.trip_id.match(/TRIP-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
      let startNum = maxNum > 0 ? maxNum + 1 : sortedByCreated.totalItems + 1;

      const activeUserId = currentUser?.id || pb.authStore.model?.id || '';

      let currentNum = startNum;
      const creationPromises = datesToGenerate.map(async (date) => {
        const generatedId = `TRIP-${currentNum.toString().padStart(3, '0')}`;
        currentNum++;

        // Dual-leg routing pattern logic:
        // Odd Days (of month) = Forward Leg (Up Leg route_code)
        // Even Days (of month) = Return Leg (Down Leg down_route_code, if round trip)
        const isOddDay = date.getDate() % 2 !== 0;
        
        let routeCodeToSave = selectedRoute.route_code;
        let routeIdToSave = formData.selected_route_id;
        let kmsToSave = parseFloat(formData.kms) || 0;
        let revenueToSave = parseFloat(formData.amount) || 0;

        if (formData.is_round_trip) {
          if (isOddDay) {
            routeCodeToSave = selectedRoute.route_code;
            routeIdToSave = formData.selected_route_id;
            kmsToSave = parseFloat(formData.kms) || 0;
            revenueToSave = parseFloat(formData.amount) || 0;
          } else {
            if (selectedSecondRoute) {
              routeCodeToSave = selectedSecondRoute.route_code;
              routeIdToSave = selectedSecondRoute.id;
              kmsToSave = parseFloat(formData.second_kms || formData.kms) || 0;
              revenueToSave = parseFloat(formData.second_amount || formData.amount) || 0;
            } else {
              routeCodeToSave = selectedRoute.is_round_trip ? (selectedRoute.down_route_code || selectedRoute.route_code) : selectedRoute.route_code;
              routeIdToSave = formData.selected_route_id;
              kmsToSave = parseFloat(formData.second_kms || formData.kms) || 0;
              revenueToSave = parseFloat(formData.second_amount || formData.amount) || 0;
            }
          }
        }

        const payload = {
          trip_id: generatedId,
          client_id: formData.client_id,
          route_id: routeIdToSave,
          date: format(date, 'yyyy-MM-dd'),
          route: routeCodeToSave,
          revenue: revenueToSave,
          kms: kmsToSave,
          advance_received_from_client: parseFloat(formData.advance_received_from_client) || 0,
          advance_paid_to_driver: parseFloat(formData.advance_paid_to_driver) || 0,
          client_payment_status: formData.client_payment_status,
          trip_status: formData.trip_status,
          driver_name: formData.driver_name,
          truck_number: formData.truck_number,
          created_by: activeUserId,
          user_id: activeUserId
        };

        return pb.collection('trip_logs').create(payload, { $autoCancel: false });
      });

      await Promise.all(creationPromises);
      toast.success(`Successfully generated ${datesToGenerate.length} recurring trips!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Batch generation failed:', err);
      let errorMsg = err.message;
      if (err.data && typeof err.data === 'object') {
        const details = Object.entries(err.data)
          .map(([field, detail]) => `${field}: ${detail.message || JSON.stringify(detail)}`)
          .join(', ');
        if (details) errorMsg += ` (${details})`;
      }
      toast.error('Failed to generate recurring trips: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Pre-calculate up/down details for the preview card:
  const upLegCode = selectedRoute ? selectedRoute.route_code : 'N/A';
  const upLegDistance = formData.kms || '0';
  const upLegFare = formData.amount || '0';

  let downLegCode = 'N/A';
  let downLegDistance = formData.second_kms || formData.kms || '0';
  let downLegFare = formData.second_amount || formData.amount || '0';

  if (formData.is_round_trip) {
    if (selectedSecondRoute) {
      downLegCode = selectedSecondRoute.route_code;
    } else if (selectedRoute) {
      downLegCode = selectedRoute.is_round_trip ? (selectedRoute.down_route_code || selectedRoute.route_code) : selectedRoute.route_code;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border/50 shadow-lg rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/10">
          <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-2">
            <RouteIcon className="w-6 h-6 text-primary" />
            Add Recurring Trips
          </DialogTitle>
          <DialogDescription>
            Schedule recurring trips across a date range and assign client routes automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column: Form Controls */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Client & Route Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-primary border-b pb-1">Route & Client</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client / Company <span className="text-destructive">*</span></Label>
                    <Select value={formData.client_id} onValueChange={val => setFormData({ ...formData, client_id: val })} disabled={dataLoading}>
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue placeholder={dataLoading ? "Loading..." : "Select a client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.client_name || c.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Saved Route <span className="text-destructive">*</span></Label>
                    <Select value={formData.selected_route_id} onValueChange={handleRouteSelection} disabled={dataLoading}>
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue placeholder={dataLoading ? "Loading..." : "Select route template"} />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.route_name} ({r.route_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="is_round_trip" 
                        checked={formData.is_round_trip} 
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          is_round_trip: !!checked,
                          selected_second_route_id: checked ? (prev.selected_second_route_id || 'default') : '',
                          second_amount: checked ? (prev.second_amount || prev.amount) : '',
                          second_kms: checked ? (prev.second_kms || prev.kms) : ''
                        }))}
                      />
                      <Label htmlFor="is_round_trip" className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        Configure as Round-Trip (Alternating Legs)
                      </Label>
                    </div>
                  </div>
                </div>

                {formData.is_round_trip && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-2 col-start-2">
                      <Label>Select Return Route (2nd Leg)</Label>
                      <Select value={formData.selected_second_route_id} onValueChange={handleSecondRouteSelection} disabled={dataLoading}>
                        <SelectTrigger className="rounded-xl bg-background">
                          <SelectValue placeholder="Use template default / Select return route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Use Template Default (or Forward Route)</SelectItem>
                          {routes.map(r => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.route_name} ({r.route_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Scheduler & Days */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-primary border-b pb-1">Date & Recurrence Pattern</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date <span className="text-destructive">*</span></Label>
                    <Input 
                      type="date" 
                      required 
                      className="rounded-xl bg-background" 
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date <span className="text-destructive">*</span></Label>
                    <Input 
                      type="date" 
                      required 
                      className="rounded-xl bg-background" 
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recurrence Days <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DAYS_OF_WEEK.map(day => {
                      const isChecked = formData.selectedDays.includes(day.value);
                      return (
                        <Button
                          key={day.id}
                          type="button"
                          variant={isChecked ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs font-semibold px-4 h-9 shadow-sm"
                          onClick={() => handleDayToggle(day.value)}
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fleet & Staff details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-primary border-b pb-1">Fleet & Driver Assignments</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Driver <span className="text-destructive">*</span></Label>
                    <Select value={formData.driver_name} onValueChange={v => setFormData({ ...formData, driver_name: v })} disabled={dataLoading}>
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Truck <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.truck_number} 
                      onValueChange={v => {
                        const selectedTruck = trucks.find(t => t.truck_number === v);
                        const pairedDriver = employees.find(e => e.assigned_truck === selectedTruck?.id);
                        setFormData(prev => ({
                          ...prev,
                          truck_number: v,
                          driver_name: pairedDriver ? pairedDriver.name : prev.driver_name
                        }));
                      }} 
                      disabled={dataLoading}
                    >
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks.map(t => <SelectItem key={t.id} value={t.truck_number}>{t.truck_number}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Inputs */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-primary border-b pb-1">Financial Parameters</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{formData.is_round_trip ? "Revenue Per Forward Leg (₹)" : "Revenue Per Leg (₹)"} <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number" 
                      required 
                      min="0" 
                      step="0.01" 
                      className="rounded-xl bg-background" 
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.is_round_trip ? "Distance Per Forward Leg (KM)" : "Distance Per Leg (KM)"} <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number" 
                      required 
                      min="0" 
                      step="0.1" 
                      className="rounded-xl bg-background" 
                      value={formData.kms}
                      onChange={e => setFormData({ ...formData, kms: e.target.value })}
                    />
                  </div>

                  {formData.is_round_trip && (
                    <>
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <Label>Revenue Per Return Leg (₹) <span className="text-destructive">*</span></Label>
                        <Input 
                          type="number" 
                          required 
                          min="0" 
                          step="0.01" 
                          className="rounded-xl bg-background" 
                          value={formData.second_amount}
                          onChange={e => setFormData({ ...formData, second_amount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <Label>Distance Per Return Leg (KM) <span className="text-destructive">*</span></Label>
                        <Input 
                          type="number" 
                          required 
                          min="0" 
                          step="0.1" 
                          className="rounded-xl bg-background" 
                          value={formData.second_kms}
                          onChange={e => setFormData({ ...formData, second_kms: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Driver Advance Per Leg (₹)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="rounded-xl bg-background" 
                      value={formData.advance_paid_to_driver}
                      onChange={e => setFormData({ ...formData, advance_paid_to_driver: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Advance Per Leg (₹)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="rounded-xl bg-background" 
                      value={formData.advance_received_from_client}
                      onChange={e => setFormData({ ...formData, advance_received_from_client: e.target.value })}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Route Parameters Summary Card */}
            <div className="space-y-6">
              <Card className="rounded-2xl border border-border/50 bg-secondary/5 p-5 shadow-inner">
                <h4 className="font-heading font-bold text-sm border-b pb-2 mb-4">Route Autofill Details</h4>
                {selectedRoute ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Primary Template</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedRoute.route_name}</p>
                      {formData.is_round_trip && selectedSecondRoute && (
                        <>
                          <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mt-2">Return Template</p>
                          <p className="font-semibold text-foreground mt-0.5">{selectedSecondRoute.route_name}</p>
                        </>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Leg Pattern & Waypoints</p>
                      <div className="mt-1.5 p-3 rounded-xl bg-background border border-border/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">Odd Days (Up Leg):</span>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{upLegCode}</span>
                        </div>
                        {formData.is_round_trip ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">Even Days (Down Leg):</span>
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{downLegCode}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">Even Days (Down Leg):</span>
                            <span className="text-muted-foreground italic">N/A (Single Leg)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Forward Leg Parameters</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Distance:</span> <strong className="text-foreground">{upLegDistance} KM</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fare:</span> <strong className="text-foreground">₹{parseFloat(upLegFare || 0).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>

                    {formData.is_round_trip && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Return Leg Parameters</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Distance:</span> <strong className="text-foreground">{downLegDistance} KM</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fare:</span> <strong className="text-foreground">₹{parseFloat(downLegFare || 0).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.is_round_trip && (
                      <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>This configuration alternates legs based on Odd vs Even dates.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground italic flex flex-col items-center gap-2">
                    <MapPin className="w-8 h-8 opacity-40 animate-pulse" />
                    <span>Select a route template on the left to see autofilled contract values.</span>
                  </div>
                )}
              </Card>
            </div>

          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading || !isValid} className="rounded-xl min-w-32 shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Generate Trips'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
