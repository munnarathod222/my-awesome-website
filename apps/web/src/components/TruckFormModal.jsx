import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UploadCloud, X } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import DocumentFilePreview from './DocumentFilePreview';

const AXLE_TYRE_MAP = {
  'SXL': 6,
  '2XL': 10,
  '3XL': 12,
  '4XL': 14,
  '5XL': 16
};

export default function TruckFormModal({ isOpen, onClose, truck, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    truck_name: '',
    truck_number: '',
    truck_size: '24 FT',
    truck_axle: 'SXL',
    tyre_count: 6,
    status: 'active',
    base_odometer: 0,
    ownership_type: 'Owned',
    manager_id: 'none'
  });

  const [bodyImagesList, setBodyImagesList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch dynamic user records whose system roles are flagged as "manager" or "dispatcher" (Operations Lead)
      pb.collection('users').getFullList({
        filter: 'role = "manager" || role = "dispatcher"',
        sort: 'full_name',
        $autoCancel: false
      })
      .then(setManagers)
      .catch(err => console.error('Failed to fetch managers:', err));

      if (truck) {
        setFormData({
          truck_name: truck.truck_name || '',
          truck_number: truck.truck_number || '',
          truck_size: truck.truck_size || '24 FT',
          truck_axle: truck.truck_axle || 'SXL',
          tyre_count: truck.tyre_count || 6,
          status: truck.status || 'active',
          base_odometer: truck.base_odometer || 0,
          ownership_type: truck.ownership_type || 'Owned',
          manager_id: truck.manager_id || 'none'
        });
        const existing = (truck.body_images || []).map((img, idx) => ({
          key: `existing-${idx}-${img}`,
          file: img,
          isNew: false
        }));
        setBodyImagesList(existing);
        setDeletedFiles([]);
      } else {
        setFormData({
          truck_name: '',
          truck_number: '',
          truck_size: '24 FT',
          truck_axle: 'SXL',
          tyre_count: 6,
          status: 'active',
          base_odometer: 0,
          ownership_type: 'Owned',
          manager_id: 'none'
        });
        setBodyImagesList([]);
        setDeletedFiles([]);
      }
    }
  }, [isOpen, truck]);

  const handleAxleChange = (val) => {
    setFormData(prev => ({
      ...prev,
      truck_axle: val,
      tyre_count: AXLE_TYRE_MAP[val] || 6
    }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (filesList) => {
    const validFiles = [];
    for (const file of filesList) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 20MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const totalFilesCount = bodyImagesList.length + validFiles.length;
      if (totalFilesCount > 10) {
        toast.error("You can upload a maximum of 10 body images.");
        return;
      }
      const newItems = validFiles.map((file, idx) => ({
        key: `new-${Date.now()}-${idx}-${Math.random()}`,
        file: file,
        isNew: true
      }));
      setBodyImagesList((prev) => [...prev, ...newItems]);
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
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (itemToRemove) => {
    if (!itemToRemove.isNew) {
      setDeletedFiles((prev) => [...prev, itemToRemove.file]);
    }
    setBodyImagesList((prev) => prev.filter((item) => item.key !== itemToRemove.key));
  };

  const handleMoveItem = (fromIdx, toIdx) => {
    setBodyImagesList((prev) => {
      const copy = [...prev];
      const temp = copy[fromIdx];
      copy[fromIdx] = copy[toIdx];
      copy[toIdx] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('truck_name', formData.truck_name);
      formDataToSend.append('truck_number', formData.truck_number);
      formDataToSend.append('truck_size', formData.truck_size);
      formDataToSend.append('truck_axle', formData.truck_axle);
      formDataToSend.append('tyre_count', String(formData.tyre_count));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('base_odometer', String(formData.base_odometer || 0));
      formDataToSend.append('ownership_type', formData.ownership_type);
      formDataToSend.append('manager_id', formData.manager_id === 'none' ? '' : formData.manager_id);

      // Separate new files
      const newItems = bodyImagesList.filter(item => item.isNew);
      newItems.forEach((item) => {
        formDataToSend.append('body_images', item.file);
      });

      if (truck?.id) {
        deletedFiles.forEach((filename) => {
          formDataToSend.append('body_images.' + filename, '');
        });
      }

      let updatedRecord;
      if (truck?.id) {
        updatedRecord = await pb.collection('trucks').update(truck.id, formDataToSend, { $autoCancel: false });
      } else {
        updatedRecord = await pb.collection('trucks').create(formDataToSend, { $autoCancel: false });
      }

      // Reorder filenames according to bodyImagesList order
      const startingExistingNames = truck?.body_images || [];
      const returnedNames = updatedRecord.body_images || [];
      const newFilenamesInReturned = returnedNames.filter(name => !startingExistingNames.includes(name));

      let newFileIdx = 0;
      const finalOrderedFilenames = bodyImagesList.map(item => {
        if (item.isNew) {
          const name = newFilenamesInReturned[newFileIdx];
          newFileIdx++;
          return name;
        } else {
          return item.file;
        }
      }).filter(Boolean);

      if (finalOrderedFilenames.length > 0) {
        await pb.collection('trucks').update(updatedRecord.id, {
          body_images: finalOrderedFilenames
        }, { $autoCancel: false });
      }

      toast.success(truck ? 'Truck updated successfully' : 'Truck created successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save truck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{truck ? 'Edit Truck' : 'Add New Truck'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Truck Name <span className="text-destructive">*</span></Label>
            <Input required value={formData.truck_name} onChange={e => setFormData({...formData, truck_name: e.target.value})} placeholder="e.g. Volvo FH16" />
          </div>
          <div className="space-y-2">
            <Label>Registration Number <span className="text-destructive">*</span></Label>
            <Input required value={formData.truck_number} onChange={e => setFormData({...formData, truck_number: e.target.value})} placeholder="e.g. MH 04 AB 1234" />
          </div>
          <div className="space-y-2">
            <Label>Ownership Type <span className="text-destructive">*</span></Label>
            <Select value={formData.ownership_type} onValueChange={v => setFormData({...formData, ownership_type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned Vehicle (Type A)</SelectItem>
                <SelectItem value="Attached">Attached Vehicle (Type B - Brokerage)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Truck Size <span className="text-destructive">*</span></Label>
              <Select value={formData.truck_size} onValueChange={v => setFormData({...formData, truck_size: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24 FT">24 FT</SelectItem>
                  <SelectItem value="32 FT">32 FT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Axle Type <span className="text-destructive">*</span></Label>
              <Select value={formData.truck_axle} onValueChange={handleAxleChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(AXLE_TYRE_MAP).map(axle => (
                    <SelectItem key={axle} value={axle}>{axle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tyre Count</Label>
              <Input readOnly value={formData.tyre_count} className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Base Odometer (KM)</Label>
              <Input type="number" min="0" value={formData.base_odometer} onChange={e => setFormData({...formData, base_odometer: parseInt(e.target.value) || 0})} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign Fleet Manager</Label>
            <Select value={formData.manager_id} onValueChange={v => setFormData({...formData, manager_id: v})}>
              <SelectTrigger><SelectValue placeholder="Select Fleet Manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assigned</SelectItem>
                {managers.map(mgr => (
                  <SelectItem key={mgr.id} value={mgr.id}>
                    {mgr.full_name || mgr.name} ({mgr.role === 'manager' ? 'Manager' : 'Operations Lead'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Truck Body Images upload section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground ml-1">Truck Body Images (Optional)</Label>
            
            <div 
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                className="hidden" 
                accept="image/*"
              />
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Drag & drop body images here, or <span className="text-primary hover:underline">browse</span></p>
              <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG, WEBP up to 20MB each (max 10 images)</p>
            </div>

            {/* File previews */}
            {bodyImagesList.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-4 max-h-60 overflow-y-auto pr-1">
                {bodyImagesList.map((item, idx) => (
                  <DocumentFilePreview
                    key={item.key}
                    file={item.file}
                    docRecord={item.isNew ? null : truck}
                    onDelete={() => handleRemoveFile(item)}
                    isNew={item.isNew}
                    onMoveUp={idx > 0 ? () => handleMoveItem(idx, idx - 1) : null}
                    onMoveDown={idx < bodyImagesList.length - 1 ? () => handleMoveItem(idx, idx + 1) : null}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Truck
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}