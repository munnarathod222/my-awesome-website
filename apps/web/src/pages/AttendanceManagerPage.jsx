import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, XCircle, Clock, Search, Pencil, Trash2, AlertCircle, CalendarRange, Download, Plus, LayoutGrid, List, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import AttendanceMultiSelectModal from '@/components/AttendanceMultiSelectModal.jsx';
import AttendanceModal from '@/components/AttendanceModal.jsx';
import AttendanceCalendarView from '@/components/AttendanceCalendarView.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

const statusColors = {
  'Present': 'bg-success/20 text-success border-success/30',
  'Absent': 'bg-destructive/20 text-destructive border-destructive/30',
  'Leave': 'bg-warning/20 text-warning border-warning/30',
  'Half Day': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  'Work From Home': 'bg-blue-500/20 text-blue-500 border-blue-500/30'
};

const AttendanceManagerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEmployeeId = searchParams.get('employeeId');
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    employee: urlEmployeeId || 'all',
    status: 'all'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, attData] = await Promise.all([
        pb.collection('employees').getFullList({ filter: 'active_status = "active"', sort: 'name', $autoCancel: false }),
        pb.collection('attendance').getFullList({ expand: 'staff_member', sort: '-date', $autoCancel: false })
      ]);
      setEmployees(empData);
      setAttendance(attData);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (urlEmployeeId && filters.employee !== urlEmployeeId) {
      setFilters(prev => ({ ...prev, employee: urlEmployeeId }));
    }
  }, [urlEmployeeId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await pb.collection('attendance').delete(id, { $autoCancel: false });
      toast.success('Record deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete record');
    }
  };

  const filteredAttendance = useMemo(() => {
    let result = [...attendance];
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => 
        (r.expand?.staff_member?.name?.toLowerCase().includes(q)) ||
        (r.notes?.toLowerCase().includes(q))
      );
    }
    
    if (filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }
    
    if (filters.employee !== 'all') {
      result = result.filter(r => r.staff_member === filters.employee);
    }
    
    if (filters.dateFrom) {
      result = result.filter(r => new Date(r.date.split(' ')[0]) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.date.split(' ')[0]) <= toDate);
    }

    return result;
  }, [attendance, filters]);

  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = attendance.filter(a => a.date.startsWith(todayStr));
    
    return {
      totalStaff: employees.length,
      present: todayRecords.filter(a => a.status === 'Present' || a.status === 'Work From Home').length,
      absent: todayRecords.filter(a => a.status === 'Absent').length,
      leave: todayRecords.filter(a => a.status === 'Leave').length,
    };
  }, [attendance, employees]);

  const handleEmployeeFilterChange = (val) => {
    setFilters(p => ({ ...p, employee: val }));
    if (val === 'all') {
      searchParams.delete('employeeId');
    } else {
      searchParams.set('employeeId', val);
    }
    setSearchParams(searchParams);
  };

  const selectedEmployeeData = useMemo(() => {
    return urlEmployeeId ? employees.find(e => e.id === urlEmployeeId) : null;
  }, [urlEmployeeId, employees]);

  if (loading) return <LoadingSpinner text="Loading attendance records..." />;

  if (error) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Data Load Error</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
      <Button onClick={fetchData}>Try Again</Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Staff Attendance | Dashboard</title>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Attendance Hub</h1>
            <p className="text-muted-foreground mt-1">Manage staff attendance, daily register, and view historical presence.</p>
          </div>
          <Button onClick={() => setIsMultiModalOpen(true)} className="shadow-sm rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Mark Attendance
          </Button>
        </div>

        {urlEmployeeId && selectedEmployeeData && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                {selectedEmployeeData.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-primary">{selectedEmployeeData.name}</h2>
                <p className="text-sm text-muted-foreground">Showing attendance records for this employee</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/employees')} className="rounded-xl shadow-sm shrink-0">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employee List
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stats.totalStaff}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-success">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Absent Today</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-destructive">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-warning">{stats.leave}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card className="border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-2" /> List View
                </Button>
                <Button 
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('calendar')}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" /> Calendar
                </Button>
              </div>

              {viewMode === 'list' && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 h-10 w-full sm:w-auto">
                    <CalendarRange className="w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="h-7 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0" value={filters.dateFrom} onChange={e => setFilters(p => ({...p, dateFrom: e.target.value}))} />
                    <span className="text-muted-foreground">-</span>
                    <Input type="date" className="h-7 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0" value={filters.dateTo} onChange={e => setFilters(p => ({...p, dateTo: e.target.value}))} />
                  </div>
                  
                  <Select value={filters.employee} onValueChange={handleEmployeeFilterChange}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={v => setFilters(p => ({...p, status: v}))}>
                    <SelectTrigger className="w-[130px] bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Leave">Leave</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative w-full sm:w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search notes..." 
                      value={filters.search}
                      onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {viewMode === 'calendar' ? (
              <div className="p-4 sm:p-6 bg-muted/5 min-h-[500px]">
                <AttendanceCalendarView attendanceData={filteredAttendance} />
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                          <CalendarRange className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          No attendance records match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAttendance.map(record => (
                        <TableRow key={record.id} className={`transition-colors ${urlEmployeeId === record.staff_member ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'}`}>
                          <TableCell className="font-medium whitespace-nowrap text-sm">
                            {format(parseISO(record.date.split(' ')[0]), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {record.expand?.staff_member?.name || 'Unknown'}
                            <div className="text-xs text-muted-foreground font-normal">
                              {record.expand?.staff_member?.position || record.expand?.staff_member?.employee_type || 'Staff'}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`font-medium ${statusColors[record.status] || ''}`}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {record.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingRecord(record); setIsEditModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isMultiModalOpen && (
        <AttendanceMultiSelectModal 
          isOpen={isMultiModalOpen} 
          onClose={() => setIsMultiModalOpen(false)} 
          onSuccess={fetchData}
          employees={employees}
        />
      )}

      {isEditModalOpen && editingRecord && (
        <AttendanceModal 
          isOpen={isEditModalOpen} 
          onClose={() => { setIsEditModalOpen(false); setEditingRecord(null); }} 
          onSuccess={fetchData}
          employees={employees}
          editRecord={editingRecord}
        />
      )}
    </>
  );
};

export default AttendanceManagerPage;