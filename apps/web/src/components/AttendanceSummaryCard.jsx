import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AttendanceSummaryCard = ({ attendanceSummary }) => {
  const { totalWorkingDays, presentDays, absentDays, leaveDays, sickDays, attendancePercentage } = attendanceSummary;

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Total Tracked Days</span>
            <span className="text-3xl font-bold">{totalWorkingDays}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Attendance %</span>
            <span className="text-3xl font-bold text-primary">{attendancePercentage}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-success/10 rounded-xl border border-success/20 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground mb-1">Present</span>
            <span className="text-xl font-bold text-success">{presentDays}</span>
          </div>
          <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground mb-1">Absent</span>
            <span className="text-xl font-bold text-destructive">{absentDays}</span>
          </div>
          <div className="p-3 bg-warning/10 rounded-xl border border-warning/20 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground mb-1">Leave</span>
            <span className="text-xl font-bold text-warning">{leaveDays}</span>
          </div>
          <div className="p-3 bg-warning/10 rounded-xl border border-warning/20 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground mb-1">Sick</span>
            <span className="text-xl font-bold text-warning">{sickDays}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceSummaryCard;