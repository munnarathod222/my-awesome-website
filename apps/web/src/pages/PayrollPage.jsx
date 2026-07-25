import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { cn } from '@/lib/utils.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Users, IndianRupee, TrendingUp, Calculator, Search, CheckCircle2, Clock, AlertCircle, RefreshCw, Pencil } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import AdvancePayslipModal from '@/components/AdvancePayslipModal.jsx';
import AdvanceHistoryModal from '@/components/AdvanceHistoryModal.jsx';
import PayrollGenerationModal from '@/components/PayrollGenerationModal.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdvanceSyncStatus } from '@/hooks/useAdvanceSyncStatus.js';
import { calculateCyclePayroll } from '@/lib/payrollCycleUtils.js';
import { format } from 'date-fns';

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advance Records State
  const [advanceRecords, setAdvanceRecords] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState('');
  const [advanceStatusFilter, setAdvanceStatusFilter] = useState('all');
  const [recordsLoading, setRecordsLoading] = useState(false);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [advanceModalEmployee, setAdvanceModalEmployee] = useState(null);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  
  // Payroll Cycle Edit State
  const [editingCycleEmployee, setEditingCycleEmployee] = useState(null);
  const [cycleForm, setCycleForm] = useState({ startDay: 1, endDay: 30, disbursementDay: 10 });
  const [isSavingCycle, setIsSavingCycle] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const { validateSync, syncResults } = useAdvanceSyncStatus();

  const fetchData = async () => {
    try {
      const [emps, advs, pays, atts] = await Promise.all([
        pb.collection('employees').getFullList({ $autoCancel: false }),
        pb.collection('advances').getFullList({ $autoCancel: false }),
        pb.collection('payroll').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('attendance').getFullList({ $autoCancel: false })
      ]);
      setEmployees(emps);
      setAdvances(advs);
      setPayments(pays);
      setAttendanceRecords(atts);
    } catch (error) {
      console.error("[PayrollPage] Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvanceRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await apiServerClient.fetch('/advances/with-employee-details/list');
      const data = await res.json();
      if (data.success) {
        setAdvanceRecords(data.advances);
        // Validate sync for top 5 pending advances to show status
        const pending = data.advances.filter(a => a.status === 'Pending').slice(0, 5);
        pending.forEach(a => validateSync(a.id));
      }
    } catch (error) {
      console.error("Failed to fetch advance records:", error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleSaveCycle = async (e) => {
    e?.preventDefault();
    if (!editingCycleEmployee) return;
    setIsSavingCycle(true);
    try {
      await pb.collection('employees').update(editingCycleEmployee.id, {
        payroll_cycle_start_day: Number(cycleForm.startDay) || 1,
        payroll_cycle_end_day: Number(cycleForm.endDay) || 30,
        salary_disbursement_day: Number(cycleForm.disbursementDay) || 10
      }, { $autoCancel: false });
      toast.success(`Updated payroll cycle for ${editingCycleEmployee.name}`);
      setEditingCycleEmployee(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payroll cycle');
    } finally {
      setIsSavingCycle(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAdvanceRecords();

    pb.collection('advances').subscribe('*', () => { fetchData(); fetchAdvanceRecords(); });
    pb.collection('payroll').subscribe('*', () => fetchData());
    pb.collection('attendance').subscribe('*', () => fetchData());

    return () => {
      pb.collection('advances').unsubscribe('*');
      pb.collection('payroll').unsubscribe('*');
      pb.collection('attendance').unsubscribe('*');
    };
  }, []);

  const getCalculatedPayroll = () => {
    const currentDate = new Date();

    return employees.map(emp => {
      const calc = calculateCyclePayroll(emp, attendanceRecords, advances, currentDate);

      const empPayments = payments.filter(p => p.employee_id === emp.id && p.payroll_month === (currentDate.getMonth() + 1) && p.payroll_year === currentDate.getFullYear());
      const isSettled = empPayments.length > 0 && empPayments[0].payment_status === 'paid';

      return {
        ...emp,
        baseSalary: calc.baseSalary,
        adjustedBaseSalary: calc.adjustedBaseSalary,
        presentDays: calc.presentDays,
        totalWorkingDays: calc.totalWorkingDays,
        activeDays: calc.activeDays,
        totalAdvances: calc.totalAdvances,
        grossSalary: calc.grossSalary,
        taxDeductions: calc.taxDeductions,
        netPayout: calc.netPayout,
        payDate: calc.payDate,
        cycleInfo: calc.cycleInfo,
        status: calc.status,
        statusLabel: calc.statusLabel,
        isSettled
      };
    });
  };

  const calculatedPayroll = getCalculatedPayroll();
  const totalAdvancesAmount = advances.filter(a => a.status === 'Pending').reduce((sum, a) => sum + (Number(a.remaining_balance ?? a.amount) || 0), 0);
  const totalPaidAmount = payments.reduce((sum, p) => sum + (Number(p.net_salary || p.amount) || 0), 0);

  // Filter Advance Records
  const filteredAdvanceRecords = advanceRecords.filter(record => {
    const matchesSearch = record.employee_name?.toLowerCase().includes(advanceSearch.toLowerCase()) || 
                          record.notes?.toLowerCase().includes(advanceSearch.toLowerCase());
    const matchesStatus = advanceStatusFilter === 'all' || record.status?.toLowerCase() === advanceStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Get recent deductions from payroll records
  const recentDeductions = payments
    .filter(p => p.advance_deductions_details && p.advance_deductions_details.length > 0)
    .slice(0, 10)
    .flatMap(p => p.advance_deductions_details.map(d => ({
      ...d,
      employee_name: p.employee_name,
      payroll_month: p.payroll_month,
      payroll_year: p.payroll_year
    })));

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <Helmet>
        <title>Payroll & Salary | Dashboard</title>
      </Helmet>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground" style={{letterSpacing: '-0.02em'}}>
              Payroll Hub
            </h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-prose leading-relaxed">
              Process salaries, manage employee advances, and integrate attendance deductions seamlessly.
            </p>
          </div>
          <Button onClick={() => setIsGenerationModalOpen(true)} className="rounded-xl gap-2 shadow-sm whitespace-nowrap">
            <Calculator className="w-4 h-4" /> Generate Payroll
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-muted/50 p-1 rounded-xl mb-8 border border-border">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" /><span className="hidden sm:inline">Directory</span>
            </TabsTrigger>
            <TabsTrigger value="advances" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <IndianRupee className="w-4 h-4" /><span className="hidden sm:inline">Advances</span>
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Deductions</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4" /><span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Active Payroll Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="font-semibold py-4 pl-6">Employee Details</TableHead>
                        <TableHead className="font-semibold text-right">Base Salary</TableHead>
                        <TableHead className="font-semibold">Payroll Cycle & Pay Date</TableHead>
                        <TableHead className="font-semibold text-right">Present / Working</TableHead>
                        <TableHead className="font-semibold text-right">Advances</TableHead>
                        <TableHead className="font-semibold text-right text-primary font-bold">Net Payout</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                        <TableHead className="font-semibold text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="pl-6"><Skeleton className="h-10 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                            <TableCell className="pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : calculatedPayroll.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">No employees found.</TableCell>
                        </TableRow>
                      ) : (
                        calculatedPayroll.map(emp => (
                          <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="py-4 pl-6">
                              <div className="font-medium text-foreground">{emp.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 capitalize">{emp.position || emp.employee_type} • Joined {emp.joining_date ? emp.joining_date.split(' ')[0] : 'N/A'}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums text-muted-foreground">
                              ₹{emp.baseSalary.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center justify-between gap-2 group">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-xs text-foreground">
                                    🗓️ {emp.cycleInfo?.formattedCycleRange}
                                  </span>
                                  <span className="text-[11px] font-semibold text-primary">
                                    💳 Pay Date: {emp.cycleInfo?.formattedPayDate}
                                  </span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setEditingCycleEmployee(emp);
                                    setCycleForm({
                                      startDay: emp.payroll_cycle_start_day || 1,
                                      endDay: emp.payroll_cycle_end_day || 30,
                                      disbursementDay: emp.salary_disbursement_day || 10
                                    });
                                  }}
                                  title="Change payroll cycle start/end dates"
                                >
                                  <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums text-muted-foreground">
                              {emp.presentDays} / {emp.totalWorkingDays} days
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums text-warning">
                              {emp.totalAdvances > 0 ? `₹${emp.totalAdvances.toLocaleString()}` : '₹0'}
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums text-primary">
                              ₹{emp.netPayout.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {emp.isSettled ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Settled</Badge>
                              ) : emp.status === 'due_soon' ? (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Due on {emp.payDate}</Badge>
                              ) : emp.status === 'overdue' ? (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Overdue Pay</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Action Required</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="outline" size="sm" onClick={() => setSelectedEmployeeId(emp.id)} className="bg-background">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View (Hidden on desktop) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-3">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    ))
                  ) : calculatedPayroll.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground p-6">No employees found.</div>
                  ) : (
                    calculatedPayroll.map(emp => (
                      <div key={emp.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-bold text-sm text-foreground">{emp.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{emp.position || emp.employee_type}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-primary">₹{emp.netPayout.toLocaleString()}</p>
                            <Badge variant="outline" className={cn(
                              "text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 mt-1 border-transparent",
                              emp.isSettled ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                            )}>
                              {emp.isSettled ? 'Settled' : 'Action Req'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Base Salary</p>
                            <p className="font-medium text-foreground mt-0.5">₹{emp.baseSalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Attendance</p>
                            <p className="font-medium text-foreground mt-0.5">{emp.presentDays}/{emp.totalWorkingDays}d</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Advances</p>
                            <p className="font-medium text-warning mt-0.5">{emp.totalAdvances > 0 ? `₹${emp.totalAdvances.toLocaleString()}` : '₹0'}</p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-border/20">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEmployeeId(emp.id)} className="h-7 text-xs bg-background">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advances" className="space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-warning" /> Advance Records
                  </CardTitle>
                  <CardDescription>Track all advances, remaining balances, and repayment progress.</CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employee..." 
                      value={advanceSearch}
                      onChange={(e) => setAdvanceSearch(e.target.value)}
                      className="pl-9 bg-background rounded-xl"
                    />
                  </div>
                  <Select value={advanceStatusFilter} onValueChange={setAdvanceStatusFilter}>
                    <SelectTrigger className="w-[130px] bg-background rounded-xl">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="font-semibold py-4 pl-6">Employee</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Amount Given</TableHead>
                        <TableHead className="font-semibold text-right">Remaining</TableHead>
                        <TableHead className="font-semibold w-[200px]">Repayment Progress</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                        <TableHead className="font-semibold text-center">Sync</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recordsLoading ? (
                        <TableRow><TableCell colSpan={7}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
                      ) : filteredAdvanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No advance records found.</TableCell>
                        </TableRow>
                      ) : (
                        filteredAdvanceRecords.map(record => {
                          const amount = record.amount || 0;
                          const remaining = record.remaining_balance ?? amount;
                          const recovered = amount - remaining;
                          const progressPct = amount > 0 ? (recovered / amount) * 100 : 0;
                          const syncStatus = syncResults[record.id];
                          
                          return (
                            <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium py-4 pl-6">{record.employee_name}</TableCell>
                              <TableCell className="text-muted-foreground">{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                              <TableCell className="text-right tabular-nums">₹{amount.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-bold text-warning tabular-nums">
                                ₹{remaining.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{progressPct.toFixed(0)}%</span>
                                    <span>₹{recovered.toLocaleString()}</span>
                                  </div>
                                  <Progress value={progressPct} className="h-2" />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {record.status === 'Settled' ? (
                                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Settled
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {syncStatus ? (
                                  syncStatus.is_synced ? (
                                    <CheckCircle2 className="w-4 h-4 text-success mx-auto" title="Synced with Payroll & Cashbook" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-destructive mx-auto" title={syncStatus.discrepancies?.join(', ')} />
                                  )
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => validateSync(record.id)}>
                                    <RefreshCw className="w-3 h-3 text-muted-foreground" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View (Hidden on desktop) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {recordsLoading ? (
                    <div className="p-4"><Skeleton className="h-12 w-full" /></div>
                  ) : filteredAdvanceRecords.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground p-6">No advance records found.</div>
                  ) : (
                    filteredAdvanceRecords.map(record => {
                      const amount = record.amount || 0;
                      const remaining = record.remaining_balance ?? amount;
                      const recovered = amount - remaining;
                      const progressPct = amount > 0 ? (recovered / amount) * 100 : 0;
                      const syncStatus = syncResults[record.id];

                      return (
                        <div key={record.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="font-bold text-sm text-foreground">{record.employee_name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-extrabold text-sm text-warning">₹{remaining.toLocaleString()}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Badge variant="outline" className={cn(
                                  "text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 border-transparent",
                                  record.status === 'Settled' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                )}>
                                  {record.status === 'Settled' ? 'Settled' : 'Pending'}
                                </Badge>
                                {syncStatus ? (
                                  syncStatus.is_synced ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success" title="Synced" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-destructive" title="Discrepancy" />
                                  )
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => validateSync(record.id)}>
                                    <RefreshCw className="w-2.5 h-2.5 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 pt-2 border-t border-border/20">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Repayment Progress</span>
                              <span>{progressPct.toFixed(0)}% (₹{recovered.toLocaleString()} of ₹{amount.toLocaleString()})</span>
                            </div>
                            <Progress value={progressPct} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" /> Recent Advance Deductions
                </CardTitle>
                <CardDescription>Advances recovered during recent payroll cycles.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="font-semibold py-4 pl-6">Employee</TableHead>
                        <TableHead className="font-semibold">Payroll Period</TableHead>
                        <TableHead className="font-semibold">Deducted Date</TableHead>
                        <TableHead className="font-semibold text-right">Amount Recovered</TableHead>
                        <TableHead className="font-semibold text-center pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={5}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
                      ) : recentDeductions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No recent deductions found.</TableCell>
                        </TableRow>
                      ) : (
                        recentDeductions.map((deduction, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium py-4 pl-6">{deduction.employee_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(deduction.payroll_year, deduction.payroll_month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {deduction.deducted_date ? format(new Date(deduction.deducted_date), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell className="text-right font-bold text-success tabular-nums">
                              +₹{deduction.amount?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center pr-6">
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Recovered</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View (Hidden on desktop) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {loading ? (
                    <div className="p-4"><Skeleton className="h-12 w-full" /></div>
                  ) : recentDeductions.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground p-6">No recent deductions found.</div>
                  ) : (
                    recentDeductions.map((deduction, idx) => (
                      <div key={idx} className="p-4 space-y-2 hover:bg-muted/5 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-bold text-sm text-foreground">{deduction.employee_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Period: {new Date(deduction.payroll_year, deduction.payroll_month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-success">+₹{deduction.amount?.toLocaleString()}</p>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 mt-1">
                              Recovered
                            </Badge>
                          </div>
                        </div>

                        {deduction.deducted_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Deducted Date: {format(new Date(deduction.deducted_date), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card shadow-sm border-border rounded-xl">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-lg font-semibold">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Total Active Employees</span>
                    <span className="font-bold text-foreground">{employees.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Committed Base Salary</span>
                    <span className="font-bold text-foreground tabular-nums">₹{employees.reduce((sum, e) => sum + (Number(e.salary_amount || e.base_salary) || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Pending Advances (To Recover)</span>
                    <span className="font-bold text-warning tabular-nums">₹{totalAdvancesAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Payroll Processed</span>
                    <span className="font-bold text-success tabular-nums">₹{totalPaidAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AdvancePayslipModal isOpen={!!selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} employeeId={selectedEmployeeId} />
      
      <AdvanceHistoryModal isOpen={!!advanceModalEmployee} onClose={() => setAdvanceModalEmployee(null)} employee={advanceModalEmployee} onSuccess={fetchData} />

      <PayrollGenerationModal isOpen={isGenerationModalOpen} onClose={() => setIsGenerationModalOpen(false)} employees={employees} onSuccess={fetchData} />

      {/* Quick Edit Payroll Cycle Modal */}
      <Dialog open={!!editingCycleEmployee} onOpenChange={(val) => !val && setEditingCycleEmployee(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/50 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Edit Payroll Cycle - {editingCycleEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCycle} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">1st Date of Billing Cycle (Start Day)</Label>
              <Select 
                value={String(cycleForm.startDay)} 
                onValueChange={val => setCycleForm({ ...cycleForm, startDay: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Start Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-56">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={String(day)}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of Month {day === 1 ? '(Default Start)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Last Date of Billing Cycle (End Day)</Label>
              <Select 
                value={String(cycleForm.endDay)} 
                onValueChange={val => setCycleForm({ ...cycleForm, endDay: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select End Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-56">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={String(day)}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of Month {day === 30 ? '(Default End)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Salary Processing / Pay Date (Post-Month)</Label>
              <Select 
                value={String(cycleForm.disbursementDay)} 
                onValueChange={val => setCycleForm({ ...cycleForm, disbursementDay: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Pay Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-56">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={String(day)}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of Month ({day} Days Post-Cycle)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditingCycleEmployee(null)} disabled={isSavingCycle} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingCycle} className="rounded-xl shadow-sm">
                {isSavingCycle ? 'Saving...' : 'Save Payroll Cycle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollPage;