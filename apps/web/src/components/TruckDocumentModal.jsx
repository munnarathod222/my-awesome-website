import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Trash2, UploadCloud } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

import { generateDocumentFileName } from '@/lib/fileNamingUtils.js';

export function getTruckDocFiles(doc) {
  if (!doc) return [];
  const list = [];
  if (Array.isArray(doc.files)) {
    doc.files.forEach(f => { if (f && typeof f === 'string' && f.trim()) list.push(f.trim()); });
  } else if (typeof doc.files === 'string' && doc.files.trim()) {
    list.push(doc.files.trim());
  }
  if (Array.isArray(doc.file)) {
    doc.file.forEach(f => { if (f && typeof f === 'string' && f.trim()) list.push(f.trim()); });
  } else if (typeof doc.file === 'string' && doc.file.trim()) {
    list.push(doc.file.trim());
  }
  if (typeof doc.back_file === 'string' && doc.back_file.trim()) {
    list.push(doc.back_file.trim());
  }
  return Array.from(new Set(list)).slice(0, 5);
}

const TruckDocumentModal = ({ isOpen, onClose, document, truckId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [formData, setFormData] = useState({
    document_type: 'RC',
    document_name: '',
    expiry_date: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (document) {
        setFormData({
          document_type: document.document_type || 'RC',
          document_name: document.document_name || '',
          expiry_date: document.expiry_date ? format(new Date(document.expiry_date), 'yyyy-MM-dd') : ''
        });
        setExistingFiles(getTruckDocFiles(document));
      } else {
        setFormData({
          document_type: 'RC',
          document_name: '',
          expiry_date: ''
        });
        setExistingFiles([]);
      }
      setNewFiles([]);
    }
  }, [isOpen, document]);

  const handleAddFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const currentTotal = existingFiles.length + newFiles.length;
    const remainingSlots = 5 - currentTotal;
    if (remainingSlots <= 0) {
      toast.error('Maximum 5 files allowed per document.');
      return;
    }
    const filesToAdd = selected.slice(0, remainingSlots);
    if (selected.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more file(s) can be attached (maximum 5 files allowed).`);
    }
    setNewFiles(prev => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculateStatus = (expiryDateStr) => {
    if (!expiryDateStr) return 'Active';
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    const daysDiff = differenceInDays(expiryDate, today);
    
    if (daysDiff < 0) return 'Expired';
    if (daysDiff <= 30) return 'Expiring Soon';
    return 'Active';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('truck_id', truckId);
      data.append('document_type', formData.document_type);
      data.append('document_name', formData.document_name);
      if (formData.expiry_date) {
        data.append('expiry_date', formData.expiry_date + ' 12:00:00.000Z');
      }
      data.append('status', calculateStatus(formData.expiry_date));
      
      // Append kept existing files
      existingFiles.forEach(f => {
        data.append('files', f);
      });

      // Append newly attached files
      newFiles.forEach((f, idx) => {
        const renamedFile = generateDocumentFileName(f, `${formData.document_type}_${existingFiles.length + idx + 1}`, truckId);
        data.append('files', renamedFile);
      });

      // Backward compatibility: set primary 'file' and 'back_file'
      const allFiles = [...existingFiles, ...newFiles];
      if (allFiles.length > 0) {
        const primary = allFiles[0] instanceof File ? generateDocumentFileName(allFiles[0], formData.document_type, truckId) : allFiles[0];
        data.append('file', primary);
      }
      if (allFiles.length > 1) {
        const sec = allFiles[1] instanceof File ? generateDocumentFileName(allFiles[1], `${formData.document_type}_back`, truckId) : allFiles[1];
        data.append('back_file', sec);
      }

      if (document) {
        await pb.collection('truck_documents').update(document.id, data, { $autoCancel: false });
        toast.success('Document updated successfully');
      } else {
        await pb.collection('truck_documents').create(data, { $autoCancel: false });
        toast.success('Document added successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{document ? 'Edit Document' : 'Add Document'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={formData.document_type} onValueChange={(val) => setFormData({...formData, document_type: val})}>
              <SelectTrigger className="bg-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RC">RC</SelectItem>
                <SelectItem value="Road Tax">Road Tax</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Pollution Certificate">Pollution Certificate</SelectItem>
                <SelectItem value="Fitness Certificate">Fitness Certificate</SelectItem>
                <SelectItem value="Permit">Permit</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Document Name (Optional)</Label>
            <Input 
              type="text" 
              value={formData.document_name}
              onChange={(e) => setFormData({...formData, document_name: e.target.value})}
              placeholder="e.g. National Permit 2026"
              className="bg-input text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Expiry Date (Optional)</Label>
            <Input 
              type="date" 
              value={formData.expiry_date} 
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
              className="bg-input text-foreground"
            />
          </div>

          {/* 5 Files Attachments Section */}
          <div className="space-y-3 p-3.5 bg-muted/40 rounded-2xl border border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  Document Attachments (Up to 5 Files)
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Attach front, back, tax challans, receipts, or endorsements (Max 5 files).
                </p>
              </div>
              <Badge variant="outline" className={`font-mono text-[10px] font-bold ${
                (existingFiles.length + newFiles.length) >= 5 
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' 
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {existingFiles.length + newFiles.length} / 5 Files
              </Badge>
            </div>

            {/* List of Attached Files */}
            {(existingFiles.length > 0 || newFiles.length > 0) && (
              <div className="space-y-1.5 pt-1">
                {/* Existing Files from PB */}
                {existingFiles.map((file, idx) => (
                  <div key={`existing-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-background border border-border text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-mono text-[10px] font-bold shrink-0">
                        Doc {idx + 1}
                      </span>
                      <span className="text-foreground truncate font-mono text-[11px]">{file}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a 
                        href={document ? pb.files.getUrl(document, file) : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-[10px] text-primary hover:underline font-bold"
                      >
                        View ↗
                      </a>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => handleRemoveExistingFile(idx)}
                        title="Remove this document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Newly selected files */}
                {newFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-background border border-primary/30 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary font-mono text-[10px] font-bold shrink-0">
                        Doc {existingFiles.length + idx + 1} (New)
                      </span>
                      <span className="text-foreground truncate font-mono text-[11px]">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      onClick={() => handleRemoveNewFile(idx)}
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Drop Zone / Button (if under 5 files) */}
            {(existingFiles.length + newFiles.length) < 5 ? (
              <div className="pt-1">
                <label 
                  htmlFor="multi_truck_doc_input"
                  className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl cursor-pointer transition text-center group"
                >
                  <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition mb-1" />
                  <span className="text-xs font-bold text-foreground">
                    + Add Documents / Pages ({5 - (existingFiles.length + newFiles.length)} remaining)
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Select PDF or Images (Supports multi-select, up to 5 files max)
                  </span>
                  <input 
                    id="multi_truck_doc_input"
                    type="file" 
                    multiple 
                    accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAddFiles}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <p className="text-[11px] text-amber-500 text-center font-medium bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                ✓ Maximum 5 attachments limit reached for this document.
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TruckDocumentModal;
