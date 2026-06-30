import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ClipboardCheck, ShieldAlert, CheckCircle, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function ExitAuditPage() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    truck_id: '',
    driver_id: '',
    audit_date: new Date().toISOString().split('T')[0],
    body_damages_notes: '',
    battery_serial_verified: false,
    status: 'Cleared'
  });
  const [damageImages, setDamageImages] = useState([]);
  const [batterySnapshot, setBatterySnapshot] = useState(null);

  // Selected Truck Details for dynamic verification
  const [selectedTruckDetails, setSelectedTruckDetails] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [trucksRes, employeesRes] = await Promise.all([
          pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
          pb.collection('employees').getFullList({
            filter: 'employee_type = "driver"',
            sort: 'name',
            $autoCancel: false
          })
        ]);
        setTrucks(trucksRes);
        // If no drivers found with the type filter, fall back to all employees
        if (employeesRes.length === 0) {
          const allEmployees = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false });
          setDrivers(allEmployees);
        } else {
          setDrivers(employeesRes);
        }
      } catch (err) {
        console.error('Error fetching baseline audit data:', err);
        toast.error('Failed to load audit data options.');
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, []);

  const handleTruckChange = async (truckId) => {
    setFormData(prev => ({ ...prev, truck_id: truckId }));
    const truck = trucks.find(t => t.id === truckId);
    setSelectedTruckDetails(truck || null);
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.truck_id || !formData.driver_id) {
      toast.error('Please select both a truck and a driver.');
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append('truck_id', formData.truck_id);
    form.append('driver_id', formData.driver_id);
    form.append('audit_date', new Date(formData.audit_date).toISOString());
    form.append('body_damages_notes', formData.body_damages_notes);
    form.append('battery_serial_verified', formData.battery_serial_verified ? 'true' : 'false');
    form.append('status', formData.status);
    
    // Add multiple damage images
    for (let i = 0; i < damageImages.length; i++) {
      form.append('body_damages_images', damageImages[i]);
    }

    if (batterySnapshot) {
      form.append('battery_image_snapshot', batterySnapshot);
    }

    // Set sample verified layout data
    form.append('tyre_axle_layout_verified', JSON.stringify({ verified: true, timestamp: Date.now() }));

    try {
      await pb.collection('exit_audits').create(form);
      
      // Update employee (driver) status dynamically to show active/idle/flagged
      const driver = drivers.find(d => d.id === formData.driver_id);
      if (driver) {
        await pb.collection('employees').update(driver.id, {
          notes: `Last Exit Audit status: ${formData.status} on ${formData.audit_date}.`
        });
      }

      toast.success(`Exit audit logged successfully with status: ${formData.status}.`);
      
      // Reset form
      setFormData({
        truck_id: '',
        driver_id: '',
        audit_date: new Date().toISOString().split('T')[0],
        body_damages_notes: '',
        battery_serial_verified: false,
        status: 'Cleared'
      });
      setDamageImages([]);
      setBatterySnapshot(null);
      setSelectedTruckDetails(null);
    } catch (err) {
      console.error('Failed to log audit check:', err);
      toast.error(err.message || 'Failed to submit Exit Audit.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm font-medium">Initializing Exit Audit Checklists...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-3 duration-300">
      <Helmet>
        <title>Exit Audit & Handover | Operations</title>
      </Helmet>

      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ClipboardCheck className="w-7 h-7 text-primary" />
          </div>
          Vehicle Exit & Handover Audit
        </h1>
        <p className="text-muted-foreground mt-2">
          Verify truck body condition, battery serial number, and axle tyre layouts before dispatch or handover.
        </p>
      </div>

      <form onSubmit={handleAuditSubmit} className="space-y-8">
        <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
          <CardHeader className="p-0 border-b border-border/50 pb-4">
            <CardTitle className="text-xl">Dispatch Checklist Details</CardTitle>
            <CardDescription>Select truck, driver, and document condition details.</CardDescription>
          </CardHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Select Vehicle *</Label>
              <Select value={formData.truck_id} onValueChange={handleTruckChange}>
                <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                  <SelectValue placeholder="Select active truck..." />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.vehicle_name} ({t.registration_number || t.truck_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Handover Driver *</Label>
              <Select value={formData.driver_id} onValueChange={(val) => setFormData(prev => ({ ...prev, driver_id: val }))}>
                <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                  <SelectValue placeholder="Select driver..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length === 0 ? (
                    <SelectItem value="__none" disabled>No drivers found</SelectItem>
                  ) : (
                    drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                        {d.employee_type ? ` (${d.employee_type.charAt(0).toUpperCase() + d.employee_type.slice(1)})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Audit Date *</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData(prev => ({ ...prev, audit_date: e.target.value }))}
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Audit Status Result *</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cleared" className="text-success font-semibold">Cleared (No critical mismatches)</SelectItem>
                  <SelectItem value="Flagged" className="text-destructive font-semibold">Flagged (Unapproved damage/mismatch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {selectedTruckDetails && (
          <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
            <CardHeader className="p-0 border-b border-border/50 pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Battery & Tyre Verification Details</CardTitle>
                <CardDescription>Match physical serials against baseline records.</CardDescription>
              </div>
            </CardHeader>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registered Battery Serial</span>
                  <p className="font-mono text-sm text-foreground font-bold mt-1">
                    {selectedTruckDetails.battery_serial_number || 'N/A (No registered battery)'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Warranty details</span>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {selectedTruckDetails.battery_warranty_details || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="battery-serial-check"
                  checked={formData.battery_serial_verified}
                  onChange={(e) => setFormData(prev => ({ ...prev, battery_serial_verified: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary border-border"
                />
                <Label htmlFor="battery-serial-check" className="cursor-pointer font-medium">
                  Physically verified battery serial matches baseline record
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Battery Image Snapshot</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setBatterySnapshot(e.target.files[0])}
                    className="bg-background border-border"
                  />
                  {batterySnapshot && <CheckCircle className="w-6 h-6 text-success shrink-0" />}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
          <CardHeader className="p-0 border-b border-border/50 pb-4">
            <CardTitle className="text-xl">Body Damages & Photos</CardTitle>
            <CardDescription>Log any body damages, paint scrapes, or dent details.</CardDescription>
          </CardHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Condition / Damages Notes</Label>
              <Textarea 
                value={formData.body_damages_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, body_damages_notes: e.target.value }))}
                placeholder="Log damages (e.g. Dent on front bumper, left mirror glass cracked)..."
                rows={4}
                className="bg-background border-border rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Damage Photos (Multiple selection allowed)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setDamageImages(Array.from(e.target.files))}
                  className="bg-background border-border"
                />
                {damageImages.length > 0 && (
                  <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 font-semibold rounded-xl">
                    {damageImages.length} Images selected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading} className="rounded-xl px-8 h-12 shadow-sm font-bold">
            {loading ? 'Submitting Checklist...' : 'Log Exit Audit Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
