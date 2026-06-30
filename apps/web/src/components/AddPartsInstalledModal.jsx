import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import TruckSelector from './TruckSelector.jsx';

export default function AddPartsInstalledModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    truck_id: '',
    part_name: '',
    part_number: '',
    description: '',
    serial_number: '',
    installation_date: '',
    warranty_expiration_date: '',
    cost: '',
    supplier_name: ''
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTruckSelect = (truckId) => {
    setFormData((prev) => ({ ...prev, truck_id: truckId }));
  };

  const validateAndAddFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    const newValidFiles = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid image format. Only JPG, JPEG, and PNG are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      newValidFiles.push(file);
    }

    if (newValidFiles.length > 0) {
      setSelectedImages((prev) => {
        const updated = [...prev, ...newValidFiles];
        if (updated.length > maxFiles) {
          toast.error(`You can upload a maximum of ${maxFiles} images.`);
          return updated.slice(0, maxFiles);
        }
        return updated;
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.truck_id) {
      toast.error('Truck ID is required');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'cost') {
        data.append(key, formData.cost ? String(Number(formData.cost)) : '0');
      } else {
        data.append(key, formData[key]);
      }
    });

    selectedImages.forEach((file) => {
      data.append('image_urls', file);
    });

    onSubmit(data);

    // Reset modal states
    setSelectedImages([]);
    setFormData({
      truck_id: '',
      part_name: '',
      part_number: '',
      description: '',
      serial_number: '',
      installation_date: '',
      warranty_expiration_date: '',
      cost: '',
      supplier_name: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Installed Part</DialogTitle>
          <DialogDescription>Record a new part installation and its warranty details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <TruckSelector 
            selectedTruckId={formData.truck_id} 
            onTruckSelect={handleTruckSelect} 
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="part_name">Part Name</Label>
              <Input id="part_name" name="part_name" value={formData.part_name} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number</Label>
              <Input id="part_number" name="part_number" value={formData.part_number} onChange={handleChange} className="bg-background" placeholder="e.g. FILTER-123X" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input id="supplier_name" name="supplier_name" value={formData.supplier_name} onChange={handleChange} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input type="number" step="0.01" id="cost" name="cost" value={formData.cost} onChange={handleChange} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installation_date">Installation Date</Label>
              <Input type="date" id="installation_date" name="installation_date" value={formData.installation_date} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiration_date">Warranty Exp. Date</Label>
              <Input type="date" id="warranty_expiration_date" name="warranty_expiration_date" value={formData.warranty_expiration_date} onChange={handleChange} required className="bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label>Upload Part/Bill Image</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-medium">Drag & drop images here, or <span className="text-primary hover:underline">browse</span></p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Supports JPG, JPEG, PNG up to 5MB (max 10 images)</p>
            </div>
            
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {selectedImages.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 text-[9px] transition-colors w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}