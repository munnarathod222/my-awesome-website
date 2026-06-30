import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function AssignTripModal({ isOpen, onClose, vehicleId, vehicleName }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [generatedTripId, setGeneratedTripId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');

  const [formData, setFormData] = useState({
    route: '',
    driver_name: '',
    kms: '',
    revenue: '',
    client_id: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        route: '',
        driver_name: '',
        kms: '',
        revenue: '',
        client_id: '',
        notes: ''
      });
      setGeneratedTripId('');
      setSelectedRouteId('');
      fetchDependencies();
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    setFetchingData(true);
    try {
      const [routesRes, driversRes, clientsRes, latestTripsRes] = await Promise.all([
        pb.collection('routes').getFullList({ sort: 'route_name', $autoCancel: false }),
        pb.collection('employees').getFullList({ filter: 'employee_type="driver" && active_status="active"', sort: 'name', $autoCancel: false }),
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('trip_logs').getList(1, 100, { sort: '-created', $autoCancel: false })
      ]);
      setRoutes(routesRes);
      setDrivers(driversRes);
      setClients(clientsRes);

      // Generate next Trip ID by scanning recent records for the maximum numerical ID
      let maxNum = 0;
      for (const item of latestTripsRes.items) {
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
      let nextNum = maxNum > 0 ? maxNum + 1 : latestTripsRes.totalItems + 1;
      setGeneratedTripId(`TRIP-${nextNum.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
      toast.error('Failed to load routes and drivers.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleRouteChange = (routeId) => {
    setSelectedRouteId(routeId);
    const selected = routes.find(r => r.id === routeId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        route: selected.route_code,
        kms: selected.distance_km?.toString() || prev.kms,
        revenue: selected.amount_per_trip?.toString() || prev.revenue
      }));
    } else {
      setFormData(prev => ({ ...prev, route: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.route || !formData.driver_name || !formData.revenue) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        trip_id: generatedTripId,
        pod_status: 'Pending',
        truck_number: vehicleName,
        driver_name: formData.driver_name,
        route: formData.route,
        date: format(new Date(), 'yyyy-MM-dd'),
        kms: parseFloat(formData.kms) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        client_id: formData.client_id || null,
        trip_status: 'Pending',
        client_payment_status: 'pending',
        notes: formData.notes,
        user_id: currentUser?.id,
        created_by: currentUser?.id
      };

      await pb.collection('trip_logs').create(payload, { $autoCancel: false });
      toast.success(`Trip successfully assigned to ${vehicleName}`);
      onClose();
    } catch (error) {
      console.error('Failed to assign trip:', error);
      toast.error(error.message || 'Failed to assign trip to vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-card text-card-foreground p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Assign Trip to Vehicle</DialogTitle>
              <DialogDescription>
                Creating a new trip assignment for truck <span className="font-semibold text-foreground">{vehicleName}</span>.
              </DialogDescription>
            </div>
            {generatedTripId && (
              <div className="bg-background px-3 py-1.5 rounded-lg border border-border/50 shadow-sm text-center shrink-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Trip ID</p>
                <p className="text-sm font-mono font-bold text-primary">{generatedTripId}</p>
              </div>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Route <span className="text-destructive">*</span></Label>
              <Select value={selectedRouteId} onValueChange={handleRouteChange} disabled={fetchingData}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.route_name} {r.is_round_trip ? '(Round-Trip)' : `(${r.route_code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Leg Selector for Round-Trip Route Templates */}
              {(() => {
                const selectedRouteTemplate = routes.find(r => r.id === selectedRouteId);
                if (!selectedRouteTemplate?.is_round_trip) return null;
                return (
                  <div className="space-y-2 mt-2 p-2 bg-secondary/10 rounded-lg border border-border/40 animate-in fade-in duration-300">
                    <Label className="text-xs font-semibold text-primary">Select Leg</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.route === selectedRouteTemplate.route_code ? "default" : "outline"}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            route: selectedRouteTemplate.route_code,
                            kms: selectedRouteTemplate.distance_km?.toString() || prev.kms,
                            revenue: selectedRouteTemplate.amount_per_trip?.toString() || prev.revenue
                          }));
                        }}
                        className="flex-1 text-[11px] h-8 px-2"
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
                            kms: selectedRouteTemplate.distance_km?.toString() || prev.kms,
                            revenue: selectedRouteTemplate.amount_per_trip?.toString() || prev.revenue
                          }));
                        }}
                        className="flex-1 text-[11px] h-8 px-2"
                      >
                        Down Leg ({selectedRouteTemplate.down_route_code})
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="space-y-2">
              <Label>Driver <span className="text-destructive">*</span></Label>
              <Select value={formData.driver_name} onValueChange={(v) => setFormData({...formData, driver_name: v})} disabled={fetchingData}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Assign driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(d => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estimated KMs</Label>
              <Input 
                type="number" 
                step="0.1" 
                placeholder="0.0" 
                value={formData.kms} 
                onChange={(e) => setFormData({...formData, kms: e.target.value})} 
                className="bg-background text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expected Revenue (₹) <span className="text-destructive">*</span></Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.revenue} 
                onChange={(e) => setFormData({...formData, revenue: e.target.value})} 
                required
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client (Optional)</Label>
            <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})} disabled={fetchingData}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select associated client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trip Notes</Label>
            <Textarea 
              placeholder="Any specific instructions for this trip..." 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="resize-none h-20 bg-background text-foreground"
            />
          </div>
        </form>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading || fetchingData}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Assign Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}