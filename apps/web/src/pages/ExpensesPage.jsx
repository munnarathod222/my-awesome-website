import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, AlertCircle, Receipt, FileText, Trash2, ExternalLink, Edit2, Banknote, CalendarRange, RefreshCw, CreditCard, Tag, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import ExpenseFilters from '@/components/ExpenseFilters.jsx';
import ExpenseModal from '@/components/ExpenseModal.jsx';
import AdvanceEditModal from '@/components/AdvanceEditModal.jsx';
import BillsList from '@/components/BillsList.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AdvanceIntegrationService from '@/lib/AdvanceIntegrationService.js';
import apiServerClient from '@/lib/apiServerClient.js';

const ExpensesPage = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingAdvanceId, setProcessingAdvanceId] = useState(null);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingAdvance, setEditingAdvance] = useState(null);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [directUploadExpense, setDirectUploadExpense] = useState(null);
  const directFileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    search: '', dateFrom: '', dateTo: '', category: 'all', subcategory: 'all', truckNo: 'all', paymentMode: 'all', creditCard: 'all', sortBy: '-date'
  });
  
  const [advFilters, setAdvFilters] = useState({
    search: '', dateFrom: '', dateTo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!pb) throw new Error('PocketBase client not initialized');

      const truckRecords = await pb.collection('trucks').getFullList({ $autoCancel: false });
      setTrucks(truckRecords);

      const cardsRecord = await pb.collection('credit_cards').getFullList({
        filter: `user_id = "${currentUser?.id || ''}"`,
        $autoCancel: false
      });
      setCreditCards(cardsRecord);
      const cardsMap = {};
      cardsRecord.forEach(c => cardsMap[c.id] = c);

      const records = await pb.collection('expenses').getList(1, 500, {
        sort: filters.sortBy,
        $autoCancel: false
      });
      
      const mappedExpenses = records.items.map(exp => ({
        ...exp,
        cardContext: exp.credit_card_id ? cardsMap[exp.credit_card_id] : null
      }));
      setExpenses(mappedExpenses);

      const advRes = await apiServerClient.fetch('/advances/with-employee-details/list');
      const advData = await advRes.json();
      if (advData.success) {
        const sortedAdvs = (advData.advances || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setAdvances(sortedAdvs);
      } else {
        setAdvances([]);
      }

    } catch (err) {
      console.error('[ExpensesPage] Error fetching data:', err);
      if (err.status === 403) {
        setError('You do not have permission to view this data. Please contact an administrator.');
      } else {
        setError(err.message || 'Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    pb.collection('expenses').subscribe('*', () => setRefreshTrigger(p => p + 1));
    pb.collection('advances').subscribe('*', () => setRefreshTrigger(p => p + 1));
    
    return () => {
      pb.collection('expenses').unsubscribe('*');
      pb.collection('advances').unsubscribe('*');
    };
  }, [currentUser?.id, filters.sortBy, refreshTrigger]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const cashbookEntries = await pb.collection('cashbook').getFullList({
        filter: `reference_id="${id}" && reference_type="expense"`,
        $autoCancel: false
      });
      for (const entry of cashbookEntries) {
        await pb.collection('cashbook').delete(entry.id, { $autoCancel: false });
      }
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast.success('Expense deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete the expense.');
    }
  };

  const handleMarkAdvanceSettled = async (id) => {
    setProcessingAdvanceId(id);
    try {
      await AdvanceIntegrationService.updateAdvanceStatus(id, 'Settled', 'Marked settled from Expenses ledger');
      toast.success('Advance marked as settled');
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to settle advance');
    } finally {
      setProcessingAdvanceId(null);
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advance?')) return;
    try {
      await pb.collection('advances').delete(id, { $autoCancel: false });
      toast.success('Advance deleted successfully');
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      toast.error('Failed to delete advance');
    }
  };

  const triggerDirectFileUpload = (expense) => {
    setDirectUploadExpense(expense);
    if (directFileInputRef.current) {
      directFileInputRef.current.value = '';
      directFileInputRef.current.click();
    }
  };

  const handleDirectFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !directUploadExpense) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    const toastId = toast.loading('Uploading bill document...');
    try {
      const formData = new FormData();
      formData.append('documents', file);
      
      await pb.collection('expenses').update(directUploadExpense.id, formData, { $autoCancel: false });
      
      toast.success('Bill document attached successfully!', { id: toastId });
      setDirectUploadExpense(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error('Direct upload failed:', err);
      toast.error(err.message || 'Failed to upload bill.', { id: toastId });
    }
  };

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => (e.description && e.description.toLowerCase().includes(q)) || (e.notes && e.notes.toLowerCase().includes(q)));
    }
    if (filters.dateFrom) result = result.filter(e => new Date(e.date) >= new Date(filters.dateFrom));
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.date) <= toDate);
    }
    if (filters.category !== 'all') {
      result = result.filter(e => e.category === filters.category);
      if (filters.category === 'Regular' && filters.subcategory !== 'all') result = result.filter(e => e.subcategory === filters.subcategory);
    }
    if (filters.truckNo !== 'all') result = result.filter(e => e.truck_id === filters.truckNo);
    if (filters.paymentMode !== 'all') result = result.filter(e => e.payment_method === filters.paymentMode);
    if (filters.creditCard !== 'all') result = result.filter(e => filters.creditCard === 'none' ? !e.credit_card_id : e.credit_card_id === filters.creditCard);
    return result;
  }, [expenses, filters]);

  const filteredAdvances = useMemo(() => {
    let result = [...advances];
    if (advFilters.search) {
      result = result.filter(a => 
        (a.employee_name || a.expand?.employee_id?.name || '').toLowerCase().includes(q) ||
        (a.reason || '').toLowerCase().includes(q)
      );
    }
    if (advFilters.dateFrom) result = result.filter(a => new Date(a.date) >= new Date(advFilters.dateFrom));
    if (advFilters.dateTo) {
      const toDate = new Date(advFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(a => new Date(a.date) <= toDate);
    }
  }, [advances, advFilters]);

  // Current active month expense summary grid calculations (strictly parsed using Number)
  const { fuelTotal, fastagTotal, driverAdvanceTotal, maintenanceTotal, miscTotal, fixedEmiTotal } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
    });

    const currentMonthAdvances = advances.filter(adv => {
      const advDate = new Date(adv.date);
      return advDate.getFullYear() === currentYear && advDate.getMonth() === currentMonth;
    });

    const fuel = currentMonthExpenses
      .filter(e => e.category === 'Regular' && e.subcategory === 'Fuel')
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    const fastag = currentMonthExpenses
      .filter(e => e.category === 'Regular' && e.subcategory === 'Toll')
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    const expAdvance = currentMonthExpenses
      .filter(e => e.category === 'Employee Advance')
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    const driverAdvance = currentMonthAdvances
      .reduce((sum, a) => Number(sum) + Number(a.amount || 0), 0) + expAdvance;

    const maintenance = currentMonthExpenses
      .filter(e => e.category === 'Regular' && e.subcategory === 'Maintenance')
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    const misc = currentMonthExpenses
      .filter(e => e.category === 'Regular' && e.subcategory !== 'Fuel' && e.subcategory !== 'Toll' && e.subcategory !== 'Maintenance')
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    return {
      fuelTotal: Number(fuel),
      fastagTotal: Number(fastag),
      driverAdvanceTotal: Number(driverAdvance),
      maintenanceTotal: Number(maintenance),
      miscTotal: Number(misc),
      fixedEmiTotal: Number(33410)
    };
  }, [expenses, advances]);

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'Cash': return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Cash</Badge>;
      case 'Card': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Card</Badge>;
      case 'Credit Card': return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">Credit Card</Badge>;
      case 'UPI': return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">UPI</Badge>;
      case 'Bank Transfer': return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Bank Transfer</Badge>;
      default: return <Badge variant="outline">{method || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <Helmet><title>Expenses & Advances | Dashboard</title></Helmet>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Expenses & Bills</h1>
            <p className="text-muted-foreground mt-1">Manage company expenses, driver advances, and attach related bills.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button onClick={handleManualRefresh} variant="outline" className="shadow-sm rounded-xl gap-2 flex-1 md:flex-none bg-background" disabled={loading || isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="shadow-sm rounded-xl flex-1 md:flex-none">
              <Plus className="w-4 h-4 mr-2" /> Add Record
            </Button>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="bg-muted/50 p-1 mb-6 flex flex-wrap h-auto rounded-xl">
            <TabsTrigger value="expenses" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
              <Receipt className="w-4 h-4" /> Expenses Ledger
            </TabsTrigger>
            <TabsTrigger value="advances" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
              <Banknote className="w-4 h-4" /> Tracked Advances
            </TabsTrigger>
            <TabsTrigger value="bills" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" /> All Uploaded Bills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4 m-0">
            {/* Real-time current month expense category summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { title: 'Fuel Expense', amount: fuelTotal, color: 'text-orange-500' },
                { title: 'FASTag Tolls', amount: fastagTotal, color: 'text-blue-500' },
                { title: 'Driver Advance', amount: driverAdvanceTotal, color: 'text-emerald-500' },
                { title: 'Maintenance', amount: maintenanceTotal, color: 'text-purple-500' },
                { title: 'Miscellaneous', amount: miscTotal, color: 'text-pink-500' },
                { title: 'Fixed EMI', amount: fixedEmiTotal, color: 'text-amber-500' }
              ].map((card, idx) => (
                <Card key={idx} className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                        {card.title}
                      </p>
                      <p className="text-lg font-extrabold text-foreground mt-2 font-heading">
                        ₹{Number(card.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        {card.title === 'Fixed EMI' ? 'Monthly Liability' : format(new Date(), 'MMMM yyyy')}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${card.color.replace('text', 'bg')} animate-pulse`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <ExpenseFilters filters={filters} setFilters={setFilters} trucks={trucks} creditCards={creditCards} onClear={() => setFilters({search: '', dateFrom: '', dateTo: '', category: 'all', subcategory: 'all', truckNo: 'all', paymentMode: 'all', creditCard: 'all', sortBy: '-date'})} />
            {error ? (
              <div className="p-8 text-center border border-border rounded-xl bg-card">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3 opacity-80" />
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={handleManualRefresh} className="gap-2"><RefreshCw className="w-4 h-4" /> Retry</Button>
              </div>
            ) : (
              <Card className="shadow-sm border-border overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[220px]">Category & Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[150px]">Payment</TableHead>
                        <TableHead className="text-right w-[150px]">Amount</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-32 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredExpenses.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground"><Receipt className="w-10 h-10 mb-3 opacity-20 mx-auto" /><p>No expenses found.</p></TableCell></TableRow>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium whitespace-nowrap text-sm">{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <div className="flex flex-col items-start gap-1">
                                <Badge variant="outline" className="font-semibold bg-background">{expense.category}</Badge>
                                {expense.category === 'Regular' && expense.subcategory && (
                                  <Badge variant="secondary" className="font-medium bg-secondary/60 text-secondary-foreground text-[10px] uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> {expense.subcategory}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="truncate text-foreground text-sm font-medium" title={expense.description}>{expense.description || '-'}</p>
                              {expense.notes && <p className="truncate text-xs text-muted-foreground mt-0.5" title={expense.notes}>{expense.notes}</p>}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="flex flex-col gap-1">
                                {getPaymentMethodBadge(expense.payment_method)}
                                {expense.cardContext && <span className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> {expense.cardContext.card_number_last4}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums text-foreground">₹{expense.amount?.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-1.5">
                                {expense.image_urls?.map((img, idx) => {
                                  const url = pb.files.getUrl(expense, img);
                                  return (
                                    <div 
                                      key={idx}
                                      onClick={() => setActiveLightboxImage(url)}
                                      className="w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm"
                                      title="View Receipt Snapshot"
                                    >
                                      <img src={url} alt="receipt" className="w-full h-full object-cover" />
                                    </div>
                                  );
                                })}
                                {expense.documents?.length > 0 && (
                                  <Button variant="ghost" size="icon" onClick={() => window.open(pb.files.getUrl(expense, expense.documents[0]), '_blank')} className="h-8 w-8 text-primary" title="View attached document"><ExternalLink className="w-4 h-4" /></Button>
                                )}
                                {(!expense.image_urls || expense.image_urls.length === 0) && (!expense.documents || expense.documents.length === 0) && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => triggerDirectFileUpload(expense)} 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" 
                                    title="Upload Bill/Receipt"
                                  >
                                    <UploadCloud className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(expense); setIsExpenseModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advances" className="m-0 space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="p-4 border-b border-border bg-muted/20">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" /> Advance Records
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 h-10 w-full md:w-auto">
                      <CalendarRange className="w-4 h-4 text-muted-foreground" />
                      <Input type="date" className="h-7 w-[125px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm" value={advFilters.dateFrom} onChange={e => setAdvFilters(p => ({...p, dateFrom: e.target.value}))} />
                      <span className="text-muted-foreground">-</span>
                      <Input type="date" className="h-7 w-[125px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm" value={advFilters.dateTo} onChange={e => setAdvFilters(p => ({...p, dateTo: e.target.value}))} />
                    </div>
                    <Input placeholder="Search driver/reason..." value={advFilters.search} onChange={e => setAdvFilters(p => ({...p, search: e.target.value}))} className="w-full md:w-64 bg-background h-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Driver / Employee Name</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Advance Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                      ) : filteredAdvances.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No advance records found.</TableCell></TableRow>
                      ) : (
                        filteredAdvances.map(adv => (
                          <TableRow key={adv.id} className="hover:bg-muted/30">
                            <TableCell className="text-sm whitespace-nowrap">{format(new Date(adv.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="font-medium text-foreground">{adv.employee_name || adv.expand?.employee_id?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{adv.reason || '-'}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`font-medium ${adv.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}`}>
                                {adv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground tabular-nums">₹{adv.amount?.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 items-center">
                                {adv.status === 'Pending' && (
                                  <Button size="sm" variant="secondary" className="mr-2 h-8 text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground" onClick={() => handleMarkAdvanceSettled(adv.id)} disabled={processingAdvanceId === adv.id}>
                                    {processingAdvanceId === adv.id ? 'Processing...' : 'Mark Settled'}
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAdvance(adv.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="m-0">
            <BillsList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </main>

      <input 
        type="file" 
        ref={directFileInputRef} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        onChange={handleDirectFileChange} 
      />

      {isExpenseModalOpen && (
        <ExpenseModal 
          isOpen={isExpenseModalOpen} 
          onClose={() => setIsExpenseModalOpen(false)} 
          onSuccess={() => setRefreshTrigger(p => p + 1)}
          expense={editingExpense}
          trucks={trucks}
        />
      )}

      {activeLightboxImage && (
        <Dialog open={!!activeLightboxImage} onOpenChange={() => setActiveLightboxImage(null)}>
          <DialogContent className="max-w-3xl border-none bg-black/90 p-0 overflow-hidden flex items-center justify-center rounded-2xl">
            <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
              <img src={activeLightboxImage} alt="high-res" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setActiveLightboxImage(null)} 
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 text-sm w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExpensesPage;