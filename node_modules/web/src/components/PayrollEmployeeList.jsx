import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Edit2, CreditCard, History, Banknote } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { format, addMonths, addWeeks, addDays } from 'date-fns';
import { toast } from 'sonner';

import EditEmployeeModal from './EditEmployeeModal.jsx';
import PayrollGenerationModal from './PayrollGenerationModal.jsx';
import ViewAdvancesModal from './ViewAdvancesModal.jsx';

const PayrollEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAdvancesModalOpen, setIsAdvancesModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empsRes, advRes, salRes] = await Promise.all([
        pb.collection('employees').getFullList({ filter: 'active_status="active"', $autoCancel: false }),
        pb.collection('advances').getFullList({ $autoCancel: false }),
        pb.collection('payroll').getFullList({ sort: '-payment_date', $autoCancel: false })
      ]);
      
      setEmployees(empsRes);
      setAdvances(advRes);
      setSalaryPayments(salRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getNextPaymentDate = (lastDate, cycle) => {
    if (!lastDate) return '-';
    const d = new Date(lastDate);
    if (cycle === 'Monthly') return format(addMonths(d, 1), 'MMM dd, yyyy');
    if (cycle === 'Weekly') return format(addWeeks(d, 1), 'MMM dd, yyyy');
    if (cycle === 'Bi-weekly') return format(addDays(d, 14), 'MMM dd, yyyy');
    return '-';
  };

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setIsEditModalOpen(true);
  };

  const handlePay = (emp) => {
    setSelectedEmployee(emp);
    setIsPayModalOpen(true);
  };

  const handleViewAdvances = (emp) => {
    setSelectedEmployee(emp);
    setIsAdvancesModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 border-b border-border pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" /> Employee Salary Roster
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-[200px]">Employee Details</TableHead>
                  <TableHead>Salary Structure</TableHead>
                  <TableHead className="text-right">Pending Advances</TableHead>
                  <TableHead className="text-right">Current Payable</TableHead>
                  <TableHead className="text-center">Timeline</TableHead>
                  <TableHead className="text-right">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Users className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No active employees found</p>
                        <p className="text-sm mt-1">Add employees in the Database to manage payroll.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => {
                    const empAdvances = advances.filter(a => a.employee_id === emp.id && a.status === 'Pending');
                    // Use remaining_balance if available, fallback to amount
                    const totalAdvances = empAdvances.reduce((sum, a) => sum + (a.remaining_balance ?? a.amount), 0);
                    
                    const empPayments = salaryPayments.filter(s => s.employee_id === emp.id);
                    
                    const pendingAmount = Math.max(0, (emp.salary_amount || emp.base_salary || 0) - totalAdvances);
                    
                    const lastPayment = empPayments.length > 0 ? empPayments[0].payment_date : null;
                    const nextPayment = getNextPaymentDate(lastPayment, emp.salary_billing_cycle);

                    return (
                      <TableRow key={emp.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-foreground text-sm">{emp.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{emp.position || 'Staff'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">₹{(emp.salary_amount || emp.base_salary || 0).toLocaleString()}</div>
                          <Badge variant="secondary" className="text-[10px] mt-1 font-medium">
                            {emp.salary_billing_cycle || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold tabular-nums text-sm ${totalAdvances > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            ₹{totalAdvances.toLocaleString()}
                          </span>
                          {totalAdvances > 0 && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{empAdvances.length} record(s)</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground text-sm tabular-nums">
                          ₹{pendingAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          <div className="text-muted-foreground">Last: {lastPayment ? format(new Date(lastPayment), 'MMM dd, yyyy') : '-'}</div>
                          <div className="font-medium text-foreground mt-1">Next: {nextPayment}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit Info">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleViewAdvances(emp)} className="h-8 w-8 text-muted-foreground hover:text-primary" title="View Advances">
                              <History className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handlePay(emp)} className="h-8 px-3 gap-1.5 ml-1">
                              <CreditCard className="w-3.5 h-3.5" /> Pay
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedEmployee && isEditModalOpen && (
        <EditEmployeeModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          employee={selectedEmployee} 
          onSuccess={fetchData} 
        />
      )}
      
      {selectedEmployee && isPayModalOpen && (
        <PayrollGenerationModal 
          isOpen={isPayModalOpen} 
          onClose={() => setIsPayModalOpen(false)} 
          employee={selectedEmployee} 
          advances={advances} 
          onSuccess={fetchData} 
        />
      )}

      {selectedEmployee && isAdvancesModalOpen && (
        <ViewAdvancesModal 
          isOpen={isAdvancesModalOpen} 
          onClose={() => setIsAdvancesModalOpen(false)} 
          employee={selectedEmployee} 
          advances={advances} 
        />
      )}
    </div>
  );
};

export default PayrollEmployeeList;