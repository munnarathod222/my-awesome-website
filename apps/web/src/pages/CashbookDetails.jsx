import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Plus, Pencil, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import TransactionForm from '@/components/TransactionForm.jsx';
import TransactionFilters from '@/components/TransactionFilters.jsx';
import ImagePreview from '@/components/ImagePreview.jsx';

const CashbookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cashbooks, setCashbooks] = useState([]);
  const [currentCashbook, setCurrentCashbook] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'All',
    search: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all cashbooks for the selector
      const cbList = await pb.collection('cashbooks').getFullList({
        filter: 'status="active"',
        sort: 'name',
        $autoCancel: false
      });
      setCashbooks(cbList);

      if (!id && cbList.length > 0) {
        // If no ID in URL but we have cashbooks, redirect to first one
        navigate(`/cashbook/${cbList[0].id}`, { replace: true });
        return;
      }

      if (id) {
        const current = cbList.find(c => c.id === id) || await pb.collection('cashbooks').getOne(id, { $autoCancel: false });
        setCurrentCashbook(current);
        await fetchTransactions(id, current.opening_balance);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load cashbook data');
      setLoading(false);
    }
  };

  const fetchTransactions = async (cashbookId, openingBalance) => {
    try {
      // Fetch all transactions to calculate running balance accurately
      const txns = await pb.collection('cashbook_transactions').getFullList({
        filter: `cashbook_id="${cashbookId}"`,
        sort: '+date,+created', // Oldest first for balance calculation
        $autoCancel: false
      });

      // Calculate running balance
      let currentBal = Number(openingBalance) || 0;
      const processedTxns = txns.map(t => {
        const isCashIn = t.transaction_type === 'credit' || t.transaction_type === 'Cash In';
        if (isCashIn) {
          currentBal += t.amount;
        } else {
          currentBal -= t.amount;
        }
        return {
          ...t,
          transaction_type: isCashIn ? 'Cash In' : 'Cash Out',
          runningBalance: currentBal
        };
      });

      // Reverse to show newest first
      processedTxns.reverse();
      setTransactions(processedTxns);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (txnId) => {
    if (window.confirm('Are you sure you want to delete this transaction? This will affect the running balance.')) {
      try {
        await pb.collection('cashbook_transactions').delete(txnId, { $autoCancel: false });
        toast.success('Transaction deleted');
        fetchTransactions(id, currentCashbook.opening_balance);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleEdit = (txn) => {
    setTransactionToEdit(txn);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setTransactionToEdit(null);
    setIsFormOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      type: 'All',
      search: ''
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesDesc = t.description?.toLowerCase().includes(term);
        const matchesRef = t.reference_number?.toLowerCase().includes(term);
        if (!matchesDesc && !matchesRef) return false;
      }
      
      // Type
      if (filters.type !== 'All' && t.transaction_type !== filters.type) {
        return false;
      }

      // Date Range
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        const tDate = new Date(t.date);
        if (tDate < fromDate) return false;
      }
      if (filters.dateTo) {
        // Add 1 day to include the entire end date
        const toDate = new Date(filters.dateTo);
        toDate.setDate(toDate.getDate() + 1);
        const tDate = new Date(t.date);
        if (tDate >= toDate) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Summary Metrics (based on ALL fetched transactions for this cashbook to reflect true balance)
  const summary = useMemo(() => {
    if (!currentCashbook) return { in: 0, out: 0, closing: 0 };
    let totalIn = 0;
    let totalOut = 0;
    transactions.forEach(t => {
      if (t.transaction_type === 'Cash In') totalIn += t.amount;
      else totalOut += t.amount;
    });
    return {
      in: totalIn,
      out: totalOut,
      closing: (Number(currentCashbook.opening_balance) || 0) + totalIn - totalOut
    };
  }, [transactions, currentCashbook]);


  if (loading && !currentCashbook) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (error || !currentCashbook) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Cashbook</h2>
          <p className="text-muted-foreground mb-6">{error || 'Cashbook not found'}</p>
          <Button onClick={() => navigate('/cashbook')}>Back to Cashbook Manager</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentCashbook.name} - Transactions</title>
        <meta name="description" content="View and manage cashbook transactions" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Top Bar: Selector & Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1 md:w-[300px]">
                <Select value={id} onValueChange={(val) => navigate(`/cashbook/${val}`)}>
                  <SelectTrigger className="text-xl font-bold h-auto py-2 bg-transparent border-none shadow-none focus:ring-0 px-0">
                    <SelectValue placeholder="Select Cashbook" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashbooks.map(cb => (
                      <SelectItem key={cb.id} value={cb.id}>{cb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{currentCashbook.description || 'No description'}</p>
              </div>
            </div>
            
            <Button onClick={openNewForm} className="w-full md:w-auto gap-2 transition-all duration-200 active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Opening Balance</p>
                <p className="text-2xl font-bold">₹{currentCashbook.opening_balance.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-success/5 border-success/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-success">Total Cash In</p>
                  <ArrowDownRight className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">+₹{summary.in.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-destructive">Total Cash Out</p>
                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-2xl font-bold text-destructive">-₹{summary.out.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className={`shadow-sm border-border ${summary.closing >= 0 ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Closing Balance</p>
                <p className={`text-3xl font-extrabold tracking-tight ${summary.closing >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ₹{summary.closing.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <TransactionFilters 
            filters={filters} 
            onFilterChange={setFilters} 
            onReset={resetFilters} 
          />

          {/* Transactions Table */}
          <Card className="shadow-lg border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category / Mode</TableHead>
                    <TableHead className="hidden md:table-cell max-w-[200px]">Description</TableHead>
                    <TableHead className="w-[80px] text-center">Receipt</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm">Try adjusting your filters or add a new transaction.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map(txn => (
                      <TableRow key={txn.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(new Date(txn.date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            txn.transaction_type === 'Cash In' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {txn.transaction_type}
                          </span>
                        </TableCell>
                        <TableCell className={`font-semibold ${
                            txn.transaction_type === 'Cash In' ? 'text-success' : 'text-foreground'
                        }`}>
                          {txn.transaction_type === 'Cash In' ? '+' : ''}₹{txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{txn.category || '-'}</span>
                            <span className="text-xs text-muted-foreground">{txn.payment_mode}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={txn.description}>
                          <div className="flex flex-col">
                            <span className="truncate">{txn.description || '-'}</span>
                            {txn.reference_number && (
                              <span className="text-xs text-muted-foreground font-mono">Ref: {txn.reference_number}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <ImagePreview record={txn} altText={`Receipt for ${format(new Date(txn.date), 'dd MMM')}`} />
                        </TableCell>
                        <TableCell className={`text-right font-bold tracking-tight ${txn.runningBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                          ₹{txn.runningBalance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEdit(txn)}
                              aria-label="Edit transaction"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(txn.id)}
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      <TransactionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        cashbookId={id}
        transactionToEdit={transactionToEdit}
        onSuccess={() => fetchTransactions(id, currentCashbook.opening_balance)}
      />
    </>
  );
};

export default CashbookDetails;