import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useQuoteCalculator } from '@/hooks/useQuoteCalculator.js';
import QuoteCalculationBreakdown from './QuoteCalculationBreakdown.jsx';
import { CONTAINER_CONFIG, ZONE_CONFIG, FUEL_SURCHARGE_DEFAULT, HANDLING_FEES_DEFAULT } from '@/constants/quoteConfig.js';

const QuoteFormModal = ({ isOpen, onClose, quote, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('customer');

  // Form State
  const [formData, setFormData] = useState({
    quote_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    origin: '',
    destination: '',
    destination_zone: '',
    container_type: '',
    actual_weight: '',
    length: '',
    width: '',
    height: '',
    base_rate_per_kg: 0,
    zone_distance_multiplier: 1,
    fuel_surcharge: FUEL_SURCHARGE_DEFAULT,
    handling_fees: HANDLING_FEES_DEFAULT,
    notes: '',
    status: 'Draft'
  });

  // Calculate live totals using the hook
  const calculations = useQuoteCalculator({
    actualWeight: formData.actual_weight || 0,
    length: formData.length || 0,
    width: formData.width || 0,
    height: formData.height || 0,
    baseRatePerKg: formData.base_rate_per_kg || 0,
    zoneDistanceMultiplier: formData.zone_distance_multiplier || 1,
    fuelSurcharge: formData.fuel_surcharge || 0,
    handlingFees: formData.handling_fees || 0
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('customer');
      if (quote) {
        setFormData({
          quote_number: quote.quote_number,
          customer_name: quote.customer_name || '',
          customer_email: quote.customer_email || '',
          customer_phone: quote.customer_phone || '',
          origin: quote.origin || '',
          destination: quote.destination || '',
          destination_zone: quote.destination_zone || '',
          container_type: quote.container_type || '',
          actual_weight: quote.actual_weight || '',
          length: quote.length || '',
          width: quote.width || '',
          height: quote.height || '',
          base_rate_per_kg: quote.base_rate_per_kg || 0,
          zone_distance_multiplier: quote.zone_distance_multiplier || 1,
          fuel_surcharge: quote.fuel_surcharge ?? FUEL_SURCHARGE_DEFAULT,
          handling_fees: quote.handling_fees ?? HANDLING_FEES_DEFAULT,
          notes: quote.notes || '',
          status: quote.status || 'Draft'
        });
      } else {
        setFormData({
          quote_number: `QT-${Date.now().toString().slice(-6)}`,
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          origin: '',
          destination: '',
          destination_zone: '',
          container_type: '',
          actual_weight: '',
          length: '',
          width: '',
          height: '',
          base_rate_per_kg: 0,
          zone_distance_multiplier: 1,
          fuel_surcharge: FUEL_SURCHARGE_DEFAULT,
          handling_fees: HANDLING_FEES_DEFAULT,
          notes: '',
          status: 'Draft'
        });
      }
    }
  }, [isOpen, quote]);

  const handleChange = (field, value) => {
    const updates = { [field]: value };
    
    // Auto-fill logic for Container
    if (field === 'container_type') {
      const config = CONTAINER_CONFIG.find(c => c.type === value);
      if (config) {
        updates.base_rate_per_kg = config.baseRatePerKg;
      }
    }
    
    // Auto-fill logic for Zone
    if (field === 'destination_zone') {
      const config = ZONE_CONFIG.find(z => z.zone === value);
      if (config) {
        updates.zone_distance_multiplier = config.multiplier;
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        actual_weight: Number(formData.actual_weight),
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
        volumetric_weight: calculations.volumetricWeight,
        chargeable_weight: calculations.chargeableWeight,
        weight_charge: calculations.weightCharge,
        total_price: calculations.totalPrice,
        created_by: currentUser.id
      };

      if (quote) {
        await pb.collection('quotes').update(quote.id, payload, { $autoCancel: false });
        toast.success('Quote updated successfully');
      } else {
        await pb.collection('quotes').create(payload, { $autoCancel: false });
        toast.success('Quote created successfully');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.message || 'Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>{quote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 border-b border-border/50">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-muted/50">
                <TabsTrigger value="customer">1. Customer</TabsTrigger>
                <TabsTrigger value="cargo">2. Cargo Info</TabsTrigger>
                <TabsTrigger value="rates">3. Rates</TabsTrigger>
                <TabsTrigger value="summary">4. Summary</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <TabsContent value="customer" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote_number">Quote Number (Auto)</Label>
                    <Input id="quote_number" value={formData.quote_number} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                      <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input id="customer_name" required value={formData.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_email">Email Address *</Label>
                    <Input id="customer_email" type="email" required value={formData.customer_email} onChange={(e) => handleChange('customer_email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone Number</Label>
                    <Input id="customer_phone" value={formData.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setActiveTab('cargo')}>Next: Cargo Info &rarr;</Button>
                </div>
              </TabsContent>

              <TabsContent value="cargo" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin *</Label>
                    <Input id="origin" required value={formData.origin} onChange={(e) => handleChange('origin', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input id="destination" required value={formData.destination} onChange={(e) => handleChange('destination', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="container_type">Container Type *</Label>
                  <Select required value={formData.container_type} onValueChange={(v) => handleChange('container_type', v)}>
                    <SelectTrigger id="container_type"><SelectValue placeholder="Select container" /></SelectTrigger>
                    <SelectContent>
                      {CONTAINER_CONFIG.map(c => (
                        <SelectItem key={c.type} value={c.type}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="actual_weight">Weight (kg) *</Label>
                    <Input id="actual_weight" type="number" required min="1" value={formData.actual_weight} onChange={(e) => handleChange('actual_weight', e.target.value)} />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="length">Length (cm) *</Label>
                    <Input id="length" type="number" required min="1" value={formData.length} onChange={(e) => handleChange('length', e.target.value)} />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="width">Width (cm) *</Label>
                    <Input id="width" type="number" required min="1" value={formData.width} onChange={(e) => handleChange('width', e.target.value)} />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="height">Height (cm) *</Label>
                    <Input id="height" type="number" required min="1" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('customer')}>&larr; Back</Button>
                  <Button type="button" onClick={() => setActiveTab('rates')}>Next: Rates &rarr;</Button>
                </div>
              </TabsContent>

              <TabsContent value="rates" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="destination_zone">Destination Zone *</Label>
                  <Select required value={formData.destination_zone} onValueChange={(v) => handleChange('destination_zone', v)}>
                    <SelectTrigger id="destination_zone"><SelectValue placeholder="Select routing zone" /></SelectTrigger>
                    <SelectContent>
                      {ZONE_CONFIG.map(z => (
                        <SelectItem key={z.zone} value={z.zone}>{z.zone} (x{z.multiplier})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Label htmlFor="base_rate_per_kg">Base Rate per kg (₹)</Label>
                    <Input id="base_rate_per_kg" type="number" step="0.1" value={formData.base_rate_per_kg} onChange={(e) => handleChange('base_rate_per_kg', e.target.value)} />
                    <p className="text-xs text-muted-foreground">Auto-filled based on container type</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone_distance_multiplier">Zone Multiplier</Label>
                    <Input id="zone_distance_multiplier" type="number" step="0.1" value={formData.zone_distance_multiplier} onChange={(e) => handleChange('zone_distance_multiplier', e.target.value)} />
                    <p className="text-xs text-muted-foreground">Auto-filled based on destination zone</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuel_surcharge">Fuel Surcharge (₹)</Label>
                    <Input id="fuel_surcharge" type="number" value={formData.fuel_surcharge} onChange={(e) => handleChange('fuel_surcharge', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="handling_fees">Handling Fees (₹)</Label>
                    <Input id="handling_fees" type="number" value={formData.handling_fees} onChange={(e) => handleChange('handling_fees', e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('cargo')}>&larr; Back</Button>
                  <Button type="button" onClick={() => setActiveTab('summary')}>Review Summary &rarr;</Button>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-6 mt-0">
                <QuoteCalculationBreakdown 
                  calculations={calculations}
                  actualWeight={formData.actual_weight}
                  baseRatePerKg={formData.base_rate_per_kg}
                  zoneMultiplier={formData.zone_distance_multiplier}
                  fuelSurcharge={formData.fuel_surcharge}
                  handlingFees={formData.handling_fees}
                />

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes / Terms</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="E.g., Validity of quote, special handling requirements..." 
                    className="min-h-[100px] resize-y"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('rates')}>&larr; Back to Rates</Button>
                  <div className="space-x-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (quote ? 'Update Quote' : 'Create Quote')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteFormModal;