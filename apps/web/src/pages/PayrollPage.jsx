import React, { useState, useEffect, useMemo } from 'react';
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
import { 
  Users, IndianRupee, TrendingUp, Calculator, Search, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Pencil, Download, Plus, Zap, ShieldCheck, 
  ArrowUpRight, FileSpreadsheet, CreditCard, Banknote, CalendarDays, CheckSquare
} from 'lucide-react';
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
import { motion } from 'framer-motion';

export default function PayrollPage() {
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

  // Search & Filters for Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedPayrollItem, setSelectedPayrollItem] = useState(null);
  const [advanceModalEmployee, setAdvanceModalEmployee] = useState(null);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  
  // Payroll Cycle Edit Modal State
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
      setEmployees(emps || []);
      setAdvances(advs || []);
      setPayments(pays || []);
      setAttendanceRecords(atts || []);
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
        setAdvanceRecords(data.advances || []);
        const pending = (data.advances || []).filter(a => a.status === 'Pending').slice(0, 5);
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
      const sDay = Number(cycleForm.startDay) || 1;
      const eDay = Number(cycleForm.endDay) || 30;
      const dDay = Number(cycleForm.disbursementDay) || 10;

      await pb.collection('employees').update(editingCycleEmployee.id, {
        payroll_cycle_start_day: sDay,
        payroll_cycle_end_day: eDay,
        salary_disbursement_day: dDay,
        salary_billing_cycle: 'Monthly'
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

  const getCalculatedPayroll = useMemo(() => {
    const currentDate = new Date();

    return employees.map(emp => {
      const calc = calculateCyclePayroll(emp, attendanceRecords, advances, currentDate);
      const empPayments = payments.filter(p => p.employee_id === emp.id && p.payroll_month === (currentDate.getMonth() + 1) && p.payroll_year === currentDate.getFullYear());
      const isSettled = empPayments.length > 0 && empPayments[0].payment_status === 'paid';

      return {
        ...emp,
        baseSalary: calc.baseSalary || 0,
        adjustedBaseSalary: calc.adjustedBaseSalary || 0,
        presentDays: calc.presentDays || 0,
        totalWorkingDays: calc.totalWorkingDays || 30,
        activeDays: calc.activeDays || 0,
        totalAdvances: calc.totalAdvances || 0,
        grossSalary: calc.grossSalary || 0,
        taxDeductions: calc.taxDeductions || 0,
        netPayout: calc.netPayout || 0,
        payDate: calc.payDate,
        cycleInfo: calc.cycleInfo,
        status: calc.status,
        statusLabel: calc.statusLabel,
        isSettled
      };
    });
  }, [employees, attendanceRecords, advances, payments]);

  // Filtered Payroll Directory
  const filteredCalculatedPayroll = useMemo(() => {
    return getCalculatedPayroll.filter(emp => {
      if (statusFilter === 'settled' && !emp.isSettled) return false;
      if (statusFilter === 'pending' && emp.isSettled) return false;
      if (statusFilter === 'due_soon' && emp.status !== 'due_soon') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          emp.name?.toLowerCase().includes(q) ||
          emp.position?.toLowerCase().includes(q) ||
          emp.employee_type?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [getCalculatedPayroll, searchQuery, statusFilter]);

  // Financial Summaries
  const metrics = useMemo(() => {
    const totalStaff = employees.length;
    const totalNetCommitment = getCalculatedPayroll.reduce((acc, e) => acc + (e.netPayout || 0), 0);
    const totalAdvancesPending = advances.filter(a => a.status === 'Pending').reduce((sum, a) => sum + (Number(a.remaining_balance ?? a.amount) || 0), 0);
    const totalLifetimePaid = payments.reduce((sum, p) => sum + (Number(p.net_salary || p.amount) || 0), 0);
    const settledCount = getCalculatedPayroll.filter(e => e.isSettled).length;
    const dueCount = totalStaff - settledCount;

    return { totalStaff, totalNetCommitment, totalAdvancesPending, totalLifetimePaid, settledCount, dueCount };
  }, [employees, getCalculatedPayroll, advances, payments]);

  // Filter Advance Records
  const filteredAdvanceRecords = useMemo(() => {
    return advanceRecords.filter(record => {
      const matchesSearch = record.employee_name?.toLowerCase().includes(advanceSearch.toLowerCase()) || 
                            record.notes?.toLowerCase().includes(advanceSearch.toLowerCase());
      const matchesStatus = advanceStatusFilter === 'all' || record.status?.toLowerCase() === advanceStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [advanceRecords, advanceSearch, advanceStatusFilter]);

  // Export Payroll to Bank NEFT/RTGS CSV format
  const handleExportPayrollExcel = () => {
    const headers = ['Employee Name', 'Role / Position', 'Base Salary (INR)', 'Attendance (Present/Working)', 'Pending Advances (INR)', 'Net Payout (INR)', 'Pay Date', 'Status'];
    const rows = filteredCalculatedPayroll.map(e => [
      `"${e.name}"`,
      `"${e.position || e.employee_type || 'Staff'}"`,
      e.baseSalary,
      `"${e.presentDays}/${e.totalWorkingDays} Days"`,
      e.totalAdvances,
      e.netPayout,
      `"${e.cycleInfo?.formattedPayDate || '10th'}"`,
      `"${e.isSettled ? 'Settled' : 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_Payroll_Disbursement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredCalculatedPayroll.length} Payroll Records for Bank Transfer!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 font-sans"
    >
      <Helmet>
        <title>Enterprise Payroll Hub | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Banknote className="w-7 h-7" />
            </div>
            Enterprise Payroll Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Automated Salary Processing • Prorated Attendance Deductions • Staff Advances & Bank NEFT Exporter
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportPayrollExcel} className="rounded-xl text-xs font-bold shadow-sm">
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" /> Export Bank Excel
          </Button>

          <Button onClick={() => setIsGenerationModalOpen(true)} className="rounded-xl shadow-md font-bold text-xs bg-primary text-primary-foreground">
            <Calculator className="w-4 h-4 mr-1.5" /> Generate Salary Batch
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-primary" /> Total Payroll Staff
          </div>
          <div className="text-2xl font-black font-mono text-foreground">{metrics.totalStaff} Staff</div>
          <div className="text-[10px] text-emerald-400 font-bold">{metrics.settledCount} Settled • {metrics.dueCount} Pending</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Monthly Payout Commitment
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ₹ {(metrics.totalNetCommitment / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground">Net Payable This Month</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Outstanding Advances
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            ₹ {(metrics.totalAdvancesPending / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground">Pending Salary Deductions</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Lifetime Disbursed
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">
            ₹ {(metrics.totalLifetimePaid / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-muted-foreground">Historical Disbursed Salaries</div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-[480px] bg-muted/40 p-1 rounded-2xl border border-border/60">
          <TabsTrigger value="overview" className="flex items-center gap-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="w-3.5 h-3.5 text-primary" /> Directory
          </TabsTrigger>
          <TabsTrigger value="advances" className="flex items-center gap-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Advances
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2 rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Deductions
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PAYROLL DIRECTORY */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-2xl border border-border/60 bg-card p-4 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Employee Name, Role..."
                  className="pl-9 rounded-xl h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9 text-xs rounded-xl"><SelectValue placeholder="Disbursement" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="settled">🟢 Settled</SelectItem>
                    <SelectItem value="pending">🟡 Pending Payout</SelectItem>
                    <SelectItem value="due_soon">🔵 Due Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-bold pl-6 py-3.5">Employee Name & Role</TableHead>
                  <TableHead className="text-xs font-bold text-right">Base Salary</TableHead>
                  <TableHead className="text-xs font-bold">Payroll Cycle & Pay Date</TableHead>
                  <TableHead className="text-xs font-bold text-center">Attendance</TableHead>
                  <TableHead className="text-xs font-bold text-right">Advances</TableHead>
                  <TableHead className="text-xs font-bold text-right text-primary">Net Payout</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                      Loading Payroll Directory...
                    </TableCell>
                  </TableRow>
                ) : filteredCalculatedPayroll.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                      No matching employee payroll records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculatedPayroll.map(emp => (
                    <TableRow key={emp.id} className="hover:bg-muted/20 text-xs transition-colors">
                      <TableCell className="py-3.5 pl-6 font-semibold">
                        <div className="font-bold text-foreground">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                          {emp.position || emp.employee_type || 'Staff'} • Joined {emp.joining_date ? emp.joining_date.split(' ')[0] : 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-semibold text-muted-foreground">
                        ₹ {emp.baseSalary.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-between gap-2 group">
                          <div>
                            <div className="font-bold text-foreground">🗓️ {emp.cycleInfo?.formattedCycleRange}</div>
                            <div className="text-[10px] font-bold text-primary">💳 Pay Date: {emp.cycleInfo?.formattedPayDate}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary rounded-lg"
                            onClick={() => {
                              setEditingCycleEmployee(emp);
                              setCycleForm({
                                startDay: emp.payroll_cycle_start_day || 1,
                                endDay: emp.payroll_cycle_end_day || 30,
                                disbursementDay: emp.salary_disbursement_day || 10
                              });
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-foreground">
                        {emp.presentDays} / {emp.totalWorkingDays} Days
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-amber-400">
                        {emp.totalAdvances > 0 ? `₹ ${emp.totalAdvances.toLocaleString()}` : '₹ 0'}
                      </TableCell>

                      <TableCell className="text-right font-mono font-black text-emerald-400 text-sm">
                        ₹ {emp.netPayout.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center">
                        {emp.isSettled ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-bold">
                            🟢 Settled
                          </Badge>
                        ) : emp.status === 'due_soon' ? (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-mono font-bold">
                            🔵 Due on {emp.payDate}
                          </Badge>
                        ) : emp.status === 'overdue' ? (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px] font-mono font-bold">
                            🔴 Overdue Pay
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono font-bold">
                            🟡 Action Req
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedEmployeeId(emp.id); setSelectedPayrollItem(emp); }} 
                          className="rounded-xl text-xs font-bold shadow-sm"
                        >
                          Payslip & Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: STAFF ADVANCES */}
        <TabsContent value="advances" className="space-y-4">
          <Card className="rounded-2xl border border-border/60 bg-card p-4 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input 
                  placeholder="Search Employee, Notes..." 
                  value={advanceSearch}
                  onChange={(e) => setAdvanceSearch(e.target.value)}
                  className="pl-9 rounded-xl h-9 text-xs"
                />
              </div>
              <Select value={advanceStatusFilter} onValueChange={setAdvanceStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Recovery</SelectItem>
                  <SelectItem value="settled">Settled Advances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-bold pl-6 py-3.5">Employee Name</TableHead>
                  <TableHead className="text-xs font-bold">Date Issued</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount Given</TableHead>
                  <TableHead className="text-xs font-bold text-right">Remaining Balance</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Repayment Progress</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold text-center pr-6">Sync</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recordsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                      Loading Advance Records...
                    </TableCell>
                  </TableRow>
                ) : filteredAdvanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                      No staff advance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdvanceRecords.map(record => {
                    const amount = record.amount || 0;
                    const remaining = record.remaining_balance ?? amount;
                    const recovered = amount - remaining;
                    const progressPct = amount > 0 ? (recovered / amount) * 100 : 0;
                    const syncStatus = syncResults[record.id];

                    return (
                      <TableRow key={record.id} className="hover:bg-muted/20 text-xs transition-colors">
                        <TableCell className="py-3.5 pl-6 font-bold text-foreground">
                          {record.employee_name}
                        </TableCell>

                        <TableCell className="text-muted-foreground font-mono">
                          {format(new Date(record.date), 'dd MMM yyyy')}
                        </TableCell>

                        <TableCell className="text-right font-mono font-semibold">
                          ₹ {amount.toLocaleString()}
                        </TableCell>

                        <TableCell className="text-right font-mono font-extrabold text-amber-400">
                          ₹ {remaining.toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
                              <span>{progressPct.toFixed(0)}% Recovered</span>
                              <span>₹ {recovered.toLocaleString()}</span>
                            </div>
                            <Progress value={progressPct} className="h-2 rounded-full" />
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          {record.status === 'Settled' ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-bold">
                              🟢 Settled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono font-bold">
                              🟡 Pending Recovery
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-center pr-6">
                          {syncStatus ? (
                            syncStatus.is_synced ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" title="Synced with Payroll & Cashbook" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 mx-auto" title={syncStatus.discrepancies?.join(', ')} />
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
          </Card>
        </TabsContent>

        {/* TAB 3: DEDUCTIONS RECOVERY */}
        <TabsContent value="deductions" className="space-y-4">
          <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-bold pl-6 py-3.5">Employee Name</TableHead>
                  <TableHead className="text-xs font-bold">Payroll Period</TableHead>
                  <TableHead className="text-xs font-bold">Deducted Date</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount Recovered</TableHead>
                  <TableHead className="text-xs font-bold text-center pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                      Loading Deductions Recovery History...
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                      No recent payroll deduction records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.slice(0, 15).map((pay, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/20 text-xs transition-colors">
                      <TableCell className="py-3.5 pl-6 font-bold text-foreground">
                        {pay.employee_name || 'Staff Employee'}
                      </TableCell>

                      <TableCell className="text-muted-foreground font-mono">
                        {pay.payroll_month ? `${pay.payroll_month}/${pay.payroll_year}` : 'Current Month'}
                      </TableCell>

                      <TableCell className="text-muted-foreground font-mono">
                        {pay.created ? format(new Date(pay.created), 'dd MMM yyyy') : 'N/A'}
                      </TableCell>

                      <TableCell className="text-right font-mono font-extrabold text-emerald-400 text-sm">
                        + ₹ {(pay.advance_deduction || 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center pr-6">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-bold">
                          🟢 Recovered in Payroll
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AdvancePayslipModal
        isOpen={Boolean(selectedEmployeeId)}
        onClose={() => { setSelectedEmployeeId(null); setSelectedPayrollItem(null); }}
        employeeId={selectedEmployeeId}
        calculatedPayroll={selectedPayrollItem || payrollData.find(p => p.id === selectedEmployeeId || p.employeeId === selectedEmployeeId)}
      />

      <PayrollGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        employees={employees}
        onSuccess={() => { setIsGenerationModalOpen(false); fetchData(); }}
      />

      {/* Edit Payroll Cycle Dialog */}
      <Dialog open={Boolean(editingCycleEmployee)} onOpenChange={(open) => !open && setEditingCycleEmployee(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-slate-950 border-slate-800 text-slate-100 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Edit Payroll Cycle ({editingCycleEmployee?.name})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCycle} className="space-y-4 text-xs">
            <div>
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Cycle Start Day (1-31)</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={cycleForm.startDay}
                onChange={e => setCycleForm({...cycleForm, startDay: e.target.value})}
                className="bg-slate-900 border-slate-800 text-white rounded-xl h-9 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Cycle End Day (1-31)</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={cycleForm.endDay}
                onChange={e => setCycleForm({...cycleForm, endDay: e.target.value})}
                className="bg-slate-900 border-slate-800 text-white rounded-xl h-9 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-400 text-[10px] uppercase font-bold">Salary Disbursement Day (1-31)</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={cycleForm.disbursementDay}
                onChange={e => setCycleForm({...cycleForm, disbursementDay: e.target.value})}
                className="bg-slate-900 border-slate-800 text-white rounded-xl h-9 text-xs mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditingCycleEmployee(null)} className="text-xs text-slate-400">Cancel</Button>
              <Button type="submit" disabled={isSavingCycle} className="text-xs font-bold bg-primary text-primary-foreground rounded-xl">
                {isSavingCycle ? 'Saving...' : 'Save Payroll Cycle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}