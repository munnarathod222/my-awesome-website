import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  UploadCloud, FileSpreadsheet, ClipboardPaste, Download, 
  CheckCircle, AlertTriangle, ArrowRight, X 
} from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ImportHistorySection from '@/components/ImportHistorySection.jsx';

// Required columns for validation
const EXPECTED_COLUMNS = [
  'Trip Date', 'Truck No', 'Driver Name', 'Route', 
  'Distance (KM)', 'Fuel Used (Liters)', 'Fuel Amount (₹)', 
  'FASTag Amount (₹)', 'Driver Advance (₹)', 'Maintenance Cost (₹)', 
  'Miscellaneous Cost (₹)', 'Notes'
];

const BulkTripUploadPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('csv');
  const [pasteData, setPasteData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Reference data for validation
  const [trucks, setTrucks] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [trucksRes, employeesRes] = await Promise.all([
        pb.collection('trucks').getFullList({ $autoCancel: false }),
        pb.collection('employees').getFullList({ filter: 'employee_type="driver"', $autoCancel: false })
      ]);
      setTrucks(trucksRes.map(t => t.truck_number.toUpperCase()));
      setEmployees(employeesRes.map(e => e.name.toUpperCase()));
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error('Failed to load reference data for validation.');
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([EXPECTED_COLUMNS]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'trip_bulk_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e, isExcel = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processRawData(data);
        } catch (error) {
          toast.error('Invalid Excel file.');
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRawData(results.data);
        },
        error: () => {
          toast.error('Error parsing CSV file.');
          setIsProcessing(false);
        }
      });
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteSubmit = () => {
    if (!pasteData.trim()) return;
    setIsProcessing(true);
    
    // Attempt to guess separator (tab or comma)
    const separator = pasteData.indexOf('\t') > -1 ? '\t' : ',';
    
    Papa.parse(pasteData, {
      delimiter: separator,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          processRawData(results.data);
        } else {
          toast.error('No valid data found in paste.');
          setIsProcessing(false);
        }
      },
      error: () => {
        toast.error('Failed to parse pasted data.');
        setIsProcessing(false);
      }
    });
  };

  const processRawData = (data) => {
    if (!data || data.length === 0) {
      toast.error('File is empty or invalid format.');
      setIsProcessing(false);
      return;
    }

    const validated = data.map((row, index) => {
      const errors = [];
      const rowIndex = index + 2; // +1 for 0-index, +1 for header

      // Helper to cleanly get values regardless of exact casing, assuming standard template
      const getVal = (key) => {
        const exactKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
        return exactKey ? row[exactKey] : undefined;
      };

      const date = getVal('Trip Date');
      const truck = getVal('Truck No');
      const driver = getVal('Driver Name');
      const route = getVal('Route');
      const distance = getVal('Distance (KM)');
      const fuelLiters = getVal('Fuel Used (Liters)');
      
      const numFields = {
        distance: distance ? parseFloat(distance) : 0,
        fuelLiters: fuelLiters ? parseFloat(fuelLiters) : 0,
        fuelAmount: parseFloat(getVal('Fuel Amount (₹)') || 0),
        fastag: parseFloat(getVal('FASTag Amount (₹)') || 0),
        advance: parseFloat(getVal('Driver Advance (₹)') || 0),
        maint: parseFloat(getVal('Maintenance Cost (₹)') || 0),
        misc: parseFloat(getVal('Miscellaneous Cost (₹)') || 0),
      };

      // Validations
      if (!date) errors.push('Trip Date is required');
      else if (isNaN(Date.parse(date))) errors.push('Invalid Date format (use YYYY-MM-DD)');

      if (!truck) errors.push('Truck No is required');
      else if (!trucks.includes(truck.toString().trim().toUpperCase())) errors.push(`Truck '${truck}' not found in database`);

      if (!driver) errors.push('Driver Name is required');
      else if (!employees.includes(driver.toString().trim().toUpperCase())) errors.push(`Driver '${driver}' not found in database`);

      if (!route) errors.push('Route is required');

      // Check numeric fields
      if (isNaN(numFields.distance)) errors.push('Distance must be a number');
      if (isNaN(numFields.fuelLiters)) errors.push('Fuel Used must be a number');

      return {
        originalRow: index,
        rowNum: rowIndex,
        data: {
          date: date,
          truck: truck,
          driver: driver,
          route: route,
          notes: getVal('Notes') || '',
          ...numFields
        },
        isValid: errors.length === 0,
        errors
      };
    });

    setValidationResults(validated);
    setIsProcessing(false);
  };

  const clearData = () => {
    setValidationResults([]);
    setPasteData('');
    setProgress(0);
  };

  const confirmImport = async () => {
    const validRows = validationResults.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    let successCount = 0;
    let failedCount = 0;
    const importErrors = [];
    const createdRecords = []; // Store IDs for potential undo

    const totalSteps = validRows.length;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i].data;
      try {
        const tripDateStr = new Date(row.date).toISOString().replace('T', ' ');

        // 1. Create Trip Log
        const tripData = {
          date: tripDateStr,
          driver_name: row.driver,
          truck_number: row.truck,
          route: row.route,
          kms: row.distance,
          mileage: (row.distance > 0 && row.fuelLiters > 0) ? +(row.distance / row.fuelLiters).toFixed(2) : 0,
          created_by: currentUser.id
        };
        const tripRecord = await pb.collection('trip_logs').create(tripData, { $autoCancel: false });
        createdRecords.push({ collection: 'trip_logs', id: tripRecord.id });

        // 2. Create Expenses if > 0
        if (row.fuelAmount > 0) {
          const res = await pb.collection('expenses_fuel').create({
            date: tripDateStr,
            amount: row.fuelAmount,
            liters: row.fuelLiters,
            truck_number: row.truck,
            notes: `Bulk Import - Trip ID: ${tripRecord.id}`,
            created_by: currentUser.id
          }, { $autoCancel: false });
          createdRecords.push({ collection: 'expenses_fuel', id: res.id });
        }

        if (row.fastag > 0) {
          const res = await pb.collection('expenses_fastag').create({
            date: tripDateStr,
            amount: row.fastag,
            truck_number: row.truck,
            payment_mode: 'Bank Transfer', // Default for bulk
            notes: `Bulk Import - Trip ID: ${tripRecord.id}`,
            created_by: currentUser.id
          }, { $autoCancel: false });
          createdRecords.push({ collection: 'expenses_fastag', id: res.id });
        }

        if (row.advance > 0) {
          const res = await pb.collection('expenses_driver_advance').create({
            date: tripDateStr,
            amount: row.advance,
            driver_name: row.driver,
            payment_mode: 'Cash', // Default
            notes: `Bulk Import - Trip ID: ${tripRecord.id}`,
            created_by: currentUser.id
          }, { $autoCancel: false });
          createdRecords.push({ collection: 'expenses_driver_advance', id: res.id });
        }

        if (row.maint > 0) {
          const res = await pb.collection('expenses_maintenance').create({
            date: tripDateStr,
            amount: row.maint,
            truck_number: row.truck,
            service: 'Bulk Import Maintenance',
            service_provider_name: 'Unknown',
            payment_mode: 'Cash',
            notes: `Bulk Import - Trip ID: ${tripRecord.id}`,
            created_by: currentUser.id
          }, { $autoCancel: false });
          createdRecords.push({ collection: 'expenses_maintenance', id: res.id });
        }

        if (row.misc > 0) {
          const res = await pb.collection('expenses_miscellaneous').create({
            date: tripDateStr,
            amount: row.misc,
            truck_number: row.truck,
            expense_description: 'Bulk Import Misc',
            payment_mode: 'Cash',
            notes: `Bulk Import - Trip ID: ${tripRecord.id}`,
            created_by: currentUser.id
          }, { $autoCancel: false });
          createdRecords.push({ collection: 'expenses_miscellaneous', id: res.id });
        }

        successCount++;
      } catch (err) {
        console.error('Row insert error:', err);
        failedCount++;
        importErrors.push({ row: validRows[i].rowNum, message: err.message });
      }

      setProgress(Math.round(((i + 1) / totalSteps) * 100));
    }

    // Record History
    try {
      // Append initial validation errors as well
      const allErrors = [
        ...validationResults.filter(r => !r.isValid).map(r => ({ row: r.rowNum, message: r.errors.join(' | ') })),
        ...importErrors
      ];

      await pb.collection('bulk_upload_history').create({
        upload_date: new Date().toISOString(),
        user_id: currentUser.id,
        total_rows: validationResults.length,
        successful_imports: successCount,
        failed_rows: validationResults.length - successCount,
        error_details: JSON.stringify({ errors: allErrors, created_records: createdRecords })
      }, { $autoCancel: false });
    } catch (e) {
      console.error('Failed to save history:', e);
    }

    setIsUploading(false);
    toast.success(`Import complete! ${successCount} trips added.`);
    setRefreshHistory(prev => prev + 1);
    clearData();
  };

  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;

  return (
    <>
      <Helmet>
        <title>Bulk Trip Upload - Jai Bhavani Cargo</title>
      </Helmet>
      
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Bulk Trip Upload</h1>
              <p className="text-muted-foreground mt-1">Import multiple trips and associated expenses at once.</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="bg-background">
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>

          {!validationResults.length > 0 ? (
            <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-6 pb-2 border-b border-border">
                    <TabsList className="bg-muted w-full max-w-md grid grid-cols-3">
                      <TabsTrigger value="csv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">CSV</TabsTrigger>
                      <TabsTrigger value="excel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Excel</TabsTrigger>
                      <TabsTrigger value="paste" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Paste Data</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="csv" className="mt-0 outline-none">
                      <div className="dropzone relative">
                        <input 
                          type="file" 
                          accept=".csv" 
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, false)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Drag & drop your CSV file here</p>
                            <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="excel" className="mt-0 outline-none">
                      <div className="dropzone relative">
                        <input 
                          type="file" 
                          accept=".xlsx, .xls" 
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, true)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Drag & drop your Excel file here</p>
                            <p className="text-sm text-muted-foreground mt-1">Accepts .xlsx and .xls formats</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="paste" className="mt-0 outline-none space-y-4">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <ClipboardPaste className="w-4 h-4" />
                        <span className="text-sm">Paste tab-separated data directly from Excel or Google Sheets</span>
                      </div>
                      <Textarea 
                        placeholder="Paste data here... (Make sure to include headers exactly matching the template)"
                        className="min-h-[200px] font-mono text-sm bg-background whitespace-pre"
                        value={pasteData}
                        onChange={(e) => setPasteData(e.target.value)}
                      />
                      <Button onClick={handlePasteSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Parse Data
                      </Button>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Validation Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Rows</p>
                      <h3 className="text-3xl font-bold">{validationResults.length}</h3>
                    </div>
                    <FileSpreadsheet className="w-8 h-8 text-muted-foreground opacity-50" />
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-success">Valid Ready</p>
                      <h3 className="text-3xl font-bold text-success">{validCount}</h3>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success opacity-50" />
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">Errors Found</p>
                      <h3 className="text-3xl font-bold text-destructive">{invalidCount}</h3>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
                  </CardContent>
                </Card>
              </div>

              {invalidCount > 0 && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Issues Detected</AlertTitle>
                  <AlertDescription>
                    We found issues in {invalidCount} rows. Invalid rows will be skipped during import. You can either proceed with the valid rows or cancel to fix your file.
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview Table */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={clearData} disabled={isUploading}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button 
                      onClick={confirmImport} 
                      disabled={validCount === 0 || isUploading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isUploading ? 'Importing...' : 'Confirm Import'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isUploading && (
                    <div className="p-6 border-b border-border bg-muted/20">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Importing {validCount} rows...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow>
                          <TableHead className="w-[80px]">Row</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Truck</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead className="text-right">Distance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.map((res) => (
                          <TableRow key={res.rowNum} className={!res.isValid ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-mono text-muted-foreground">{res.rowNum}</TableCell>
                            <TableCell>
                              {res.isValid ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 border-0">Valid</Badge>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 border-0 w-fit">Error</Badge>
                                  <span className="text-[11px] text-destructive leading-tight max-w-[200px] block">
                                    {res.errors.join(', ')}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{res.data.date}</TableCell>
                            <TableCell className="font-mono">{res.data.truck}</TableCell>
                            <TableCell>{res.data.driver}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={res.data.route}>{res.data.route}</TableCell>
                            <TableCell className="text-right font-medium">{res.data.distance} km</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Import History */}
          <ImportHistorySection refreshTrigger={refreshHistory} />

        </div>
      </div>
    </>
  );
};

export default BulkTripUploadPage;