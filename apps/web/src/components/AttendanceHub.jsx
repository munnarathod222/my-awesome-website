import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarCheck, CalendarX, Clock, CalendarDays, Activity, Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import SalaryCalculationService from '@/lib/SalaryCalculationService.js';

const formatDateSafe = (dateVal, formatStr = 'MMM dd, yyyy') => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return format(d, formatStr);
  } catch (e) {
    console.error('Failed to format date:', dateVal, e);
    return '-';
  }
};

export default function AttendanceHub({ employeeId }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (!employeeId) return;
    
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        // 1. Fetch current month summary via backend API
        const summaryData = await SalaryCalculationService.getAttendanceSummary(employeeId, currentMonth, currentYear);
        setSummary(summaryData);
        
        // 2. Build current month calendar grid
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start, end });
        
        const mappedDays = days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const record = summaryData.records.find(r => r.date.startsWith(dateStr));
          return {
            date: day,
            isWeekend: isWeekend(day),
            status: record ? record.status : 'Unrecorded'
          };
        });
        setCalendarDays(mappedDays);

        // 3. Fetch recent history directly from PocketBase (last 30 days limit 10)
        const historyData = await pb.collection('attendance').getList(1, 10, {
          filter: `staff_member = "${employeeId}"`,
          sort: '-date',
          $autoCancel: false
        });
        setRecentHistory(historyData.items);

        // 4. Calculate trends for the last 6 months
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
          const targetDate = subMonths(currentDate, i);
          const m = targetDate.getMonth() + 1;
          const y = targetDate.getFullYear();
          
          try {
            const data = await SalaryCalculationService.getAttendanceSummary(employeeId, m, y);
            trendData.push({
              name: format(targetDate, 'MMM yy'),
              percentage: data.attendancePercentage || 0,
              present: data.presentDays || 0
            });
          } catch (e) {
            trendData.push({
              name: format(targetDate, 'MMM yy'),
              percentage: 0,
              present: 0
            });
          }
        }
        setTrends(trendData);
        
      } catch (err) {
        console.error("Failed to load attendance hub data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [employeeId, currentMonth, currentYear]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-success/15 text-success border-success/30';
      case 'Absent': return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'Leave': return 'bg-warning/15 text-warning border-warning/30';
      case 'Half Day': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  const getStatusIndicator = (status, isWknd) => {
    if (status === 'Present') return <div className="w-2 h-2 rounded-full bg-success mt-1 mx-auto" />;
    if (status === 'Absent') return <div className="w-2 h-2 rounded-full bg-destructive mt-1 mx-auto" />;
    if (status === 'Leave' || status === 'Half Day') return <div className="w-2 h-2 rounded-full bg-warning mt-1 mx-auto" />;
    if (isWknd) return <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-1 mx-auto" />;
    return <div className="w-2 h-2 rounded-full bg-transparent mt-1 mx-auto" />;
  };

  if (!employeeId) {
    return (
      <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/60 text-muted-foreground">
        <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p>Please select an employee to view their attendance hub.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-none ring-1 ring-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendance %</p>
              {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
                <p className="text-2xl font-bold">{summary?.attendancePercentage?.toFixed(1) || 0}%</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm border-none ring-1 ring-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl text-success">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Days Present</p>
              {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
                <p className="text-2xl font-bold">{summary?.presentDays || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-none ring-1 ring-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-xl text-destructive">
              <CalendarX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Days Absent</p>
              {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
                <p className="text-2xl font-bold">{summary?.absentDays || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-none ring-1 ring-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-xl text-warning">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leaves Taken</p>
              {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
                <p className="text-2xl font-bold">{summary?.leaveDays || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                Monthly Calendar ({format(currentDate, 'MMMM yyyy')})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="w-full h-64 rounded-xl" />
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground mb-2">{day}</div>
                  ))}
                  
                  {Array.from({ length: calendarDays[0]?.date.getDay() || 0 }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 opacity-0" />
                  ))}

                  {calendarDays.map((dayObj, i) => (
                    <div 
                      key={i} 
                      className={`p-2 border rounded-xl flex flex-col items-center justify-center aspect-square transition-all ${
                        dayObj.status === 'Present' ? 'bg-success/5 border-success/20' :
                        dayObj.status === 'Absent' ? 'bg-destructive/5 border-destructive/20' :
                        dayObj.status === 'Leave' || dayObj.status === 'Half Day' ? 'bg-warning/5 border-warning/20' :
                        dayObj.isWeekend ? 'bg-muted/30 border-transparent text-muted-foreground/60' :
                        'bg-card border-border/50'
                      }`}
                      title={`${format(dayObj.date, 'MMM dd')}: ${dayObj.status}`}
                    >
                      <span className="text-sm font-medium">{format(dayObj.date, 'd')}</span>
                      {getStatusIndicator(dayObj.status, dayObj.isWeekend)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                Attendance Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="w-full h-64 rounded-xl" />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="percentage" name="Attendance %" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                Recent History
              </CardTitle>
              <CardDescription>Last 10 recorded entries</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="w-full h-12 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-lg" />
                </div>
              ) : recentHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No recent history found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-transparent hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentHistory.map(record => (
                      <TableRow key={record.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-sm">
                          {formatDateSafe(record.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}