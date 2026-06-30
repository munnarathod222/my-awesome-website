import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ImagePlus, X, FileText, UploadCloud } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export const TYRE_SLOTS = [
  { id: 'front_left', label: 'Front Left', axle: 'front_axle' },
  { id: 'front_right', label: 'Front Right', axle: 'front_axle' },
  { id: 'rear_left_1', label: 'Rear Left Outer', axle: 'rear_axle' },
  { id: 'rear_left_2', label: 'Rear Left Inner', axle: 'rear_axle' },
  { id: 'rear_right_1', label: 'Rear Right Inner', axle: 'rear_axle' },
  { id: 'rear_right_2', label: 'Rear Right Outer', axle: 'rear_axle' },
  { id: 'stepney', label: 'Stepney/Spare', axle: 'stepney' }
];

export default function TyreFormModal({ isOpen, onClose, tyre, truck, initialPosition, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // Array of { url, isExisting, name, file }
  const [billPreview, setBillPreview] = useState(null); // { url, isExisting, name, file }
  
  const [formData, setFormData] = useState({
    tyre_position: '',
    purchase_date: '',
    tyre_brand: '',
    model_no: '',
    serial_number: '',
    tyre_depth_mm: '',
    status: 'active',
    assignment_start_kms: '',
    current_lifecycle_kms: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (tyre) {
        setFormData({
          tyre_position: tyre.tyre_position || initialPosition || '',
          purchase_date: tyre.purchase_date ? tyre.purchase_date.split('T')[0] : new Date().toISOString().split('T')[0],
          tyre_brand: tyre.tyre_brand || '',
          model_no: tyre.model_no || '',
          serial_number: tyre.serial_number || '',
          tyre_depth_mm: tyre.tyre_depth_mm || '',
          status: tyre.status || 'active',
          assignment_start_kms: tyre.assignment_start_kms !== undefined ? tyre.assignment_start_kms : '',
          current_lifecycle_kms: tyre.current_lifecycle_kms !== undefined ? tyre.current_lifecycle_kms : ''
        });
        
        // Handle multiple tyre images
        if (tyre.tyre_image) {
          const imgs = Array.isArray(tyre.tyre_image) ? tyre.tyre_image : [tyre.tyre_image];
          setImagePreviews(imgs.filter(Boolean).map(img => ({
            url: pb.files.getURL(tyre, img),
            isExisting: true,
            name: img
          })));
        } else {
          setImagePreviews([]);
        }

        // Handle bill_invoice
        if (tyre.bill_invoice) {
          setBillPreview({
            url: pb.files.getURL(tyre, tyre.bill_invoice),
            isExisting: true,
            name: tyre.bill_invoice
          });
        } else {
          setBillPreview(null);
        }
      } else {
        setFormData({
          tyre_position: initialPosition || '',
          purchase_date: new Date().toISOString().split('T')[0],
          tyre_brand: '',
          model_no: '',
          serial_number: '',
          tyre_depth_mm: '',
          status: 'active',
          assignment_start_kms: '',
          current_lifecycle_kms: '0'
        });
        setImagePreviews([]);
        setBillPreview(null);
      }
    }
  }, [isOpen, tyre, initialPosition]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        isExisting: false,
        file: file
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const item = imagePreviews[index];
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (!item.isExisting && item.url) {
      URL.revokeObjectURL(item.url);
    }
  };

  const handleBillChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (billPreview && !billPreview.isExisting && billPreview.url) {
        URL.revokeObjectURL(billPreview.url);
      }
      setBillPreview({
        url: URL.createObjectURL(file),
        isExisting: false,
        file: file
      });
    }
  };

  const removeBill = () => {
    if (billPreview && !billPreview.isExisting && billPreview.url) {
      URL.revokeObjectURL(billPreview.url);
    }
    setBillPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('truck_id', truck.id);
      data.append('tyre_position', formData.tyre_position);
      
      const slotDef = TYRE_SLOTS.find(s => s.id === formData.tyre_position);
      data.append('axle_position', slotDef ? slotDef.axle : 'single_axle');
      
      data.append('tyre_brand', formData.tyre_brand);
      data.append('model_no', formData.model_no);
      data.append('serial_number', formData.serial_number);
      data.append('tyre_depth_mm', Number(formData.tyre_depth_mm));
      data.append('status', formData.status);
      
      if (formData.purchase_date) {
        data.append('purchase_date', formData.purchase_date);
      }

      // Odometer fields calculation & appending
      let finalStartKms = formData.assignment_start_kms;
      if (!tyre?.id && !finalStartKms) {
        try {
          const historicalTrips = await pb.collection('trip_logs').getFullList({
            filter: `truck_number = "${truck.truck_number}" && trip_status = "Completed" && date < "${formData.purchase_date}"`,
            $autoCancel: false
          });
          finalStartKms = historicalTrips.reduce((sum, t) => sum + (t.kms || 0), 0);
        } catch (err) {
          console.error("Failed to precalculate assignment start KMs:", err);
          finalStartKms = 0;
        }
      }
      data.append('assignment_start_kms', Number(finalStartKms) || 0);
      data.append('current_lifecycle_kms', Number(formData.current_lifecycle_kms) || 0);

      // Append tyre images
      // For existing images to keep, we append their names.
      // For new image files, we append the file objects.
      let hasImage = false;
      imagePreviews.forEach(item => {
        if (item.isExisting) {
          data.append('tyre_image', item.name);
          hasImage = true;
        } else if (item.file) {
          data.append('tyre_image', item.file);
          hasImage = true;
        }
      });
      // If updating and all images were cleared, send empty string to clear the field.
      if (!hasImage && tyre?.tyre_image) {
        data.append('tyre_image', '');
      }

      // Append bill/invoice file
      if (billPreview) {
        if (billPreview.file) {
          data.append('bill_invoice', billPreview.file);
        } else if (billPreview.isExisting) {
          data.append('bill_invoice', billPreview.name);
        }
      } else if (tyre?.bill_invoice) {
        data.append('bill_invoice', '');
      }

      if (tyre?.id) {
        await pb.collection('tyres').update(tyre.id, data, { $autoCancel: false });
        toast.success('Tyre updated successfully');
      } else {
        await pb.collection('tyres').create(data, { $autoCancel: false });
        toast.success('Tyre added successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save tyre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[650px] rounded-3xl p-0 overflow-hidden border-border/50 shadow-lg">
        <DialogHeader className="bg-secondary/30 p-6 border-b border-border/50">
          <DialogTitle className="font-heading text-2xl tracking-tight">
            {tyre ? 'Edit Tyre Details' : 'Add New Tyre'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tyre Position <span className="text-destructive">*</span></Label>
                <Select required value={formData.tyre_position} onValueChange={v => setFormData({...formData, tyre_position: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Position" /></SelectTrigger>
                  <SelectContent>
                    {TYRE_SLOTS.map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>{slot.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Brand <span className="text-destructive">*</span></Label>
                  <Input required className="rounded-xl" value={formData.tyre_brand} onChange={e => setFormData({...formData, tyre_brand: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Model No <span className="text-destructive">*</span></Label>
                  <Input required className="rounded-xl" value={formData.model_no} onChange={e => setFormData({...formData, model_no: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Serial Number <span className="text-destructive">*</span></Label>
                <Input required className="rounded-xl" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tread Depth (mm) <span className="text-destructive">*</span></Label>
                  <Input type="number" step="0.1" min="0" required className="rounded-xl" value={formData.tyre_depth_mm} onChange={e => setFormData({...formData, tyre_depth_mm: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status <span className="text-destructive">*</span></Label>
                  <Select required value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="worn">Worn</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="replaced">Replaced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Fitment Odometer (KM)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    className="rounded-xl" 
                    value={formData.assignment_start_kms} 
                    onChange={e => setFormData({...formData, assignment_start_kms: e.target.value})} 
                    placeholder={tyre ? "e.g. 120000" : "Auto-calculate"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Lifecycle (KM)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    className="rounded-xl" 
                    value={formData.current_lifecycle_kms} 
                    onChange={e => setFormData({...formData, current_lifecycle_kms: e.target.value})} 
                    placeholder="e.g. 0"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Image Upload & Bill/Invoice */}
            <div className="space-y-6 flex flex-col">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Tyre Photos</Label>
                <div className="grid grid-cols-2 gap-3 min-h-[140px] border border-border/50 rounded-2xl p-3 bg-muted/10">
                  {imagePreviews.map((item, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-background shadow-sm">
                      <img src={item.url} alt={`Tyre preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl relative flex flex-col items-center justify-center min-h-[90px] aspect-video bg-muted/20 cursor-pointer">
                    <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[11px] font-medium text-muted-foreground">Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      title="Upload tyre photos"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Upload Bill/Invoice</Label>
                {billPreview ? (
                  <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-background shadow-sm">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium truncate max-w-[180px]">
                        {billPreview.isExisting ? 'Uploaded Bill/Invoice' : billPreview.file?.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                      onClick={removeBill}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 relative flex flex-col items-center justify-center bg-muted/20 cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium text-foreground">Click to upload bill/invoice</span>
                    <span className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG up to 20MB</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleBillChange}
                      title="Upload invoice"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
          
          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading || !formData.tyre_position} className="rounded-xl shadow-sm">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tyre ? 'Save Changes' : 'Add Tyre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}