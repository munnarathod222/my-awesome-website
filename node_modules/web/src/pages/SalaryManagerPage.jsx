import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { calculateSalaryBreakdown } from '@/lib/SalaryCalculationHelper.js';
import AttendanceSummaryCard from '@/components/AttendanceSummaryCard.jsx';
import SalaryBreakdownCard from '@/components/SalaryBreakdownCard.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SalaryManagerPage = () => {
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth]);

  const fetchSalaryData = async () => {
    setLoading(true);
    setExpandedEmployee(null);
    try {
      const monthDate = new Date(selectedMonth + '-01');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Format dates for PocketBase filtering (YYYY-MM-DD)
      const monthStartStr = format(monthStart, 'yyyy-MM-dd');
      const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

      // Fetch all employees first
      const employeesData = await pb.collection('employees').getFullList({ $autoCancel: false });
      setEmployees(employeesData);

      // Process each employee individually to ensure accurate filtering and logging
      const salaries = await Promise.all(employeesData.map(async (emp) => {
        // 1. Fetch attendance records for selected employee and month
        const attendanceRecords = await pb.collection('attendance').getFullList({
          filter: `employee_name="${emp.name}" && date >= "${monthStartStr}" && date <= "${monthEndStr}"`,
          $autoCancel: false
        });

        // 2. Count absent days correctly
        const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;

        // 4. Fetch trip logs for the employee and month
        const tripLogs = await pb.collection('trip_logs').getFullList({
          filter: `driver_name="${emp.name}" && date >= "${monthStartStr}" && date <= "${monthEndStr}"`,
          $autoCancel: false
        });
        const tripCount = tripLogs.length;

        // 5. Fetch driver advances for the employee
        const advances = await pb.collection('expenses_driver_advance').getFullList({
          filter: `driver_name="${emp.name}" && date >= "${monthStartStr}" && date <= "${monthEndStr}"`,
          $autoCancel: false
        });
        const advancesTotal = advances.reduce((sum, a) => sum + (a.amount || 0), 0);

        // 6 & 7. Calculate salary using the updated helper
        const breakdown = calculateSalaryBreakdown(
          emp, 
          attendanceRecords, 
          tripCount, 
          advancesTotal
        );

        return {
          employee: emp,
          breakdown
        };
      }));

      setSalaryData(salaries);
    } catch (error) {
      console.error('Error fetching salary data:', error);
      toast.error('Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  const toggleExpand = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Calculating salaries...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Salary manager - Jai Bhavani Cargo</title>
        <meta name="description" content="Manage employee salaries, attendance deductions, and payments" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Salary manager</h1>

          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle>Select processing month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label htmlFor="month" className="mb-2 block text-muted-foreground">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month" className="bg-input text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle>Salary breakdown for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Employee</TableHead>
                      <TableHead>Base salary</TableHead>
                      <TableHead>Trip bonus</TableHead>
                      <TableHead>Attendance ded.</TableHead>
                      <TableHead>Advances</TableHead>
                      <TableHead>Final salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      salaryData.map(({ employee, breakdown }) => (
                        <React.Fragment key={employee.id}>
                          <TableRow className={`border-border transition-colors ${expandedEmployee === employee.id ? 'bg-muted/30 hover:bg-muted/30' : 'hover:bg-muted/50'}`}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>₹{breakdown.baseSalary.toLocaleString()}</TableCell>
                            <TableCell className="text-success font-medium">+₹{breakdown.tripBonus.toLocaleString()}</TableCell>
                            <TableCell className="text-destructive font-medium">-₹{breakdown.attendanceDeduction.toLocaleString()}</TableCell>
                            <TableCell className="text-destructive font-medium">-₹{breakdown.driverAdvances.toLocaleString()}</TableCell>
                            <TableCell className="font-bold text-primary">₹{breakdown.finalSalary.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleExpand(employee.id)}
                                className="w-full sm:w-auto"
                              >
                                {expandedEmployee === employee.id ? (
                                  <>Hide Details <ChevronUp className="w-4 h-4 ml-1" /></>
                                ) : (
                                  <>View Details <ChevronDown className="w-4 h-4 ml-1" /></>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedEmployee === employee.id && (
                            <TableRow className="border-border bg-muted/10">
                              <TableCell colSpan={7} className="p-0">
                                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                                  <AttendanceSummaryCard attendanceSummary={breakdown} />
                                  <SalaryBreakdownCard employee={employee} breakdown={breakdown} />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SalaryManagerPage;