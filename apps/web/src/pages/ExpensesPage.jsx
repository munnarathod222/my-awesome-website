import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Receipt, FileText, Trash2, ExternalLink, Edit2, Banknote, CalendarRange, RefreshCw, CreditCard, Tag, UploadCloud, CheckSquare, X, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { logAuditEvent } from '@/lib/auditLogger.js';
import { toast } from 'sonner';
import ExpenseFilters from '@/components/ExpenseFilters.jsx';
import ExpenseModal from '@/components/ExpenseModal.jsx';
import AdvanceEditModal from '@/components/AdvanceEditModal.jsx';
import BillsList from '@/components/BillsList.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AdvanceIntegrationService from '@/lib/AdvanceIntegrationService.js';
import apiServerClient from '@/lib/apiServerClient.js';

const ExpensesPage = () => {
  const navigate = useNavigate();
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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedAdvanceIds, setSelectedAdvanceIds] = useState(new Set());
  const [isBulkProcessingAdvances, setIsBulkProcessingAdvances] = useState(false);

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
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete the expense.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected expense(s)? This cannot be undone.`)) return;
    setIsBulkDeleting(true);
    let deleted = 0;
    let failed = 0;
    try {
      for (const id of selectedIds) {
        try {
          const cashbookEntries = await pb.collection('cashbook').getFullList({
            filter: `reference_id="${id}" && reference_type="expense"`,
            $autoCancel: false
          });
          for (const entry of cashbookEntries) {
            await pb.collection('cashbook').delete(entry.id, { $autoCancel: false });
          }
          await pb.collection('expenses').delete(id, { $autoCancel: false });
          deleted++;
        } catch {
          failed++;
        }
      }
      setSelectedIds(new Set());
      setRefreshTrigger(prev => prev + 1);
      if (failed === 0) {
        toast.success(`${deleted} expense(s) deleted successfully`);
      } else {
        toast.warning(`${deleted} deleted, ${failed} failed`);
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((expenses) => {
    setSelectedIds(prev => {
      const allSelected = expenses.every(e => prev.has(e.id));
      if (allSelected) return new Set();
      return new Set(expenses.map(e => e.id));
    });
  }, []);

  const handleMarkAdvanceSettled = async (id) => {
    setProcessingAdvanceId(id);
    try {
      await AdvanceIntegrationService.updateAdvanceStatus(id, 'Settled', 'Marked settled from Expenses ledger');
      logAuditEvent({
        action: 'STATUS_CHANGE',
        module: 'Expenses',
        recordId: id,
        details: `Marked Advance ${id} as Settled`
      });
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
      logAuditEvent({
        action: 'DELETE',
        module: 'Expenses',
        recordId: id,
        details: `Deleted Advance transaction ${id}`
      });
      toast.success('Advance deleted successfully');
      setSelectedAdvanceIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      toast.error('Failed to delete advance');
    }
  };

  const toggleSelectAdvance = useCallback((id) => {
    setSelectedAdvanceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllAdvances = useCallback((advs) => {
    setSelectedAdvanceIds(prev => {
      const allSelected = advs.every(a => prev.has(a.id));
      if (allSelected) {
        const next = new Set(prev);
        advs.forEach(a => next.delete(a.id));
        return next;
      } else {
        const next = new Set(prev);
        advs.forEach(a => next.add(a.id));
        return next;
      }
    });
  }, []);

  const handleBulkMarkAdvancesSettled = async () => {
    if (selectedAdvanceIds.size === 0) return;
    
    const pendingSelectedIds = Array.from(selectedAdvanceIds).filter(id => {
      const adv = advances.find(a => a.id === id);
      return adv && adv.status === 'Pending';
    });

    if (pendingSelectedIds.length === 0) {
      toast.info('No pending advances selected.');
      return;
    }

    if (!window.confirm(`Mark ${pendingSelectedIds.length} selected pending advance(s) as Settled?`)) return;
    
    setIsBulkProcessingAdvances(true);
    let succeeded = 0;
    let failed = 0;
    
    try {
      for (const id of pendingSelectedIds) {
        try {
          await AdvanceIntegrationService.updateAdvanceStatus(id, 'Settled', 'Marked settled in bulk from Expenses ledger');
          succeeded++;
        } catch (err) {
          console.error(`Failed to settle advance ${id}:`, err);
          failed++;
        }
      }
      setSelectedAdvanceIds(new Set());
      setRefreshTrigger(prev => prev + 1);
      
      if (failed === 0) {
        toast.success(`Successfully marked ${succeeded} advance(s) as Settled`);
      } else {
        toast.warning(`Marked ${succeeded} settled, ${failed} failed`);
      }
    } finally {
      setIsBulkProcessingAdvances(false);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !directUploadExpense) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }
    }

    const toastId = toast.loading('Uploading documents...');
    try {
      const formData = new FormData();
      files.forEach(file => {
        const fileExt = (file?.name || '').split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          formData.append('image_urls', file);
        } else {
          formData.append('documents', file);
        }
      });
      
      await pb.collection('expenses').update(directUploadExpense.id, formData, { $autoCancel: false });
      
      toast.success('Files attached successfully!', { id: toastId });
      setDirectUploadExpense(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error('Direct upload failed:', err);
      toast.error(err.message || 'Failed to upload files.', { id: toastId });
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
      result = result.filter(e => {
        const cat = (e.category || '').toLowerCase();
        const sub = (e.subcategory || '').toLowerCase();

        if (filters.category === 'Fuel') {
          return sub === 'fuel' || cat === 'fuel' || /fuel/i.test(sub) || /fuel/i.test(cat);
        }
        if (filters.category === 'FASTag - Toll' || filters.category === 'Toll') {
          return sub === 'toll' || sub === 'fastag' || sub === 'fastag - toll' || cat === 'toll' || /toll|fastag/i.test(sub) || /toll|fastag/i.test(cat);
        }
        if (filters.category === 'Driver Advance') {
          return cat === 'employee advance' || sub === 'driver advance' || sub === 'employee advance' || (cat === 'employee' && sub === 'employee advance');
        }
        if (filters.category === 'Salary') {
          return cat === 'salary' || sub === 'salary' || /salary/i.test(cat) || /salary/i.test(sub);
        }
        if (filters.category === 'Maintenance') {
          return sub === 'maintenance' || cat === 'maintenance' || /maintenance/i.test(sub) || /maintenance/i.test(cat);
        }
        if (filters.category === 'Miscellaneous') {
          return sub === 'miscellaneous' || cat === 'miscellaneous' || /misc/i.test(sub) || /misc/i.test(cat);
        }
        if (filters.category === 'EMI') {
          return cat === 'emi' || sub === 'emi' || /emi/i.test(cat) || /emi/i.test(sub);
        }
        if (filters.category === 'All Other Expenses' || filters.category === 'Other') {
          if (sub === 'fuel' || cat === 'fuel' || /fuel/.test(sub)) return false;
          if (sub === 'toll' || sub === 'fastag' || cat === 'toll' || /toll|fastag/.test(sub)) return false;
          if (cat === 'employee advance' || sub === 'driver advance' || sub === 'employee advance' || (cat === 'employee' && sub === 'employee advance')) return false;
          if (cat === 'salary' || sub === 'salary' || /salary/.test(sub)) return false;
          if (sub === 'maintenance' || cat === 'maintenance' || /maintenance/.test(sub)) return false;
          if (sub === 'miscellaneous' || cat === 'miscellaneous' || /misc/.test(sub)) return false;
          if (cat === 'emi' || sub === 'emi' || /emi/.test(sub)) return false;
          return true;
        }
        return e.category === filters.category;
      });
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
      const q = advFilters.search.toLowerCase();
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
    return result;
  }, [advances, advFilters]);

  // Current active month expense summary grid calculations for all 8 categories
  const { fuelTotal, fastagTotal, driverAdvanceTotal, salaryTotal, maintenanceTotal, miscTotal, fixedEmiTotal, allOtherTotal } = useMemo(() => {
    const now = new Date();
    // Use UTC year/month to match PocketBase date storage (dates are in UTC)
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    const currentMonthExpenses = expenses.filter(exp => {
      if (!exp.date) return false;
      const expDate = new Date(exp.date);
      return expDate.getUTCFullYear() === currentYear && expDate.getUTCMonth() === currentMonth;
    });

    const currentMonthAdvances = advances.filter(adv => {
      if (!adv.date) return false;
      const advDate = new Date(adv.date);
      return advDate.getUTCFullYear() === currentYear && advDate.getUTCMonth() === currentMonth;
    });

    // 1. Fuel
    const fuel = currentMonthExpenses
      .filter(e => e.subcategory === 'Fuel' || e.category === 'Fuel' || /fuel/i.test(e.subcategory || '') || /fuel/i.test(e.category || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    // 2. FASTag - Toll
    const fastag = currentMonthExpenses
      .filter(e => e.subcategory === 'Toll' || e.subcategory === 'FASTag' || e.subcategory === 'FASTag - Toll' || e.category === 'Toll' || /toll|fastag/i.test(e.subcategory || '') || /toll|fastag/i.test(e.category || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    // 3. Driver Advance
    const unlinkedExpAdvance = currentMonthExpenses
      .filter(e => e.category === 'Employee Advance' || e.subcategory === 'Driver Advance' || e.subcategory === 'Employee Advance' || (e.category === 'Employee' && e.subcategory === 'Employee Advance'))
      .filter(e => !currentMonthAdvances.some(a => a.expense_id === e.id || e.advance_id === a.id))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    const driverAdvance = currentMonthAdvances
      .reduce((sum, a) => Number(sum) + Number(a.amount || 0), 0) + unlinkedExpAdvance;

    // 4. Salary
    const salary = currentMonthExpenses
      .filter(e => e.category === 'Salary' || e.subcategory === 'Salary' || /salary/i.test(e.category || '') || /salary/i.test(e.subcategory || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    // 5. Maintenance
    const maintenance = currentMonthExpenses
      .filter(e => e.subcategory === 'Maintenance' || e.category === 'Maintenance' || /maintenance/i.test(e.subcategory || '') || /maintenance/i.test(e.category || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    // 6. Miscellaneous
    const misc = currentMonthExpenses
      .filter(e => e.subcategory === 'Miscellaneous' || e.category === 'Miscellaneous' || /misc/i.test(e.subcategory || '') || /misc/i.test(e.category || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    // 7. EMI
    const emiRecorded = currentMonthExpenses
      .filter(e => e.category === 'EMI' || e.subcategory === 'EMI' || /emi/i.test(e.category || '') || /emi/i.test(e.subcategory || ''))
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);
    const emi = emiRecorded > 0 ? emiRecorded : 33410;

    // 8. All Other Expenses
    const allOther = currentMonthExpenses
      .filter(e => {
        const cat = (e.category || '').toLowerCase();
        const sub = (e.subcategory || '').toLowerCase();
        if (sub === 'fuel' || cat === 'fuel' || /fuel/.test(sub)) return false;
        if (sub === 'toll' || sub === 'fastag' || cat === 'toll' || /toll|fastag/.test(sub)) return false;
        if (cat === 'employee advance' || sub === 'driver advance' || sub === 'employee advance' || (cat === 'employee' && sub === 'employee advance')) return false;
        if (cat === 'salary' || sub === 'salary' || /salary/.test(sub)) return false;
        if (sub === 'maintenance' || cat === 'maintenance' || /maintenance/.test(sub)) return false;
        if (sub === 'miscellaneous' || cat === 'miscellaneous' || /misc/.test(sub)) return false;
        if (cat === 'emi' || sub === 'emi' || /emi/.test(sub)) return false;
        return true;
      })
      .reduce((sum, e) => Number(sum) + Number(e.amount || 0), 0);

    return {
      fuelTotal: Number(fuel),
      fastagTotal: Number(fastag),
      driverAdvanceTotal: Number(driverAdvance),
      salaryTotal: Number(salary),
      maintenanceTotal: Number(maintenance),
      miscTotal: Number(misc),
      fixedEmiTotal: Number(emi),
      allOtherTotal: Number(allOther)
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
            <Button onClick={() => navigate('/bulk-upload?tab=expenses')} variant="outline" className="shadow-sm rounded-xl gap-2 flex-1 md:flex-none bg-background">
              <UploadCloud className="w-4 h-4" /> Bulk Import
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
            {/* Real-time current month expense category summary grid (8 Categories) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { title: 'Fuel Expense', amount: fuelTotal, color: 'text-orange-500' },
                { title: 'FASTag - Toll', amount: fastagTotal, color: 'text-blue-500' },
                { title: 'Driver Advance', amount: driverAdvanceTotal, color: 'text-emerald-500' },
                { title: 'Salary', amount: salaryTotal, color: 'text-teal-500' },
                { title: 'Maintenance', amount: maintenanceTotal, color: 'text-purple-500' },
                { title: 'Miscellaneous', amount: miscTotal, color: 'text-pink-500' },
                { title: 'EMI', amount: fixedEmiTotal, color: 'text-amber-500' },
                { title: 'All Other Expenses', amount: allOtherTotal, color: 'text-indigo-500' }
              ].map((card, idx) => (
                <Card key={idx} className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono truncate" title={card.title}>
                        {card.title}
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-foreground mt-1.5 font-heading tracking-tight">
                        <span className="text-sm font-bold text-muted-foreground mr-0.5">₹</span>
                        {Number(card.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-semibold">
                        {card.title === 'EMI' ? 'Monthly' : format(new Date(), 'MMM yyyy')}
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
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[44px]">
                          <Checkbox
                            id="select-all-expenses"
                            checked={filteredExpenses.length > 0 && filteredExpenses.every(e => selectedIds.has(e.id))}
                            onCheckedChange={() => toggleSelectAll(filteredExpenses)}
                            aria-label="Select all expenses"
                          />
                        </TableHead>
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
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-32 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredExpenses.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-48 text-center text-muted-foreground"><Receipt className="w-10 h-10 mb-3 opacity-20 mx-auto" /><p>No expenses found.</p></TableCell></TableRow>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <TableRow
                            key={expense.id}
                            className={`hover:bg-muted/30 transition-colors ${selectedIds.has(expense.id) ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                          >
                            <TableCell>
                              <Checkbox
                                id={`select-expense-${expense.id}`}
                                checked={selectedIds.has(expense.id)}
                                onCheckedChange={() => toggleSelect(expense.id)}
                                aria-label={`Select expense ${expense.id}`}
                              />
                            </TableCell>
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

                {/* Mobile Card List View (Hidden on desktop) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))
                  ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      <Receipt className="w-10 h-10 mb-3 opacity-20 mx-auto" />
                      <p>No expenses found.</p>
                    </div>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <div 
                        key={expense.id} 
                        className={cn(
                          "p-4 space-y-3 hover:bg-muted/5 transition-colors", 
                          selectedIds.has(expense.id) ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        )}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`select-expense-mobile-${expense.id}`}
                              checked={selectedIds.has(expense.id)}
                              onCheckedChange={() => toggleSelect(expense.id)}
                              aria-label={`Select expense ${expense.id}`}
                            />
                            <div>
                              <p className="font-semibold text-foreground text-sm">{expense.description || 'No Description'}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-foreground">₹{expense.amount?.toLocaleString()}</p>
                            <div className="flex flex-wrap justify-end gap-1 mt-1">
                              {expense.image_urls?.map((img, idx) => {
                                const url = pb.files.getUrl(expense, img);
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setActiveLightboxImage(url)}
                                    className="w-6 h-6 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm"
                                    title="View Receipt Snapshot"
                                  >
                                    <img src={url} alt="receipt" className="w-full h-full object-cover" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className="font-semibold bg-background">{expense.category}</Badge>
                          {expense.category === 'Regular' && expense.subcategory && (
                            <Badge variant="secondary" className="font-medium bg-secondary/60 text-secondary-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {expense.subcategory}
                            </Badge>
                          )}
                          {getPaymentMethodBadge(expense.payment_method)}
                          {expense.cardContext && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-md border border-border/30">
                              <CreditCard className="w-2.5 h-2.5" /> {expense.cardContext.card_number_last4}
                            </span>
                          )}
                        </div>

                        {expense.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/20">
                            {expense.notes}
                          </p>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-border/20">
                          <div>
                            {expense.documents?.length > 0 && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(pb.files.getUrl(expense, expense.documents[0]), '_blank')} className="h-7 text-xs text-primary" title="View attached document">
                                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Bill
                              </Button>
                            )}
                            {(!expense.image_urls || expense.image_urls.length === 0) && (!expense.documents || expense.documents.length === 0) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => triggerDirectFileUpload(expense)} 
                                className="h-7 text-xs text-muted-foreground hover:text-primary" 
                                title="Upload Bill/Receipt"
                              >
                                <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload Bill
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingExpense(expense); setIsExpenseModalOpen(true); }} className="h-7 text-xs font-semibold rounded-lg">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)} className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold rounded-lg">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="w-[44px]">
                          <Checkbox
                            id="select-all-advances"
                            checked={filteredAdvances.length > 0 && filteredAdvances.every(a => selectedAdvanceIds.has(a.id))}
                            onCheckedChange={() => toggleSelectAllAdvances(filteredAdvances)}
                            aria-label="Select all advances"
                          />
                        </TableHead>
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
                        <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                      ) : filteredAdvances.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No advance records found.</TableCell></TableRow>
                      ) : (
                        filteredAdvances.map(adv => (
                          <TableRow 
                            key={adv.id} 
                            className={`hover:bg-muted/30 transition-colors ${selectedAdvanceIds.has(adv.id) ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                          >
                            <TableCell>
                              <Checkbox
                                id={`select-advance-${adv.id}`}
                                checked={selectedAdvanceIds.has(adv.id)}
                                onCheckedChange={() => toggleSelectAdvance(adv.id)}
                                aria-label={`Select advance ${adv.id}`}
                              />
                            </TableCell>
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

                {/* Mobile Card List View (Hidden on desktop) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {loading ? (
                    <div className="p-4"><Skeleton className="h-12 w-full" /></div>
                  ) : filteredAdvances.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground">No advance records found.</div>
                  ) : (
                    filteredAdvances.map(adv => (
                      <div 
                        key={adv.id} 
                        className={cn(
                          "p-4 space-y-3 hover:bg-muted/5 transition-colors",
                          selectedAdvanceIds.has(adv.id) ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        )}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`select-advance-mobile-${adv.id}`}
                              checked={selectedAdvanceIds.has(adv.id)}
                              onCheckedChange={() => toggleSelectAdvance(adv.id)}
                              aria-label={`Select advance ${adv.id}`}
                            />
                            <div>
                              <p className="font-bold text-sm text-foreground">{adv.employee_name || adv.expand?.employee_id?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(adv.date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-foreground">₹{adv.amount?.toLocaleString()}</p>
                            <Badge variant="outline" className={`font-semibold text-[10px] mt-1 ${adv.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}`}>
                              {adv.status}
                            </Badge>
                          </div>
                        </div>

                        {adv.reason && (
                          <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/20">
                            <strong>Reason:</strong> {adv.reason}
                          </p>
                        )}

                        <div className="flex justify-end items-center gap-2 pt-2 border-t border-border/20">
                          {adv.status === 'Pending' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground" 
                              onClick={() => handleMarkAdvanceSettled(adv.id)} 
                              disabled={processingAdvanceId === adv.id}
                            >
                              {processingAdvanceId === adv.id ? 'Processing...' : 'Mark Settled'}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAdvance(adv.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="m-0">
            <BillsList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Bulk Action Bar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          selectedIds.size > 0
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-border bg-card backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary-foreground">{selectedIds.size}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size === 1 ? '1 expense selected' : `${selectedIds.size} expenses selected`}
            </span>
          </div>
          <div className="w-px h-5 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 px-4 gap-1.5 font-semibold"
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar for Advances */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          selectedAdvanceIds.size > 0
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-border bg-card backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary-foreground">{selectedAdvanceIds.size}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedAdvanceIds.size === 1 ? '1 advance selected' : `${selectedAdvanceIds.size} advances selected`}
            </span>
          </div>
          <div className="w-px h-5 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => setSelectedAdvanceIds(new Set())}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-4 gap-1.5 font-semibold bg-success hover:bg-success/90 text-success-foreground"
            onClick={handleBulkMarkAdvancesSettled}
            disabled={isBulkProcessingAdvances}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {isBulkProcessingAdvances ? 'Processing...' : 'Mark Settled'}
          </Button>
        </div>
      </div>

      <input 
        type="file" 
        ref={directFileInputRef} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        onChange={handleDirectFileChange} 
        multiple
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