import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const TruckDocumentModal = ({ isOpen, onClose, document, truckId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
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
      } else {
        setFormData({
          document_type: 'RC',
          document_name: '',
          expiry_date: ''
        });
      }
      setFile(null);
    }
  }, [isOpen, document]);

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
      
      if (file) {
        data.append('file', file);
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
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground">
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

          <div className="space-y-2">
            <Label>File Attachment</Label>
            <Input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-input text-foreground"
              accept="image/*,.pdf"
            />
            {document && document.file && !file && (
              <p className="text-xs text-muted-foreground mt-1">Current file: {document.file}</p>
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