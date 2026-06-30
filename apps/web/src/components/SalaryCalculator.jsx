import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, Calculator, CalendarDays, Receipt, Clock, UserCheck } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from 'date-fns';
import SalaryBreakdownModal from './SalaryBreakdownModal.jsx';

export default function SalaryCalculator({ employee, currentMonth, currentYear, attendanceData }) {
  const [stats, setStats] = useState({
    workingDays: 0,
    presentDays: 0,
    baseSalary: 0,
    calculatedSalary: 0,
    dailyRate: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (employee && currentMonth && currentYear) {
      calculateSalary();
    }
  }, [employee, currentMonth, currentYear, attendanceData]);

  const calculateSalary = () => {
    const baseSalary = employee.salary_amount || employee.base_salary || 0;
    
    const currentDate = new Date(currentYear, currentMonth - 1, 1);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate total working days (excluding weekends)
    const workingDays = daysInMonth.filter(d => !isWeekend(d)).length;
    
    // Calculate days present from attendance data
    let presentDays = 0;
    
    if (attendanceData) {
      Object.entries(attendanceData).forEach(([dateStr, record]) => {
        // Ensure we only count days in the target month (in case mapping leaked)
        const [y, m] = dateStr.split('-');
        if (Number(y) === currentYear && Number(m) === currentMonth) {
          if (record.status === 'Present') presentDays += 1;
          else if (record.status === 'Half Day') presentDays += 0.5;
        }
      });
    }

    const dailyRate = workingDays > 0 ? (baseSalary / workingDays) : 0;
    const calculatedSalary = dailyRate * presentDays;

    setStats({
      workingDays,
      presentDays,
      baseSalary,
      calculatedSalary,
      dailyRate
    });
  };

  if (!employee) {
    return (
      <Card className="border-border shadow-sm h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select an employee to view salary projection</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border shadow-lg flex flex-col h-full bg-card overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground py-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Receipt className="w-5 h-5 opacity-80" />
              Estimated Salary
            </CardTitle>
            <p className="text-primary-foreground/70 text-sm mt-1">
              For {format(new Date(currentYear, currentMonth - 1, 1), 'MMMM yyyy')}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-2 py-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gross Payable</p>
            <h3 className="text-5xl font-extrabold text-foreground tracking-tight tabular-nums" style={{letterSpacing: '-0.02em'}}>
              ₹{stats.calculatedSalary.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on {stats.presentDays} days worked
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-muted/40 p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
              <UserCheck className="w-5 h-5 text-success mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Days Present</p>
              <p className="text-xl font-bold text-foreground">{stats.presentDays}</p>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
              <CalendarDays className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Working Days</p>
              <p className="text-xl font-bold text-foreground">{stats.workingDays}</p>
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-xl flex items-center justify-between border border-secondary-foreground/10">
            <span className="text-sm font-medium text-secondary-foreground">Base Monthly Salary</span>
            <span className="font-semibold text-secondary-foreground tabular-nums">
              ₹{stats.baseSalary.toLocaleString('en-IN')}
            </span>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t border-border p-4">
          <Button 
            className="w-full rounded-xl shadow-sm bg-primary text-primary-foreground hover:bg-primary/90" 
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            View Detailed Breakdown
          </Button>
        </CardFooter>
      </Card>

      <SalaryBreakdownModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={employee}
        month={currentMonth}
        year={currentYear}
        stats={stats}
      />
    </>
  );
}