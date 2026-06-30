import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  'Present': 'bg-success/20 text-success border-success/30',
  'Absent': 'bg-destructive/20 text-destructive border-destructive/30',
  'Leave': 'bg-warning/20 text-warning border-warning/30',
  'Half Day': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  'Work From Home': 'bg-blue-500/20 text-blue-500 border-blue-500/30'
};

const AttendanceCalendarView = ({ attendanceData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const startDayOffset = getDay(startOfMonth(currentDate)); // 0 = Sunday

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const attendanceByDay = useMemo(() => {
    const map = {};
    attendanceData.forEach(record => {
      const dateStr = record.date.split(' ')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(record);
    });
    return map;
  }, [attendanceData]);

  const handleDayClick = (dayStr) => {
    if (attendanceByDay[dayStr] && attendanceByDay[dayStr].length > 0) {
      setSelectedDay({ date: dayStr, records: attendanceByDay[dayStr] });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:inline-flex">Today</Button>
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r border-border" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] bg-muted/10 rounded-lg border border-transparent"></div>
        ))}

        {daysInMonth.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const records = attendanceByDay[dayStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          const present = records.filter(r => r.status === 'Present' || r.status === 'Work From Home').length;
          const absent = records.filter(r => r.status === 'Absent').length;
          
          return (
            <div 
              key={dayStr} 
              onClick={() => handleDayClick(dayStr)}
              className={`
                min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg border flex flex-col transition-all
                ${!isCurrentMonth ? 'opacity-40 bg-muted/10' : 'bg-background hover:border-primary/50 cursor-pointer'}
                ${isDayToday ? 'border-primary ring-1 ring-primary/20 ring-offset-background' : 'border-border'}
                ${records.length > 0 ? 'hover:shadow-sm' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isDayToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </span>
                {records.length > 0 && <span className="text-[10px] text-muted-foreground hidden sm:inline">{records.length} recs</span>}
              </div>
              
              {records.length > 0 && (
                <div className="mt-auto flex flex-col gap-1">
                  {present > 0 && (
                    <div className="h-1.5 w-full bg-success/20 rounded overflow-hidden flex">
                      <div className="h-full bg-success" style={{ width: `${(present/records.length)*100}%` }}></div>
                    </div>
                  )}
                  {absent > 0 && (
                    <div className="h-1.5 w-full bg-destructive/20 rounded overflow-hidden flex">
                      <div className="h-full bg-destructive" style={{ width: `${(absent/records.length)*100}%` }}></div>
                    </div>
                  )}
                  <div className="text-[10px] font-medium mt-1 leading-tight flex flex-col">
                    {present > 0 && <span className="text-success">{present} Present</span>}
                    {absent > 0 && <span className="text-destructive">{absent} Absent</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Attendance for {format(parseISO(selectedDay.date), 'MMMM d, yyyy')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedDay.records.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{record.expand?.staff_member?.name || 'Unknown'}</span>
                    {record.notes && <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{record.notes}</span>}
                  </div>
                  <Badge variant="outline" className={`font-semibold ${statusColors[record.status] || ''}`}>
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedDay(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AttendanceCalendarView;