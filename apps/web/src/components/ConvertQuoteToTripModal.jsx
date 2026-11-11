import React, { useState, useEffect } from 'react';
import { 
  Truck, User, Calendar, MapPin, DollarSign, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, X, ShieldAlert, Sparkles 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useNavigate } from 'react-router-dom';

export default function ConvertQuoteToTripModal({ isOpen, onClose, quote, onConverted }) {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 16));
  const [deliveryEta, setDeliveryEta] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [loadingDock, setLoadingDock] = useState('Loading Gate 1');
  const [unloadingDock, setUnloadingDock] = useState('Unloading Bay 2');
  const [driverAdvance, setDriverAdvance] = useState('5000');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const [trucksRes, driversRes] = await Promise.all([
          pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
          pb.collection('employees').getFullList({ 
            filter: 'employee_type = "driver" && active_status = "active"', 
            sort: 'name', 
            $autoCancel: false 
          })
        ]);
        setTrucks(trucksRes || []);
        setDrivers(driversRes || []);

        if (trucksRes && trucksRes.length > 0) {
          setTruckId(trucksRes[0].id);
        }
        if (driversRes && driversRes.length > 0) {
          setDriverId(driversRes[0].id);
        }
      } catch (err) {
        console.error('Error fetching conversion resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [isOpen]);

  if (!quote) return null;

  const quoteRevenue = Number(quote.total_amount || quote.amount || quote.rate || 0);
  const selectedTruck = trucks.find(t => t.id === truckId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        quoteId: quote.id,
        truckId: selectedTruck?.id || '',
        truckNumber: selectedTruck?.truck_number || '',
        driverId: selectedDriver?.id || '',
        driverName: selectedDriver?.name || '',
        driverPhone: selectedDriver?.contact || '',
        pickupDate: new Date(pickupDate).toISOString(),
        deliveryEta: new Date(deliveryEta).toISOString(),
        loadingDock,
        unloadingDock,
        driverAdvance: Number(driverAdvance) || 0,
        notes: notes || quote.notes || '',
        actor: {
          id: pb.authStore.model?.id || 'usr_vinod_admin',
          name: pb.authStore.model?.name || 'Vinod Kumar Rathod'
        }
      };

      const res = await fetch('/api/quotes/convert-to-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert quotation into trip');
      }

      toast.success(`Quotation converted to Live Trip #${data.tripNumber}!`, {
        action: {
          label: 'Open Trip Logs',
          onClick: () => navigate('/trip-logs')
        }
      });

      if (onConverted) onConverted(data.trip);
      onClose();
    } catch (err) {
      console.error('Conversion failed:', err);
      toast.error(err.message || 'Error converting quote to trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Convert Quotation to Operational Booking
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Quotation #{quote.quote_number || quote.id} • {quote.customer_name || 'Client Indent'}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              ₹{quoteRevenue.toLocaleString('en-IN')}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Route & Cargo Overview Banner */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Origin</span>
              <span className="font-semibold text-foreground text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> {quote.origin || 'Origin Hub'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Destination</span>
              <span className="font-semibold text-foreground text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {quote.destination || 'Destination Hub'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Vehicle Specification</span>
              <span className="font-semibold text-foreground text-sm flex items-center gap-1 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> {quote.truck_size || quote.container_type || '32 FT Container'}
              </span>
            </div>
          </div>

          {/* Allocation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" /> Assign Fleet Vehicle
              </Label>
              <Select value={truckId} onValueChange={setTruckId}>
                <SelectTrigger className="bg-background h-10 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.truck_number} ({t.truck_type || '32ft Container'}) • {t.status || 'Available'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Assign Designated Driver
              </Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger className="bg-background h-10 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {drivers.map(d => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.name} ({d.contact || 'No contact'}) • Lic: {d.license_number || 'Verified'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Scheduled Loading Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                required
                className="bg-background h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Delivery Target ETA
              </Label>
              <Input
                type="datetime-local"
                value={deliveryEta}
                onChange={e => setDeliveryEta(e.target.value)}
                required
                className="bg-background h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Loading Hub / Gate</Label>
              <Input
                value={loadingDock}
                onChange={e => setLoadingDock(e.target.value)}
                placeholder="Gate 1, Loading Bay A"
                className="bg-background h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Initial Driver Advance (₹)</Label>
              <Input
                type="number"
                min="0"
                step="500"
                value={driverAdvance}
                onChange={e => setDriverAdvance(e.target.value)}
                placeholder="5000"
                className="bg-background h-10 rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Auto-recorded in cashbook against driver</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Operational Instructions / Consignment Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E-way bill references, dock entry pass requirements, or temperature specifications..."
              className="bg-background rounded-xl text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="border-t border-border/60 pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl text-xs font-bold gap-1.5">
              {submitting ? 'Converting...' : 'Confirm & Create Operational Trip'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
