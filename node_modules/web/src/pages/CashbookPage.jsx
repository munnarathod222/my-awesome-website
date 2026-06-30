import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { format, parseISO } from 'date-fns';
import { Wallet, Search, Filter, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, PlusCircle, Settings, Users, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

import { useCashbookData } from '@/hooks/useCashbookData.js';
import { useCashbookInit } from '@/hooks/useCashbookInit.js';
import pb from '@/lib/pocketbaseClient.js';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

import ExpenseModal from '@/components/ExpenseModal.jsx';
import AddIncomeModal from '@/components/AddIncomeModal.jsx';
import EditOpeningBalanceModal from '@/components/EditOpeningBalanceModal.jsx';
import CashbookTransactionList from '@/components/CashbookTransactionList.jsx';

export default function CashbookPage() {
  const { isInitialized } = useCashbookInit();
  const { transactions, isLoading: isTxLoading, error, refetch } = useCashbookData();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [openingBalanceRecord, setOpeningBalanceRecord] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    employee: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const fetchOpeningBalance = async () => {
    try {
      const record = await pb.collection('cashbook').getFirstListItem('description="Opening Balance" || reference_type="opening_balance"', { 
        sort: '-created', 
        $autoCancel: false 
      });
      setOpeningBalanceRecord(record);
    } catch (e) {
      setOpeningBalanceRecord(null);
    }
  };

  const fetchEmployees = async () => {
    try {
      const records = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false });
      setEmployees(records);
    } catch (err) {
      console.error('Failed to fetch employees for cashbook filters', err);
    }
  };

  useEffect(() => {
    fetchOpeningBalance();
    fetchEmployees();
  }, [transactions]); // Refetch opening balance when transactions update

  const employeesMap = useMemo(() => {
    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp.name;
      return acc;
    }, {});
  }, [employees]);

  const isLoading = !isInitialized || isTxLoading;

  const processedTransactions = useMemo(() => {
    if (!transactions) return [];
    
    // Filter out the opening balance record from regular transactions list
    const regularTxs = transactions.filter(t => t.description !== 'Opening Balance' && t.reference_type !== 'opening_balance');
    
    let openingAmt = 0;
    if (openingBalanceRecord) {
      const isCredit = openingBalanceRecord.transaction_type === 'Income' || openingBalanceRecord.transaction_type === 'credit';
      openingAmt = isCredit ? Number(openingBalanceRecord.amount) : -Number(openingBalanceRecord.amount);
    }
    
    let currentBal = openingAmt;
    const asc = [...regularTxs].reverse();
    
    const calculated = asc.map(tx => {
      const amt = Number(tx.amount) || 0;
      const isCredit = tx.transaction_type === 'Income' || tx.transaction_type === 'credit';
      if (isCredit) {
        currentBal += amt;
      } else {
        currentBal -= amt;
      }
      return { ...tx, running_balance: currentBal };
    });
    
    const reversed = calculated.reverse();

    if (openingBalanceRecord) {
      reversed.push({
        ...openingBalanceRecord,
        isOpeningBalance: true,
        running_balance: openingAmt,
        description: 'Opening Balance',
        category: 'Opening Balance',
        amount: Math.abs(openingAmt)
      });
    }
    
    return reversed;
  }, [transactions, openingBalanceRecord]);

  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter(tx => {
      if (tx.isOpeningBalance) return true;

      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      if (filters.type !== 'all') {
        const isIncome = tx.transaction_type === 'Income' || tx.transaction_type === 'credit';
        if (filters.type === 'Income' && !isIncome) return false;
        if (filters.type === 'Expense' && isIncome) return false;
      }
      if (filters.employee !== 'all' && tx.employee_id !== filters.employee) return false;
      
      if (filters.dateFrom) {
        if (new Date(tx.date).getTime() < new Date(filters.dateFrom).getTime()) return false;
      }
      if (filters.dateTo) {
        if (new Date(tx.date).getTime() >= new Date(filters.dateTo).getTime() + 86400000) return false;
      }
      
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!tx.description?.toLowerCase().includes(q) && !tx.category?.toLowerCase().includes(q)) {
          return false;
        }
      }
      
      return true;
    });
  }, [processedTransactions, filters]);

  const formatCurrency = (val) => {
    const absVal = Math.abs(val || 0);
    const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(absVal);
    return val < 0 ? `-${formatted}` : formatted;
  };

  const displayBalance = useMemo(() => {
    let openingAmt = 0;
    if (openingBalanceRecord) {
      const isCredit = openingBalanceRecord.transaction_type === 'Income' || openingBalanceRecord.transaction_type === 'credit';
      openingAmt = isCredit ? Number(openingBalanceRecord.amount) : -Number(openingBalanceRecord.amount);
    }
    
    const regularTxs = transactions ? transactions.filter(t => t.description !== 'Opening Balance' && t.reference_type !== 'opening_balance') : [];
    const totalIncome = regularTxs.filter(t => t.transaction_type === 'Income' || t.transaction_type === 'credit').reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const totalOutflow = regularTxs.filter(t => t.transaction_type !== 'Income' && t.transaction_type !== 'credit').reduce((a, b) => a + (Number(b.amount) || 0), 0);
    
    return openingAmt + totalIncome - totalOutflow;
  }, [transactions, openingBalanceRecord]);

  const isNegativeBalance = displayBalance < 0;

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
    
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to load cashbook</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{errorMessage}</p>
        <Button onClick={refetch} className="gap-2 rounded-xl shadow-sm">
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <Helmet>
        <title>Cashbook Ledger | Transport Manager</title>
      </Helmet>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
                Live Cashbook
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Real-time tracking of all integrated expenses, advances, and manual income entries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setIsOpeningBalanceModalOpen(true)} variant="secondary" className="rounded-xl shadow-sm gap-2 bg-secondary text-secondary-foreground">
                <Settings className="w-4 h-4" /> Set Opening Balance
              </Button>
              <Button onClick={() => setIsIncomeModalOpen(true)} className="rounded-xl shadow-sm gap-2 bg-success hover:bg-success/90 text-success-foreground">
                <PlusCircle className="w-4 h-4" /> Add Income
              </Button>
              <Button onClick={() => setIsExpenseModalOpen(true)} className="rounded-xl shadow-sm gap-2">
                <PlusCircle className="w-4 h-4" /> Add Expense
              </Button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
              <Skeleton className="h-[400px] rounded-2xl" />
            </div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`border-border shadow-sm bg-card overflow-hidden relative ${isNegativeBalance ? 'ring-2 ring-destructive/20' : ''}`}>
                  <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                    {isNegativeBalance ? <TrendingDown className="w-24 h-24" /> : <Wallet className="w-24 h-24" />}
                  </div>
                  <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Balance</p>
                      <h3 className={`text-4xl font-extrabold mt-4 tabular-nums tracking-tight ${isNegativeBalance ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(displayBalance)}
                      </h3>
                      {isNegativeBalance && (
                        <p className="text-xs text-destructive/80 mt-2 font-medium">Account in debt</p>
                      )}
                    </div>
                    {openingBalanceRecord && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Opening Balance</p>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${openingBalanceRecord.amount < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {formatCurrency(openingBalanceRecord.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">{format(parseISO(openingBalanceRecord.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Income</p>
                        <h3 className="text-2xl font-bold text-success mt-2 tabular-nums">
                          {formatCurrency(processedTransactions.filter(t => !t.isOpeningBalance && (t.transaction_type === 'Income' || t.transaction_type === 'credit')).reduce((a,b) => a + (Number(b.amount) || 0), 0))}
                        </h3>
                      </div>
                      <div className="p-2 bg-success/10 rounded-xl">
                        <ArrowDownRight className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Outflow</p>
                        <h3 className="text-2xl font-bold text-destructive mt-2 tabular-nums">
                          {formatCurrency(processedTransactions.filter(t => !t.isOpeningBalance && t.transaction_type !== 'Income' && t.transaction_type !== 'credit').reduce((a,b) => a + (Number(b.amount) || 0), 0))}
                        </h3>
                      </div>
                      <div className="p-2 bg-destructive/10 rounded-xl">
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 sm:p-6 space-y-6">
                
                <div className="flex flex-col xl:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search descriptions..." 
                      className="pl-9 bg-background" 
                      value={filters.search}
                      onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                    />
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                    <div className="flex items-center gap-2 min-w-[280px]">
                      <Input type="date" className="bg-background" value={filters.dateFrom} onChange={(e) => setFilters(p => ({...p, dateFrom: e.target.value}))} />
                      <span className="text-muted-foreground">-</span>
                      <Input type="date" className="bg-background" value={filters.dateTo} onChange={(e) => setFilters(p => ({...p, dateTo: e.target.value}))} />
                    </div>

                    <Select value={filters.employee} onValueChange={(v) => setFilters(p => ({...p, employee: v}))}>
                      <SelectTrigger className="w-[160px] bg-background">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.category} onValueChange={(v) => setFilters(p => ({...p, category: v}))}>
                      <SelectTrigger className="w-[150px] bg-background">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                        <SelectItem value="Advance">Advance</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filters.type} onValueChange={(v) => setFilters(p => ({...p, type: v}))}>
                      <SelectTrigger className="w-[130px] bg-background">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <CashbookTransactionList 
                  transactions={filteredTransactions} 
                  loading={false}
                  employeesMap={employeesMap}
                  onEditOpeningBalance={() => setIsOpeningBalanceModalOpen(true)}
                  onDeleteSuccess={() => {
                    fetchOpeningBalance();
                    refetch();
                  }}
                />

              </motion.div>
            </>
          )}

        </motion.div>
      </main>

      <AddIncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
        onSuccess={refetch}
      />

      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={refetch}
      />

      <EditOpeningBalanceModal
        isOpen={isOpeningBalanceModalOpen}
        onClose={() => setIsOpeningBalanceModalOpen(false)}
        existingRecord={openingBalanceRecord}
        onSuccess={() => {
          fetchOpeningBalance();
          refetch();
        }}
      />
    </div>
  );
}