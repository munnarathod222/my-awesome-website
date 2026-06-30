import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const BulkAttendanceUploadModal = ({ isOpen, onClose, onSuccess, employees }) => {
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
    const headers = "Staff Name,Date (YYYY-MM-DD),Status,Check-in Time (HH:MM),Check-out Time (HH:MM),Notes\n";
    const sample = "John Doe,2026-06-08,Present,09:00,18:00,On time\n";
    
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    try {
      const start = new Date(`1970-01-01T${inTime}`);
      const end = new Date(`1970-01-01T${outTime}`);
      let diff = (end - start) / (1000 * 60 * 60);
      if (diff < 0) diff += 24;
      return parseFloat(diff.toFixed(2));
    } catch (e) {
      return 0;
    }
  };

  const processImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        let rows = [];

        if (file.name.endsWith('.csv')) {
          const parsed = Papa.parse(data, { header: true, skipEmptyLines: true });
          rows = parsed.data;
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        if (rows.length === 0) throw new Error('File is empty');

        let successful = 0;
        let failed = 0;
        let errors = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNum = i + 2;
          setProgress(Math.round(((i + 1) / rows.length) * 100));

          try {
            const staffName = row['Staff Name'];
            const dateStr = row['Date (YYYY-MM-DD)'] || row['Date'];
            const status = row['Status'];
            
            if (!staffName) throw new Error('Staff Name is required');
            if (!dateStr) throw new Error('Date is required');
            if (!status) throw new Error('Status is required');

            const employee = employees.find(emp => emp.name.toLowerCase() === staffName.toLowerCase());
            if (!employee) throw new Error(`Employee '${staffName}' not found in database`);

            const validStatuses = ['Present', 'Absent', 'Leave', 'Half Day', 'Work From Home'];
            if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`);

            let parsedDate;
            try {
              const d = new Date(dateStr);
              if (isNaN(d.getTime())) throw new Error();
              parsedDate = format(d, 'yyyy-MM-dd');
            } catch (err) {
              throw new Error(`Invalid Date format: ${dateStr}`);
            }

            const checkIn = row['Check-in Time (HH:MM)'] || row['Check-in Time'] || '';
            const checkOut = row['Check-out Time (HH:MM)'] || row['Check-out Time'] || '';
            const hours = calculateHours(checkIn, checkOut);

            await pb.collection('attendance').create({
              staff_member: employee.id,
              date: parsedDate,
              status: status,
              check_in_time: checkIn,
              check_out_time: checkOut,
              hours_worked: hours,
              notes: row['Notes'] || '',
              marked_by: pb.authStore.model?.id
            }, { $autoCancel: false });

            successful++;
          } catch (err) {
            failed++;
            errors.push({ row: rowNum, error: err.message });
          }
        }

        setResult({ total: rows.length, successful, failed, errors });
        if (successful > 0) {
          toast.success(`Successfully imported ${successful} records`);
          onSuccess();
        }
      } catch (error) {
        toast.error(error.message || "Failed to process file");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('File reading failed');
      setIsProcessing(false);
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
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
          <DialogTitle>Bulk Upload Attendance</DialogTitle>
          <DialogDescription>
            Import attendance records from a CSV or Excel file.
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

export default BulkAttendanceUploadModal;