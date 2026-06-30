import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, FileText } from 'lucide-react';

const getCategoryBadgeClass = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('expense')) return 'cashbook-badge-expenses';
  if (cat.includes('advance')) return 'cashbook-badge-advances';
  if (cat.includes('payroll')) return 'cashbook-badge-payroll';
  if (cat.includes('fuel')) return 'cashbook-badge-fuel';
  return 'cashbook-badge-manual';
};

const TransactionList = ({ transactions, loading, onViewSource }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border border-dashed">
        <FileText className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Try adjusting your filters or add a new transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="max-w-[300px]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const isDebit = tx.transaction_type === 'debit';
              return (
                <TableRow key={tx.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium whitespace-nowrap text-foreground">
                    {format(new Date(tx.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryBadgeClass(tx.category)}>
                      {tx.category || 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate max-w-[300px] text-muted-foreground">
                    {tx.description || '-'}
                    {tx.source_module && (
                      <span className="block text-[10px] uppercase tracking-wider opacity-60 mt-0.5">
                        Source: {tx.source_module.replace('_', ' ')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={`font-semibold ${isDebit ? 'text-destructive' : 'text-success'}`}>
                      {isDebit ? '-' : '+'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-foreground">
                    ₹{tx.running_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    {tx.source_record_id && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => onViewSource(tx)}
                        title="View Source Record"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;