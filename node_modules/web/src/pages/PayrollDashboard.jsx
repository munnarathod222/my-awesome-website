import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { calculatePaymentStats, generatePayrollCSV, downloadCSV } from '@/lib/SalaryCalculationHelper.js';
import { MoreHorizontal, FileText, CheckCircle, Calculator, Users, DollarSign, PieChart, Download, Loader2, FileSpreadsheet, File, Search, BarChart3, Trash2 } from 'lucide-react';
import PayrollGenerationModal from '@/components/PayrollGenerationModal.jsx';
import PaymentModal from '@/components/PaymentModal.jsx';
import BulkPaymentModal from '@/components/BulkPaymentModal.jsx';
import PayslipPreviewModal from '@/components/PayslipPreviewModal.jsx';
import AdvancePayslipModal from '@/components/AdvancePayslipModal.jsx';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('register');
  
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [isBulkPaymentOpen, setIsBulkPaymentOpen] = useState(false);
  const [payslipModalId, setPayslipModalId] = useState(null);
  const [advanceModalId, setAdvanceModalId] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('payroll').getFullList({
        filter: `payroll_month=${selectedMonth} && payroll_year=${selectedYear}`,
        sort: '-net_salary',
        $autoCancel: false
      });

      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const advRecords = await pb.collection('advances').getFullList({
        filter: `date >= '${startOfMonth}' && date <= '${endOfMonth} 23:59:59'`,
        $autoCancel: false
      });

      const recordsWithAdvances = records.map(r => ({
        ...r,
        advances: advRecords.filter(a => a.employee_id === r.employee_id_relation)
      }));

      setPayrollRecords(recordsWithAdvances);
      setStats(calculatePaymentStats(recordsWithAdvances));
      setSelectedIds([]);
    } catch (error) {
      console.error('[PayrollDashboard] Fetch error:', error);
      toast.error('Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = payrollRecords.filter(record => 
    record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (record.designation && record.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleMarkAsPaidClick = (record) => {
    setSelectedIds([record.id]);
    setIsBulkPaymentOpen(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to permanently delete this payroll record?")) {
      return;
    }
    
    try {
      const res = await apiServerClient.fetch(`/payroll/${recordId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payroll record deleted successfully");
        fetchPayroll();
      } else {
        toast.error(data.error || "Failed to delete payroll record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete payroll record");
    }
  };

  const handleExportReport = async (formatType) => {
    if (filteredRecords.length === 0) {
      toast.warning('No payroll data to export for this selection.');
      return;
    }

    setExporting(true);
    try {
      const exportData = filteredRecords.map(r => ({
        'Employee Name': r.employee_name,
        'Designation': r.designation || 'N/A',
        'Month/Year': `${r.payroll_month}/${r.payroll_year}`,
        'Base Salary': r.base_salary,
        'Trip Bonus': r.trip_bonus,
        'Deductions': r.attendance_deduction,
        'Advances': r.driver_advances,
        'Net Salary': r.net_salary,
        'Status': (r.payment_status || 'draft').toUpperCase(),
        'Payment Mode': r.payment_mode || 'N/A',
        'Payment Date': r.payment_date ? format(new Date(r.payment_date), 'yyyy-MM-dd') : 'N/A'
      }));

      const fileNameBase = `Payroll_Report_${selectedMonth}_${selectedYear}`;

      if (formatType === 'csv') {
        const csvContent = generatePayrollCSV(filteredRecords);
        downloadCSV(csvContent, `${fileNameBase}.csv`);
        toast.success('CSV Report exported successfully');
      } 
      else if (formatType === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
        XLSX.writeFile(workbook, `${fileNameBase}.xlsx`);
        toast.success('Excel Report exported successfully');
      } 
      else if (formatType === 'pdf') {
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text(`Payroll Report - ${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}`, 14, 15);
        
        const tableColumn = Object.keys(exportData[0]);
        const tableRows = exportData.map(obj => Object.values(obj));
        
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 25,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
        
        doc.save(`${fileNameBase}.pdf`);
        toast.success('PDF Report exported successfully');
      }
    } catch (error) {
      console.error('[PayrollDashboard] Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Payroll Dashboard - Jai Bhavani Cargo</title>
      </Helmet>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">Calculate, review, and disburse employee salaries</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-[200px] bg-card border-border shadow-sm"
              />
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] bg-card border-border shadow-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 12}).map((_, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()}>
                    {format(new Date(2000, i, 1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-card border-border shadow-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-background shadow-sm" disabled={exporting || filteredRecords.length === 0}>
                  {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportReport('csv')}>
                  <FileText className="w-4 h-4 mr-2" /> Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportReport('excel')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                  <File className="w-4 h-4 mr-2" /> Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setIsGenerateOpen(true)} className="gap-2 shadow-sm rounded-xl">
              <Calculator className="w-4 h-4" /> Generate Payslips
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card shadow-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalEmployees || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-muted text-foreground rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold tracking-tight">₹{(stats.totalAmount || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-success/10 text-success rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold tracking-tight text-success">₹{(stats.totalPaid || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.paidCount || 0} employees cleared</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Pending Liability</p>
                <p className="text-2xl font-bold tracking-tight text-destructive truncate">₹{(stats.totalPending || 0).toLocaleString()}</p>
                <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-destructive h-full rounded-full transition-all" style={{ width: `${100 - (stats.completionPercentage || 0)}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[500px] bg-muted/50 p-1 rounded-xl mb-6 border border-border">
            <TabsTrigger 
              value="register" 
              className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Payslip Register</span>
              <span className="sm:hidden">Register</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-6 animate-in fade-in duration-300">
            <Card className="shadow-md border-border rounded-2xl overflow-hidden bg-card">
              <div className="p-5 border-b border-border flex flex-wrap justify-between items-center bg-muted/10 gap-4">
                <h2 className="font-semibold text-lg">Payslip Register</h2>
                {selectedIds.length > 0 && (
                  <Button size="sm" onClick={() => setIsBulkPaymentOpen(true)} className="bg-success text-success-foreground hover:bg-success/90 gap-2">
                    <CheckCircle className="w-4 h-4" /> Clear {selectedIds.length} Payments
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        <Checkbox 
                          checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length} 
                          onCheckedChange={handleSelectAll} 
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Staff Member</TableHead>
                      <TableHead className="text-right">Base Salary</TableHead>
                      <TableHead className="text-right">Earnings (+)</TableHead>
                      <TableHead className="text-right">Deductions (-)</TableHead>
                      <TableHead className="text-right">Advances (-)</TableHead>
                      <TableHead className="text-right">Net Payable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Options</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-50" />
                            Fetching register...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p>No payroll records found for {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}</p>
                            {!searchQuery && (
                              <Button variant="link" onClick={() => setIsGenerateOpen(true)} className="mt-2 text-primary">Generate Now</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map(record => (
                        <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedIds.includes(record.id)} 
                              onCheckedChange={() => toggleSelect(record.id)} 
                              aria-label={`Select ${record.employee_name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{record.employee_name}</div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{record.designation}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{record.base_salary.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-success">{record.trip_bonus > 0 ? `+₹${record.trip_bonus.toLocaleString()}` : '-'}</TableCell>
                          <TableCell className="text-right text-destructive">{record.attendance_deduction > 0 ? `-₹${record.attendance_deduction.toLocaleString()}` : '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className={record.driver_advances > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
                                {record.driver_advances > 0 ? `-₹${record.driver_advances.toLocaleString()}` : '-'}
                              </span>
                              {record.advances?.length > 0 && (
                                <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                                  {record.advances.length} Advance(s)
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">₹{record.net_salary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              record.payment_status === 'paid' ? 'bg-success/10 text-success border-success/20' : 
                              record.payment_status === 'processing' ? 'bg-warning/10 text-warning border-warning/20' : 
                              'bg-destructive/10 text-destructive border-destructive/20'
                            }>
                              {record.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {record.advances?.length > 0 ? (
                                  <DropdownMenuItem onClick={() => setAdvanceModalId(record.id)} className="cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" /> View Advance/Payslip
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => setPayslipModalId(record.id)} className="cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" /> View Payslip
                                  </DropdownMenuItem>
                                )}
                                {record.payment_status !== 'paid' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsPaidClick(record)} className="cursor-pointer font-medium text-success focus:bg-success/10 focus:text-success">
                                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteRecord(record.id)} className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card shadow-sm border-border rounded-xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Payment Status Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Paid</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{width: `${(stats.paidCount || 0) / (stats.totalEmployees || 1) * 100}%`}}></div>
                        </div>
                        <span className="text-sm font-medium">{stats.paidCount || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-warning" style={{width: `${((stats.totalEmployees || 0) - (stats.paidCount || 0)) / (stats.totalEmployees || 1) * 100}%`}}></div>
                        </div>
                        <span className="text-sm font-medium">{(stats.totalEmployees || 0) - (stats.paidCount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm border-border rounded-xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Total Payroll</span>
                      <span className="font-bold text-foreground">₹{(stats.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Total Paid</span>
                      <span className="font-bold text-success">₹{(stats.totalPaid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Pending Liability</span>
                      <span className="font-bold text-destructive">₹{(stats.totalPending || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <PayrollGenerationModal 
        isOpen={isGenerateOpen} 
        onClose={() => setIsGenerateOpen(false)} 
        selectedMonth={Number(selectedMonth)} 
        selectedYear={Number(selectedYear)}
        onSuccess={fetchPayroll} 
      />

      <PaymentModal 
        isOpen={!!paymentRecord} 
        onClose={() => setPaymentRecord(null)} 
        payrollRecord={paymentRecord} 
        onSuccess={fetchPayroll} 
      />

      <BulkPaymentModal 
        isOpen={isBulkPaymentOpen} 
        onClose={() => setIsBulkPaymentOpen(false)} 
        selectedRecords={selectedIds} 
        onSuccess={fetchPayroll} 
      />

      <PayslipPreviewModal 
        isOpen={!!payslipModalId} 
        onClose={() => setPayslipModalId(null)} 
        payrollId={payslipModalId} 
      />

      <AdvancePayslipModal 
        isOpen={!!advanceModalId} 
        onClose={() => setAdvanceModalId(null)} 
        payrollId={advanceModalId} 
      />
    </div>
  );
};

export default PayrollDashboard;