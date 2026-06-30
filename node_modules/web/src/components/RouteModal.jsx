import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const reverseStops = (str) => {
  if (!str) return '';
  const separators = [
    { pattern: /\s*->\s*/, joiner: ' -> ' },
    { pattern: /\s*➔\s*/, joiner: ' ➔ ' },
    { pattern: /\s*-\s*/, joiner: ' - ' },
    { pattern: /\s+to\s+/i, joiner: ' to ' },
    { pattern: /\s*>\s*/, joiner: ' > ' }
  ];
  
  for (const sep of separators) {
    if (sep.pattern.test(str)) {
      const parts = str.split(sep.pattern);
      if (parts.length > 1) {
        return parts.reverse().map(p => p.trim()).join(sep.joiner);
      }
    }
  }
  return str;
};

export default function RouteModal({ isOpen, onClose, route, onSuccess }) {
  const isEdit = !!route;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    route_name: '',
    route_code: '',
    amount_per_trip: '',
    distance_km: '',
    description: '',
    is_round_trip_rate: false,
    
    // Round-trip fields
    is_split_round_trip: false,
    up_code: '',
    down_code: '',
    up_origin: '',
    up_destination: '',
    down_origin: '',
    down_destination: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (route) {
        setFormData({
          route_name: route.route_name || '',
          route_code: route.route_code || '',
          amount_per_trip: route.amount_per_trip || '',
          distance_km: route.distance_km || '',
          description: route.description || '',
          is_round_trip_rate: route.is_round_trip_rate || false,
          
          is_split_round_trip: false,
          up_code: '',
          down_code: '',
          up_origin: '',
          up_destination: '',
          down_origin: '',
          down_destination: ''
        });
      } else {
        setFormData({
          route_name: '',
          route_code: '',
          amount_per_trip: '',
          distance_km: '',
          description: '',
          is_round_trip_rate: false,
          
          is_split_round_trip: false,
          up_code: '',
          down_code: '',
          up_origin: '',
          up_destination: '',
          down_origin: '',
          down_destination: ''
        });
      }
    }
  }, [isOpen, route]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSplitRoundTripToggle = (checked) => {
    setFormData(prev => {
      if (checked) {
        // If converting to split round trip:
        const startLoc = route?.start_location || route?.route_name?.split(' - ')[0] || '';
        const endLoc = route?.end_location || route?.route_name?.split(' - ')[1] || '';
        
        // Calculate total rate based on current route rate and whether it was marked as round trip rate
        let totalRate = prev.amount_per_trip || '';
        if (isEdit && route && !route.is_round_trip_rate && totalRate) {
          totalRate = (parseFloat(totalRate) * 2).toString();
        }

        return {
          ...prev,
          is_split_round_trip: true,
          up_code: prev.up_code || route?.route_code || prev.route_code || '',
          up_origin: prev.up_origin || startLoc || '',
          up_destination: prev.up_destination || endLoc || '',
          down_origin: prev.down_origin || endLoc || '',
          down_destination: prev.down_destination || startLoc || '',
          amount_per_trip: totalRate
        };
      } else {
        // If turning off split round trip:
        // Calculate single rate: if it was originally not round trip rate, divide by 2
        let singleRate = prev.amount_per_trip || '';
        if (isEdit && route && !route.is_round_trip_rate && singleRate) {
          singleRate = (parseFloat(singleRate) / 2).toString();
        }
        return {
          ...prev,
          is_split_round_trip: false,
          amount_per_trip: singleRate
        };
      }
    });
  };

  const handleUpOriginChange = (val) => {
    setFormData(prev => {
      const updates = { up_origin: val };
      const reversedVal = reverseStops(val);
      if (!prev.down_destination || prev.down_destination === reverseStops(prev.up_origin)) {
        updates.down_destination = reversedVal;
      }
      return { ...prev, ...updates };
    });
  };

  const handleUpDestinationChange = (val) => {
    setFormData(prev => {
      const updates = { up_destination: val };
      const reversedVal = reverseStops(val);
      if (!prev.down_origin || prev.down_origin === reverseStops(prev.up_destination)) {
        updates.down_origin = reversedVal;
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formData.is_split_round_trip) {
        const totalRate = parseFloat(formData.amount_per_trip) || 0;
        const legRate = totalRate / 2;
        const distance = parseFloat(formData.distance_km) || 0;

        const upPayload = {
          route_name: `${formData.up_origin} - ${formData.up_destination}`,
          route_code: formData.up_code.toUpperCase(),
          amount_per_trip: legRate,
          distance_km: distance,
          description: formData.description ? `${formData.description} (Up Leg)` : 'Up Leg of Round-Trip',
          is_round_trip_rate: false,
          start_location: formData.up_origin,
          end_location: formData.up_destination,
          distance: distance
        };

        const downPayload = {
          route_name: `${formData.down_origin} - ${formData.down_destination}`,
          route_code: formData.down_code.toUpperCase(),
          amount_per_trip: legRate,
          distance_km: distance,
          description: formData.description ? `${formData.description} (Down Leg)` : 'Down Leg of Round-Trip',
          is_round_trip_rate: false,
          start_location: formData.down_origin,
          end_location: formData.down_destination,
          distance: distance
        };

        if (isEdit) {
          // Update the current route as the Up Leg
          await pb.collection('routes').update(route.id, upPayload, { $autoCancel: false });
          // Create the Down Leg as a new route
          await pb.collection('routes').create(downPayload, { $autoCancel: false });
          toast.success('Route updated and down leg generated successfully');
        } else {
          // Create both legs
          await pb.collection('routes').create(upPayload, { $autoCancel: false });
          await pb.collection('routes').create(downPayload, { $autoCancel: false });
          toast.success('Round-trip legs created successfully');
        }
      } else {
        const payload = {
          route_name: formData.route_name,
          route_code: formData.route_code,
          amount_per_trip: parseFloat(formData.amount_per_trip) || 0,
          distance_km: parseFloat(formData.distance_km) || 0,
          description: formData.description,
          is_round_trip_rate: formData.is_round_trip_rate,
          start_location: formData.route_name.split(' - ')[0] || formData.route_name,
          end_location: formData.route_name.split(' - ')[1] || formData.route_name,
          distance: parseFloat(formData.distance_km) || 0
        };

        if (isEdit) {
          await pb.collection('routes').update(route.id, payload, { $autoCancel: false });
          toast.success('Route updated successfully');
        } else {
          await pb.collection('routes').create(payload, { $autoCancel: false });
          toast.success('Route created successfully');
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('[RouteModal] Error:', error);
      toast.error(error.message || 'Failed to save route. Check if Route Code is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Route' : 'Create New Route'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details for this route template.' : 'Define a standard route to easily reuse when creating trips.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/40">
            <input
              type="checkbox"
              id="is_split_round_trip"
              name="is_split_round_trip"
              checked={formData.is_split_round_trip}
              onChange={(e) => handleSplitRoundTripToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <Label htmlFor="is_split_round_trip" className="text-xs font-semibold leading-none cursor-pointer text-primary">
              {isEdit ? 'Convert to Round-Trip Legs (Split into Up & Down legs)' : 'Create as Round-Trip Legs (Generate Up & Down leg routes)'}
            </Label>
          </div>

          {formData.is_split_round_trip ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Route Codes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="up_code">Up Leg Code <span className="text-destructive">*</span></Label>
                  <Input
                    id="up_code"
                    name="up_code"
                    placeholder="e.g. BOM-DEL-UP"
                    value={formData.up_code}
                    onChange={handleChange}
                    required={formData.is_split_round_trip}
                    className="bg-background uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_code">Down Leg Code <span className="text-destructive">*</span></Label>
                  <Input
                    id="down_code"
                    name="down_code"
                    placeholder="e.g. DEL-BOM-DN"
                    value={formData.down_code}
                    onChange={handleChange}
                    required={formData.is_split_round_trip}
                    className="bg-background uppercase"
                  />
                </div>
              </div>

              {/* Up Leg Origin and Destination */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="up_origin">Up Leg Origin <span className="text-destructive">*</span></Label>
                  <Input
                    id="up_origin"
                    name="up_origin"
                    placeholder="e.g. Mumbai"
                    value={formData.up_origin}
                    onChange={(e) => handleUpOriginChange(e.target.value)}
                    required={formData.is_split_round_trip}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="up_destination">Up Leg Destination <span className="text-destructive">*</span></Label>
                  <Input
                    id="up_destination"
                    name="up_destination"
                    placeholder="e.g. Delhi"
                    value={formData.up_destination}
                    onChange={(e) => handleUpDestinationChange(e.target.value)}
                    required={formData.is_split_round_trip}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Down Leg Origin and Destination */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="down_origin">Down Leg Origin <span className="text-destructive">*</span></Label>
                  <Input
                    id="down_origin"
                    name="down_origin"
                    placeholder="e.g. Delhi"
                    value={formData.down_origin}
                    onChange={handleChange}
                    required={formData.is_split_round_trip}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_destination">Down Leg Destination <span className="text-destructive">*</span></Label>
                  <Input
                    id="down_destination"
                    name="down_destination"
                    placeholder="e.g. Mumbai"
                    value={formData.down_destination}
                    onChange={handleChange}
                    required={formData.is_split_round_trip}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="route_name">Route Name <span className="text-destructive">*</span></Label>
                <Input
                  id="route_name"
                  name="route_name"
                  placeholder="e.g. Mumbai - Delhi"
                  value={formData.route_name}
                  onChange={handleChange}
                  required={!formData.is_split_round_trip}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route_code">Route Code <span className="text-destructive">*</span></Label>
                <Input
                  id="route_code"
                  name="route_code"
                  placeholder="e.g. BOM-DEL-01"
                  value={formData.route_code}
                  onChange={handleChange}
                  required={!formData.is_split_round_trip}
                  className="bg-background uppercase"
                />
                <p className="text-[10px] text-muted-foreground">Must be unique across all routes.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_per_trip">
                {formData.is_split_round_trip ? 'Total Round-Trip Rate (₹)' : 'Amount per Trip (₹)'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount_per_trip"
                name="amount_per_trip"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount_per_trip}
                onChange={handleChange}
                required
                className="bg-background"
              />
              {formData.is_split_round_trip && (
                <p className="text-[10.5px] text-primary/80 font-medium">
                  Split 50/50: ₹{(parseFloat(formData.amount_per_trip) / 2 || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} per leg.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance_km">Distance (KM) <span className="text-destructive">*</span></Label>
              <Input
                id="distance_km"
                name="distance_km"
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={formData.distance_km}
                onChange={handleChange}
                required
                className="bg-background"
              />
            </div>
          </div>

          {!formData.is_split_round_trip && (
            <div className="flex items-center space-x-2 pt-1 pb-1">
              <input
                type="checkbox"
                id="is_round_trip_rate"
                name="is_round_trip_rate"
                checked={formData.is_round_trip_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, is_round_trip_rate: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="is_round_trip_rate" className="text-xs font-medium leading-none cursor-pointer">
                This amount is for a complete Round-Trip (Leg rate is 50%)
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional route notes, checkpoints, or specific instructions..."
              value={formData.description}
              onChange={handleChange}
              className="bg-background resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? (formData.is_split_round_trip ? 'Convert and Save Legs' : 'Save Changes') : (formData.is_split_round_trip ? 'Create Leg Routes' : 'Create Route')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}