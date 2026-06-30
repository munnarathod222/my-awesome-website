import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { useDocumentStatus } from '@/hooks/useDocumentStatus.js';
import DocumentFilePreview from './DocumentFilePreview.jsx';

const DocumentModal = ({ isOpen, onClose, document, employeeId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    document_type: 'Aadhar',
    document_name: '',
    issue_date: '',
    expiry_date: ''
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);

  // Auto-calculated status hook
  const calculatedStatus = useDocumentStatus(formData.expiry_date);

  useEffect(() => {
    if (isOpen) {
      if (document) {
        setFormData({
          document_type: document.document_type || 'Aadhar',
          document_name: document.document_name || '',
          issue_date: document.issue_date ? format(new Date(document.issue_date), 'yyyy-MM-dd') : '',
          expiry_date: document.expiry_date ? format(new Date(document.expiry_date), 'yyyy-MM-dd') : ''
        });
        setExistingFiles(document.files || []);
      } else {
        setFormData({
          document_type: 'Aadhar',
          document_name: '',
          issue_date: '',
          expiry_date: ''
        });
        setExistingFiles([]);
      }
      setNewFiles([]);
      setDeletedFiles([]);
    }
  }, [isOpen, document]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (filesToAdd) => {
    const totalCurrentFiles = existingFiles.length + newFiles.length;
    if (totalCurrentFiles + filesToAdd.length > 10) {
      toast.error('Maximum 10 files allowed per document.');
      return;
    }
    
    // Check sizes (20MB limit)
    const validFiles = filesToAdd.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return false;
      }
      return true;
    });

    setNewFiles(prev => [...prev, ...validFiles]);
  };

  const handleDeleteFile = (file, isNew) => {
    if (isNew) {
      setNewFiles(prev => prev.filter(f => f !== file));
    } else {
      setExistingFiles(prev => prev.filter(f => f !== file));
      setDeletedFiles(prev => [...prev, file]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('employee_id', employeeId);
      data.append('document_type', formData.document_type);
      data.append('document_name', formData.document_name);
      data.append('status', calculatedStatus);
      
      if (formData.issue_date) data.append('issue_date', formData.issue_date + ' 12:00:00.000Z');
      if (formData.expiry_date) data.append('expiry_date', formData.expiry_date + ' 12:00:00.000Z');

      // Append new files
      newFiles.forEach(file => {
        data.append('files', file);
      });

      // Handle deleted existing files
      if (document && deletedFiles.length > 0) {
        deletedFiles.forEach(filename => {
          data.append(`files.${filename}`, ''); // PocketBase syntax to delete specific file
        });
      }

      if (document) {
        await pb.collection('employee_documents').update(document.id, data, { $autoCancel: false });
        toast.success('Document updated successfully');
      } else {
        await pb.collection('employee_documents').create(data, { $autoCancel: false });
        toast.success('Document added successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save document. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{document ? 'Edit Document' : 'Add Document'}</DialogTitle>
        </DialogHeader>

        <form id="document-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 py-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={formData.document_type} onValueChange={(val) => setFormData({...formData, document_type: val})}>
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aadhar">Aadhar</SelectItem>
                  <SelectItem value="PAN">PAN</SelectItem>
                  <SelectItem value="Driving License">Driving License</SelectItem>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Bank Details">Bank Details</SelectItem>
                  <SelectItem value="Employment Contract">Employment Contract</SelectItem>
                  <SelectItem value="Medical Certificate">Medical Certificate</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
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
                placeholder="e.g. Renewed License"
                className="bg-input text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label>Issue Date (Optional)</Label>
              <Input 
                type="date" 
                value={formData.issue_date}
                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
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
              {formData.expiry_date && (
                <p className="text-xs text-muted-foreground mt-1">Status will be: <span className="font-semibold">{calculatedStatus}</span></p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Files (Max 10)</Label>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/50'
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
                accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
              />
              <UploadCloud className={`mx-auto h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">Click to upload or drag & drop files</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG, GIF up to 20MB</p>
            </div>

            <div className="space-y-2 mt-4">
              {existingFiles.map((file, idx) => (
                <DocumentFilePreview 
                  key={`existing-${idx}`} 
                  file={file} 
                  docRecord={document} 
                  isNew={false} 
                  onDelete={handleDeleteFile} 
                />
              ))}
              
              {newFiles.map((file, idx) => (
                <DocumentFilePreview 
                  key={`new-${idx}`} 
                  file={file} 
                  isNew={true} 
                  onDelete={handleDeleteFile} 
                />
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t border-border mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="document-form" disabled={loading}>
            {loading ? 'Saving...' : 'Save Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentModal;