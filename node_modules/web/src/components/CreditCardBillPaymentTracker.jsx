import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, Trash2, Edit2, AlertCircle, Receipt, ArrowDownLeft, ArrowUpRight, ArrowUpDown, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import CardModal from './CardModal.jsx';
import PaymentRecordModal from './PaymentRecordModal.jsx';
import WaiverLimitConfiguration from './WaiverLimitConfiguration.jsx';

// Surcharge Imports
import SurchargeCalculator from './SurchargeCalculator.jsx';
import SurchargeDashboard from './SurchargeDashboard.jsx';
import SurchargeAnalytics from './SurchargeAnalytics.jsx';
import SurchargeManagement from './SurchargeManagement.jsx';
import PlannedPaymentsList from './PlannedPaymentsList.jsx';
import { useChargeSurcharge } from '@/hooks/useChargeSurcharge.js';

const CreditCardBillPaymentTracker = ({ refreshTrigger, onRefresh }) => {
  const { currentUser } = useAuth();
  
  // Cards State
  const [cards, setCards] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState(null);

  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [waiverCard, setWaiverCard] = useState(null);

  // Statement State
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [txFilters, setTxFilters] = useState({
    type: 'All', dateFrom: '', dateTo: '', minAmount: '', maxAmount: ''
  });
  const [txSort, setTxSort] = useState({ key: 'date', dir: 'desc' });

  // Surcharge Data
  const { data: surchargeData, loading: surchargeLoading, refetch: refetchSurcharge } = useChargeSurcharge(refreshTrigger);

  const fetchTrackerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const cardsData = await pb.collection('credit_cards').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      const expensesData = await pb.collection('expenses').getFullList({
        filter: `credit_card_id != "" && credit_card_id != null`,
        sort: '-date',
        $autoCancel: false
      });

      const paymentsData = await pb.collection('payment_records').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: '-payment_date',
        $autoCancel: false
      });

      setCards(cardsData);
      setExpenses(expensesData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching tracker data:', err);
      setError('Failed to load credit card data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
    
    pb.collection('expenses').subscribe('*', () => fetchTrackerData());
    pb.collection('payment_records').subscribe('*', () => fetchTrackerData());
    pb.collection('fuel_payments').subscribe('*', () => refetchSurcharge());
    pb.collection('credit_cards').subscribe('*', () => fetchTrackerData());

    return () => {
      pb.collection('expenses').unsubscribe('*');
      pb.collection('payment_records').unsubscribe('*');
      pb.collection('fuel_payments').unsubscribe('*');
      pb.collection('credit_cards').unsubscribe('*');
    };
  }, [refreshTrigger, currentUser.id]);

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card? Links to existing expenses will be removed.')) return;
    try {
      await pb.collection('credit_cards').delete(id, { $autoCancel: false });
      toast.success('Card deleted successfully');
      if (selectedCardId === id) setSelectedCardId(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete card', err);
      toast.error('Failed to delete card');
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleRecordPayment = (card) => {
    setPaymentCard(card);
    setIsPaymentModalOpen(true);
  };

  const handleConfigureWaiver = (card) => {
    setWaiverCard(card);
    setIsWaiverModalOpen(true);
  };

  const processedCards = cards.map(card => {
    const cardExpenses = expenses.filter(e => e.credit_card_id === card.id);
    const cardPayments = payments.filter(p => p.card_id === card.id);
    
    const totalSpent = cardExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPaid = cardPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
    
    const calculatedBalance = Math.max(0, totalSpent - totalPaid);
    const availableCredit = Math.max(0, (card.credit_limit || 0) - calculatedBalance);
    const utilization = card.credit_limit > 0 ? (calculatedBalance / card.credit_limit) * 100 : 0;

    return { ...card, calculatedBalance, availableCredit, utilization };
  });

  const overallTotalLimit = processedCards.reduce((sum, c) => sum + (c.credit_limit || 0), 0);
  const overallTotalBalance = processedCards.reduce((sum, c) => sum + c.calculatedBalance, 0);
  const overallAvailable = processedCards.reduce((sum, c) => sum + c.availableCredit, 0);

  const selectedCard = processedCards.find(c => c.id === selectedCardId);
  let allTx = [];
  let totalExps = 0;
  let totalPmts = 0;
  
  if (selectedCard) {
    const exps = expenses.filter(e => e.credit_card_id === selectedCard.id).map(e => ({
       id: e.id, date: e.date, type: 'Expense', amount: e.amount, category: e.category, description: e.description || e.notes || 'No description', raw: e
    }));
    const pmts = payments.filter(p => p.card_id === selectedCard.id).map(p => ({
       id: p.id, date: p.payment_date, type: 'Payment', amount: p.amount_paid, category: 'Payment', description: p.reference_number || 'Credit Card Payment', raw: p
    }));
    
    allTx = [...exps, ...pmts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let bal = 0;
    allTx = allTx.map(tx => {
       if (tx.type === 'Expense') { bal += tx.amount; totalExps += tx.amount; }
       else { bal -= tx.amount; totalPmts += tx.amount; }
       return { ...tx, runningBalance: bal };
    });
  }

  const handleSort = (key) => setTxSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  const SortIcon = ({ column }) => txSort.key !== column ? <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline-block" /> : txSort.dir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary inline-block" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary inline-block" />;

  const filteredTx = [...allTx].filter(tx => {
    if (txFilters.type !== 'All' && tx.type !== txFilters.type) return false;
    if (txFilters.dateFrom && new Date(tx.date) < new Date(txFilters.dateFrom)) return false;
    if (txFilters.dateTo && new Date(tx.date) > new Date(txFilters.dateTo)) return false;
    if (txFilters.minAmount && tx.amount < parseFloat(txFilters.minAmount)) return false;
    if (txFilters.maxAmount && tx.amount > parseFloat(txFilters.maxAmount)) return false;
    return true;
  }).sort((a, b) => {
    let valA = a[txSort.key]; let valB = b[txSort.key];
    if (txSort.key === 'date') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
    if (valA < valB) return txSort.dir === 'asc' ? -1 : 1;
    if (valA > valB) return txSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const statementPeriod = allTx.length > 0 ? `${format(new Date(allTx[0].date), 'dd MMM yyyy')} - ${format(new Date(allTx[allTx.length-1].date), 'dd MMM yyyy')}` : 'No transactions';

  if (loading && cards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-card border border-border rounded-xl">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3 opacity-80" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchTrackerData} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Cards Overview</TabsTrigger>
          <TabsTrigger value="surcharge" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Surcharge Manager</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in duration-500">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Credit Limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{overallTotalLimit.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{overallTotalBalance.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Available Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{overallAvailable.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        {processedCards.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 border border-border rounded-xl">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No Credit Cards</h3>
            <p className="text-muted-foreground mb-4 mt-1">Add your first credit card to start tracking bills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {processedCards.map(card => (
              <Card 
                key={card.id} 
                className={`shadow-md border flex flex-col transition-all duration-200 ${selectedCardId === card.id ? 'ring-2 ring-primary border-primary bg-card/80 scale-[1.01]' : 'border-border bg-card hover:shadow-lg'}`}
              >
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        {card.card_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.bank_name} •••• {card.card_number_last4}
                      </p>
                    </div>
                    <Badge variant={card.status === 'Active' ? 'default' : 'secondary'}>{card.status}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-5 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-foreground">₹{card.calculatedBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available Credit</p>
                      <p className="text-2xl font-bold text-muted-foreground">₹{card.availableCredit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Limit Utilization</span>
                      <span className="font-medium text-foreground">{card.utilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={card.utilization} className="h-2" />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Limit: ₹{card.credit_limit?.toLocaleString('en-IN')}</p>
                      <p className="text-xs font-medium text-primary">Waiver: ₹{(card.max_waiver_per_transaction||5000).toLocaleString()}/tx</p>
                    </div>
                  </div>

                  <Button 
                    variant={selectedCardId === card.id ? "secondary" : "outline"} 
                    className="w-full mt-4 bg-background" 
                    onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    {selectedCardId === card.id ? 'Hide Statement & History' : 'View Statement & History'}
                  </Button>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t border-border/50 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-1 w-full sm:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCard(card)} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleConfigureWaiver(card)} className="text-muted-foreground hover:text-primary">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={() => handleRecordPayment(card)} className="gap-2 shadow-sm w-full sm:w-auto">
                    <IndianRupee className="w-4 h-4" /> Record Payment
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Statement Section */}
        {selectedCard && (
          <Card className="mt-8 shadow-lg border-border animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-muted/10 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                {selectedCard.card_name} - Statement & Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="statement">
                <TabsList className="mb-6 flex-wrap h-auto">
                  <TabsTrigger value="statement" className="px-6 py-2 text-sm">Comprehensive Statement</TabsTrigger>
                  <TabsTrigger value="transactions" className="px-6 py-2 text-sm">Transaction History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="statement" className="space-y-6 m-0">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">Statement Period</p>
                      <p className="text-sm font-semibold text-foreground mt-2">{statementPeriod}</p>
                    </div>
                    <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
                      <p className="text-xs text-destructive/80 mb-1 font-medium tracking-wide uppercase">Total Expenses</p>
                      <p className="text-xl font-bold text-destructive">₹{totalExps.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/10 rounded-xl">
                      <p className="text-xs text-success/80 mb-1 font-medium tracking-wide uppercase">Total Payments</p>
                      <p className="text-xl font-bold text-success">₹{totalPmts.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <p className="text-xs text-primary/80 mb-1 font-medium tracking-wide uppercase">Closing Balance</p>
                      <p className="text-xl font-bold text-primary">₹{selectedCard.calculatedBalance.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <Table>
                      <TableHeader className="bg-muted/30">
                         <TableRow>
                           <TableHead>Date</TableHead>
                           <TableHead>Description</TableHead>
                           <TableHead className="text-right">Expense (Dr)</TableHead>
                           <TableHead className="text-right">Payment (Cr)</TableHead>
                           <TableHead className="text-right">Balance</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         <TableRow className="bg-muted/10">
                           <TableCell colSpan={4} className="font-medium text-muted-foreground">Opening Balance</TableCell>
                           <TableCell className="text-right font-bold">₹0.00</TableCell>
                         </TableRow>
                         {allTx.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions recorded.</TableCell>
                           </TableRow>
                         ) : (
                           allTx.map(tx => (
                             <TableRow key={tx.id} className="hover:bg-muted/30">
                               <TableCell className="whitespace-nowrap">{format(new Date(tx.date), 'dd MMM yyyy')}</TableCell>
                               <TableCell className="font-medium">{tx.description}</TableCell>
                               <TableCell className="text-right text-destructive font-medium tabular-nums">
                                 {tx.type === 'Expense' ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                               </TableCell>
                               <TableCell className="text-right text-success font-medium tabular-nums">
                                 {tx.type === 'Payment' ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                               </TableCell>
                               <TableCell className="text-right font-bold tabular-nums">₹{tx.runningBalance.toLocaleString('en-IN')}</TableCell>
                             </TableRow>
                           ))
                         )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="m-0 space-y-4">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Transaction Type</label>
                      <Select value={txFilters.type} onValueChange={v => setTxFilters(prev => ({...prev, type: v}))}>
                        <SelectTrigger className="w-[140px] bg-background"><SelectValue placeholder="Any Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Types</SelectItem>
                          <SelectItem value="Expense">Expense</SelectItem>
                          <SelectItem value="Payment">Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                      <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3">
                        <Input type="date" value={txFilters.dateFrom} onChange={e => setTxFilters(prev => ({...prev, dateFrom: e.target.value}))} className="h-9 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={txFilters.dateTo} onChange={e => setTxFilters(prev => ({...prev, dateTo: e.target.value}))} className="h-9 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Amount Range</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" placeholder="Min ₹" value={txFilters.minAmount} onChange={e => setTxFilters(prev => ({...prev, minAmount: e.target.value}))} className="w-[110px] bg-background h-9" />
                        <Input type="number" placeholder="Max ₹" value={txFilters.maxAmount} onChange={e => setTxFilters(prev => ({...prev, maxAmount: e.target.value}))} className="w-[110px] bg-background h-9" />
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <Table>
                      <TableHeader className="bg-muted/30">
                         <TableRow>
                           <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('date')}>
                             <div className="flex items-center font-medium">Date <SortIcon column="date" /></div>
                           </TableHead>
                           <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('type')}>
                             <div className="flex items-center font-medium">Type <SortIcon column="type" /></div>
                           </TableHead>
                           <TableHead>Description</TableHead>
                           <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('amount')}>
                             <div className="flex justify-end items-center font-medium">Amount <SortIcon column="amount" /></div>
                           </TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {filteredTx.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No matching transactions found.</TableCell>
                           </TableRow>
                         ) : (
                           filteredTx.map(tx => (
                             <TableRow key={tx.id} className="hover:bg-muted/30">
                               <TableCell className="whitespace-nowrap">{format(new Date(tx.date), 'dd MMM yyyy')}</TableCell>
                               <TableCell>
                                 {tx.type === 'Expense' ? (
                                   <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 font-medium">
                                     <ArrowDownLeft className="w-3 h-3 mr-1" /> Expense
                                   </Badge>
                                 ) : (
                                   <Badge variant="outline" className="bg-success/5 text-success border-success/20 font-medium">
                                     <ArrowUpRight className="w-3 h-3 mr-1" /> Payment
                                   </Badge>
                                 )}
                               </TableCell>
                               <TableCell className="font-medium">{tx.description}</TableCell>
                               <TableCell className="text-right font-bold tabular-nums">
                                 ₹{tx.amount.toLocaleString('en-IN')}
                               </TableCell>
                             </TableRow>
                           ))
                         )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="surcharge" className="mt-0 animate-in fade-in duration-500 bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full justify-start border-b border-border/50 rounded-none bg-transparent p-0 h-auto gap-6 flex-wrap">
            <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Dashboard</TabsTrigger>
            <TabsTrigger value="calculator" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Calculator</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Analytics</TabsTrigger>
            <TabsTrigger value="management" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Transaction Log</TabsTrigger>
            <TabsTrigger value="planner" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3">Payment Planner</TabsTrigger>
          </TabsList>

          <div className="pt-6">
            <TabsContent value="dashboard" className="m-0 focus-visible:ring-0">
              <SurchargeDashboard data={surchargeData} loading={surchargeLoading} />
            </TabsContent>
            
            <TabsContent value="calculator" className="m-0 focus-visible:ring-0 max-w-4xl">
              <SurchargeCalculator />
            </TabsContent>
            
            <TabsContent value="analytics" className="m-0 focus-visible:ring-0">
              <SurchargeAnalytics data={surchargeData} loading={surchargeLoading} />
            </TabsContent>
            
            <TabsContent value="management" className="m-0 focus-visible:ring-0">
              <SurchargeManagement data={surchargeData} loading={surchargeLoading} onRefresh={refetchSurcharge} />
            </TabsContent>

            <TabsContent value="planner" className="m-0 focus-visible:ring-0">
              <PlannedPaymentsList />
            </TabsContent>
          </div>
        </Tabs>
      </TabsContent>

      <CardModal 
        isOpen={isCardModalOpen} 
        onClose={() => setIsCardModalOpen(false)} 
        card={editingCard}
        onSuccess={onRefresh}
      />

      {paymentCard && (
        <PaymentRecordModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          card={paymentCard}
          currentBalance={paymentCard.calculatedBalance}
          onSuccess={onRefresh}
        />
      )}

      {waiverCard && (
        <WaiverLimitConfiguration
          isOpen={isWaiverModalOpen}
          onClose={() => setIsWaiverModalOpen(false)}
          card={waiverCard}
          onSuccess={onRefresh}
        />
      )}
    </Tabs>
  );
};

export default CreditCardBillPaymentTracker;