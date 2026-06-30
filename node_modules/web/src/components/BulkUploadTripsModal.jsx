import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { processBulkTrips } from '@/lib/BulkUploadTripsProcessor.js';

const BulkUploadTripsModal = ({ isOpen, onClose, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.match(/\.(csv|xlsx|xls)$/)) {
        setFile(droppedFile);
      } else {
        toast.error("Invalid file type. Please upload CSV or Excel.");
      }
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "Trip Date,Truck No,Driver Name,Starting Location,Ending Location,Distance (KM),Fuel Used (Liters),Toll Amount (₹),FASTag Amount (₹),Driver Advance (₹),Maintenance Cost (₹),Miscellaneous Cost (₹),Trip Status,Notes\n";
    const sample = "2026-06-08,MH12AB1234,John Doe,Mumbai,Delhi,1400,250,1500,2000,5000,0,500,completed,Test trip\n";
    
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const importResult = await processBulkTrips(file, (p) => setProgress(p));
      setResult(importResult);
      if (importResult.successful > 0) {
        toast.success(`Successfully imported ${importResult.successful} trips`);
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetState();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Bulk Upload Trips</DialogTitle>
          <DialogDescription>
            Import multiple trips and related expenses from a CSV or Excel file.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Need the template?</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}
              `}
            >
              {!file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Drag & Drop your file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">Supports .CSV, .XLS, .XLSX</p>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="secondary">Browse Files</Button>
                  </div>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-12 h-12 text-primary mb-3" />
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove file</Button>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing file...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
              <Button onClick={processImport} disabled={!file || isProcessing} className="bg-primary">
                {isProcessing ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4 text-center">
            <div className="flex justify-center mb-4">
              {result.failed === 0 ? (
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-warning" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold">Import Complete</h3>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-3xl font-bold text-success">{result.successful}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-3xl font-bold text-destructive">{result.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="text-left bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-sm max-h-40 overflow-y-auto">
                <p className="font-semibold text-destructive mb-2">Error Details:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-destructive/80">Row {err.row}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-4">
              {result.failed > 0 && <Button variant="outline" onClick={resetState}>Try Again</Button>}
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadTripsModal;