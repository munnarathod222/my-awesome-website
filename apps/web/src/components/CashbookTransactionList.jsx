import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Eye, AlertCircle, TrendingDown, TrendingUp, Edit2, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils.js';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

export default function CashbookTransactionList({ transactions, loading, onViewSource, onEditOpeningBalance, onDeleteSuccess, employeesMap = {} }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const handleDeleteConfirm = async () => {
    if (!txToDelete) return;

    console.log(`[Cashbook Deletion Attempt] ID: ${txToDelete.id}, Timestamp: ${new Date().toISOString()}`);
    setIsDeleting(true);

    try {
      const response = await apiServerClient.fetch(`/cashbook/${txToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Transaction not found - it may have been deleted already');
          setTxToDelete(null);
          if (onDeleteSuccess) onDeleteSuccess();
        } else if (response.status === 409) {
          let errMsg = 'This transaction is linked to a system module and cannot be deleted.';
          try {
            const errData = await response.json();
            if (errData?.message) errMsg = errData.message;
          } catch (e) {}
          toast.error(errMsg);
          setTxToDelete(null);
        } else {
          let errMsg = 'Failed to delete transaction';
          try {
            const errData = await response.json();
            if (typeof errData === 'string') {
              errMsg = errData;
            } else if (errData?.message && typeof errData.message === 'string') {
              errMsg = errData.message;
            } else if (errData?.error?.message && typeof errData.error.message === 'string') {
              errMsg = errData.error.message;
            } else if (errData?.error && typeof errData.error === 'string') {
              errMsg = errData.error;
            }
          } catch (e) {
            // Ignore JSON parse error, fallback to default message
          }
          toast.error(errMsg);
          setTxToDelete(null);
        }
        return;
      }

      toast.success('Transaction deleted successfully');
      setTxToDelete(null);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Network failure during deletion:', error);
      let errMsg = 'Network error. Please check your connection and try again.';
      if (error?.message && typeof error.message === 'string') {
        errMsg = error.message;
      } else if (error?.response?.data?.error?.message && typeof error.response.data.error.message === 'string') {
        errMsg = error.response.data.error.message;
      }
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadge = (category) => {
    const map = {
      'Expense': 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
      'Regular Expense': 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
      'Payroll': 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
      'Employee Salary': 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
      'Driver Advance': 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
      'Fuel': 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    };
    const style = map[category] || 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80';
    
    return (
      <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold tracking-wider", style)}>
        {category || 'Other'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Desktop Transaction Table (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] font-semibold tracking-wide">Date</TableHead>
              <TableHead className="font-semibold tracking-wide">Description</TableHead>
              <TableHead className="font-semibold tracking-wide">Category</TableHead>
              <TableHead className="font-semibold tracking-wide">Employee</TableHead>
              <TableHead className="font-semibold tracking-wide text-center">Type</TableHead>
              <TableHead className="text-right font-semibold tracking-wide">Amount</TableHead>
              <TableHead className="text-right font-semibold tracking-wide">Balance</TableHead>
              <TableHead className="text-right w-[100px] print:hidden">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                  <p className="text-lg font-medium text-foreground">No transactions found</p>
                  <p className="text-sm mt-1">Try adjusting your filters to see more results.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => {
                if (tx.isOpeningBalance) {
                  const isDebitOB = tx.running_balance < 0;
                  return (
                    <TableRow key={`ob-${tx.id}`} className="bg-primary/5 hover:bg-primary/10 transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm font-semibold text-primary">{format(parseISO(tx.date), 'MMM dd, yyyy')}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-primary">Opening Balance</p>
                        {tx.notes && <p className="text-xs text-primary/80 mt-0.5">{tx.notes}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary border-transparent hover:bg-primary/30 text-[10px] uppercase tracking-wider font-bold">
                          Opening Balance
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">-</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-transparent",
                          isDebitOB ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                        )}>
                          {isDebitOB ? <TrendingDown className="w-3 h-3 mr-1 inline" /> : <TrendingUp className="w-3 h-3 mr-1 inline" />}
                          {isDebitOB ? 'Debit' : 'Credit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-bold tabular-nums",
                          isDebitOB ? "text-foreground" : "text-success"
                        )}>
                          {isDebitOB ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums text-foreground">
                        {formatCurrency(tx.running_balance)}
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/20" onClick={() => onEditOpeningBalance && onEditOpeningBalance(tx)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setTxToDelete(tx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                const isDebit = tx.transaction_type === 'debit' || tx.transaction_type === 'Expense' || tx.transaction_type === 'Advance';
                const employeeName = tx.employee_id && employeesMap[tx.employee_id] ? employeesMap[tx.employee_id] : null;
                
                return (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm font-medium">{format(parseISO(tx.date), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{format(parseISO(tx.date), 'hh:mm a')}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground max-w-[250px] truncate" title={tx.description}>
                        {tx.description || '-'}
                      </p>
                      {tx.reference_number && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          Ref: {tx.reference_number}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(tx.category)}
                    </TableCell>
                    <TableCell>
                      {employeeName ? (
                        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium text-[10px]">
                          {employeeName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-transparent",
                        isDebit ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      )}>
                        {isDebit ? <TrendingDown className="w-3 h-3 mr-1 inline" /> : <TrendingUp className="w-3 h-3 mr-1 inline" />}
                        {isDebit ? 'Debit' : 'Credit'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "font-bold tabular-nums",
                        isDebit ? "text-foreground" : "text-success"
                      )}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-foreground">
                      {formatCurrency(tx.running_balance)}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => setSelectedTx(tx)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => setTxToDelete(tx)}
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Mobile Transaction Cards (Visible on mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border/50 rounded-2xl p-6">
            <FileText className="w-10 h-10 opacity-30 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No transactions found</p>
          </div>
        ) : (
          paginatedTransactions.map((tx) => {
            const isOB = tx.description === 'Opening Balance' || tx.reference_type === 'opening_balance';
            const isDebit = isOB ? tx.running_balance < 0 : (tx.transaction_type === 'debit' || tx.transaction_type === 'Expense' || tx.transaction_type === 'Advance');
            const employeeName = tx.employee_id && employeesMap[tx.employee_id] ? employeesMap[tx.employee_id] : null;

            return (
              <div 
                key={tx.id}
                className={cn(
                  "p-4 rounded-2xl border transition-colors relative shadow-md space-y-3",
                  isOB ? "bg-primary/5 border-primary/20" : "bg-card border-border/50 hover:border-primary/20"
                )}
              >
                {/* Header: Type and Date */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(tx.date), 'dd MMM yyyy, hh:mm a')}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-transparent",
                    isDebit ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                  )}>
                    {isDebit ? 'Debit' : 'Credit'}
                  </Badge>
                </div>

                {/* Body: Title, Notes & Category */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">
                    {isOB ? 'Opening Balance' : (tx.description || 'No Description')}
                  </div>
                  {tx.reference_number && (
                    <div className="text-[10px] text-slate-400">
                      Ref: {tx.reference_number}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {isOB ? (
                      <Badge className="bg-primary/20 text-primary border-transparent text-[9px] uppercase tracking-wider font-bold">
                        Opening Balance
                      </Badge>
                    ) : (
                      getCategoryBadge(tx.category)
                    )}
                    {employeeName && (
                      <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium text-[9px] px-1.5">
                        {employeeName}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Footer: Amount, Bal, Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Running Balance</div>
                    <div className="text-xs font-bold text-slate-300">
                      {formatCurrency(tx.running_balance)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Amount</div>
                      <div className={cn(
                        "text-sm font-black tabular-nums",
                        isDebit ? "text-white" : "text-emerald-400"
                      )}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isOB ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/20 rounded-full" onClick={() => onEditOpeningBalance && onEditOpeningBalance(tx)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => setTxToDelete(tx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full"
                            onClick={() => setSelectedTx(tx)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => setTxToDelete(tx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}</span> of <span className="font-medium text-foreground">{transactions.length}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl shadow-sm"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="sm:max-w-[450px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-heading">
                Transaction Details
              </DialogTitle>
              <DialogDescription>
                Reference ID: {selectedTx.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Amount</span>
                <span className={cn(
                  "text-2xl font-extrabold tabular-nums",
                  selectedTx.transaction_type === 'debit' || selectedTx.transaction_type === 'Expense' || selectedTx.transaction_type === 'Advance' ? "text-destructive" : "text-success"
                )}>
                  {selectedTx.transaction_type === 'debit' || selectedTx.transaction_type === 'Expense' || selectedTx.transaction_type === 'Advance' ? '-' : '+'}{formatCurrency(selectedTx.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Date</p>
                  <p className="font-medium">{format(parseISO(selectedTx.date), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Category</p>
                  {getCategoryBadge(selectedTx.category)}
                </div>
                
                {selectedTx.employee_id && employeesMap[selectedTx.employee_id] && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Linked Employee</p>
                    <p className="font-medium text-foreground">{employeesMap[selectedTx.employee_id]}</p>
                  </div>
                )}
                
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Description</p>
                  <p className="font-medium bg-background p-3 rounded-lg border border-border text-foreground leading-relaxed">
                    {selectedTx.description || 'No description provided.'}
                  </p>
                </div>
                
                {selectedTx.source_module && (
                  <div className="col-span-2 mt-2 flex items-start gap-3 p-3 bg-primary/5 text-primary rounded-xl">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold mb-1">Auto-synced Record</p>
                      <p className="text-primary/80 text-xs">This transaction was automatically generated from the <strong>{selectedTx.source_module}</strong> module.</p>
                      {onViewSource && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-xs mt-1 underline hover:text-primary-foreground"
                          onClick={() => onViewSource(selectedTx)}
                        >
                          View Original Record Info
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedTx(null)} className="w-full rounded-xl">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!txToDelete} onOpenChange={(open) => !open && !isDeleting && setTxToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  {txToDelete?.isOpeningBalance
                    ? "Are you sure you want to delete the opening balance? All subsequent balances will be recalculated from zero. This action cannot be undone."
                    : "Are you sure you want to delete this transaction? This action cannot be undone."}
                </p>
                {txToDelete && !txToDelete.isOpeningBalance && (
                  <div className="p-3 bg-muted/50 rounded-xl border border-border text-sm text-foreground">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">{formatCurrency(txToDelete.amount)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{format(parseISO(txToDelete.date), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{txToDelete.category}</span>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl shadow-sm"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}