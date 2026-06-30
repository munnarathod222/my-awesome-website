import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function AttendanceTracker({ employee, currentMonth, currentYear, onMonthChange, onDataChange }) {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({}); // Mapping 'YYYY-MM-DD' -> { id, status }
  const [popoverOpen, setPopoverOpen] = useState(null); // stores date string if open
  
  const currentDate = new Date(currentYear, currentMonth - 1, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (employee?.id) {
      fetchAttendance();
    }
  }, [employee?.id, currentMonth, currentYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const startDateStr = format(monthStart, 'yyyy-MM-dd');
      // Adding 1 day to end date to ensure the `<` query covers the whole last day
      const nextMonth = new Date(monthEnd);
      nextMonth.setDate(nextMonth.getDate() + 1);
      const endDateStr = format(nextMonth, 'yyyy-MM-dd');

      const filter = `employee_id = "${employee.id}" && date >= "${startDateStr} 00:00:00" && date < "${endDateStr} 00:00:00"`;
      
      const records = await pb.collection('attendance_records').getFullList({
        filter,
        $autoCancel: false
      });

      const dataMap = {};
      records.forEach(record => {
        const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
        dataMap[dateKey] = { id: record.id, status: record.status };
      });

      setAttendanceData(dataMap);
      if (onDataChange) onDataChange(dataMap);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (dateStr, newStatus) => {
    setPopoverOpen(null);
    const existingRecord = attendanceData[dateStr];
    
    // Create UTC date strictly representing the selected day
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    
    try {
      if (existingRecord) {
        const updated = await pb.collection('attendance_records').update(existingRecord.id, {
          status: newStatus
        }, { $autoCancel: false });
        
        const newData = { ...attendanceData, [dateStr]: { id: updated.id, status: updated.status } };
        setAttendanceData(newData);
        if (onDataChange) onDataChange(newData);
        toast.success(`Updated to ${newStatus}`);
      } else {
        const created = await pb.collection('attendance_records').create({
          employee_id: employee.id,
          date: dateObj.toISOString(),
          status: newStatus
        }, { $autoCancel: false });
        
        const newData = { ...attendanceData, [dateStr]: { id: created.id, status: created.status } };
        setAttendanceData(newData);
        if (onDataChange) onDataChange(newData);
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast.error('Failed to save attendance');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-success/10 text-success border-success/30 hover:bg-success/20';
      case 'Absent': return 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20';
      case 'Leave': return 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20';
      case 'Half Day': return 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20';
      default: return 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80';
    }
  };

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    onMonthChange(prev.getMonth() + 1, prev.getFullYear());
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    onMonthChange(next.getMonth() + 1, next.getFullYear());
  };

  if (!employee) {
    return (
      <Card className="border-border shadow-sm w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select an employee to view attendance</p>
        </div>
      </Card>
    );
  }

  // Pre-calculate empty cells for alignment based on starting weekday
  const startDay = monthStart.getDay(); // 0 is Sunday
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-border shadow-sm flex flex-col h-full">
      <CardHeader className="bg-muted/10 border-b border-border py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Attendance Tracker
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-sm w-32 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground mb-2">
                {day}
              </div>
            ))}
            
            {emptyCells.map(i => (
              <div key={`empty-${i}`} className="h-20 md:h-24 bg-transparent rounded-xl"></div>
            ))}
            
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const record = attendanceData[dateStr];
              const status = record?.status;
              const isWknd = isWeekend(date);
              const isTodayDate = isToday(date);
              
              return (
                <Popover key={dateStr} open={popoverOpen === dateStr} onOpenChange={(open) => setPopoverOpen(open ? dateStr : null)}>
                  <PopoverTrigger asChild>
                    <div 
                      className={`h-20 md:h-24 p-2 rounded-xl border flex flex-col transition-all cursor-pointer ${
                        isTodayDate ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                      } ${
                        status ? getStatusColor(status) : 
                        isWknd ? 'bg-muted/30 border-dashed border-border/50 text-muted-foreground/50 hover:bg-muted/50' : 
                        'bg-background border-border hover:border-primary/50 hover:bg-muted/20'
                      }`}
                    >
                      <span className={`text-xs font-medium ${isTodayDate ? 'text-primary' : ''}`}>
                        {format(date, 'd')}
                      </span>
                      <div className="flex-1 flex items-center justify-center">
                        {status ? (
                          <span className="text-[10px] font-semibold tracking-wide uppercase">{status}</span>
                        ) : isWknd ? (
                          <span className="text-[10px] uppercase tracking-wider opacity-60">Wknd</span>
                        ) : null}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 rounded-xl shadow-lg border-border" align="center" side="top">
                    <p className="text-xs font-medium text-muted-foreground mb-3 border-b border-border pb-2 text-center">
                      {format(date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-success/10 text-success border-success/20 hover:bg-success/20" onClick={() => handleStatusChange(dateStr, 'Present')}>
                        Present
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" onClick={() => handleStatusChange(dateStr, 'Absent')}>
                        Absent
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" onClick={() => handleStatusChange(dateStr, 'Leave')}>
                        Leave
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" onClick={() => handleStatusChange(dateStr, 'Half Day')}>
                        Half Day
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}