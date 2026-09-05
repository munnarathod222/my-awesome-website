import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, 
  Truck, ArrowRight, ShieldCheck, RefreshCw, X, Layers, FileCheck, Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format, addYears } from 'date-fns';

const DOC_TYPES = [
  'RC',
  'Insurance',
  'Fitness Certificate',
  'Permit',
  'Pollution Certificate',
  'License',
  'Other'
];

export default function BulkRCUploadModal({ isOpen, onClose, trucks = [], onSuccess }) {
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [batchExpiry, setBatchExpiry] = useState(format(addYears(new Date(), 15), 'yyyy-MM-dd'));
  const [batchDocType, setBatchDocType] = useState('RC');
  const fileInputRef = useRef(null);

  // Intelligent vehicle registration number matching from filename
  const matchTruckFromFilename = (filename) => {
    if (!filename || !trucks || trucks.length === 0) return '';
    const cleanFilename = filename.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // 1. Direct exact or substring match with truck number
    for (const t of trucks) {
      const cleanTruckNo = (t.truck_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanTruckNo && cleanFilename.includes(cleanTruckNo)) {
        return t.id;
      }
    }

    // 2. 4-digit numeric match (e.g. 3690 in TG08W3690)
    const digitMatch = filename.match(/\d{4}/);
    if (digitMatch) {
      const digits = digitMatch[0];
      const found = trucks.find(t => (t.truck_number || '').includes(digits));
      if (found) return found.id;
    }

    // 3. Fallback: match by truck name
    for (const t of trucks) {
      if (t.truck_name && t.truck_name.length > 3) {
        const cleanName = t.truck_name.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleanFilename.includes(cleanName)) return t.id;
      }
    }

    return '';
  };

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;

    const defaultExpiry = format(addYears(new Date(), 15), 'yyyy-MM-dd');
    const defaultIssue = format(new Date(), 'yyyy-MM-dd');

    const newEntries = Array.from(files).map((file, idx) => {
      const matchedTruckId = matchTruckFromFilename(file.name);
      const matchedTruck = trucks.find(t => t.id === matchedTruckId);
      
      return {
        id: `bulk_doc_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        truck_id: matchedTruckId || '',
        document_type: batchDocType,
        document_number: matchedTruck ? matchedTruck.truck_number : '',
        issue_date: defaultIssue,
        expiry_date: batchExpiry || defaultExpiry,
        status: 'pending',
        errorMsg: ''
      };
    });

    setFileList(prev => [...prev, ...newEntries]);
    const matchedCount = newEntries.filter(e => e.truck_id).length;
    if (matchedCount > 0) {
      toast.success(`Loaded ${newEntries.length} files. Auto-matched ${matchedCount} to fleet trucks!`);
    } else {
      toast.info(`Loaded ${newEntries.length} files. Please select trucks.`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleApplyBatchSettings = () => {
    setFileList(prev => prev.map(item => ({
      ...item,
      document_type: batchDocType || item.document_type,
      expiry_date: batchExpiry || item.expiry_date
    })));
    toast.success(`Applied ${batchDocType} & Expiry (${batchExpiry}) to all ${fileList.length} files`);
  };

  const handleRemoveItem = (id) => {
    setFileList(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setFileList(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'truck_id') {
          const t = trucks.find(tr => tr.id === value);
          if (t && !item.document_number) {
            updated.document_number = t.truck_number;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleStartBulkUpload = async () => {
    const unassigned = fileList.filter(f => !f.truck_id);
    if (unassigned.length > 0) {
      return toast.error(`Please assign a truck for all ${fileList.length} documents (${unassigned.length} unassigned).`);
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: fileList.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList[i];
      setUploadProgress({ current: i + 1, total: fileList.length });

      // Update state to uploading
      setFileList(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f));

      try {
        const formData = new FormData();
        formData.append('truck_id', item.truck_id);
        formData.append('document_type', item.document_type || 'RC');
        formData.append('document_number', item.document_number || '');
        formData.append('issue_date', item.issue_date ? new Date(item.issue_date).toISOString() : new Date().toISOString());
        formData.append('expiry_date', item.expiry_date ? new Date(item.expiry_date).toISOString() : new Date(batchExpiry).toISOString());
        formData.append('status', 'Active');
        formData.append('notes', `Bulk uploaded on ${format(new Date(), 'dd MMM yyyy')}`);

        // Binary files
        formData.append('files', item.file);
        formData.append('file', item.file);

        await pb.collection('truck_documents').create(formData, { $autoCancel: false });

        successCount++;
        setFileList(prev => prev.map(f => f.id === item.id ? { ...f, status: 'success' } : f));
      } catch (err) {
        console.error(`Upload error for ${item.name}:`, err);
        failCount++;
        setFileList(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMsg: err.message || 'Upload failed' } : f));
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`🎉 Successfully uploaded ${successCount} vehicle documents to fleet!`);
      onSuccess?.();
      if (failCount === 0) {
        setTimeout(() => {
          setFileList([]);
          onClose();
        }, 1200);
      }
    } else {
      toast.error('Bulk upload failed. Please check files and retry.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] flex flex-col p-0 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground">
                Bulk RC &amp; Vehicle Document Uploader
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Upload RC books, Smart Cards, Insurance, and Permits for up to 50+ trucks at once. Automatically matches files to your fleet vehicles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Dropzone */}
          <div 
            className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 bg-muted/20 hover:bg-emerald-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Click to select or Drag &amp; Drop RC Documents
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports multiple PDF, JPG, PNG files (e.g. <code className="text-emerald-600 font-mono">TG08W3690_RC.pdf</code>, <code className="text-emerald-600 font-mono">MH04AB1234.jpg</code>)
            </p>
          </div>

          {/* Batch Settings Strip (Only if files loaded) */}
          {fileList.length > 0 && (
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Document Type:</span>
                  <Select value={batchDocType} onValueChange={setBatchDocType}>
                    <SelectTrigger className="h-8 w-32 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Expiry:</span>
                  <Input 
                    type="date" 
                    value={batchExpiry} 
                    onChange={e => setBatchExpiry(e.target.value)}
                    className="h-8 w-36 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleApplyBatchSettings}
                  className="h-8 text-xs font-semibold rounded-lg hover:bg-muted"
                >
                  <Layers className="w-3.5 h-3.5 mr-1 text-primary" /> Apply to All ({fileList.length})
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setFileList([])}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Files Review Table */}
          {fileList.length > 0 && (
            <div className="border border-border/70 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-muted/60 px-4 py-2 border-b border-border/70 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>FILE / DOCUMENT ({fileList.length})</span>
                <span>ASSIGNED VEHICLE &amp; EXPIRY</span>
              </div>
              <div className="divide-y divide-border/60 max-h-[300px] overflow-y-auto">
                {fileList.map((item) => {
                  const isSuccess = item.status === 'success';
                  const isUploadingThis = item.status === 'uploading';
                  const isError = item.status === 'error';

                  return (
                    <div key={item.id} className="p-3 hover:bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      {/* Left: File details */}
                      <div className="flex items-center gap-2.5 min-w-0 max-w-[260px]">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.size}</p>
                        </div>
                      </div>

                      {/* Center & Right: Truck selector + Doc details */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Truck Select */}
                        <Select 
                          value={item.truck_id || 'none'} 
                          onValueChange={(val) => handleUpdateItem(item.id, 'truck_id', val === 'none' ? '' : val)}
                          disabled={isUploading}
                        >
                          <SelectTrigger className={`h-8 w-44 text-xs font-mono font-bold ${!item.truck_id ? 'border-amber-500/50 bg-amber-500/10 text-amber-600' : 'bg-background'}`}>
                            <SelectValue placeholder="Select Truck..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            <SelectItem value="none">⚠️ Assign Truck...</SelectItem>
                            {trucks.map(t => (
                              <SelectItem key={t.id} value={t.id} className="font-mono text-xs">
                                🚛 {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Doc Type */}
                        <Select 
                          value={item.document_type} 
                          onValueChange={(val) => handleUpdateItem(item.id, 'document_type', val)}
                          disabled={isUploading}
                        >
                          <SelectTrigger className="h-8 w-24 text-xs bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOC_TYPES.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Expiry Date */}
                        <Input 
                          type="date" 
                          value={item.expiry_date}
                          onChange={(e) => handleUpdateItem(item.id, 'expiry_date', e.target.value)}
                          disabled={isUploading}
                          className="h-8 w-32 text-xs bg-background"
                        />

                        {/* Status / Delete Button */}
                        {isSuccess ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] px-2 py-1">
                            <Check className="w-3 h-3 mr-1" /> Done
                          </Badge>
                        ) : isUploadingThis ? (
                          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                        ) : isError ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                            Failed
                          </Badge>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-7 h-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUploading}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Progress & Upload Trigger */}
        <DialogFooter className="p-4 bg-muted/30 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {isUploading ? (
              <span className="font-bold text-primary flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading {uploadProgress.current} of {uploadProgress.total} documents...
              </span>
            ) : fileList.length > 0 ? (
              <span>Ready to upload <strong>{fileList.length}</strong> vehicle documents</span>
            ) : (
              <span>Select files to begin</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isUploading} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleStartBulkUpload} 
              disabled={isUploading || fileList.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 px-4"
            >
              {isUploading ? 'Uploading...' : `Upload All ${fileList.length} Documents`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
