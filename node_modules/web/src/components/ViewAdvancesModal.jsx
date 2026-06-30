import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const ViewAdvancesModal = ({ isOpen, onClose, employee, advances }) => {
  if (!employee) return null;

  const employeeAdvances = advances.filter(a => a.employee_id === employee.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalAdvances = employeeAdvances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Advance History: {employee.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <ScrollArea className="h-[300px] border border-border rounded-xl">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeAdvances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No advances found for this employee.
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeAdvances.map((adv) => (
                    <TableRow key={adv.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(adv.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={adv.reason}>
                        {adv.reason || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={adv.status === 'Pending' ? 'bg-warning/20 text-warning border-warning/30' : 'bg-success/20 text-success border-success/30'}
                        >
                          {adv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{adv.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="mt-4 flex justify-between items-center bg-muted/40 p-4 rounded-xl border border-border">
            <span className="font-medium text-muted-foreground">Total Lifetime Advances</span>
            <span className="text-lg font-bold text-foreground">₹{totalAdvances.toLocaleString()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAdvancesModal;