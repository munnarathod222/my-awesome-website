import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import TyreDepthIndicator from './TyreDepthIndicator.jsx';

const SINGLE_AXLE_POSITIONS = ['Front-Left', 'Front-Right', 'Rear-Left-Inner', 'Rear-Left-Outer', 'Rear-Right-Inner', 'Rear-Right-Outer'];
const MULTI_AXLE_POSITIONS = ['Front-Left', 'Front-Right', 'Axle2-Left', 'Axle2-Right', 'Axle3-Left', 'Axle3-Right', 'Rear-Left', 'Rear-Right'];

export default function AddTyreModal({ config, onClose, trucks, tyres, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [truckAxleType, setTruckAxleType] = useState('single_axle');
  
  const [formData, setFormData] = useState({
    purchase_date: '',
    tyre_brand: '',
    model_no: '',
    serial_number: '',
    tyre_depth_mm: '',
    truck_id: '',
    axle_position: '',
    status: 'active'
  });

  useEffect(() => {
    if (config?.isOpen) {
      setFormData(prev => ({
        ...prev,
        truck_id: config.defaultTruckId || '',
        axle_position: config.defaultPosition || '',
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }));
      setTruckAxleType(config.defaultAxleType || 'single_axle');
    }
  }, [config]);

  const availablePositions = useMemo(() => {
    if (!formData.truck_id) return [];
    const allPositions = truckAxleType === 'multi_axle' ? MULTI_AXLE_POSITIONS : SINGLE_AXLE_POSITIONS;
    
    const assignedPositions = tyres
      .filter(t => t.truck_id === formData.truck_id && t.status !== 'replaced')
      .map(t => t.axle_position);
      
    return allPositions.filter(p => !assignedPositions.includes(p));
  }, [formData.truck_id, truckAxleType, tyres]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tyre_depth_mm: Number(formData.tyre_depth_mm)
      };
      if (!payload.purchase_date) delete payload.purchase_date;
      
      await onAdd(payload);
      
      setFormData({
        purchase_date: '',
        tyre_brand: '',
        model_no: '',
        serial_number: '',
        tyre_depth_mm: '',
        truck_id: '',
        axle_position: '',
        status: 'active'
      });
      onClose();
    } catch (err) {
      // Handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (field, value) => {
    if (field === 'truck_id') {
      const truckTyres = tyres.filter(t => t.truck_id === value && t.status !== 'replaced');
      const isMulti = truckTyres.some(t => t.axle_position?.includes('Axle2') || t.axle_position?.includes('Axle3'));
      if (truckTyres.length > 0) {
        setTruckAxleType(isMulti ? 'multi_axle' : 'single_axle');
      }
      setFormData(prev => ({ ...prev, truck_id: value, axle_position: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderPositionGroups = (positions) => {
    const getGroup = (label, filterWord) => {
      const filtered = positions.filter(p => p.includes(filterWord));
      if (filtered.length === 0) return null;
      return (
        <SelectGroup key={label}>
          <SelectLabel className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider bg-muted/30 py-1">{label}</SelectLabel>
          {filtered.map(pos => <SelectItem key={pos} value={pos}>{pos.replace(/-/g, ' ')}</SelectItem>)}
        </SelectGroup>
      );
    };

    const other = positions.filter(p => !p.includes('Front') && !p.includes('Axle') && !p.includes('Rear'));

    return (
      <>
        {getGroup('Front Axle', 'Front')}
        {getGroup('Axle 2', 'Axle2')}
        {getGroup('Axle 3', 'Axle3')}
        {getGroup('Rear Axle', 'Rear')}
        {other.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider bg-muted/30 py-1">Other</SelectLabel>
            {other.map(pos => <SelectItem key={pos} value={pos}>{pos.replace(/-/g, ' ')}</SelectItem>)}
          </SelectGroup>
        )}
      </>
    );
  };

  return (
    <Dialog open={config?.isOpen} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-tight">Add New Tyre</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="space-y-2 md:col-span-2 border-b border-border/50 pb-4">
              <Label className="text-base font-semibold">Vehicle Assignment</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="space-y-2">
                  <Label>Assign Truck <span className="text-destructive">*</span></Label>
                  <Select required value={formData.truck_id} onValueChange={(v) => handleSelectChange('truck_id', v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Truck Axle Type</Label>
                  <RadioGroup 
                    value={truckAxleType} 
                    onValueChange={(val) => {
                      setTruckAxleType(val);
                      setFormData(prev => ({ ...prev, axle_position: '' }));
                    }}
                    className="flex items-center gap-4 pt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single_axle" id="type-single" />
                      <Label htmlFor="type-single" className="cursor-pointer font-normal">Single (6)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multi_axle" id="type-multi" />
                      <Label htmlFor="type-multi" className="cursor-pointer font-normal">Multi (8)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Tyre Position <span className="text-destructive">*</span></Label>
                  <Select required value={formData.axle_position} onValueChange={(v) => handleSelectChange('axle_position', v)} disabled={!formData.truck_id}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={!formData.truck_id ? "Select a truck first" : "Select Position"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.length === 0 && formData.truck_id ? (
                        <SelectItem value="none" disabled>All positions filled</SelectItem>
                      ) : (
                        renderPositionGroups(availablePositions)
                      )}
                    </SelectContent>
                  </Select>
                  {availablePositions.length === 0 && formData.truck_id && (
                    <p className="text-xs text-destructive mt-1">This truck has no available tyre slots.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serial Number <span className="text-destructive">*</span></Label>
              <Input 
                required 
                className="rounded-xl"
                value={formData.serial_number}
                onChange={e => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input 
                type="date"
                className="rounded-xl"
                value={formData.purchase_date}
                onChange={e => setFormData({...formData, purchase_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand <span className="text-destructive">*</span></Label>
              <Input 
                required 
                className="rounded-xl"
                value={formData.tyre_brand}
                onChange={e => setFormData({...formData, tyre_brand: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Model No <span className="text-destructive">*</span></Label>
              <Input 
                required 
                className="rounded-xl"
                value={formData.model_no}
                onChange={e => setFormData({...formData, model_no: e.target.value})}
              />
            </div>

            <div className="space-y-2 border-t border-border/50 pt-4 md:col-span-2">
              <Label className="text-base font-semibold block mb-3">Tyre Condition</Label>
            </div>

            <div className="space-y-2">
              <Label>Tyre Depth (mm) <span className="text-destructive">*</span></Label>
              <Input 
                type="number"
                min="0"
                step="0.1"
                required 
                className="rounded-xl"
                value={formData.tyre_depth_mm}
                onChange={e => setFormData({...formData, tyre_depth_mm: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Status <span className="text-destructive">*</span></Label>
              <Select required value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                  <SelectItem value="replaced">Replaced</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tyre_depth_mm && !isNaN(Number(formData.tyre_depth_mm)) && (
            <TyreDepthIndicator depthMm={Number(formData.tyre_depth_mm)} className="bg-muted/30 border-transparent shadow-none" />
          )}

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl shadow-sm" disabled={loading || (availablePositions.length === 0 && !!formData.truck_id)}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Tyre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}