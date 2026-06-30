import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const SalaryBreakdownCard = ({ employee, breakdown }) => {
  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Salary Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground">Base Salary</span>
          <span className="font-medium text-foreground">₹{breakdown.baseSalary.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground">
            Trip Bonus <span className="text-xs opacity-80">({breakdown.tripCount} trips × ₹500)</span>
          </span>
          <span className="font-medium text-success">+₹{breakdown.tripBonus.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground">
            Attendance Deduction <span className="text-xs opacity-80">({breakdown.absentDays} absent days × ₹300)</span>
          </span>
          <span className="font-medium text-destructive">-₹{breakdown.attendanceDeduction.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground">Driver Advances</span>
          <span className="font-medium text-destructive">-₹{breakdown.driverAdvances.toLocaleString()}</span>
        </div>
        
        <Separator className="my-2 bg-border" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-foreground">Final Salary</span>
          <span className="text-2xl font-extrabold text-primary tracking-tight">₹{breakdown.finalSalary.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryBreakdownCard;