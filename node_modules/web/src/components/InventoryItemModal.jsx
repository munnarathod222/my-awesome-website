import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { UploadCloud } from 'lucide-react';

const InventoryItemModal = ({ isOpen, onClose, onSuccess, item }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Truck Parts',
    unit: 'pieces',
    current_stock: 0,
    reorder_level: 0,
    unit_cost: 0,
    supplier_name: '',
    last_restocked_date: '',
    description: ''
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || '',
        category: item.category || 'Truck Parts',
        unit: item.unit || 'pieces',
        current_stock: item.current_stock || 0,
        reorder_level: item.reorder_level || 0,
        unit_cost: item.unit_cost || 0,
        supplier_name: item.supplier_name || '',
        last_restocked_date: item.last_restocked_date ? item.last_restocked_date.split('T')[0] : '',
        description: item.description || ''
      });
      setExistingImages(item.image_urls || []);
      setNewImages([]);
      setDeletedImages([]);
    } else {
      setFormData({
        item_name: '', category: 'Truck Parts', unit: 'pieces', current_stock: 0,
        reorder_level: 0, unit_cost: 0, supplier_name: '', last_restocked_date: '', description: ''
      });
      setExistingImages([]);
      setNewImages([]);
      setDeletedImages([]);
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAndAddFiles = (filesList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const validFiles = [];

    for (const file of filesList) {
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid image format. Only JPG, JPEG, and PNG are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const totalCount = newImages.length + existingImages.length - deletedImages.length + validFiles.length;
      if (totalCount > maxFiles) {
        toast.error(`You can upload a maximum of ${maxFiles} images.`);
        return;
      }
      setNewImages((prev) => [...prev, ...validFiles]);
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

  const handleRemoveImage = (imageToRemove, isNew) => {
    if (isNew) {
      setNewImages((prev) => prev.filter((f) => f !== imageToRemove));
    } else {
      setDeletedImages((prev) => [...prev, imageToRemove]);
      setExistingImages((prev) => prev.filter((f) => f !== imageToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name) {
      toast.error('Item name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        current_stock: Number(formData.current_stock),
        reorder_level: Number(formData.reorder_level),
        unit_cost: Number(formData.unit_cost),
        created_by: currentUser?.id,
        last_restocked_date: formData.last_restocked_date ? new Date(formData.last_restocked_date).toISOString() : null
      };

      const formDataToSend = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formDataToSend.append(key, String(payload[key]));
        }
      });

      newImages.forEach(file => {
        formDataToSend.append('image_urls', file);
      });

      if (item) {
        deletedImages.forEach(filename => {
          formDataToSend.append('image_urls.' + filename, '');
        });
        await pb.collection('inventory_items').update(item.id, formDataToSend, { $autoCancel: false });
        toast.success('Inventory item updated');
      } else {
        await pb.collection('inventory_items').create(formDataToSend, { $autoCancel: false });
        toast.success('Inventory item created');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input name="item_name" value={formData.item_name} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck Parts">Truck Parts</SelectItem>
                  <SelectItem value="Oils & Fluids">Oils & Fluids</SelectItem>
                  <SelectItem value="Ad Blue">Ad Blue</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={formData.unit} onValueChange={(val) => handleSelectChange('unit', val)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input type="number" step="0.01" name="current_stock" value={formData.current_stock} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input type="number" step="0.01" name="reorder_level" value={formData.reorder_level} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost</Label>
              <Input type="number" step="0.01" name="unit_cost" value={formData.unit_cost} onChange={handleChange} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input name="supplier_name" value={formData.supplier_name} onChange={handleChange} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Last Restocked Date</Label>
              <Input type="date" name="last_restocked_date" value={formData.last_restocked_date} onChange={handleChange} className="bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label>Attachment/Bill Preview (Procurement Receipts)</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
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
              <p className="text-sm font-medium">Drag & drop receipt images here, or <span className="text-primary hover:underline">browse</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">Supports JPG, JPEG, PNG up to 5MB (max 10 files)</p>
            </div>

            {/* Thumbnail previews */}
            {(newImages.length > 0 || existingImages.length > 0) && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {existingImages.map((file, idx) => {
                  const url = pb.files.getUrl(item, file);
                  return (
                    <div key={`exist-inv-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border shadow-sm">
                      <img src={url} alt="receipt" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(file, false)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full p-0.5 text-[9px] transition-colors w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                {newImages.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={`new-inv-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border shadow-sm">
                      <img src={url} alt="receipt" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(file, true)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full p-0.5 text-[9px] transition-colors w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 left-1 bg-primary/90 text-primary-foreground text-[8px] px-1 rounded font-semibold">New</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemModal;