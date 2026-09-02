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

const parseImageList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch(e) {}
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

const AXLE_TYRE_MAP = {
  'SXL': 6,
  '2XL': 10,
  '3XL': 12,
  '4XL': 14,
  '5XL': 16
};

const TRUCK_SIZES = [
  { value: '14 FT', label: '14 FT' },
  { value: '17 FT', label: '17 FT' },
  { value: '20 FT', label: '20 FT' },
  { value: '24 FT', label: '24 FT' },
  { value: '32 FT', label: '32 FT' },
];

const PAYLOAD_OPTIONS = [
  { value: '1 Ton',   label: '1 Ton' },
  { value: '2 Ton',   label: '2 Ton' },
  { value: '3 Ton',   label: '3 Ton' },
  { value: '5 Ton',   label: '5 Ton' },
  { value: '7 Ton',   label: '7 Ton' },
  { value: '9 Ton',   label: '9 Ton' },
  { value: '10 Ton',  label: '10 Ton' },
  { value: '12 Ton',  label: '12 Ton' },
  { value: '15 Ton',  label: '15 Ton' },
  { value: '18 Ton',  label: '18 Ton' },
  { value: '20 Ton',  label: '20 Ton' },
  { value: '21 Ton',  label: '21 Ton' },
  { value: '22 Ton',  label: '22 Ton' },
  { value: '24 Ton',  label: '24 Ton' },
  { value: '25 Ton',  label: '25 Ton' },
];

import apiServerClient from '@/lib/apiServerClient.js';

export default function TruckFormModal({ isOpen, onClose, truck, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    truck_name: '',
    truck_number: '',
    truck_size: '24 FT',
    truck_axle: 'SXL',
    tyre_count: 6,
    status: 'active',
    base_odometer: 0,
    ownership_type: 'Owned',
    manager_id: 'none',
    assigned_driver_id: 'none',
    fastag_id: '',
    current_fastag_balance: '',
    payload_capacity: '',
    body_length: '',
    body_width: '',
    body_height: ''
  });

  const [bodyImagesList, setBodyImagesList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const withTimeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Truck save timed out — please try again')), ms))
    ]);

    try {
      const payload = {
        truck_name: formData.truck_name,
        truck_number: formData.truck_number,
        truck_size: formData.truck_size,
        truck_axle: formData.truck_axle,
        tyre_count: Number(formData.tyre_count) || 6,
        status: formData.status,
        base_odometer: Number(formData.base_odometer) || 0,
        ownership_type: formData.ownership_type,
        manager_id: formData.manager_id === 'none' ? '' : formData.manager_id,
        fastag_id: formData.fastag_id || '',
        current_fastag_balance: parseFloat(formData.current_fastag_balance) || 0,
        payload_capacity: formData.payload_capacity || '',
        body_length: parseFloat(formData.body_length) || 0,
        body_width: parseFloat(formData.body_width) || 0,
        body_height: parseFloat(formData.body_height) || 0,
      };

      const newItems = bodyImagesList.filter(item => item.isNew);
      let saved = false;

      // Step 1: Try backend API (superuser) if modifying existing truck without new files
      if (truck?.id && newItems.length === 0 && deletedFiles.length === 0) {
        try {
          const apiRes = await withTimeout(apiServerClient.fetch(`/driver/update-truck/${truck.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }), 15000);

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.success) {
              saved = true;
            }
          }
        } catch (apiErr) {
          console.warn('Backend truck update API notice, trying SDK direct:', apiErr.message);
        }
      }

      // Step 2: Fallback to PocketBase SDK directly
      if (!saved) {
        const formDataToSend = new FormData();
        Object.keys(payload).forEach(key => {
          formDataToSend.append(key, String(payload[key]));
        });

        // Separate existing files that are not deleted (for form data compatibility)
        const existingItems = bodyImagesList.filter(item => !item.isNew);
        existingItems.forEach((item) => {
          formDataToSend.append('body_images', item.file);
        });

        // Append actual new File objects
        newItems.forEach((item) => {
          if (item.file instanceof File) {
            formDataToSend.append('body_images', item.file);
          }
        });

        if (truck?.id) {
          deletedFiles.forEach((filename) => {
            formDataToSend.append('body_images.' + filename, '');
          });
        }

        let updatedRecord;
        if (truck?.id) {
          updatedRecord = await withTimeout(pb.collection('trucks').update(truck.id, formDataToSend, { $autoCancel: false }), 20000);
        } else {
          updatedRecord = await withTimeout(pb.collection('trucks').create(formDataToSend, { $autoCancel: false }), 20000);
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
      }

      // Handle Dedicated Driver Assignment Synchronization
      const targetTruckId = truck?.id || updatedRecord?.id;
      if (targetTruckId) {
        if (formData.assigned_driver_id && formData.assigned_driver_id !== 'none') {
          const selectedDriver = drivers.find(d => d.id === formData.assigned_driver_id);
          if (selectedDriver) {
            const otherDrivers = drivers.filter(d => d.assigned_truck === targetTruckId && d.id !== selectedDriver.id);
            for (const od of otherDrivers) {
              await pb.collection('employees').update(od.id, { assigned_truck: '' }, { $autoCancel: false }).catch(() => {});
            }
            await pb.collection('employees').update(selectedDriver.id, { assigned_truck: targetTruckId }, { $autoCancel: false }).catch(() => {});
            await pb.collection('trucks').update(targetTruckId, {
              assigned_driver_name: selectedDriver.name,
              assigned_driver_phone: selectedDriver.phone || '',
              driver_name: selectedDriver.name,
              driver_phone: selectedDriver.phone || ''
            }, { $autoCancel: false }).catch(() => {});
          }
        } else if (formData.assigned_driver_id === 'none') {
          const otherDrivers = drivers.filter(d => d.assigned_truck === targetTruckId);
          for (const od of otherDrivers) {
            await pb.collection('employees').update(od.id, { assigned_truck: '' }, { $autoCancel: false }).catch(() => {});
          }
          await pb.collection('trucks').update(targetTruckId, {
            assigned_driver_name: '',
            assigned_driver_phone: '',
            driver_name: '',
            driver_phone: ''
          }, { $autoCancel: false }).catch(() => {});
        }
      }

      toast.success(truck ? 'Truck updated successfully' : 'Truck created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Truck save error:', error);
      toast.error(`Failed to save truck: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch dynamic user records whose system roles are flagged as "manager" or "dispatcher"
      pb.collection('users').getFullList({
        filter: 'role = "manager" || role = "dispatcher"',
        sort: 'full_name',
        $autoCancel: false
      })
      .then(setManagers)
      .catch(err => console.error('Failed to fetch managers:', err));

      // Fetch drivers from employees table
      pb.collection('employees').getFullList({
        sort: 'name',
        $autoCancel: false
      })
      .then(res => {
        const dList = (res || []).filter(e => {
          const type = (e.employee_type || '').toLowerCase();
          return type.includes('driver') || (!type.includes('manager') && !type.includes('admin') && !type.includes('accountant'));
        });
        setDrivers(dList);
        if (truck) {
          const tName = (truck.assigned_driver_name || truck.driver_name || '').trim().toLowerCase();
          const assigned = dList.find(d => d.assigned_truck === truck.id || (tName && d.name?.trim().toLowerCase() === tName));
          if (assigned) {
            setFormData(prev => ({ ...prev, assigned_driver_id: assigned.id }));
          }
        }
      })
      .catch(err => console.error('Failed to fetch drivers:', err));

      if (truck) {
        const tName = (truck.assigned_driver_name || truck.driver_name || '').trim().toLowerCase();
        const preAssigned = drivers.find(d => d.assigned_truck === truck.id || (tName && d.name?.trim().toLowerCase() === tName));
        setFormData(prev => ({
          truck_name: truck.truck_name || '',
          truck_number: truck.truck_number || '',
          truck_size: truck.truck_size || '24 FT',
          truck_axle: truck.truck_axle || 'SXL',
          tyre_count: truck.tyre_count || 6,
          status: truck.status || 'active',
          base_odometer: truck.base_odometer || 0,
          ownership_type: truck.ownership_type || 'Owned',
          manager_id: truck.manager_id || 'none',
          assigned_driver_id: preAssigned ? preAssigned.id : (prev.assigned_driver_id || 'none'),
          fastag_id: truck.fastag_id || '',
          current_fastag_balance: truck.current_fastag_balance?.toString() || '',
          payload_capacity: truck.payload_capacity || '',
          body_length: truck.body_length?.toString() || '',
          body_width: truck.body_width?.toString() || '',
          body_height: truck.body_height?.toString() || ''
        });
        const existing = parseImageList(truck.body_images).map((img, idx) => ({
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
          manager_id: 'none',
          fastag_id: '',
          current_fastag_balance: '',
          payload_capacity: '',
          body_length: '',
          body_width: '',
          body_height: ''
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

  // Combined into main handleSubmit above

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
          {/* ── Truck Configuration Section ── */}
          <div className="pt-2 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Truck Configuration</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Truck Size <span className="text-destructive">*</span></Label>
              <Select value={formData.truck_size} onValueChange={v => setFormData({...formData, truck_size: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRUCK_SIZES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
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

          {/* Payload Capacity */}
          <div className="space-y-2">
            <Label>Payload Capacity</Label>
            <Select value={formData.payload_capacity || 'none'} onValueChange={v => setFormData({...formData, payload_capacity: v === 'none' ? '' : v})}>
              <SelectTrigger><SelectValue placeholder="Select payload capacity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {PAYLOAD_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body Dimensions L×W×H */}
          <div className="space-y-2">
            <Label>Body Dimensions (feet)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Length</p>
                <Input
                  type="number" step="0.1" min="0"
                  value={formData.body_length}
                  onChange={e => setFormData({...formData, body_length: e.target.value})}
                  placeholder="e.g. 24"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Width</p>
                <Input
                  type="number" step="0.1" min="0"
                  value={formData.body_width}
                  onChange={e => setFormData({...formData, body_width: e.target.value})}
                  placeholder="e.g. 7.5"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Height</p>
                <Input
                  type="number" step="0.1" min="0"
                  value={formData.body_height}
                  onChange={e => setFormData({...formData, body_height: e.target.value})}
                  placeholder="e.g. 7"
                />
              </div>
            </div>
            {(formData.body_length || formData.body_width || formData.body_height) && (
              <p className="text-[11px] text-muted-foreground mt-1">
                📐 {formData.body_length || '—'} × {formData.body_width || '—'} × {formData.body_height || '—'} ft
              </p>
            )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign Dedicated Driver</Label>
              <Select value={formData.assigned_driver_id || 'none'} onValueChange={v => setFormData({...formData, assigned_driver_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Driver" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {drivers.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      👤 {d.name} {d.assigned_truck && d.assigned_truck !== truck?.id ? '(On another truck)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign Fleet Manager</Label>
              <Select value={formData.manager_id || 'none'} onValueChange={v => setFormData({...formData, manager_id: v})}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>FASTag ID (Optional)</Label>
              <Input value={formData.fastag_id} onChange={e => setFormData({...formData, fastag_id: e.target.value})} placeholder="FASTag ID" />
            </div>
            <div className="space-y-2">
              <Label>FASTag Balance (₹)</Label>
              <Input type="number" step="0.01" value={formData.current_fastag_balance} onChange={e => setFormData({...formData, current_fastag_balance: e.target.value})} placeholder="0.00" />
            </div>
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