import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Download, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { parseCSV, validateCSVStructure } from '@/lib/CSVParser.js';

const BulkUploadLayout = ({ 
  title, 
  description, 
  onDownloadTemplate, 
  requiredHeaders,
  onValidateRow, 
  onImport,
  contextData = {}
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    try {
      const { headers, rows } = await parseCSV(file);
      if (rows.length === 0) {
        toast.error('The uploaded CSV file is empty');
        return;
      }

      const structureCheck = validateCSVStructure(headers, requiredHeaders);
      if (!structureCheck.isValid) {
        toast.error(`Missing required headers: ${structureCheck.missingHeaders.join(', ')}`);
        return;
      }

      let validCount = 0;
      let invalidCount = 0;
      const invalidRows = [];

      rows.forEach((row, index) => {
        const { isValid, errors } = onValidateRow(row, index, contextData);
        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
          invalidRows.push({ rowIndex: index + 2, row, errors });
        }
      });

      setFileData({
        file,
        headers,
        rows,
        validation: { total: rows.length, valid: validCount, invalid: invalidCount, invalidRows }
      });
      toast.success(`Parsed ${rows.length} rows successfully`);
    } catch (error) {
      console.error('File parsing error:', error);
      toast.error('Failed to parse the CSV file');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeImport = async () => {
    if (!fileData || fileData.validation.invalid > 0) return;
    setIsImporting(true);
    try {
      await onImport(fileData.rows);
      clearFile();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="grid gap-6 animate-in fade-in duration-500">
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-border">
          <CardTitle className="text-lg">1. Download Template</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">Download the required CSV template to ensure your columns map correctly to our database.</p>
          <Button onClick={onDownloadTemplate} variant="outline" className="shrink-0 gap-2">
            <Download className="w-4 h-4" /> Download Template
          </Button>
        </CardContent>
      </Card>

      {!fileData && (
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-lg">2. Upload Data File</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/10 hover:bg-muted/30'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Drag & Drop your CSV file here</h3>
              <p className="text-sm text-muted-foreground mb-6">Must be a valid .csv file with required headers</p>
              <input ref={fileInputRef} type="file" id={`csv-upload-${title}`} className="hidden" accept=".csv" onChange={handleFileChange} />
              <Button asChild>
                <label htmlFor={`csv-upload-${title}`} className="cursor-pointer">Browse Files</label>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fileData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">3. Validation & Import</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFile} disabled={isImporting}>
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border bg-background">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{fileData.file.name}</p>
                    <p className="text-sm text-muted-foreground">{fileData.validation.total} total rows detected</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1">
                    {fileData.validation.valid} Valid
                  </Badge>
                  {fileData.validation.invalid > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1">
                      {fileData.validation.invalid} Invalid
                    </Badge>
                  )}
                </div>
              </div>

              {fileData.validation.invalid > 0 ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Failed</AlertTitle>
                    <AlertDescription>Found {fileData.validation.invalid} row(s) with errors. Please fix these in your file and try again.</AlertDescription>
                  </Alert>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 rounded-lg border border-border p-2">
                    {fileData.validation.invalidRows.map((invalid, idx) => (
                      <div key={idx} className="p-3 bg-destructive/5 rounded-md text-sm">
                        <p className="font-semibold text-destructive mb-1">Row {invalid.rowIndex}</p>
                        <ul className="list-disc list-inside pl-4 text-muted-foreground">
                          {invalid.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="bg-success/10 border-success/20 text-success">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertTitle>Ready to Import</AlertTitle>
                  <AlertDescription>All {fileData.validation.total} rows have passed validation.</AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button className="w-full sm:w-auto" onClick={executeImport} disabled={fileData.validation.invalid > 0 || isImporting}>
                  {isImporting ? 'Importing Data...' : `Start Import (${fileData.validation.valid} records)`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border">
              <CardTitle className="text-lg">Data Preview</CardTitle>
              <CardDescription>First 5 rows of your uploaded file</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {fileData.headers.map((h, i) => <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileData.rows.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {fileData.headers.map((h, j) => (
                        <TableCell key={j} className="whitespace-nowrap max-w-[200px] truncate">{row[h] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BulkUploadLayout;