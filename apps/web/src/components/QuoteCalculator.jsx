import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, PhoneCall, AlertTriangle, MapPin, Scale, Truck, Package, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { TRUCK_SIZE_OPTIONS, getTruckSizeSpec } from '@/constants/truckSizes.js';

export const VEHICLE_OPTIONS = TRUCK_SIZE_OPTIONS.map(opt => ({
  ...opt,
  rateKM: opt.ratePerKm
}));

const SPECIAL_REQUIREMENTS = [
  { id: 'fragile', label: 'Fragile / Delicate Cargo', cost: 1000 },
  { id: 'temp', label: 'Weather Sealed / Double Lock', cost: 1500 },
  { id: 'haz', label: 'Industrial Machinery', cost: 2000 },
  { id: 'heavy', label: 'Multi-point Loading / Unloading', cost: 2500 },
];

const QuoteCalculator = () => {
  const navigate = useNavigate();
  
  // Form State
  const [vehicleId, setVehicleId] = useState('32ftsxl');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceInput, setDistanceInput] = useState('');
  const [weight, setWeight] = useState('');
  const [servicePriority, setServicePriority] = useState('express');
  const [dimensions, setDimensions] = useState({ l: '', w: '', h: '' });
  const [requirements, setRequirements] = useState({});

  // Validation State
  const [errors, setErrors] = useState({});

  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.id === vehicleId || v.value === vehicleId) || VEHICLE_OPTIONS[5];

  // Calculate effective distance
  const effectiveDistance = useMemo(() => {
    if (distanceInput && parseFloat(distanceInput) > 0) {
      return parseFloat(distanceInput);
    }
    if (origin && destination) {
      return (Math.abs(origin.length - destination.length) + 1) * 120 + 250;
    }
    return 0;
  }, [distanceInput, origin, destination]);

  // Calculate Costs
  const costs = useMemo(() => {
    const numWeightKG = parseFloat(weight) || 0;
    const numWeightMT = numWeightKG / 1000;
    const dist = effectiveDistance;
    
    let isCapacityExceeded = false;
    if (numWeightMT > selectedVehicle.maxMT) {
      isCapacityExceeded = true;
    }

    const priorityMultiplier = servicePriority === 'specialized' ? 1.15 : 1.0;
    const effectiveRateKM = Math.round(selectedVehicle.rateKM * priorityMultiplier);

    const distanceCharge = dist * effectiveRateKM;
    const baseCharge = selectedVehicle.baseCharge;
    
    let reqCharge = 0;
    Object.keys(requirements).forEach(key => {
      if (requirements[key]) {
        const req = SPECIAL_REQUIREMENTS.find(r => r.id === key);
        if (req) reqCharge += req.cost;
      }
    });

    let total = distanceCharge + baseCharge + reqCharge;
    const minCharge = selectedVehicle.baseCharge + 3000;
    if (total > 0 && total < minCharge) {
      total = minCharge;
    }

    return {
      distanceCharge: Math.round(distanceCharge),
      baseCharge: Math.round(baseCharge),
      reqCharge,
      total: Math.round(total),
      effectiveRateKM,
      minApplied: total === minCharge && distanceCharge > 0,
      isValid: dist > 0 && numWeightKG > 0 && !isCapacityExceeded,
      isCapacityExceeded,
      maxMT: selectedVehicle.maxMT
    };
  }, [effectiveDistance, weight, selectedVehicle, servicePriority, requirements]);

  const handleRequirementChange = (id, checked) => {
    setRequirements(prev => ({ ...prev, [id]: checked }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!distanceInput && (!origin || !destination)) {
      newErrors.location = "Either provide Distance (KM) OR both Origin and Destination.";
    }
    if (!weight || parseFloat(weight) <= 0) {
      newErrors.weight = "Weight is required and must be greater than 0.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !costs.isCapacityExceeded;
  };

  const handleDetailedQuote = () => {
    if (validateForm()) {
      navigate('/quote', { 
        state: { 
          origin, 
          destination, 
          vehicle: vehicleId,
          distance: effectiveDistance,
          weight, 
          type: servicePriority, 
          dimensions, 
          requirements,
          estimatedTotal: costs.total
        } 
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Section (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Dynamic Truck Specs Info Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row gap-5 items-center sm:items-start animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-100">Fleet Specification: {selectedVehicle.short}</h3>
              <div className="group relative cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {selectedVehicle.name} - verified GPS fleet.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300 mt-3">
              <div><span className="text-slate-500">Payload Capacity:</span> <span className="font-semibold text-emerald-400">{selectedVehicle.capacity}</span></div>
              <div><span className="text-slate-500">Volume:</span> <span className="font-medium text-slate-200">{selectedVehicle.volume}</span></div>
              <div className="col-span-2"><span className="text-slate-500">Dimensions:</span> <span className="font-medium text-slate-200">{selectedVehicle.dimensions}</span></div>
            </div>
          </div>
        </div>

        <Card className="bg-card border-border shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border pb-4 pt-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" /> Shipment Details & Vehicle Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Vehicle Sizes Dropdown (Requested by user) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <label className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Vehicle Size / Fleet Type *
                </label>
                <span className="text-xs text-primary font-mono font-bold">
                  {selectedVehicle.capacity} • {selectedVehicle.dimensions}
                </span>
              </div>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger className="bg-background text-foreground font-bold h-12 text-sm border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Select Vehicle Size" />
                </SelectTrigger>
                <SelectContent className="max-h-[340px]">
                  {VEHICLE_OPTIONS.map(v => (
                    <SelectItem key={v.id} value={v.id} className="py-2.5">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="font-bold text-foreground">{v.name}</span>
                        <span className="text-xs text-emerald-400 font-mono font-semibold">({v.capacity})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location & Distance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-2">
                <MapPin className="w-5 h-5 text-secondary" /> Routing Information
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Origin City / Pincode</Label>
                  <Input 
                    placeholder="e.g. Mumbai, 400001" 
                    value={origin} 
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      if (errors.location) setErrors({...errors, location: null});
                    }} 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Destination City / Pincode</Label>
                  <Input 
                    placeholder="e.g. Delhi, 110001" 
                    value={destination} 
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (errors.location) setErrors({...errors, location: null});
                    }} 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Distance in KM <span className="text-muted-foreground font-normal">(Auto-calculated or enter exact)</span></Label>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="e.g. 500" 
                    value={distanceInput} 
                    onChange={(e) => {
                      setDistanceInput(e.target.value);
                      if (errors.location) setErrors({...errors, location: null});
                    }} 
                    className="bg-background"
                  />
                </div>
              </div>
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
            </div>

            {/* Cargo Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-2">
                <Scale className="w-5 h-5 text-secondary" /> Cargo Specifications
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Service Priority</Label>
                  <Select value={servicePriority} onValueChange={setServicePriority}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">⚡ Standard / Express Freight</SelectItem>
                      <SelectItem value="specialized">🛡️ Specialized Heavy Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Shipment Weight (KG) *</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="e.g. 5000" 
                    value={weight} 
                    onChange={(e) => {
                      setWeight(e.target.value);
                      if (errors.weight) setErrors({...errors, weight: null});
                    }} 
                    className={`bg-background ${errors.weight || costs.isCapacityExceeded ? 'border-destructive' : ''}`}
                  />
                  {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                  {costs.isCapacityExceeded && (
                    <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded mt-2">
                      Weight exceeds {costs.maxMT} MT capacity for {selectedVehicle.short}. Select a larger container or multi-axle truck.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Dimensions (Optional - cm)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Length" value={dimensions.l} onChange={e => setDimensions({...dimensions, l: e.target.value})} className="bg-background" />
                  <Input placeholder="Width" value={dimensions.w} onChange={e => setDimensions({...dimensions, w: e.target.value})} className="bg-background" />
                  <Input placeholder="Height" value={dimensions.h} onChange={e => setDimensions({...dimensions, h: e.target.value})} className="bg-background" />
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-2">
                <Package className="w-5 h-5 text-secondary" /> Special Handling Options
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-5 rounded-xl border border-border/50">
                {SPECIAL_REQUIREMENTS.map((req) => (
                  <div key={req.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={req.id} 
                      checked={!!requirements[req.id]}
                      onCheckedChange={(checked) => handleRequirementChange(req.id, checked)}
                    />
                    <label htmlFor={req.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80 cursor-pointer flex flex-col gap-1">
                      <span>{req.label}</span>
                      <span className="text-muted-foreground text-xs">+₹{req.cost.toLocaleString('en-IN')}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Result Section (Right Column) */}
      <div className="lg:col-span-5 space-y-6 sticky top-24">
        
        {/* Cost Breakdown Card */}
        <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-1">Total Estimated Freight</h3>
              <div className="text-5xl font-extrabold tracking-tight font-mono">
                ₹{costs.isValid ? costs.total.toLocaleString('en-IN') : '0'}
              </div>
              {costs.isValid && (
                <p className="text-sm opacity-80 mt-2">
                  Based on {effectiveDistance} KM and {weight} KG for {selectedVehicle.short}
                </p>
              )}
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2">Cost Breakdown</h4>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Vehicle Selected</span>
                <span className="font-bold text-foreground">{selectedVehicle.short}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payload Capacity</span>
                <span className="font-semibold text-emerald-400">{selectedVehicle.capacity}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate Per KM</span>
                <span className="font-mono font-bold text-foreground">₹{costs.effectiveRateKM} / KM</span>
              </div>
              
              <div className="border-t border-border/50 my-2"></div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Base Vehicle Charge</span>
                <span className="font-medium">₹{costs.isValid ? selectedVehicle.baseCharge.toLocaleString('en-IN') : '0'}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Distance Transit ({effectiveDistance} KM @ ₹{costs.effectiveRateKM}/KM)</span>
                <span className="font-medium">₹{costs.isValid ? costs.distanceCharge.toLocaleString('en-IN') : '0'}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Special Handling Options</span>
                <span className="font-medium">
                  {costs.reqCharge > 0 ? '+' : ''}₹{costs.isValid ? costs.reqCharge.toLocaleString('en-IN') : '0'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md transition-transform hover:-translate-y-0.5"
                onClick={handleDetailedQuote}
                disabled={costs.isCapacityExceeded}
              >
                Proceed to Book / Get Formal Quote <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full bg-background hover:bg-muted transition-colors"
                onClick={() => navigate('/quote')}
              >
                <Truck className="mr-2 w-4 h-4" /> Open Full Quote Form
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              Prices subject to exact toll, unloading points & diesel price sync.
            </p>
          </CardContent>
        </Card>

        {/* Prominent Disclaimer Box */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="disclaimer-box"
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-lg tracking-tight">⚠️ ESTIMATE NOTICE</h4>
              <p className="text-sm mt-1 opacity-90 leading-relaxed">
                Pricing estimated for {selectedVehicle.name} ({selectedVehicle.capacity}) starting @ ₹{selectedVehicle.rateKM}/KM.
              </p>
            </div>
          </div>
          
          <ul className="list-disc pl-10 text-sm space-y-1.5 opacity-90 mb-4 marker:text-secondary">
            <li>Current diesel rates & toll routes</li>
            <li>Guaranteed vehicle placement with live GPS</li>
            <li>Zero hidden charges with digital POD</li>
          </ul>
          
          <div className="bg-black/5 dark:bg-black/20 p-3 rounded-lg text-sm border border-black/5 dark:border-white/5">
            <p className="font-semibold mb-1">For instant dispatch confirmation, reach our team:</p>
            <div className="flex flex-col sm:flex-row sm:gap-4 opacity-90 text-xs font-semibold">
              <span>📞 7794072244</span>
              <span>✉️ vinod.jbcargo@gmail.com</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default QuoteCalculator;