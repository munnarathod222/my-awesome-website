import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { calculateClientMetrics } from '@/lib/clientPaymentUtils.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { TRIP_STATUS_OPTIONS } from '@/lib/tripStatusUtils.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { filterActiveDrivers } from '@/lib/driverUtils.js';
import { calculateMunsiyana } from '@/lib/munsiyanaCalculator.js';
import DispatchComplianceSection from '@/components/DispatchComplianceSection.jsx';
import { cn } from '@/lib/utils.js';


const AddTripModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [generatedTripId, setGeneratedTripId] = useState('');
  
  const [clientMetrics, setClientMetrics] = useState(null);
  const [selectedClientInfo, setSelectedClientInfo] = useState(null);
  const [allowMultipleTrips, setAllowMultipleTrips] = useState(false);
  const [assignedTrucks, setAssignedTrucks] = useState({});
  const [clientEligibilityMap, setClientEligibilityMap] = useState({});


  const [formData, setFormData] = useState({
    client_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    selected_route_id: 'custom',
    route: '',
    description: '',
    amount: '',
    kms: '',
    advance_received_from_client: '',
    advance_paid_to_driver: '',
    client_payment_status: 'pending',
    trip_status: 'Upcoming',
    driver_employee_id: '',
    driver_employee_code: '',
    driver_name: '',
    truck_number: '',
    vendor_payout: '',
    payment_model: 'Model2',
    toll_deduction: '',
    fuel_advance_deduction: '',
    lr_number: '',
    lr_file: null,
    lr_file_url: '',
    lr_file_name: '',
    lr_file_meta: null,
    invoice_number: '',
    invoice_value: '',
    invoice_file: null,
    invoice_file_url: '',
    invoice_file_name: '',
    invoice_file_meta: null,
    eway_bill_number: '',
    eway_expiry_date: '',
    eway_bill_file: null,
    eway_bill_file_url: '',
    eway_bill_file_name: '',
    eway_bill_file_meta: null,
    delivery_deadline: '',
    is_sealed: false,
    seal_numbers: [''],
    seal_number: '',
    seal_photo_url: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      resetForm();
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    setDataLoading(true);
    try {
      const [clientsRes, empsRes, trucksRes, routesRes, latestTrip] = await Promise.all([
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }).catch(() => []),
        pb.collection('employees').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('routes').getFullList({ sort: 'route_name', $autoCancel: false }).catch(() => []),
        pb.collection('trip_logs').getList(1, 1, { sort: '-created', $autoCancel: false }).catch(() => ({ totalItems: 0 }))
      ]);

      let localDrivers = [];
      try {
        const raw = localStorage.getItem('jbc_driver_applications');
        if (raw) {
          const parsed = JSON.parse(raw);
          localDrivers = parsed
            .map(a => ({
              id: a.id,
              name: a.full_name || a.name,
              status: a.status,
              active_status: a.active_status,
              employment_status: a.employment_status,
              employee_type: 'driver'
            }));
        }
      } catch (e) {}

      const merged = [...empsRes, ...localDrivers];
      const activeDrivers = filterActiveDrivers(merged);

      // Deduplicate drivers by name
      const uniqueDriversMap = new Map();
      activeDrivers.forEach(d => {
        if (d && d.name && !uniqueDriversMap.has(d.name.trim().toLowerCase())) {
          uniqueDriversMap.set(d.name.trim().toLowerCase(), d);
        }
      });

      setClients(clientsRes);
      setEmployees(Array.from(uniqueDriversMap.values()));
      setTrucks(trucksRes);
      setRoutes(routesRes);

      // Scan ALL trip_ids to find the true maximum \u2014 scanning only recent
      // records would miss the highest number if trips were created out of order.
      try {
        const allTripIds = await pb.collection('trip_logs').getFullList({
          fields: 'trip_id',
          $autoCancel: false
        });
        let maxNum = 0;
        for (const item of allTripIds) {
          if (item.trip_id) {
            const match = item.trip_id.match(/TRIP-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        }
        const nextNum = maxNum + 1;
        setGeneratedTripId(`TRIP-${nextNum.toString().padStart(3, '0')}`);
      } catch (idErr) {
        setGeneratedTripId(`TRIP-${(latestTrip.totalItems + 1).toString().padStart(3, '0')}`);
      }
    } catch (err) {
      console.error('Failed to load dependencies', err);
      toast.error('Failed to load form data');
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    let prefillId = '';
    try {
      prefillId = sessionStorage.getItem('jbc_quick_book_client_id') || '';
      if (prefillId) sessionStorage.removeItem('jbc_quick_book_client_id');
    } catch (e) {}

    setFormData({
      client_id: prefillId || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      selected_route_id: 'custom',
      route: '',
      description: '',
      amount: '',
      kms: '',
      advance_received_from_client: '',
      advance_paid_to_driver: '',
      client_payment_status: 'pending',
      trip_status: 'Upcoming',
      driver_employee_id: '',
      driver_employee_code: '',
      driver_name: '',
      truck_number: '',
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
      lr_file: null,
      lr_file_url: '',
      lr_file_name: '',
      lr_file_meta: null,
      invoice_number: '',
      invoice_value: '',
      invoice_file: null,
      invoice_file_url: '',
      invoice_file_name: '',
      invoice_file_meta: null,
      eway_bill_number: '',
      eway_expiry_date: '',
      eway_bill_file: null,
      eway_bill_file_url: '',
      eway_bill_file_name: '',
      eway_bill_file_meta: null,
      delivery_deadline: '',
      is_sealed: false,
      seal_numbers: [''],
      seal_number: '',
      seal_photo_url: ''
    });
    setClientMetrics(null);
    setSelectedClientInfo(null);
    setAllowMultipleTrips(false);
    setAssignedTrucks({});
  };

  const fetchTruckAvailability = async (dateStr) => {
    if (!dateStr) return;
    try {
      const response = await apiServerClient.fetch(`/api/trucks/availability?date=${dateStr}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.counts) {
          setAssignedTrucks(result.counts);
        } else {
          setAssignedTrucks({});
        }
      } else {
        setAssignedTrucks({});
      }
    } catch (err) {
      console.error('Failed to fetch truck availability:', err);
      setAssignedTrucks({});
    }
  };

  useEffect(() => {
    if (isOpen && formData.date) {
      fetchTruckAvailability(formData.date);
    }
  }, [formData.date, isOpen]);


  const handleClientChange = async (clientId) => {
    setFormData({ ...formData, client_id: clientId });
    if (!clientId) {
      setClientMetrics(null);
      setSelectedClientInfo(null);
      setClientEligibilityMap({});
      return;
    }

    pb.collection('customer_vehicle_eligibility').getFullList({
      filter: `client_id = "${clientId}"`,
      $autoCancel: false
    }).then(records => {
      const elMap = {};
      records.forEach(r => {
        if (r.truck_id) elMap[r.truck_id] = r;
        if (r.truck_number) elMap[r.truck_number] = r;
      });
      setClientEligibilityMap(elMap);
    }).catch(() => setClientEligibilityMap({}));

    const clientInfo = clients.find(c => c.id === clientId);
    setSelectedClientInfo(clientInfo);

    if (clientInfo?.munsiyana_applicable) {
      const autoMun = calculateMunsiyana(clientInfo, formData.amount);
      if (autoMun > 0) {
        setFormData(prev => ({ ...prev, client_id: clientId, munsiyana: autoMun.toString() }));
      }
    }

    try {
      const logs = await pb.collection('trip_logs').getFullList({
        filter: `client_id = "${clientId}"`,
        $autoCancel: false
      });
      const metrics = calculateClientMetrics(clientId, logs);
      setClientMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch client trips', err);
    }
  };

  const handleRouteSelection = (routeId) => {
    if (routeId === 'custom') {
      setFormData(prev => ({
        ...prev,
        selected_route_id: 'custom',
        route: '',
        amount: '',
        kms: ''
      }));
      return;
    }

    const selectedRoute = routes.find(r => r.id === routeId);
    if (selectedRoute) {
      setFormData(prev => ({
        ...prev,
        selected_route_id: routeId,
        route: selectedRoute.route_code,
        amount: selectedRoute.amount_per_trip?.toString() || '',
        kms: selectedRoute.distance_km?.toString() || ''
      }));
    }
  };

  const hasTruckConflict = formData.truck_number && (assignedTrucks[formData.truck_number] > 0) && !allowMultipleTrips;

  const selectedTruckObj = trucks.find(t => t.truck_number === formData.truck_number);
  const ownershipType = selectedTruckObj?.ownership_type || 'Owned';
  const isAttachedFamily = ownershipType === 'AttachedFamily';
  const isAttached = ownershipType === 'Attached';

  const isValid = 
    formData.client_id && 
    formData.date && 
    formData.route && 
    formData.amount && 
    formData.driver_name && 
    formData.truck_number && 
    !hasTruckConflict &&
    generatedTripId &&
    Number(formData.amount) >= 0 &&
    (isAttached 
      ? (formData.payment_model === 'Model3' || (formData.vendor_payout !== '' && Number(formData.vendor_payout) >= 0))
      : (formData.advance_paid_to_driver === '' || Number(formData.advance_paid_to_driver) >= 0)
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const grossRev = parseFloat(formData.amount) || 0;
      const driverAdv = parseFloat(formData.advance_paid_to_driver) || 0;
      const tollDed = parseFloat(formData.toll_deduction) || 0;
      const familyNetSettlement = Math.max(0, grossRev - driverAdv - tollDed);

      const payload = {
        trip_id: generatedTripId,
        client_id: formData.client_id,
        date: formData.date,
        route: formData.route,
        cycle: formData.description || '',
        revenue: grossRev,
        kms: parseFloat(formData.kms) || 0,
        advance_received_from_client: parseFloat(formData.advance_received_from_client) || 0,
        advance_paid_to_driver: isAttached ? 0 : driverAdv,
        toll_deduction: tollDed,
        client_payment_status: formData.client_payment_status,
        trip_status: formData.trip_status,
        driver_employee_id: formData.driver_employee_id || null,
        driver_employee_code: formData.driver_employee_code || null,
        driver_name: formData.driver_name,
        truck_number: formData.truck_number,
        created_by: currentUser?.id,
        user_id: currentUser?.id,
        ownership_type: isAttachedFamily ? 'AttachedFamily' : (isAttached ? 'Attached' : 'Owned'),
        payment_model: isAttachedFamily ? 'ModelFamilySettlement' : (isAttached ? formData.payment_model : 'Model1'),
        vendor_payout: isAttachedFamily
          ? familyNetSettlement
          : (isAttached 
              ? (formData.payment_model === 'Model3' ? Math.max(0, grossRev - 500) : (parseFloat(formData.vendor_payout) || 0))
              : 0),
        brokerage_margin: isAttachedFamily
          ? 0
          : (isAttached
              ? (formData.payment_model === 'Model3' ? 500 : grossRev - (parseFloat(formData.vendor_payout) || 0))
              : 0),
        subcontractor_settlement_status: isAttachedFamily ? 'Pending' : (isAttached ? 'Pending' : ''),
        loading_charges: parseFloat(formData.loading_charges) || 0,
        loading_paid_by: formData.loading_paid_by || 'client',
        unloading_charges: parseFloat(formData.unloading_charges) || 0,
        unloading_paid_by: formData.unloading_paid_by || 'client',
        broker_commission: parseFloat(formData.broker_commission) || 0,
        munsiyana: parseFloat(formData.munsiyana) || 0,
        lr_number: formData.lr_number || '',
        lr_file_url: formData.lr_file_url || '',
        invoice_number: formData.invoice_number || '',
        invoice_value: parseFloat(formData.invoice_value) || 0,
        invoice_file_url: formData.invoice_file_url || '',
        eway_bill_number: formData.eway_bill_number || '',
        eway_expiry_date: formData.eway_expiry_date || '',
        eway_bill_file_url: formData.eway_bill_file_url || '',
        delivery_deadline: formData.delivery_deadline || '',
        is_sealed: Boolean(formData.is_sealed),
        seal_number: Array.isArray(formData.seal_numbers) 
          ? formData.seal_numbers.filter(Boolean).map(s => s.trim()).join(', ') 
          : (formData.seal_number || ''),
        seal_numbers: Array.isArray(formData.seal_numbers) 
          ? formData.seal_numbers.filter(Boolean).map(s => s.trim()) 
          : (formData.seal_number ? [formData.seal_number.trim()] : []),
        seal_photo_url: formData.seal_photo_url || ''
      };

      await pb.collection('trip_logs').create(payload, { $autoCancel: false });
      toast.success('Trip log successfully added');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to add trip log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-5xl h-[88vh] max-h-[88vh] p-0 flex flex-col overflow-hidden bg-background rounded-3xl">
        <DialogHeader className="p-4 pb-3 border-b border-border/50 bg-secondary/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Add New Trip</DialogTitle>
              <DialogDescription className="text-xs">Record a new shipment, route details, and assigned advances.</DialogDescription>
            </div>
            {generatedTripId && (
              <div className="bg-background px-3 py-1 rounded-lg border border-border/50 shadow-sm text-center">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Trip ID</p>
                <p className="text-xs font-mono font-bold text-primary">{generatedTripId}</p>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-6 min-h-0">
          
          <form id="add-trip-form" onSubmit={handleSubmit} className="flex-1 space-y-5">
            
            {/* Trip Details Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base border-b pb-1">Trip Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Client / Company <span className="text-destructive">*</span></Label>
                  <Select value={formData.client_id} onValueChange={handleClientChange} disabled={dataLoading}>
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder={dataLoading ? "Loading clients..." : "Select a client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.client_name || c.company_name} {c.company_name && c.company_name !== c.client_name ? `(${c.company_name})` : ''} {c.client_type?.includes('Broker') ? ' [🤝 Broker]' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Trip Date <span className="text-destructive">*</span></Label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    required 
                    className="bg-background h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Route Master Template</Label>
                  <Select value={formData.selected_route_id} onValueChange={handleRouteSelection} disabled={dataLoading}>
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder={dataLoading ? "Loading routes..." : "Select route template"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom" className="font-medium text-primary text-xs">-- Custom Route --</SelectItem>
                      {routes.map(r => (
                        <SelectItem key={r.id} value={r.id} className="text-xs">
                          {r.route_name} {r.is_round_trip ? '(Round-Trip)' : `(${r.route_code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Leg Selector for Round-Trip Route Templates */}
                  {(() => {
                    const selectedRouteTemplate = routes.find(r => r.id === formData.selected_route_id);
                    if (!selectedRouteTemplate?.is_round_trip) return null;
                    return (
                      <div className="space-y-1 mt-1.5 p-1.5 bg-secondary/10 rounded-lg border border-border/40 animate-in fade-in duration-300">
                        <Label className="text-[10px] font-semibold text-primary">Select Leg</Label>
                        <div className="flex gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={formData.route === selectedRouteTemplate.route_code ? "default" : "outline"}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                route: selectedRouteTemplate.route_code,
                                amount: selectedRouteTemplate.amount_per_trip?.toString() || '',
                                kms: selectedRouteTemplate.distance_km?.toString() || ''
                              }));
                            }}
                            className="flex-1 text-[10px] h-7 px-1.5"
                          >
                            Up Leg ({selectedRouteTemplate.route_code})
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={formData.route === selectedRouteTemplate.down_route_code ? "default" : "outline"}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                route: selectedRouteTemplate.down_route_code,
                                amount: selectedRouteTemplate.amount_per_trip?.toString() || '',
                                kms: selectedRouteTemplate.distance_km?.toString() || ''
                              }));
                            }}
                            className="flex-1 text-[10px] h-7 px-1.5"
                          >
                            Down Leg ({selectedRouteTemplate.down_route_code})
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Route Entry <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Route string or code" 
                    value={formData.route} 
                    onChange={e => setFormData({...formData, route: e.target.value})} 
                    required 
                    className="bg-background h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Driver <span className="text-destructive">*</span></Label>
                  <Select 
                    value={formData.driver_employee_code || (formData.driver_name?.startsWith('Temporary Driver') ? 'TEMPORARY' : '')} 
                    onValueChange={v => {
                      if (v === 'TEMPORARY') {
                        setFormData(prev => ({ ...prev, driver_employee_code: '', driver_employee_id: '', driver_name: 'Temporary Driver' }));
                      } else {
                        const emp = employees.find(e => (e.employee_code && e.employee_code === v) || e.id === v);
                        if (emp) {
                          setFormData(prev => ({
                            ...prev,
                            driver_employee_code: emp.employee_code || '',
                            driver_employee_id: emp.id,
                            driver_name: emp.name
                          }));
                        }
                      }
                    }} 
                    disabled={dataLoading}
                  >
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder="Select driver by permanent code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEMPORARY" className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
                        ⚡ Temporary Driver (No mobile access)
                      </SelectItem>
                      {employees.map(e => (
                        <SelectItem key={e.id} value={e.employee_code || e.id} className="text-xs">
                          {e.employee_code ? `${e.employee_code} — ${e.name}` : `${e.name} (Code not assigned)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.driver_name?.startsWith('Temporary Driver') && (
                    <Input
                      placeholder="Custom Temp Name (Optional)"
                      value={formData.driver_name === 'Temporary Driver' ? '' : formData.driver_name}
                      onChange={e => setFormData({ ...formData, driver_name: e.target.value ? e.target.value : 'Temporary Driver' })}
                      className="text-[11px] h-7 mt-1 bg-amber-500/5 border-amber-500/30"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Truck <span className="text-destructive">*</span></Label>
                  <Select 
                    value={formData.truck_number} 
                    onValueChange={v => {
                      const selectedTruck = trucks.find(t => t.truck_number === v);
                      // Preselect ONLY explicit employee relation with permanent code; never infer from names
                      const pairedDriver = employees.find(e => e.assigned_truck === selectedTruck?.id && e.employee_code && /^[DE]\d{3,}$/.test(e.employee_code));
                      setFormData(prev => ({
                        ...prev,
                        truck_number: v,
                        ...(pairedDriver ? {
                          driver_employee_code: pairedDriver.employee_code,
                          driver_employee_id: pairedDriver.id,
                          driver_name: pairedDriver.name
                        } : {})
                      }));
                    }} 
                    disabled={dataLoading}
                  >
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {trucks.map(t => {
                        const count = assignedTrucks[t.truck_number] || 0;
                        const isBooked = count > 0;
                        const isDisabled = isBooked && !allowMultipleTrips;
                        return (
                          <SelectItem key={t.id} value={t.truck_number} disabled={isDisabled} className="text-xs">
                            <span className="flex items-center justify-between w-full">
                              <span>{t.truck_number}</span>
                              {isBooked && (
                                <span className="ml-2 text-[9px] bg-secondary/80 px-1.5 py-0.5 rounded font-normal text-muted-foreground">
                                  ({count} {count === 1 ? 'trip' : 'trips'} today)
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2 mt-1.5 select-none">
                    <Switch
                      id="allow-multiple-trips"
                      checked={allowMultipleTrips}
                      onCheckedChange={setAllowMultipleTrips}
                      className="scale-90"
                    />
                    <Label htmlFor="allow-multiple-trips" className="text-[10px] font-normal text-muted-foreground cursor-pointer">
                      Allow Multiple Trips Today (Short-Haul Loop)
                    </Label>
                  </div>

                  {hasTruckConflict && (
                    <p className="text-[10px] text-destructive mt-0.5">
                      This truck is already assigned to a trip on this date.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs">Trip Description / Notes</Label>
                <Input 
                  placeholder="Optional notes or details" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="bg-background h-9 text-xs"
                />
              </div>
            </div>

            {/* Advance & Financial Details Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base border-b pb-1">Financials & Status</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Total Revenue (₹) <span className="text-destructive">*</span></Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.amount} 
                    onChange={e => {
                      const newAmt = e.target.value;
                      let newMun = formData.munsiyana;
                      if (selectedClientInfo?.munsiyana_applicable) {
                        const calculated = calculateMunsiyana(selectedClientInfo, newAmt);
                        newMun = calculated > 0 ? calculated.toString() : '';
                      }
                      setFormData(prev => ({ ...prev, amount: newAmt, munsiyana: newMun }));
                    }} 
                    required 
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Distance (KM)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    placeholder="0.0" 
                    value={formData.kms} 
                    onChange={e => setFormData({...formData, kms: e.target.value})} 
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Toll Deduction (₹)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.toll_deduction} 
                    onChange={e => setFormData({...formData, toll_deduction: e.target.value})} 
                    className="bg-background h-9 text-xs"
                  />
                </div>
              </div>

              {ownershipType === 'AttachedFamily' ? (
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤝</span>
                      <span className="text-xs font-bold text-foreground">
                        Family Attached Net Settlement ({selectedTruckObj?.owner_name || 'Family Owner'})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold border border-emerald-500/30 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      0% Pass-Through
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Advance from Client (₹)</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={formData.advance_received_from_client} 
                        onChange={e => setFormData({...formData, advance_received_from_client: e.target.value})} 
                        className="bg-background h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Driver Advance (Paid by Company) (₹)</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={formData.advance_paid_to_driver} 
                        onChange={e => setFormData({...formData, advance_paid_to_driver: e.target.value})} 
                        className="bg-background h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Real-time settlement breakdown */}
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/60 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Gross Freight Billed:</span>
                      <span className="text-foreground font-semibold">₹{(parseFloat(formData.amount) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-500/90 text-[11px]">
                      <span>Less Trip Driver Advance:</span>
                      <span>-₹{(parseFloat(formData.advance_paid_to_driver) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-500/90 text-[11px]">
                      <span>Less Toll Deduction:</span>
                      <span>-₹{(parseFloat(formData.toll_deduction) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-1 border-t border-border flex justify-between font-bold text-xs">
                      <span className="text-foreground">Est. Trip Owner Net Payout:</span>
                      <span className="text-emerald-500 font-extrabold text-sm">
                        ₹{Math.max(0, (parseFloat(formData.amount) || 0) - (parseFloat(formData.advance_paid_to_driver) || 0) - (parseFloat(formData.toll_deduction) || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    * Company pays operating expenses upfront. Net surplus is paid to owner upon client billing and excluded from company profit.
                  </p>
                </div>
              ) : ownershipType === 'Attached' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3 rounded-xl border border-blue-900/35 bg-blue-950/10 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Brokerage Payment Model</Label>
                    <Select 
                      value={formData.payment_model} 
                      onValueChange={v => setFormData(prev => ({ 
                        ...prev, 
                        payment_model: v,
                        vendor_payout: v === 'Model3' ? Math.max(0, (parseFloat(prev.amount) || 0) - 500).toString() : prev.vendor_payout
                      }))}
                    >
                      <SelectTrigger className="bg-background h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Model2" className="text-xs">Margin Based (Model 2)</SelectItem>
                        <SelectItem value="Model3" className="text-xs">Flat Fee ₹500 (Model 3)</SelectItem>
                        <SelectItem value="Contract" className="text-xs">Fixed Contract Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Agreed Vendor Payout (₹)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.payment_model === 'Model3' ? Math.max(0, (parseFloat(formData.amount) || 0) - 500).toString() : formData.vendor_payout} 
                      onChange={e => setFormData({...formData, vendor_payout: e.target.value})} 
                      readOnly={formData.payment_model === 'Model3'}
                      className={formData.payment_model === 'Model3' ? "bg-muted h-9 text-xs" : "bg-background h-9 text-xs"}
                    />
                    {formData.amount && (
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Est. Brokerage Margin: <span className="font-bold text-emerald-400">
                          ₹{formData.payment_model === 'Model3' ? '500' : (parseFloat(formData.amount) || 0) - (parseFloat(formData.vendor_payout) || 0)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Advance from Client (₹)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.advance_received_from_client} 
                      onChange={e => setFormData({...formData, advance_received_from_client: e.target.value})} 
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Advance to Driver (₹)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.advance_paid_to_driver} 
                      onChange={e => setFormData({...formData, advance_paid_to_driver: e.target.value})} 
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Dispatch Compliance & Delivery SLA Tracker */}
              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-indigo-500/30 animate-in fade-in">
                <DispatchComplianceSection formData={formData} setFormData={setFormData} />
              </div>

              {/* Operational Charges, Commissions & Deductions Section */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-secondary/15 border border-border/70 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Charges, Commissions & Deductions</h4>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">Loading • Unloading • Broker • Munsiyana</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Loading Charges */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/70 border border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Loading Charges (₹)</Label>
                      <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, loading_paid_by: 'client' }))}
                          className={cn(
                            "px-2 py-0.5 rounded font-medium transition-all",
                            formData.loading_paid_by === 'client' 
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Bill Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, loading_paid_by: 'company' }))}
                          className={cn(
                            "px-2 py-0.5 rounded font-medium transition-all",
                            formData.loading_paid_by === 'company' 
                              ? "bg-amber-600 text-white shadow-xs font-semibold" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Company Paid
                        </button>
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.loading_charges}
                      onChange={e => setFormData({ ...formData, loading_charges: e.target.value })}
                      className="bg-background h-8 text-xs font-medium"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      {formData.loading_paid_by === 'client' ? '+ Added to client invoice/receivable' : '- Deducted as company expense'}
                    </span>
                  </div>

                  {/* Unloading Charges */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/70 border border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Unloading Charges (₹)</Label>
                      <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, unloading_paid_by: 'client' }))}
                          className={cn(
                            "px-2 py-0.5 rounded font-medium transition-all",
                            formData.unloading_paid_by === 'client' 
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Bill Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, unloading_paid_by: 'company' }))}
                          className={cn(
                            "px-2 py-0.5 rounded font-medium transition-all",
                            formData.unloading_paid_by === 'company' 
                              ? "bg-amber-600 text-white shadow-xs font-semibold" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Company Paid
                        </button>
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.unloading_charges}
                      onChange={e => setFormData({ ...formData, unloading_charges: e.target.value })}
                      className="bg-background h-8 text-xs font-medium"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      {formData.unloading_paid_by === 'client' ? '+ Added to client invoice/receivable' : '- Deducted as company expense'}
                    </span>
                  </div>

                  {/* Broker Commission */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/70 border border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Broker Commission (₹)</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">Direct Brokerage</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.broker_commission}
                      onChange={e => setFormData({ ...formData, broker_commission: e.target.value })}
                      className="bg-background h-8 text-xs font-medium"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Direct commission fee payable to broker
                    </span>
                  </div>

                  {/* Munsiyana Deduction */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/70 border border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Munsiyana (₹)</Label>
                      {selectedClientInfo?.munsiyana_applicable && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                          {selectedClientInfo.munsiyana_type === 'flat' ? 'Flat' : (selectedClientInfo.munsiyana_category || 'Corporate')}
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.munsiyana}
                      onChange={e => setFormData({ ...formData, munsiyana: e.target.value })}
                      className="bg-background h-8 text-xs font-medium"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Fee deducted from client balance payout
                    </span>
                  </div>
                </div>

                {/* Live Real-time Breakdown */}
                {(Number(formData.loading_charges) > 0 || Number(formData.unloading_charges) > 0 || Number(formData.broker_commission) > 0 || Number(formData.munsiyana) > 0) && (
                  <div className="p-2.5 rounded-xl bg-background/90 border border-border/60 text-xs flex flex-wrap gap-x-4 gap-y-1 items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Adjusted Client Receivable:</span>
                      <span className="font-bold text-primary">
                        ₹{(
                          (parseFloat(formData.amount) || 0) +
                          (formData.loading_paid_by === 'client' ? (parseFloat(formData.loading_charges) || 0) : 0) +
                          (formData.unloading_paid_by === 'client' ? (parseFloat(formData.unloading_charges) || 0) : 0) -
                          (parseFloat(formData.munsiyana) || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {(Number(formData.broker_commission) > 0 || formData.loading_paid_by === 'company' || formData.unloading_paid_by === 'company') && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Company Operational Extra:</span>
                        <span className="font-bold text-rose-500">
                          ₹{(
                            (formData.loading_paid_by === 'company' ? (parseFloat(formData.loading_charges) || 0) : 0) +
                            (formData.unloading_paid_by === 'company' ? (parseFloat(formData.unloading_charges) || 0) : 0) +
                            (parseFloat(formData.broker_commission) || 0)
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Status <span className="text-destructive">*</span></Label>
                  <Select value={formData.client_payment_status} onValueChange={v => setFormData({...formData, client_payment_status: v})}>
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder="Select Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                      <SelectItem value="received" className="text-xs">Received / Paid</SelectItem>
                      <SelectItem value="delayed" className="text-xs">Delayed</SelectItem>
                      <SelectItem value="blank" className="text-xs">Blank / Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Trip Status <span className="text-destructive">*</span></Label>
                  <Select value={formData.trip_status} onValueChange={v => setFormData({...formData, trip_status: v})}>
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue placeholder="Select Trip Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIP_STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
          </form>

          {/* Client Summary Sidebar */}
          <div className="w-full lg:w-72 bg-muted/40 rounded-xl p-5 border border-border flex flex-col gap-6">
            <h3 className="font-semibold text-lg border-b pb-2">Client Overview</h3>
            
            {selectedClientInfo ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Client Name</p>
                  <p className="font-medium">{selectedClientInfo.client_name}</p>
                </div>
                {selectedClientInfo.company_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="font-medium text-sm">{selectedClientInfo.company_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm">{selectedClientInfo.phone}</p>
                  <p className="text-sm truncate">{selectedClientInfo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Select a client to view details.</p>
            )}

            {clientMetrics && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="font-medium text-sm mb-2 text-foreground">Payment Summary</h4>
                <div className="bg-background border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" /> Total
                  </div>
                  <span className="font-semibold amount-display text-sm">{formatCurrency(clientMetrics.totalInvoiced)}</span>
                </div>
                <div className="bg-background border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" /> Received
                  </div>
                  <span className="font-semibold amount-display text-sm text-success">{formatCurrency(clientMetrics.totalReceived)}</span>
                </div>
                <div className="bg-background border rounded-lg p-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <Clock className="w-4 h-4" /> Pending
                    </div>
                    <span className="font-bold amount-display text-destructive">{formatCurrency(clientMetrics.totalPending)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-destructive h-full" style={{ width: `${clientMetrics.pendingPct}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        <DialogFooter className="p-6 border-t border-border/50 bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
          <Button type="submit" form="add-trip-form" disabled={loading || !isValid} className="min-w-32 rounded-xl shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTripModal;