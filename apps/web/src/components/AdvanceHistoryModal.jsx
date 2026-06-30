import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { History, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function AdvanceHistoryModal({ isOpen, onClose, employee, onSuccess }) {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && employee) {
      fetchAdvances();
    }
  }, [isOpen, employee]);

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('advances').getFullList({
        filter: `employee_id = "${employee.id}"`,
        sort: '-date',
        $autoCancel: false
      });
      setAdvances(records);
    } catch (error) {
      console.error('Failed to fetch advances:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Advance History: {employee?.name}
          </DialogTitle>
          <DialogDescription>
            Track all advances given, remaining balances, and repayment progress.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount Given</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead className="w-[200px]">Repayment Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading history...</TableCell>
                </TableRow>
              ) : advances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No advance records found for this employee.</TableCell>
                </TableRow>
              ) : (
                advances.map(adv => {
                  const amount = adv.amount || 0;
                  const remaining = adv.remaining_balance ?? amount;
                  const recovered = amount - remaining;
                  const progressPct = amount > 0 ? (recovered / amount) * 100 : 0;
                  
                  return (
                    <TableRow key={adv.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{format(new Date(adv.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="tabular-nums">₹{amount.toLocaleString()}</TableCell>
                      <TableCell className="tabular-nums font-semibold text-warning">
                        ₹{remaining.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progressPct.toFixed(0)}% Recovered</span>
                            <span>₹{recovered.toLocaleString()}</span>
                          </div>
                          <Progress value={progressPct} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {adv.status === 'Settled' ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}