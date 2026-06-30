import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, X, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DeliveryProofUpload = () => {
  const [files, setFiles] = useState([]);
  const [docType, setDocType] = useState('Proof of Delivery');
  const [description, setDescription] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [files]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    let validFiles = newFiles.filter(f => validTypes.includes(f.type) && f.size <= MAX_FILE_SIZE);
    let rejectedCount = newFiles.length - validFiles.length;

    if (rejectedCount > 0) {
      toast.error(`${rejectedCount} file(s) rejected (invalid format or over 10MB)`);
    }

    if (files.length + validFiles.length > MAX_FILES) {
      validFiles = validFiles.slice(0, MAX_FILES - files.length);
      toast.warning(`Maximum ${MAX_FILES} files allowed.`);
    }

    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const toRemove = prev.find(f => f.id === id);
      if (toRemove && toRemove.preview) URL.revokeObjectURL(toRemove.preview);
      return filtered;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please upload at least one file.');
      return;
    }
    
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Delivery proof documents uploaded successfully!');
      setFiles([]);
      setDocType('Proof of Delivery');
      setDescription('');
      setRefNumber('');
    }, 1500);
  };

  return (
    <Card className="bg-card border-border shadow-md rounded-2xl overflow-hidden mt-8">
      <CardHeader className="bg-muted/30 border-b border-border pb-4 pt-6">
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileUp className="w-6 h-6 text-primary" /> Delivery Proof Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType} required>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delivery Receipt">Delivery Receipt</SelectItem>
                  <SelectItem value="Proof of Delivery">Proof of Delivery</SelectItem>
                  <SelectItem value="Shipment Invoice">Shipment Invoice</SelectItem>
                  <SelectItem value="Tracking Document">Tracking Document</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Reference Number</Label>
              <Input 
                required 
                placeholder="Enter Shipment/Tracking No." 
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Description / Notes</Label>
            <Textarea 
              placeholder="Any additional details about the documents..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-background min-h-[100px]"
            />
          </div>

          {/* Drag & Drop Area */}
          <div className="space-y-3">
            <Label>Upload Files (Max 5 files, 10MB each. JPG, PNG, PDF, DOCX)</Label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-200
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}
              `}
            >
              <input 
                type="file" 
                multiple 
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-16 h-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4 pointer-events-none">
                <FileUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Drag & Drop files here</h3>
              <p className="text-muted-foreground text-sm">or click to browse from your device</p>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Files ({files.length}/{MAX_FILES})</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {files.map((f) => (
                    <motion.div 
                      key={f.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative border border-border rounded-xl p-3 flex items-center gap-3 bg-background group shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {f.preview ? (
                          <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            size="lg"
            disabled={isUploading || files.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14"
          >
            {isUploading ? 'Uploading...' : 'Submit Documents'} 
            {!isUploading && <CheckCircle2 className="w-5 h-5 ml-2" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryProofUpload;